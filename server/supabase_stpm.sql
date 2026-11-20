-- =====================================================================
--  S-Tec Performance Management System(에스텍 성과 관리 시스템) — 통합 로그인 서버 작업
--  Designed & Developed by Rat Rae Choi
--
--  ● 어디에 실행하나요?  통합 로그인 Supabase 프로젝트(mnsuebexlzhvomxhrear) → SQL Editor → 이 파일 전체 붙여넣기 → Run
--  ● 무엇을 하나요?
--    1) 통합관리 시스템 「프로그램 등록부」(program_registry)에 성과 관리(stpm)를 10번째(맨 아래, sort 100)로 등록
--    2) 프로그램별 권한(app_access)에서 stpm 지정 가능하게 함
--    3) 공유 성과 기록 표 pm_records + 함수 pm_put · pm_list · pm_delete
--       - 현장(사용자)은 자기 기록을 올리고 고침 · 제작자·관리자는 전체를 봄
--       - 「프로그램별 권한」에서 담당 지사를 지정받은 사용자는 그 지사 기록도 봄
--  ● 기존 자료는 지우지 않습니다. 다시 실행해도 안전합니다.
-- =====================================================================
do $$
declare c record;
begin
  if to_regclass('public.program_registry') is not null then
    insert into public.program_registry (code, name, full_name, url, icon, color, sort, uses_access, version, note)
    values ('stpm', '성과 관리 시스템', 'S-Tec Performance Management System',
            'https://sadness500-boop.github.io/S-Tec-Performance-Management-System/', 'assets/apps/stpm.png', '#17552F', 100, true, '1.0.0',
            '업종·산업별 일일·주간·월간·연간 성과 계수화 · 운영실태·품질점검')
    on conflict (code) do update set name = excluded.name, url = excluded.url, icon = excluded.icon, full_name = excluded.full_name,
      color = excluded.color, sort = excluded.sort, note = excluded.note;
  end if;
  if to_regclass('public.app_access') is not null then
    for c in select conname from pg_constraint
             where conrelid = 'public.app_access'::regclass and contype = 'c'
               and pg_get_constraintdef(oid) ilike '%(app = ANY%'
    loop
      execute format('alter table public.app_access drop constraint %I', c.conname);
    end loop;
  end if;
end $$;

-- 공유 성과 기록 ---------------------------------------------------------------
create table if not exists public.pm_records (
  id         text primary key,                 -- 사업장키|업종|일자
  owner      uuid not null default auth.uid(),
  site_key   text not null,
  site_name  text not null default '',
  org        text not null default '',
  br         text not null default '',
  job        text not null,
  d          date not null,
  kind       text not null default 'rec',
  data       jsonb not null,
  updated_at timestamptz not null default now()
);
create index if not exists pm_records_d_idx on public.pm_records (d);
create index if not exists pm_records_site_idx on public.pm_records (site_key, d);
alter table public.pm_records enable row level security;
-- 표에 직접 접근하는 정책은 두지 않고 아래 함수로만 읽고 씁니다.

create or replace function public._pm_scope() returns json
language plpgsql stable security definer set search_path = public as $$
declare pr public.profiles; br text[] := '{}';
begin
  select * into pr from public.profiles where id = auth.uid();
  if not found or pr.status <> 'active' then return json_build_object('ok', false); end if;
  if pr.role in ('owner','admin') then return json_build_object('ok', true, 'all', true); end if;
  if to_regclass('public.app_access') is not null then
    execute 'select coalesce(branches, ''{}'') from public.app_access where user_id = $1 and app = ''stpm'' and perm = ''use''' into br using pr.id;
  end if;
  return json_build_object('ok', true, 'all', false, 'branches', coalesce(br, '{}'));
end $$;

create or replace function public.pm_put(p_rows jsonb) returns json
language plpgsql security definer set search_path = public as $$
declare r jsonb; n int := 0; sc json := public._pm_scope(); cur public.pm_records;
begin
  if not (sc->>'ok')::boolean then raise exception '승인된 계정만 저장할 수 있습니다'; end if;
  if jsonb_typeof(p_rows) <> 'array' then raise exception '목록 형식이 아닙니다'; end if;
  if octet_length(p_rows::text) > 8000000 then raise exception '한 번에 올리는 자료가 너무 큽니다(8MB 초과)'; end if;
  for r in select * from jsonb_array_elements(p_rows) loop
    select * into cur from public.pm_records where id = r->>'id';
    if found and cur.owner <> auth.uid() and not coalesce((sc->>'all')::boolean, false) then continue; end if;
    insert into public.pm_records (id, owner, site_key, site_name, org, br, job, d, kind, data, updated_at)
    values (r->>'id', coalesce(cur.owner, auth.uid()), r->>'site_key', coalesce(r->>'site_name',''), coalesce(r->>'org',''), coalesce(r->>'br',''),
            r->>'job', (r->>'d')::date, coalesce(r->>'kind','rec'), r->'data', now())
    on conflict (id) do update set site_name = excluded.site_name, org = excluded.org, br = excluded.br, data = excluded.data, updated_at = now();
    n := n + 1;
  end loop;
  return json_build_object('ok', true, 'count', n);
end $$;

create or replace function public.pm_list(p_from date, p_to date) returns setof public.pm_records
language plpgsql stable security definer set search_path = public as $$
declare sc json := public._pm_scope(); brs text[];
begin
  if not (sc->>'ok')::boolean then return; end if;
  if (sc->>'all')::boolean then
    return query select * from public.pm_records where d between p_from and p_to order by d limit 50000;
  end if;
  select coalesce(array_agg(x), '{}') into brs from json_array_elements_text(sc->'branches') x;
  return query select * from public.pm_records
    where d between p_from and p_to and (owner = auth.uid() or (array_length(brs,1) > 0 and org = 'best' and br = any(brs)))
    order by d limit 50000;
end $$;

create or replace function public.pm_delete(p_ids text[]) returns json
language plpgsql security definer set search_path = public as $$
declare sc json := public._pm_scope(); n int;
begin
  if not (sc->>'ok')::boolean then raise exception '승인된 계정만 지울 수 있습니다'; end if;
  delete from public.pm_records where id = any(p_ids) and (owner = auth.uid() or coalesce((sc->>'all')::boolean, false));
  get diagnostics n = row_count;
  return json_build_object('ok', true, 'count', n);
end $$;

revoke all on function public._pm_scope() from public, anon;
revoke all on function public.pm_put(jsonb) from public, anon;
revoke all on function public.pm_list(date, date) from public, anon;
revoke all on function public.pm_delete(text[]) from public, anon;
grant execute on function public.pm_put(jsonb) to authenticated;
grant execute on function public.pm_list(date, date) to authenticated;
grant execute on function public.pm_delete(text[]) to authenticated;

-- 확인: stpm 한 줄 + pm_records 0건 이상이 보이면 완료
select code, name, sort from public.program_registry where code = 'stpm';
select count(*) as pm_records from public.pm_records;
