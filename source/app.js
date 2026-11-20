/* =====================================================================
 * S-Tec Performance Management System (에스텍 성과 관리 시스템) v1.0.0 — 핵심 로직
 *  · 일일 실적 기록 → 일일·주간·월간·연간 성과 산출(실적 · 계획 대비 달성률 · 환산가치 · SPI 지수)
 *  · 사업장 레지스트리(에스텍베스트 151곳 + 그룹 미화 월말보고 26곳 + 직접 추가)
 *  · 저장: 이 기기(localStorage) → 로그인 시 여러 기기 동기화(통합 로그인 user_data) → 공유 서버(pm_records)
 * Program & Design by Rat Rae Choi (제작자 서명 — 하드코딩)
 * ===================================================================== */
const APP = {
  name: 'S-Tec Performance Management System',
  ko: '에스텍 성과 관리 시스템',
  code: 'stpm',
  version: 'v1.1.0',
  build: '2026-11-20',
  shareUrl: 'https://sadness500-boop.github.io/S-Tec-Performance-Management-System/',
  apkUrl: 'https://github.com/sadness500-boop/S-Tec-Performance-Management-System/releases/download/app-latest/stpm-latest.apk',
  repo: 'https://github.com/sadness500-boop/S-Tec-Performance-Management-System',
  mainUrl: 'https://sadness500-boop.github.io/S-Tec-Operations-and-Sales-Integrated-Management-System/',
  maker: 'Rat Rae Choi',
  org: '에스텍 그룹',
  branch: '에스텍베스트 동부지사'
};

/* ---------- 유틸 ---------- */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pad = n => String(n).padStart(2, '0');
const WKK = ['일', '월', '화', '수', '목', '금', '토'];
function kstNow() { const d = new Date(); return new Date(d.getTime() + (d.getTimezoneOffset() + 540) * 60000); }
function isoD(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function parseD(s) { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || ''); return m ? new Date(+m[1], m[2] - 1, +m[3]) : null; }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function fmtD(d) { if (typeof d === 'string') d = parseD(d); return d ? `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}(${WKK[d.getDay()]})` : '-'; }
function fmtDs(d) { if (typeof d === 'string') d = parseD(d); return d ? `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}` : '-'; }
const today = () => isoD(kstNow());
const nf = (n, dg = 0) => (n == null || isNaN(n)) ? '-' : Number(n).toLocaleString('ko-KR', { maximumFractionDigits: dg, minimumFractionDigits: 0 });
const won = n => (n == null || isNaN(n)) ? '-' : (Math.abs(n) >= 100000000 ? nf(n / 100000000, 2) + '억원' : Math.abs(n) >= 10000 ? nf(n / 10000, 1) + '만원' : nf(n) + '원');
const pct = n => (n == null || isNaN(n)) ? '-' : nf(n, 1) + '%';
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
function toast(msg, ms = 2600) { const t = $('#toast'); if (!t) return; t.textContent = msg; t.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('on'), ms); }
function busy(on, msg) { const b = $('#busy'); if (!b) return; b.classList.toggle('on', !!on); if (msg) $('#busyMsg').textContent = msg; }
function safeName(s) { return String(s || '').replace(/[\\/:*?"<>|\s]+/g, '_').slice(0, 50); }
function loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }
function b64ToU8(b64) { const s = atob(b64); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }
const dataUrlB64 = u => String(u).split(',')[1];
async function download(blob, name) {
  const P = window.Capacitor && window.Capacitor.Plugins;
  if (P && P.Filesystem) {
    try {
      const b64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(blob); });
      const w = await P.Filesystem.writeFile({ path: name, data: b64, directory: 'CACHE' });
      if (P.Share) await P.Share.share({ title: name, files: [w.uri], dialogTitle: '파일 저장·보내기' }); else toast('파일을 만들었습니다: ' + name);
      return;
    } catch (e) { if (e && /cancel/i.test(String(e.message || e))) return; }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
/* 사진: 긴 변 640px · JPEG 0.7로 줄여 저장(기기·서버 용량 절약) */
function shrinkPhoto(file, max = 640) {
  return new Promise((res, rej) => {
    const rd = new FileReader();
    rd.onload = () => { const im = new Image(); im.onload = () => { const r = Math.min(1, max / Math.max(im.width, im.height)); const c = document.createElement('canvas'); c.width = Math.round(im.width * r); c.height = Math.round(im.height * r); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.7)); }; im.onerror = rej; im.src = rd.result; };
    rd.onerror = rej; rd.readAsDataURL(file);
  });
}

/* =====================================================================
 * 저장소
 * ===================================================================== */
const PM_KEY = 'stec_pm_data';
const AUTO_CACHE = new Map();
let PM = { recs: {}, qc: {}, cfg: {}, val: {}, usites: [], plans: {}, adj: {}, autoDef: null, ver: 1 };
try { PM = Object.assign(PM, JSON.parse(localStorage.getItem(PM_KEY) || '{}')); } catch (e) { }
Object.keys(PM.qc || {}).forEach(k => { if (/^qc2024_/.test(k)) delete PM.qc[k]; });   // v1.0.1 — 이전 버전 예시(실제 점수) 정리
function savePM() {                                             // 로그인 시 여러 기기 동기화(auth 모듈이 감쌈)
  AUTO_CACHE.clear();
  try { localStorage.setItem(PM_KEY, JSON.stringify(PM)); }
  catch (e) { toast('이 기기 저장 공간이 부족합니다 — 오래된 사진을 지우거나 「☁ 공유 서버」에 올려 두세요', 5000); }
}
function storeBytes() { try { return (localStorage.getItem(PM_KEY) || '').length * 2; } catch (e) { return 0; } }

/* =====================================================================
 * 사업장 레지스트리
 * ===================================================================== */
function indOf(name, type) {
  const t = (type || '') + ' ' + (name || '');
  const map = [['공장', 'mfg'], ['병원', 'hosp'], ['대학', 'univ'], ['학교', 'univ'], ['아파트', 'apt'], ['영사관', 'embassy'], ['물류', 'logi'], ['빌딩', 'office'], ['관공서', 'pub'], ['호텔', 'hotel'], ['리조트', 'hotel']];
  const f = map.find(([k]) => t.includes(k)); if (f) return f[1];
  for (const [k, v] of Object.entries(INDS)) if (v.kw.some(w => t.includes(w))) return k;
  return 'office';
}
function jobsOf(work, st) {
  const w = work || '', out = [];
  if (/보안|경비/.test(w) || (st && st.sec)) out.push('sec'); if (/미화/.test(w) || (st && st.cln)) out.push('cln');
  if (/시설/.test(w)) out.push('fac'); if (/주차/.test(w)) out.push('prk'); if (/안내/.test(w)) out.push('info');
  return out.length ? [...new Set(out)] : ['sec'];
}
let SITE_LIST = [], SITE = {};
function buildSites() {
  const a = [];
  SITES.forEach(s => a.push({ key: 'b' + s.id, name: s.name, org: 'best', br: s.br, orgN: s.br + '지사', ind: indOf(s.name, s.type), jobs: jobsOf(s.work, s), total: s.total || 0, hc: { sec: s.sec || 0, cln: s.cln || 0, etc: s.etc || 0 }, addr: s.addr || '', head: [s.pos, s.mgr].filter(Boolean).join(' '), since: s.since, shift: s.shift, work: s.work }));
  GROUP_SITES.forEach((g, i) => { const o = ORGS.find(x => x.k === g[0]); a.push({ key: 'g' + i, name: g[1], org: g[0], br: '', orgN: o ? o.n : g[0], ind: g[2], jobs: ['cln'], total: g[4], hc: { cln: g[4] }, addr: '', head: g[3], work: '미화', shift: '주간' }); });
  (PM.usites || []).forEach(u => a.push(Object.assign({ jobs: ['sec'], total: 0, addr: '', head: '' }, u, { user: true })));
  // 사업장 성과 설정(산업·업종 변경) 반영
  a.forEach(s => { const c = PM.cfg[s.key]; if (c) { if (c.ind) s.ind = c.ind; if (c.jobs && c.jobs.length) s.jobs = c.jobs; if (c.area) s.area = c.area; if (c.shift) s.shift = c.shift; } });
  SITE_LIST = a; SITE = {}; a.forEach(s => SITE[s.key] = s);
}
const orgName = k => (ORGS.find(o => o.k === k) || { n: k }).n;
function siteOrgLabel(s) { return s.org === 'best' ? `에스텍베스트 ${s.br}지사` : orgName(s.org); }

/* ---------- 업무 항목: 사업장·업종·산업에 맞는 목록 · 계획량 · 환산가치 ---------- */
function tasksFor(job, ind, siteKey) { const off = siteKey && PM.cfg[siteKey] && PM.cfg[siteKey].off || {}; return (TASKS[job] || []).filter(t => (!t.i || !ind || t.i.includes(ind)) && !off[t.id]); }
function tasksAll(job, ind) { return (TASKS[job] || []).filter(t => !t.i || !ind || t.i.includes(ind)); }
const isOff = (siteKey, id) => !!(PM.cfg[siteKey] && PM.cfg[siteKey].off && PM.cfg[siteKey].off[id]);
function valOf(id) { const v = PM.val[id]; return v != null && v !== '' ? +v : (TASK[id] && TASK[id].v) || 0; }
function planOf(siteKey, id) { const c = PM.cfg[siteKey]; const p = c && c.plan && c.plan[id]; return p != null && p !== '' ? +p : (TASK[id] && TASK[id].p) || 0; }
function planMonthOf(siteKey, id) { const c = PM.cfg[siteKey]; const p = c && c.planM && c.planM[id]; return p != null && p !== '' ? +p : (TASK[id] && TASK[id].pm) || 0; }

/* =====================================================================
 * 일일 실적 기록  rec = {id, d, site, job, by, shift, q:{task:수량}, a:{task:금액}, ev:[...], note, at}
 *   한 사업장 · 한 업종 · 하루에 한 장(같은 날 다시 쓰면 그 기록을 고침)
 * ===================================================================== */
const COUNT_U = ['건', '회', '명', '대', '개층'];   // 「업무량」 합계는 건·회·명·대 단위만(㎡·kg·시간 등은 항목별로만 표시)
const recId = (site, job, d) => `${site}|${job}|${d}`;
function getRec(site, job, d) { return PM.recs[recId(site, job, d)] || null; }
function putRec(r) { r.id = recId(r.site, r.job, r.d); r.at = new Date().toISOString(); r.by = r.by || (UI.manager && UI.manager.name) || ''; PM.recs[r.id] = r; savePM(); queueShare(r.id); }
function delRec(id) { delete PM.recs[id]; savePM(); queueShare(id, true); }

/* =====================================================================
 * 자동 성과 입력(1~100%) — 기록이 없는 날은 「표준 업무량 × 성과 수준」으로 자동 산출(저장하지 않는 가상 기록)
 *  · 직접 입력·저장한 날은 그 기록이 우선 · 항목 「해당」 체크를 끈 업무는 제외
 *  · 출력 전 수량 조정(PM.adj): 기간·항목별 배율·가산 → 자동 산출분에만 적용
 * ===================================================================== */
function autoDef() { const y = kstNow().getFullYear(); return Object.assign({ on: true, lvl: 90, from: y + '-01-01' }, PM.autoDef || {}); }
function autoCfg(siteKey) { const d = autoDef(), c = (PM.cfg[siteKey] || {}).auto || {}; return { on: c.on != null ? c.on : d.on, lvl: c.lvl != null ? +c.lvl : +d.lvl, from: d.from }; }
function siteHeads(s, job) {
  const c = PM.cfg[s.key] || {}; if (c.heads && c.heads[job] != null && c.heads[job] !== '') return +c.heads[job];
  const hc = s.hc || {};
  if ((job === 'sec' || job === 'cln') && hc[job]) return hc[job];
  const others = s.jobs.filter(j => !((j === 'sec' || j === 'cln') && hc[j]));
  const pool = hc.etc || Math.max(0, (s.total || 0) - (hc.sec || 0) - (hc.cln || 0));
  return Math.max(1, Math.round((pool || 1) / Math.max(1, others.length)));
}
function shiftInfo(shift) {
  const t = String(shift || '');
  if (/격일/.test(t)) return { f: .5, h24: true }; if (/5조/.test(t)) return { f: .4, h24: true }; if (/4조/.test(t)) return { f: .5, h24: true };
  if (/3조/.test(t)) return { f: .67, h24: true }; if (/야간/.test(t)) return { f: 1, h24: true }; return { f: 1, h24: false };
}
function hashSeed(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let a = seed || 1; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function sinceIso(s) { const m = /(\d{4})\D(\d{1,2})\D(\d{1,2})/.exec(s.since || ''); return m ? `${m[1]}-${pad(m[2])}-${pad(Math.min(28, +m[3]))}` : ''; }
function adjFor(siteKey, job, id, d) { let f = 1, a = 0; ((PM.adj || {})[siteKey] || []).forEach(x => { if (x.job === job && x.t === id && d >= x.from && d <= x.to) { f *= x.f; a += x.a || 0; } }); return [f, a]; }
function autoQ(s, job, d, lvlOverride) {
  const cf = autoCfg(s.key), lvl = Math.max(1, Math.min(100, lvlOverride != null ? lvlOverride : cf.lvl)) / 100;
  const dt = parseD(d), dow = dt.getDay(), wkend = dow === 0 || dow === 6, R = rng(hashSeed(s.key + '|' + job + '|' + d));
  const heads = siteHeads(s, job), sh = shiftInfo(s.shift), ind = s.ind || 'office';
  let onDuty = heads * sh.f; if (!sh.h24 && wkend) onDuty = heads * (AUTO_WEEKEND[ind] ?? .3);
  const q = {};
  tasksFor(job, ind, s.key).forEach(t => {
    if (AUTO_MANUAL.includes(t.id) || t.k === 'amt') return;
    let v = 0;
    if (t.k === 'score') { if (dow === AUTO_W[t.id]) v = Math.round(60 + 38 * lvl + (R() - .5) * 6); }
    else if (AUTO_W[t.id] != null) { if (dow === AUTO_W[t.id] && R() < lvl) v = 1; }
    else if (AUTO_M[t.id] != null) { if (dt.getDate() === AUTO_M[t.id] && R() < lvl) v = 1; }
    else if (t.per === 'm') { const pm = planMonthOf(s.key, t.id); if (dt.getDate() === 15 && pm) v = Math.round(pm * lvl * 2) / 2; }
    else if (AUTO_F[t.id] === 'cctv') { if (heads) v = Math.round((sh.h24 ? 24 : wkend ? 0 : 10) * (.7 + .3 * lvl)); }
    else if (t.id === 'c_area' && s.area) { v = s.area * (wkend && !sh.h24 ? (AUTO_WEEKEND[ind] ?? .3) : 1) * lvl * (.95 + R() * .1); }
    else {
      const pl = planOf(s.key, t.id);
      if (pl) v = pl * lvl * (wkend && !sh.h24 && t.job !== 'sec' ? (AUTO_WEEKEND[ind] ?? .3) : 1) + (R() - .5) * .6;
      else if (AUTO_N[t.id]) v = AUTO_N[t.id] * onDuty * (AUTO_FLOW.includes(t.id) ? (AUTO_IND[ind] || 1) * (wkend ? .6 : 1) : 1) * lvl * (.88 + R() * .24);
    }
    const [f, a] = adjFor(s.key, job, t.id, d); v = v * f + a;
    if (v > 0 && v < 1 && t.k !== 'score') v = R() < v ? 1 : 0;
    v = Math.max(0, Math.round(v));
    if (v) q[t.id] = v;
  });
  return q;
}
function autoRec(s, job, d) {
  const key = s.key + '|' + job + '|' + d; let r = AUTO_CACHE.get(key);
  if (!r) { r = { id: key, d, site: s.key, job, q: autoQ(s, job, d), a: {}, ev: [], note: '', auto: true }; AUTO_CACHE.set(key, r); }
  return r;
}
function autoRecsIn(r, F) {
  const out = [], td = today(), def = autoDef();
  const list = F.site ? [SITE[F.site]].filter(Boolean) : SITE_LIST.filter(s => siteOk(s, F));
  list.forEach(s => {
    const cf = autoCfg(s.key); if (!cf.on || !siteOk(s, F)) return;
    let from = r.from > def.from ? r.from : def.from; const since = sinceIso(s); if (since && since > from) from = since;
    const to = r.to < td ? r.to : td; if (from > to) return;
    s.jobs.forEach(j => {
      if (F.job && j !== F.job) return;
      for (let d = parseD(from); isoD(d) <= to; d = addDays(d, 1)) { const ds = isoD(d); if (!PM.recs[recId(s.key, j, ds)]) out.push(autoRec(s, j, ds)); }
    });
  });
  return out;
}

/* =====================================================================
 * 기간
 * ===================================================================== */
const PERIODS = { d: '일일', w: '주간', m: '월간', y: '연간' };
function periodRange(kind, ref) {
  const d = parseD(ref) || kstNow();
  if (kind === 'd') return { from: isoD(d), to: isoD(d), label: `${fmtD(d)} 일일성과` };
  if (kind === 'w') { const dow = (d.getDay() + 6) % 7, s = addDays(d, -dow), e = addDays(s, 6); return { from: isoD(s), to: isoD(e), label: `${fmtDs(s)} ~ ${fmtDs(e)} 주간성과 (${d.getMonth() + 1}월 ${weekOfMonth(s)}주차)` }; }
  if (kind === 'm') { const s = new Date(d.getFullYear(), d.getMonth(), 1), e = new Date(d.getFullYear(), d.getMonth() + 1, 0); return { from: isoD(s), to: isoD(e), label: `${d.getFullYear()}년 ${d.getMonth() + 1}월 월간성과` }; }
  const s = new Date(d.getFullYear(), 0, 1), e = new Date(d.getFullYear(), 11, 31); return { from: isoD(s), to: isoD(e), label: `${d.getFullYear()}년 연간성과` };
}
function weekOfMonth(d) { const f = new Date(d.getFullYear(), d.getMonth(), 1); return Math.floor(((f.getDay() + 6) % 7 + d.getDate() - 1) / 7) + 1; }
function prevRange(kind, ref) {
  const d = parseD(ref) || kstNow();
  if (kind === 'd') return periodRange('d', isoD(addDays(d, -1)));
  if (kind === 'w') return periodRange('w', isoD(addDays(d, -7)));
  if (kind === 'm') return periodRange('m', isoD(new Date(d.getFullYear(), d.getMonth() - 1, 1)));
  return periodRange('y', isoD(new Date(d.getFullYear() - 1, 0, 1)));
}
function daysIn(r) { return Math.round((parseD(r.to) - parseD(r.from)) / 86400000) + 1; }

/* =====================================================================
 * 집계 엔진
 *  F = {org, br, ind, job, site} 필터
 *  결과: tasks[id] = {plan, act, amt, val, n(기록 수)} · cats · days(일자별) · sites(사업장별) · ev(사건·활동)
 * ===================================================================== */
function siteOk(s, F) {
  if (!s) return false;
  if (F.site && s.key !== F.site) return false;
  if (F.org && s.org !== F.org) return false;
  if (F.br && s.br !== F.br) return false;
  if (F.ind && s.ind !== F.ind) return false;
  const allow = window.APP_ACCESS && APP_ACCESS.branches && APP_ACCESS.branches.length ? APP_ACCESS.branches : null;
  if (allow && s.org === 'best' && !allow.includes(s.br)) return false;
  return true;
}
function recsIn(r, F) {
  const man = Object.values(PM.recs).filter(x => x.d >= r.from && x.d <= r.to && (!F.job || x.job === F.job) && siteOk(SITE[x.site], F));
  return man.concat(autoRecsIn(r, F));
}
function aggregate(r, F = {}) {
  const rs = recsIn(r, F);
  const A = { range: r, recs: rs, tasks: {}, cats: {}, days: {}, sites: {}, jobs: {}, ev: [], value: 0, amount: 0, act: 0, plan: 0, planAct: 0, recDays: new Set(), siteN: new Set(), score: [] };
  Object.keys(CATS).forEach(c => A.cats[c] = { act: 0, val: 0, n: 0 });
  rs.forEach(x => {
    const s = SITE[x.site]; A.siteN.add(x.site); A.recDays.add(x.d);
    const day = A.days[x.d] = A.days[x.d] || { act: 0, val: 0, prev: 0, n: 0 };
    const st = A.sites[x.site] = A.sites[x.site] || { key: x.site, act: 0, val: 0, plan: 0, planAct: 0, prev: 0, ev: 0, n: 0, days: new Set(), jobs: new Set(), score: [] };
    const jb = A.jobs[x.job] = A.jobs[x.job] || { act: 0, val: 0, n: 0 };
    st.days.add(x.d); st.jobs.add(x.job); st.n++; day.n++; jb.n++;
    tasksFor(x.job, s && s.ind, x.site).forEach(t => {
      const q = +((x.q || {})[t.id] || 0), am = +((x.a || {})[t.id] || 0), pl = t.per === 'm' ? 0 : planOf(x.site, t.id);
      const T = A.tasks[t.id] = A.tasks[t.id] || { id: t.id, plan: 0, act: 0, amt: 0, val: 0, n: 0, sum: 0 };
      if (t.k === 'score' || t.k === 'avg') { if (q) { T.sum += q; T.n++; if (t.k === 'score') { A.score.push(q); st.score.push(q); } } return; }
      const v = t.k === 'amt' ? 0 : q * valOf(t.id) + am;
      T.act += q; T.amt += am + (t.k === 'amt' ? q : 0); T.val += v; T.plan += pl; if (q) T.n++;
      const cq = COUNT_U.includes(t.u) ? q : 0;
      if (t.c) { A.cats[t.c].act += cq; A.cats[t.c].val += v; if (q) A.cats[t.c].n++; if (t.c === 'prev') A.prevQ = (A.prevQ || 0) + q; }
      if (t.k !== 'amt') { A.act += cq; st.act += cq; day.act += cq; jb.act += cq; if (t.c === 'prev') { st.prev += q; day.prev += q; } }
      A.value += v; st.val += v; day.val += v; jb.val += v; A.amount += am;
      if (pl) { A.plan += pl; A.planAct += Math.min(q, pl); st.plan += pl; st.planAct += Math.min(q, pl); }
    });
    (x.ev || []).forEach(e => { A.ev.push(Object.assign({ d: x.d, site: x.site, job: x.job }, e)); st.ev++; });
  });
  // 월 단위 계획(교육시간 등): 기간 안의 월 수 × 월 계획
  const months = Math.max(1, Math.round(daysIn(r) / 30.4));
  Object.values(A.sites).forEach(st => st.jobs.forEach(j => tasksFor(j, SITE[st.key] && SITE[st.key].ind, st.key).filter(t => t.per === 'm').forEach(t => {
    const pm = planMonthOf(st.key, t.id); if (!pm) return; const T = A.tasks[t.id]; if (!T) return;
    const need = r.from === r.to || daysIn(r) < 28 ? 0 : pm * months; if (!need) return;
    T.plan += need; A.plan += need; A.planAct += Math.min(T.act, need); st.plan += need; st.planAct += Math.min(T.act, need);
  })));
  A.rate = A.plan ? A.planAct / A.plan * 100 : null;
  A.recDays = A.recDays.size; A.siteN = A.siteN.size;
  A.evBy = {}; Object.keys(EVT).forEach(k => A.evBy[k] = A.ev.filter(e => e.t === k));
  A.prevN = A.prevQ || 0; A.autoN = rs.filter(x => x.auto).length; A.manN = rs.length - A.autoN; A.incidents = A.evBy.inc.length;
  A.unresolved = A.evBy.inc.filter(e => !String(e.action || '').trim()).length;
  A.selfQ = A.score.length ? A.score.reduce((a, b) => a + b, 0) / A.score.length : null;
  A.qc = qcAvgIn(r, F);
  A.spi = spiOf(A);
  return A;
}
/* 품질점검(운영실태) 점수 — 기간 안 최근 점검 */
function qcAvgIn(r, F) {
  const from = r.from.slice(0, 4) + '-01-01';     // 품질점검은 연 1~2회 → 당해 연도 점검까지 반영
  const list = Object.values(PM.qc).filter(q => q.d >= from && q.d <= r.to && (!F.job || q.job === F.job) && siteOk(SITE[q.site] || q.siteObj, F)).map(q => qcScore(q).total).filter(x => x != null);
  return list.length ? list.reduce((a, b) => a + b, 0) / list.length : null;
}
/* S-Tec Performance Index — 계획 달성 35 · 품질 25 · 안전(사고 미조치 0) 20 · 개선 10 · 교육 10 */
function spiOf(A) {
  const parts = [];
  if (A.rate != null) parts.push(['rate', Math.min(100, A.rate)]);
  const q = A.qc != null && A.selfQ != null ? (A.qc + A.selfQ) / 2 : (A.qc != null ? A.qc : A.selfQ);
  if (q != null) parts.push(['quality', q]);
  if (A.recs.length) {
    const sf = A.incidents ? 100 * (A.incidents - A.unresolved) / A.incidents : 100;
    parts.push(['safety', sf]);
    const months = Math.max(1, daysIn(A.range) / 30.4), siteN = Math.max(1, A.siteN);
    const impN = A.cats.improve.act + A.evBy.imp.length + A.evBy.work.length;
    parts.push(['improve', Math.min(100, impN / (2 * months * siteN) * 100)]);
    const eduT = A.tasks; let need = 0, got = 0;
    Object.values(eduT).forEach(T => { const t = TASK[T.id]; if (t && t.c === 'edu' && T.plan) { need += T.plan; got += Math.min(T.act, T.plan); } });
    parts.push(['edu', need ? got / need * 100 : (A.cats.edu.act || A.evBy.edu.length ? 100 : 60)]);
  }
  if (!parts.length) return null;
  const w = parts.reduce((a, [k]) => a + SPI_W[k], 0);
  return { total: parts.reduce((a, [k, v]) => a + v * SPI_W[k], 0) / w, parts: Object.fromEntries(parts) };
}
/* 품질점검 점수: 구역 평균 → 가중 환산 · 점검제외 부문은 0점(2024 보고서 방식) */
function qcScore(q) {
  const items = qcItems(q.job, q.ind), sec = {};
  ['gen', 'risk', 'env', 'site'].forEach(s => {
    if ((q.excl || []).includes(s)) { sec[s] = { avg: null, w: 0, excl: true }; return; }
    const v = items.filter(i => i.s === s).map(i => q.sc && q.sc[i.k] && q.sc[i.k].s).filter(x => x != null && x !== '').map(Number);
    const avg = q.fixed && q.fixed[s] != null ? q.fixed[s] : (v.length ? v.reduce((a, b) => a + b, 0) / v.length : null);
    sec[s] = { avg, w: avg == null ? null : avg * QC_W[s] / 100 };
  });
  const has = Object.values(sec).some(x => x.avg != null);
  return { sec, total: has ? Object.values(sec).reduce((a, x) => a + (x.w || 0), 0) : null };
}

/* =====================================================================
 * 성과 문장 — 「보이지 않는 성과」를 고객사가 읽을 수 있는 문장으로
 * ===================================================================== */
function highlights(A, maxN = 6) {
  const out = [];
  const top = Object.values(A.tasks).filter(T => T.act > 0 && TASK[T.id] && TASK[T.id].k !== 'score' && TASK[T.id].k !== 'avg').sort((a, b) => b.act - a.act);
  if (A.act) out.push(`총 ${nf(A.act)}건(건·회·명·대 합계)의 업무를 수행 — ${top.slice(0, 3).map(T => `${TASK[T.id].n} ${nf(T.act)}${TASK[T.id].u}`).join(', ')}`);
  if (A.prevN) out.push(`예방·적발 활동 ${nf(A.prevN)}건 — 사고가 「일어나지 않게」 한 보이지 않는 성과${A.incidents ? '' : ', 기간 중 사건사고 0건 유지'}`);
  if (A.value) out.push(`환산가치 ${won(A.value)} — ${Object.values(A.tasks).filter(T => T.val > 0).sort((a, b) => b.val - a.val).slice(0, 3).map(T => `${TASK[T.id].n} ${won(T.val)}`).join(', ')}`);
  if (A.rate != null) out.push(`계획 대비 달성률 ${pct(A.rate)} (계획 ${nf(A.plan)} · 실적 ${nf(A.planAct)})`);
  if (A.incidents) out.push(`사건사고 예방·적발 ${A.incidents}건 대응${A.unresolved ? ` (조치 진행 ${A.unresolved}건)` : ' — 전건 조치 완료'}`);
  if (A.evBy.imp.length || A.evBy.work.length) out.push(`주요 작업 ${A.evBy.work.length}건 · 업무개선 ${A.evBy.imp.length}건 (작업 전·후 사진 기록)`);
  if (A.evBy.praise.length) out.push(`근무자 우수사례·칭찬 ${A.evBy.praise.length}건 — ${A.evBy.praise.slice(0, 2).map(e => `${e.worker || ''} ${e.title || ''}`.trim()).join(', ')}`);
  if (A.selfQ != null) out.push(`자체 품질평가 평균 ${nf(A.selfQ, 1)}점`);
  if (A.qc != null) out.push(`운영실태·품질점검 ${nf(A.qc, 1)}점 (${gradeOf(A.qc)[1]})`);
  return out.slice(0, maxN);
}

/* =====================================================================
 * 예시 자료 — 처음 쓰는 사람이 보고서 모양을 바로 볼 수 있게(지우기 가능)
 * ===================================================================== */
function rnd(seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = s * 16807 % 2147483647) / 2147483647; }
function sampleQ(t, R, ind, wd) {
  const base = {
    s_patrol: 6, s_ppl: 420, s_car: 160, s_cctv: 24, s_weigh: 38, s_light: 85, s_pc: 9, s_copier: 1, s_ac: 3, s_lock: 4, s_leak: .05, s_fire: .15, s_intrude: .02, s_export: .03, s_exerr: .12,
    s_infosec: .05, s_card: 3, s_phone: 18, s_parkviol: 2.4, s_loiter: .1, s_lost: .1, s_emerg: .03, s_facil: .3, s_violence: .05, s_visit: 22, s_tour: 2, s_req: 1.2, s_report: .1, s_imp: .07, s_edu: .1, s_drill: .02,
    c_area: 12000, c_toilet: 48, c_trash: 260, c_recycle: 90, c_ev: 8, c_stair: 12, c_outside: 2, c_mach: 180, c_wax: 25, c_carpet: 35, c_glass: 60, c_weed: 30, c_disinf: 3, c_medwaste: 6, c_slip: .4,
    c_spill: .3, c_snow: 0, c_req: 1.4, c_selfqc: 0, c_msds: .2, c_imp: .1, c_edu: .1,
    f_daily: 2, f_elec: 3, f_mech: 3, f_firechk: 1.5, f_ev: .2, f_water: 2, f_meter: 1, f_pm: .8, f_fault: .9, f_resp: 0, f_repair: .3, f_energy: 35, f_gen: .05, f_legal: .05, f_req: 1.5, f_drill: .02, f_edu: .1,
    p_in: 650, p_out: 640, p_guide: 120, p_patrol: 4, p_viol: 3, p_acc: .05, p_fee: 380000, p_season: 2, p_cs: 6, p_imp: .05, p_edu: .1,
    i_visit: 80, i_call: 45, i_meet: 6, i_vip: .3, i_parcel: 25, i_lost: .2, i_cs: .8, i_imp: .05, i_edu: .1
  }[t.id] || 0;
  if (!base) return 0;
  const wkMul = wd ? 1 : (t.c === 'routine' && /ppl|car|visit|in|out|weigh|tour|meet|call/.test(t.id) ? .25 : t.id === 's_light' ? 1.6 : .7);
  const v = base * wkMul * (0.75 + R() * 0.5);
  if (base < 1) return R() < v ? 1 : 0;
  if (t.u === '원') return Math.round(v / 1000) * 1000;
  return Math.max(0, Math.round(v));
}
function seedSample() {
  const R = rnd(20261120), end = kstNow(), startY = new Date(end.getFullYear(), 0, 1);
  const picks = [SITE['b16'], SITE['b9'], SITE['b15'], SITE['g2'], SITE['g13']].filter(Boolean);   // 한국제지 온산(보안·미화) · 애경케미칼 · 울산과학대 · 성의교정 · 계명대동산병원
  if (SITE['b16']) { PM.cfg['b16'] = Object.assign({ jobs: ['sec', 'cln', 'fac'] }, PM.cfg['b16'] || {}); }
  buildSites();
  let n = 0;
  for (let d = new Date(startY); d <= end; d = addDays(d, 1)) {
    const ds = isoD(d), wd = d.getDay() > 0 && d.getDay() < 6;
    picks.forEach(s => s.jobs.forEach(j => {
      const id = recId(s.key, j, ds); if (PM.recs[id]) return;
      const q = {}, a = {};
      tasksFor(j, s.ind).forEach(t => { const v = sampleQ(t, R, s.ind, wd); if (v) q[t.id] = v; });
      if (j === 'cln' && d.getDate() % 7 === 0) q.c_selfqc = Math.round(84 + R() * 12);
      if (j === 'sec' && q.s_exerr) a.s_exerr = Math.round(10 + R() * 90) * 1000;
      if (j === 'sec' && q.s_lost) a.s_lost = Math.round(R() * 50) * 1000;
      if (j === 'sec' && d.getDate() === 15) q.s_edu = 2;
      if (j === 'cln' && d.getDate() === 10) q.c_edu = 2;
      if (j === 'fac' && d.getDate() === 12) q.f_edu = 2;
      const ev = [];
      if (q.s_intrude || q.s_export) ev.push({ t: 'inc', title: q.s_intrude ? '외곽 펜스 무단침입 시도 적발' : '무단 반출 시도 적발', loc: q.s_intrude ? '후문 외곽' : '정문', worker: '근무자', desc: q.s_intrude ? '야간 순찰 중 외곽 펜스 넘어오려는 인원 발견, 신원 확인 후 퇴거 조치' : '반출증 미지참 자재 반출 시도 — 담당부서 확인 후 반려', action: '상황실 보고 · 담당부서 통보 · 순찰 강화', amt: q.s_export ? 350000 : 0 });
      if (q.s_emerg) ev.push({ t: 'inc', title: '응급환자 발생 — CPR·AED 초기 대응', loc: '본관 로비', worker: '보안 근무자', desc: '방문객 쓰러짐 확인, 즉시 CPR 실시 및 AED 사용, 119 신고', action: '119 인계 · 보호자 연락 · 사건사고 보고서 작성' });
      if (j === 'cln' && d.getDate() % 9 === 3) ev.push({ t: 'work', title: ['주차장 경사로 대청소', '비상계단 전층 대청소', '외곽 배수로 정비', '로비 바닥 왁스 작업'][d.getDate() % 4], loc: ['B1 주차장', '본관', '외곽', '1층 로비'][d.getDate() % 4], desc: '정기 작업 — 작업 전·후 사진 기록' });
      if (q.s_imp || q.c_imp || q.f_imp) ev.push({ t: 'imp', title: ['순찰 동선 QR 체크포인트 추가', '분리수거장 안내 표지 개선', '미끄럼 방지 매트 설치 건의·설치', '출입 대장 전산화'][d.getDate() % 4], loc: '현장', desc: '현장 자체 개선', before: '기존 방식 불편·누락 발생', after: '누락 0건 · 처리시간 단축' });
      if (d.getDate() === 20 && j === 'sec') ev.push({ t: 'praise', title: '고객사 감사 인사 — 신속한 응급 대응', worker: '김○○ 선임', desc: '고객사 총무팀에서 근무자 친절·신속 대응에 감사 메일 접수' });
      if (d.getDate() === 15) ev.push({ t: 'edu', title: JOBS[j].s + ' 직무·안전보건교육', worker: '전 근무자', desc: j === 'sec' ? '경비업법 직무교육 2시간 — 비상대응·CPR' : '산업안전보건교육 2시간 — 넘어짐 예방·MSDS' });
      PM.recs[id] = { id, d: ds, site: s.key, job: j, by: '예시', q, a, ev, note: '', at: new Date().toISOString(), sample: true };
      n++;
    }));
  }
  // 운영실태·품질점검 예시: 가상 사업장 20곳(실제 고객사 점수 아님)
  const yr = String(end.getFullYear());
  QC_SAMPLE.forEach((r, i) => {
    const id = 'qcsample_' + i; if (PM.qc[id]) return;
    const md = pad(4 + Math.floor(i / 7)) + '-' + pad(8 + (i * 3) % 20);
    PM.qc[id] = { id, d: `${yr}-${md}`, site: 'x' + i, siteObj: { key: 'x' + i, name: r[1], org: r[0], ind: r[2], br: '' }, siteName: r[1], org: r[0], job: 'cln', ind: r[2], inspector: '미화지원팀(예시)',
      fixed: { gen: r[3], risk: r[4], env: r[5], site: r[6] }, excl: r[3] == null ? ['gen'] : [], note: r[7] || '', sc: {}, sample: true, ref: '가상 예시 자료' };
  });
  savePM(); return n;
}
function clearSample() { Object.keys(PM.recs).forEach(k => { if (PM.recs[k].sample) delete PM.recs[k]; }); Object.keys(PM.qc).forEach(k => { if (PM.qc[k].sample || /^qc2024_/.test(k)) delete PM.qc[k]; }); savePM(); }

/* =====================================================================
 * 공유 서버(pm_records) — 로그인 시 현장 기록을 회사 서버에 올려 본사·지사가 함께 집계
 *  (server/supabase_stpm.sql 실행 후 동작 · 실행 전에는 이 기기 + 계정 동기화만)
 * ===================================================================== */
const SHARE = { q: new Set(), del: new Set(), t: null, ok: null, last: '' };
function sbClient() { const A = window.STPM_AUTH; return A && A.client ? A.client : null; }
function queueShare(id, del) { (del ? SHARE.del : SHARE.q).add(id); if (del) SHARE.q.delete(id); clearTimeout(SHARE.t); SHARE.t = setTimeout(flushShare, 2500); }
function rowOf(r) { const s = SITE[r.site] || {}; return { id: r.id, site_key: r.site, site_name: s.name || r.siteName || '', org: s.org || '', br: s.br || '', job: r.job, d: r.d, kind: 'rec', data: r }; }
async function flushShare() {
  const sb = sbClient(); if (!sb || SHARE.ok === false) return;
  const ids = [...SHARE.q].filter(i => PM.recs[i] && !PM.recs[i].sample), dels = [...SHARE.del]; SHARE.q.clear(); SHARE.del.clear();
  try {
    if (ids.length) { const { error } = await sb.rpc('pm_put', { p_rows: ids.map(i => rowOf(PM.recs[i])) }); if (error) throw error; }
    if (dels.length) await sb.rpc('pm_delete', { p_ids: dels });
    SHARE.ok = true; SHARE.last = new Date().toISOString(); renderShareState();
  } catch (e) { if (/pm_put|function|schema/i.test(String(e.message || e))) SHARE.ok = false; renderShareState(); }
}
async function pullShare(r) {
  const sb = sbClient(); if (!sb) { toast('로그인하면 공유 서버의 현장 기록을 함께 집계합니다'); return 0; }
  busy(true, '공유 서버에서 현장 기록을 받는 중…');
  try {
    const { data, error } = await sb.rpc('pm_list', { p_from: r.from, p_to: r.to }); if (error) throw error;
    let n = 0; (data || []).forEach(row => { const d = row.data; if (!d || !d.id) return; const cur = PM.recs[d.id]; if (!cur || (cur.at || '') < (d.at || '')) { PM.recs[d.id] = d; n++; } });
    savePM(); SHARE.ok = true; renderShareState(); return n;
  } catch (e) { SHARE.ok = false; renderShareState(); toast('공유 서버가 아직 준비되지 않았습니다 — server/supabase_stpm.sql 실행 필요', 4500); return 0; }
  finally { busy(false); }
}
async function pushAllShare() { Object.keys(PM.recs).forEach(id => { if (!PM.recs[id].sample) SHARE.q.add(id); }); SHARE.ok = null; await flushShare(); }
function renderShareState() {
  const el = $('#shareState'); if (!el) return;
  const sb = sbClient();
  el.innerHTML = !sb ? '☁ 공유 서버: 로그인 전(이 기기에 저장)' : SHARE.ok === false ? '☁ 공유 서버: 준비 전(SQL 실행 필요) · 이 기기+계정 동기화' : SHARE.ok ? `☁ 공유 서버 연결됨${SHARE.last ? ' · ' + SHARE.last.slice(11, 16) + ' 저장' : ''}` : '☁ 공유 서버: 확인 중';
}
