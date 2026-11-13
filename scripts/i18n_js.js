// Language support: English is written in the code; Hebrew is applied to drawn text through lfTr / lfTranslate.
(function () {
  let lang = 'en';
  try { const v = localStorage.getItem('lf-lang'); if (v === 'he' || v === 'en') lang = v; } catch (e) { /* storage unavailable */ }
  window.LF_LANG = lang;
  const ISO2 = __ISO2__;
  const EX = __EXACT__;
  const SITES = {
    'Efeh': 'אפעה', 'Dudaim': 'דודאים', 'Ganei Hadas': 'גני הדס', 'Evron': 'עברון', 'Talia': 'טליה', 'Haruvit': 'חרובית', 'Nimra': 'נימרה',
    'Zohar': 'זוהר', 'Dia': 'דיה', 'Daya': 'דיה', 'Avlaim': 'אבליים', 'Tovlan': 'טובלן', 'Hagal (Talia)': 'חגל (טליה)', 'Naser Recycling': 'נאסר מיחזור',
    'Tel Adashim': 'תל עדשים', 'Tut (Shfeya)': 'תות (שפיה)', 'Avivit': 'אביבית', 'Eichut Yeruka': 'איכות ירוקה', 'Gush Halav quarry': 'מחצבת גוש חלב',
    'Neot Hovav (Talor Karadi)': 'נאות חובב (טלאור כראדי)', "Tur'an": 'טורעאן', 'Green Recycling': 'גרין מיחזור', 'Mitzpe Ramon': 'מצפה רמון',
    'Yeruham': 'ירוחם', 'Ashalim': 'אשלים', 'Bareket': 'ברקת', 'Dimona': 'דימונה', 'Yarka': 'ירכא', "Te'enim": 'תאנים', "Lohamei HaGeta'ot": 'לוחמי הגטאות',
    'Haifa': 'חיפה', 'Tel Aviv': 'תל אביב', 'Jerusalem': 'ירושלים', 'Beersheba': 'באר שבע', 'Eilat': 'אילת',
    'North': 'צפון', 'South': 'דרום', 'Central': 'מרכז', 'Judea and Samaria': 'יהודה ושומרון',
    'OECD total': 'סך OECD', 'EU-27': 'האיחוד האירופי', 'Israel': 'ישראל'
  };
  const WHEN = { 'end of 2020': 'סוף 2020', 'end of 2023': 'סוף 2023', 'start of 2025': 'תחילת 2025' };
  // Country names: English names seen in the data, mapped to Hebrew through the browser's region names.
  let names = null, namesSize = -1, sortedNames = [];
  let dn = null; try { dn = new Intl.DisplayNames(['he'], { type: 'region' }); } catch (e) { dn = null; }
  function buildNames() {
    const pairs = [];
    for (const id of ['oecd', 'world_trends', 'waw']) {
      try { const d = dash.data(id); if (d && d.status === 'ok') for (const r of d.data) pairs.push([r.country, r.iso3]); } catch (e) { /* not loaded */ }
    }
    try { if (window.LF && LF.map && LF.map.features) for (const f of LF.map.features()) pairs.push([f.name, f.iso3]); } catch (e) { /* no map */ }
    if (pairs.length === namesSize) return;
    namesSize = pairs.length;
    names = Object.assign({}, SITES);
    for (const [en, iso] of pairs) {
      if (!en || names[en] || !iso) continue;
      const a2 = ISO2[iso]; let he = null;
      try { he = a2 && dn ? dn.of(a2) : null; } catch (e) { he = null; }
      if (he && he !== a2) names[en] = he;
    }
    sortedNames = Object.keys(names).sort((a, b) => b.length - a.length);
  }
  const PH = [
    ['tonnes/year', 'טון לשנה'], ['kg/person/day', 'ק"ג לאדם ביום'], ['Mt/yr', 'מיליון טון בשנה'], ['M t', ' מיליון טון'], ['k t', ' אלף טון'],
    [' million', ' מיליון'], ['tonnes', 'טון'], [' kg', ' ק"ג'], ['share of landfill methane', 'חלק ממתאן ההטמנה'],
    ['being expanded', 'בהרחבה'], ['expected to close in 2025', 'צפוי להיסגר ב-2025'], ['closed', 'סגור']
  ];
  const PAT = [
    [/^Compare with: (.+)$/, (m) => 'השוואה עם: ' + nm(m[1])],
    [/^All other sites \((\d+)\)$/, (m) => 'כל שאר האתרים (' + m[1] + ')'],
    [/^All (\d+) sites$/, (m) => 'כל ' + m[1] + ' האתרים'],
    [/^In (\d{4}), Israel ranks (\d+)( \(tied\))? of (\d+) countries, counting from the highest\. A year in brackets marks the latest earlier figure, up to three years old\.(.*)$/,
      (m) => 'ב-' + m[1] + ' ישראל במקום ' + m[2] + (m[3] ? ' (בתיקו)' : '') + ' מתוך ' + m[4] + ' מדינות, מהגבוה לנמוך. שנה בסוגריים מציינת נתון משנה קודמת, עד שלוש שנים אחורה.' + (m[5] ? ' עד 2013 ישראל דיווחה רק על סך הפסולת שסולקה, ולכן כל הפסולת שלה נספרת כמוטמנת.' : '')],
    [/^No figure for Israel within three years of (\d{4})\.$/, (m) => 'אין נתון לישראל בטווח של שלוש שנים מ-' + m[1] + '.'],
    [/^Making GIF: frame (\d+) of (\d+)$/, (m) => 'מכין GIF: תמונה ' + m[1] + ' מתוך ' + m[2]],
    [/^Download (.+\.gif)$/, (m) => 'הורדת ' + m[1]],
    [/^Couldn't make the GIF: (.*)$/, (m) => 'לא ניתן היה ליצור את ה-GIF: ' + m[1]],
    [/^Space left, (.+)$/, (m) => 'מקום פנוי, ' + (WHEN[m[1]] || m[1])],
    [/^(\d+)% \(to (.+)\)$/, (m) => m[1] + '% (עד ' + (WHEN[m[2]] || m[2]) + ')'],
    [/^Taken in, (\d{4})$/, (m) => 'נקלט ב-' + m[1]],
    [/^Status, (\d{4})$/, (m) => 'סטטוס, ' + m[1]],
    [/^Rank in (\d{4})$/, (m) => 'דירוג ב-' + m[1]],
    [/^(\d+) of (\d+)$/, (m) => m[1] + ' מתוך ' + m[2]],
    [/^([\d,.]+) t$/, (m) => m[1] + ' טון'],
    [/^(\d{4}) figure$/, (m) => 'נתון מ-' + m[1]],
    [/^for (\d{4})$/, (m) => 'ב-' + m[1]],
    [/^(\d+)% used · (.+) left( · (under 1|[\d.]+) yr)?( \(end 2023\))?$/,
      (m) => m[1] + '% נוצלו · נותרו ' + ph(m[2]) + (m[3] ? ' · ' + (m[4] === 'under 1' ? 'פחות משנה' : m[4] + ' שנים') : '') + (m[5] ? ' (סוף 2023)' : '')],
    [/^World map: (.*)$/, (m) => 'מפת העולם: ' + m[1]],
    [/^Israel against the OECD: (.*)$/, (m) => 'ישראל מול OECD: ' + (EX[m[1]] || m[1])],
    [/^Ranking by (.*)$/, (m) => 'דירוג לפי ' + (EX[m[1]] || m[1])],
    [/^(\d{4}) · (.+)$/, (m) => m[1] + ' · ' + (EX[m[2]] || ph(m[2]))],
    [/^(.+) · (\d{4})$/, (m) => nm(m[1]) + ' · ' + m[2]],
    [/^(.+) · (.+)$/, (m) => nm(m[1]) + ' · ' + (EX[m[2]] || ph(m[2]))]
  ];
  function nm(s) { buildNames(); return names[s] || EX[s] || ph(s); }
  function ph(s) {
    buildNames();
    let out = s;
    for (const k of sortedNames) if (out.includes(k)) out = out.split(k).join(names[k]);
    for (const [a, b] of PH) if (out.includes(a)) out = out.split(a).join(b);
    return out;
  }
  function tr(s) {
    if (window.LF_LANG !== 'he' || s == null) return s;
    const t = String(s).trim();
    if (!t || /^[\d\s.,%$+−\-–·≈()]*$/.test(t)) return s;
    if (EX[t]) return EX[t];
    buildNames();
    if (names[t]) return names[t];
    for (const [re, f] of PAT) { const m = t.match(re); if (m) return f(m); }
    return ph(t);
  }
  function translate(root) {
    if (window.LF_LANG !== 'he' || !root) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = []; let n;
    while ((n = w.nextNode())) nodes.push(n);
    for (const t of nodes) { const v = tr(t.nodeValue); if (v !== t.nodeValue) t.nodeValue = v; }
  }
  function wrap(f) {
    if (typeof f === 'function') return function (el) { const r = f.apply(this, arguments); translate(el); return r; };
    if (f && typeof f.update === 'function') {
      const o = Object.assign({}, f);
      o.update = function (el) { const r = f.update.apply(this, arguments); translate(el); return r; };
      return o;
    }
    return f;
  }
  window.lfTr = tr;
  window.lfTranslate = translate;
  window.lfReg = function (name, f) { return dash.draw(name, wrap(f)); };
  // Static selects: option text follows the language.
  window.lfReg('i18n-sel', (el) => {
    for (const o of el.options) {
      if (!o.dataset.en) o.dataset.en = o.textContent;
      o.textContent = window.LF_LANG === 'he' ? (EX[o.dataset.en] || o.dataset.en) : o.dataset.en;
    }
  });
})();
