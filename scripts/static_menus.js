// Menus without a drawing: each menu carries English and Hebrew options (Hebrew values prefixed "he:"),
// and the language switch shows one set and keeps the same choice selected.
const fs = require('fs');
const dir = process.argv[2];
const f = dir + '/index.html';
let h = fs.readFileSync(f, 'utf8');
const EX = require(dir + '/he_exact.js');
const LAB = { 'Data': 'נתונים', 'Measure': 'מדד', 'Zoom': 'תצוגה', 'Rank by': 'דירוג לפי' };
const must = (c, m) => { if (!c) { console.error('FAILED: ' + m); process.exit(1); } };
let n = 0;
h = h.replace(/<label class="lf-selwrap" data-draw="i18n-sel" data-label="([^"]+)"><span class="lf-sel-label">[^<]*<\/span><select([^>]*)>([\s\S]*?)<\/select><\/label>/g, (m, lab, attrs, opts) => {
  n++;
  const he = [];
  opts.replace(/<option value="([^"]+)"( selected)?>([^<]*)<\/option>/g, (mm, v, sel, t) => {
    must(EX[t.trim()], 'no Hebrew for option ' + t);
    he.push('<option value="he:' + v + '" hidden>' + EX[t.trim()] + '</option>');
    return mm;
  });
  return '<label class="lf-selwrap"><span class="lf-sel-label"><span class="lf-en">' + lab + '</span><span class="lf-he-t" lang="he">' + LAB[lab] + '</span></span><select' + attrs + '>' + opts.replace(/\s*$/, '') + '\n        ' + he.join('\n        ') + '\n      </select></label>';
});
must(n === 5, 'menus ' + n);
// Drop the menu drawing.
const a = h.indexOf("  window.lfReg('i18n-sel', (el) => {");
must(a > 0, 'i18n-sel drawing');
const b = h.indexOf('\n  });', a) + '\n  });'.length;
h = h.slice(0, a) + "  // Menu value without the Hebrew option prefix.\n  window.lfVal = (s) => String(s.value).replace(/^he:/, '');" + h.slice(b);
must(!h.includes('i18n-sel'), 'leftover i18n-sel');
// Listeners read the value through lfVal.
const reps = [
  ["{ LF.st.metric = s.value; dash.draw('trend'); }", "{ LF.st.metric = lfVal(s); dash.draw('trend'); }"],
  ["{ LF.st.rank = s.value; dash.draw('rank');", "{ LF.st.rank = lfVal(s); dash.draw('rank');"],
  ["{ S.mapMetric = s.value; redrawAll(); }", "{ S.mapMetric = lfVal(s); redrawAll(); }"],
  ["{ S.mapZoom = s.value; dash.draw('map'); }", "{ S.mapZoom = lfVal(s); dash.draw('map'); }"],
  ["S.mapSource = s.value; stop();", "S.mapSource = lfVal(s); stop();"],
  ["x.disabled = s.value !== 'oecd';", "x.disabled = lfVal(s) !== 'oecd';"]
];
for (const [x, y] of reps) { must(h.includes(x), 'listener ' + x.slice(0, 40)); h = h.replace(x, y); }
// The language switch shows one option set and keeps the choice.
const ap = "const apply = () => roots().forEach((r) => r.classList.toggle('lf-he', window.LF_LANG === 'he'));";
must(h.includes(ap), 'apply');
h = h.replace(ap, `const apply = () => {
    const he = window.LF_LANG === 'he';
    roots().forEach((r) => r.classList.toggle('lf-he', he));
    document.querySelectorAll('select').forEach((s) => {
      if (![...s.options].some((o) => o.value.startsWith('he:'))) return;
      const v = lfVal(s);
      for (const o of s.options) o.hidden = o.value.startsWith('he:') !== he;
      s.value = he ? 'he:' + v : v;
    });
  };`);
h = h.replace('.lf-sel-label { font-size', '.lf-sel-label { font-size');
fs.writeFileSync(f, h);
console.log('ok');
