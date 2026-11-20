/* =====================================================================
 * 출력 — 엑셀 실적표 · Word 월말보고 · PPT 발표자료 · PDF · 운영실태·품질점검 보고서
 *  하나의 문서 모델(블록)을 Word와 PDF로, 하나의 슬라이드 모델을 PPT와 PDF로 그립니다.
 * Designed & Developed by Rat Rae Choi
 * ===================================================================== */
const C = { navy: '0B1F8F', navyD: '07124F', green: '1E8B3A', greenD: '17552F', brick: 'E34234', silver: 'C9CED6', silverL: 'EEF1F5', ink: '1C2333', gray: '5B6475', white: 'FFFFFF', tint: 'F4F6FB', tintG: 'EEF7F1', line: 'BFC6D4', amber: 'D98E04' };
const W_FONT = '맑은 고딕';
const imgType = src => /^data:image\/png/.test(src) ? 'png' : 'jpg';
const fileStamp = () => { const d = kstNow(); return `${String(d.getFullYear()).slice(2)}${pad(d.getMonth() + 1)}${pad(d.getDate())}`; };
function periodTitle(r) {
  const f = parseD(r.from), t = parseD(r.to);
  if (r.from === r.to) return `${f.getFullYear()}. ${f.getMonth() + 1}. ${f.getDate()}.(${WKK[f.getDay()]})`;
  if (f.getDate() === 1 && t.getDate() === new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate() && f.getMonth() === t.getMonth()) return `( ${f.getMonth() + 1} )월`;
  if (f.getMonth() === 0 && f.getDate() === 1 && t.getMonth() === 11 && t.getDate() === 31) return `${f.getFullYear()}년`;
  return `${fmtDs(f)} ~ ${fmtDs(t)}`;
}
const perWord = r => r.from === r.to ? '일일' : daysIn(r) <= 7 ? '주간' : daysIn(r) <= 31 ? '월' : '연간';
const nextWord = r => r.from === r.to ? '익일' : daysIn(r) <= 7 ? '차주' : daysIn(r) <= 31 ? '차월' : '차년도';

/* =====================================================================
 * 문서 모델 → Word (docx)
 * ===================================================================== */
const DOCW = 9638; // A4 본문 폭(twip): 11906 − 좌우 1134×2
function R(t, o = {}) { return new docx.TextRun({ text: String(t ?? ''), bold: o.bold, size: o.size || 20, color: o.color || C.ink, font: W_FONT, italics: o.it }); }
function P(runs, o = {}) { return new docx.Paragraph({ children: Array.isArray(runs) ? runs : [runs], alignment: o.align, spacing: { before: o.before ?? 0, after: o.after ?? 60, line: o.line || 276 }, keepNext: o.keepNext, pageBreakBefore: o.pb, indent: o.indent }); }
function lineParas(text, o = {}) { const ls = String(text ?? '').split('\n'); return ls.map((l, i) => P([R(l, o)], { after: i === ls.length - 1 ? 0 : 20, align: o.align })); }
function dCell(v, w, o = {}) {
  const ch = v && v.img ? [new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, children: [new docx.ImageRun({ type: imgType(v.img), data: b64ToU8(dataUrlB64(v.img)), transformation: { width: v.w, height: v.h } })] })]
    : lineParas(v == null || v === '' ? (o.dash === false ? '' : '-') : v, { size: o.size || 18, bold: o.bold, color: o.color, align: o.align });
  return new docx.TableCell({ children: ch, width: { size: w, type: docx.WidthType.DXA }, columnSpan: o.span, rowSpan: o.rowSpan, verticalAlign: docx.VerticalAlign.CENTER,
    shading: o.fill ? { type: docx.ShadingType.CLEAR, color: 'auto', fill: o.fill } : undefined, margins: { top: 50, bottom: 50, left: 90, right: 90 } });
}
function dTable(rows, widths, o = {}) {
  const bd = { style: docx.BorderStyle.SINGLE, size: 4, color: C.line };
  return new docx.Table({ rows, width: { size: widths.reduce((a, b) => a + b, 0), type: docx.WidthType.DXA }, columnWidths: widths, layout: docx.TableLayoutType.FIXED, alignment: o.align,
    borders: { top: bd, bottom: bd, left: bd, right: bd, insideHorizontal: bd, insideVertical: bd } });
}
function wOf(ratios, total = DOCW) { const s = ratios.reduce((a, b) => a + b, 0); const w = ratios.map(r => Math.floor(r / s * total)); w[w.length - 1] += total - w.reduce((a, b) => a + b, 0); return w; }
function blocksToDocx(blocks) {
  const out = [], AL = docx.AlignmentType;
  blocks.forEach(b => {
    if (b.k === 'pb') { out.push(new docx.Paragraph({ children: [new docx.PageBreak()] })); return; }
    if (b.k === 'title') {
      const ap = b.approval ? b.approval : null;
      if (ap) {
        const w = wOf([5.6, .5].concat(ap.map(() => 1)), DOCW);
        out.push(dTable([
          new docx.TableRow({ children: [dCell(b.t, w[0], { size: 34, bold: true, rowSpan: 2, align: AL.CENTER, dash: false }), dCell('결\n재', w[1], { rowSpan: 2, align: AL.CENTER, fill: C.silverL, bold: true })].concat(ap.map((a, i) => dCell(a, w[i + 2], { align: AL.CENTER, fill: C.silverL, bold: true }))) }),
          new docx.TableRow({ height: { value: 700, rule: docx.HeightRule.ATLEAST }, children: ap.map((a, i) => dCell('/', w[i + 2], { align: AL.CENTER, color: C.gray })) })
        ], w));
      } else String(b.t).split('\n').forEach((l, i, a) => out.push(P([R(l, { size: i ? 30 : 34, bold: true, color: C.navy })], { align: AL.CENTER, after: i === a.length - 1 ? 80 : 20 })));
      if (b.sub) out.push(P([R(b.sub, { size: 19, color: C.gray })], { align: AL.CENTER, before: 60, after: 120 }));
      else out.push(P([R('')], { after: 60 }));
      return;
    }
    if (b.k === 'info') { const w = wOf([1.2, 2.2, 1.2, 2.2]); out.push(dTable(b.rows.map(r => new docx.TableRow({ children: [dCell(r[0], w[0], { fill: 'E8F5EC', bold: true, align: AL.CENTER, color: C.greenD }), dCell(r[1], w[1]), dCell(r[2], w[2], { fill: 'E8F5EC', bold: true, align: AL.CENTER, color: C.greenD }), dCell(r[3], w[3])] })), w)); out.push(P([R('')], { after: 80 })); return; }
    if (b.k === 'h') { out.push(P([R(b.t, { size: 23, bold: true, color: C.navy })], { before: 200, after: 80, keepNext: true })); return; }
    if (b.k === 'h2') { out.push(P([R('■ ' + b.t, { size: 20, bold: true, color: C.greenD })], { before: 120, after: 60, keepNext: true })); return; }
    if (b.k === 'p') { out.push(...lineParas(b.t, { size: b.size || 19, color: b.color })); out.push(P([R('')], { after: 40 })); return; }
    if (b.k === 'box') { const w = [DOCW]; out.push(dTable([new docx.TableRow({ children: [new docx.TableCell({ width: { size: DOCW, type: docx.WidthType.DXA }, shading: { type: docx.ShadingType.CLEAR, color: 'auto', fill: 'EEF7F1' }, margins: { top: 120, bottom: 120, left: 160, right: 160 }, children: [P([R(b.title || '', { bold: true, size: 21, color: C.greenD })], { after: 60 })].concat((b.items || []).map(x => P([R('✔ ', { color: C.green, bold: true, size: 19 }), R(x, { size: 19 })], { after: 30 }))) })] })], w)); out.push(P([R('')], { after: 60 })); return; }
    if (b.k === 'bullets') { b.items.forEach(x => out.push(P([R('• ' + x, { size: 19 })], { after: 30, indent: { left: 200 } }))); return; }
    if (b.k === 'table') {
      const w = wOf(b.w || b.head.map(() => 1)), al = b.align || [];
      const rows = [new docx.TableRow({ tableHeader: true, children: b.head.map((h, i) => dCell(h, w[i], { fill: b.headFill || 'DCE3F3', bold: true, align: AL.CENTER, size: 18 })) })];
      b.rows.forEach(r => {
        if (r && r.cat) { rows.push(new docx.TableRow({ children: [dCell(r.cat, DOCW, { span: b.head.length, bold: true, fill: r.fill || 'EEF1F5', color: r.color || C.navy, size: 18 })] })); return; }
        const tot = r && r.tot; const cells = tot ? r.cells : r;
        rows.push(new docx.TableRow({ children: cells.map((c, i) => dCell(c, w[i], { size: b.size || 17, align: al[i] === 'c' ? AL.CENTER : al[i] === 'r' ? AL.RIGHT : AL.LEFT, bold: tot, fill: tot ? 'F1F3F8' : undefined })) }));
      });
      out.push(dTable(rows, w)); out.push(P([R('')], { after: 60 })); return;
    }
    if (b.k === 'img') { const wIn = b.wIn || 6.6, hIn = wIn * (b.ratio || .42); out.push(new docx.Paragraph({ alignment: AL.CENTER, spacing: { before: 40, after: 40 }, children: [new docx.ImageRun({ type: imgType(b.src), data: b64ToU8(dataUrlB64(b.src)), transformation: { width: wIn * 96, height: hIn * 96 } })] })); if (b.caption) out.push(P([R(b.caption, { size: 16, color: C.gray, it: true })], { align: AL.CENTER, after: 100 })); return; }
    if (b.k === 'photos') {
      const w = wOf([.7, 2.2, 2.2, .9]), iw = 2.1 * 96, ih = 1.45 * 96;
      const rows = [new docx.TableRow({ tableHeader: true, children: ['일자·장소', '작업 전', '작업 후', '비고'].map((h, i) => dCell(h, w[i], { fill: 'DCE3F3', bold: true, align: AL.CENTER })) })];
      b.items.forEach(it => rows.push(new docx.TableRow({ children: [dCell(`${it.date}\n${it.loc || ''}`, w[0], { align: AL.CENTER, size: 16 }), dCell(it.ph1 ? { img: it.ph1, w: iw, h: ih } : '사진 없음', w[1], { align: AL.CENTER, color: C.gray }), dCell(it.ph2 ? { img: it.ph2, w: iw, h: ih } : '사진 없음', w[2], { align: AL.CENTER, color: C.gray }), dCell(it.note, w[3], { size: 16 })] })));
      out.push(dTable(rows, w)); out.push(P([R('')], { after: 60 })); return;
    }
  });
  return out;
}
async function packDocx(children, title) {
  const doc = new docx.Document({ creator: APP.maker, title, description: `${APP.name} ${APP.version}`, styles: { default: { document: { run: { font: W_FONT, size: 20 } } } },
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1850, bottom: 1831, left: 1134, right: 1134, header: 1020, footer: 973 } } }, children }] });
  return await applyHeaderFooter(await docx.Packer.toBlob(doc));
}
/* stec-header-footer 표준 머리글(「The Best Choice」 로고 + 진초록·벽돌색 선) · 바닥글(감청 선 + 쪽번호 + 제작자 서명) */
async function applyHeaderFooter(blob) {
  const zip = await JSZip.loadAsync(blob);
  const cx = Math.round(V.sigPx * 2520000 / 1860);
  zip.file('word/stecHeader.xml', HF_HEADER_XML); zip.file('word/stecFooter.xml', HF_FOOTER_XML.replace(/cx="2520000"/g, `cx="${cx}"`));
  zip.file('word/media/stec-header-thebestchoice.png', b64ToU8(dataUrlB64(ASSET.headerTbc)));
  zip.file('word/media/stec-footer-signature.png', b64ToU8(dataUrlB64(V.sig || ASSET.sigBase)));
  const rel = (id, t) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${t}"/></Relationships>`;
  zip.file('word/_rels/stecHeader.xml.rels', rel('rId1', 'media/stec-header-thebestchoice.png')); zip.file('word/_rels/stecFooter.xml.rels', rel('rId2', 'media/stec-footer-signature.png'));
  let ct = await zip.file('[Content_Types].xml').async('string');
  if (!/Extension="png"/i.test(ct)) ct = ct.replace(/(<Types[^>]*>)/, '$1<Default Extension="png" ContentType="image/png"/>');
  if (!/Extension="jpg"/i.test(ct)) ct = ct.replace(/(<Types[^>]*>)/, '$1<Default Extension="jpg" ContentType="image/jpeg"/>');
  [['stecHeader.xml', 'header'], ['stecFooter.xml', 'footer']].forEach(([pt, k]) => { const ov = `<Override PartName="/word/${pt}" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.${k}+xml"/>`; if (!ct.includes(ov)) ct = ct.replace('</Types>', ov + '</Types>'); });
  zip.file('[Content_Types].xml', ct);
  let rl = await zip.file('word/_rels/document.xml.rels').async('string');
  rl = rl.replace('</Relationships>', '<Relationship Id="rIdStecHdr" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="stecHeader.xml"/><Relationship Id="rIdStecFtr" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="stecFooter.xml"/></Relationships>');
  zip.file('word/_rels/document.xml.rels', rl);
  let d = await zip.file('word/document.xml').async('string');
  const refs = ['default', 'first', 'even'].map(t => `<w:headerReference w:type="${t}" r:id="rIdStecHdr"/><w:footerReference w:type="${t}" r:id="rIdStecFtr"/>`).join('');
  d = d.replace(/<w:sectPr[^>]*>[\s\S]*?<\/w:sectPr>|<w:sectPr[^>]*\/>/g, s => { s = s.replace(/<w:(header|footer)Reference[^>]*\/>/g, ''); if (/\/>$/.test(s) && !/<\/w:sectPr>/.test(s)) s = s.replace(/\/>$/, '>') + '</w:sectPr>'; return s.replace(/(<w:sectPr[^>]*>)/, '$1' + refs); });
  if (!/xmlns:r=/.test(d.slice(0, 2000))) d = d.replace('<w:document ', '<w:document xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ');
  zip.file('word/document.xml', d);
  return await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', compression: 'DEFLATE' });
}

/* =====================================================================
 * 문서 모델 → PDF (A4 세로 · html2canvas + jsPDF) — 블록 단위 쪽 나눔, 긴 표는 행 단위로 나눔
 * ===================================================================== */
const PW = 794, PH = 1123, PM_ = { t: 64, b: 70, l: 58, r: 58 };
const pdfCss = `.pg{width:${PW}px;height:${PH}px;background:#fff;color:#1C2333;font-family:${FONT};position:relative;overflow:hidden;box-sizing:border-box;padding:${PM_.t}px ${PM_.r}px ${PM_.b}px ${PM_.l}px;font-size:12.5px;line-height:1.5}
.pg .hdr{position:absolute;left:${PM_.l}px;right:${PM_.r}px;top:18px;height:26px;border-bottom:3px solid #17552F}.pg .hdr::after{content:"";position:absolute;left:0;right:0;bottom:-6px;border-bottom:1px solid #E34234}.pg .hdr img{height:22px}
.pg .ftr{position:absolute;left:${PM_.l}px;right:${PM_.r}px;bottom:16px;border-top:3px solid #1F4E79;padding-top:4px;display:flex;justify-content:center;align-items:center;font-size:11px;color:#555}.pg .ftr img{position:absolute;right:0;top:6px;height:20px}
.pg h1{white-space:pre-line;font-size:23px;text-align:center;color:#0B1F8F;margin:6px 0 4px}.pg .sub{text-align:center;color:#5B6475;margin-bottom:10px}
.pg h2{font-size:15px;color:#0B1F8F;margin:14px 0 6px}.pg h3{font-size:13px;color:#17552F;margin:10px 0 4px}
.pg table{border-collapse:collapse;width:100%;table-layout:fixed;margin-bottom:8px}.pg td,.pg th{border:1px solid #BFC6D4;padding:4px 6px;font-size:11.5px;vertical-align:middle;word-break:keep-all;overflow-wrap:anywhere;white-space:pre-line}
.pg th{background:#DCE3F3;font-weight:700;text-align:center}.pg td.c{text-align:center}.pg td.r{text-align:right}.pg tr.cat td{background:#EEF1F5;font-weight:700;color:#0B1F8F}.pg tr.tot td{background:#F1F3F8;font-weight:700}
.pg .ik{background:#E8F5EC;color:#17552F;font-weight:700;text-align:center}
.pg .box{background:#EEF7F1;border:1px solid #BFE0C9;border-radius:6px;padding:8px 12px;margin:6px 0 10px}.pg .box b{color:#17552F;display:block;margin-bottom:4px}.pg .box div{margin:2px 0}
.pg .ttl{display:flex;align-items:stretch;border:1px solid #BFC6D4;margin-bottom:8px}.pg .ttl .t{flex:1;display:grid;place-items:center;font-size:22px;font-weight:800}.pg .ttl table{width:auto;margin:0}.pg .ttl td{width:66px;height:22px;text-align:center}
.pg img.ph{width:100%;height:120px;object-fit:cover;display:block}.pg p{margin:2px 0 8px;white-space:pre-line}`;
function blockHtml(b) {
  const e = s => esc(s == null || s === '' ? '-' : s);
  if (b.k === 'title') return b.approval ? `<div class="ttl"><div class="t">${esc(b.t)}</div><table><tr><td rowspan="2" style="width:26px;background:#EEF1F5;font-weight:700">결<br>재</td>${b.approval.map(a => `<td style="background:#EEF1F5;font-weight:700">${esc(a)}</td>`).join('')}</tr><tr>${b.approval.map(() => '<td style="height:44px;color:#999">/</td>').join('')}</tr></table></div>${b.sub ? `<div class="sub">${esc(b.sub)}</div>` : ''}` : `<h1>${esc(b.t)}</h1>${b.sub ? `<div class="sub">${esc(b.sub)}</div>` : ''}`;
  if (b.k === 'info') return `<table>${b.rows.map(r => `<tr><td class="ik" style="width:16%">${e(r[0])}</td><td>${e(r[1])}</td><td class="ik" style="width:16%">${e(r[2])}</td><td>${e(r[3])}</td></tr>`).join('')}</table>`;
  if (b.k === 'h') return `<h2>${esc(b.t)}</h2>`;
  if (b.k === 'h2') return `<h3>■ ${esc(b.t)}</h3>`;
  if (b.k === 'p') return `<p>${esc(b.t)}</p>`;
  if (b.k === 'box') return `<div class="box"><b>${esc(b.title || '')}</b>${(b.items || []).map(x => `<div>✔ ${esc(x)}</div>`).join('')}</div>`;
  if (b.k === 'bullets') return `<div>${b.items.map(x => `<div>• ${esc(x)}</div>`).join('')}</div>`;
  if (b.k === 'img') return `<div style="text-align:center"><img src="${b.src}" style="width:${Math.round((b.wIn || 6.6) / 6.69 * 100)}%"><div style="color:#5B6475;font-size:11px">${esc(b.caption || '')}</div></div>`;
  return '';
}
function tableParts(b) {
  const s = (b.w || b.head.map(() => 1)).reduce((a, x) => a + x, 0), al = b.align || [];
  const head = `<colgroup>${(b.w || b.head.map(() => 1)).map(x => `<col style="width:${x / s * 100}%">`).join('')}</colgroup><tr>${b.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr>`;
  const rows = b.rows.map(r => r && r.cat ? `<tr class="cat"><td colspan="${b.head.length}">${esc(r.cat)}</td></tr>` : `<tr class="${r && r.tot ? 'tot' : ''}">${(r.tot ? r.cells : r).map((c, i) => `<td class="${al[i] || ''}">${esc(c == null || c === '' ? '-' : c)}</td>`).join('')}</tr>`);
  return { head, rows };
}
function photoParts(b) { return { head: `<colgroup><col style="width:13%"><col style="width:36%"><col style="width:36%"><col style="width:15%"></colgroup><tr><th>일자·장소</th><th>작업 전</th><th>작업 후</th><th>비고</th></tr>`, rows: b.items.map(it => `<tr><td class="c">${esc(it.date)}<br>${esc(it.loc || '')}</td><td>${it.ph1 ? `<img class="ph" src="${it.ph1}">` : '<div style="height:120px;display:grid;place-items:center;color:#999">사진 없음</div>'}</td><td>${it.ph2 ? `<img class="ph" src="${it.ph2}">` : '<div style="height:120px;display:grid;place-items:center;color:#999">사진 없음</div>'}</td><td>${esc(it.note || '')}</td></tr>`) }; }
async function blocksToPdf(blocks, name) {
  const host = $('#render'); host.innerHTML = `<style>${pdfCss}</style>`;
  const pages = []; let pg, inner;
  const newPage = () => { pg = document.createElement('div'); pg.className = 'pg'; pg.innerHTML = `<div class="hdr"><img src="${ASSET.headerTbc}"></div><div class="ftr">- ${pages.length + 1} -<img src="${V.sig || ASSET.sigBase}"></div>`; inner = document.createElement('div'); pg.appendChild(inner); host.appendChild(pg); pages.push(pg); };
  const limit = PH - PM_.t - PM_.b;
  const fits = () => inner.scrollHeight <= limit;
  newPage();
  for (const b of blocks) {
    if (b.k === 'pb') { if (inner.childNodes.length) newPage(); continue; }
    if (b.k === 'table' || b.k === 'photos') {
      const parts = b.k === 'table' ? tableParts(b) : photoParts(b);
      const mk = () => { const t = document.createElement('table'); t.innerHTML = parts.head; inner.appendChild(t); return t; };
      let t = mk(); if (!fits()) { t.remove(); newPage(); t = mk(); }
      for (const row of parts.rows) { const tb = document.createElement('tbody'); tb.innerHTML = row; t.appendChild(tb); if (b.k === 'photos') await Promise.all([...tb.querySelectorAll('img')].map(i => i.decode ? i.decode().catch(() => { }) : 0)); if (!fits()) { tb.remove(); newPage(); t = mk(); t.appendChild(tb); } }
      continue;
    }
    const d = document.createElement('div'); d.innerHTML = blockHtml(b); inner.appendChild(d);
    await Promise.all([...d.querySelectorAll('img')].map(i => i.decode ? i.decode().catch(() => { }) : 0));
    if (!fits() && inner.childNodes.length > 1) { d.remove(); newPage(); inner.appendChild(d); }
  }
  const { jsPDF } = window.jspdf; const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [PW, PH], compress: true, hotfixes: ['px_scaling'] });
  for (let i = 0; i < pages.length; i++) {
    busy(true, `PDF 만드는 중… ${i + 1}/${pages.length}쪽`);
    const cv = await html2canvas(pages[i], { scale: 1.6, backgroundColor: '#ffffff', logging: false });
    if (i) pdf.addPage([PW, PH], 'portrait'); pdf.addImage(cv.toDataURL('image/jpeg', .88), 'JPEG', 0, 0, PW, PH);
  }
  host.innerHTML = ''; pdf.setProperties({ title: name, creator: `${APP.name} — ${APP.maker}` });
  return pdf.output('blob');
}

/* =====================================================================
 * 내용 1) 사업장 「주요 업무실적 및 계획」 (월말보고 형식)
 * ===================================================================== */
function recSitesIn(r, F) { const A = aggregate(r, F); return Object.keys(A.sites).map(k => SITE[k]).filter(Boolean); }
function catRows(A, maxPer = 99) {
  const rows = [];
  Object.entries(CATS).forEach(([ck, c]) => {
    const ts = Object.values(A.tasks).filter(T => TASK[T.id] && TASK[T.id].c === ck && (T.act || T.n || T.plan)); if (!ts.length) return;
    rows.push({ cat: `${c.n} — ${c.d}` });
    ts.sort((a, b) => b.val - a.val || b.act - a.act).slice(0, maxPer).forEach(T => {
      const t = TASK[T.id], avg = t.k === 'score' || t.k === 'avg';
      rows.push([JOBS[t.job].s, t.n, t.u, T.plan ? nf(T.plan) : '-', avg ? nf(T.n ? T.sum / T.n : null, 1) : nf(T.act), T.plan ? nf(Math.min(T.act, T.plan) / T.plan * 100, 1) + '%' : '-', T.val ? nf(T.val) : t.k === 'amt' ? nf(T.act) : '-']);
    });
  });
  return rows;
}
function monthlyBlocks(s, r, F) {
  const Fs = Object.assign({}, F, { site: s.key }), A = aggregate(r, Fs), pr = prevRange(UI.per || 'm', UI.ref || today()), P = aggregate(pr, Fs);
  const T = planText(s.key, r, F.job, A), jobsN = F.job ? JOBS[F.job].n : [...new Set(A.recs.map(x => x.job))].map(j => JOBS[j].s).join('·');
  const mg = UI.manager || {}, B = [];
  B.push({ k: 'title', t: `${periodTitle(r)} 주요 업무실적 및 계획`, approval: ['소 장', '지사장'] });
  B.push({ k: 'info', rows: [['작성일자', fmtD(kstNow()), '본부/지사', siteOrgLabel(s)], ['사업장명', s.name, '작성자', s.head || [mg.title, mg.name].filter(Boolean).join(' ')], ['업종', jobsN, '대상 기간', `${fmtDs(r.from)} ~ ${fmtDs(r.to)} (기록 ${A.recDays}일)`]] });
  B.push({ k: 'h', t: `1. ${perWord(r) === '월' ? '당월' : '기간'} 주요 업무` });
  B.push({ k: 'table', head: ['구분', '계획', '결과/실적'], w: [1, 3, 3.6], align: ['c', '', ''], rows: [['정기 업무', T.curPlan, T.curRes], ['교육', T.eduPlan, T.eduRes], ['기타', '', T.etc]] });
  B.push({ k: 'h', t: '2. 정량 성과 (업무 계수화)' });
  B.push({ k: 'box', title: `「보이지 않는 성과」 — SPI ${A.spi ? nf(A.spi.total, 1) + '점 (' + gradeOf(A.spi.total)[0] + ' ' + gradeOf(A.spi.total)[1] + ')' : '-'}`, items: highlights(A, 7) });
  B.push({ k: 'table', head: ['업종', '업무 항목', '단위', '계획', '실적', '달성률', '환산가치(원)'], w: [.7, 2.6, .6, .9, .9, .9, 1.2], align: ['c', '', 'c', 'r', 'r', 'r', 'r'], rows: catRows(A).concat([{ tot: true, cells: ['합계', '', '', nf(A.plan), nf(A.act), A.rate == null ? '-' : nf(A.rate, 1) + '%', nf(A.value)] }]) });
  if (A.autoN) B.push({ k: 'p', t: `※ 직접 입력 ${A.manN}건 외 ${A.autoN}건(업종·일 단위)은 사업장 인원·근무형태·산업 기준 표준 업무량 × 성과 수준(${autoCfg(s.key).lvl}%)으로 산출한 값이며, 현장 확인 후 조정·관리합니다.`, size: 16, color: C.gray });
  const tr = trendData(A, UI.per || 'm');
  if (A.recs.length > 1) B.push({ k: 'img', src: chartPng('bar', { title: '일자별 업무량 · 환산가치', labels: tr.lb, bars: [{ name: '업무량', data: tr.act, color: '#2A44D4' }], line: { name: '환산가치(원)', data: tr.val, color: '#1B7A34' } }, 1100, 440), wIn: 6.6, ratio: .4 });
  B.push({ k: 'table', head: ['구분', '전기', '당기', '증감'], w: [2, 1.4, 1.4, 1.2], align: ['', 'r', 'r', 'r'], rows: [['업무 수행량', nf(P.act), nf(A.act), dPct(A.act, P.act)], ['예방·적발 활동(건)', nf(P.prevN), nf(A.prevN), dPct(A.prevN, P.prevN)], ['환산가치(원)', nf(P.value), nf(A.value), dPct(A.value, P.value)], ['사건사고 예방·적발(건)', nf(P.incidents), nf(A.incidents), dPct(A.incidents, P.incidents)]] });
  // 자체 품질평가
  const qT = A.tasks.c_selfqc, qcs = Object.values(PM.qc).filter(q => q.site === s.key && q.d <= r.to).sort((a, b) => b.d.localeCompare(a.d));
  B.push({ k: 'h', t: '3. 자체 품질평가 결과' });
  if (qcs.length) { const q = qcs[0], sc = qcScore(q), items = qcItems(q.job, q.ind).filter(i => i.s === 'site'); B.push({ k: 'table', head: ['구분'].concat(items.slice(0, 9).map(i => i.n)).concat(['평균']), w: [.8].concat(items.slice(0, 9).map(() => 1)).concat([.8]), align: Array(12).fill('c'), size: 15, rows: [['점수'].concat(items.slice(0, 9).map(i => q.sc[i.k] && q.sc[i.k].s !== '' && q.sc[i.k].s != null ? nf(q.sc[i.k].s, 0) : '-')).concat([nf(sc.sec.site.avg, 1)])] }); B.push({ k: 'p', t: `최근 운영실태·품질점검(${fmtDs(q.d)}) 종합 ${nf(sc.total, 1)}점 · ${gradeOf(sc.total)[1]}` }); }
  else if (qT && qT.n) B.push({ k: 'p', t: `자체 품질평가 ${qT.n}회 실시 · 평균 ${nf(qT.sum / qT.n, 1)}점` });
  else B.push({ k: 'p', t: '이 기간 자체 품질평가 기록이 없습니다.' });
  if (T.qcIssue) B.push({ k: 'table', head: ['주요 문제점 및 개선방안'], w: [1], rows: [[T.qcIssue]] });
  // 사건사고
  if (A.evBy.inc.length) { B.push({ k: 'h', t: '4. 사건사고 예방·적발 내역' }); B.push({ k: 'table', head: ['일자', '제목', '장소', '근무자', '내용', '조치결과', '금액'], w: [.8, 1.6, .9, .8, 2.2, 1.6, .8], align: ['c', '', 'c', 'c', '', '', 'r'], size: 15, rows: A.evBy.inc.map(e => [fmtDs(e.d).slice(5), e.title, e.loc, e.worker, e.desc, e.action || '조치 진행', e.amt ? nf(e.amt) : '']) }); }
  B.push({ k: 'h', t: `${A.evBy.inc.length ? 5 : 4}. ${nextWord(r)} 계획` });
  B.push({ k: 'table', head: ['구분', '주요 업무'], w: [1, 6], align: ['c', ''], rows: [['정기 업무', T.next], ['교육', T.nextEdu], ['반성 및 대책', T.reflect]] });
  const ws = A.evBy.work.concat(A.evBy.imp).sort((a, b) => a.d.localeCompare(b.d));
  if (ws.length) { B.push({ k: 'pb' }); B.push({ k: 'title', t: '주요 작업 및 업무개선 실적' }); const wk = A.evBy.work, im = A.evBy.imp; if (wk.length) { B.push({ k: 'h2', t: '주요 작업실적' }); B.push({ k: 'photos', items: wk.map(e => ({ date: fmtDs(e.d).slice(5), loc: e.loc, ph1: e.ph1, ph2: e.ph2, note: e.title + (e.desc ? '\n' + e.desc : '') })) }); } if (im.length) { B.push({ k: 'h2', t: '업무개선 실적' }); B.push({ k: 'photos', items: im.map(e => ({ date: fmtDs(e.d).slice(5), loc: e.loc, ph1: e.ph1, ph2: e.ph2, note: e.title + (e.before || e.after ? `\n개선 전: ${e.before || '-'}\n개선 후: ${e.after || '-'}` : '') })) }); } }
  const pr2 = A.evBy.praise.concat(A.evBy.edu, A.evBy.org);
  if (pr2.length) { B.push({ k: 'h2', t: '교육·근무자 우수사례·조직활성화' }); B.push({ k: 'table', head: ['일자', '구분', '제목', '근무자·참석', '내용'], w: [.8, 1.2, 2, 1.2, 2.8], align: ['c', 'c', '', 'c', ''], size: 15, rows: pr2.map(e => [fmtDs(e.d).slice(5), EVT[e.t].n, e.title, e.worker, e.desc]) }); }
  return B;
}
function dPct(a, b) { if (!b) return a ? '신규' : '-'; const d = (a - b) / b * 100; return `${d >= 0 ? '▲' : '▼'} ${nf(Math.abs(d), 1)}%`; }
async function outMonthly(r, F, kind) {
  const list = F.site ? [SITE[F.site]].filter(Boolean) : recSitesIn(r, F);
  if (!list.length) return toast('이 범위에 기록된 사업장이 없습니다');
  busy(true, `보고서 만드는 중… (${list.length}개 사업장)`);
  let B = []; list.forEach((s, i) => { if (i) B.push({ k: 'pb' }); B = B.concat(monthlyBlocks(s, r, F)); });
  const nm = `${fileStamp()}_${safeName(list.length === 1 ? list[0].name : scopeLabel(F))}_${periodTitle(r).replace(/[()\s]/g, '')}_주요업무실적및계획`;
  try {
    if (kind === 'pdf') await download(await blocksToPdf(B, nm), nm + '.pdf');
    else await download(await packDocx(blocksToDocx(B), nm), nm + '.docx');
    toast('보고서를 만들었습니다');
  } finally { busy(false); }
}

/* =====================================================================
 * 내용 2) 성과 발표자료 (PPT · PDF) — 르노삼성 「보안부문 업무실적」 구성
 * ===================================================================== */
const SW = 13.333, SH = 7.5;
function T(x, y, w, h, text, o = {}) { return Object.assign({ t: 'text', x, y, w, h, text: String(text ?? '') }, o); }
function Rc(x, y, w, h, fill, o = {}) { return Object.assign({ t: 'rect', x, y, w, h, fill }, o); }
function Im(x, y, w, h, src, o = {}) { return Object.assign({ t: 'img', x, y, w, h, src }, o); }
function Tb(x, y, w, rows, colW, o = {}) { return Object.assign({ t: 'table', x, y, w, rows, colW }, o); }
function slideBase(title, no, sub) {
  return [Rc(0, 0, SW, .9, 'FFFFFF'), Rc(0, .86, SW, .05, C.greenD), Rc(0, .91, SW, .02, C.brick), Rc(.45, .22, .12, .5, C.green),
    T(.7, .14, 9.8, .66, title, { size: 24, bold: true, color: C.navy, valign: 'middle' }), sub ? T(8.4, .2, 4.5, .55, sub, { size: 11, color: C.gray, align: 'right', valign: 'middle' }) : null,
    Rc(0, SH - .38, SW, .38, C.silverL), T(.45, SH - .36, 7, .34, 'S-Tec Group co. Ltd All rights Reserved. · S-Tec Performance Management System', { size: 9, color: C.gray, it: true, valign: 'middle' }),
    T(SW - 1.4, SH - .36, 1, .34, String(no), { size: 10, color: C.gray, align: 'right', valign: 'middle' }), Im(SW - 2.95, SH - .345, 1.45, .3, ASSET.logo, { contain: true })].filter(Boolean);
}
function tblRows(head, rows, o = {}) {
  const H = head.map(h => ({ text: h, fill: o.headFill || C.navy, color: 'FFFFFF', bold: true, align: 'center' }));
  return [H].concat(rows.map((r, i) => r.cat ? [{ text: r.cat, fill: 'EEF1F5', bold: true, color: C.navy, colspan: head.length }] : (r.tot ? r.cells : r).map((c, j) => ({ text: c == null || c === '' ? '-' : String(c), fill: r.tot ? 'F1F3F8' : i % 2 ? 'F7F9FC' : 'FFFFFF', bold: !!r.tot, align: (o.align || [])[j] === 'r' ? 'right' : (o.align || [])[j] === 'c' ? 'center' : 'left' }))));
}
function deckSlides(r, F) {
  const A = aggregate(r, F), pr = prevRange(UI.per || 'm', UI.ref || today()), P = aggregate(pr, F), Y = aggregate({ from: r.from.slice(0, 4) + '-01-01', to: r.to }, F);
  const site = F.site ? SITE[F.site] : null, who = site ? site.name : scopeLabel(F), T0 = planText(F.site || '', r, F.job, A), jobT = F.job ? JOBS[F.job].s + '부문' : '전 부문';
  const S = []; let no = 1;
  // 1 표지
  S.push([Rc(0, 0, SW, SH, '0C2350'), Im(SW * .44, 0, SW * .56, SH, ASSET.hero, { cover: true, alpha: .9 }), Rc(0, 0, SW * .5, SH, '0C2350', { alpha: .15 }),
    Rc(.7, 1.3, .14, 1.5, C.green), T(1.0, 1.15, 6.6, .5, `${APP.org} · ${who}`, { size: 15, color: 'B9C3EC' }),
    T(1.0, 1.65, 6.6, 1.5, `${periodTitle(r)} ${jobT} 업무실적`, { size: 36, bold: true, color: 'FFFFFF' }), T(1.0, 3.05, 6.6, .5, `( ${fmtDs(r.from)} ~ ${fmtDs(r.to)} )`, { size: 15, color: 'D7DEFF' }),
    Tb(1.0, 4.1, 3.2, [[{ text: '결재', fill: 'EEF1F5', bold: true, align: 'center' }, { text: '팀 장', fill: 'EEF1F5', bold: true, align: 'center' }, { text: '지점장', fill: 'EEF1F5', bold: true, align: 'center' }], [{ text: '', fill: 'FFFFFF' }, { text: '', fill: 'FFFFFF' }, { text: '', fill: 'FFFFFF' }]], [.8, 1.2, 1.2], { rowH: [.32, .62], size: 11 }),
    Im(1.0, 5.5, 1.1, 1.1, ASSET.icon), T(2.25, 5.55, 5, .5, APP.name, { size: 14, bold: true, color: 'FFFFFF' }), T(2.25, 5.95, 5, .5, '보이지 않는 노력을 숫자로 증명합니다', { size: 12, color: 'B9C3EC' })]);
  // 2 목차
  S.push(slideBase('목 차', ++no).concat([Im(.6, 1.3, 4.2, 5.4, ASSET.fig[F.job ? JOBS[F.job].cute : 'cute_sec'] || ASSET.icon, { contain: true }),
    T(5.4, 1.3, 7.4, 5.6, `Ⅰ. ${perWord(r) === '월' ? '당월' : '기간'} 주요업무 성과\n    1. 성과 요약(SPI · 보이지 않는 성과)\n    2. 사건사고 예방 / 적발\n    3. 일상·순회 업무 활동 현황\n    4. 업무개선 및 개선효과\n    5. 교육훈련 실적 · 조직활성화\nⅡ. 반성 및 대책\nⅢ. ${nextWord(r)} 주요업무 계획\nⅣ. 붙임 — 산출기준 · 사업장별 성과`, { size: 18, color: C.ink, line: 1.5 })]));
  // 3 성과 요약
  const g = A.spi ? gradeOf(A.spi.total) : ['-', '-'];
  const kp = [['성과지수 SPI', A.spi ? nf(A.spi.total, 1) : '-', `${g[0]} ${g[1]}`, C.navy], ['업무 수행량', shortN(A.act), dPct(A.act, P.act), '2A44D4'], ['예방·적발', nf(A.prevN) + '건', dPct(A.prevN, P.prevN), 'C0392B'], ['환산가치', won(A.value), '연 누계 ' + won(Y.value), C.green], ['계획 달성률', pct(A.rate), A.plan ? `계획 ${nf(A.plan)}` : '-', 'E8750A']];
  const sl3 = slideBase('Ⅰ. 주요업무 성과 — 1. 성과 요약', ++no, who);
  kp.forEach((k, i) => { const x = .45 + i * 2.5; sl3.push(Rc(x, 1.15, 2.35, 1.35, i ? 'FFFFFF' : k[3], { line: i ? 'DCE3F3' : undefined, r: .12 }), T(x + .15, 1.2, 2.1, .35, k[0], { size: 11, color: i ? C.gray : 'D7DEFF', bold: true }), T(x + .15, 1.5, 2.1, .6, k[1], { size: 24, bold: true, color: i ? k[3] : 'FFFFFF' }), T(x + .15, 2.08, 2.1, .32, k[2], { size: 10, color: i ? C.gray : 'D7DEFF' })); });
  if (A.autoN) sl3.push(T(.45, 6.62, 12.45, .3, `※ 일부 수치는 사업장 인원·근무형태·산업 기준 표준 업무량 × 성과 수준으로 산출 후 현장 확인·조정한 값입니다 (직접 입력 ${A.manN}건 · 자동 산출 ${A.autoN}건)`, { size: 9, color: C.gray }));
  sl3.push(Rc(.45, 2.75, 12.45, 3.8, 'EEF7F1', { r: .1 }), T(.7, 2.85, 12, .45, '「보이지 않는 성과」 — 사고가 일어나지 않게 한 활동을 숫자로', { size: 15, bold: true, color: C.greenD }), T(.8, 3.35, 11.9, 3.5, highlights(A, 7).map(h => '✔  ' + h).join('\n') || '기록된 실적이 없습니다.', { size: 14, color: C.ink, line: 1.45 }));
  S.push(sl3);
  // 4 사건사고 예방·적발 (르노삼성 1번 표: 당월/누계 건수·금액)
  const prevT = Object.values(TASK).filter(t => t.c === 'prev' && (!F.job || t.job === F.job) && ((A.tasks[t.id] || {}).act || (Y.tasks[t.id] || {}).act));
  const sl4 = slideBase('Ⅰ. 주요업무 성과 — 2. 사건사고 예방 / 적발', ++no, '( 단위 : 건 , 원 )');
  if (prevT.length) {
    const cols = prevT.slice(0, 10), cw = [1.2, .9].concat(cols.map(() => (12.45 - 2.1 - 1.1) / cols.length)).concat([1.1]);
    const v = (X, t, k) => { const q = X.tasks[t.id] || {}; return k === 'n' ? q.act || 0 : (q.val || 0); };
    const row = (lab, sub, X, k) => [{ text: lab, fill: 'EEF1F5', bold: true, align: 'center' }, { text: sub, fill: 'EEF1F5', align: 'center' }].concat(cols.map(t => ({ text: v(X, t, k) ? nf(v(X, t, k)) : '', align: 'right' }))).concat([{ text: nf(cols.reduce((a, t) => a + v(X, t, k), 0)), align: 'right', bold: true }]);
    sl4.push(Tb(.45, 1.15, 12.45, [[{ text: '구 분', fill: C.navy, color: 'FFFFFF', bold: true, align: 'center', colspan: 2 }].concat(cols.map(t => ({ text: t.n.replace(/\(.*\)/, ''), fill: C.navy, color: 'FFFFFF', bold: true, align: 'center' }))).concat([{ text: '합계', fill: C.navy, color: 'FFFFFF', bold: true, align: 'center' }]), row(perWord(r) === '월' ? '당월' : '당기', '건수', A, 'n'), row('', '금액', A, 'v'), row('전기', '건수', P, 'n'), row('누계', '건수', Y, 'n'), row('', '금액', Y, 'v')], cw, { size: 10.5, rowH: [.55, .4, .4, .4, .4, .4] }));
  } else sl4.push(T(.6, 1.3, 12, .6, '이 기간 예방·적발 기록이 없습니다.', { size: 14, color: C.gray }));
  const inc = A.evBy.inc.slice(0, 6);
  if (inc.length) sl4.push(T(.45, 4.05, 6, .4, '■ 주요 사건사고 예방·적발 내역', { size: 13, bold: true, color: C.greenD }), Tb(.45, 4.45, 12.45, tblRows(['일자', '제목', '장소', '근무자', '예방 내용', '조치 결과'], inc.map(e => [fmtDs(e.d).slice(5), e.title, e.loc, e.worker, e.desc, e.action || '조치 진행'])), [.8, 2.4, 1.3, 1.2, 3.75, 3.0], { size: 9.5 }));
  else sl4.push(Rc(.45, 4.1, 12.45, 1.1, 'EEF7F1', { r: .1 }), T(.7, 4.2, 12, .9, `✔ 기간 중 사건사고 0건 — 예방·적발 활동 ${nf(A.prevN)}건으로 사고를 막았습니다.`, { size: 16, bold: true, color: C.greenD, valign: 'middle' }));
  const basis = Object.values(TASK).filter(t => t.b && (A.tasks[t.id] || {}).act).slice(0, 4).map(t => `${t.n}: ${t.b}`);
  if (basis.length) sl4.push(T(.45, 6.25, 12.45, .8, '※ 산출기준  ' + basis.join('  /  '), { size: 9.5, color: C.brick }));
  S.push(sl4);
  // 5 일상·순회 업무 + 추이 차트
  const rt = Object.values(A.tasks).filter(T1 => TASK[T1.id] && ['routine', 'service', 'resp', 'quality'].includes(TASK[T1.id].c) && T1.act && TASK[T1.id].k !== 'score' && TASK[T1.id].k !== 'avg').sort((a, b) => b.act - a.act).slice(0, 9);
  const tr = trendData(A, UI.per || 'm');
  S.push(slideBase('Ⅰ. 주요업무 성과 — 3. 일상·순회 업무 활동 현황', ++no, who).concat([
    Tb(.45, 1.15, 5.9, tblRows(['업무 항목', '단위', '계획', '실적', '달성률'], rt.map(x => [TASK[x.id].n, TASK[x.id].u, x.plan ? nf(x.plan) : '-', nf(x.act), x.plan ? nf(Math.min(x.act, x.plan) / x.plan * 100, 1) + '%' : '-']), { align: ['', 'c', 'r', 'r', 'r'] }), [2.5, .6, .9, 1, .9], { size: 10.5 }),
    Im(6.55, 1.1, 6.35, 3.05, chartPng('bar', { title: '기간 추이 — 업무량 · 환산가치', labels: tr.lb, bars: [{ name: '업무량', data: tr.act, color: '#2A44D4' }], line: { name: '환산가치', data: tr.val, color: '#1B7A34' } }, 1270, 610)),
    Im(6.55, 4.25, 6.35, 2.75, chartPng('donut', { title: '성과 영역별 업무량', data: Object.entries(CATS).map(([k, c]) => ({ n: c.n, v: A.cats[k].act, c: c.color })).filter(x => x.v > 0), center: shortN(A.act), centerSub: '업무량' }, 1270, 550))]));
  // 6 업무개선
  const im = A.evBy.imp.concat(A.evBy.work).slice(0, 2);
  const sl6 = slideBase('Ⅰ. 주요업무 성과 — 4. 업무개선 및 개선효과', ++no, who);
  if (im.length) im.forEach((e, i) => { const y = 1.15 + i * 2.95; sl6.push(Rc(.45, y, 12.45, 2.8, 'FFFFFF', { line: 'DCE3F3', r: .08 }), T(.65, y + .1, 5.6, .4, `${EVT[e.t].ic} ${e.title}`, { size: 14, bold: true, color: C.navy }), T(.65, y + .55, 5.6, 2.1, `일자: ${fmtDs(e.d)} · 장소: ${e.loc || '-'}\n${e.desc || ''}${e.before ? '\n개선 전: ' + e.before : ''}${e.after ? '\n개선 후: ' + e.after : ''}`, { size: 11.5, color: C.ink, line: 1.35 })); [e.ph1, e.ph2].forEach((p, k) => { const x = 6.45 + k * 3.2; if (p) sl6.push(Im(x, y + .15, 3.05, 2.2, p, { cover: true })); else sl6.push(Rc(x, y + .15, 3.05, 2.2, 'F1F3F8'), T(x, y + .15, 3.05, 2.2, '사진 없음', { size: 11, color: '999999', align: 'center', valign: 'middle' })); sl6.push(T(x, y + 2.38, 3.05, .3, k ? '개선 후 / 작업 후' : '개선 전 / 작업 전', { size: 9.5, color: C.gray, align: 'center' })); }); });
  else sl6.push(T(.6, 1.3, 12, .6, '이 기간 업무개선·주요 작업 기록이 없습니다.', { size: 14, color: C.gray }));
  S.push(sl6);
  // 7 교육훈련 · 조직활성화 · 우수사례
  const ed = A.evBy.edu.concat(A.evBy.praise, A.evBy.org).slice(0, 10);
  S.push(slideBase('Ⅰ. 주요업무 성과 — 5. 교육훈련 · 조직활성화 · 우수사례', ++no, who).concat(ed.length ? [Tb(.45, 1.15, 12.45, tblRows(['구분', '일자', '제목', '대상·근무자', '주요 내용'], ed.map(e => [EVT[e.t].n, fmtDs(e.d).slice(5), e.title, e.worker, e.desc])), [2.2, .9, 3.2, 1.8, 4.35], { size: 10.5 })] : [T(.6, 1.3, 12, .6, '이 기간 교육·조직활성화 기록이 없습니다.', { size: 14, color: C.gray })]));
  // 8 반성·계획
  S.push(slideBase(`Ⅱ. 반성 및 대책 · Ⅲ. ${nextWord(r)} 주요업무 계획`, ++no, who).concat([
    Rc(.45, 1.15, 12.45, 1.6, 'FFF4E5', { r: .1 }), T(.65, 1.22, 12, .4, 'Ⅱ. 반성 및 대책', { size: 15, bold: true, color: 'B45309' }), T(.75, 1.62, 11.9, 1.1, T0.reflect, { size: 13, color: C.ink, line: 1.35 }),
    T(.45, 2.95, 12, .4, `Ⅲ. ${nextWord(r)} 주요업무 계획`, { size: 15, bold: true, color: C.navy }),
    Tb(.45, 3.4, 12.45, [[{ text: '구분', fill: C.navy, color: 'FFFFFF', bold: true, align: 'center' }, { text: '주요 업무', fill: C.navy, color: 'FFFFFF', bold: true, align: 'center' }], [{ text: '정기 업무', fill: 'EEF1F5', bold: true, align: 'center' }, { text: T0.next }], [{ text: '교육', fill: 'EEF1F5', bold: true, align: 'center' }, { text: T0.nextEdu }]], [1.6, 10.85], { size: 12, rowH: [.4, 1.6, 1.1] })]));
  // 9 붙임: 사업장별 · 산출기준
  const rows = siteRows(A, r).slice(0, 12);
  if (rows.length > 1) S.push(slideBase('Ⅳ. 붙임 1 — 사업장별 성과', ++no).concat([Tb(.45, 1.15, 12.45, tblRows(['순위', '사업장', '조직', '업종', '기록일', '업무량', '예방', '환산가치', '달성률', 'SPI'], rows.map((x, i) => [i + 1, x.s.name, siteOrgLabel(x.s), [...x.st.jobs].map(j => JOBS[j].s).join('·'), x.st.days.size, nf(x.st.act), nf(x.st.prev), won(x.st.val), x.rate == null ? '-' : nf(x.rate, 1) + '%', nf(x.spi, 1)]), { align: ['c', '', 'c', 'c', 'r', 'r', 'r', 'r', 'r', 'r'] }), [.6, 2.8, 1.9, .9, .8, 1.1, .8, 1.3, 1.1, 1.15], { size: 10 })]));
  const bs = Object.values(TASK).filter(t => (t.v || PM.val[t.id]) && (!F.job || t.job === F.job));
  S.push(slideBase('Ⅳ. 붙임 2 — 가치 환산 산출기준', ++no).concat([Tb(.45, 1.15, 12.45, tblRows(['업종', '항목', '단위', '환산가치(원)', '산정 근거'], bs.map(t => [JOBS[t.job].s, t.n, t.u, nf(valOf(t.id)), PM.val[t.id] != null ? '고객사 협의값' : (t.b || '')]), { align: ['c', '', 'c', 'r', ''] }), [.8, 2.6, .7, 1.3, 7.05], { size: 10 }), T(.45, 6.55, 12.45, .4, '※ 「추정」 표시 값은 시중 단가 기반 예시이며, 고객사와 협의한 값으로 조정해 사용합니다.', { size: 10, color: C.gray })]));
  return S;
}
/* 슬라이드 → PPT */
async function slidesToPptx(S, name) {
  const pptx = new PptxGenJS(); pptx.layout = 'LAYOUT_WIDE'; pptx.author = APP.maker; pptx.company = APP.org; pptx.title = name;
  const dims = {}; const dim = async src => dims[src] || (dims[src] = await loadImg(src).then(i => [i.naturalWidth, i.naturalHeight]).catch(() => [1, 1]));
  for (const els of S) {
    const sl = pptx.addSlide(); sl.background = { color: 'FFFFFF' };
    for (const e of els) {
      if (e.t === 'rect') sl.addShape(e.r ? pptx.ShapeType.roundRect : pptx.ShapeType.rect, { x: e.x, y: e.y, w: e.w, h: e.h, fill: { color: e.fill, transparency: e.alpha != null ? Math.round((1 - e.alpha) * 100) : 0 }, line: e.line ? { color: e.line, width: .75 } : { type: 'none' }, rectRadius: e.r || 0 });
      else if (e.t === 'text') sl.addText(e.text, { x: e.x, y: e.y, w: e.w, h: e.h, fontFace: W_FONT, fontSize: e.size || 14, bold: !!e.bold, italic: !!e.it, color: e.color || C.ink, align: e.align || 'left', valign: e.valign || 'top', margin: 2, lineSpacingMultiple: e.line || 1.1, fit: 'shrink' });
      else if (e.t === 'img' && e.src) { const [iw, ih] = await dim(e.src); const o = { data: e.src, x: e.x, y: e.y, w: e.w, h: e.h }; if (e.contain) { const s = Math.min(e.w / iw, e.h / ih); o.w = iw * s; o.h = ih * s; o.x = e.x + (e.w - o.w) / 2; o.y = e.y + (e.h - o.h) / 2; } else if (e.cover) o.sizing = { type: 'cover', w: e.w, h: e.h }; if (e.alpha != null) o.transparency = Math.round((1 - e.alpha) * 100); sl.addImage(o); }
      else if (e.t === 'table') sl.addTable(e.rows.map(row => row.map(c => ({ text: c.text, options: { fill: { color: c.fill || 'FFFFFF' }, color: c.color || C.ink, bold: !!c.bold, align: c.align || 'left', valign: 'middle', colspan: c.colspan, fontFace: W_FONT, fontSize: e.size || 11 } }))), { x: e.x, y: e.y, w: e.w, colW: e.colW, rowH: e.rowH, border: { type: 'solid', color: 'BFC6D4', pt: .5 }, margin: .04, autoPage: false });
    }
    sl.addNotes(`${APP.name} ${APP.version} — Designed & Developed by Rat Rae Choi`);
  }
  return await pptx.write({ outputType: 'blob' });
}
/* 슬라이드 → PDF (16:9) */
function slideDom(els) {
  const d = document.createElement('div'); d.style.cssText = `position:relative;width:${SW * 96}px;height:${SH * 96}px;background:#fff;overflow:hidden;font-family:${FONT}`;
  els.forEach(e => {
    const s = `position:absolute;left:${e.x * 96}px;top:${e.y * 96}px;width:${e.w * 96}px;${e.h ? `height:${e.h * 96}px;` : ''}`;
    if (e.t === 'rect') d.insertAdjacentHTML('beforeend', `<div style="${s}background:#${e.fill};${e.line ? `border:1px solid #${e.line};` : ''}border-radius:${(e.r || 0) * 96}px;opacity:${e.alpha ?? 1}"></div>`);
    else if (e.t === 'text') d.insertAdjacentHTML('beforeend', `<div style="${s}display:flex;flex-direction:column;justify-content:${e.valign === 'middle' ? 'center' : 'flex-start'};text-align:${e.align || 'left'};font-size:${(e.size || 14) * 1.333}px;font-weight:${e.bold ? 800 : 400};font-style:${e.it ? 'italic' : 'normal'};color:#${e.color || C.ink};line-height:${(e.line || 1.1) * 1.18};white-space:pre-wrap;overflow:hidden">${esc(e.text)}</div>`);
    else if (e.t === 'img' && e.src) d.insertAdjacentHTML('beforeend', `<img src="${e.src}" style="${s}object-fit:${e.contain ? 'contain' : 'cover'};opacity:${e.alpha ?? 1}">`);
    else if (e.t === 'table') { const tw = e.colW.reduce((a, b) => a + b, 0); d.insertAdjacentHTML('beforeend', `<table style="${s}border-collapse:collapse;table-layout:fixed;font-size:${(e.size || 11) * 1.333}px"><colgroup>${e.colW.map(w => `<col style="width:${w / tw * 100}%">`).join('')}</colgroup>${e.rows.map((row, ri) => `<tr style="${e.rowH && e.rowH[ri] ? `height:${e.rowH[ri] * 96}px` : ''}">${row.map(c => `<td ${c.colspan ? `colspan="${c.colspan}"` : ''} style="border:1px solid #BFC6D4;padding:3px 6px;background:#${c.fill || 'FFFFFF'};color:#${c.color || C.ink};font-weight:${c.bold ? 700 : 400};text-align:${c.align || 'left'};vertical-align:middle;white-space:pre-wrap;word-break:keep-all;overflow-wrap:anywhere">${esc(c.text)}</td>`).join('')}</tr>`).join('')}</table>`); }
  });
  return d;
}
async function slidesToPdf(S, name) {
  const { jsPDF } = window.jspdf; const pdf = new jsPDF({ orientation: 'landscape', unit: 'in', format: [SW, SH], compress: true }); const host = $('#render');
  for (let i = 0; i < S.length; i++) {
    busy(true, `PDF 만드는 중… ${i + 1}/${S.length}장`);
    host.innerHTML = ''; const d = slideDom(S[i]); host.appendChild(d); await Promise.all([...d.querySelectorAll('img')].map(im => im.decode ? im.decode().catch(() => { }) : 0));
    const cv = await html2canvas(d, { scale: 1.4, backgroundColor: '#ffffff', logging: false }); if (i) pdf.addPage([SW, SH], 'landscape'); pdf.addImage(cv.toDataURL('image/jpeg', .86), 'JPEG', 0, 0, SW, SH);
  }
  host.innerHTML = ''; pdf.setProperties({ title: name, creator: `${APP.name} — ${APP.maker}` }); return pdf.output('blob');
}
async function outDeck(r, F, kind) {
  const A = aggregate(r, F); if (!A.recs.length) return toast('이 범위에 기록된 실적이 없습니다');
  busy(true, '발표자료 만드는 중…');
  try {
    const S = deckSlides(r, F), nm = `${fileStamp()}_${safeName(F.site ? SITE[F.site].name : scopeLabel(F))}_${periodTitle(r).replace(/[()\s]/g, '')}_업무실적_발표`;
    if (kind === 'pdf') await download(await slidesToPdf(S, nm), nm + '.pdf'); else await download(await slidesToPptx(S, nm), nm + '.pptx');
    toast('발표자료를 만들었습니다');
  } finally { busy(false); }
}

/* =====================================================================
 * 내용 3) 엑셀 — 성과 실적표 (르노삼성 월간업무실적표 형식) · 전사 관리현황 · 입력 양식
 * ===================================================================== */
const XL = { navy: 'FF0B1F8F', green: 'FF1E8B3A', head: 'FFDCE3F3', cat: 'FFEEF1F5', tot: 'FFF1F3F8', ik: 'FFE8F5EC' };
function xlBorder(c) { const b = { style: 'thin', color: { argb: 'FFBFC6D4' } }; c.border = { top: b, left: b, bottom: b, right: b }; }
function xlHead(ws, rowNo, vals, fill = XL.head) { const r = ws.getRow(rowNo); vals.forEach((v, i) => { const c = r.getCell(i + 1); c.value = v; c.font = { bold: true, name: W_FONT, size: 10, color: { argb: fill === XL.navy ? 'FFFFFFFF' : 'FF1C2333' } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } }; c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }; xlBorder(c); }); r.height = 30; }
function xlRow(ws, rowNo, vals, o = {}) { const r = ws.getRow(rowNo); vals.forEach((v, i) => { const c = r.getCell(i + 1); c.value = v; c.font = { name: W_FONT, size: 10, bold: !!o.bold }; if (o.fill) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: o.fill } }; c.alignment = { vertical: 'middle', wrapText: true, horizontal: typeof v === 'number' ? 'right' : (o.center || []).includes(i) ? 'center' : 'left' }; if (typeof v === 'number') c.numFmt = Number.isInteger(v) ? '#,##0' : '#,##0.0'; xlBorder(c); }); return r; }
function xlTitle(ws, t, sub, span) { ws.mergeCells(1, 1, 1, span); const c = ws.getCell(1, 1); c.value = t; c.font = { bold: true, size: 16, name: W_FONT, color: { argb: XL.navy } }; c.alignment = { horizontal: 'center', vertical: 'middle' }; ws.getRow(1).height = 30; ws.mergeCells(2, 1, 2, span); const s = ws.getCell(2, 1); s.value = sub; s.font = { size: 10, name: W_FONT, color: { argb: 'FF5B6475' } }; s.alignment = { horizontal: 'center' }; }
async function xlSave(wb, name) { wb.creator = APP.maker; wb.company = APP.org; const buf = await wb.xlsx.writeBuffer(); await download(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), name); }
async function outPerfXlsx(r, F) {
  const A = aggregate(r, F); if (!A.recs.length) return toast('이 범위에 기록된 실적이 없습니다');
  busy(true, '엑셀 실적표 만드는 중…');
  try {
    const pr = prevRange(UI.per || 'm', UI.ref || today()), P = aggregate(pr, F), Y = aggregate({ from: r.from.slice(0, 4) + '-01-01', to: r.to }, F);
    const wb = new ExcelJS.Workbook(), scope = scopeLabel(F), sub = `${scope} · ${fmtDs(r.from)} ~ ${fmtDs(r.to)} · 작성 ${fmtD(kstNow())} · ${APP.name}`;
    // 1) 요약
    const ws = wb.addWorksheet('요약', { views: [{ state: 'frozen', ySplit: 4 }] });
    xlTitle(ws, `${periodTitle(r)} 업무실적 요약 (성과 계수화)`, sub, 11);
    xlHead(ws, 4, ['성과 영역', '업종', '업무 항목', '단위', '계획', '당기 실적', '달성률(%)', '당기 금액(원)', '전기 실적', '전기 금액(원)', '누계 실적', '누계 금액(원)'].slice(0, 12));
    ws.columns = [14, 8, 30, 7, 10, 12, 10, 14, 12, 14, 12, 14].map(w => ({ width: w }));
    let n = 5;
    Object.entries(CATS).forEach(([ck, c]) => {
      const ids = Object.values(TASK).filter(t => t.c === ck && (!F.job || t.job === F.job) && ((A.tasks[t.id] || {}).act || (P.tasks[t.id] || {}).act || (Y.tasks[t.id] || {}).act || (A.tasks[t.id] || {}).n));
      if (!ids.length) return;
      ids.forEach(t => { const a = A.tasks[t.id] || {}, p = P.tasks[t.id] || {}, y = Y.tasks[t.id] || {}, avg = t.k === 'score' || t.k === 'avg'; xlRow(ws, n++, [c.n, JOBS[t.job].s, t.n, t.u, a.plan || null, avg ? (a.n ? +(a.sum / a.n).toFixed(1) : null) : a.act || 0, a.plan ? +(Math.min(a.act, a.plan) / a.plan * 100).toFixed(1) : null, (a.val || 0) + (t.k === 'amt' ? 0 : 0) || null, avg ? (p.n ? +(p.sum / p.n).toFixed(1) : null) : p.act || 0, p.val || null, avg ? (y.n ? +(y.sum / y.n).toFixed(1) : null) : y.act || 0, y.val || null], { center: [0, 1, 3] }); });
    });
    xlRow(ws, n++, ['합계', '', '', '', A.plan, A.act, A.rate == null ? null : +A.rate.toFixed(1), A.value, P.act, P.value, Y.act, Y.value], { bold: true, fill: XL.tot });
    if (A.autoN) { ws.mergeCells(n + 1, 1, n + 1, 12); const nc = ws.getCell(n + 1, 1); nc.value = `※ 직접 입력 ${A.manN}건 외 ${A.autoN}건(업종·일 단위)은 표준 업무량 × 성과 수준으로 자동 산출한 값입니다(현장 확인 후 조정).`; nc.font = { name: W_FONT, size: 9, color: { argb: 'FF5B6475' } }; n++; }
    n++; xlRow(ws, n++, ['성과지수(SPI)', '', A.spi ? +A.spi.total.toFixed(1) : '-', A.spi ? gradeOf(A.spi.total)[0] + ' ' + gradeOf(A.spi.total)[1] : ''], { bold: true, fill: XL.ik });
    highlights(A, 9).forEach(h => { ws.mergeCells(n, 1, n, 12); const cc = ws.getCell(n, 1); cc.value = '✔ ' + h; cc.font = { name: W_FONT, size: 10 }; n++; });
    // 2) 일자별 실적 (업종마다)
    const jobs = [...new Set(A.recs.map(x => x.job))];
    jobs.forEach(j => {
      const ts = Object.values(TASK).filter(t => t.job === j && ((Y.tasks[t.id] || {}).act || (A.tasks[t.id] || {}).act || (A.tasks[t.id] || {}).n));
      if (!ts.length) return;
      const w2 = wb.addWorksheet(`일자별_${JOBS[j].s}`, { views: [{ state: 'frozen', xSplit: 1, ySplit: 4 }] });
      xlTitle(w2, `${JOBS[j].n} 일자별 업무실적`, sub, ts.length + 2);
      xlHead(w2, 4, ['일자'].concat(ts.map(t => `${t.n}\n(${t.u})`)).concat(['합계']), XL.navy);
      w2.columns = [{ width: 12 }].concat(ts.map(() => ({ width: 11 }))).concat([{ width: 11 }]);
      let rr = 5;
      for (let d = parseD(r.from); d <= parseD(r.to); d = addDays(d, 1)) {
        const ds = isoD(d), rs = A.recs.filter(x => x.d === ds && x.job === j);
        const vals = ts.map(t => rs.reduce((a, x) => a + (+((x.q || {})[t.id] || 0)), 0));
        xlRow(w2, rr++, [`${d.getMonth() + 1}/${d.getDate()}(${WKK[d.getDay()]})`].concat(vals.map(v => v || null)).concat([ts.reduce((a, t, i) => a + (t.k === 'amt' || t.k === 'score' || t.k === 'avg' ? 0 : vals[i]), 0) || null]), { center: [0] });
      }
      const sumRow = (lab, X, k, fill) => xlRow(w2, rr++, [lab].concat(ts.map(t => { const q = X.tasks[t.id] || {}; return k === 'v' ? (q.val || null) : (t.k === 'score' || t.k === 'avg' ? (q.n ? +(q.sum / q.n).toFixed(1) : null) : (q.act || 0)); })).concat([null]), { bold: true, fill });
      const Aj = aggregate(r, Object.assign({}, F, { job: j })), Pj = aggregate(pr, Object.assign({}, F, { job: j })), Yj = aggregate({ from: r.from.slice(0, 4) + '-01-01', to: r.to }, Object.assign({}, F, { job: j }));
      sumRow('당기건수', Aj, 'n', XL.tot); sumRow('당기금액', Aj, 'v', XL.tot); sumRow('전기건수', Pj, 'n', XL.cat); sumRow('전기금액', Pj, 'v', XL.cat); sumRow('누계건수', Yj, 'n', XL.ik); sumRow('누계금액', Yj, 'v', XL.ik);
    });
    // 3) 사건사고 · 업무개선 · 교육 · 우수사례
    const evSheet = (nm, list, head, map) => { if (!list.length) return; const w3 = wb.addWorksheet(nm); xlTitle(w3, nm, sub, head.length); xlHead(w3, 4, head, XL.navy); w3.columns = head.map((h, i) => ({ width: [11, 22, 26, 14, 12, 40, 30, 12][i] || 16 })); list.forEach((e, i) => xlRow(w3, 5 + i, map(e), { center: [0] })); };
    evSheet('사건사고_예방적발', A.evBy.inc, ['일자', '사업장', '제목', '장소', '근무자', '내용', '조치결과', '금액(원)'], e => [fmtDs(e.d), (SITE[e.site] || {}).name, e.title, e.loc, e.worker, e.desc, e.action || '조치 진행', +e.amt || null]);
    evSheet('업무개선_주요작업', A.evBy.imp.concat(A.evBy.work), ['일자', '사업장', '제목', '구분', '장소', '내용', '개선 전 → 개선 후'], e => [fmtDs(e.d), (SITE[e.site] || {}).name, e.title, EVT[e.t].n, e.loc, e.desc, e.before || e.after ? `${e.before || '-'} → ${e.after || '-'}` : '']);
    evSheet('교육_우수사례_조직활성화', A.evBy.edu.concat(A.evBy.praise, A.evBy.org), ['일자', '사업장', '제목', '구분', '근무자·참석', '내용'], e => [fmtDs(e.d), (SITE[e.site] || {}).name, e.title, EVT[e.t].n, e.worker, e.desc]);
    // 4) 사업장별
    const rows = siteRows(A, r), w4 = wb.addWorksheet('사업장별_성과');
    xlTitle(w4, '사업장별 성과 순위', sub, 12); xlHead(w4, 4, ['순위', '사업장', '조직', '산업', '업종', '기록일', '업무량', '예방·적발', '환산가치(원)', '사건·활동', '달성률(%)', 'SPI', '등급'], XL.navy);
    w4.columns = [6, 26, 18, 12, 10, 8, 12, 10, 14, 10, 10, 8, 8].map(w => ({ width: w }));
    rows.forEach((x, i) => xlRow(w4, 5 + i, [i + 1, x.s.name, siteOrgLabel(x.s), INDS[x.s.ind] ? INDS[x.s.ind].s : '', [...x.st.jobs].map(j => JOBS[j].s).join('·'), x.st.days.size, x.st.act, x.st.prev, x.st.val, x.st.ev, x.rate == null ? null : +x.rate.toFixed(1), x.spi == null ? null : +x.spi.toFixed(1), gradeOf(x.spi)[0]], { center: [0, 2, 3, 4, 12] }));
    // 5) 산출기준
    const w5 = wb.addWorksheet('산출기준'); xlTitle(w5, '가치 환산 산출기준', sub, 5); xlHead(w5, 4, ['업종', '업무 항목', '단위', '1단위 환산가치(원)', '산정 근거'], XL.navy); w5.columns = [8, 30, 8, 16, 80].map(w => ({ width: w }));
    Object.values(TASK).filter(t => valOf(t.id)).forEach((t, i) => xlRow(w5, 5 + i, [JOBS[t.job].s, t.n, t.u, valOf(t.id), PM.val[t.id] != null ? '고객사 협의값' : t.b || ''], { center: [0, 2] }));
    await xlSave(wb, `${fileStamp()}_${safeName(F.site ? SITE[F.site].name : scope)}_${periodTitle(r).replace(/[()\s]/g, '')}_업무실적표.xlsx`);
    toast('엑셀 실적표를 만들었습니다');
  } finally { busy(false); }
}
async function outOrgXlsx(r, F) {
  busy(true, '전사 관리현황 만드는 중…');
  try {
    const A = aggregate(r, Object.assign({}, F, { site: '' })), wb = new ExcelJS.Workbook(), ws = wb.addWorksheet('월간보고관리현장');
    const sub = `${fmtDs(r.from)} ~ ${fmtDs(r.to)} · ${scopeLabel(Object.assign({}, F, { site: '' }))} · 작성 ${fmtD(kstNow())}`;
    xlTitle(ws, `'${r.from.slice(2, 4)}년 ${+r.from.slice(5, 7)}월 주요 업무실적 및 계획 관리 현장`, sub, 15);
    xlHead(ws, 4, ['구분', '부서명(조직)', '사업장명', '책임자', '인원(명)', '산업', '업종', '기록일수', '업무량', '예방·적발', '환산가치(원)', '사건·활동', '달성률(%)', 'SPI', '등급', '비고'], XL.navy);
    ws.columns = [6, 18, 26, 14, 9, 12, 10, 9, 12, 10, 14, 9, 10, 8, 7, 22].map(w => ({ width: w }));
    const list = sitesFiltered(Object.assign({}, F, { site: '' })).filter(s => A.sites[s.key] || !s.org || s.org !== 'best' || F.org === 'best');
    let n = 5, i = 0; const ordered = ORGS.map(o => o.k).concat(['u']);
    ordered.forEach(ok => list.filter(s => (s.user ? 'u' : s.org) === ok).sort((a, b) => b.total - a.total).forEach(s => {
      const st = A.sites[s.key], sub2 = st ? aggregate(r, { site: s.key, job: F.job || '' }) : null, g = sub2 && sub2.spi ? gradeOf(sub2.spi.total) : ['', ''];
      xlRow(ws, n++, [++i, siteOrgLabel(s), s.name, s.head, s.total || null, INDS[s.ind] ? INDS[s.ind].s : '', s.jobs.map(j => JOBS[j].s).join('·'), st ? st.days.size : 0, st ? st.act : null, st ? st.prev : null, st ? st.val : null, st ? st.ev : null, st && st.plan ? +(st.planAct / st.plan * 100).toFixed(1) : null, sub2 && sub2.spi ? +sub2.spi.total.toFixed(1) : null, g[0], st ? '' : '미보고(기록 없음)'], { center: [0, 7, 14], fill: st ? undefined : 'FFFFF4E5' });
    }));
    xlRow(ws, n, ['합계', '', `${i}개 사업장 (보고 ${Object.keys(A.sites).length})`, '', list.reduce((a, s) => a + (s.total || 0), 0), '', '', '', A.act, A.prevN, A.value, A.ev.length, A.rate == null ? null : +A.rate.toFixed(1), A.spi ? +A.spi.total.toFixed(1) : null, '', ''], { bold: true, fill: XL.tot });
    await xlSave(wb, `${fileStamp()}_전사_월간실적및계획_관리현황.xlsx`); toast('관리현황 엑셀을 만들었습니다');
  } finally { busy(false); }
}
async function outEntryTemplate() {
  const wb = new ExcelJS.Workbook(), cur = SITE[V.entry.site];
  const g = wb.addWorksheet('작성 안내'); g.columns = [{ width: 110 }];
  ['에스텍 성과 관리 시스템 — 일일 실적 일괄 입력 양식', '', '1) 업종별 시트(보안·미화·시설·주차·안내)에 한 줄 = 한 사업장의 하루 실적을 적습니다.', '2) 「일자」는 2026-11-20 처럼, 「사업장명」은 프로그램 사업장 목록의 이름과 같게 적습니다(목록에 없으면 먼저 사업장 추가).', '3) 업무 항목 칸에는 숫자만 적습니다. 빈 칸은 0으로 봅니다. 「금액」 칸은 원 단위.', '4) 같은 사업장·같은 날·같은 업종을 다시 불러오면 그 기록을 바꿉니다(사건·사진은 유지).', '', 'Designed & Developed by Rat Rae Choi'].forEach((t, i) => { const c = g.getCell(i + 1, 1); c.value = t; c.font = { name: W_FONT, size: i ? 11 : 15, bold: !i, color: { argb: i ? 'FF1C2333' : XL.navy } }; });
  Object.entries(JOBS).forEach(([j, J]) => {
    const ts = TASKS[j], ws = wb.addWorksheet(J.s, { views: [{ state: 'frozen', xSplit: 2, ySplit: 1 }] });
    const head = ['일자', '사업장명'].concat(ts.map(t => `${t.n}(${t.u})`)).concat(ts.filter(t => t.amt).map(t => `${t.n} 금액(원)`)).concat(['메모']);
    xlHead(ws, 1, head, XL.navy); ws.columns = head.map((h, i) => ({ width: i === 1 ? 26 : i ? 12 : 12 }));
    ws.getRow(2).values = [today(), cur && cur.jobs.includes(j) ? cur.name : ''];
  });
  await xlSave(wb, `에스텍_성과관리_일괄입력양식_${today()}.xlsx`);
}
async function importEntryXlsx(file) {
  busy(true, '엑셀을 읽는 중…');
  try {
    const wb = new ExcelJS.Workbook(); await wb.xlsx.load(await file.arrayBuffer()); let ok = 0, miss = new Set();
    Object.entries(JOBS).forEach(([j, J]) => {
      const ws = wb.getWorksheet(J.s); if (!ws) return;
      const head = ws.getRow(1).values.slice(1).map(v => String(v || '').trim());
      ws.eachRow((row, rn) => {
        if (rn === 1) return; const v = row.values.slice(1); let d = v[0]; if (d instanceof Date) d = isoD(new Date(d.getTime() + d.getTimezoneOffset() * 60000)); d = String(d || '').trim().replace(/\./g, '-'); if (!/^\d{4}-\d{1,2}-\d{1,2}/.test(d)) return; d = isoD(parseD(d.replace(/-(\d)(?!\d)/g, '-0$1')));
        const nm = String(v[1] || '').trim(); if (!nm) return; const s = SITE_LIST.find(x => x.name === nm) || SITE_LIST.find(x => x.name.replace(/\s/g, '') === nm.replace(/\s/g, '')); if (!s) { miss.add(nm); return; }
        const cur = getRec(s.key, j, d) || { q: {}, a: {}, ev: [], note: '' }; const q = Object.assign({}, cur.q), a = Object.assign({}, cur.a);
        TASKS[j].forEach(t => { const i = head.indexOf(`${t.n}(${t.u})`); if (i >= 0 && v[i] != null && v[i] !== '') { const x = +((v[i] && v[i].result) ?? v[i]); if (!isNaN(x)) { if (x) q[t.id] = x; else delete q[t.id]; } } const ia = head.indexOf(`${t.n} 금액(원)`); if (ia >= 0 && +v[ia]) a[t.id] = +v[ia]; });
        const im = head.indexOf('메모'); putRec({ d, site: s.key, job: j, q, a, ev: cur.ev || [], note: im >= 0 && v[im] ? String(v[im]) : cur.note || '', by: cur.by }); ok++;
      });
    });
    busy(false); renderAll(); toast(`${ok}건을 불러왔습니다${miss.size ? ` · 목록에 없는 사업장 ${miss.size}곳: ${[...miss].slice(0, 3).join(', ')}` : ''}`, 6000);
  } catch (e) { busy(false); toast('엑셀을 읽지 못했습니다: ' + (e.message || e), 5000); }
}

/* =====================================================================
 * 내용 4) 운영실태·품질점검 — 사업장 보고서 · 전사 종합 결과보고
 * ===================================================================== */
function qcSecChart(q, k) {
  const items = qcItems(q.job, q.ind).filter(i => i.s === k), vals = items.map(i => q.sc[i.k] && q.sc[i.k].s !== '' && q.sc[i.k].s != null ? +q.sc[i.k].s : null);
  return chartPng('bar', { title: `${QC_SECN[k][0]}(${QC_SECN[k][1]}) 점검 결과`, labels: items.map(i => i.n.replace(/\(.*\)/, '').slice(0, 8)), bars: [{ name: '점수', data: vals.map(v => v || 0), color: k === 'site' ? '#1B7A34' : '#2A44D4' }] }, 1100, 380);
}
function qcSiteBlocks(q) {
  const s = qcSite(q), sc = qcScore(q), g = gradeOf(sc.total), items = qcItems(q.job, q.ind), B = [];
  B.push({ k: 'title', t: `${q.d.slice(2, 4)}년 ${JOBS[q.job].s} 품질점검 보고서`, sub: `${s.name} · ${siteOrgLabel(s)} · 점검일 ${fmtD(q.d)} · 점검자 ${q.inspector || '-'}` });
  B.push({ k: 'h', t: '§ 종합 품질점검 결과' });
  B.push({ k: 'table', head: ['구분', '부문점수', '배점(비율)', '평가점수'], w: [2.6, 1, 1, 1], align: ['', 'r', 'c', 'r'], rows: ['gen', 'risk', 'env', 'site'].map(k => [`${QC_SECN[k][0]} (${QC_SECN[k][1]})`, sc.sec[k].excl ? '점검제외' : nf(sc.sec[k].avg, 1), QC_W[k] + '%', sc.sec[k].excl ? '-' : nf(sc.sec[k].w, 1)]).concat([{ tot: true, cells: ['총 합계', '', '100%', nf(sc.total, 1)] }]) });
  B.push({ k: 'img', src: chartPng('bar', { title: '부문별 점수', labels: ['일반관리', '위험관리', '업무환경', '현장품질'], bars: [{ name: '부문점수', data: ['gen', 'risk', 'env', 'site'].map(k => sc.sec[k].avg || 0), color: '#0B1F8A' }] }, 1100, 360), wIn: 6, ratio: .33 });
  B.push({ k: 'box', title: `※ 종합 품질점검 결과 점수 ${nf(sc.total, 1)}점 — ${g[0]} ${g[1]}`, items: ['불합격(미흡·불량) 항목은 개선방안을 찾아 빠른 시일 내에 품질을 향상시킨다.', '현장 여건에 따라 점검 가능 구역만 체크하였으며 시차에 따라 다를 수 있음'] });
  ['gen', 'risk', 'env', 'site'].forEach(k => {
    if (sc.sec[k].excl) { B.push({ k: 'h', t: `§ ${QC_SECN[k][0]} (${QC_SECN[k][1]}) — 점검제외` }); return; }
    const its = items.filter(i => i.s === k); const any = its.some(i => q.sc[i.k]);
    B.push({ k: 'h', t: `§ ${QC_SECN[k][0]} (${QC_SECN[k][1]}) — 평균 ${nf(sc.sec[k].avg, 1)}점` });
    if (!any) { B.push({ k: 'p', t: q.fixed && q.fixed[k] != null ? `부문 점수 ${nf(q.fixed[k], 1)}점 (${q.ref || '기록'})` : '항목별 점검 기록이 없습니다.' }); return; }
    B.push({ k: 'img', src: qcSecChart(q, k), wIn: 6.4, ratio: .34 });
    B.push({ k: 'table', head: ['구역 · 항목', '점수', '내 용'], w: [1.6, .7, 4.6], align: ['', 'c', ''], rows: its.map(i => { const v = q.sc[i.k] || {}; return [i.n, v.s === '' || v.s == null ? '해당없음' : nf(v.s, 1), v.c || (v.s >= 83.3 ? '양호' : v.s != null && v.s !== '' ? '개선 요망' : '')]; }).concat([{ tot: true, cells: ['평점', nf(sc.sec[k].avg, 1) + '점', ''] }]) });
  });
  B.push({ k: 'h', t: '§ 개선사항 · 후속조치' });
  const bad = items.filter(i => q.sc[i.k] && q.sc[i.k].s !== '' && q.sc[i.k].s != null && +q.sc[i.k].s < 83.3);
  B.push({ k: 'table', head: ['부문', '항목', '점수', '개선 요망 사항'], w: [1.2, 1.6, .6, 3.5], align: ['c', '', 'c', ''], rows: bad.length ? bad.map(i => [QC_SECN[i.s][1], i.n, nf(q.sc[i.k].s, 1), q.sc[i.k].c || '개선 요망']) : [['-', '미흡 항목 없음', '-', '현 수준 유지']] });
  if (q.note) B.push({ k: 'p', t: '종합 의견: ' + q.note });
  if (q.note && /제외|이관/.test(q.note) === false) { } else if (q.note) { }
  return B;
}
async function outQCSite(q, kind) {
  const s = qcSite(q), nm = `${fileStamp()}_${safeName(s.name)}_${q.d.slice(0, 4)}_품질점검보고서`;
  busy(true, '품질점검 보고서 만드는 중…');
  try {
    if (kind === 'pptx' || kind === 'pdfdeck') { await download(await slidesToPptx(qcSlides(q), nm), nm + '.pptx'); }
    else if (kind === 'pdf') await download(await blocksToPdf(qcSiteBlocks(q), nm), nm + '.pdf');
    else await download(await packDocx(blocksToDocx(qcSiteBlocks(q)), nm), nm + '.docx');
    toast('품질점검 보고서를 만들었습니다');
  } catch (e) { console.error(e); toast('만들지 못했습니다: ' + (e.message || e), 5000); } finally { busy(false); }
}
function qcSlides(q) {
  const s = qcSite(q), sc = qcScore(q), g = gradeOf(sc.total), items = qcItems(q.job, q.ind), S = []; let no = 1;
  S.push([Rc(0, 0, SW, SH, '0C2350'), Im(SW * .5, 0, SW * .5, SH, ASSET.fig[JOBS[q.job].fig] || ASSET.hero, { cover: true, alpha: .85 }), Rc(.7, 1.6, .14, 1.4, C.green),
    T(1.0, 1.5, 6.4, .5, `${s.name} · ${siteOrgLabel(s)}`, { size: 15, color: 'B9C3EC' }), T(1.0, 2.0, 6.4, 1.3, `'${q.d.slice(2, 4)}년 ${JOBS[q.job].s} 품질점검 보고서`, { size: 34, bold: true, color: 'FFFFFF' }),
    T(1.0, 3.4, 6.4, .5, `점검일 ${fmtD(q.d)} · 점검자 ${q.inspector || '-'}`, { size: 13, color: 'D7DEFF' }), Rc(1.0, 4.3, 3.6, 1.3, 'FFFFFF', { r: .12 }), T(1.2, 4.38, 3.2, .35, '종합 점수', { size: 12, color: C.gray, bold: true }), T(1.2, 4.7, 3.2, .8, `${nf(sc.total, 1)}점  ${g[0]} ${g[1]}`, { size: 26, bold: true, color: C.navy }), Im(1.0, 6.0, .9, .9, ASSET.icon), T(2.05, 6.15, 5, .5, APP.name, { size: 13, bold: true, color: 'FFFFFF' })]);
  S.push(slideBase('현장 품질평가 결과 — 종합', ++no, s.name).concat([Tb(.45, 1.2, 5.6, tblRows(['구분', '부문점수', '배점', '평가점수'], ['gen', 'risk', 'env', 'site'].map(k => [QC_SECN[k][0] + '\n(' + QC_SECN[k][1] + ')', sc.sec[k].excl ? '점검제외' : nf(sc.sec[k].avg, 1), QC_W[k] + '%', sc.sec[k].excl ? '-' : nf(sc.sec[k].w, 1)]).concat([{ tot: true, cells: ['총 합계', '', '100%', nf(sc.total, 1)] }]), { align: ['', 'r', 'c', 'r'] }), [2.4, 1.1, .9, 1.2], { size: 12, rowH: [.4, .6, .6, .6, .6, .45] }),
    Im(6.3, 1.15, 6.6, 3.4, chartPng('bar', { title: '부문별 점수', labels: ['일반관리', '위험관리', '업무환경', '현장품질'], bars: [{ name: '부문점수', data: ['gen', 'risk', 'env', 'site'].map(k => sc.sec[k].avg || 0), color: '#0B1F8A' }] }, 1320, 680)),
    Rc(.45, 4.8, 12.45, 1.9, 'EEF7F1', { r: .1 }), T(.7, 4.9, 12, 1.7, `※ 종합 품질점검 결과 점수 ${nf(sc.total, 1)}점 (${g[1]})\n- 불합격 품목에 대해서는 개선방안을 찾아 빠른 시일 내에 품질을 향상시킨다.\n${q.note ? '- ' + q.note : ''}`, { size: 14, color: C.ink, line: 1.4 })]));
  ['gen', 'risk', 'env', 'site'].forEach(k => {
    if (sc.sec[k].excl) return; const its = items.filter(i => i.s === k); if (!its.some(i => q.sc[i.k])) return;
    const half = k === 'site' && its.length > 8;
    S.push(slideBase(`${QC_SECN[k][0]} (${QC_SECN[k][1]}) — 평균 ${nf(sc.sec[k].avg, 1)}점`, ++no, s.name).concat([Im(.45, 1.1, 5.4, 2.6, qcSecChart(q, k)), Tb(6.05, 1.15, 6.85, tblRows(['구역 · 항목', '점수', '내 용'], its.slice(0, half ? 12 : 10).map(i => { const v = q.sc[i.k] || {}; return [i.n, v.s === '' || v.s == null ? '-' : nf(v.s, 1), v.c || '']; }), { align: ['', 'c', ''] }), [2, .7, 4.15], { size: 9.5 })]));
  });
  return S;
}
function qcSummaryBlocks(yr) {
  const L = qcYearList(yr), B = [];
  const d0 = L.length ? L.map(x => x.q.d).sort()[0] : '', d1 = L.length ? L.map(x => x.q.d).sort().pop() : '';
  B.push({ k: 'title', t: '사업장 운영현황 / 품질점검 결과보고', approval: ['담 당', '팀 장', '대표이사'], sub: `${fmtD(kstNow())} · ${(UI.manager && UI.manager.org) || APP.branch}` });
  B.push({ k: 'h', t: '1. 목 적' }); B.push({ k: 'p', t: '□ 각 사별 중요 사업장을 대상으로 품질점검을 실시하여 사업장별 문제점 분석 및 개선방향에 대한 진단보고서를 제공하고, 사업장 운영 표준화와 서비스 품질 향상을 지원하고자 함' });
  B.push({ k: 'h', t: '2. 개 요' });
  const orgs = [...new Set(L.map(x => x.s.org || 'u'))];
  B.push({ k: 'p', t: `□ 점검기간 : ${d0 ? fmtDs(d0) + ' ~ ' + fmtDs(d1) : '-'}\n□ 점검내용 : 행정서류, 관련법령 준수, 법정의무교육 서류, 재고관리, 현장품질, SOP 준수 등\n□ 점검대상 : 총 ${L.length}개 사업장 점검 완료` });
  B.push({ k: 'table', head: ['구분'].concat(orgs.map(o => orgName(o))), w: [1].concat(orgs.map(() => 1.6)), align: Array(orgs.length + 1).fill('c'), size: 15, rows: [['Site'].concat(orgs.map(o => L.filter(x => (x.s.org || 'u') === o).length + '')), ['대상\n사업장'].concat(orgs.map(o => L.filter(x => (x.s.org || 'u') === o).map(x => x.s.name).join(', ')))] });
  const unc = SITE_LIST.filter(s => s.org !== 'best' && !L.some(x => x.s.key === s.key)).slice(0, 8);
  if (unc.length) { B.push({ k: 'p', t: '- 미수검 사업장 현황' }); B.push({ k: 'table', head: ['구분', 'Site', '미수검 사유', '비고'], w: [1.2, 2, 3, 1], align: ['c', '', '', ''], size: 15, rows: unc.map(s => [orgName(s.org), s.name, '일정 협의 후 실시 예정', '']) }); }
  B.push({ k: 'h', t: '3. 종합평가 결과' }); B.push({ k: 'h2', t: '사업유형별' });
  const inds = [...new Set(L.map(x => x.q.ind || x.s.ind))], band = v => v >= 90 ? 0 : v >= 80 ? 1 : v >= 70 ? 2 : 3;
  const cnt = [0, 1, 2, 3].map(b => L.filter(x => band(x.sc.total) === b).length);
  B.push({ k: 'table', head: ['구분', '90점 이상', '80점 이상', '70점 이상', '70점 미만', '계'], w: [1.1, 1.6, 1.6, 1.6, 1.4, .6], align: ['c', 'c', 'c', 'c', 'c', 'c'], size: 15, rows: [['SITE'].concat(cnt.map(String)).concat([String(L.length)])].concat(inds.map(k => [INDS[k] ? INDS[k].s : k].concat([0, 1, 2, 3].map(b => L.filter(x => (x.q.ind || x.s.ind) === k && band(x.sc.total) === b).map(x => x.s.name).join('\n'))).concat([String(L.filter(x => (x.q.ind || x.s.ind) === k).length)]))) });
  B.push({ k: 'h2', t: '평점순 (세부점수 포함)' });
  const av = k => { const v = L.map(x => x.sc.sec[k].w).filter(x => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
  B.push({ k: 'table', head: ['순위', 'SITE', '일반관리\n(행정관리) 10%', '위험관리\n(법령준수) 10%', '품질관리 A\n(업무환경) 5%', '품질관리 B\n(현장품질) 75%', '평점\n100%'], w: [.5, 2, 1, 1, 1, 1, .8], align: ['c', '', 'r', 'r', 'r', 'r', 'r'], size: 15, rows: L.map((x, i) => [String(i + 1), x.s.name].concat(['gen', 'risk', 'env', 'site'].map(k => x.sc.sec[k].excl ? '점검제외' : nf(x.sc.sec[k].w, 1))).concat([nf(x.sc.total, 1)])).concat([{ tot: true, cells: ['평균', `총 ${L.length}개 SITE`].concat(['gen', 'risk', 'env', 'site'].map(k => nf(av(k), 1))).concat([nf(L.reduce((a, x) => a + x.sc.total, 0) / (L.length || 1), 1)]) }]) });
  if (L.length) B.push({ k: 'img', src: chartPng('bar', { title: '사업장별 평점', labels: L.map(x => x.s.name.slice(0, 6)), bars: [{ name: '평점', data: L.map(x => x.sc.total), color: '#1B7A34' }] }, 1200, 430), wIn: 6.6, ratio: .36 });
  B.push({ k: 'h', t: '4. 후속조치 및 주요 Issue' });
  const weak = ['gen', 'risk', 'env', 'site'].map(k => [k, av(k) != null ? av(k) / QC_W[k] * 100 : null]).filter(x => x[1] != null).sort((a, b) => a[1] - b[1])[0];
  B.push({ k: 'bullets', items: ['■ 사업장별 점검결과 및 개선사항 보고서 각 부서 제공', '► 점검보고서 : 해당 사업장별 지사장에게 보고서 및 PDF본 배포', '► 후속조치 : 각 사별 보고서 기반 자체 개선, 필요시 지원팀 지원요청', weak ? `□ 전사 취약 부문 : ${QC_SECN[weak[0]][0]}(${QC_SECN[weak[0]][1]}) 평균 ${nf(weak[1], 1)}점 — 집중 개선 필요` : '', `□ 70점 미만 사업장 ${cnt[3]}곳 · 70점대 ${cnt[2]}곳 — 재점검 일정 협의`, '□ 법정교육(건물위생관리교육·관리감독자교육·경비원 직무교육) 미실시 사업장 발생 방지 관심 要'].filter(Boolean) });
  B.push({ k: 'p', t: '# 별첨. 사업장별 운영실태 및 품질점검 결과 보고서 — 「🔍 운영실태·품질점검」 탭에서 사업장별 출력          - 이 상 -' });
  return B;
}
async function outQCSummary(yr, kind) {
  if (!qcYearList(yr).length) return toast(`${yr}년 점검 결과가 없습니다`);
  const nm = `${fileStamp()}_${yr}_전사_사업장_운영실태_및_품질점검_결과`;
  busy(true, '종합 결과보고 만드는 중…');
  try { const B = qcSummaryBlocks(yr); if (kind === 'pdf') await download(await blocksToPdf(B, nm), nm + '.pdf'); else await download(await packDocx(blocksToDocx(B), nm), nm + '.docx'); toast('종합 결과보고를 만들었습니다'); }
  catch (e) { console.error(e); toast('만들지 못했습니다: ' + (e.message || e), 5000); } finally { busy(false); }
}
async function outQCSummaryXlsx(yr) {
  const L = qcYearList(yr); if (!L.length) return toast(`${yr}년 점검 결과가 없습니다`);
  const wb = new ExcelJS.Workbook(), ws = wb.addWorksheet('평점순');
  xlTitle(ws, `${yr}년 사업장 운영실태 및 품질점검 결과 — 평점순`, `총 ${L.length}개 SITE · 작성 ${fmtD(kstNow())} · ${APP.name}`, 10);
  xlHead(ws, 4, ['순위', '조직', 'SITE', '산업', '업종', '점검일', '일반관리(10%)', '위험관리(10%)', '업무환경(5%)', '현장품질(75%)', '평점', '등급', '비고'], XL.navy);
  ws.columns = [6, 16, 24, 10, 8, 12, 12, 12, 12, 12, 9, 8, 30].map(w => ({ width: w }));
  L.forEach((x, i) => xlRow(ws, 5 + i, [i + 1, siteOrgLabel(x.s), x.s.name, INDS[x.q.ind || x.s.ind] ? INDS[x.q.ind || x.s.ind].s : '', JOBS[x.q.job].s, fmtDs(x.q.d)].concat(['gen', 'risk', 'env', 'site'].map(k => x.sc.sec[k].excl ? '점검제외' : +x.sc.sec[k].w.toFixed(1))).concat([+x.sc.total.toFixed(1), gradeOf(x.sc.total)[0], x.q.note || '']), { center: [0, 3, 4, 5, 11] }));
  const ws2 = wb.addWorksheet('항목별_상세'); xlHead(ws2, 1, ['SITE', '부문', '항목', '점수', '내용'], XL.navy); ws2.columns = [24, 16, 30, 8, 60].map(w => ({ width: w })); let n = 2;
  L.forEach(x => qcItems(x.q.job, x.q.ind).forEach(it => { const v = x.q.sc[it.k]; if (!v) return; xlRow(ws2, n++, [x.s.name, QC_SECN[it.s][0], it.n, v.s === '' || v.s == null ? '-' : +v.s, v.c || '']); }));
  await xlSave(wb, `${fileStamp()}_${yr}_품질점검_평점표.xlsx`); toast('평점표 엑셀을 만들었습니다');
}
