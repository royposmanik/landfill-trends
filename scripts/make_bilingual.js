const fs = require('fs');
const dir = process.argv[2];
let h = fs.readFileSync(dir + '/index.html', 'utf8');
const must = (c, m) => { if (!c) { console.error('FAILED: ' + m); process.exit(1); } };
const rep = (a, b, all) => { must(h.includes(a), 'rep ' + a.slice(0, 60)); h = all ? h.split(a).join(b) : h.replace(a, b); };

const en = JSON.parse(fs.readFileSync(dir + '/en_texts.json', 'utf8'));
const he = require(dir + '/he_static.js');
must(en.length === he.length, 'lengths ' + en.length + ' vs ' + he.length);
const EX = require(dir + '/he_exact.js');
EX['Landfill site'] = 'אתר הטמנה';
const iso2 = JSON.parse(fs.readFileSync(dir + '/iso2.json', 'utf8')); iso2.XKX = 'XK';

// 1. Static text: wrap every block in an English and a Hebrew span (menus are handled by the i18n-sel drawing).
const bodyStart = h.indexOf('<div class="lf">'), bodyEnd = h.indexOf('<script');
let body = h.slice(bodyStart, bodyEnd);
const skip = new Set(['OECD member countries, year by year (2000–2024)', 'World Bank survey, one snapshot (about 2016)', 'Share landfilled (%)', 'Landfilled per person (kg/yr)', 'Waste generated per person (kg/yr)', 'Share recycled (%)', 'Whole world', 'Europe and the Middle East']);
let wrapped = 0;
en.forEach((e, i) => {
  if (skip.has(e)) return;
  const key = '>' + e + '<';
  if (!body.includes(key)) { console.log('not found:', e.slice(0, 60)); return; }
  const n = body.split(key).length - 1;
  body = body.split(key).join('><span class="lf-en">' + e + '</span><span class="lf-he-t" lang="he">' + he[i] + '</span><');
  wrapped += n;
});
body = body.split('>kg/yr<').join('><span class="lf-en">kg/yr</span><span class="lf-he-t" lang="he">ק"ג בשנה</span><');
body = body.split(' data-read lang="en"').join(' data-read');
// Menus follow the language through a drawing.
for (const id of ['map-source', 'map-metric', 'map-zoom', 'trend-metric', 'rank-metric']) {
  must(body.includes('id="' + id + '"'), 'select ' + id);
  body = body.replace('id="' + id + '"', 'id="' + id + '" data-draw="i18n-sel"');
}
// Language button at the top.
must(body.includes('<header class="lf-head" id="overview">'), 'header');
body = body.replace('<header class="lf-head" id="overview">', '<header class="lf-head" id="overview">\n    <div class="lf-langbar"><button type="button" class="lf-btn" id="lf-lang" title="Switch language · החלפת שפה"><span class="lf-en" lang="he">עברית</span><span class="lf-he-t">English</span></button></div>');
h = h.slice(0, bodyStart) + body + h.slice(bodyEnd);
console.log('wrapped', wrapped);

// 2. CSS
rep('</style>', [
  '.lf-langbar { display: flex; justify-content: flex-end; }',
  '.lf .lf-he-t { display: none; }',
  '.lf.lf-he .lf-he-t { display: inline; }',
  '.lf.lf-he .lf-en { display: none; }',
  '.lf.lf-he { direction: rtl; }',
  '.lf.lf-he .lf-chart, .lf.lf-he .lf-player { direction: ltr; }',
  '.lf.lf-he .lf-tip, .lf.lf-he .lf-fail { direction: rtl; text-align: right; }',
  '.lf.lf-he .lf-table th { text-align: right; }',
  '.lf.lf-he .lf-table th, .lf.lf-he .lf-table td { padding: 6px 0 6px 10px; }',
  '.lf.lf-he .lf-details ul { padding-left: 0; padding-right: 1.2em; }',
  '</style>'].join('\n'));

// 3. Scripts: language runtime first, drawings registered through it.
const i18n = fs.readFileSync(dir + '/i18n_js.js', 'utf8').replace('__ISO2__', JSON.stringify(iso2)).replace('__EXACT__', JSON.stringify(EX));
const firstScript = h.indexOf('<script>');
h = h.slice(0, firstScript) + '<script>' + i18n + '</script>\n' + h.slice(firstScript);
let regs = 0;
h = h.replace(/dash\.draw\('([\w-]+)', /g, (m, n) => { regs++; return "lfReg('" + n + "', "; });
console.log('drawings registered', regs);

// Redraw everything that was cached per width when the language changes.
rep("const key = W + '|' + S.mapZoom;", "const key = W + '|' + S.mapZoom + '|' + window.LF_LANG;");
rep("if (k.key !== W + '') {", "if (k.key !== W + '|' + window.LF_LANG) {");
rep("k.proj = proj; k.key = W + '';", "k.proj = proj; k.key = W + '|' + window.LF_LANG;");
rep("if (k.key !== W + 'x' + H) {\n        k.key = W + 'x' + H;", "if (k.key !== W + 'x' + H + window.LF_LANG) {\n        k.key = W + 'x' + H + window.LF_LANG;");
// Tooltips and GIF titles.
rep("t.replaceChildren(...kids); t.hidden = false;", "t.replaceChildren(...kids); if (window.lfTranslate) window.lfTranslate(t); t.hidden = false;");
rep("ctx.fillText(c.title(), 12, head / 2, cw - 110);", "ctx.fillText(window.lfTr ? window.lfTr(c.title()) : c.title(), 12, head / 2, cw - 110);");
rep("for (const h of ['Landfill', 'District', 'Planned expansion', 'Timing'])", "for (const h of ['Landfill site', 'District', 'Planned expansion', 'Timing'])");

// 4. Language switch.
const last = h.lastIndexOf('</script>');
h = h.slice(0, last) + `
(function () {
  const roots = () => document.querySelectorAll('.lf');
  const apply = () => roots().forEach((r) => r.classList.toggle('lf-he', window.LF_LANG === 'he'));
  apply();
  const drawn = () => [...new Set([...document.querySelectorAll('[data-draw]')].map((e) => e.dataset.draw))];
  document.querySelectorAll('#lf-lang').forEach((b) => b.addEventListener('click', () => {
    window.LF_LANG = window.LF_LANG === 'he' ? 'en' : 'he';
    try { localStorage.setItem('lf-lang', window.LF_LANG); } catch (e) { /* storage unavailable */ }
    apply();
    drawn().forEach((n) => dash.draw(n));
  }));
})();
` + h.slice(last);
fs.writeFileSync(dir + '/index.html', h);
console.log('ok', h.length);
