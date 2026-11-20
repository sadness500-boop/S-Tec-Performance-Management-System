/* =====================================================================
 * S-Tec Performance Management System — 화면
 *  ① 성과 현황(일·주·월·년)  ② 일일 실적 입력  ③ 운영실태·품질점검  ④ 보고서 출력  ⑤ 사업장·기준 설정
 * Designed & Developed by Rat Rae Choi
 * ===================================================================== */
const V = { A: null, P: null, Y: null, entry: { site: '', job: '', d: today(), ev: [] }, qc: null, qcId: '' };

/* ---------- 공통: 조직·지사·산업·업종·사업장 선택 ---------- */
function orgOptions(sel) { return `<option value="">전체 조직</option>` + ORGS.map(o => `<option value="${o.k}" ${o.k === sel ? 'selected' : ''}>${esc(o.n)}</option>`).join('') + `<option value="u" ${sel === 'u' ? 'selected' : ''}>직접 추가 사업장</option>`; }
function brOptions(sel) { return `<option value="">전체 지사</option>` + BRANCHES.map(b => `<option value="${b.key}" ${b.key === sel ? 'selected' : ''}>${esc(b.name)}</option>`).join(''); }
function indOptions(sel, all = '전체 산업') { return `<option value="">${all}</option>` + Object.entries(INDS).map(([k, v]) => `<option value="${k}" ${k === sel ? 'selected' : ''}>${v.ic} ${esc(v.n)}</option>`).join(''); }
function jobOptions(sel, all = '전체 업종') { return `<option value="">${all}</option>` + Object.entries(JOBS).map(([k, v]) => `<option value="${k}" ${k === sel ? 'selected' : ''}>${v.ic} ${esc(v.n)}</option>`).join(''); }
function sitesFiltered(F) { return SITE_LIST.filter(s => (!F.org || s.org === F.org) && (!F.br || s.br === F.br) && (!F.ind || s.ind === F.ind) && (!F.job || s.jobs.includes(F.job)) && siteOk(s, {})); }
function siteBadge(s) { return s.org === 'best' ? `<span class="brb b-${s.br}">${s.br}</span>` : s.user ? '<span class="brb b-u">추가</span>' : `<span class="brb b-${s.org}">${esc(orgName(s.org).replace('에스텍', '').replace('사업본부', '').slice(0, 4))}</span>`; }
function siteOptions(F, sel, all = '전체 사업장') { return `<option value="">${all}</option>` + sitesFiltered(F).map(s => `<option value="${s.key}" ${s.key === sel ? 'selected' : ''}>${esc(s.name)} · ${esc(siteOrgLabel(s))}</option>`).join(''); }
function scopeLabel(F) {
  const p = [];
  if (F.site && SITE[F.site]) p.push(SITE[F.site].name); else { if (F.org) p.push(F.org === 'best' && F.br ? `에스텍베스트 ${F.br}지사` : orgName(F.org)); else p.push('에스텍 그룹 전체'); if (F.ind) p.push(INDS[F.ind].n); }
  if (F.job) p.push(JOBS[F.job].n);
  return p.join(' · ');
}

/* =====================================================================
 * 탭
 * ===================================================================== */
function setTab(t) {
  UI.tab = t; saveUI();
  $$('.tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === t)));
  $$('.pane').forEach(p => p.classList.toggle('on', p.id === 'p-' + t));
  ({ dash: renderDash, entry: renderEntry, qc: renderQC, report: renderReport, set: renderSet })[t]();
}
function renderAll() { buildSites(); renderHeroStats(); setTab(UI.tab || 'dash'); }
function renderHeroStats() {
  const td = today(), r = periodRange('m', td), A = aggregate(r, {});
  const todaySites = new Set(Object.values(PM.recs).filter(x => x.d === td).map(x => x.site));
  $('#stToday').textContent = nf(todaySites.size) + '곳'; $('#stToday2').textContent = `기록 ${nf(Object.values(PM.recs).filter(x => x.d === td).length)}건`;
  $('#stPrev').textContent = nf(A.prevN); $('#stVal').textContent = won(A.value); $('#stVal2').textContent = A.act ? `업무량 ${shortN(A.act)}` : '';
  const g = A.spi ? gradeOf(A.spi.total) : null;
  $('#stSpi').textContent = A.spi ? nf(A.spi.total, 1) : '-'; $('#stSpi2').textContent = g ? `${g[0]} ${g[1]}` : '기록하면 계산';
}

/* =====================================================================
 * ① 성과 현황
 * ===================================================================== */
function curF() { return Object.assign({}, UI.F || {}); }
function renderDash() {
  const F = curF(), per = UI.per || 'm', ref = UI.ref || today();
  const r = periodRange(per, ref), pr = prevRange(per, ref), yr = { from: ref.slice(0, 4) + '-01-01', to: r.to };
  const A = V.A = aggregate(r, F), P = V.P = aggregate(pr, F), Y = V.Y = aggregate(yr, F);
  const dlt = (a, b) => { if (!b) return a ? '<span class="up">▲ 신규</span>' : ''; const d = (a - b) / b * 100; return `<span class="${d >= 0 ? 'up' : 'dn'}">${d >= 0 ? '▲' : '▼'} ${nf(Math.abs(d), 1)}%</span> 전기 대비`; };
  const g = A.spi ? gradeOf(A.spi.total) : ['-', '기록 없음'];
  $('#p-dash').innerHTML = `
  <div class="filters" id="fBar">
    <label class="per">기간<div class="seg" id="fPer">${Object.entries(PERIODS).map(([k, v]) => `<button type="button" data-p="${k}" aria-pressed="${k === per}">${v}</button>`).join('')}</div></label>
    <label style="flex:0 1 170px">기준일<input type="date" id="fRef" value="${ref}"></label>
    <div class="nav"><button class="btn" id="fPrev" title="이전 기간">◀</button><button class="btn" id="fToday">오늘</button><button class="btn" id="fNext" title="다음 기간">▶</button></div>
    <label>조직<select id="fOrg">${orgOptions(F.org)}</select></label>
    ${F.org === 'best' ? `<label>지사<select id="fBr">${brOptions(F.br)}</select></label>` : ''}
    <label>산업<select id="fInd">${indOptions(F.ind)}</select></label>
    <label>업종<select id="fJob">${jobOptions(F.job)}</select></label>
    <label style="flex:1 1 220px">사업장<select id="fSite">${siteOptions(F, F.site)}</select></label>
    <button class="btn" id="fPull" title="로그인한 계정으로 공유 서버의 현장 기록을 받아 함께 집계">☁ 서버 기록 받기</button>
  </div>
  <div class="card" style="--c:#0B1F8A"><h2>📈 ${esc(r.label)} <span class="r">${esc(scopeLabel(F))} · 기록 ${nf(A.recs.length)}건 · ${nf(A.siteN)}개 사업장 · ${nf(A.recDays)}일</span></h2></div>
  <div class="kpis">
    <div class="kpi spi"><small>성과지수 SPI</small><b>${A.spi ? nf(A.spi.total, 1) : '-'}<span class="gauge">${g[0]} ${g[1]}</span></b><span>${A.spi ? Object.entries(A.spi.parts).map(([k, v]) => ({ rate: '달성', quality: '품질', safety: '안전', improve: '개선', edu: '교육' })[k] + ' ' + Math.round(v)).join(' · ') : '실적을 기록하면 계산합니다'}</span></div>
    <div class="kpi" style="--c:#0B1F8A"><small>업무 수행량</small><b>${shortN(A.act)}</b><span>${dlt(A.act, P.act)}</span></div>
    <div class="kpi" style="--c:#C0392B"><small>예방·적발 활동</small><b>${nf(A.prevN)}<small style="display:inline;font-size:13px"> 건</small></b><span>${dlt(A.prevN, P.prevN)}</span></div>
    <div class="kpi" style="--c:#1B7A34"><small>환산가치</small><b>${won(A.value)}</b><span>연 누계 ${won(Y.value)}</span></div>
    <div class="kpi" style="--c:#E8750A"><small>계획 대비 달성률</small><b>${pct(A.rate)}</b><span>${A.plan ? `계획 ${nf(A.plan)} · 실적 ${nf(A.planAct)}` : '계획량은 ⚙ 설정에서'}</span></div>
    <div class="kpi" style="--c:#7A2E8E"><small>사건사고 예방·적발</small><b>${nf(A.incidents)}<small style="display:inline;font-size:13px"> 건</small></b><span>${A.incidents ? (A.unresolved ? `조치 진행 ${A.unresolved}건` : '전건 조치 완료') : '사고 0건 유지'}</span></div>
  </div>
  <div class="two">
    <div class="card" style="--c:#2A44D4"><h2>📊 기간 추이 <span class="r">막대: 업무량 · 선: 환산가치</span></h2><div class="body"><div class="chartbox"><canvas id="cTrend"></canvas></div></div></div>
    <div class="card" style="--c:#1B7A34"><h2>🧩 성과 영역별 업무량</h2><div class="body"><div class="chartbox"><canvas id="cCat"></canvas></div></div></div>
  </div>
  <div class="two">
    <div class="card" style="--c:#1B7A34"><h2>✨ 이번 기간 「보이지 않는 성과」 <span class="r">보고서 첫 장에 그대로 들어갑니다</span></h2><div class="body">${highlights(A, 9).length ? `<ul class="hl">${highlights(A, 9).map(h => `<li>${esc(h)}</li>`).join('')}</ul>` : '<div class="empty">이 기간에 기록된 실적이 없습니다. ✍ 일일 실적 입력에서 기록하거나 ⚙ 설정 › 예시 자료로 미리 보세요.</div>'}</div></div>
    <div class="card" style="--c:#7A2E8E"><h2>🏅 사건사고·우수사례·개선 <span class="r">${A.ev.length}건</span></h2><div class="body" style="max-height:340px;overflow:auto">${evListHtml(A.ev.slice().sort((a, b) => b.d.localeCompare(a.d)).slice(0, 40), true)}</div></div>
  </div>
  <div class="card" style="--c:#0B1F8A"><h2>📋 업무 항목별 성과 <span class="r">계획 · 실적 · 달성률 · 환산가치 · 전기 · 연 누계</span></h2><div class="body">${taskTableHtml(A, P, Y)}</div></div>
  <div class="card" style="--c:#0E7C86"><h2>🏢 사업장별 성과 순위 <span class="r">SPI 순</span></h2><div class="body">${siteTableHtml(A, r)}</div></div>`;
  bindDash(); drawCharts();
}
function bindDash() {
  const set = (k, v) => { UI.F = Object.assign(curF(), { [k]: v }); if (k === 'org') { UI.F.br = ''; UI.F.site = ''; } if (['br', 'ind', 'job'].includes(k)) { const s = SITE[UI.F.site]; if (s && !sitesFiltered(UI.F).includes(s)) UI.F.site = ''; } saveUI(); renderDash(); };
  $('#fPer').onclick = e => { const b = e.target.closest('button'); if (b) { UI.per = b.dataset.p; saveUI(); renderDash(); } };
  $('#fRef').onchange = e => { UI.ref = e.target.value; saveUI(); renderDash(); };
  const step = dir => { const d = parseD(UI.ref || today()), p = UI.per || 'm'; const n = p === 'd' ? addDays(d, dir) : p === 'w' ? addDays(d, 7 * dir) : p === 'm' ? new Date(d.getFullYear(), d.getMonth() + dir, Math.min(d.getDate(), 28)) : new Date(d.getFullYear() + dir, d.getMonth(), 1); UI.ref = isoD(n); saveUI(); renderDash(); };
  $('#fPrev').onclick = () => step(-1); $('#fNext').onclick = () => step(1); $('#fToday').onclick = () => { UI.ref = today(); saveUI(); renderDash(); };
  $('#fOrg').onchange = e => set('org', e.target.value);
  if ($('#fBr')) $('#fBr').onchange = e => set('br', e.target.value);
  $('#fInd').onchange = e => set('ind', e.target.value); $('#fJob').onchange = e => set('job', e.target.value); $('#fSite').onchange = e => set('site', e.target.value);
  $('#fPull').onclick = async () => { const n = await pullShare(V.A.range); if (n != null) { toast(`공유 서버 기록 ${n}건을 받았습니다`); renderAll(); } };
  $$('#p-dash [data-evsite]').forEach(b => b.onclick = () => { UI.F = Object.assign(curF(), { site: b.dataset.evsite }); saveUI(); renderDash(); });
}
/* 기간 추이 데이터 */
function trendData(A, per) {
  const r = A.range;
  if (per === 'y') { const lb = [], act = [], val = []; for (let m = 0; m < 12; m++) { const k = r.from.slice(0, 4) + '-' + pad(m + 1); lb.push((m + 1) + '월'); let a = 0, v = 0; Object.entries(A.days).forEach(([d, x]) => { if (d.startsWith(k)) { a += x.act; v += x.val; } }); act.push(a); val.push(v); } return { lb, act, val }; }
  if (per === 'd') { const ks = Object.keys(CATS); return { lb: ks.map(k => CATS[k].n), act: ks.map(k => A.cats[k].act), val: ks.map(k => A.cats[k].val) }; }
  const lb = [], act = [], val = []; for (let d = parseD(r.from); d <= parseD(r.to); d = addDays(d, 1)) { const k = isoD(d), x = A.days[k]; lb.push(per === 'w' ? `${d.getMonth() + 1}/${d.getDate()}(${WKK[d.getDay()]})` : String(d.getDate())); act.push(x ? x.act : 0); val.push(x ? x.val : 0); } return { lb, act, val };
}
function drawCharts() {
  const A = V.A; if (!A || !$('#cTrend')) return;
  const t = trendData(A, UI.per || 'm');
  drawBar($('#cTrend'), { labels: t.lb, bars: [{ name: '업무량', data: t.act, color: '#2A44D4' }], line: { name: '환산가치(원)', data: t.val, color: '#1B7A34' } });
  const cd = Object.entries(CATS).map(([k, c]) => ({ n: c.n, v: A.cats[k].act, c: c.color })).filter(x => x.v > 0);
  drawDonut($('#cCat'), { data: cd.length ? cd : [{ n: '기록 없음', v: 1, c: '#C9CDD3' }], center: shortN(A.act), centerSub: '업무량' });
}
function rateBar(v) { return v == null ? '-' : `<div class="row" style="flex-wrap:nowrap"><div class="bar" style="flex:1"><i style="width:${Math.min(100, v)}%"></i></div><b style="font-size:12px;min-width:46px;text-align:right">${nf(v, 1)}%</b></div>`; }
function taskTableHtml(A, P, Y) {
  const used = Object.keys(A.tasks).concat(Object.keys(P.tasks), Object.keys(Y.tasks)).filter((v, i, a) => a.indexOf(v) === i && TASK[v]);
  if (!used.length) return '<div class="empty">기록된 업무 항목이 없습니다.</div>';
  let h = `<div class="tblw"><table class="t"><thead><tr><th>업종</th><th style="text-align:left">업무 항목</th><th>단위</th><th>계획</th><th>실적</th><th style="min-width:130px">달성률</th><th>환산가치</th><th>전기 실적</th><th>연 누계</th><th style="text-align:left">가치 산정 근거</th></tr></thead><tbody>`;
  Object.entries(CATS).forEach(([ck, c]) => {
    const ids = used.filter(id => TASK[id].c === ck); if (!ids.length) return;
    h += `<tr class="cat" style="--c:${c.color}"><td colspan="10">${c.ic} ${c.n} <small style="font-weight:500">— ${esc(c.d)}</small></td></tr>`;
    ids.forEach(id => {
      const t = TASK[id], T = A.tasks[id] || { act: 0, plan: 0, val: 0, amt: 0, sum: 0, n: 0 }, Tp = P.tasks[id] || { act: 0, sum: 0, n: 0 }, Ty = Y.tasks[id] || { act: 0, sum: 0, n: 0 };
      const isAvg = t.k === 'score' || t.k === 'avg';
      const act = isAvg ? (T.n ? T.sum / T.n : null) : T.act, pa = isAvg ? (Tp.n ? Tp.sum / Tp.n : null) : Tp.act, ya = isAvg ? (Ty.n ? Ty.sum / Ty.n : null) : Ty.act;
      h += `<tr><td class="c"><span class="tag" style="--c:${JOBS[t.job].color}">${JOBS[t.job].s}</span></td><td>${esc(t.n)}</td><td class="c">${t.u}</td><td class="n">${T.plan ? nf(T.plan) : '-'}</td><td class="n"><b>${isAvg ? nf(act, 1) : nf(act)}</b>${T.amt && t.k !== 'amt' ? `<br><small>${won(T.amt)}</small>` : ''}</td><td>${T.plan ? rateBar(Math.min(T.act, T.plan) / T.plan * 100) : '-'}</td><td class="n">${T.val ? won(T.val) : t.k === 'amt' ? won(T.act) : '-'}</td><td class="n">${isAvg ? nf(pa, 1) : nf(pa)}</td><td class="n">${isAvg ? nf(ya, 1) : nf(ya)}</td><td><small class="hint">${esc(t.b || (t.amt ? '적발·습득 금액 직접 입력' : ''))}</small></td></tr>`;
    });
  });
  h += `<tr class="tot"><td colspan="3">합계</td><td class="n">${nf(A.plan)}</td><td class="n">${nf(A.act)}</td><td>${rateBar(A.rate)}</td><td class="n">${won(A.value)}</td><td class="n">${nf(P.act)}</td><td class="n">${nf(Y.act)}</td><td></td></tr></tbody></table></div>`;
  return h;
}
function siteRows(A, r) {
  return Object.values(A.sites).map(st => {
    const s = SITE[st.key] || { name: st.key, org: '', ind: '' };
    const sub = aggregate(r, { site: st.key, job: (UI.F || {}).job || '' });
    return { st, s, rate: st.plan ? st.planAct / st.plan * 100 : null, spi: sub.spi ? sub.spi.total : null, sub };
  }).sort((a, b) => (b.spi || 0) - (a.spi || 0));
}
function siteTableHtml(A, r) {
  const rows = siteRows(A, r);
  if (!rows.length) return '<div class="empty">기록된 사업장이 없습니다.</div>';
  return `<div class="tblw"><table class="t"><thead><tr><th>순위</th><th style="text-align:left">사업장</th><th>조직</th><th>산업</th><th>업종</th><th>기록일</th><th>업무량</th><th>예방·적발</th><th>환산가치</th><th>사건·활동</th><th style="min-width:120px">달성률</th><th>SPI</th><th>등급</th></tr></thead><tbody>${rows.map((x, i) => {
    const g = gradeOf(x.spi); return `<tr><td class="c">${i + 1}</td><td><a href="#" data-evsite="${x.st.key}" onclick="return false"><b>${esc(x.s.name)}</b></a></td><td class="c">${esc(siteOrgLabel(x.s))}</td><td class="c">${x.s.ind ? INDS[x.s.ind].s : ''}</td><td class="c">${[...x.st.jobs].map(j => JOBS[j].s).join('·')}</td><td class="n">${x.st.days.size}</td><td class="n">${nf(x.st.act)}</td><td class="n">${nf(x.st.prev)}</td><td class="n">${won(x.st.val)}</td><td class="n">${x.st.ev}</td><td>${rateBar(x.rate)}</td><td class="n"><b>${nf(x.spi, 1)}</b></td><td class="c"><span class="gr" style="background:${g[2]}">${g[0]}</span></td></tr>`;
  }).join('')}</tbody></table></div>`;
}
function evListHtml(list, link) {
  if (!list.length) return '<div class="empty">기록이 없습니다.</div>';
  return `<div class="evlist">${list.map((e, i) => { const t = EVT[e.t] || EVT.work, s = SITE[e.site]; return `<div class="ev" style="--c:${t.color}"><div class="h"><span class="tag" style="--c:${t.color}">${t.ic} ${t.n}</span><b>${esc(e.title || '')}</b><small>${fmtD(e.d)}${s ? ' · ' + (link ? `<a href="#" data-evsite="${s.key}" onclick="return false">${esc(s.name)}</a>` : esc(s.name)) : ''}${e.loc ? ' · ' + esc(e.loc) : ''}${e.worker ? ' · ' + esc(e.worker) : ''}</small>${e._i != null ? `<button class="btn sm warn x" data-evdel="${e._i}">삭제</button>` : ''}</div>
    ${e.desc ? `<p>${esc(e.desc)}</p>` : ''}${e.action ? `<p><b>조치</b> ${esc(e.action)}</p>` : ''}${e.before || e.after ? `<p><b>개선 전</b> ${esc(e.before || '-')} → <b>개선 후</b> ${esc(e.after || '-')}</p>` : ''}${e.amt ? `<p><b>금액</b> ${won(+e.amt)}</p>` : ''}
    ${(e.ph1 || e.ph2) ? `<div class="ph">${e.ph1 ? `<figure><img src="${e.ph1}" alt="">${e.t === 'praise' ? '사진' : '작업 전'}</figure>` : ''}${e.ph2 ? `<figure><img src="${e.ph2}" alt="">작업 후</figure>` : ''}</div>` : ''}</div>`; }).join('')}</div>`;
}

/* =====================================================================
 * ② 일일 실적 입력
 * ===================================================================== */
function renderEntry() {
  const E = V.entry, F = curF();
  if (!E.site || !SITE[E.site]) { const first = (F.site && SITE[F.site]) || sitesFiltered({ org: F.org, br: F.br || (UI.manager && UI.manager.br) || '' })[0]; E.site = first ? first.key : ''; }
  const s = SITE[E.site]; if (s && !s.jobs.includes(E.job)) E.job = s.jobs[0];
  $('#p-entry').innerHTML = `<div class="entry">
    <div>
      <div class="card" style="--c:#1B7A34"><h2>🏢 사업장 · 일자</h2><div class="body">
        <label class="f">일자<input type="date" id="eD" value="${E.d}"></label>
        <div id="eCal"></div>
        <div class="row" style="margin:10px 0 6px"><select id="eOrg" style="flex:1">${orgOptions(E.org || F.org || '')}</select></div>
        <input id="eQ" placeholder="🔍 사업장명 검색" style="margin-bottom:6px">
        <ul class="sitelist" id="eSites"></ul>
        <button class="btn sm" id="eAddSite" style="margin-top:8px;width:100%;justify-content:center">＋ 목록에 없는 사업장 추가</button>
      </div></div>
    </div>
    <div id="eMain"></div>
  </div>`;
  $('#eD').onchange = e => { E.d = e.target.value || today(); renderEntryMain(); renderEntryCal(); };
  $('#eOrg').onchange = e => { E.org = e.target.value; renderEntrySites(); };
  $('#eQ').oninput = renderEntrySites;
  $('#eAddSite').onclick = () => openAddSite(k => { E.site = k; renderEntry(); });
  renderEntrySites(); renderEntryCal(); renderEntryMain();
}
function renderEntrySites() {
  const E = V.entry, q = ($('#eQ').value || '').trim().toLowerCase(), org = E.org != null ? E.org : (curF().org || '');
  const list = SITE_LIST.filter(s => (!org || (org === 'u' ? s.user : s.org === org)) && siteOk(s, {}) && (!q || (s.name + ' ' + s.addr + ' ' + s.head).toLowerCase().includes(q)));
  const done = new Set(Object.values(PM.recs).filter(x => x.d === E.d).map(x => x.site));
  $('#eSites').innerHTML = list.slice(0, 260).map(s => `<li data-k="${s.key}" class="${s.key === E.site ? 'on' : ''}">${siteBadge(s)}<span class="nm">${esc(s.name)}<small>${esc(INDS[s.ind] ? INDS[s.ind].s : '')} · ${s.jobs.map(j => JOBS[j].s).join('·')} · ${nf(s.total)}명</small></span>${done.has(s.key) ? '<span class="dot" title="이 날 기록 있음"></span>' : ''}</li>`).join('') || '<li class="empty">검색 결과가 없습니다</li>';
  $('#eSites').onclick = e => { const li = e.target.closest('li[data-k]'); if (!li) return; E.site = li.dataset.k; E.job = ''; renderEntrySites(); renderEntryCal(); renderEntryMain(); if (innerWidth < 980) $('#eMain').scrollIntoView({ behavior: 'smooth' }); };
}
function renderEntryCal() {
  const E = V.entry, d = parseD(E.d) || kstNow(), y = d.getFullYear(), m = d.getMonth(), f = new Date(y, m, 1), n = new Date(y, m + 1, 0).getDate();
  const has = new Set(Object.values(PM.recs).filter(x => x.site === E.site && x.d.startsWith(`${y}-${pad(m + 1)}`)).map(x => +x.d.slice(8)));
  let h = `<div class="cal">${WKK.map(w => `<b>${w}</b>`).join('')}`; for (let i = 0; i < f.getDay(); i++) h += '<button class="x" tabindex="-1"></button>';
  for (let i = 1; i <= n; i++) h += `<button type="button" data-day="${i}" class="${has.has(i) ? 'has' : ''} ${i === d.getDate() ? 'on' : ''}">${i}</button>`;
  $('#eCal').innerHTML = h + `</div><p class="hint">초록 날짜 = 이 사업장 기록 있음 (${has.size}일 / ${n}일)</p>`;
  $('#eCal').onclick = e => { const b = e.target.closest('[data-day]'); if (!b) return; E.d = isoD(new Date(y, m, +b.dataset.day)); $('#eD').value = E.d; renderEntrySites(); renderEntryCal(); renderEntryMain(); };
}
function renderEntryMain() {
  const E = V.entry, s = SITE[E.site], box = $('#eMain');
  if (!s) { box.innerHTML = '<div class="card"><div class="empty">왼쪽에서 사업장을 고르세요.</div></div>'; return; }
  if (!E.job || !s.jobs.includes(E.job)) E.job = s.jobs[0];
  const r = getRec(s.key, E.job, E.d) || { q: {}, a: {}, ev: [], note: '', shift: '' };
  E.cur = JSON.parse(JSON.stringify(r)); E.cur.q = E.cur.q || {}; E.cur.a = E.cur.a || {}; E.cur.ev = E.cur.ev || [];
  const tasks = tasksFor(E.job, s.ind), J = JOBS[E.job];
  let tg = '';
  Object.entries(CATS).forEach(([ck, c]) => {
    const ts = tasks.filter(t => t.c === ck); if (!ts.length) return;
    tg += `<div class="catbar" style="--c:${c.color}">${c.ic} ${c.n} <small>${esc(c.d)}</small></div><div class="tgrid">` + ts.map(t => {
      const q = E.cur.q[t.id] ?? '', pl = t.per === 'm' ? planMonthOf(s.key, t.id) : planOf(s.key, t.id), v = valOf(t.id);
      return `<div class="ti ${q ? 'has' : ''}" style="--c:${c.color}" data-t="${t.id}"><div class="tn">${esc(t.n)}<small>${pl ? (t.per === 'm' ? '월' : '일') + ' 계획 ' + nf(pl) : ''}${v ? ' · ' + nf(v) + '원/' + t.u : ''}</small></div>
        <div class="ctrl">${t.k === 'amt' || t.k === 'score' || t.k === 'avg' ? '' : '<button type="button" data-d="-1" aria-label="빼기">−</button>'}<input type="number" inputmode="decimal" min="0" step="any" value="${q}" data-q="${t.id}" aria-label="${esc(t.n)}">${t.k === 'amt' || t.k === 'score' || t.k === 'avg' ? '' : '<button type="button" data-d="1" aria-label="더하기">＋</button>'}<span class="u">${t.u}</span></div>
        ${t.amt ? `<input class="amt" type="number" min="0" step="1000" placeholder="금액(원) — 적발·습득 금액" value="${E.cur.a[t.id] ?? ''}" data-a="${t.id}">` : ''}</div>`;
    }).join('') + '</div>';
  });
  box.innerHTML = `<div class="card" style="--c:${J.color}"><h2>${siteBadge(s)} ${esc(s.name)} <span class="r">${esc(siteOrgLabel(s))} · ${INDS[s.ind] ? INDS[s.ind].ic + ' ' + INDS[s.ind].n : ''} · ${fmtD(E.d)}</span></h2><div class="body">
    <div class="jobtabs">${s.jobs.map(j => `<button type="button" data-j="${j}" style="--c:${JOBS[j].color}" aria-pressed="${j === E.job}">${JOBS[j].ic} ${JOBS[j].n}${getRec(s.key, j, E.d) ? ' ✔' : ''}</button>`).join('')}<button type="button" class="btn sm" id="eJobs" title="이 사업장의 업종 바꾸기">업종 설정</button></div>
    <div class="grid"><label class="f">근무조·근무형태<input id="eShift" value="${esc(E.cur.shift || s.shift || '')}" placeholder="예: 주간 / A조 / 격일제"></label><label class="f">작성자<input id="eBy" value="${esc(E.cur.by || (UI.manager ? [UI.manager.title, UI.manager.name].filter(Boolean).join(' ') : ''))}"></label></div>
    ${tg}
    <div class="catbar" style="--c:#7A2E8E">📎 사건사고 · 주요 작업 · 업무개선 · 교육 · 우수사례 <small>보고서의 「첨부」와 「작업 전·후 사진」으로 들어갑니다</small></div>
    <div id="eEv"></div>
    <div class="row" style="margin-top:8px">${Object.entries(EVT).map(([k, v]) => `<button class="btn sm" type="button" data-addev="${k}">${v.ic} ${v.n} 추가</button>`).join('')}</div>
    <label class="f" style="margin-top:12px">특이사항·메모 (보고서 「기타」)<textarea id="eNote" rows="2">${esc(E.cur.note || '')}</textarea></label>
  </div></div>
  <div class="savebar"><span class="st" id="eSt">${getRec(s.key, E.job, E.d) ? '저장된 기록을 고치는 중' : '새 기록'} · 합계 <b id="eSum">0</b> · 환산 <b id="eVal">0원</b></span>
    <button class="btn" id="eCopy">↺ 전날 기록 불러오기</button>${getRec(s.key, E.job, E.d) ? '<button class="btn warn" id="eDel">이 날 기록 지우기</button>' : ''}<button class="btn pri" id="eSave">💾 저장</button></div>`;
  renderEntryEv(); entrySum();
  box.querySelector('.jobtabs').onclick = e => { const b = e.target.closest('[data-j]'); if (b) { E.job = b.dataset.j; renderEntryMain(); } };
  $('#eJobs').onclick = () => openSiteCfg(s.key);
  box.addEventListener('click', e => {
    const b = e.target.closest('.ctrl button'); if (!b) return; const inp = b.parentNode.querySelector('input'); inp.value = Math.max(0, (+inp.value || 0) + (+b.dataset.d)) || ''; inp.dispatchEvent(new Event('input', { bubbles: true }));
  });
  box.addEventListener('input', e => {
    const q = e.target.dataset.q, a = e.target.dataset.a;
    if (q) { E.cur.q[q] = e.target.value === '' ? '' : +e.target.value; e.target.closest('.ti').classList.toggle('has', !!+e.target.value); entrySum(); }
    if (a) { E.cur.a[a] = e.target.value === '' ? '' : +e.target.value; entrySum(); }
  });
  box.querySelectorAll('[data-addev]').forEach(b => b.onclick = () => openEvent(b.dataset.addev));
  $('#eSave').onclick = saveEntry;
  $('#eCopy').onclick = () => { const p = getRec(s.key, E.job, isoD(addDays(parseD(E.d), -1))); if (!p) return toast('전날 기록이 없습니다'); E.cur.q = Object.assign({}, p.q); E.cur.a = Object.assign({}, p.a); const keep = E.cur; renderEntryMain(); E.cur.q = keep.q; E.cur.a = keep.a; $$('#eMain [data-q]').forEach(i => i.value = E.cur.q[i.dataset.q] ?? ''); $$('#eMain [data-a]').forEach(i => i.value = E.cur.a[i.dataset.a] ?? ''); entrySum(); toast('전날 수량을 불러왔습니다 — 확인 후 저장하세요'); };
  const del = $('#eDel'); if (del) del.onclick = () => { if (!confirmBox(`${s.name} ${fmtD(E.d)} ${J.n} 기록을 지울까요?`)) return; delRec(recId(s.key, E.job, E.d)); toast('지웠습니다'); renderEntryMain(); renderEntryCal(); renderEntrySites(); renderHeroStats(); };
}
function entrySum() {
  const E = V.entry; let n = 0, v = 0;
  Object.entries(E.cur.q).forEach(([k, q]) => { const t = TASK[k]; if (!t || !q || t.k === 'score' || t.k === 'avg') return; if (t.k !== 'amt') n += +q; v += t.k === 'amt' ? 0 : +q * valOf(k); });
  Object.values(E.cur.a).forEach(a => v += +a || 0);
  if ($('#eSum')) { $('#eSum').textContent = nf(n); $('#eVal').textContent = won(v); }
}
function renderEntryEv() { const E = V.entry; $('#eEv').innerHTML = E.cur.ev.length ? evListHtml(E.cur.ev.map((e, i) => Object.assign({ d: E.d, site: E.site, _i: i }, e))) : '<p class="hint">기록할 사건·작업이 없으면 비워 두세요.</p>'; $$('#eEv [data-evdel]').forEach(b => b.onclick = () => { E.cur.ev.splice(+b.dataset.evdel, 1); renderEntryEv(); }); }
function saveEntry() {
  const E = V.entry, s = SITE[E.site];
  const q = {}; Object.entries(E.cur.q).forEach(([k, v]) => { if (v !== '' && v != null && !isNaN(v) && +v !== 0) q[k] = +v; });
  const a = {}; Object.entries(E.cur.a).forEach(([k, v]) => { if (v !== '' && v != null && +v) a[k] = +v; });
  if (!Object.keys(q).length && !E.cur.ev.length && !$('#eNote').value.trim()) return toast('입력한 실적이 없습니다');
  putRec({ d: E.d, site: s.key, job: E.job, by: $('#eBy').value.trim(), shift: $('#eShift').value.trim(), q, a, ev: E.cur.ev, note: $('#eNote').value.trim() });
  toast(`저장했습니다 — ${s.name} ${fmtD(E.d)} ${JOBS[E.job].n}`); renderEntrySites(); renderEntryCal(); renderEntryMain(); renderHeroStats();
}
function openEvent(type) {
  const E = V.entry, t = EVT[type]; let ph1 = '', ph2 = '';
  const showAmt = type === 'inc', showAct = type === 'inc', showBA = type === 'imp';
  openModal(`<h2>${t.ic} ${t.n}</h2><div class="sub">${esc(SITE[E.site].name)} · ${fmtD(E.d)} · ${JOBS[E.job].n}</div>
    <div class="field"><label>제목 (필수)</label><input id="evT" placeholder="${type === 'inc' ? '예: 남문 월담 무단침입 적발' : type === 'work' ? '예: B1·B2 주차장 경사로 대청소' : type === 'imp' ? '예: 정문 출입 확인 램프 설치' : type === 'praise' ? '예: 고객사 감사 메일 — 신속한 응급 대응' : type === 'edu' ? '예: 경비업법 직무교육 2시간' : '예: 조원 단합 행사'}"></div>
    <div class="grid2"><div class="field"><label>장소</label><input id="evL"></div><div class="field"><label>${type === 'praise' ? '근무자(대상자)' : '근무자·참석자'}</label><input id="evW"></div></div>
    <div class="field"><label>${type === 'inc' ? '내용 (6하 원칙)' : '내용'}</label><textarea id="evD" rows="3"></textarea></div>
    ${showAct ? '<div class="field"><label>조치 결과 (비우면 「조치 진행」으로 집계)</label><textarea id="evA" rows="2"></textarea></div>' : ''}
    ${showBA ? '<div class="grid2"><div class="field"><label>개선 전</label><input id="evB"></div><div class="field"><label>개선 후(효과)</label><input id="evAf"></div></div>' : ''}
    ${showAmt ? '<div class="field"><label>관련 금액(원) — 적발·예방 금액이 있으면</label><input id="evM" type="number" min="0" step="1000"></div>' : ''}
    <div class="grid2"><div class="field"><label>${type === 'praise' || type === 'edu' || type === 'org' ? '사진' : '작업 전 사진'}</label><input type="file" accept="image/*" id="evP1"><img id="evI1" style="max-width:100%;border-radius:10px;margin-top:4px" alt=""></div>
    ${type === 'praise' || type === 'edu' || type === 'org' ? '' : '<div class="field"><label>작업 후 사진</label><input type="file" accept="image/*" id="evP2"><img id="evI2" style="max-width:100%;border-radius:10px;margin-top:4px" alt=""></div>'}</div>
    <div class="mrow"><button class="btn" id="mClose">취소</button><button class="btn pri" id="evOk">추가</button></div>`, md => {
    md.querySelector('#mClose').onclick = closeModal;
    const ph = (id, img, set) => { const el = md.querySelector(id); if (el) el.onchange = async e => { const f = e.target.files[0]; if (!f) return; const d = await shrinkPhoto(f); set(d); md.querySelector(img).src = d; }; };
    ph('#evP1', '#evI1', d => ph1 = d); ph('#evP2', '#evI2', d => ph2 = d);
    md.querySelector('#evOk').onclick = () => {
      const g = id => { const el = md.querySelector(id); return el ? el.value.trim() : ''; };
      if (!g('#evT')) return toast('제목을 입력하세요');
      E.cur.ev.push({ t: type, title: g('#evT'), loc: g('#evL'), worker: g('#evW'), desc: g('#evD'), action: g('#evA'), before: g('#evB'), after: g('#evAf'), amt: +g('#evM') || 0, ph1, ph2 });
      closeModal(); renderEntryEv(); toast('추가했습니다 — 아래 「💾 저장」을 누르세요');
    };
  }, true);
}

/* =====================================================================
 * ③ 운영실태 · 품질점검
 * ===================================================================== */
function qcSite(q) { return SITE[q.site] || q.siteObj || { key: q.site, name: q.siteName || q.site, org: q.org || '', ind: q.ind, br: '' }; }
function renderQC() {
  const yr = UI.qcYear || String(kstNow().getFullYear());
  const list = Object.values(PM.qc).sort((a, b) => b.d.localeCompare(a.d));
  const years = [...new Set(list.map(q => q.d.slice(0, 4)).concat([String(kstNow().getFullYear())]))].sort().reverse();
  $('#p-qc').innerHTML = `<div class="two" style="grid-template-columns:minmax(0,1fr) minmax(0,1.6fr)">
    <div>
      <div class="card" style="--c:#1B7A34"><h2>🔍 점검 이력 <span class="r"><button class="btn sm pri" id="qNew">＋ 새 점검</button></span></h2><div class="body">
        <p class="hint">2024.08.19 「전사 미화사업장 운영실태 및 품질점검 결과」 평가 체계 — 일반관리(행정) 10% · 위험관리(법령) 10% · 업무환경 5% · 현장품질 75%. 보안·시설·주차·안내 업종도 같은 틀로 점검합니다.</p>
        <div class="tblw" style="max-height:440px"><table class="t" style="min-width:0"><thead><tr><th>점검일</th><th style="text-align:left">사업장</th><th>업종</th><th>점수</th><th>등급</th></tr></thead><tbody>${list.map(q => { const s = qcSite(q), sc = qcScore(q), g = gradeOf(sc.total); return `<tr data-qc="${q.id}" style="cursor:pointer" class="${q.id === V.qcId ? 'on' : ''}"><td class="c">${fmtDs(q.d)}</td><td><b>${esc(s.name)}</b><br><small class="hint">${esc(siteOrgLabel(s) || '')}${q.sample ? ' · 가상 예시' : ''}</small></td><td class="c">${JOBS[q.job].s}</td><td class="n"><b>${nf(sc.total, 1)}</b></td><td class="c"><span class="gr" style="background:${g[2]}">${g[0]}</span></td></tr>`; }).join('') || '<tr><td colspan="5" class="empty">점검 이력이 없습니다</td></tr>'}</tbody></table></div>
      </div></div>
      <div class="card" style="--c:#0B1F8A"><h2>🏛 전사 운영실태·품질점검 결과 종합 <span class="r"><select id="qYear" style="width:auto">${years.map(y => `<option ${y === yr ? 'selected' : ''}>${y}</option>`).join('')}</select></span></h2><div class="body" id="qSum"></div></div>
    </div>
    <div id="qForm"></div></div>`;
  $('#qNew').onclick = () => { V.qcId = ''; V.qc = newQC(); renderQCForm(); };
  $$('#p-qc [data-qc]').forEach(tr => tr.onclick = () => { V.qcId = tr.dataset.qc; V.qc = JSON.parse(JSON.stringify(PM.qc[V.qcId])); renderQCForm(); $$('#p-qc [data-qc]').forEach(x => x.classList.toggle('on', x === tr)); });
  $('#qYear').onchange = e => { UI.qcYear = e.target.value; saveUI(); renderQC(); };
  renderQCSum(yr);
  if (!V.qc) V.qc = V.qcId && PM.qc[V.qcId] ? JSON.parse(JSON.stringify(PM.qc[V.qcId])) : newQC();
  renderQCForm();
}
function newQC() { const s = SITE[V.entry.site] || SITE_LIST[0]; return { id: '', d: today(), site: s.key, job: s.jobs[0], ind: s.ind, inspector: UI.manager ? [UI.manager.org, UI.manager.name].filter(Boolean).join(' ') : '', sc: {}, excl: [], note: '', period: '' }; }
function qcYearList(yr) { return Object.values(PM.qc).filter(q => q.d.startsWith(yr)).map(q => ({ q, s: qcSite(q), sc: qcScore(q) })).filter(x => x.sc.total != null).sort((a, b) => b.sc.total - a.sc.total); }
function renderQCSum(yr) {
  const L = qcYearList(yr);
  if (!L.length) { $('#qSum').innerHTML = '<div class="empty">이 해의 점검 결과가 없습니다.</div>'; return; }
  const band = x => x >= 90 ? 0 : x >= 80 ? 1 : x >= 70 ? 2 : 3, cnt = [0, 0, 0, 0]; L.forEach(x => cnt[band(x.sc.total)]++);
  const avg = k => { const v = L.map(x => x.sc.sec[k].w).filter(x => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
  $('#qSum').innerHTML = `<div class="kpis" style="grid-template-columns:repeat(4,1fr);margin-bottom:10px">${['90점 이상', '80점 이상', '70점 이상', '70점 미만'].map((n, i) => `<div class="kpi" style="--c:${GRADE[i][3]}"><small>${n}</small><b>${cnt[i]}</b><span>곳</span></div>`).join('')}</div>
    <div class="tblw" style="max-height:340px"><table class="t" style="min-width:560px"><thead><tr><th>순위</th><th style="text-align:left">사업장</th><th>일반관리<br><small>10%</small></th><th>위험관리<br><small>10%</small></th><th>업무환경<br><small>5%</small></th><th>현장품질<br><small>75%</small></th><th>평점</th></tr></thead><tbody>
    ${L.map((x, i) => `<tr><td class="c">${i + 1}</td><td>${esc(x.s.name)}</td>${['gen', 'risk', 'env', 'site'].map(k => `<td class="n">${x.sc.sec[k].excl ? '점검제외' : nf(x.sc.sec[k].w, 1)}</td>`).join('')}<td class="n"><b>${nf(x.sc.total, 1)}</b></td></tr>`).join('')}
    <tr class="tot"><td colspan="2">평균 · 총 ${L.length}개 SITE</td>${['gen', 'risk', 'env', 'site'].map(k => `<td class="n">${nf(avg(k), 1)}</td>`).join('')}<td class="n">${nf(L.reduce((a, x) => a + x.sc.total, 0) / L.length, 1)}</td></tr></tbody></table></div>
    <div class="row" style="margin-top:10px"><button class="btn bw" style="color:#fff;border:0" id="qsWord">📄 종합 결과보고 Word</button><button class="btn bf" style="color:#fff;border:0" id="qsPdf">📕 PDF</button><button class="btn bx" style="color:#fff;border:0" id="qsXl">📊 평점표 엑셀</button></div>`;
  $('#qsWord').onclick = () => outQCSummary(yr, 'docx'); $('#qsPdf').onclick = () => outQCSummary(yr, 'pdf'); $('#qsXl').onclick = () => outQCSummaryXlsx(yr);
}
function renderQCForm() {
  const q = V.qc, s = qcSite(q), items = qcItems(q.job, q.ind), sc = qcScore(q);
  const secHtml = k => {
    const its = items.filter(i => i.s === k), [n1, n2] = QC_SECN[k], ex = (q.excl || []).includes(k);
    return `<div class="qcsec"><h3>${n1} <small>(${n2}) · 배점 ${QC_W[k]}%</small><label style="font-size:12px;font-weight:500;display:flex;gap:4px;align-items:center"><input type="checkbox" data-excl="${k}" ${ex ? 'checked' : ''}> 점검제외</label><span class="sc">${sc.sec[k].avg == null ? '-' : nf(sc.sec[k].avg, 1) + '점'}</span></h3>
      ${q.fixed && q.fixed[k] != null && !Object.keys(q.sc || {}).length ? `<div class="qi"><span class="nm">기록된 부문 점수</span><b>${nf(q.fixed[k], 1)}점</b><small class="hint">${esc(q.ref || '')}</small></div>` : ''}
      ${its.map(i => { const v = (q.sc[i.k] || {}); return `<div class="qi"><span class="nm">${esc(i.n)}</span><span class="qs" data-k="${i.k}">${QC_SCALE.map(([val, nm]) => `<button type="button" data-v="${val}" aria-pressed="${v.s != null && v.s !== '' && +v.s === val}">${nm}</button>`).join('')}<button type="button" data-v="" aria-pressed="${v.s === ''}" title="해당 없음">-</button></span><textarea data-c="${i.k}" rows="1" placeholder="${k === 'site' ? '청소·관리 상태(양호) / 개선 요망 사항' : '점검 내용 · 개선 요망'}">${esc(v.c || '')}</textarea></div>`; }).join('')}</div>`;
  };
  const g = gradeOf(sc.total);
  $('#qForm').innerHTML = `<div class="card" style="--c:#1B7A34"><h2>${q.id ? '✎ 점검 수정' : '＋ 새 운영실태·품질점검'} <span class="r">종합 <b style="font-size:18px;color:var(--nv)">${nf(sc.total, 1)}</b>점 <span class="gr" style="background:${g[2]}">${g[0]}</span></span></h2><div class="body">
    <div class="grid">
      <label class="f" style="grid-column:span 2">사업장<select id="qSite">${q.siteObj ? `<option value="${q.site}" selected>${esc(s.name)}</option>` : ''}${SITE_LIST.map(x => `<option value="${x.key}" ${x.key === q.site ? 'selected' : ''}>${esc(x.name)} · ${esc(siteOrgLabel(x))}</option>`).join('')}</select></label>
      <label class="f">업종<select id="qJob">${Object.entries(JOBS).map(([k, v]) => `<option value="${k}" ${k === q.job ? 'selected' : ''}>${v.ic} ${v.n}</option>`).join('')}</select></label>
      <label class="f">산업(현장품질 구역)<select id="qInd">${indOptions(q.ind, '일반')}</select></label>
      <label class="f">점검일<input type="date" id="qD" value="${q.d}"></label>
      <label class="f">점검자<input id="qBy" value="${esc(q.inspector || '')}"></label>
    </div>
    <div style="margin-top:12px">${['gen', 'risk', 'env', 'site'].map(secHtml).join('')}</div>
    <label class="f">종합 의견 · 후속조치 (보고서 「개선사항」)<textarea id="qNote" rows="3">${esc(q.note || '')}</textarea></label>
  </div></div>
  <div class="savebar"><span class="st">${esc(s.name)} · ${JOBS[q.job].n} · ${fmtD(q.d)}</span>${q.id ? '<button class="btn warn" id="qDel">삭제</button>' : ''}<button class="btn bw" style="color:#fff;border:0" id="qWord">📄 점검보고서 Word</button><button class="btn bp" style="color:#fff;border:0" id="qPpt">📊 PPT</button><button class="btn bf" style="color:#fff;border:0" id="qPdf">📕 PDF</button><button class="btn pri" id="qSave">💾 저장</button></div>`;
  const re = () => { readQC(); renderQCForm(); };
  $('#qSite').onchange = e => { readQC(); const ns = SITE[e.target.value]; if (ns) { q.site = ns.key; q.siteObj = null; q.ind = ns.ind; if (!ns.jobs.includes(q.job)) q.job = ns.jobs[0]; } renderQCForm(); };
  $('#qJob').onchange = re; $('#qInd').onchange = re;
  $$('#qForm [data-excl]').forEach(c => c.onchange = re);
  $('#qForm').addEventListener('click', e => { const b = e.target.closest('.qs button'); if (!b) return; readQC(); const k = b.parentNode.dataset.k; q.sc[k] = Object.assign(q.sc[k] || {}, { s: b.dataset.v === '' ? '' : +b.dataset.v }); delete q.fixed; renderQCForm(); });
  $('#qSave').onclick = () => { readQC(); if (!q.id) q.id = 'qc' + uid(); q.sample = false; PM.qc[q.id] = JSON.parse(JSON.stringify(q)); V.qcId = q.id; savePM(); toast('품질점검을 저장했습니다'); renderQC(); };
  const del = $('#qDel'); if (del) del.onclick = () => { if (!confirmBox('이 점검을 삭제할까요?')) return; delete PM.qc[q.id]; savePM(); V.qc = newQC(); V.qcId = ''; renderQC(); };
  $('#qWord').onclick = () => { readQC(); outQCSite(q, 'docx'); }; $('#qPpt').onclick = () => { readQC(); outQCSite(q, 'pptx'); }; $('#qPdf').onclick = () => { readQC(); outQCSite(q, 'pdf'); };
}
function readQC() {
  const q = V.qc; if (!$('#qJob')) return;
  q.job = $('#qJob').value; q.ind = $('#qInd').value; q.d = $('#qD').value || today(); q.inspector = $('#qBy').value.trim(); q.note = $('#qNote').value;
  q.excl = $$('#qForm [data-excl]').filter(c => c.checked).map(c => c.dataset.excl);
  $$('#qForm [data-c]').forEach(t => { const k = t.dataset.c; if (t.value.trim() || q.sc[k]) q.sc[k] = Object.assign(q.sc[k] || {}, { c: t.value.trim() }); });
}

/* =====================================================================
 * ④ 보고서 출력
 * ===================================================================== */
function renderReport() {
  const F = curF(), per = UI.per || 'm', ref = UI.ref || today(), r = periodRange(per, ref);
  const sites = sitesFiltered(F).filter(s => !F.site || s.key === F.site);
  const A = aggregate(r, F);
  $('#p-report').innerHTML = `
  <div class="card" style="--c:#0B1F8A"><h2>🖨 보고서 범위 <span class="r">「📈 성과 현황」의 기간·필터를 그대로 씁니다</span></h2><div class="body">
    <div class="grid">
      <label class="f">기간<select id="rPer">${Object.entries(PERIODS).map(([k, v]) => `<option value="${k}" ${k === per ? 'selected' : ''}>${v}성과</option>`).join('')}</select></label>
      <label class="f">기준일<input type="date" id="rRef" value="${ref}"></label>
      <label class="f">조직<select id="rOrg">${orgOptions(F.org)}</select></label>
      <label class="f">업종<select id="rJob">${jobOptions(F.job)}</select></label>
      <label class="f" style="grid-column:span 2">사업장<select id="rSite">${siteOptions(F, F.site, '범위 안 전체 사업장')}</select></label>
    </div>
    <p class="hint" style="margin-top:8px"><b>${esc(r.label)}</b> · ${esc(scopeLabel(F))} · 기록 ${nf(A.recs.length)}건 · 기록 사업장 ${nf(A.siteN)}곳 · 업무량 ${nf(A.act)} · 예방·적발 ${nf(A.prevN)}건 · 환산가치 ${won(A.value)}</p>
  </div></div>
  <div class="rgrid">
    <div class="rcard" style="--c:#1D6F42"><h3>📊 성과 실적표 (엑셀)</h3><p>르노삼성 「월간업무실적표」 형식 — 요약(당월·전월·누계 건수·금액) · 일자별 실적(1일~말일 × 업무 항목) · 사건사고 예방·적발 내역 · 업무개선 · 교육훈련 · 우수사례 · 사업장별 성과 · 가치 산정 기준 시트.</p><div class="row"><button class="btn bx" data-out="xlsx">⬇ 엑셀 실적표</button></div></div>
    <div class="rcard" style="--c:#2b579a"><h3>📄 주요 업무실적 및 계획 보고 (Word)</h3><p>전사 미화현장 「월말보고」 형식 — 결재란 · 당월 주요 업무(계획/결과) · 정량 성과표 · 「보이지 않는 성과」 · 자체 품질평가 · 차월 계획 · 주요 작업·업무개선 실적(작업 전·후 사진) · 우수사례. 사업장마다 한 부씩.</p><div class="row"><button class="btn bw" data-out="docx">⬇ Word</button><button class="btn bf" data-out="pdf">⬇ PDF</button><button class="btn" data-out="edit" style="color:var(--ink)">✎ 계획·대책 문구</button></div></div>
    <div class="rcard" style="--c:#C43E1C"><h3>📊 성과 발표자료 (PPT)</h3><p>르노삼성 「보안부문 업무실적」 발표 형식 — 표지 · 목차 · 당월 주요업무 성과(사건사고 예방·적발 · 순회 활동 · 산출기준) · 추이 차트 · 업무개선 · 교육훈련 · 조직활성화 · 반성 및 대책 · 익월 계획. 16:9 · 편집 가능.</p><div class="row"><button class="btn bp" data-out="pptx">⬇ PPT</button><button class="btn bf" data-out="pptpdf">⬇ PDF</button></div></div>
    <div class="rcard" style="--c:#0E7C86"><h3>🏛 전사 월간실적 및 계획 관리현황 (엑셀)</h3><p>「전사 미화현장 월간실적 및 계획 관리현황」 형식 — 조직(본부·지사)별 사업장 · 책임자 · 인원 · 보고(기록) 현황 · 업무량 · 예방 · 환산가치 · 달성률 · SPI · 등급.</p><div class="row"><button class="btn bx" data-out="orgxlsx">⬇ 관리현황 엑셀</button></div></div>
    <div class="rcard" style="--c:#1B7A34"><h3>🔍 운영실태·품질점검 결과</h3><p>2024.08.19 「전사 미화사업장 운영실태 및 품질점검 결과」 형식 — 목적 · 개요 · 사업유형별 분포 · 평점순(세부점수) · 후속조치. 사업장별 점검보고서는 「🔍 운영실태·품질점검」 탭에서.</p><div class="row"><button class="btn bw" data-out="qcdocx">⬇ 종합 Word</button><button class="btn bf" data-out="qcpdf">⬇ PDF</button><button class="btn bx" data-out="qcxlsx">⬇ 평점표</button></div></div>
    <div class="rcard" style="--c:#7A2E8E"><h3>⬇ 한 번에</h3><p>선택 범위의 엑셀 실적표 + Word 보고 + PPT 발표자료를 차례로 만듭니다(사업장이 많으면 시간이 걸립니다).</p><div class="row"><button class="btn pri" data-out="all" style="background:linear-gradient(100deg,#1B7A34,#0B1F8A)">⬇ 3종 일괄</button></div></div>
  </div>
  <p class="hint">대상 사업장 ${sites.length}곳 중 기록이 있는 ${A.siteN}곳으로 만듭니다. Word 보고서의 머리글·바닥글은 에스텍 표준(「The Best Choice」 로고 · 쪽번호 · 제작자 서명)입니다.</p>`;
  const sync = () => { UI.per = $('#rPer').value; UI.ref = $('#rRef').value || today(); UI.F = Object.assign(curF(), { org: $('#rOrg').value, job: $('#rJob').value, site: $('#rSite').value }); if (UI.F.org !== F.org) { UI.F.site = ''; UI.F.br = ''; } saveUI(); renderReport(); };
  ['rPer', 'rRef', 'rOrg', 'rJob', 'rSite'].forEach(id => $('#' + id).onchange = sync);
  $$('#p-report [data-out]').forEach(b => b.onclick = () => runOut(b.dataset.out));
}
async function runOut(k) {
  const F = curF(), r = periodRange(UI.per || 'm', UI.ref || today());
  try {
    if (k === 'edit') return openPlanText(F, r);
    if (k === 'xlsx') return await outPerfXlsx(r, F);
    if (k === 'docx') return await outMonthly(r, F, 'docx');
    if (k === 'pdf') return await outMonthly(r, F, 'pdf');
    if (k === 'pptx') return await outDeck(r, F, 'pptx');
    if (k === 'pptpdf') return await outDeck(r, F, 'pdf');
    if (k === 'orgxlsx') return await outOrgXlsx(r, F);
    const ys = [...new Set(Object.values(PM.qc).map(q => q.d.slice(0, 4)))].filter(y => y <= r.from.slice(0, 4)).sort(); const yr = UI.qcYear && ys.includes(UI.qcYear) ? UI.qcYear : (ys.pop() || r.from.slice(0, 4));
    if (k === 'qcdocx') return await outQCSummary(yr, 'docx');
    if (k === 'qcpdf') return await outQCSummary(yr, 'pdf');
    if (k === 'qcxlsx') return await outQCSummaryXlsx(yr);
    if (k === 'all') { await outPerfXlsx(r, F); await outMonthly(r, F, 'docx'); await outDeck(r, F, 'pptx'); }
  } catch (e) { console.error(e); busy(false); toast('만들지 못했습니다: ' + (e.message || e), 5000); }
}
/* 계획·대책 문구 (보고서마다 사업장·월 단위로 저장) */
function planKey(site, r, job) { return `${site || 'all'}|${r.from}|${r.to}|${job || ''}`; }
function planText(site, r, job, A) {
  const k = planKey(site, r, job), p = PM.plans[k] || {};
  const top = Object.values(A.tasks).filter(T => T.act && TASK[T.id] && TASK[T.id].k !== 'score').sort((a, b) => b.act - a.act).slice(0, 5);
  const works = A.evBy.work.map(e => e.title).slice(0, 5), edus = A.evBy.edu.map(e => e.title).slice(0, 3);
  return {
    curPlan: p.curPlan ?? top.map((T, i) => `${i + 1}. ${TASK[T.id].n}`).join('\n'),
    curRes: p.curRes ?? top.map((T, i) => `${i + 1}. ${TASK[T.id].n} ${nf(T.act)}${TASK[T.id].u} 실시${T.plan ? ` (계획 대비 ${nf(Math.min(T.act, T.plan) / T.plan * 100, 0)}%)` : ''}`).concat(works.map((w, i) => `${top.length + i + 1}. ${w} 완료`)).join('\n'),
    eduPlan: p.eduPlan ?? '1. 법정 직무·안전보건교육\n2. 신규 입사자 교육',
    eduRes: p.eduRes ?? (edus.length ? edus.map((x, i) => `${i + 1}. ${x}`).join('\n') : '1. 정기 교육 실시'),
    etc: p.etc ?? A.recs.map(x => x.note).filter(Boolean).slice(0, 3).join('\n'),
    next: p.next ?? `1. ${top[0] ? TASK[top[0].id].n + ' 지속 실시' : '정기 업무 지속'}\n2. 취약 구역 집중 관리 및 자체 품질평가\n3. 계절별 안전관리(동절기 결빙·화재 예방 / 하절기 온열질환 예방)`,
    nextEdu: p.nextEdu ?? '1. 법정 직무교육(월 2시간)\n2. 비상대응 훈련',
    reflect: p.reflect ?? (A.unresolved ? `조치 진행 중인 사건 ${A.unresolved}건 — 원인 분석 후 재발 방지 대책 수립` : '사건사고 전건 조치 완료 — 예방 순찰과 취약 시간대 관리를 계속 강화'),
    qcIssue: p.qcIssue ?? ''
  };
}
function openPlanText(F, r) {
  const site = F.site || '', A = aggregate(r, F), t = planText(site, r, F.job, A);
  const fld = (k, n, rows = 3) => `<div class="field"><label>${n}</label><textarea id="pt_${k}" rows="${rows}">${esc(t[k])}</textarea></div>`;
  openModal(`<h2>✎ 보고서 계획·대책 문구</h2><div class="sub">${esc(r.label)} · ${esc(scopeLabel(F))} — 비워 두면 실적으로 자동 작성합니다.</div>
    <div class="grid2">${fld('curPlan', '당월 정기업무 — 계획')}${fld('curRes', '당월 정기업무 — 결과/실적')}${fld('eduPlan', '교육 — 계획', 2)}${fld('eduRes', '교육 — 결과', 2)}</div>
    ${fld('etc', '기타(특이사항)', 2)}<div class="grid2">${fld('next', '차월 계획 — 정기업무')}${fld('nextEdu', '차월 계획 — 교육', 3)}</div>${fld('reflect', '당월 반성 및 대책', 2)}${fld('qcIssue', '주요 문제점 및 개선방안(자체 품질평가)', 2)}
    <div class="mrow"><button class="btn" id="ptReset">자동 문구로</button><button class="btn" id="mClose">취소</button><button class="btn pri" id="ptOk">저장</button></div>`, md => {
    md.querySelector('#mClose').onclick = closeModal;
    md.querySelector('#ptReset').onclick = () => { delete PM.plans[planKey(site, r, F.job)]; savePM(); closeModal(); toast('자동 문구로 되돌렸습니다'); };
    md.querySelector('#ptOk').onclick = () => { const o = {}; Object.keys(t).forEach(k => o[k] = md.querySelector('#pt_' + k).value); PM.plans[planKey(site, r, F.job)] = o; savePM(); closeModal(); toast('저장했습니다'); };
  }, true);
}

/* =====================================================================
 * ⑤ 사업장 · 기준 설정
 * ===================================================================== */
function renderSet() {
  const k = V.setSite || (curF().site) || V.entry.site || (SITE_LIST[0] && SITE_LIST[0].key);
  $('#p-set').innerHTML = `<div class="two">
    <div class="card" style="--c:#1B7A34"><h2>🏢 사업장 성과 설정 <span class="r">산업 · 업종 · 면적 · 계획량</span></h2><div class="body">
      <label class="f">사업장<select id="sSite">${SITE_LIST.map(s => `<option value="${s.key}" ${s.key === k ? 'selected' : ''}>${esc(s.name)} · ${esc(siteOrgLabel(s))}</option>`).join('')}</select></label>
      <div class="row" style="margin-top:8px"><button class="btn pri" id="sOpen">✎ 이 사업장 설정 열기</button><button class="btn" id="sAdd">＋ 사업장 추가</button></div>
      <p class="hint">계획량(1일·월)을 넣으면 「계획 대비 달성률」과 SPI가 계산됩니다. 예: 보안 정기 순찰 1일 6회, 직무교육 월 2시간.</p>
      <div id="sUser"></div>
    </div></div>
    <div class="card" style="--c:#E8750A"><h2>💰 가치 환산 기준 <span class="r">1단위 환산가치(원) — 고객사 협의값으로 조정</span></h2><div class="body">
      <div class="tblw" style="max-height:420px"><table class="t" style="min-width:520px"><thead><tr><th>업종</th><th style="text-align:left">항목</th><th>단위</th><th>환산가치(원)</th><th style="text-align:left">근거</th></tr></thead><tbody>
      ${Object.values(TASK).filter(t => t.v || PM.val[t.id] != null || t.c === 'prev').map(t => `<tr><td class="c"><span class="tag" style="--c:${JOBS[t.job].color}">${JOBS[t.job].s}</span></td><td>${esc(t.n)}</td><td class="c">${t.u}</td><td><input type="number" min="0" step="1" data-val="${t.id}" value="${PM.val[t.id] ?? (t.v || '')}" placeholder="0" style="width:110px;text-align:right"></td><td><small class="hint">${esc(t.b || '예방 건수 — 고객사와 합의한 기대손실액을 넣으면 금액으로 환산')}</small></td></tr>`).join('')}
      </tbody></table></div>
      <div class="row" style="margin-top:8px"><button class="btn" id="vReset">기본값으로</button><button class="btn pri" id="vSave">💾 환산 기준 저장</button></div>
    </div></div></div>
    <div class="card" style="--c:#0B1F8A"><h2>🗂 자료 관리</h2><div class="body"><div class="rgrid">
      <div class="rcard" style="--c:#1D6F42"><h3>📥 엑셀로 한꺼번에 입력</h3><p>현장에서 쓰던 엑셀 일지를 옮길 때 — 업종별 시트(일자 · 사업장명 · 업무 항목 열) 양식을 받아 채운 뒤 불러옵니다.</p><div class="row"><button class="btn" id="dTpl">⬇ 입력 양식</button><label class="btn pri" for="dImp">⬆ 불러오기</label><input type="file" id="dImp" accept=".xlsx" hidden></div></div>
      <div class="rcard" style="--c:#0E7C86"><h3>☁ 공유 서버</h3><p>로그인하면 기록이 회사 공유 서버(pm_records)에 저장되어 본사·지사가 함께 집계합니다. <span id="shareState2"></span></p><div class="row"><button class="btn" id="dPush">⬆ 이 기기 기록 모두 올리기</button><button class="btn" id="dPull">⬇ 올해 기록 받기</button></div></div>
      <div class="rcard" style="--c:#7A2E8E"><h3>💾 백업 · 복원</h3><p>모든 기록·점검·설정을 파일 하나(.json)로 저장하거나 되돌립니다. 이 기기 사용량 약 ${nf(storeBytes() / 1024 / 1024, 1)}MB.</p><div class="row"><button class="btn" id="dExp">⬇ 백업 파일</button><label class="btn" for="dRes">⬆ 복원</label><input type="file" id="dRes" accept=".json" hidden></div></div>
      <div class="rcard" style="--c:#2F6FD0"><h3>📘 매뉴얼</h3><p>사용자 매뉴얼(모든 사용자)과 제작자 관리매뉴얼(제작자·관리자)을 프로그램 안에서 보거나 Word · PPT · PDF로 내려받습니다.</p><div class="row"><button class="btn" id="dMan">👤 사용자 매뉴얼</button>${isAdminUser() ? '<button class="btn" id="dManA">🛡️ 제작자 관리매뉴얼</button>' : ''}</div></div>
      <div class="rcard" style="--c:#B8860B"><h3>🧪 예시 자료</h3><p>올해 1월부터 오늘까지 5개 사업장(보안·미화·시설) 예시 기록과 가상 사업장 20곳의 품질점검 예시를 넣어 보고서 모양을 미리 봅니다.</p><div class="row"><button class="btn" id="dSeed">넣기</button><button class="btn warn" id="dClr">예시만 지우기</button></div></div>
    </div></div></div>`;
  $('#sSite').onchange = e => { V.setSite = e.target.value; };
  $('#sOpen').onclick = () => openSiteCfg($('#sSite').value);
  $('#sAdd').onclick = () => openAddSite(k2 => { V.setSite = k2; renderSet(); });
  $('#vSave').onclick = () => { $$('[data-val]').forEach(i => { const t = TASK[i.dataset.val]; if (i.value === '' || +i.value === (t.v || 0)) delete PM.val[t.id]; else PM.val[t.id] = +i.value; }); savePM(); toast('환산 기준을 저장했습니다'); renderHeroStats(); };
  $('#vReset').onclick = () => { PM.val = {}; savePM(); renderSet(); toast('기본값으로 되돌렸습니다'); };
  $('#dTpl').onclick = () => outEntryTemplate(); $('#dImp').onchange = e => { const f = e.target.files[0]; if (f) importEntryXlsx(f); e.target.value = ''; };
  $('#dPush').onclick = async () => { if (!sbClient()) return toast('먼저 로그인하세요'); busy(true, '공유 서버에 올리는 중…'); await pushAllShare(); busy(false); toast(SHARE.ok ? '올렸습니다' : '공유 서버가 준비되지 않았습니다(SQL 실행 필요)'); };
  $('#dPull').onclick = async () => { const y = kstNow().getFullYear(); const n = await pullShare({ from: y + '-01-01', to: y + '-12-31' }); toast(`받은 기록 ${n}건`); renderAll(); };
  $('#dExp').onclick = () => download(new Blob([JSON.stringify(PM)], { type: 'application/json' }), `에스텍_성과관리_백업_${today()}.json`);
  $('#dRes').onchange = async e => { const f = e.target.files[0]; e.target.value = ''; if (!f) return; try { const o = JSON.parse(await f.text()); if (!o.recs) throw 0; if (!confirmBox('백업 파일로 바꿀까요? 지금 이 기기의 자료는 백업 내용으로 대체됩니다.')) return; PM = Object.assign({ recs: {}, qc: {}, cfg: {}, val: {}, usites: [], plans: {} }, o); savePM(); renderAll(); toast('복원했습니다'); } catch (x) { toast('백업 파일이 아닙니다'); } };
  $('#dMan').onclick = () => openManual('user'); if ($('#dManA')) $('#dManA').onclick = () => openManual('admin');
  $('#dSeed').onclick = () => { busy(true, '예시 자료를 만드는 중…'); setTimeout(() => { const n = seedSample(); busy(false); renderAll(); toast(`예시 기록 ${nf(n)}건과 품질점검 예시(가상 사업장)를 넣었습니다`); }, 50); };
  $('#dClr').onclick = () => { if (!confirmBox('예시 자료만 지울까요? 직접 입력한 기록은 그대로 둡니다.')) return; clearSample(); renderAll(); toast('예시 자료를 지웠습니다'); };
  const us = PM.usites || []; $('#sUser').innerHTML = us.length ? `<p class="lbl" style="margin-top:12px;font-weight:800">직접 추가한 사업장 ${us.length}곳</p>` + us.map(u => `<div class="row" style="justify-content:space-between;border-bottom:1px solid var(--line);padding:5px 0"><span>${esc(u.name)} <small class="hint">${esc(u.orgN || '')}</small></span><button class="btn sm warn" data-udel="${u.key}">삭제</button></div>`).join('') : '';
  $$('[data-udel]').forEach(b => b.onclick = () => { if (!confirmBox('이 사업장을 목록에서 지울까요? (기록은 남습니다)')) return; PM.usites = PM.usites.filter(u => u.key !== b.dataset.udel); savePM(); buildSites(); renderSet(); });
  renderShareState(); const s2 = $('#shareState2'); if (s2) s2.textContent = $('#shareState').textContent;
}
function openSiteCfg(key) {
  const s = SITE[key]; if (!s) return; const c = PM.cfg[key] || {};
  const jobs = c.jobs && c.jobs.length ? c.jobs : s.jobs;
  const rows = j => tasksFor(j, c.ind || s.ind).map(t => `<tr><td class="c"><span class="tag" style="--c:${JOBS[j].color}">${JOBS[j].s}</span></td><td>${esc(t.n)}</td><td class="c">${t.u}</td><td>${t.per === 'm' ? '' : `<input type="number" min="0" step="any" data-pd="${t.id}" value="${(c.plan || {})[t.id] ?? ''}" placeholder="${t.p || ''}" style="width:90px;text-align:right">`}</td><td><input type="number" min="0" step="any" data-pm="${t.id}" value="${(c.planM || {})[t.id] ?? ''}" placeholder="${t.pm || ''}" style="width:90px;text-align:right"></td></tr>`).join('');
  openModal(`<h2>⚙ ${esc(s.name)} 성과 설정</h2><div class="sub">${esc(siteOrgLabel(s))} · 비운 칸은 기본값(회색 숫자)을 씁니다.</div>
    <div class="grid2"><div class="field"><label>산업(사업 유형)</label><select id="cInd">${indOptions(c.ind || s.ind, '선택')}</select></div><div class="field"><label>관리 면적(㎡, 미화)</label><input type="number" id="cArea" value="${c.area || ''}"></div></div>
    <div class="field"><label>운영 업종</label><div class="chips">${Object.entries(JOBS).map(([k, v]) => `<button type="button" class="chip g" data-cj="${k}" aria-pressed="${jobs.includes(k)}">${v.ic} ${v.n}</button>`).join('')}</div></div>
    <div class="tblw" style="max-height:46vh"><table class="t" style="min-width:520px"><thead><tr><th>업종</th><th style="text-align:left">업무 항목</th><th>단위</th><th>1일 계획</th><th>월 계획</th></tr></thead><tbody id="cRows">${jobs.map(rows).join('')}</tbody></table></div>
    <div class="mrow"><button class="btn" id="mClose">취소</button><button class="btn pri" id="cOk">저장</button></div>`, md => {
    md.querySelector('#mClose').onclick = closeModal;
    md.querySelectorAll('[data-cj]').forEach(b => b.onclick = () => b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')));
    md.querySelector('#cOk').onclick = () => {
      const nc = { ind: md.querySelector('#cInd').value, area: +md.querySelector('#cArea').value || 0, jobs: [...md.querySelectorAll('[data-cj][aria-pressed="true"]')].map(b => b.dataset.cj), plan: Object.assign({}, c.plan), planM: Object.assign({}, c.planM) };
      if (!nc.jobs.length) return toast('업종을 하나 이상 고르세요');
      md.querySelectorAll('[data-pd]').forEach(i => { if (i.value === '') delete nc.plan[i.dataset.pd]; else nc.plan[i.dataset.pd] = +i.value; });
      md.querySelectorAll('[data-pm]').forEach(i => { if (i.value === '') delete nc.planM[i.dataset.pm]; else nc.planM[i.dataset.pm] = +i.value; });
      PM.cfg[key] = nc; savePM(); buildSites(); closeModal(); toast('사업장 설정을 저장했습니다'); setTab(UI.tab);
    };
  }, true);
}
function openAddSite(done) {
  openModal(`<h2>＋ 사업장 추가</h2><div class="sub">목록에 없는 사업장(신규 계약·그룹사 현장)을 추가합니다.</div>
    <div class="field"><label>사업장명 (필수)</label><input id="aName"></div>
    <div class="grid2"><div class="field"><label>조직</label><select id="aOrg">${ORGS.map(o => `<option value="${o.k}">${esc(o.n)}</option>`).join('')}</select></div><div class="field"><label>지사(에스텍베스트)</label><select id="aBr"><option value="">-</option>${BRANCHES.map(b => `<option value="${b.key}">${esc(b.name)}</option>`).join('')}</select></div></div>
    <div class="grid2"><div class="field"><label>산업</label><select id="aInd">${indOptions('office', '선택')}</select></div><div class="field"><label>인원(명)</label><input id="aTot" type="number" min="0"></div></div>
    <div class="field"><label>업종</label><div class="chips">${Object.entries(JOBS).map(([k, v]) => `<button type="button" class="chip g" data-aj="${k}" aria-pressed="${k === 'cln'}">${v.ic} ${v.n}</button>`).join('')}</div></div>
    <div class="grid2"><div class="field"><label>현장 책임자</label><input id="aHead" placeholder="예: 홍길동 소장"></div><div class="field"><label>주소</label><input id="aAddr"></div></div>
    <div class="mrow"><button class="btn" id="mClose">취소</button><button class="btn pri" id="aOk">추가</button></div>`, md => {
    md.querySelector('#mClose').onclick = closeModal;
    md.querySelectorAll('[data-aj]').forEach(b => b.onclick = () => b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')));
    md.querySelector('#aOk').onclick = () => {
      const g = id => md.querySelector(id).value.trim(), name = g('#aName'); if (!name) return toast('사업장명을 입력하세요');
      const jobs = [...md.querySelectorAll('[data-aj][aria-pressed="true"]')].map(b => b.dataset.aj); if (!jobs.length) return toast('업종을 고르세요');
      const org = g('#aOrg'), br = g('#aBr'), key = 'u' + uid();
      PM.usites = PM.usites || []; PM.usites.push({ key, name, org, br: org === 'best' ? br : '', orgN: org === 'best' && br ? br + '지사' : orgName(org), ind: g('#aInd') || indOf(name), jobs, total: +g('#aTot') || 0, head: g('#aHead'), addr: g('#aAddr') });
      savePM(); buildSites(); closeModal(); toast('추가했습니다'); done && done(key);
    };
  }, true);
}
function isAdminUser() { const p = window.STPM_AUTH && STPM_AUTH.profile; return !!(p && ['owner', 'admin'].includes(p.role)); }
function openGuide() { return openManual('user'); }
function openGuideOld() {
  openModal(`<h2>📘 사용 안내</h2><div class="sub">S-Tec Performance Management System ${APP.version}</div>
  <ol style="padding-left:18px;line-height:1.75;font-size:13.5px">
    <li><b>성과 담당 지정</b> — 처음 열면 담당자를 지정합니다(보고서 작성자·결재란).</li>
    <li><b>⚙ 사업장·기준 설정</b> — 사업장의 산업·업종·계획량(1일 순찰 6회 등)과 가치 환산 기준(소등 1건 28원 등)을 고객사와 협의한 값으로 맞춥니다.</li>
    <li><b>✍ 일일 실적 입력</b> — 사업장·일자·업종을 고르고 ＋/− 로 수량을 넣습니다. 사건사고·주요 작업·업무개선은 작업 전·후 사진과 함께 추가합니다. 같은 날 다시 열면 고쳐집니다.</li>
    <li><b>📈 성과 현황</b> — 일일·주간·월간·연간을 고르고 조직·산업·업종·사업장으로 좁혀 SPI·업무량·예방·환산가치·달성률을 봅니다.</li>
    <li><b>🔍 운영실태·품질점검</b> — 업종·산업별 체크리스트(일반 10·위험 10·환경 5·현장 75%)로 점검하고 사업장 보고서와 전사 종합 결과를 만듭니다.</li>
    <li><b>🖨 보고서 출력</b> — 엑셀 실적표 · Word 월말보고 · PPT 발표자료 · PDF · 전사 관리현황.</li>
    <li><b>로그인</b> — 통합관리 시스템과 같은 아이디. 로그인하면 여러 기기 동기화, 공유 서버 SQL을 실행했으면 본사·지사가 현장 기록을 함께 집계합니다.</li>
  </ol>
  <p class="hint">환산가치의 기본값 중 「추정」 표시 항목은 시중 단가를 바탕으로 한 예시 값입니다. 대외 보고 전 고객사와 합의한 값으로 바꾸어 쓰세요.</p>
  <div class="mrow"><a class="btn" href="${APP.repo}#readme" target="_blank" rel="noopener">GitHub 안내</a><button class="btn pri" id="mClose">닫기</button></div>`, md => md.querySelector('#mClose').onclick = closeModal, true);
}

/* =====================================================================
 * 시작
 * ===================================================================== */
async function buildSignature(date) {
  try {
    const ff = new FontFace('DancingSig', `url(data:font/woff2;base64,${ASSET.dancing})`); await ff.load(); document.fonts.add(ff);
    const base = await loadImg(ASSET.sigBase);
    const M = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const txt = `${M[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`, S = 4, cv = document.createElement('canvas'), ctx = cv.getContext('2d');
    ctx.font = `${72 * S}px DancingSig`; const tw = ctx.measureText(txt).width / S, W = Math.ceil(1389 + tw + 24), H = 210;
    cv.width = W * S; cv.height = H * S; ctx.drawImage(base, 0, 0, base.width * S, base.height * S);
    ctx.font = `${72 * S}px DancingSig`; ctx.fillStyle = '#8A1C34'; ctx.fillText(txt, 1389 * S, 138 * S);
    const out = document.createElement('canvas'); out.width = W; out.height = H; const o = out.getContext('2d'); o.imageSmoothingQuality = 'high'; o.drawImage(cv, 0, 0, W, H);
    V.sig = out.toDataURL('image/png'); V.sigPx = W;
  } catch (e) { V.sig = ASSET.sigBase; V.sigPx = 1860; }
}
async function init() {
  $('#appIcon').src = ASSET.icon; $('#gateLogo').src = ASSET.icon; $('#heroImg').src = ASSET.hero; $('#mainIc').src = ASSET.icon;
  $('#ver').textContent = APP.version;
  $('#mgrCard').onclick = openMgr; $('#qrCard').onclick = openQR; $('#refCard').onclick = openRef; $('#btnGuide').onclick = e => { e.preventDefault(); openGuide(); };
  $$('[data-theme-set]').forEach(b => b.onclick = () => applyTheme(b.dataset.themeSet));
  $$('.tabs button').forEach(b => b.onclick = () => setTab(b.dataset.tab));
  $$('[data-go]').forEach(b => b.onclick = () => { setTab(b.dataset.go); $('.tabs').scrollIntoView({ behavior: 'smooth' }); });
  if (!UI.F || typeof UI.F !== 'object') UI.F = {};
  applyTheme(UI.theme); renderHeader(); showGate(); initPlayer(); renderAll(); renderShareState();
  window.addEventListener('app-access', () => renderAll());
  window.addEventListener('resize', () => { clearTimeout(V.rt); V.rt = setTimeout(drawCharts, 200); });
  setInterval(() => { renderShareState(); if (SHARE.ok == null && sbClient()) flushShare(); }, 15000);
  await buildSignature(kstNow()); $('#sigImg').src = V.sig;
}
window.addEventListener('DOMContentLoaded', init);
