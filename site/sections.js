// Leachate, leachate around the world and landfill gas: drawings and controls for these sections of dashboard_page.html.
// Loaded after the page's main script (kept separate so the page stays under the dashboard store's size limit).
// Leachate section: how strong leachate is against drinking water, and a rain-to-leachate calculator.
// Concentrations in mg/L: S. Earle, Environmental Geology (open textbook), table 14.3.1.
LF.leach = {
  params: [
    { en: 'COD (organic load)', he: 'COD (עומס אורגני)', recent: 23800, aged: 1160, typical: 18000, dw: 10 },
    { en: 'BOD₅ (biodegradable organics)', he: 'BOD₅ (חומר אורגני מתכלה)', recent: 11900, aged: 260, typical: 1000, dw: 3 },
    { en: 'Ammonia nitrogen', he: 'חנקן אמוניה', recent: 790, aged: 370, typical: 225, dw: 0.1 },
    { en: 'Chloride', he: 'כלוריד', recent: 1315, aged: 2080, typical: 500, dw: 10 },
    { en: 'Sodium', he: 'נתרן', recent: 960, aged: 1300, typical: 500, dw: 15 },
    { en: 'Calcium', he: 'סידן', recent: 1820, aged: 250, typical: 1000, dw: 10 },
    { en: 'Potassium', he: 'אשלגן', recent: 780, aged: 590, typical: 300, dw: 1 },
    { en: 'Magnesium', he: 'מגנזיום', recent: 252, aged: 185, typical: 250, dw: 5 },
    { en: 'Iron', he: 'ברזל', recent: 540, aged: 23, typical: 60, dw: 0.2 },
    { en: 'Manganese', he: 'מנגן', recent: 27, aged: 2.1, typical: null, dw: 0.03 },
    { en: 'Zinc', he: 'אבץ', recent: 21.5, aged: 0.4, typical: null, dw: 0.01 },
    { en: 'Copper', he: 'נחושת', recent: 0.12, aged: 0.03, typical: null, dw: 0.02 }
  ],
  T: (en, he) => '<span class="lf-en">' + en + '</span><span class="lf-he-t" lang="he">' + he + '</span>',
  mg: (v) => v >= 10 ? d3.format(',.0f')(v) : v >= 1 ? d3.format('.1~f')(v) : d3.format('.2~f')(v)
};
dash.draw('leach-comp', (el) => {
  const L = LF.leach, key = LF.st.leachProfile || 'recent';
  const lo = -2, hi = 5; // 0.01 to 100,000 mg/L
  const pos = (v) => Math.max(0, Math.min(100, (Math.log10(v) - lo) / (hi - lo) * 100));
  const times = (r) => { const t = r / 1; return t >= 10 ? d3.format(',.0f')(t) : d3.format('.1~f')(t); };
  let h = '<div class="lf-lc-axis" aria-hidden="true"><span></span><span class="lf-lc-track">';
  for (const t of [0.01, 1, 100, 10000]) h += '<i' + (t === 100 ? ' class="lf-lc-mid"' : '') + ' style="inset-inline-start:' + pos(t).toFixed(2) + '%">' + d3.format(',')(t) + '</i>';
  h += '</span><span></span></div>';
  for (const p of L.params) {
    const v = p[key];
    h += '<div class="lf-lc-row"><span class="lf-lc-name">' + L.T(p.en, p.he) + '</span><span class="lf-lc-track">';
    for (const t of [0.01, 1, 100, 10000]) h += '<u style="inset-inline-start:' + pos(t).toFixed(2) + '%"></u>';
    if (v != null) h += '<em class="lf-lc-bar" style="width:' + pos(v).toFixed(2) + '%"></em>';
    h += '<b class="lf-lc-dw" style="inset-inline-start:' + pos(p.dw).toFixed(2) + '%" title="Drinking water: ' + L.mg(p.dw) + ' mg/L"></b></span>';
    h += '<span class="lf-lc-val">' + (v == null ? '—' : L.mg(v) + ' <small>' + L.T('mg/L', 'מ"ג/ל') + '</small> <span class="lf-lc-x">×' + times(v / p.dw) + '</span>') + '</span></div>';
  }
  el.innerHTML = h;
});
dash.draw('leach-calc', (el) => {
  const L = LF.leach, num = (id, d) => { const e = document.getElementById(id); return e ? +lfVal(e) : d; };
  const rain = num('leach-rain', 500), ha = num('leach-area', 10), share = num('leach-share', 0.25);
  const perYear = rain / 1000 * ha * 1e4 * share, perDay = perYear / 365;
  const f0 = d3.format(',.0f'), f1 = d3.format(',.1f');
  const efeh = perDay / 450 * 100;
  el.innerHTML =
    '<p class="lf-calc-set">' + L.T(f0(rain) + ' mm of rain a year · ' + ha + ' hectares open · ' + Math.round(share * 100) + '% soaks through',
      f0(rain) + ' מ"מ גשם בשנה · ' + ha + ' הקטאר חשופים · ' + Math.round(share * 100) + '% מחלחל') + '</p>' +
    '<div class="lf-calc-out">' +
      '<div><b>' + f0(perYear) + '</b><span>' + L.T('m³ of leachate a year', 'מ"ק תשטיפים בשנה') + '</span></div>' +
      '<div><b>' + (perDay < 10 ? f1(perDay) : f0(perDay)) + '</b><span>' + L.T('m³ a day on average', 'מ"ק ביום בממוצע') + '</span></div>' +
      '<div><b>' + f1(perYear / 2500) + '</b><span>' + L.T('Olympic swimming pools a year (2,500 m³ each)', 'בריכות אולימפיות בשנה (2,500 מ"ק כל אחת)') + '</span></div>' +
      '<div><b>' + (efeh < 10 ? f1(efeh) : f0(efeh)) + '%</b><span>' + L.T("of the 450 m³ a day Efeh made in late 2024", 'מ-450 המ"ק ביום שאפעה ייצרה בסוף 2024') + '</span></div>' +
    '</div>';
});
document.querySelectorAll('#leach-profile').forEach((s) => s.addEventListener('change', () => { LF.st.leachProfile = lfVal(s); dash.draw('leach-comp'); }));
document.querySelectorAll('#leach-rain, #leach-area').forEach((s) => s.addEventListener('input', () => dash.draw('leach-calc')));
document.querySelectorAll('#leach-share').forEach((s) => s.addEventListener('change', () => dash.draw('leach-calc')));

// Leachate around the world: a rough estimate for OECD countries, from the waste each one landfills (OECD) and its rain (World Bank),
// scaled from the US national estimate (61.1 million m³ of leachate in 2013, Lang et al. 2017) per tonne landfilled and per mm of rain.
LF.oecdL = Object.assign({ ref: { rain: 715, m3: 61.1e6, t: 1, year: 2013 }, c: {} }, window.LF_OECDL || {});
LF.oecdL.T = (en, he) => '<span class="lf-en">' + en + '</span><span class="lf-he-t" lang="he">' + he + '</span>';
LF.oecdL.years = d3.range(2000, 2025);
LF.oecdL.he = () => window.LF_LANG === 'he';
LF.oecdL.name = (k) => { const e = LF.oecdL.c[k], n = e ? e.n : k; return LF.oecdL.he() && window.lfTr ? window.lfTr(n) : n; };
// Litres per person a year, or million m³ a year.
LF.oecdL.val = (k, y, mode) => {
  const O = LF.oecdL, e = O.c[k], v = e && e.y[y];
  if (!v) return null;
  const m3PerT = O.ref.m3 / O.ref.t * e.r / O.ref.rain;
  return mode === 'tot' ? v[0] / 1000 * v[1] * 1000 * m3PerT / 1e6 : v[0] / 1000 * m3PerT * 1000;
};
LF.oecdL.mode = () => { const s = document.getElementById('oecd-leach-m'); return s ? lfVal(s) : 'pc'; };
LF.oecdL.fmt = (v, mode) => (mode === 'tot' ? (v < 10 ? d3.format('.2f') : d3.format('.1f')) : d3.format(',.0f'))(v);
LF.oecdL.unit = (mode, he) => (mode === 'tot' ? (he ? 'מיליון מ"ק' : 'million m³') : (he ? 'ליטר לאדם' : 'L per person'));
LF.st.oecdLY = LF.st.oecdLY || 2024;
LF.st.oecdLC = LF.st.oecdLC || 'ISR';
LF.oecdL.redraw = () => ['oecd-leach-time', 'oecd-leach-country', 'oecd-leach-year-label'].forEach((n) => dash.draw(n));
LF.oecdL.setYear = (y) => { LF.st.oecdLY = y; document.querySelectorAll('#oecd-leach-year').forEach((r) => { r.value = String(y); }); LF.oecdL.redraw(); };

// One country, year by year (click a country below to change it, click a column to pick the year).
dash.draw('oecd-leach-time', (el) => {
  const O = LF.oecdL, mode = O.mode(), k = LF.st.oecdLC, sel = LF.st.oecdLY, he = O.he();
  const vals = O.years.map((y) => [y, O.val(k, y, mode)]);
  const max = d3.max(vals, (d) => d[1]) || 1, ticks = d3.ticks(0, max, 4).filter((t) => t > 0), top = Math.max(max, ticks[ticks.length - 1] || max);
  let h = '<p class="lf-eu-title">' + (he ? O.name(k) + ': תשטיפים משוערים, ' + O.unit(mode, true) + ' בשנה' : O.name(k) + ': estimated leachate, ' + O.unit(mode, false) + ' a year') + '</p><div class="lf-eu-plot">';
  for (const t of ticks) h += '<div class="lf-eu-grid" style="bottom:' + (t / top * 100).toFixed(2) + '%"><span>' + O.fmt(t, mode) + '</span></div>';
  h += '<div class="lf-eu-cols">';
  for (const [y, v] of vals) {
    const tip = y + ': ' + (v == null ? (he ? 'אין נתון' : 'no data') : O.fmt(v, mode) + ' ' + O.unit(mode, he));
    h += '<button type="button" class="lf-eu-col' + (y === sel ? ' lf-eu-on' : '') + '" data-y="' + y + '" title="' + tip + '" aria-label="' + tip + '">' +
      '<span class="lf-eu-stack" style="height:' + (v ? v / top * 100 : 0).toFixed(2) + '%"><i class="lf-ol-c" style="flex:1 1 0"></i></span></button>';
  }
  h += '</div></div><div class="lf-eu-years">';
  for (const y of O.years) h += '<span' + (y % 4 ? ' class="lf-eu-y2"' : '') + '>' + (y % 2 ? '' : y) + '</span>';
  el.innerHTML = h + '</div>';
  el.querySelectorAll('.lf-eu-col').forEach((b) => b.addEventListener('click', () => O.setYear(+b.dataset.y)));
});
dash.draw('oecd-leach-year-label', (el) => { el.textContent = String(LF.st.oecdLY); });

// All countries in the chosen year, as SVG so it can play year by year and be saved as a GIF. One scale for all years.
dash.draw('oecd-leach-country', (el) => {
  const O = LF.oecdL, mode = O.mode(), y = LF.st.oecdLY, he = O.he(), lang = he ? 'he' : 'en', pick = LF.st.oecdLC;
  const keys = Object.keys(O.c);
  const nMax = d3.max(O.years, (yy) => keys.filter((k) => O.val(k, yy, mode) != null).length) || 1;
  const gmax = d3.max(keys, (k) => d3.max(O.years, (yy) => O.val(k, yy, mode))) || 1;
  const rows = keys.map((k) => ({ k, v: O.val(k, y, mode) })).filter((r) => r.v != null).sort((a, b) => b.v - a.v);
  const W = Math.max(300, Math.round(el.clientWidth || 670)), narrow = W < 520;
  const nameW = narrow ? 100 : 150, valW = narrow ? 56 : 120, rowH = 20, head = 30, H = head + nMax * rowH + 4;
  const bw = Math.max(40, W - nameW - valW - 8), x = (v) => v / gmax * bw;
  const key = mode + '|' + W + '|' + lang;
  let svg = d3.select(el).select('svg');
  const fresh = svg.empty() || svg.attr('data-key') !== key;
  if (fresh) {
    el.innerHTML = '';
    svg = d3.select(el).append('svg').attr('data-key', key).attr('width', W).attr('height', H).attr('viewBox', '0 0 ' + W + ' ' + H).attr('font-size', 12.5).attr('role', 'img');
    svg.append('text').attr('class', 'lf-eu-svgtitle').attr('y', 16);
    svg.append('g').attr('class', 'lf-eu-rows');
  }
  const anim = !fresh && !window.LF_NOANIM && window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  const tr = (s) => (anim ? s.transition().duration(450).ease(d3.easeCubicOut) : s);
  const title = he ? 'תשטיפים משוערים' + (narrow ? '' : ' מהפסולת שהוטמנה') + ', ' + O.unit(mode, true) + ' בשנה, ' + y : 'Estimated leachate' + (narrow ? '' : ' from the waste landfilled') + ', ' + O.unit(mode, false) + ' a year, ' + y;
  svg.attr('aria-label', title);
  svg.select('.lf-eu-svgtitle').text(title).attr('x', he ? W : 0).attr('direction', he ? 'rtl' : 'ltr').attr('text-anchor', 'start');
  const pos = (r, i) => 'translate(0,' + (head + i * rowH) + ')';
  const color = (r) => (r.k === 'ISR' ? '#f2c14e' : 'var(--lf-leach, #d9822b)');
  const g = svg.select('.lf-eu-rows').selectAll('g.lf-eu-r').data(rows, (r) => r.k).join(
    (enter) => {
      const e = enter.append('g').attr('class', 'lf-eu-r').attr('transform', pos).attr('opacity', anim ? 0 : 1).style('cursor', 'pointer');
      e.append('rect').attr('class', 'lf-ol-hit').attr('x', 0).attr('y', 0).attr('height', rowH).attr('fill', 'transparent');
      e.append('text').attr('class', 'lf-eu-nm').attr('x', nameW - 8).attr('y', 14).attr('text-anchor', 'end');
      e.append('rect').attr('class', 'lf-ol-bar').attr('x', nameW).attr('y', 3).attr('height', 14).attr('width', 0);
      e.append('text').attr('class', 'lf-eu-v').attr('x', nameW + 6).attr('y', 14);
      e.on('click', (ev, r) => { LF.st.oecdLC = r.k; dash.draw('oecd-leach-time'); dash.draw('oecd-leach-country'); });
      return e;
    },
    (update) => update,
    (exit) => tr(exit).attr('opacity', 0).remove()
  );
  g.select('.lf-ol-hit').attr('width', W);
  g.select('.lf-eu-nm').text((r) => O.name(r.k)).attr('font-weight', (r) => (r.k === pick ? 700 : 400));
  g.select('.lf-ol-bar').attr('fill', color);
  g.select('.lf-eu-v').text((r) => O.fmt(r.v, mode));
  tr(g).attr('transform', pos).attr('opacity', 1);
  tr(g.select('.lf-ol-bar')).attr('width', (r) => Math.max(1.5, x(r.v)));
  tr(g.select('.lf-eu-v')).attr('x', (r) => nameW + Math.max(1.5, x(r.v)) + 6);
});
document.querySelectorAll('#oecd-leach-m').forEach((s) => s.addEventListener('change', LF.oecdL.redraw));
if (LF.player) LF.player('oecd-leach', 2000, 2024, 'oecdLY', ['oecd-leach-time', 'oecd-leach-country', 'oecd-leach-year-label'], 800);
if (LF.GIF) LF.GIF.oecdleach = {
  chart: '#oecd-leach-country', key: 'oecdLY', min: 2000, max: 2024, draws: ['oecd-leach-country'], labels: ['oecd-leach-time', 'oecd-leach-year-label'], range: '#oecd-leach-year',
  title: () => (LF.oecdL.he() ? 'מדינות OECD: תשטיפים משוערים, ' + LF.oecdL.unit(LF.oecdL.mode(), true) + ' בשנה' : 'OECD countries: estimated leachate, ' + LF.oecdL.unit(LF.oecdL.mode(), false) + ' a year')
};
let olW = 0;
window.addEventListener('resize', () => { const e = document.getElementById('oecd-leach-country'); if (e && Math.abs(e.clientWidth - olW) > 20) { olW = e.clientWidth; dash.draw('oecd-leach-country'); } });

// PFAS in landfill leachate against drinking water limits (US EPA research review 2024; EPA and EU limits). ng per litre, log scale.
LF.pfas = {
  lim: [
    [4, 1, 'US drinking water limit for PFOA, and for PFOS', 'הגבול האמריקאי במי שתייה ל-PFOA, וגם ל-PFOS'],
    [100, 1, 'EU drinking water limit, sum of 20 PFAS', 'הגבול האירופי במי שתייה, סכום של 20 תרכובות PFAS'],
    [500, 1, 'EU drinking water limit, all PFAS', 'הגבול האירופי במי שתייה, כל ה-PFAS'],
    [1400, 0, 'US landfill leachate, average PFOA', 'תשטיפים ממטמנות בארצות הברית, ממוצע PFOA'],
    [12300, 0, 'US landfill leachate, average of all PFAS measured', 'תשטיפים ממטמנות בארצות הברית, ממוצע כל ה-PFAS שנמדדו'],
    [104000, 0, 'US landfill leachate, highest total reported', 'תשטיפים ממטמנות בארצות הברית, הסך הגבוה ביותר שדווח']
  ],
  cmp: [[3500, '5:3 FTCA'], [2800, 'PFHxA'], [1400, 'PFOA'], [800, 'PFBS'], [550, 'PFHxS'], [260, 'PFOS'], [67, 'PFNA']]
};
dash.draw('pfas', (el) => {
  const T = LF.oecdL.T, f = d3.format(','), s = document.getElementById('pfas-view'), view = s ? lfVal(s) : 'lim';
  const top = view === 'lim' ? 200000 : 10000, k = (v) => (Math.log10(v) / Math.log10(top)).toFixed(4);
  const pos = (v) => 'calc((100% - 64px) * ' + k(v) + ')';
  const rows = view === 'lim' ? LF.pfas.lim.map((r) => ({ v: r[0], lim: r[1], en: r[2], he: r[3] })) : LF.pfas.cmp.map((r) => ({ v: r[0], lim: 0, en: r[1], he: '<bdi dir="ltr">' + r[1] + '</bdi>' }));
  let h = '<p class="lf-note">' + (view === 'lim'
    ? T('Nanograms per litre, log scale: each step is ten times the one before. Blue: drinking water limits. Orange: landfill leachate.', 'ננוגרם לליטר, סקאלה לוגריתמית: כל שנת מידה גדולה פי עשרה מהקודמת. כחול: הגבולות למי שתייה. כתום: תשטיפים ממטמנות.')
    : T('Average in US municipal landfill leachate, nanograms per litre, log scale. Short-chain compounds lead.', 'ממוצע בתשטיפים ממטמנות עירוניות בארצות הברית, ננוגרם לליטר, סקאלה לוגריתמית. התרכובות בעלות השרשרת הקצרה מובילות.')) + '</p><div class="lf-pfas-chart">';
  for (const r of rows) {
    h += '<div class="lf-pfas-row"><span class="lf-pfas-name">' + T(r.en, r.he) + '</span><span class="lf-pfas-track"><span class="lf-pfas-bar' + (r.lim ? ' lf-pfas-lim' : '') + '" style="width:max(2px, ' + pos(r.v) + ')"></span><span class="lf-pfas-v">' + f(r.v) + '</span></span></div>';
  }
  h += '<div class="lf-pfas-axis"><span></span><div>';
  for (let t = 1, i = 0; t <= top; t *= 10, i++) h += '<span' + (i % 2 ? ' class="lf-pfas-odd"' : '') + ' style="left:' + pos(t) + '">' + (t >= 1000 ? d3.format('~s')(t).replace('k', 'K') : t) + '</span>';
  h += '</div></div></div>';
  h += '<ul class="lf-note">' +
    '<li>' + T('PFAS are thousands of man-made compounds that repel water and grease, used in non-stick pans, waterproof clothing, food packaging and firefighting foam. They barely break down, and some are linked to cancer and to harm to the liver and immune system. Products that contain them end up in landfills, and the PFAS wash out into the leachate.', 'PFAS הן אלפי תרכובות מלאכותיות שדוחות מים ושומן, ומשמשות במחבתות נון-סטיק, בבגדים עמידים למים, באריזות מזון ובקצף לכיבוי אש. הן כמעט אינן מתפרקות, וחלקן קשורות לסרטן ולנזק לכבד ולמערכת החיסון. מוצרים שמכילים אותן מגיעים למטמנות, וה-PFAS נשטפות לתשטיפים.') + '</li>' +
    '<li>' + T('Leachate from an average US landfill holds about 350 times the US drinking water limit for PFOA (1,400 against 4). The review covered 10 US studies with 330 samples, and PFAS were also found in leachate from construction waste, incinerator ash and hazardous waste landfills. Active landfills have far more than closed ones.', 'בתשטיפים של מטמנה ממוצעת בארצות הברית יש בערך פי 350 מהגבול האמריקאי במי שתייה ל-PFOA (1,400 מול 4). הסקירה כללה 10 מחקרים בארצות הברית עם 330 דגימות, ו-PFAS נמצאו גם בתשטיפים ממטמנות של פסולת בניין, אפר משריפת פסולת ופסולת מסוכנת. במטמנות פעילות יש הרבה יותר מאשר במטמנות סגורות.') + '</li>' +
    '<li>' + T('Ordinary leachate treatment does not remove PFAS. Biological treatment and oxidation can even turn some of them into the regulated kinds, so the measured amount may rise. Reverse osmosis removes 90 to 100% but leaves a concentrate that still has to go somewhere. Gas flares, at 650 to 850 °C, are probably too cool to destroy PFAS, which takes about 1,000 °C.', 'טיפול רגיל בתשטיפים אינו מסלק PFAS. טיפול ביולוגי וחמצון יכולים אפילו להפוך חלק מהן לסוגים שיש להם תקן, כך שהכמות הנמדדת עשויה לעלות. אוסמוזה הפוכה מסלקת 90 עד 100%, אבל משאירה תרכיז שעדיין צריך לטפל בו. לפידי גז, ב-650 עד 850 מעלות, כנראה קרים מדי כדי להשמיד PFAS, שדורשות כ-1,000 מעלות.') + '</li>' +
    '<li>' + T('Israel: we found no published measurements of PFAS in Israeli landfill leachate. Some of Israel\'s landfills send their leachate to sewage treatment plants, which do not remove PFAS, and most treated wastewater in Israel is reused for irrigation (see the Israel section below).', 'ישראל: לא מצאנו מדידות שפורסמו של PFAS בתשטיפים ממטמנות בישראל. חלק מהמטמנות בישראל שולחות את התשטיפים למכוני טיהור שפכים, שאינם מסלקים PFAS, ורוב השפכים המטוהרים בישראל משמשים להשקיה (ראו בחלק של ישראל בהמשך).') + '</li>' +
    '</ul><p class="lf-note">' + T('Limits: US EPA 2024 drinking water rule, 4 ng/L each for PFOA and PFOS, which EPA kept when it proposed in May 2026 to drop its limits for four other PFAS; EU Drinking Water Directive, from 12 January 2026, 0.1 µg/L (100 ng/L) for the sum of 20 PFAS or 0.5 µg/L (500 ng/L) for all PFAS, each country choosing one or both. Leachate: T. Tolaymat and N. Robey, US EPA Office of Research and Development, "Landfill disposal of PFAS: state of the science", April 2024 (US municipal landfill leachate; the compound averages are means across the studies that measured each one). Treatment: the same review, and M. Zhang et al., Waste Management, 2023.',
      'הגבולות: התקנה האמריקאית למי שתייה מ-2024, 4 ננוגרם לליטר ל-PFOA ול-PFOS כל אחד, שהסוכנות להגנת הסביבה השאירה כשהציעה במאי 2026 לבטל את הגבולות לארבע תרכובות PFAS אחרות; הדירקטיבה האירופית למי שתייה, מ-12 בינואר 2026, 0.1 מיקרוגרם לליטר (100 ננוגרם) לסכום של 20 תרכובות PFAS, או 0.5 מיקרוגרם לליטר (500 ננוגרם) לכל ה-PFAS, וכל מדינה בוחרת אחד מהם או את שניהם. תשטיפים: T. Tolaymat ו-N. Robey, המשרד למחקר ופיתוח של הסוכנות האמריקאית להגנת הסביבה, "סילוק PFAS במטמנות: מצב הידע", אפריל 2024 (תשטיפים ממטמנות עירוניות בארצות הברית; הממוצעים לפי תרכובת הם ממוצעים של המחקרים שמדדו כל אחת). טיפול: אותה סקירה, ו-M. Zhang ואחרים, Waste Management,‏ 2023.') + '</p>';
  el.innerHTML = h;
});
document.querySelectorAll('#pfas-view').forEach((s) => s.addEventListener('change', () => dash.draw('pfas')));
dash.draw('pfas');

// Landfill gas: LandGEM-style simulator (US EPA first-order decay model, each year's waste split into tenths).
LF.gem = {
  ids: { k: 'lfg-k', l0: 'lfg-l0', m: 'lfg-m', d: 'lfg-d' },
  defaults: { k: 0.04, l0: 100, m: 100000, d: 20 },
  T: (en, he) => '<span class="lf-en">' + en + '</span><span class="lf-he-t" lang="he">' + he + '</span>',
  he: () => !!document.querySelector('.lf.lf-he'),
  fmt: (v, digits) => new Intl.NumberFormat(LF.gem.he() ? 'he-IL' : 'en-US', { maximumFractionDigits: digits == null ? 3 : digits }).format(v),
  get() {
    const s = {};
    for (const [key, id] of Object.entries(LF.gem.ids)) { const e = document.getElementById(id); s[key] = e ? +e.value : LF.gem.defaults[key]; }
    return s;
  },
  // Methane generation in m³ a year, `year` years after the landfill opens.
  rate(year, s) {
    let sum = 0;
    for (let dep = 0; dep < Math.min(year, s.d); dep++) {
      for (let part = 0; part < 10; part++) sum += s.k * s.l0 * (s.m / 10) * Math.exp(-s.k * (year - dep - part / 10));
    }
    return sum;
  },
  series() {
    const G = LF.gem, cur = G.get(), ref = LF.st.lfgRef || null;
    const horizon = Math.max(cur.d, ref ? ref.d : 0) + 40;
    const yrs = d3.range(horizon + 1);
    return { cur, ref, horizon, values: yrs.map((y) => G.rate(y, cur)), comp: ref ? yrs.map((y) => G.rate(y, ref)) : null };
  },
  probe(horizon) {
    const p = document.getElementById('lfg-y');
    return p ? Math.min(+p.value, horizon) : 20;
  },
  DENSITY: 0.656 / 1000 // tonnes of methane per m³ at 25 °C
};
dash.draw('lfg-v-k', (el) => { el.textContent = LF.gem.fmt(LF.gem.get().k); });
dash.draw('lfg-v-l0', (el) => { el.textContent = LF.gem.fmt(LF.gem.get().l0); });
dash.draw('lfg-v-m', (el) => { el.textContent = LF.gem.fmt(LF.gem.get().m); });
dash.draw('lfg-v-d', (el) => { el.textContent = LF.gem.fmt(LF.gem.get().d); });
dash.draw('lfg-v-y', (el) => { el.textContent = String(LF.gem.probe(LF.gem.series().horizon)); });
dash.draw('lfg-metrics', (el) => {
  const G = LF.gem, S = G.series(), peak = d3.max(S.values), peakYear = S.values.indexOf(peak);
  const total = S.cur.m * S.cur.d * S.cur.l0, t = peak * G.DENSITY;
  const box = (v, en, he, en2, he2) => '<div><span>' + G.T(en, he) + '</span><b>' + v + '</b><span>' + G.T(en2, he2) + '</span></div>';
  el.innerHTML =
    box(G.fmt(peak / 1e6), 'Peak rate', 'קצב בשיא', 'million m³ a year', 'מיליון מ"ק לשנה') +
    box(peakYear, 'Peak year', 'שנת השיא', 'after opening', 'מתחילת ההטמנה') +
    box(G.fmt(total / 1e6, 1), 'Total potential', 'פוטנציאל כולל', 'million m³', 'מיליון מ"ק') +
    box(G.fmt(t, 0), 'Peak in tonnes', 'השיא בטונות', 'methane a year, ≈ ' + G.fmt(t * 28 / 1e6, 2) + ' million t CO₂e', 'מתאן בשנה, ≈ ' + G.fmt(t * 28 / 1e6, 2) + ' מיליון טון CO₂e');
});
dash.draw('lfg-chart', (el) => {
  const G = LF.gem, S = G.series(), he = G.he(), sel = G.probe(S.horizon);
  const ceiling = Math.max(d3.max(S.values), S.comp ? d3.max(S.comp) : 0) || 1;
  const decade = 10 ** Math.floor(Math.log10(ceiling / 5));
  const step = ([1, 2, 2.5, 5, 10].find((n) => n * decade >= ceiling / 5) || 10) * decade;
  const scaleMax = Math.ceil(ceiling / step) * step;
  const L = 61, R = 650, Tp = 29, B = 289;
  const x = (yr) => L + yr / S.horizon * (R - L), y = (q) => B - q / scaleMax * (B - Tp);
  const line = (pts, cls) => '<polyline points="' + pts.map((q, yr) => x(yr).toFixed(1) + ',' + y(q).toFixed(1)).join(' ') + '" class="' + cls + '"/>';
  let ax = '';
  for (let i = 0; i <= Math.round(scaleMax / step); i++) {
    const q = i * step;
    ax += '<path d="M' + L + ' ' + y(q) + 'H' + R + '" stroke="var(--cds-chart-grid)"/><text x="' + (L - 8) + '" y="' + (y(q) + 4) + '" text-anchor="end">' + G.fmt(q / 1e6) + '</text>';
  }
  for (let yr = 0; yr <= S.horizon; yr += 10) ax += '<text x="' + x(yr) + '" y="311" text-anchor="middle">' + yr + '</text>';
  const label = he ? 'קצב ייצור מתאן לפי שנה' : 'Methane generation rate by year';
  const fs = Math.min(24, Math.max(13, 13 * 480 / (el.clientWidth || 670)));
  el.innerHTML = '<svg viewBox="0 0 670 345" role="img" aria-label="' + label + '" font-size="' + fs.toFixed(1) + '">' +
    '<style>.lfg-cur{fill:none;stroke:var(--lf-gas,#7fd0a8);stroke-width:3.2;stroke-linejoin:round}.lfg-ref{fill:none;stroke:var(--color-fg-muted);stroke-width:2.6;stroke-dasharray:7 6}</style>' +
    '<text x="' + L + '" y="17" text-anchor="start">' + (he ? 'מיליון מ"ק מתאן לשנה' : 'million m³ of methane a year') + '</text>' + ax +
    '<text x="' + ((L + R) / 2) + '" y="337" text-anchor="middle">' + (he ? 'שנים מתחילת ההטמנה' : 'years after the landfill opens') + '</text>' +
    '<path d="M' + L + ' ' + Tp + 'V' + B + 'H' + R + '" fill="none" stroke="var(--cds-chart-axis)"/>' +
    '<path d="M' + x(S.cur.d) + ' ' + Tp + 'V' + B + '" stroke="#d9a441" stroke-width="2" stroke-dasharray="2 4"/>' +
    '<path d="M' + x(sel) + ' ' + Tp + 'V' + B + '" stroke="var(--color-fg-muted)" stroke-dasharray="4 5"/>' +
    (S.comp ? line(S.comp, 'lfg-ref') : '') + line(S.values, 'lfg-cur') +
    '<circle cx="' + x(sel) + '" cy="' + y(S.values[sel]) + '" r="5" fill="var(--lf-gas,#7fd0a8)" stroke="var(--color-panel)" stroke-width="2"/></svg>';
});
dash.draw('lfg-read', (el) => {
  const G = LF.gem, S = G.series(), sel = G.probe(S.horizon);
  const v = G.fmt(Math.round(S.values[sel]), 0), t = G.fmt(S.values[sel] * G.DENSITY, 0);
  const r = S.comp ? G.fmt(Math.round(S.comp[sel]), 0) : null;
  el.innerHTML = G.T('Year ' + sel + ' · current scenario ' + v + ' m³ of methane a year (' + t + ' t)' + (r ? ' · comparison ' + r + ' m³' : ''),
    'שנה ' + sel + ' · תרחיש נוכחי ' + v + ' מ"ק מתאן לשנה (' + t + ' טון)' + (r ? ' · תרחיש להשוואה ' + r + ' מ"ק' : ''));
});
LF.gem.redraw = () => {
  const G = LF.gem, S = G.series(), p = document.getElementById('lfg-y');
  if (p) { p.max = S.horizon; if (+p.value > S.horizon) p.value = S.horizon; }
  document.querySelectorAll('#lfg-clear, .lf-gem-refkey').forEach((e) => { e.hidden = !LF.st.lfgRef; });
  ['lfg-v-k', 'lfg-v-l0', 'lfg-v-m', 'lfg-v-d', 'lfg-v-y', 'lfg-metrics', 'lfg-chart', 'lfg-read'].forEach((n) => dash.draw(n));
};
document.querySelectorAll('#lfg-k, #lfg-l0, #lfg-m, #lfg-d, #lfg-y').forEach((e) => e.addEventListener('input', LF.gem.redraw));
document.querySelectorAll('.lf-gem-p').forEach((b) => b.addEventListener('click', () => {
  const k = document.getElementById('lfg-k'), l0 = document.getElementById('lfg-l0');
  if (k) k.value = b.dataset.k; if (l0) l0.value = 100;
  LF.gem.redraw();
}));
document.querySelectorAll('#lfg-capture').forEach((b) => b.addEventListener('click', () => { LF.st.lfgRef = LF.gem.get(); LF.gem.redraw(); }));
document.querySelectorAll('#lfg-clear').forEach((b) => b.addEventListener('click', () => {
  LF.st.lfgRef = null; LF.gem.redraw();
  const c = document.getElementById('lfg-capture'); if (c) c.focus();
}));
document.querySelectorAll('#lfg-reset').forEach((b) => b.addEventListener('click', () => {
  for (const [key, id] of Object.entries(LF.gem.ids)) { const e = document.getElementById(id); if (e) e.value = LF.gem.defaults[key]; }
  const p = document.getElementById('lfg-y'); if (p) p.value = LF.gem.defaults.d;
  LF.st.lfgRef = null; LF.gem.redraw();
}));
LF.gem.redraw();
['leach-comp', 'leach-calc', 'oecd-leach-time', 'oecd-leach-country', 'oecd-leach-year-label'].forEach((n) => dash.draw(n));

// Landfill gas in Israel: what collecting more of it would do (2022 national inventory, our collected-share estimate).
LF.ilGas = { made: 304400, released: 288100, collected: 16300 }; // tonnes of methane, 2022
dash.draw('il-gas-calc', (el) => {
  const G = LF.ilGas, T = LF.leach.T, f0 = d3.format(',.0f'), f1 = d3.format(',.1f'), f2 = d3.format(',.2f');
  const sEl = document.getElementById('il-gas-share'), uEl = document.getElementById('il-gas-use');
  const s = sEl ? +sEl.value / 100 : 0.5, power = !uEl || lfVal(uEl) === 'power';
  const col = s * G.made, rel = G.made - col, avoidMt = (G.released - rel) * 28 / 1e6;
  const mwh = col * 1000 / 0.66 * 35.8 * 0.38 / 3600, gwh = mwh / 1000;
  const avoidTxt = (avoidMt >= 0 ? '' : '+') + f2(Math.abs(avoidMt));
  el.innerHTML =
    '<p class="lf-calc-set">' + T(Math.round(s * 100) + '% of the methane collected · ' + (power ? 'burned in engines that make electricity' : 'burned in flares'),
      Math.round(s * 100) + '% מהמתאן נאסף · ' + (power ? 'נשרף במנועים שמפיקים חשמל' : 'נשרף בלפידים')) + '</p>' +
    '<div class="lf-calc-out">' +
      '<div><b>' + f0(rel) + '</b><span>' + T('t of methane still released a year (288,000 in 2022)', 'טון מתאן שעדיין נפלטים בשנה (288,000 ב-2022)') + '</span></div>' +
      '<div><b>' + avoidTxt + '</b><span>' + (avoidMt >= 0 ? T('million t CO₂e less a year than in 2022', 'מיליון טון CO₂e פחות בשנה מאשר ב-2022') : T('million t CO₂e more a year than in 2022', 'מיליון טון CO₂e יותר בשנה מאשר ב-2022')) + '</span></div>' +
      (power
        ? '<div><b>' + f0(gwh) + '</b><span>' + T('GWh of electricity a year, about ' + f0(mwh / 8760) + ' MW running nonstop', "ג'יגה-ואט-שעה חשמל בשנה, כ-" + f0(mwh / 8760) + ' מגה-ואט שפועלים ברציפות') + '</span></div>' +
          '<div><b>' + f1(gwh / 61.32) + '</b><span>' + T('power plants the size of Ganei Hadas (7 MW)', 'תחנות כוח בגודל של גני הדס (7 מגה-ואט)') + '</span></div>'
        : '<div><b>0</b><span>' + T('GWh of electricity: flares only destroy the methane', "ג'יגה-ואט-שעה חשמל: לפידים רק משמידים את המתאן") + '</span></div>') +
    '</div>';
});
document.querySelectorAll('#il-gas-share').forEach((e) => e.addEventListener('input', () => dash.draw('il-gas-calc')));
document.querySelectorAll('#il-gas-use').forEach((e) => e.addEventListener('change', () => dash.draw('il-gas-calc')));
dash.draw('il-gas-calc');
