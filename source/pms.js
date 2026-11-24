/* =====================================================================
 * S-Tec PMS 기획안 보강 기능 (v1.2.0)
 *  · 통합 성과점수(KPI 6영역 · S~D) 화면 · 개선·조치·민원 관리 · 고객사 평가 · 업무 영향 사유(예외)
 *  · 증빙 신뢰도(1~5단계) · 관리자/고객사 확인 · 변경 이력 · 현장 사진 · QR 점검 포인트
 *  · 고객사 화면 · 근무자 기여도 · 데이터 품질 점검 · 계약·재계약 성과보고서 · 관리대장 엑셀
 * Designed & Developed by Rat Rae Choi
 * ===================================================================== */
const MASK_SKIP = ['현장', '책임자', '근무자', '담당자', '관리자', '전원', '본사', '고객사', '총무팀', '시설팀', '보안팀', '미화팀', '선임', '주임', '반장', '조장', '소장', '팀장', '과장', '대리', '사원', '주무', '실장', '지사장', '근무조', '전체'];
const maskName = n => String(n || '').trim().split(/(\s+|,|·|\/)/).map(w => /^[가-힣○]{2,4}$/.test(w) && !MASK_SKIP.includes(w) && !/팀$|실$|부$|사$|조$/.test(w) ? w[0] + '○'.repeat(w.length - 1) : w).join('');
const mgrName = () => (UI.manager && [UI.manager.title, UI.manager.name].filter(Boolean).join(' ')) || '';
const kstStamp = () => { const d = kstNow(); return `${isoD(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}+09:00`; };
const issDays = i => i.st === 'done' && i.doneD ? Math.max(0, Math.round((parseD(i.doneD) - parseD(i.d)) / 86400000)) : null;
const overdue = i => i.st !== 'done' && i.st !== 'hold' && i.due && i.due < today();

/* ---------- 성과 현황 보강 카드 ---------- */
function sampleBanner(A) {
  return A.sampleN ? `<div class="sbn">🧪 <b>예시 데이터</b> — 이 화면의 기록 ${nf(A.sampleN)}건은 보고서 모양을 보기 위한 예시입니다. 실제 성과로 쓰지 마세요(⚙ 설정 › 예시 자료 › 예시만 지우기).</div>` : '';
}
function kpi2Html(A) {
  const k = (c, t, v, sub) => `<div class="kpi" style="--c:${c}"><small>${t}</small><b>${v}</b><span>${sub}</span></div>`;
  return `<div class="kpis k2">
    ${k('#C0392B', '위험요소·이상 조치율', A.riskRate == null ? '-' : pct(A.riskRate), A.riskN ? `발견 ${A.riskN}건 · 완료 ${A.riskDone}건` : '기간 중 발견 0건')}
    ${k('#E8750A', '민원·요청 해결률', A.cmpRate == null ? '-' : pct(A.cmpRate), A.cmpN ? `${A.cmpN}건 중 ${A.cmpDone}건${A.cmpDays != null ? ` · 평균 ${nf(A.cmpDays, 1)}일` : ''}` : '접수 0건')}
    ${k('#0E7C86', '고객사 평가', A.csat == null ? '-' : nf(A.csat, 1) + '점', A.csat == null ? '🛠 탭에서 평가 입력' : `5점 척도 ${nf(A.csat / 20, 2)}${A.csatPrev ? ' · 최근 평가' : ''}`)}
    ${k('#7A2E8E', '미조치 사항', nf(A.issOpen.length) + '<small style="display:inline;font-size:13px"> 건</small>', A.issOpen.filter(overdue).length ? `예정일 지남 ${A.issOpen.filter(overdue).length}건` : '예정일 지남 0건')}
    ${k('#2A44D4', '관리자 확인율', A.manN ? pct(A.okN / A.manN * 100) : '-', A.manN ? `직접 입력 ${A.manN}건 · 고객사 확인 ${A.custN}건` : '직접 입력 기록 없음')}
    ${k('#1B7A34', 'QR 점검 확인', nf(A.chkN) + '<small style="display:inline;font-size:13px"> 회</small>', A.chkPts ? `${A.chkPts}개 지점` : '사업장 설정에서 QR 지점 등록')}
  </div>`;
}
function spiRows(A) {
  const W = A.spi ? A.spi.w : kpiW(A.F), P = A.spi ? A.spi.parts : {}, tw = Object.keys(P).reduce((a, k) => a + W[k], 0) || 1;
  return Object.keys(SPI_W).map(k => ({ k, n: SPI_N[k][0], d: SPI_N[k][1], w: W[k], v: P[k], got: P[k] != null ? P[k] * W[k] / tw : null }));
}
function spiCardHtml(A) {
  const g = A.spi ? gradeOf(A.spi.total) : ['-', '-', '#667089'];
  return `<div class="card" style="--c:#0B1F8A"><h2>🎯 통합 성과점수 <span class="r">${A.spi ? `${nf(A.spi.total, 1)}점 · <span class="gr" style="background:${g[2]}">${g[0]}</span> ${g[1]}` : '기록하면 계산'}</span></h2><div class="body">
    <table class="t spit"><thead><tr><th style="text-align:left">평가 영역</th><th>배점</th><th style="min-width:130px">영역 점수</th><th>반영</th></tr></thead><tbody>
    ${spiRows(A).map(x => `<tr><td><b>${x.n}</b><br><small class="hint">${esc(x.d)}</small></td><td class="c">${x.w}</td><td>${x.v == null ? '<small class="hint">측정 자료 없음 — 제외</small>' : rateBar(x.v)}</td><td class="n">${x.got == null ? '-' : nf(x.got, 1)}</td></tr>`).join('')}
    </tbody></table>
    <p class="hint" style="margin-top:6px">등급 S 95↑ 탁월 · A 90↑ 우수 · B 80↑ 양호 · C 70↑ 개선 필요 · D 70 미만 집중 관리. 측정 자료가 없는 영역은 빼고 나머지 배점으로 100점 환산합니다${A.F && A.F.site && PM.cfg[A.F.site] && PM.cfg[A.F.site].w ? ' (이 사업장 계약 가중치 적용)' : ''}.</p></div></div>`;
}
function issRowHtml(i, mask) {
  const s = SITE[i.site], K = ISS_K[i.kind] || ISS_K.imp, S = ISS_ST[i.st] || ISS_ST.open, Rk = ISS_RISK[i.risk] || ISS_RISK.M;
  return `<tr data-iss="${i.id}" class="clk ${overdue(i) ? 'od' : ''}"><td class="c">${fmtDs(i.d).slice(2)}</td><td class="c"><span class="tag" style="--c:${K.color}">${K.ic} ${K.n}</span></td><td class="c"><span class="gr" style="background:${Rk[1]}">${Rk[0]}</span></td><td>${esc(s ? s.name : i.site)}</td><td><b>${esc(i.title)}</b>${i.loc ? `<br><small class="hint">${esc(i.loc)}</small>` : ''}</td><td class="c">${esc(mask ? maskName(i.owner) : i.owner || '')}</td><td class="c">${i.due ? fmtDs(i.due).slice(5) : '-'}${overdue(i) ? '<br><small style="color:#C0392B;font-weight:700">지남</small>' : ''}</td><td class="c"><span class="pill" style="--c:${S[1]}">${S[0]}</span></td><td class="n">${issDays(i) == null ? '-' : issDays(i) + '일'}</td></tr>`;
}
function issTableHtml(list, mask) {
  if (!list.length) return '<div class="empty">해당하는 건이 없습니다.</div>';
  return `<div class="tblw"><table class="t" style="min-width:760px"><thead><tr><th>접수일</th><th>구분</th><th>위험도</th><th style="text-align:left">사업장</th><th style="text-align:left">내용</th><th>담당</th><th>예정일</th><th>상태</th><th>처리</th></tr></thead><tbody>${list.map(i => issRowHtml(i, mask)).join('')}</tbody></table></div>`;
}
function issOpenCardHtml(A) {
  return `<div class="card" style="--c:#C0392B"><h2>🛠 미조치 사항 <span class="r">${A.issOpen.length}건 · 위험도 순 <button class="btn sm" id="dIssGo" type="button">관리 화면 ›</button></span></h2><div class="body" style="max-height:420px;overflow:auto">${issTableHtml(A.issOpen.slice(0, 30))}</div></div>`;
}
function workersCardHtml(A) {
  const L = (A.workers || []).slice(0, 15);
  return `<div class="card" style="--c:#B8860B"><h2>🏅 근무자 개인별 기여도 <span class="r">우수사례 3 · 사건 대응 2 · 업무개선 2 · 위험요소 발견·조치 2 · 주요 작업 1점</span></h2><div class="body">${L.length ? `<div class="tblw"><table class="t" style="min-width:560px"><thead><tr><th>순위</th><th style="text-align:left">근무자</th><th>우수사례·칭찬</th><th>사건 대응</th><th>업무개선</th><th>위험요소·조치</th><th>주요 작업</th><th>기여 점수</th></tr></thead><tbody>${L.map((w, i) => `<tr><td class="c">${i + 1}</td><td><b>${esc(w.n)}</b></td><td class="n">${w.praise}</td><td class="n">${w.inc}</td><td class="n">${w.imp}</td><td class="n">${w.iss}</td><td class="n">${w.work}</td><td class="n"><b>${w.score}</b></td></tr>`).join('')}</tbody></table></div><p class="hint">사건·우수사례·개선 기록과 개선·조치 건의 「근무자」 칸으로 집계합니다. 개인에게 통제할 수 없는 결과는 넣지 않습니다(기획안 5.2). 고객사 제출용 보고서에서는 이름을 가립니다.</p>` : '<div class="empty">근무자 이름이 적힌 기록이 없습니다 — 사건·우수사례·개선·조치를 기록할 때 「근무자」 칸을 채우세요.</div>'}</div></div>`;
}

/* ---------- 일일 실적 입력: 증빙 · 확인 · 이력 · 사진 · 업무 영향 사유 ---------- */
function entryEviHtml(s, E, saved) {
  const lv = saved ? eviOf(saved) : 0, ex = excOn(s.key, E.job, E.d), qn = chkCount(s.key, E.d);
  return `<div class="evib"><div class="lv"><b>증빙 단계</b>${EVI.map(([n, t]) => `<span class="${lv >= n ? 'on' : ''}" title="${t}">${n} ${t}</span>`).join('')}</div>
    <div class="row" style="gap:6px">${saved ? `${saved.st === 'cust' ? `<span class="pill" style="--c:#1B7A34">🏢 고객사 확인 · ${esc(saved.custBy || '')}</span>` : saved.st === 'ok' ? `<span class="pill" style="--c:#0B1F8A">✔ 관리자 확인 · ${esc(saved.okBy || '')}</span>` : '<span class="pill" style="--c:#E8750A">확인 전</span>'}
      ${saved.st ? '<button type="button" class="btn sm" id="eUnok">확인 취소</button>' : '<button type="button" class="btn sm pri" id="eOk">✔ 관리자 확인</button>'}${saved.st !== 'cust' ? '<button type="button" class="btn sm" id="eCust">🏢 고객사 확인</button>' : ''}<button type="button" class="btn sm" id="eLog">🕘 변경 이력 ${(saved.log || []).length}</button>` : '<small class="hint">저장하면 1단계(직접 입력) — 관리자 확인 · 사진 · QR · 고객사 확인으로 단계가 올라갑니다.</small>'}
      ${qn ? `<span class="pill" style="--c:#1B7A34">📍 QR 확인 ${qn}회</span>` : ''}
      <button type="button" class="btn sm" id="eExc">${ex ? `📅 ${esc(EXC_K[ex.k] ? EXC_K[ex.k][0] : '사유')}${ex.memo ? ' — ' + esc(ex.memo) : ''} (계획 제외)` : '📅 업무 영향 사유'}</button>
      <button type="button" class="btn sm" id="eIss">⚠ 위험요소·민원 등록</button></div></div>`;
}
function entryPhotoHtml(E) {
  const ph = E.cur.ph || [];
  return `<div class="field" id="ePhBox" style="margin-top:10px"><label>📷 현장 사진 증빙 (최대 3장 · 청결 상태·설비 상태·위험요소 — 4단계 증빙)</label>
    <div class="phs">${ph.map((p, i) => `<figure><img src="${p}" alt=""><button type="button" class="btn sm warn" data-phdel="${i}">삭제</button></figure>`).join('')}${ph.length < 3 ? '<label class="phadd">＋ 사진<input type="file" accept="image/*" id="ePh" hidden multiple></label>' : ''}</div>
    <small class="hint">사진은 업무 목적 범위에서만 찍고, 근무자·이용객 얼굴이 나오지 않게 합니다(개인정보 최소 수집).</small></div>`;
}
function bindEntryEvi(s, E, saved) {
  const re = () => { renderEntryMain(); renderEntryCal(); renderHeroStats(); };
  const setSt = (st, who) => { const r = JSON.parse(JSON.stringify(saved)); r.st = st; if (st === 'ok') { r.okBy = who; r.okAt = kstStamp(); } if (st === 'cust') { r.custBy = who; r.custAt = kstStamp(); if (!r.okBy) { r.okBy = mgrName(); r.okAt = r.custAt; } } if (!st) { r.okBy = ''; r.custBy = ''; } putRec(r, st || 'unok'); re(); };
  const g = id => $(id);
  if (g('#eOk')) g('#eOk').onclick = () => { setSt('ok', mgrName() || '현장 책임자'); toast('관리자 확인으로 표시했습니다(2단계)'); };
  if (g('#eUnok')) g('#eUnok').onclick = () => { if (confirmBox('확인 표시를 취소할까요?')) setSt('', ''); };
  if (g('#eCust')) g('#eCust').onclick = () => openModal(`<h2>🏢 고객사 확인</h2><div class="sub">${esc(s.name)} · ${fmtD(E.d)} — 고객사 담당자가 이 기록을 확인했을 때 적습니다(5단계 증빙).</div>
    <div class="field"><label>확인한 고객사 담당자</label><input id="cuW" placeholder="예: 총무팀 김○○ 과장"></div>
    <div class="mrow"><button class="btn" id="mClose">취소</button><button class="btn pri" id="cuOk">확인 기록</button></div>`, md => { md.querySelector('#mClose').onclick = closeModal; md.querySelector('#cuOk').onclick = () => { const w = md.querySelector('#cuW').value.trim(); if (!w) return toast('확인한 담당자를 적으세요'); closeModal(); setSt('cust', w); toast('고객사 확인을 기록했습니다'); }; });
  if (g('#eLog')) g('#eLog').onclick = () => openModal(`<h2>🕘 변경 이력</h2><div class="sub">${esc(s.name)} · ${fmtD(E.d)} · ${JOBS[E.job].n} — 입력자·수정자·시각·확인자·바뀐 값(전 → 후)</div>
    <div class="tblw" style="max-height:60vh"><table class="t"><thead><tr><th>시각</th><th>구분</th><th>처리자</th><th style="text-align:left">바뀐 값</th></tr></thead><tbody>${(saved.log || []).slice().reverse().map(l => `<tr><td class="c">${esc(String(l.at).replace('T', ' ').slice(0, 16))}</td><td class="c">${({ new: '최초 입력', edit: '수정', ok: '관리자 확인', cust: '고객사 확인', unok: '확인 취소' })[l.act] || l.act}</td><td class="c">${esc(l.by || '')}</td><td>${Object.entries(l.ch || {}).map(([k, v]) => `${esc(TASK[k] ? TASK[k].n : k)} ${nf(v[0])}→<b>${nf(v[1])}</b>`).join(', ') || '-'}</td></tr>`).join('') || '<tr><td colspan="4" class="empty">이력이 없습니다(이전 버전 기록)</td></tr>'}</tbody></table></div>
    <div class="mrow"><button class="btn pri" id="mClose">닫기</button></div>`, md => md.querySelector('#mClose').onclick = closeModal, true);
  g('#eExc').onclick = () => openExc(s.key, E.d, E.job);
  g('#eIss').onclick = () => openIssue('', { site: s.key, job: E.job, d: E.d });
  bindPhotos(E);
}
function bindPhotos(E) {
  const inp = $('#ePh'); if (inp) inp.onchange = async e => { for (const f of [...e.target.files].slice(0, 3 - E.cur.ph.length)) E.cur.ph.push(await shrinkPhoto(f, 720)); renderEntryPhotos(); };
  $$('#ePhBox [data-phdel]').forEach(b => b.onclick = () => { E.cur.ph.splice(+b.dataset.phdel, 1); renderEntryPhotos(); });
}
function renderEntryPhotos() { const E = V.entry, box = $('#ePhBox'); if (!box) return; const d = document.createElement('div'); d.innerHTML = entryPhotoHtml(E); box.replaceWith(d.firstElementChild); bindPhotos(E); toast('사진은 「💾 저장」을 눌러야 기록됩니다'); }

/* ---------- 업무 영향 사유(예외) ---------- */
function openExc(key, d, job) {
  const s = SITE[key]; if (!s) return; const L = (PM.exc[key] || []).slice().sort((a, b) => b.from.localeCompare(a.from));
  openModal(`<h2>📅 업무 영향 사유 — ${esc(s.name)}</h2><div class="sub">고객사 요청·작업 중지·출입 제한·기상 등으로 업무를 못 한 기간을 적으면 그 기간은 「계획 대비 수행률」 계산에서 빠집니다. 전면 중지 사유는 자동 산출도 하지 않습니다(기획안 10장 현장 예외 처리).</div>
    <div class="grid2"><div class="field"><label>시작일</label><input type="date" id="xF" value="${d || today()}"></div><div class="field"><label>종료일</label><input type="date" id="xT" value="${d || today()}"></div></div>
    <div class="grid2"><div class="field"><label>사유</label><select id="xK">${Object.entries(EXC_K).map(([k, v]) => `<option value="${k}">${v[0]}${v[1] ? ' — 전면 중지' : ''}</option>`).join('')}</select></div><div class="field"><label>업종</label><select id="xJ"><option value="">전체 업종</option>${s.jobs.map(j => `<option value="${j}">${JOBS[j].n}</option>`).join('')}</select></div></div>
    <div class="field"><label>내용(고객사 요청자·문서번호 등)</label><input id="xM" placeholder="예: 고객사 시설팀 요청 — 로비 공사로 청소 중지"></div>
    <div class="row"><button class="btn pri" id="xAdd">＋ 추가</button></div>
    <div class="tblw" style="max-height:34vh;margin-top:10px"><table class="t"><thead><tr><th>기간</th><th>사유</th><th>업종</th><th style="text-align:left">내용</th><th></th></tr></thead><tbody>${L.map(x => `<tr><td class="c">${fmtDs(x.from)}${x.to !== x.from ? ' ~ ' + fmtDs(x.to) : ''}</td><td class="c">${esc((EXC_K[x.k] || ['기타'])[0])}</td><td class="c">${x.job ? JOBS[x.job].s : '전체'}</td><td>${esc(x.memo || '')}</td><td class="c"><button class="btn sm warn" data-xdel="${x.id}">삭제</button></td></tr>`).join('') || '<tr><td colspan="5" class="empty">등록된 사유가 없습니다</td></tr>'}</tbody></table></div>
    <div class="mrow"><button class="btn" id="mClose">닫기</button></div>`, md => {
    const done = () => { savePM(); openExc(key, d, job); if (UI.tab === 'entry') { renderEntryMain(); renderEntryCal(); } renderHeroStats(); };
    md.querySelector('#mClose').onclick = () => { closeModal(); setTab(UI.tab); };
    md.querySelector('#xAdd').onclick = () => { const f = md.querySelector('#xF').value, t = md.querySelector('#xT').value || f; if (!f || t < f) return toast('기간을 확인하세요'); (PM.exc[key] = PM.exc[key] || []).push({ id: uid(), from: f, to: t, k: md.querySelector('#xK').value, job: md.querySelector('#xJ').value, memo: md.querySelector('#xM').value.trim(), by: mgrName(), at: kstStamp() }); toast('업무 영향 사유를 추가했습니다'); done(); };
    md.querySelectorAll('[data-xdel]').forEach(b => b.onclick = () => { PM.exc[key] = (PM.exc[key] || []).filter(x => x.id !== b.dataset.xdel); done(); });
  }, true);
}

/* ---------- 🛠 개선·조치·평가 탭 ---------- */
function renderIss() {
  const F = curF(), per = UI.per || 'm', ref = UI.ref || today(), r = periodRange(per, ref), A = aggregate(r, F);
  const fs = UI.issSt || 'act', fk = UI.issK || '';
  const map = new Map(); A.iss.concat(A.issOpen).forEach(i => map.set(i.id, i));
  const list = [...map.values()].filter(i => (!fk || i.kind === fk) && (fs === 'all' || (fs === 'act' ? i.st !== 'done' : i.st === 'done')));
  list.sort((a, b) => (a.st === 'done') - (b.st === 'done') || (ISS_RISK[b.risk] || [0, 0, 0])[2] - (ISS_RISK[a.risk] || [0, 0, 0])[2] || b.d.localeCompare(a.d));
  const cs = Object.values(PM.csat).filter(c => c.d >= r.from && c.d <= r.to && siteOk(SITE[c.site], F)).sort((a, b) => b.d.localeCompare(a.d));
  $('#p-iss').innerHTML = `
  <div class="filters">
    <label class="per">기간<div class="seg" id="iPer">${Object.entries(PERIODS).map(([k, v]) => `<button type="button" data-p="${k}" aria-pressed="${k === per}">${v}</button>`).join('')}</div></label>
    <label style="flex:0 1 170px">기준일<input type="date" id="iRef" value="${ref}"></label>
    <label>조직<select id="iOrg">${orgOptions(F.org)}</select></label>
    <label style="flex:1 1 220px">사업장<select id="iSite">${siteOptions(F, F.site)}</select></label>
  </div>
  ${sampleBanner(A)}
  <div class="card" style="--c:#C0392B"><h2>🛠 개선·조치·민원 관리 <span class="r">${esc(r.label)} · ${esc(scopeLabel(F))}</span></h2><div class="body">
    <p class="hint" style="margin:0 0 8px">위험요소 사전 발견 → 조치, 시설 이상 → 복구, 민원·고객사 요청 → 해결, 개선과제 → 완료까지 한 곳에서 추적합니다. 「예방 및 개선활동」(조치율·위험도 가중)과 「고객 만족도」(민원 해결률) 점수, 고객사 화면의 「미조치 사항」, 재계약 보고서에 그대로 들어갑니다.</p>
    ${kpi2Html(A)}
    <div class="row" style="margin:6px 0 10px">${Object.entries(ISS_K).map(([k, v]) => `<button class="btn sm" type="button" data-inew="${k}">${v.ic} ${v.n} 등록</button>`).join('')}</div>
    <div class="row" style="margin-bottom:8px"><div class="seg" id="iSt">${[['act', '미완료'], ['done', '완료'], ['all', '전체']].map(([k, n]) => `<button type="button" data-s="${k}" aria-pressed="${k === fs}">${n}</button>`).join('')}</div>
      <select id="iK" style="max-width:180px"><option value="">전체 구분</option>${Object.entries(ISS_K).map(([k, v]) => `<option value="${k}" ${k === fk ? 'selected' : ''}>${v.ic} ${v.n}</option>`).join('')}</select><span class="hint">${list.length}건</span></div>
    ${issTableHtml(list)}
  </div></div>
  <div class="two">
    <div class="card" style="--c:#0E7C86"><h2>⭐ 고객사 평가(만족도) <span class="r">${cs.length}건 <button class="btn sm pri" id="iCs" type="button">＋ 평가 입력</button></span></h2><div class="body">
      ${cs.length ? `<div class="tblw"><table class="t" style="min-width:520px"><thead><tr><th>평가일</th><th style="text-align:left;min-width:150px">사업장</th>${CSAT_Q.map((q, i) => `<th title="${esc(q)}">${'①②③④⑤'[i]}</th>`).join('')}<th>평균</th><th>환산</th></tr></thead><tbody>${cs.map(c => { const v = csatAvg(c); return `<tr class="clk" data-cs="${c.id}"><td class="c">${fmtDs(c.d).slice(2)}</td><td>${esc(SITE[c.site] ? SITE[c.site].name : c.site)}<br><small class="hint">${esc(c.who || '')}</small></td>${CSAT_Q.map((q, i) => `<td class="n">${c.sc[i] || '-'}</td>`).join('')}<td class="n"><b>${nf(v, 2)}</b></td><td class="n">${nf(v / 5 * 100, 1)}</td></tr>`; }).join('')}</tbody></table></div>` : '<div class="empty">이 기간 고객사 평가가 없습니다. 분기·반기마다 고객사 담당자에게 5개 항목(1~5점)을 받아 입력하세요.</div>'}
      <p class="hint">${CSAT_Q.map((q, i) => '①②③④⑤'[i] + ' ' + q).join(' · ')}<br>평가 항목·측정주기는 계약 때 고객사와 미리 합의합니다(기획안 5.2·10장). 기간 안에 평가가 없으면 최근 1년 안의 마지막 평가를 씁니다.</p></div></div>
    <div class="card" style="--c:#1B7A34"><h2>📍 QR 점검 포인트 <span class="r">3단계 증빙 — 지정 장소 방문 시각 자동 기록</span></h2><div class="body">
      <p class="hint" style="margin-top:0">순찰·화장실·설비 등 점검 지점마다 QR 스티커를 붙이면, 근무자가 휴대폰 카메라로 찍는 순간 이 프로그램이 열리며 「사업장 · 지점 · 시각 · 근무자」가 기록됩니다. GPS는 쓰지 않습니다.</p>
      <div class="row"><select id="iQs" style="flex:1">${siteOptions(F, F.site || V.entry.site, '사업장 선택')}</select><button class="btn pri" id="iQo">지점 관리 · QR 출력</button></div>
      <div style="margin-top:10px">${qrRecentHtml(F, r)}</div></div></div>
  </div>`;
  const re = () => { saveUI(); renderIss(); };
  $('#iPer').onclick = e => { const b = e.target.closest('button'); if (b) { UI.per = b.dataset.p; re(); } };
  $('#iRef').onchange = e => { UI.ref = e.target.value || today(); re(); };
  $('#iOrg').onchange = e => { UI.F = Object.assign(curF(), { org: e.target.value, br: '', site: '' }); re(); };
  $('#iSite').onchange = e => { UI.F = Object.assign(curF(), { site: e.target.value }); re(); };
  $('#iSt').onclick = e => { const b = e.target.closest('button'); if (b) { UI.issSt = b.dataset.s; re(); } };
  $('#iK').onchange = e => { UI.issK = e.target.value; re(); };
  $$('#p-iss [data-inew]').forEach(b => b.onclick = () => openIssue('', { kind: b.dataset.inew, site: F.site || V.entry.site }));
  $$('#p-iss [data-iss]').forEach(b => b.onclick = () => openIssue(b.dataset.iss));
  $('#iCs').onclick = () => openCsat('', F.site || V.entry.site);
  $$('#p-iss [data-cs]').forEach(b => b.onclick = () => openCsat(b.dataset.cs));
  $('#iQo').onclick = () => { const k = $('#iQs').value; if (!k) return toast('사업장을 고르세요'); openQrPts(k); };
}
function openIssue(id, preset = {}) {
  const old = id ? PM.iss[id] : null, i = Object.assign({ kind: 'risk', site: '', job: '', d: today(), title: '', loc: '', risk: 'M', owner: mgrName(), due: isoD(addDays(kstNow(), 7)), st: 'open', doneD: '', action: '', cause: 'in', worker: '', desc: '', ph1: '', ph2: '' }, old || preset);
  if (!i.site || !SITE[i.site]) i.site = (SITE_LIST.find(s => siteOk(s, {})) || {}).key || '';
  let ph1 = i.ph1, ph2 = i.ph2;
  const sOpt = SITE_LIST.filter(s => siteOk(s, {})).map(s => `<option value="${s.key}" ${s.key === i.site ? 'selected' : ''}>${esc(s.name)}</option>`).join('');
  openModal(`<h2>${(ISS_K[i.kind] || ISS_K.risk).ic} ${old ? '개선·조치 건 수정' : '개선·조치 건 등록'}</h2><div class="sub">발견·접수부터 조치 완료까지 기록합니다. 노후·외부 충격·전력 등 용역사가 통제하기 어려운 원인은 「외부요인」으로 구분해 책임 범위를 남깁니다.</div>
    <div class="grid2"><div class="field"><label>구분</label><select id="iKd">${Object.entries(ISS_K).map(([k, v]) => `<option value="${k}" ${k === i.kind ? 'selected' : ''}>${v.ic} ${v.n}</option>`).join('')}</select></div><div class="field"><label>위험도·중요도</label><select id="iRk">${Object.entries(ISS_RISK).map(([k, v]) => `<option value="${k}" ${k === i.risk ? 'selected' : ''}>${v[0]}</option>`).join('')}</select></div></div>
    <div class="field"><label>내용(제목, 필수)</label><input id="iT" value="${esc(i.title)}" placeholder="예: 비상계단 적치물(피난 장애) · 2층 화장실 악취 민원"></div>
    <div class="grid2"><div class="field"><label>사업장</label><select id="iS">${sOpt}</select></div><div class="field"><label>업종</label><select id="iJ"></select></div></div>
    <div class="grid2"><div class="field"><label>발견·접수일</label><input type="date" id="iD" value="${i.d}"></div><div class="field"><label>장소</label><input id="iL" value="${esc(i.loc)}"></div></div>
    <div class="grid2"><div class="field"><label>담당</label><input id="iO" value="${esc(i.owner)}"></div><div class="field"><label>조치 예정일</label><input type="date" id="iDu" value="${i.due || ''}"></div></div>
    <div class="grid2"><div class="field"><label>진행 상태</label><select id="iSt2">${Object.entries(ISS_ST).map(([k, v]) => `<option value="${k}" ${k === i.st ? 'selected' : ''}>${v[0]}</option>`).join('')}</select></div><div class="field"><label>완료일</label><input type="date" id="iDd" value="${i.doneD || ''}"></div></div>
    <div class="grid2"><div class="field"><label>원인 구분</label><select id="iC">${Object.entries(ISS_CAUSE).map(([k, v]) => `<option value="${k}" ${k === i.cause ? 'selected' : ''}>${v}</option>`).join('')}</select></div><div class="field"><label>발견·조치 근무자(기여도 집계)</label><input id="iW" value="${esc(i.worker)}" placeholder="예: 김○○ 선임"></div></div>
    <div class="field"><label>상세 내용</label><textarea id="iDs" rows="2">${esc(i.desc)}</textarea></div>
    <div class="field"><label>조치 내용·재발방지 대책</label><textarea id="iA" rows="2">${esc(i.action)}</textarea></div>
    <div class="grid2"><div class="field"><label>발견 사진</label><input type="file" accept="image/*" id="iP1"><img id="iI1" src="${ph1 || ''}" style="max-width:100%;border-radius:10px;margin-top:4px" alt=""></div><div class="field"><label>조치 후 사진</label><input type="file" accept="image/*" id="iP2"><img id="iI2" src="${ph2 || ''}" style="max-width:100%;border-radius:10px;margin-top:4px" alt=""></div></div>
    ${old && old.log ? `<p class="hint">이력: ${old.log.slice(-4).map(l => `${String(l.at).slice(5, 16).replace('T', ' ')} ${esc(l.by || '')} ${esc(l.act)}`).join(' · ')}</p>` : ''}
    <div class="mrow">${old ? '<button class="btn warn" id="iDel">삭제</button>' : ''}<button class="btn" id="mClose">취소</button><button class="btn pri" id="iOk">저장</button></div>`, md => {
    const q = x => md.querySelector(x);
    const jobs = () => { const s = SITE[q('#iS').value]; q('#iJ').innerHTML = (s ? s.jobs : Object.keys(JOBS)).map(j => `<option value="${j}" ${j === i.job ? 'selected' : ''}>${JOBS[j].n}</option>`).join(''); };
    jobs(); q('#iS').onchange = jobs;
    q('#iSt2').onchange = e => { if (e.target.value === 'done' && !q('#iDd').value) q('#iDd').value = today(); };
    const ph = (sel, img, set) => q(sel).onchange = async e => { const f = e.target.files[0]; if (!f) return; const d = await shrinkPhoto(f); set(d); q(img).src = d; };
    ph('#iP1', '#iI1', d => ph1 = d); ph('#iP2', '#iI2', d => ph2 = d);
    q('#mClose').onclick = closeModal;
    if (q('#iDel')) q('#iDel').onclick = () => { if (!confirmBox('이 건을 지울까요?')) return; delete PM.iss[id]; savePM(); queueShare(id, true); closeModal(); setTab(UI.tab); };
    q('#iOk').onclick = () => {
      const t = q('#iT').value.trim(); if (!t) return toast('내용(제목)을 입력하세요');
      const st = q('#iSt2').value, nid = id || 'iss_' + uid();
      const o = Object.assign({}, old || {}, { id: nid, kind: q('#iKd').value, risk: q('#iRk').value, title: t, site: q('#iS').value, job: q('#iJ').value, d: q('#iD').value || today(), loc: q('#iL').value.trim(), owner: q('#iO').value.trim(), due: q('#iDu').value, st, doneD: st === 'done' ? (q('#iDd').value || today()) : '', cause: q('#iC').value, worker: q('#iW').value.trim(), desc: q('#iDs').value.trim(), action: q('#iA').value.trim(), ph1, ph2, by: (old && old.by) || mgrName(), at: new Date().toISOString() });
      o.log = ((old && old.log) || []).concat([{ at: kstStamp(), by: mgrName(), act: old ? (old.st !== st ? '상태 ' + ISS_ST[st][0] : '수정') : '등록' }]).slice(-20);
      PM.iss[nid] = o; savePM(); queueShare(nid); closeModal(); toast('저장했습니다'); setTab(UI.tab); renderHeroStats();
    };
  }, true);
}
function openCsat(id, site) {
  const old = id ? PM.csat[id] : null, c = Object.assign({ site: site || '', d: today(), sc: CSAT_Q.map(() => ''), cmt: '', who: '' }, old || {});
  if (!c.site || !SITE[c.site]) c.site = (SITE_LIST.find(s => siteOk(s, {})) || {}).key || '';
  openModal(`<h2>⭐ 고객사 평가 입력</h2><div class="sub">고객사 담당자에게 받은 정기 평가(1~5점)를 옮겨 적습니다. 「고객 만족도」 영역 점수(평균 ÷ 5 × 100)에 들어갑니다.</div>
    <div class="grid2"><div class="field"><label>사업장</label><select id="csS">${SITE_LIST.filter(s => siteOk(s, {})).map(s => `<option value="${s.key}" ${s.key === c.site ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div><div class="field"><label>평가일</label><input type="date" id="csD" value="${c.d}"></div></div>
    ${CSAT_Q.map((q, i) => `<div class="field csq"><label>${i + 1}. ${esc(q)}</label><div class="seg" data-q="${i}">${[1, 2, 3, 4, 5].map(n => `<button type="button" data-v="${n}" aria-pressed="${+c.sc[i] === n}">${n}</button>`).join('')}</div></div>`).join('')}
    <div class="grid2"><div class="field"><label>평가자(고객사)</label><input id="csW" value="${esc(c.who)}" placeholder="예: 총무팀 김○○ 과장"></div><div class="field"><label>의견</label><input id="csC" value="${esc(c.cmt)}"></div></div>
    <div class="mrow">${old ? '<button class="btn warn" id="csDel">삭제</button>' : ''}<button class="btn" id="mClose">취소</button><button class="btn pri" id="csOk">저장</button></div>`, md => {
    const sc = c.sc.slice();
    md.querySelectorAll('.csq .seg').forEach(g => g.onclick = e => { const b = e.target.closest('button'); if (!b) return; sc[+g.dataset.q] = +b.dataset.v; g.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); });
    md.querySelector('#mClose').onclick = closeModal;
    if (md.querySelector('#csDel')) md.querySelector('#csDel').onclick = () => { if (!confirmBox('이 평가를 지울까요?')) return; delete PM.csat[id]; savePM(); queueShare(id, true); closeModal(); setTab(UI.tab); };
    md.querySelector('#csOk').onclick = () => {
      if (!sc.some(x => +x > 0)) return toast('한 항목 이상 점수를 고르세요');
      const nid = id || 'cs_' + uid(); PM.csat[nid] = Object.assign({}, old || {}, { id: nid, site: md.querySelector('#csS').value, d: md.querySelector('#csD').value || today(), sc, who: md.querySelector('#csW').value.trim(), cmt: md.querySelector('#csC').value.trim(), by: mgrName(), at: new Date().toISOString() });
      savePM(); queueShare(nid); closeModal(); toast('고객사 평가를 저장했습니다'); setTab(UI.tab); renderHeroStats();
    };
  }, true);
}

/* ---------- QR 점검 포인트 ---------- */
const chkUrl = (key, pt) => `${APP.shareUrl}?chk=${encodeURIComponent(key + '~' + pt)}`;
function qrRecentHtml(F, r) {
  const L = []; Object.entries(PM.chk || {}).forEach(([k, c]) => { if (!siteOk(SITE[k], F)) return; (c.log || []).forEach(l => { const d = l.at.slice(0, 10); if (d >= r.from && d <= r.to) L.push(Object.assign({ site: k, pn: ((c.pts || []).find(p => p.id === l.pt) || { n: l.pt }).n }, l)); }); });
  L.sort((a, b) => b.at.localeCompare(a.at));
  return L.length ? `<div class="tblw" style="max-height:260px"><table class="t"><thead><tr><th>시각</th><th style="text-align:left">사업장 · 지점</th><th>근무자</th></tr></thead><tbody>${L.slice(0, 60).map(l => `<tr><td class="c">${esc(l.at.slice(5, 16).replace('T', ' '))}</td><td>${esc(SITE[l.site] ? SITE[l.site].name : l.site)} · <b>${esc(l.pn)}</b></td><td class="c">${esc(l.by || '-')}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">이 기간 QR 확인 기록이 없습니다.</div>';
}
function openQrPts(key) {
  const s = SITE[key]; if (!s) return; const c = PM.chk[key] = PM.chk[key] || { pts: [], log: [] };
  openModal(`<h2>📍 QR 점검 포인트 — ${esc(s.name)}</h2><div class="sub">지점을 등록하고 QR을 출력해 현장에 붙이세요. QR을 찍으면 ${esc(APP.shareUrl.replace(/^https:\/\//, ''))} 가 열리고 지점·시각이 기록됩니다(로그인한 기기는 계정에 함께 저장).</div>
    <div class="grid2"><div class="field"><label>지점 이름</label><input id="qN" placeholder="예: 후문 외곽 펜스 · 본관 2층 남자화장실 · 기계실"></div><div class="field"><label>업종</label><select id="qJ">${s.jobs.map(j => `<option value="${j}">${JOBS[j].n}</option>`).join('')}</select></div></div>
    <div class="row"><button class="btn pri" id="qAdd">＋ 지점 추가</button>${c.pts.length ? '<button class="btn bf" style="color:#fff;border:0" id="qPdf">🖨 QR 출력(PDF)</button>' : ''}</div>
    <div class="tblw" style="max-height:40vh;margin-top:10px"><table class="t"><thead><tr><th>QR</th><th style="text-align:left">지점</th><th>업종</th><th>최근 확인</th><th>누적</th><th></th></tr></thead><tbody>${c.pts.map(p => { const lg = c.log.filter(l => l.pt === p.id); return `<tr><td class="c"><span class="qrm" data-qr="${esc(chkUrl(key, p.id))}"></span></td><td><b>${esc(p.n)}</b></td><td class="c">${JOBS[p.job] ? JOBS[p.job].s : ''}</td><td class="c">${lg.length ? esc(lg[lg.length - 1].at.slice(5, 16).replace('T', ' ')) : '-'}</td><td class="n">${lg.length}</td><td class="c"><button class="btn sm warn" data-qdel="${p.id}">삭제</button></td></tr>`; }).join('') || '<tr><td colspan="6" class="empty">등록된 지점이 없습니다</td></tr>'}</tbody></table></div>
    <div class="mrow"><button class="btn" id="mClose">닫기</button></div>`, md => {
    md.querySelectorAll('[data-qr]').forEach(el => makeQR(el, el.dataset.qr, 54));
    md.querySelector('#mClose').onclick = () => { closeModal(); setTab(UI.tab); };
    md.querySelector('#qAdd').onclick = () => { const n = md.querySelector('#qN').value.trim(); if (!n) return toast('지점 이름을 입력하세요'); c.pts.push({ id: 'p' + uid().slice(-6), n, job: md.querySelector('#qJ').value }); savePM(); openQrPts(key); };
    md.querySelectorAll('[data-qdel]').forEach(b => b.onclick = () => { if (!confirmBox('이 지점을 지울까요? (확인 기록은 남습니다)')) return; c.pts = c.pts.filter(p => p.id !== b.dataset.qdel); savePM(); openQrPts(key); });
    if (md.querySelector('#qPdf')) md.querySelector('#qPdf').onclick = () => qrSheetPdf(key);
  }, true);
}
async function qrSheetPdf(key) {
  const s = SITE[key], pts = (PM.chk[key] || {}).pts || []; if (!pts.length) return;
  busy(true, 'QR 출력물을 만드는 중…');
  try {
    const host = $('#render'); host.innerHTML = ''; const pages = [];
    for (let i = 0; i < pts.length; i += 6) {
      const pg = document.createElement('div'); pg.style.cssText = `width:${PW}px;height:${PH}px;background:#fff;padding:40px 36px;box-sizing:border-box;font-family:Pretendard,'Malgun Gothic',sans-serif;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(3,1fr);gap:18px`;
      pts.slice(i, i + 6).forEach(p => {
        const q = qrcode(0, 'M'); q.addData(chkUrl(key, p.id)); q.make();
        const c = document.createElement('div'); c.style.cssText = 'border:2px solid #0B1F8A;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:10px;text-align:center';
        c.innerHTML = `<div style="font-size:13px;color:#1B7A34;font-weight:800">${esc(s.name)} · ${JOBS[p.job] ? JOBS[p.job].n : ''}</div><img src="${q.createDataURL(6, 8)}" style="width:190px;height:190px;image-rendering:pixelated"><div style="font-size:20px;font-weight:900;color:#0F1530">📍 ${esc(p.n)}</div><div style="font-size:11px;color:#5B6475">점검할 때 휴대폰 카메라로 찍어 주세요 — 지점·시각이 기록됩니다</div><div style="font-size:9px;color:#8A93A6">${esc(APP.name)} · Designed &amp; Developed by ${esc(APP.maker)}</div>`;
        pg.appendChild(c);
      });
      host.appendChild(pg); pages.push(pg);
    }
    await Promise.all([...host.querySelectorAll('img')].map(i => i.decode ? i.decode().catch(() => { }) : 0));
    const { jsPDF } = window.jspdf, pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [PW, PH], compress: true, hotfixes: ['px_scaling'] });
    for (let i = 0; i < pages.length; i++) { const cv = await html2canvas(pages[i], { scale: 1.6, backgroundColor: '#ffffff', logging: false }); if (i) pdf.addPage([PW, PH], 'portrait'); pdf.addImage(cv.toDataURL('image/jpeg', .9), 'JPEG', 0, 0, PW, PH); }
    host.innerHTML = ''; await download(pdf.output('blob'), `${fileStamp()}_${safeName(s.name)}_QR점검포인트.pdf`); toast('QR 출력물을 만들었습니다');
  } catch (e) { console.error(e); toast('만들지 못했습니다: ' + (e.message || e)); } finally { busy(false); }
}
function handleChkScan() {
  let v = ''; try { v = new URLSearchParams(location.search).get('chk') || ''; } catch (e) { }
  if (!v) return; try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) { }
  const [key, pt] = v.split('~'), s = SITE[key], c = (PM.chk || {})[key], p = c && (c.pts || []).find(x => x.id === pt);
  if (!s) return toast('QR 지점을 찾지 못했습니다 — 사업장 설정을 확인하세요', 5000);
  PM.chk[key] = PM.chk[key] || { pts: [], log: [] };
  const by = mgrName(), at = kstStamp(), last = PM.chk[key].log.slice(-1)[0];
  if (last && last.pt === pt && (new Date(at) - new Date(last.at)) < 60000) return toast('방금 기록한 지점입니다');
  PM.chk[key].log.push({ id: uid(), pt, at, by }); PM.chk[key].log = PM.chk[key].log.slice(-3000); savePM();
  setTimeout(() => openModal(`<h2>✅ 점검 확인 기록</h2><div class="sub" style="font-size:15px"><b>${esc(s.name)}</b> · 📍 ${esc(p ? p.n : pt)}<br>${esc(at.slice(0, 16).replace('T', ' '))} ${by ? '· ' + esc(by) : '· 「성과 담당」을 정하면 근무자 이름도 함께 남습니다'}</div><p class="hint">이 기록은 3단계 증빙(QR·시간 자동기록)으로 성과 현황·보고서에 반영됩니다.</p><div class="mrow"><button class="btn pri" id="mClose">확인</button></div>`, md => md.querySelector('#mClose').onclick = closeModal), 600);
}

/* ---------- KPI 기본 가중치 · 데이터 품질 점검 ---------- */
function openKpiW() {
  const W = kpiW();
  openModal(`<h2>🎯 통합 성과점수 기본 가중치</h2><div class="sub">기획안 5장 초기 시범운영 예시값(25·25·20·15·10·5)입니다. 현장 특성·계약 범위·측정 가능성에 따라 조정하고, 산식은 고객사와 미리 합의하세요. 사업장별 계약 가중치는 사업장 설정에서 따로 정합니다.</div>
    ${Object.keys(SPI_W).map(k => `<div class="field"><label>${SPI_N[k][0]} <small class="hint">— ${esc(SPI_N[k][1])}</small></label><input type="number" min="0" max="100" data-w="${k}" value="${W[k]}"></div>`).join('')}
    <p class="hint" id="kwSum"></p>
    <div class="mrow"><button class="btn" id="kwReset">기획안 기본값</button><button class="btn" id="mClose">취소</button><button class="btn pri" id="kwOk">저장</button></div>`, md => {
    const sum = () => { const t = [...md.querySelectorAll('[data-w]')].reduce((a, i) => a + (+i.value || 0), 0); md.querySelector('#kwSum').textContent = `합계 ${t}점 — 합계가 100이 아니어도 비율로 100점 환산합니다.`; };
    md.querySelectorAll('[data-w]').forEach(i => i.oninput = sum); sum();
    md.querySelector('#mClose').onclick = closeModal;
    md.querySelector('#kwReset').onclick = () => { PM.kpiW = null; savePM(); closeModal(); setTab(UI.tab); renderHeroStats(); toast('기획안 기본값으로 되돌렸습니다'); };
    md.querySelector('#kwOk').onclick = () => { const o = {}; md.querySelectorAll('[data-w]').forEach(i => o[i.dataset.w] = Math.max(0, +i.value || 0)); if (!Object.values(o).some(Boolean)) return toast('한 영역 이상 배점을 넣으세요'); PM.kpiW = o; savePM(); closeModal(); setTab(UI.tab); renderHeroStats(); toast('가중치를 저장했습니다'); };
  });
}
function dataIssues() {
  const out = [], td = today(), wkAgo = isoD(addDays(kstNow(), -7));
  Object.values(PM.recs).forEach(x => {
    const s = SITE[x.site]; if (!s) { out.push(['고아 기록', x.d, x.site, `사업장 목록에 없는 기록(${x.job})`, x]); return; }
    if (x.d > td) out.push(['미래 날짜', x.d, s.name, `${JOBS[x.job] ? JOBS[x.job].s : x.job} 기록이 오늘 이후 날짜입니다`, x]);
    Object.entries(x.q || {}).forEach(([k, v]) => { const t = TASK[k]; if (!t || t.per === 'm') return; const pl = planOf(x.site, k), au = AUTO_N[k] ? AUTO_N[k] * Math.max(1, siteHeads(s, x.job)) : 0, base = pl || au; if (base && +v > base * 3 && +v > 5) out.push(['비정상 수량', x.d, s.name, `${t.n} ${nf(v)}${t.u} — 기준(${nf(base)})의 3배 초과`, x]); if ((t.k === 'score') && +v > 100) out.push(['비정상 점수', x.d, s.name, `${t.n} ${v} — 100 초과`, x]); });
    if (!x.sample && !x.st && x.d < wkAgo) out.push(['확인 누락', x.d, s.name, '관리자 확인 없이 7일 넘게 지난 기록', x]);
  });
  Object.values(PM.iss).forEach(i => { if (overdue(i)) out.push(['미조치 지연', i.d, SITE[i.site] ? SITE[i.site].name : i.site, `${i.title} — 예정일 ${fmtDs(i.due)} 지남`, null, i.id]); if (i.st === 'done' && !i.action) out.push(['조치 내용 누락', i.d, SITE[i.site] ? SITE[i.site].name : i.site, `${i.title} — 완료인데 조치 내용이 비어 있음`, null, i.id]); });
  Object.entries(PM.exc).forEach(([k, L]) => L.forEach((a, i) => L.slice(i + 1).forEach(b => { if (a.from <= b.to && b.from <= a.to && (!a.job || !b.job || a.job === b.job)) out.push(['사유 기간 겹침', a.from, SITE[k] ? SITE[k].name : k, `${fmtDs(a.from)}~${fmtDs(a.to)} 과 ${fmtDs(b.from)}~${fmtDs(b.to)}`, null]); })));
  return out.sort((a, b) => b[1].localeCompare(a[1]));
}
function openDataCheck() {
  const L = dataIssues(), by = {}; L.forEach(x => by[x[0]] = (by[x[0]] || 0) + 1);
  openModal(`<h2>🩺 데이터 품질 점검</h2><div class="sub">중복·누락·비정상 기록을 찾았습니다. 줄을 누르면 해당 기록으로 갑니다. KPI 산식과 자료 출처는 보고서 「산출 기준」에 함께 표시됩니다.</div>
    <div class="chips" style="margin-bottom:8px">${Object.entries(by).map(([k, n]) => `<span class="chip">${esc(k)} <b>${n}</b></span>`).join('') || '<span class="chip">문제 없음 ✔</span>'}</div>
    <div class="tblw" style="max-height:56vh"><table class="t"><thead><tr><th>구분</th><th>일자</th><th style="text-align:left">사업장</th><th style="text-align:left">내용</th></tr></thead><tbody>${L.slice(0, 400).map((x, i) => `<tr class="clk" data-dq="${i}"><td class="c">${esc(x[0])}</td><td class="c">${fmtDs(x[1])}</td><td>${esc(x[2])}</td><td>${esc(x[3])}</td></tr>`).join('') || '<tr><td colspan="4" class="empty">찾은 문제가 없습니다</td></tr>'}</tbody></table></div>
    <div class="mrow"><button class="btn pri" id="mClose">닫기</button></div>`, md => {
    md.querySelector('#mClose').onclick = closeModal;
    md.querySelectorAll('[data-dq]').forEach(tr => tr.onclick = () => { const x = L[+tr.dataset.dq]; closeModal(); if (x[5]) return openIssue(x[5]); if (x[4] && SITE[x[4].site]) { V.entry.site = x[4].site; V.entry.job = x[4].job; V.entry.d = x[4].d; setTab('entry'); } });
  }, true);
}

/* ---------- 🏢 고객사 화면(성과 조회) ---------- */
function openClientView(siteKey) {
  const F = curF(), per = UI.per || 'm', ref = UI.ref || today(), r = periodRange(per, ref), pr = prevRange(per, ref);
  const cand = sitesFiltered(F); let key = siteKey || F.site;
  if (!key || !SITE[key]) { const A0 = aggregate(r, F); key = Object.keys(A0.sites)[0] || (cand[0] || {}).key; }
  const s = SITE[key]; if (!s) return toast('사업장을 먼저 고르세요');
  const Fs = { site: key }, A = aggregate(r, Fs), P = aggregate(pr, Fs), g = A.spi ? gradeOf(A.spi.total) : ['-', '-', '#667089'];
  const dS = A.spi && P.spi ? A.spi.total - P.spi.total : null;
  const top = Object.values(A.tasks).filter(T => T.act > 0 && TASK[T.id] && TASK[T.id].k !== 'score' && TASK[T.id].k !== 'avg' && COUNT_U.includes(TASK[T.id].u)).sort((a, b) => b.act - a.act).slice(0, 8);
  const jobs = [...new Set(A.recs.map(x => x.job))];
  openModal(`<div class="cv"><div class="cvh"><img src="${ASSET.icon}" alt=""><div><small>${esc(APP.org || '에스텍')} · 고객사 성과 조회</small><h2>${esc(s.name)}</h2><span>${esc(r.label)} · ${s.jobs.map(j => JOBS[j].n).join(' · ')}</span></div>
      <select id="cvS">${cand.map(x => `<option value="${x.key}" ${x.key === key ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div>
    ${A.sampleN ? '<div class="sbn">🧪 <b>예시 데이터</b> — 실제 운영 성과가 아닙니다.</div>' : ''}
    <div class="cvg"><div class="cvs" style="--c:${g[2]}"><small>종합 성과점수</small><b>${A.spi ? nf(A.spi.total, 1) : '-'}</b><span class="gr" style="background:${g[2]}">${g[0]} ${g[1]}</span><em>${dS == null ? '전기 자료 없음' : `전기 대비 ${dS >= 0 ? '▲' : '▼'} ${nf(Math.abs(dS), 1)}점`}</em></div>
      <div class="kpis" style="margin:0">
        <div class="kpi" style="--c:#E8750A"><small>업무 수행률</small><b>${pct(A.rate)}</b><span>${A.plan ? `계획 ${nf(A.plan)} · 수행 ${nf(A.planAct)}` : '-'}</span></div>
        <div class="kpi" style="--c:#1B7A34"><small>품질점수</small><b>${A.spi && A.spi.parts.quality != null ? nf(A.spi.parts.quality, 1) : '-'}</b><span>품질점검·자체 평가</span></div>
        <div class="kpi" style="--c:#C0392B"><small>예방·개선 실적</small><b>${nf(A.prevN + A.riskDone + A.evBy.imp.length)}<small style="display:inline;font-size:13px"> 건</small></b><span>예방 ${nf(A.prevN)} · 위험요소 조치 ${A.riskDone} · 개선 ${A.evBy.imp.length}</span></div>
        <div class="kpi" style="--c:#0E7C86"><small>민원 해결률</small><b>${A.cmpRate == null ? '-' : pct(A.cmpRate)}</b><span>${A.cmpN ? `${A.cmpN}건 중 ${A.cmpDone}건${A.cmpDays != null ? ` · 평균 ${nf(A.cmpDays, 1)}일` : ''}` : '접수 0건'}</span></div>
      </div></div>
    <div class="two" style="margin-top:12px">
      <div class="card"><h2>👷 직군별 성과</h2><div class="body"><table class="t"><thead><tr><th style="text-align:left">직군</th><th>업무량</th><th>수행률</th><th>점수</th><th>등급</th></tr></thead><tbody>${jobs.map(j => { const B = aggregate(r, { site: key, job: j }), gg = gradeOf(B.spi && B.spi.total); return `<tr><td>${JOBS[j].ic} ${JOBS[j].n}</td><td class="n">${nf(B.act)}</td><td class="n">${pct(B.rate)}</td><td class="n"><b>${B.spi ? nf(B.spi.total, 1) : '-'}</b></td><td class="c"><span class="gr" style="background:${gg[2]}">${gg[0]}</span></td></tr>`; }).join('') || '<tr><td colspan="5" class="empty">기록 없음</td></tr>'}</tbody></table></div></div>
      <div class="card"><h2>🔁 주요 활동</h2><div class="body"><table class="t" style="width:100%"><tbody>${top.map(T => `<tr><td>${JOBS[TASK[T.id].job].ic} ${esc(TASK[T.id].n)}</td><td class="n"><b>${nf(T.act)}</b> ${TASK[T.id].u}</td></tr>`).join('') || '<tr><td class="empty">기록 없음</td></tr>'}</tbody></table></div></div>
    </div>
    <div class="card"><h2>🛠 미조치 사항 <span class="r">${A.issOpen.length}건 · 담당·예정일·진행상태</span></h2><div class="body">${issTableHtml(A.issOpen, true)}</div></div>
    <div class="card"><h2>✨ 이번 기간 「보이지 않는 성과」</h2><div class="body"><ul class="hl">${highlights(A, 8).map(h => `<li>${esc(h)}</li>`).join('') || '<li>기록이 없습니다</li>'}</ul></div></div>
    <div class="row" style="justify-content:space-between;align-items:center"><small class="hint">근무자 개인정보·내부 인사정보는 표시하지 않습니다 · 산출 기준: 통합 성과점수 ${Object.keys(SPI_W).map(k => SPI_N[k][0] + ' ' + kpiW(Fs)[k]).join(' · ')}</small>
      <div class="row"><button class="btn bw" style="color:#fff;border:0" id="cvW">⬇ 성과보고서 Word</button><button class="btn bf" style="color:#fff;border:0" id="cvP">⬇ PDF</button><button class="btn pri" id="mClose">닫기</button></div></div>
    </div>`, md => {
    md.querySelector('#mClose').onclick = closeModal;
    md.querySelector('#cvS').onchange = e => openClientView(e.target.value);
    const go = k => { const m = UI.mask; UI.mask = true; outContract(r, { site: key }, k).finally(() => { UI.mask = m; }); };
    md.querySelector('#cvW').onclick = () => go('docx'); md.querySelector('#cvP').onclick = () => go('pdf');
  }, 2);
}

/* ---------- 계약·재계약 지원 성과보고서 (기획안 7장) ---------- */
function contractBlocks(s, r, F) {
  const Fs = Object.assign({}, F, { site: s.key }), A = aggregate(r, Fs), per = daysIn(r) > 200 ? 'y' : daysIn(r) > 40 ? 'q' : 'm';
  const pr = prevRange(per === 'q' && UI.per !== 'q' ? 'q' : (UI.per || per), UI.ref || today()), P = aggregate(pr, Fs), mk = UI.mask, nm = x => mk ? maskName(x) : (x || '');
  const g = A.spi ? gradeOf(A.spi.total) : ['-', '-']; const T = planText(s.key, r, F.job, A), B = [];
  const jobs = [...new Set(A.recs.map(x => x.job))].length ? [...new Set(A.recs.map(x => x.job))] : s.jobs;
  B.push({ k: 'title', t: `${periodTitle(r)} 운영성과 보고서\n— 서비스 가치 데이터 증명 —`, sub: `${s.name} · ${siteOrgLabel(s)} · 계약·재계약 검토 자료` });
  B.push({ k: 'info', rows: [['고객사(사업장)', s.name, '수행 조직', siteOrgLabel(s)], ['대상 기간', `${fmtDs(r.from)} ~ ${fmtDs(r.to)}`, '작성일', fmtD(kstNow())], ['통합 성과점수', A.spi ? `${nf(A.spi.total, 1)}점 (${g[0]} ${g[1]})` : '-', '전기 대비', A.spi && P.spi ? `${A.spi.total - P.spi.total >= 0 ? '▲' : '▼'} ${nf(Math.abs(A.spi.total - P.spi.total), 1)}점` : '-']] });
  B.push({ k: 'box', title: '핵심 요약 — 「눈에 보이지 않는 노력까지 데이터로 증명」', items: highlights(A, 8) });
  // Ⅰ
  B.push({ k: 'h', t: 'Ⅰ. 운영 개요' });
  B.push({ k: 'table', head: ['업종(직군)', '투입 인원', '근무형태', '관리 업무 항목', '관리 대상'], w: [1.3, .9, 1.3, 1, 2.2], align: ['c', 'r', 'c', 'r', ''], rows: jobs.map(j => [JOBS[j].n, siteHeads(s, j) + '명', s.shift || '-', tasksFor(j, s.ind, s.key).length + '개', j === 'cln' && s.area ? `관리 면적 ${nf(s.area)}㎡` : j === 'fac' ? '건축·전기·기계·소방 설비' : j === 'sec' ? '출입통제·순찰·취약지역' : j === 'prk' ? '입출차·주차 질서' : j === 'info' ? '방문객·전화 응대' : '사무 지원'] ) });
  // Ⅱ
  B.push({ k: 'h', t: 'Ⅱ. 업무 실적' });
  B.push({ k: 'table', head: ['직군', '업무 수행량', '계획 대비 수행률', '예방·적발', '사건 대응', '업무개선'], w: [1.2, 1, 1.1, 1, 1, 1], align: ['c', 'r', 'r', 'r', 'r', 'r'], rows: jobs.map(j => { const J = aggregate(r, Object.assign({}, Fs, { job: j })); return [JOBS[j].n, nf(J.act), pct(J.rate), nf(J.prevN), nf(J.incidents), nf(J.evBy.imp.length + J.impIss)]; }).concat([{ tot: true, cells: ['합계', nf(A.act), pct(A.rate), nf(A.prevN), nf(A.incidents), nf(A.evBy.imp.length + A.impIss)] }]) });
  B.push({ k: 'table', head: ['직군', '업무 항목', '단위', '계획', '실적', '수행률', '환산가치(원)'], w: [.7, 2.6, .6, .9, .9, .9, 1.2], align: ['c', '', 'c', 'r', 'r', 'r', 'r'], size: 15, rows: catRows(A, 6) });
  if (A.autoN) B.push({ k: 'p', t: `※ 직접 입력·확인 ${A.manN}건 외 ${A.autoN}건(직군·일 단위)은 투입 인원·근무형태·산업 기준 표준 업무량으로 산출한 값입니다(산출 기준 참고).`, size: 16, color: C.gray });
  // Ⅲ
  B.push({ k: 'h', t: 'Ⅲ. 주요 성과 — 위험 감소·운영 안정성' });
  const rk = A.iss.filter(i => i.kind === 'risk' || i.kind === 'fault');
  B.push({ k: 'p', t: `위험요소·시설 이상징후 사전 발견 ${A.riskN}건 · 조치 완료 ${A.riskDone}건 · 위험도 가중 조치율 ${pct(A.riskRate)}${A.riskExt ? ` · 외부요인(노후·외부 충격 등) ${A.riskExt}건 별도 구분` : ''}. 예방·적발 활동 ${nf(A.prevN)}건, 사건사고 대응 ${A.incidents}건${A.unresolved ? `(조치 진행 ${A.unresolved}건)` : '(전건 조치 완료)'}.` });
  if (rk.length) B.push({ k: 'table', head: ['발견일', '구분', '위험도', '내용', '조치·재발방지', '처리', '원인'], w: [.8, 1, .6, 2, 2.2, .6, .9], align: ['c', 'c', 'c', '', '', 'r', 'c'], size: 15, rows: rk.slice(0, 20).map(i => [fmtDs(i.d).slice(5), ISS_K[i.kind].n, (ISS_RISK[i.risk] || ISS_RISK.M)[0], i.title + (i.loc ? ` (${i.loc})` : ''), i.action || ISS_ST[i.st][0], issDays(i) == null ? '-' : issDays(i) + '일', i.cause === 'ext' ? '외부요인' : '내부']) });
  const ims = A.evBy.imp.concat(A.evBy.work).slice(0, 10);
  if (ims.length) B.push({ k: 'table', head: ['일자', '구분', '개선·작업 내용', '개선 전 → 후'], w: [.8, 1, 2.6, 2.6], align: ['c', 'c', '', ''], size: 15, rows: ims.map(e => [fmtDs(e.d).slice(5), EVT[e.t].n, e.title, e.before || e.after ? `${e.before || '-'} → ${e.after || '-'}` : (e.desc || '')]) });
  // Ⅳ
  B.push({ k: 'h', t: 'Ⅳ. 서비스 품질' });
  B.push({ k: 'table', head: ['지표', '전기', '당기', '증감'], w: [2.2, 1.2, 1.2, 1.2], align: ['', 'r', 'r', 'r'], rows: [['통합 성과점수', P.spi ? nf(P.spi.total, 1) : '-', A.spi ? nf(A.spi.total, 1) : '-', A.spi && P.spi ? nf(A.spi.total - P.spi.total, 1) : '-'], ['계획 대비 수행률(%)', pct(P.rate), pct(A.rate), A.rate != null && P.rate != null ? nf(A.rate - P.rate, 1) + 'p' : '-'], ['품질점검·자체평가(점)', P.spi && P.spi.parts.quality != null ? nf(P.spi.parts.quality, 1) : '-', A.spi && A.spi.parts.quality != null ? nf(A.spi.parts.quality, 1) : '-', '-'], ['민원 해결률(%)', pct(P.cmpRate), pct(A.cmpRate), '-'], ['고객사 평가(100점 환산)', P.csat == null ? '-' : nf(P.csat, 1), A.csat == null ? '-' : nf(A.csat, 1), A.csat != null && P.csat != null ? nf(A.csat - P.csat, 1) : '-']] });
  if (A.csatL.length) B.push({ k: 'table', head: ['평가일'].concat(CSAT_Q).concat(['평균']), w: [.8].concat(CSAT_Q.map(() => 1)).concat([.7]), align: Array(7).fill('c'), size: 15, rows: A.csatL.map(c => [fmtDs(c.d).slice(2)].concat(CSAT_Q.map((q, i) => c.sc[i] || '-')).concat([nf(csatAvg(c), 2)])) });
  B.push({ k: 'p', t: `민원·고객사 요청 ${A.cmpN}건 접수 · ${A.cmpDone}건 해결${A.cmpDays != null ? ` · 평균 처리 ${nf(A.cmpDays, 1)}일` : ''}${A.qc != null ? ` · 운영실태·품질점검 ${nf(A.qc, 1)}점` : ''}.` });
  // Ⅴ
  B.push({ k: 'h', t: 'Ⅴ. 개선 및 향후 계획' });
  if (A.issOpen.length) B.push({ k: 'table', head: ['접수일', '구분', '내용', '담당', '예정일', '상태'], w: [.8, 1, 2.8, 1, .8, .7], align: ['c', 'c', '', 'c', 'c', 'c'], size: 15, rows: A.issOpen.slice(0, 15).map(i => [fmtDs(i.d).slice(5), ISS_K[i.kind].n, i.title, nm(i.owner), i.due ? fmtDs(i.due).slice(5) : '-', ISS_ST[i.st][0]]) });
  else B.push({ k: 'p', t: '기간 말 현재 미조치 사항 없음.' });
  const goal = v => v == null ? null : Math.min(100, Math.max(95, Math.ceil(v)));
  B.push({ k: 'table', head: ['구분', '내용'], w: [1.2, 6], align: ['c', ''], rows: [['차기 업무 계획', T.next], ['차기 목표', [A.rate != null ? `계획 대비 수행률 ${goal(A.rate)}% 이상` : '', `위험요소 조치율 ${goal(A.riskRate) || 95}% 이상 · 민원 해결률 100% · 평균 처리 1일 이내`, A.spi ? `통합 성과점수 ${nf(Math.min(100, Math.max(A.spi.total + 2, 90)), 0)}점(${gradeOf(Math.min(100, Math.max(A.spi.total + 2, 90)))[0]}) 이상` : ''].filter(Boolean).join('\n')], ['반성 및 대책', T.reflect]] });
  // 산출 기준 · 증빙
  B.push({ k: 'h', t: '붙임 1. 통합 성과점수 산출 기준' });
  B.push({ k: 'table', head: ['평가 영역', '배점', '측정 자료', '영역 점수', '반영 점수'], w: [1.4, .6, 2.8, .9, .9], align: ['', 'c', '', 'r', 'r'], size: 15, rows: spiRows(A).map(x => [x.n, x.w, x.d, x.v == null ? '측정 자료 없음(제외)' : nf(x.v, 1), x.got == null ? '-' : nf(x.got, 1)]).concat([{ tot: true, cells: ['합계', Object.values(kpiW(Fs)).reduce((a, b) => a + b, 0), '측정 영역 배점 비율로 100점 환산', '', A.spi ? nf(A.spi.total, 1) : '-'] }]) });
  B.push({ k: 'p', t: '등급: S 95점 이상(탁월) · A 90~94(우수) · B 80~89(양호) · C 70~79(개선 필요) · D 70 미만(집중 관리). 평가기준·산식·측정주기·예외처리 기준은 고객사와 사전 합의한 기준을 따릅니다.', size: 16, color: C.gray });
  B.push({ k: 'h', t: '붙임 2. 증빙 현황 및 자료 출처' });
  B.push({ k: 'table', head: ['증빙 단계', '내용', '기록 수'], w: [1, 3, 1], align: ['c', '', 'r'], rows: [['자동 산출', '투입 인원·근무형태·산업 기준 표준 업무량(현장 확인 후 조정)', nf(A.autoN)]].concat(EVI.map(([n, t], i) => [n + '단계', t, nf(A.evi[n])])).concat([['QR 확인', '지정 장소 방문 시각 자동 기록', nf(A.chkN) + '회'], ['업무 영향 사유', '고객사 요청·작업 중지·출입 제한 등 — 계획에서 제외', nf(A.excN) + '일']]) });
  B.push({ k: 'box', title: '재계약 협의 요지', items: [`당사는 지난 ${perWord(r) === '연간' ? '1년' : '기간'} 동안 단순히 인력을 배치한 것이 아니라, 총 ${nf(A.act)}건의 업무와 ${nf(A.prevN + A.riskN)}건의 예방·점검 활동, ${nf(A.evBy.imp.length + A.evBy.work.length + A.impIss)}건의 개선활동을 수행하였으며, 업무 수행률 ${pct(A.rate)}${A.cmpRate != null ? `, 민원 해결률 ${pct(A.cmpRate)}` : ''}${A.spi ? `, 통합 성과점수 ${nf(A.spi.total, 1)}점(${g[0]})` : ''}의 성과를 달성하였습니다.`, '이러한 운영성과를 바탕으로 차기에도 동일한 수준 이상의 서비스 품질을 제공하고자 합니다.'] });
  if (A.sampleN) B.push({ k: 'p', t: '※ 이 보고서에는 예시 데이터가 포함되어 있습니다 — 실제 성과로 제출하지 마세요.', color: 'C0392B' });
  return B;
}
async function outContract(r, F, kind) {
  const list = F.site ? [SITE[F.site]].filter(Boolean) : recSitesIn(r, F);
  if (!list.length) return toast('이 범위에 기록된 사업장이 없습니다');
  busy(true, `성과보고서 만드는 중… (${list.length}개 사업장)`);
  let B = []; list.forEach((s, i) => { if (i) B.push({ k: 'pb' }); B = B.concat(contractBlocks(s, r, F)); });
  const nm = `${fileStamp()}_${safeName(list.length === 1 ? list[0].name : scopeLabel(F))}_${periodTitle(r).replace(/[()\s]/g, '')}_운영성과보고서${UI.mask ? '_고객사제출용' : ''}`;
  try {
    if (kind === 'pdf') await download(await blocksToPdf(B, nm), nm + '.pdf');
    else await download(await packDocx(blocksToDocx(B), nm), nm + '.docx');
    toast('성과보고서를 만들었습니다');
  } finally { busy(false); }
}
async function outIssXlsx(r, F) {
  busy(true, '관리대장 만드는 중…');
  try {
    const A = aggregate(r, F), map = new Map(); A.iss.concat(A.issOpen).forEach(i => map.set(i.id, i));
    const L = [...map.values()].sort((a, b) => a.d.localeCompare(b.d));
    const wb = new ExcelJS.Workbook(), head = ['No', '접수일', '구분', '위험도', '사업장', '업종', '내용', '장소', '담당', '예정일', '상태', '완료일', '처리일수', '원인 구분', '근무자', '조치·재발방지'];
    const sheet = (nmS, rows, t) => { const ws = wb.addWorksheet(nmS); xlTitle(ws, t, `${r.label} · ${scopeLabel(F)} · ${APP.name} — Designed & Developed by ${APP.maker}`, head.length); xlHead(ws, 4, head); rows.forEach((i, n) => xlRow(ws, 5 + n, [n + 1, i.d, ISS_K[i.kind].n, (ISS_RISK[i.risk] || ISS_RISK.M)[0], SITE[i.site] ? SITE[i.site].name : i.site, JOBS[i.job] ? JOBS[i.job].s : '', i.title, i.loc, i.owner, i.due, ISS_ST[i.st][0], i.doneD, issDays(i), ISS_CAUSE[i.cause] || '', i.worker, i.action], { center: [0, 1, 2, 3, 5, 9, 10, 11, 13], fill: overdue(i) ? 'FFFDECEA' : undefined })); [5, 11, 9, 7, 22, 7, 34, 14, 12, 11, 7, 11, 8, 16, 12, 40].forEach((w, k) => ws.getColumn(k + 1).width = w); ws.views = [{ state: 'frozen', ySplit: 4 }]; return ws; };
    sheet('관리대장', L, '개선·조치·민원 관리대장');
    sheet('미조치', A.issOpen, '미조치 사항 (기간 말 현재)');
    const w3 = wb.addWorksheet('요약'); xlTitle(w3, '개선·조치·민원 요약', r.label, 4); xlHead(w3, 4, ['지표', '값', '', '비고']);
    [['위험요소·시설 이상 발견', A.riskN, '', ''], ['조치 완료', A.riskDone, '', ''], ['위험도 가중 조치율(%)', A.riskRate == null ? null : +A.riskRate.toFixed(1), '', '상 3 · 중 2 · 하 1 가중'], ['외부요인 구분 건', A.riskExt, '', '노후·외부 충격·전력 등'], ['민원·요청 접수', A.cmpN, '', ''], ['해결', A.cmpDone, '', ''], ['해결률(%)', A.cmpRate == null ? null : +A.cmpRate.toFixed(1), '', ''], ['평균 처리일', A.cmpDays == null ? null : +A.cmpDays.toFixed(1), '', ''], ['고객사 평가(100점)', A.csat == null ? null : +A.csat.toFixed(1), '', '평균 ÷ 5 × 100']].forEach((x, n) => xlRow(w3, 5 + n, x)); w3.getColumn(1).width = 28; w3.getColumn(2).width = 14; w3.getColumn(4).width = 30;
    const w4 = wb.addWorksheet('고객사 평가'); const h4 = ['평가일', '사업장'].concat(CSAT_Q).concat(['평균', '100점 환산', '평가자', '의견']); xlTitle(w4, '고객사 평가(만족도)', r.label, h4.length); xlHead(w4, 4, h4);
    A.csatL.forEach((c, n) => xlRow(w4, 5 + n, [c.d, SITE[c.site] ? SITE[c.site].name : c.site].concat(CSAT_Q.map((q, i) => +c.sc[i] || null)).concat([+csatAvg(c).toFixed(2), +(csatAvg(c) * 20).toFixed(1), c.who, c.cmt]), { center: [0] })); h4.forEach((x, k) => w4.getColumn(k + 1).width = k === 1 ? 22 : k > 8 ? 24 : 12);
    await xlSave(wb, `${fileStamp()}_${safeName(scopeLabel(F))}_${periodTitle(r).replace(/[()\s]/g, '')}_개선조치민원_관리대장.xlsx`); toast('관리대장을 만들었습니다');
  } catch (e) { console.error(e); toast('만들지 못했습니다: ' + (e.message || e)); } finally { busy(false); }
}
