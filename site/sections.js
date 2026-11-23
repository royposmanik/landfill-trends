// Leachate, leachate around the world and landfill gas: drawings and controls for these sections of dashboard_page.html.
// Loaded after the page's main script (kept separate so the page stays under the dashboard store's size limit).
// Leachate section: a rain-to-leachate calculator.
LF.leach = {
  T: (en, he) => '<span class="lf-en">' + en + '</span><span class="lf-he-t" lang="he">' + he + '</span>'
};
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

// Landfill gas simulator following US EPA LandGEM version 3.1 (July 2025), both of its modes:
// A, NSPS applicability: first-order decay, each year's waste in tenths, Q = Σ Σ k·L0·(M/10)·e^(−k·t), t = age of each tenth.
// B, emissions inventory (40 CFR 98 equation HH-1): decomposable carbon mass balance, CH4 = DDOCm decomposed × F × MCF × 16/12.
// Gas and pollutant concentrations, molecular weights and constants are those in the LandGEM workbook (AP-42 section 2.4).
LF.gem = {
  T: (en, he) => '<span class="lf-en">' + en + '</span><span class="lf-he-t" lang="he">' + he + '</span>',
  he: () => window.LF_LANG === 'he' || !!document.querySelector('.lf.lf-he'),
  fmt: (v, d) => new Intl.NumberFormat(LF.gem.he() ? 'he-IL' : 'en-US', { maximumFractionDigits: d == null ? 3 : d }).format(v),
  P: 101.325, TK: 293, R: 8.3144, // standard pressure kPa, temperature K, gas constant: LandGEM DEFAULTS
  mgPerM3: (mw) => mw * LF.gem.P / (LF.gem.TK * LF.gem.R * 1000),
  kA: [[0.05, 'Conventional NSPS', 'רגיל, NSPS'], [0.02, 'Arid NSPS', 'אזור צחיח, NSPS'], [0.098, 'Faster decay', 'פירוק מהיר'], [0.067, 'Moderate decay', 'פירוק בינוני'], [0.033, 'Slower decay', 'פירוק איטי']],
  kB: [[0.057, 'Faster (wet), waste before 2010', 'מהיר (גשום), פסולת לפני 2010'], [0.098, 'Faster (wet), waste from 2010', 'מהיר (גשום), פסולת מ-2010'], [0.038, 'Moderate, waste before 2010', 'בינוני, פסולת לפני 2010'], [0.067, 'Moderate, waste from 2010', 'בינוני, פסולת מ-2010'], [0.02, 'Slower (dry), waste before 2010', 'איטי (יבש), פסולת לפני 2010'], [0.033, 'Slower (dry), waste from 2010', 'איטי (יבש), פסולת מ-2010'], [0.04, 'Construction and demolition waste', 'פסולת בניין והריסה']],
  doc: [[0.2, 'Bulk waste, before 2010', 'פסולת מעורבת, לפני 2010'], [0.17, 'Bulk waste, from 2010', 'פסולת מעורבת, מ-2010'], [0.31, 'Bulk MSW without inert and C&D waste, before 2010', 'פסולת עירונית בלי פסולת אינרטית ובניין, לפני 2010'], [0.27, 'Bulk MSW without inert and C&D waste, from 2010', 'פסולת עירונית בלי פסולת אינרטית ובניין, מ-2010'], [0.08, 'Construction and demolition waste', 'פסולת בניין והריסה'], [0.32, 'Uncharacterized MSW', 'פסולת עירונית לא מאופיינת'], [0.15, 'Food waste', 'פסולת מזון'], [0.2, 'Garden waste', 'גזם'], [0.4, 'Paper', 'נייר'], [0.43, 'Wood and straw', 'עץ וקש'], [0.24, 'Textiles', 'טקסטיל'], [0.24, 'Diapers', 'חיתולים'], [0.05, 'Sewage sludge', 'בוצת שפכים']],
  nmocB: [[550, 'No or unknown co-disposal, from 1992', 'בלי הטמנה משותפת (או לא ידוע), מ-1992'], [600, 'No or unknown co-disposal, before 1992', 'בלי הטמנה משותפת (או לא ידוע), לפני 1992'], [2400, 'Hazardous waste co-disposed', 'עם פסולת מסוכנת']],
  // [name, ppmv in mode A, ppmv in mode B, molecular weight]
  pol: [
    ['1,1,1-Trichloroethane (methyl chloroform)', 0.48, 0.48, 133.41], ['1,1,2,2-Tetrachloroethane', 1.1, 1.1, 167.85], ['1,1-Dichloroethane (ethylidene dichloride)', 2.4, 2.4, 98.97], ['1,1-Dichloroethene (vinylidene chloride)', 0.2, 0.2, 96.94],
    ['1,2-Dichloroethane (ethylene dichloride)', 0.41, 0.41, 98.96], ['1,2-Dichloropropane (propylene dichloride)', 0.18, 0.18, 112.99], ['2-Propanol (isopropyl alcohol)', 50, 50, 60.11], ['Acetone', 7, 7, 58.08], ['Acrylonitrile', 6.3, 6.3, 53.06],
    ['Benzene, no or unknown co-disposal', 1.9, 1.9, 78.11], ['Benzene, co-disposal', 11, 11, 78.11], ['Bromodichloromethane', 3.1, 3.1, 163.83], ['Butane', 5, 5, 58.12], ['Carbon disulfide', 0.58, 0.58, 76.13], ['Carbon monoxide', 110, 105, 28.01],
    ['Carbon tetrachloride', 0.004, 0.004, 153.84], ['Carbonyl sulfide', 0.49, 0.49, 60.07], ['Chlorobenzene', 0.25, 0.25, 112.56], ['Chlorodifluoromethane', 1.3, 1.3, 86.47], ['Chloroethane (ethyl chloride)', 1.3, 1.3, 64.52], ['Chloroform', 0.03, 0.03, 119.39],
    ['Chloromethane', 1.2, 1.2, 50.49], ['Dichlorobenzene', 0.21, 0.21, 147], ['Dichlorodifluoromethane', 16, 16, 120.91], ['Dichlorofluoromethane', 2.6, 2.6, 102.92], ['Dichloromethane (methylene chloride)', 14, 14, 84.94], ['Dimethyl sulfide (methyl sulfide)', 7.8, 7.8, 62.13],
    ['Ethane', 890, 890, 30.07], ['Ethanol', 27, 27, 46.08], ['Ethyl mercaptan (ethanethiol)', 2.3, 2.3, 62.13], ['Ethylbenzene', 4.6, 4.6, 106.16], ['Ethylene dibromide', 0.001, 0.001, 187.88], ['Fluorotrichloromethane', 0.76, 0.76, 137.38], ['Hexane', 6.6, 6.6, 86.18],
    ['Hydrogen sulfide', 36, 36, 34.08], ['Mercury (total)', 0.00029, 0.00029, 200.61], ['Methyl ethyl ketone', 7.1, 7.1, 72.11], ['Methyl isobutyl ketone', 1.9, 1.9, 100.16], ['Methyl mercaptan', 2.5, 2.5, 48.11], ['Pentane', 3.3, 3.3, 72.15],
    ['Perchloroethylene (tetrachloroethylene)', 3.7, 3.7, 165.83], ['Propane', 11, 11, 44.09], ['t-1,2-Dichloroethene', 2.8, 2.8, 96.94], ['Toluene, no or unknown co-disposal', 39, 39, 92.13], ['Toluene, co-disposal', 170, 170, 92.13],
    ['Trichloroethylene (trichloroethene)', 2.8, 2.8, 131.4], ['Vinyl chloride', 7.3, 7.3, 62.5], ['Xylenes', 12, 12, 106.16]
  ],
  // All of Israel: municipal waste landfilled each year, thousand tonnes, 1960–2024. 2004–2024: OECD (landfilled kg per person × World Bank population;
  // before 2013 all disposal counts as landfilled). 1960–2003: our estimate, 2004's 601 kg per person × World Bank population.
  il: { from: 1960, kt: [1270.5,1313.2,1378.1,1429.8,1487.5,1540.4,1580,1649.7,1684.6,1729.1,1787.4,1844.5,1891.9,1970.1,2029.6,2076.5,2123.3,2171.4,2217.7,2275.4,2330.7,2377.6,2422.6,2467.1,2499.6,2544,2583.7,2625.8,2669.6,2715.3,2800.7,2974.3,3078.9,3161.9,3244.8,3332.5,3420.9,3507.4,3588.6,3681.1,3779.7,3869.8,3948.6,4020.7,4092.2,4206.5,4359.4,4437.2,4575.4,4731.2,4803.1,4931.4,5031.4,4142.8,4214.8,4282.2,4358.5,4391.4,4503.7,4608.5,4847.1,4938.5,4931.9,4973.7,5141], inv2022: 304000 },
  defaults: { mode: 'A', open: 2000, d: 20, m: 100000, kA: 0.05, l0: 170, kB: 0.098, doc: 0.17, mcf: 1, f: 0.5, nmocB: 550 }
};
LF.st.lfgMode = LF.st.lfgMode || 'A';
LF.st.lfgSrc = LF.st.lfgSrc || 'one';

// The controls are built once from here, to keep the dashboard page small.
dash.draw('lfg-ui', (el) => {
  if (el.dataset.built) return;
  el.dataset.built = '1';
  const G = LF.gem, T = G.T, D = G.defaults;
  const opts = (list, val, fmtv) => list.map(([v, en]) => '<option value="' + v + '"' + (v === val ? ' selected' : '') + '>' + en + ' (' + (fmtv ? fmtv(v) : v) + ')</option>').join('') +
    list.map(([v, , he]) => '<option value="he:' + v + '" lang="he">' + he + ' (' + (fmtv ? fmtv(v) : v) + ')</option>').join('');
  const range = (id, en, he, min, max, step, val, unitEn, unitHe) => '<label class="lf-gem-c"><span class="lf-gem-cap"><span>' + T(en, he) + '</span><output data-draw="lfg-v-' + id + '"></output></span>' +
    (unitEn ? '<small>' + T(unitEn, unitHe) + '</small>' : '') + '<input type="range" id="lfg-' + id + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"></label>';
  const sel = (id, en, he, html) => '<label class="lf-gem-c"><span class="lf-gem-cap"><span>' + T(en, he) + '</span></span><select class="dash-select" id="lfg-' + id + '">' + html + '</select></label>';
  const gasOpts = ['<option value="lfg">Total landfill gas</option>', '<option value="ch4" selected>Methane</option>', '<option value="co2">Carbon dioxide</option>', '<option value="nmoc">NMOC (non-methane organic compounds)</option>',
    '<option value="he:lfg" lang="he">סך גז המטמנות</option>', '<option value="he:ch4" lang="he">מתאן</option>', '<option value="he:co2" lang="he">פחמן דו-חמצני</option>', '<option value="he:nmoc" lang="he">NMOC (תרכובות אורגניות שאינן מתאן)</option>']
    .concat(G.pol.map((p, i) => '<option value="p' + i + '">' + p[0] + '</option>'), G.pol.map((p, i) => '<option value="he:p' + i + '" lang="he">' + p[0] + '</option>')).join('');
  el.innerHTML =
    '<div class="lf-gem">' +
    '<div class="lf-gem-in">' +
      '<div class="lf-gem-pre"><span class="lf-sel-label">' + T('LandGEM mode', 'מצב LandGEM') + '</span><div class="lf-gem-btns lf-gem-modes">' +
        '<button type="button" class="lf-btn lf-gem-mode" data-mode="A">' + T('A: NSPS (US air rules)', 'A: NSPS (תקנות אוויר בארה"ב)') + '</button>' +
        '<button type="button" class="lf-btn lf-gem-mode" data-mode="B">' + T('B: Emissions inventory', 'B: מצאי פליטות') + '</button></div></div>' +
      '<div class="lf-gem-pre"><span class="lf-sel-label">' + T('Waste', 'פסולת') + '</span><div class="lf-gem-btns">' +
        '<button type="button" class="lf-btn lf-gem-mode lf-gem-srcb" data-src="one">' + T('One landfill', 'מטמנה אחת') + '</button>' +
        '<button type="button" class="lf-btn lf-gem-mode lf-gem-srcb" data-src="il">' + T('All of Israel', 'כל ישראל') + '</button></div></div>' +
      '<div class="lf-gem-box" data-gem-src="one">' +
        range('open', 'Year the landfill opens', 'שנת פתיחת המטמנה', 1950, 2030, 1, D.open) +
        range('d', 'Years accepting waste', 'משך קליטת הפסולת', 1, 80, 1, D.d, 'years (LandGEM allows up to 80)', 'שנים (LandGEM מאפשר עד 80)') +
        range('m', 'Waste a year', 'כמות פסולת שנתית', 10000, 2000000, 10000, D.m, 'tonnes a year', 'טונות בשנה') +
      '</div>' +
      '<div class="lf-gem-box" data-gem-src="il" hidden>' +
        '<p class="lf-gem-fix">' + T('All the municipal waste Israel landfilled each year: about 5.1 million t in 2024 (OECD). Before 2004 we assume 2004\'s 601 kg per person.', 'כל הפסולת העירונית שישראל הטמינה בכל שנה: כ-5.1 מיליון טון ב-2024 (OECD). לפני 2004 אנחנו מניחים 601 ק"ג לאדם, כמו ב-2004.') + '</p>' +
        range('ils', 'Count waste buried from', 'לספור פסולת שהוטמנה החל מ-', 1960, 2004, 1, 1960) +
        sel('ilf', 'After 2024', 'אחרי 2024', '<option value="keep" selected>Keep landfilling 2024\'s amount until 2050</option><option value="cut">Cut to the 2030 target (20% of waste), then hold until 2050</option><option value="stop">Stop landfilling after 2024</option>' +
          '<option value="he:keep" lang="he">ממשיכים להטמין כמו ב-2024 עד 2050</option><option value="he:cut" lang="he">יורדים ליעד 2030 (20% מהפסולת), ונשארים כך עד 2050</option><option value="he:stop" lang="he">מפסיקים להטמין אחרי 2024</option>') +
      '</div>' +
      '<div class="lf-gem-box" data-gem-mode="A">' +
        sel('ka', 'Methane generation rate k, preset', 'קבוע קצב הייצור k, ברירת מחדל', opts(G.kA, D.kA)) +
        range('k', 'k', 'k', 0.005, 0.3, 0.001, D.kA, 'per year', 'לשנה') +
        range('l0', 'Methane generation potential L₀', 'פוטנציאל ייצור המתאן L₀', 20, 250, 1, D.l0, 'm³ of methane per tonne (NSPS default 170)', 'מ"ק מתאן לטון (ברירת המחדל של NSPS היא 170)') +
        '<p class="lf-gem-fix">' + T('Methane 50% of the gas and NMOC 4,000 ppmv (NSPS Tier 1), as the rules require.', 'מתאן 50% מהגז ו-<bdi dir="ltr">NMOC 4,000 ppmv</bdi> (<bdi dir="ltr">NSPS Tier 1</bdi>), כפי שהתקנות דורשות.') + '</p>' +
      '</div>' +
      '<div class="lf-gem-box" data-gem-mode="B" hidden>' +
        sel('kb', 'Decay rate k (by rain and when the waste was buried)', 'קצב הפירוק k (לפי הגשם ומתי הפסולת נקברה)', opts(G.kB, D.kB)) +
        sel('doc', 'Degradable organic carbon, DOC', 'פחמן אורגני מתפרק, DOC', opts(G.doc, D.doc)) +
        range('mcf', 'Methane correction factor, MCF', 'מקדם תיקון למתאן, MCF', 0, 1, 0.05, D.mcf, '1 for a managed landfill (inventory default)', '1 למטמנה מנוהלת (ברירת המחדל במצאי)') +
        range('f', 'Methane share of landfill gas, F', 'חלק המתאן בגז המטמנה, F', 0.4, 0.6, 0.01, D.f, 'default 0.5', 'ברירת מחדל 0.5') +
        sel('nmoc', 'NMOC concentration', 'ריכוז NMOC', opts(G.nmocB, D.nmocB, (v) => G.fmt(v) + ' ppmv')) +
        '<p class="lf-gem-fix" data-draw="lfg-l0b"></p>' +
      '</div>' +
      '<div class="lf-gem-btns">' +
        '<button type="button" class="lf-btn" id="lfg-capture">' + T('Set as comparison', 'קבע תרחיש להשוואה') + '</button>' +
        '<button type="button" class="lf-btn" id="lfg-clear" hidden>' + T('Remove comparison', 'הסר השוואה') + '</button>' +
        '<button type="button" class="lf-btn" id="lfg-reset">' + T('Reset', 'איפוס') + '</button>' +
      '</div>' +
    '</div>' +
    '<div class="lf-gem-out">' +
      '<div class="lf-gem-outsel">' + sel('gas', 'Show', 'הצג', gasOpts) +
        sel('unit', 'Units', 'יחידות', '<option value="m3">m³ a year</option><option value="mg">tonnes (Mg) a year</option><option value="he:m3" lang="he">מ"ק בשנה</option><option value="he:mg" lang="he">טונות בשנה</option>') + '</div>' +
      '<div class="lf-gem-m" data-draw="lfg-metrics"></div>' +
      '<p class="lf-gem-fix" data-draw="lfg-il-check" hidden></p>' +
      '<ul class="lf-legend" aria-hidden="true">' +
        '<li>' + T('<span class="lf-gem-k"></span>Current scenario', '<span class="lf-gem-k"></span>תרחיש נוכחי') + '</li>' +
        '<li class="lf-gem-refkey" hidden>' + T('<span class="lf-gem-k lf-gem-k-ref"></span>Comparison scenario', '<span class="lf-gem-k lf-gem-k-ref"></span>תרחיש להשוואה') + '</li>' +
        '<li>' + T('<span class="lf-gem-k lf-gem-k-close"></span>Landfill stops taking waste', '<span class="lf-gem-k lf-gem-k-close"></span>סיום קליטת פסולת') + '</li>' +
      '</ul>' +
      '<div class="lf-gem-chart" data-draw="lfg-chart"></div>' +
      '<label class="lf-gem-c lf-gem-probe"><span class="lf-gem-cap"><span>' + T('Year to check', 'שנה לבדיקה') + '</span><output data-draw="lfg-v-y"></output></span><input type="range" id="lfg-y" min="1950" max="2200" step="1" value="2020"></label>' +
      '<p class="lf-gem-read" data-draw="lfg-read" aria-live="polite"></p>' +
      '<details class="lf-gem-snap"><summary>' + T('All gases and pollutants in that year (LandGEM snapshot)', 'כל הגזים והמזהמים באותה שנה (תמונת מצב של LandGEM)') + '</summary><div data-draw="lfg-snap"></div></details>' +
    '</div></div>' +
    '<details class="lf-gem-how"><summary>' + T('How is it calculated?', 'איך זה מחושב?') + '</summary><p>' +
      T('Mode A (NSPS, used to decide whether US air rules apply) splits each year\'s waste into ten equal parts. Each part makes k × L₀ × its mass × e<sup>−k × its age</sup> m³ of methane a year, starting the year after it is buried. Mode B (the emissions inventory, 40 CFR 98 equation HH-1) tracks the decomposable carbon: each year\'s waste adds DOC × DOCf of it (DOCf = 0.5), a share 1 − e<sup>−k</sup> of what has built up decomposes each year, and methane = decomposed carbon × F × MCF × 16/12. Mode B\'s L₀ works out to DOC × DOCf × F × MCF × 16/12 ÷ 0.667, so the default DOC of 0.2 gives 100 m³ per tonne. Landfill gas = methane ÷ its share; carbon dioxide is the rest. Each pollutant = landfill gas × its concentration (AP-42 defaults, built into LandGEM). Masses use the ideal gas law at 293 K and 101.325 kPa, so a tonne of methane is about 1,499 m³.',
        'מצב A ‏(NSPS, משמש לקבוע אם תקנות האוויר בארה"ב חלות) מחלק את הפסולת של כל שנה לעשרה חלקים שווים. כל חלק מייצר k × L₀ × המסה שלו × e<sup>−k × הגיל שלו</sup> מ"ק מתאן בשנה, החל מהשנה שאחרי ההטמנה. מצב B (מצאי הפליטות, משוואה HH-1 בתקנה 40 CFR 98) עוקב אחרי הפחמן המתפרק: הפסולת של כל שנה מוסיפה DOC × DOCf ממנו (DOCf = 0.5), בכל שנה מתפרק חלק 1 − e<sup>−k</sup> ממה שהצטבר, והמתאן = הפחמן שהתפרק × F × MCF × 16/12. ה-L₀ של מצב B יוצא DOC × DOCf × F × MCF × 16/12 ÷ 0.667, כך ש-DOC של 0.2 נותן 100 מ"ק לטון. גז המטמנה = המתאן ÷ החלק שלו; פחמן דו-חמצני הוא השאר. כל מזהם = גז המטמנה × הריכוז שלו (ערכי ברירת המחדל של AP-42 שבתוך LandGEM). המסות מחושבות לפי חוק הגזים האידיאליים ב-293 קלווין ו-101.325 קילופסקל, כך שטון מתאן הוא כ-1,499 מ"ק.') + '</p></details>';
  const he = window.LF_LANG === 'he';
  el.querySelectorAll('select').forEach((s) => { const v = lfVal(s); for (const o of s.options) o.hidden = o.value.startsWith('he:') !== he; s.value = (he ? 'he:' : '') + v; });
  if (LF.gem.wire) LF.gem.wire();
});

LF.gem.get = () => {
  const G = LF.gem, D = G.defaults, num = (id, dv) => { const e = document.getElementById('lfg-' + id); return e ? +lfVal(e) : dv; };
  const r = { mode: LF.st.lfgMode, src: LF.st.lfgSrc, open: num('open', D.open), d: num('d', D.d), m: num('m', D.m), k: num('k', D.kA), l0: num('l0', D.l0), kB: num('kb', D.kB), doc: num('doc', D.doc), mcf: num('mcf', D.mcf), f: num('f', D.f), nmocB: num('nmoc', D.nmocB) };
  if (r.src === 'il') {
    const e = document.getElementById('lfg-ilf'), fut = e ? lfVal(e) : 'keep', I = G.il, from = num('ils', I.from), last = I.kt[I.kt.length - 1] * 1000;
    r.open = from;
    r.w = I.kt.slice(from - I.from).map((v) => v * 1000);
    // The 2030 target is to landfill 20% of municipal waste, against 75.6% in 2024: a straight line down from 2024's tonnes, then held.
    if (fut !== 'stop') for (let y = 2025; y <= 2050; y++) r.w.push(fut === 'keep' ? last : last * (1 - (1 - 20 / 75.6) * Math.min(1, (y - 2024) / 6)));
    r.d = r.w.length;
  }
  return r;
};
LF.gem.l0B = (s) => s.doc * 0.5 * s.f * s.mcf * 16 / 12 / 0.667 * 1000;
// Methane generated each year (m³), from the opening year to `n` years later.
LF.gem.methane = (s, n) => {
  const G = LF.gem, out = new Array(n + 1).fill(0);
  if (s.mode === 'A') {
    for (let t = 1; t <= n; t++) {
      let q = 0;
      for (let dep = 0; dep < Math.min(t, s.d); dep++) for (let j = 0; j < 10; j++) q += s.k * s.l0 * ((s.w ? s.w[dep] : s.m) / 10) * Math.exp(-s.k * (t - dep - 1 + j / 10));
      out[t] = q;
    }
  } else {
    let J = 0;
    for (let t = 0; t <= n; t++) {
      const I = J * (1 - Math.exp(-s.kB));
      J = J - I + (t < s.d ? (s.w ? s.w[t] : s.m) * s.doc * 0.5 : 0);
      out[t] = I * s.f * s.mcf * 16 / 12 / G.mgPerM3(16.04);
    }
  }
  return out;
};
// Converts methane (m³) to the chosen gas, in m³ or tonnes.
LF.gem.conv = (s, gas, unit) => {
  const G = LF.gem, F = s.mode === 'A' ? 0.5 : s.f;
  let vol, mw;
  if (gas === 'ch4') { vol = 1; mw = 16.04; }
  else if (gas === 'lfg') { vol = 1 / F; mw = F * 16.04 + (1 - F) * 44.01; }
  else if (gas === 'co2') { vol = (1 - F) / F; mw = 44.01; }
  else if (gas === 'nmoc') { vol = (s.mode === 'A' ? 4000 : s.nmocB) / 1e6 / F; mw = 86.18; }
  else { const p = G.pol[+gas.slice(1)]; vol = (s.mode === 'A' ? p[1] : p[2]) / 1e6 / F; mw = p[3]; }
  return unit === 'mg' ? vol * G.mgPerM3(mw) : vol;
};
LF.gem.series = () => {
  const G = LF.gem, cur = G.get(), ref = LF.st.lfgRef || null;
  const gs = document.getElementById('lfg-gas'), us = document.getElementById('lfg-unit');
  const gas = gs ? lfVal(gs) : 'ch4', unit = us ? lfVal(us) : 'm3';
  const start = Math.min(cur.open, ref ? ref.open : cur.open);
  const end = Math.min(Math.max(cur.open + cur.d, ref ? ref.open + ref.d : 0) + 50, start + 140);
  const n = end - start, years = d3.range(start, end + 1);
  const line = (s) => { const q = G.methane(s, end - s.open), c = G.conv(s, gas, unit); return years.map((y) => (y < s.open ? 0 : q[y - s.open] * c)); };
  return { cur, ref, gas, unit, years, n, values: line(cur), comp: ref ? line(ref) : null, ch4: (() => { const q = G.methane(cur, end - cur.open); return years.map((y) => (y < cur.open ? 0 : q[y - cur.open])); })() };
};
LF.gem.gasName = (gas) => {
  const G = LF.gem, he = G.he();
  if (gas[0] === 'p') return G.pol[+gas.slice(1)][0];
  return { lfg: he ? 'גז מטמנות' : 'landfill gas', ch4: he ? 'מתאן' : 'methane', co2: he ? 'פחמן דו-חמצני' : 'carbon dioxide', nmoc: 'NMOC' }[gas];
};
LF.gem.unitName = (unit) => (unit === 'mg' ? (LF.gem.he() ? 'טונות בשנה' : 'tonnes a year') : (LF.gem.he() ? 'מ"ק בשנה' : 'm³ a year'));
LF.gem.probe = (S) => { const p = document.getElementById('lfg-y'); const v = p ? +p.value : S.years[0] + 20; return Math.max(S.years[0], Math.min(S.years[S.years.length - 1], v)); };
// Numbers of very different sizes: millions get a suffix, small ones keep three significant digits.
LF.gem.big = (v) => { const G = LF.gem, he = G.he(); if (v >= 1e6) return G.fmt(v / 1e6, 2) + (he ? ' מיליון' : ' million'); if (v >= 1000) return G.fmt(v, 0); if (v === 0) return '0'; return new Intl.NumberFormat(he ? 'he-IL' : 'en-US', { maximumSignificantDigits: 3 }).format(v); };

['open', 'd', 'm', 'k', 'l0', 'mcf', 'f'].forEach((id) => dash.draw('lfg-v-' + id, (el) => {
  const e = document.getElementById('lfg-' + id);
  if (e) el.textContent = id === 'open' ? e.value : LF.gem.fmt(+e.value);
}));
dash.draw('lfg-v-ils', (el) => { const e = document.getElementById('lfg-ils'); if (e) el.textContent = e.value; });
dash.draw('lfg-il-check', (el) => {
  const G = LF.gem, s = G.get();
  el.hidden = s.src !== 'il';
  if (s.src !== 'il') return;
  const t = Math.round(G.methane(s, 2022 - s.open)[2022 - s.open] * G.mgPerM3(16.04) / 1000) * 1000;
  el.innerHTML = G.T('Check: this run makes about ' + G.fmt(t, 0) + ' t of methane in 2022. Israel\'s national inventory, which uses the IPCC model, puts methane made in landfills that year at about ' + G.fmt(G.il.inv2022, 0) + ' t. This is methane made, not released: only about 16,000 t was collected.',
    'בדיקה: הריצה הזו מייצרת כ-' + G.fmt(t, 0) + ' טון מתאן ב-2022. המצאי הלאומי של ישראל, שמשתמש במודל של ה-IPCC, מעריך שבאותה שנה נוצרו במטמנות כ-' + G.fmt(G.il.inv2022, 0) + ' טון. זה המתאן שנוצר, לא זה שנפלט: נאספו רק כ-16,000 טון.');
});
dash.draw('lfg-v-y', (el) => { el.textContent = String(LF.gem.probe(LF.gem.series())); });
dash.draw('lfg-l0b', (el) => { const s = LF.gem.get(); el.innerHTML = LF.gem.T('This gives L₀ = ' + LF.gem.fmt(LF.gem.l0B(s), 0) + ' m³ of methane per tonne (DOCf = 0.5).', 'מתקבל L₀ = ' + LF.gem.fmt(LF.gem.l0B(s), 0) + ' מ"ק מתאן לטון (DOCf = 0.5).'); });
dash.draw('lfg-metrics', (el) => {
  const G = LF.gem, S = G.series(), T = G.T, peak = d3.max(S.values) || 0, py = S.years[S.values.indexOf(peak)];
  const ch4Peak = d3.max(S.ch4) || 0, ch4t = ch4Peak * G.mgPerM3(16.04), total = d3.sum(S.ch4);
  const box = (lab, v, sub) => '<div><span>' + lab + '</span><b>' + v + '</b><span>' + sub + '</span></div>';
  const name = G.gasName(S.gas), unit = G.unitName(S.unit);
  el.innerHTML =
    box(T('Peak', 'שיא'), G.big(peak), (G.he() ? name + ', ' + unit : name + ', ' + unit)) +
    box(T('Peak year', 'שנת השיא'), py || '—', S.cur.src === 'il' ? T('last waste buried ' + (S.cur.open + S.cur.d - 1), 'הטמנה אחרונה ב-' + (S.cur.open + S.cur.d - 1)) : T('closes ' + (S.cur.open + S.cur.d - 1), 'נסגרת ב-' + (S.cur.open + S.cur.d - 1))) +
    box(T('Methane over the run', 'מתאן לאורך התקופה'), G.fmt(total / 1e6, 1), T('million m³, ' + S.years[0] + '–' + S.years[S.years.length - 1], 'מיליון מ"ק, ' + S.years[0] + '–' + S.years[S.years.length - 1])) +
    box(T('Methane at its peak', 'מתאן בשיא'), G.fmt(ch4t, 0), T('tonnes a year, ≈ ' + G.fmt(ch4t * 28 / 1e6, 2) + ' million t CO₂e', 'טונות בשנה, ≈ ' + G.fmt(ch4t * 28 / 1e6, 2) + ' מיליון טון CO₂e'));
});
dash.draw('lfg-chart', (el) => {
  const G = LF.gem, S = G.series(), he = G.he(), sel = G.probe(S);
  const ceiling = Math.max(d3.max(S.values), S.comp ? d3.max(S.comp) : 0) || 1;
  const div = ceiling >= 1e6 ? 1e6 : 1, ticks = d3.ticks(0, ceiling / div, 5), scaleMax = Math.max(ceiling / div, ticks[ticks.length - 1] || 1) * div;
  const fs = Math.min(24, Math.max(13, 13 * 480 / (el.clientWidth || 670)));
  const L = 64, R = 650, Tp = 29, B = 289, y0 = S.years[0], span = S.years[S.years.length - 1] - y0 || 1;
  const x = (yr) => L + (yr - y0) / span * (R - L), y = (q) => B - q / scaleMax * (B - Tp);
  const line = (pts, cls) => '<polyline points="' + pts.map((q, i) => x(S.years[i]).toFixed(1) + ',' + y(q).toFixed(1)).join(' ') + '" class="' + cls + '"/>';
  let ax = '';
  for (const t of ticks) ax += '<path d="M' + L + ' ' + y(t * div) + 'H' + R + '" stroke="var(--cds-chart-grid)"/><text x="' + (L - 8) + '" y="' + (y(t * div) + 4) + '" text-anchor="end">' + G.fmt(t) + '</text>';
  const step = span > 100 ? 20 : 10;
  for (let yr = Math.ceil(y0 / step) * step; yr <= y0 + span; yr += step) ax += '<text x="' + x(yr) + '" y="311" text-anchor="middle">' + yr + '</text>';
  const unitLab = (div === 1e6 ? (he ? 'מיליוני ' : 'million ') : '') + G.unitName(S.unit);
  const close = S.cur.open + S.cur.d - 1;
  el.innerHTML = '<svg viewBox="0 0 670 345" font-size="' + fs.toFixed(1) + '" role="img" aria-label="' + G.gasName(S.gas) + ', ' + unitLab + '">' +
    '<style>.lfg-cur{fill:none;stroke:var(--lf-gas,#7fd0a8);stroke-width:3.2;stroke-linejoin:round}.lfg-ref{fill:none;stroke:var(--color-fg-muted);stroke-width:2.6;stroke-dasharray:7 6}</style>' +
    '<text x="' + L + '" y="17" text-anchor="start">' + G.gasName(S.gas) + ', ' + unitLab + '</text>' + ax +
    '<path d="M' + L + ' ' + Tp + 'V' + B + 'H' + R + '" fill="none" stroke="var(--cds-chart-axis)"/>' +
    '<path d="M' + x(close) + ' ' + Tp + 'V' + B + '" stroke="#d9a441" stroke-width="2" stroke-dasharray="2 4"/>' +
    '<path d="M' + x(sel) + ' ' + Tp + 'V' + B + '" stroke="var(--color-fg-muted)" stroke-dasharray="4 5"/>' +
    (S.comp ? line(S.comp, 'lfg-ref') : '') + line(S.values, 'lfg-cur') +
    '<circle cx="' + x(sel) + '" cy="' + y(S.values[sel - y0]) + '" r="5" fill="var(--lf-gas,#7fd0a8)" stroke="var(--color-panel)" stroke-width="2"/></svg>';
});
dash.draw('lfg-read', (el) => {
  const G = LF.gem, S = G.series(), sel = G.probe(S), i = sel - S.years[0];
  const v = G.big(S.values[i]), r = S.comp ? G.big(S.comp[i]) : null, u = G.unitName(S.unit), n = G.gasName(S.gas);
  el.innerHTML = G.T(sel + ' · current scenario ' + v + ' ' + u + ' of ' + n + (r ? ' · comparison ' + r : ''), sel + ' · תרחיש נוכחי ' + v + ' ' + u + ' ' + n + (r ? ' · תרחיש להשוואה ' + r : ''));
});
dash.draw('lfg-snap', (el) => {
  const G = LF.gem, S = G.series(), s = S.cur, sel = G.probe(S), q = sel < s.open ? 0 : G.methane(s, sel - s.open)[sel - s.open], he = G.he();
  const rows = [['lfg', he ? 'סך גז המטמנות' : 'Total landfill gas'], ['ch4', he ? 'מתאן' : 'Methane'], ['co2', he ? 'פחמן דו-חמצני' : 'Carbon dioxide'], ['nmoc', 'NMOC']].concat(G.pol.map((p, i) => ['p' + i, p[0]]));
  const ppm = (g) => { const F = s.mode === 'A' ? 0.5 : s.f; if (g === 'ch4') return F * 1e6; if (g === 'co2') return (1 - F) * 1e6; if (g === 'lfg') return 1e6; if (g === 'nmoc') return s.mode === 'A' ? 4000 : s.nmocB; const p = G.pol[+g.slice(1)]; return s.mode === 'A' ? p[1] : p[2]; };
  let h = '<table class="lf-table lf-gem-tab"><thead><tr><th scope="col">' + G.T('Gas or pollutant', 'גז או מזהם') + '</th><th scope="col">ppmv</th><th scope="col">' + G.T('tonnes a year', 'טונות בשנה') + '</th><th scope="col">' + G.T('m³ a year', 'מ"ק בשנה') + '</th></tr></thead><tbody>';
  for (const [g, n] of rows) h += '<tr><td>' + n + '</td><td class="lf-num">' + G.big(ppm(g)) + '</td><td class="lf-num">' + G.big(q * G.conv(s, g, 'mg')) + '</td><td class="lf-num">' + G.big(q * G.conv(s, g, 'm3')) + '</td></tr>';
  el.innerHTML = '<p class="lf-note">' + G.T('Year ' + sel + ', mode ' + s.mode + '.', 'שנת ' + sel + ', מצב ' + s.mode + '.') + '</p>' + h + '</tbody></table>';
});
LF.gem.redraw = () => {
  const G = LF.gem, S = G.series(), p = document.getElementById('lfg-y');
  if (p) { p.min = S.years[0]; p.max = S.years[S.years.length - 1]; }
  document.querySelectorAll('#lfg-clear, .lf-gem-refkey').forEach((e) => { e.hidden = !LF.st.lfgRef; });
  document.querySelectorAll('.lf-gem-box[data-gem-mode]').forEach((b) => { b.hidden = b.dataset.gemMode !== LF.st.lfgMode; });
  document.querySelectorAll('.lf-gem-mode[data-mode]').forEach((b) => { b.setAttribute('aria-pressed', String(b.dataset.mode === LF.st.lfgMode)); });
  document.querySelectorAll('[data-gem-src]').forEach((b) => { b.hidden = b.dataset.gemSrc !== LF.st.lfgSrc; });
  document.querySelectorAll('.lf-gem-srcb').forEach((b) => { b.setAttribute('aria-pressed', String(b.dataset.src === LF.st.lfgSrc)); });
  ['lfg-v-ils', 'lfg-il-check', 'lfg-v-open', 'lfg-v-d', 'lfg-v-m', 'lfg-v-k', 'lfg-v-l0', 'lfg-v-mcf', 'lfg-v-f', 'lfg-v-y', 'lfg-l0b', 'lfg-metrics', 'lfg-chart', 'lfg-read', 'lfg-snap'].forEach((n) => dash.draw(n));
};
LF.gem.wire = function () {
  const G = LF.gem, D = G.defaults, $ = (id) => document.getElementById('lfg-' + id);
  document.querySelectorAll('#lfg-open, #lfg-d, #lfg-m, #lfg-k, #lfg-l0, #lfg-mcf, #lfg-f, #lfg-y, #lfg-ils').forEach((e) => e.addEventListener('input', G.redraw));
  document.querySelectorAll('#lfg-kb, #lfg-doc, #lfg-nmoc, #lfg-gas, #lfg-unit, #lfg-ilf').forEach((e) => e.addEventListener('change', G.redraw));
  document.querySelectorAll('#lfg-ka').forEach((e) => e.addEventListener('change', () => { const k = $('k'); if (k) k.value = lfVal(e); G.redraw(); }));
  document.querySelectorAll('.lf-gem-mode[data-mode]').forEach((b) => b.addEventListener('click', () => { LF.st.lfgMode = b.dataset.mode; G.redraw(); }));
  // All of Israel starts from inventory settings that suit it: mode B, dry decay (most waste goes to landfills in the dry south), municipal waste DOC.
  document.querySelectorAll('.lf-gem-srcb').forEach((b) => b.addEventListener('click', () => {
    if (LF.st.lfgSrc === b.dataset.src) return;
    LF.st.lfgSrc = b.dataset.src;
    const he = window.LF_LANG === 'he', setSel = (id, v) => { const e = $(id); if (e) e.value = (he ? 'he:' : '') + v; }, y = $('y');
    if (b.dataset.src === 'il') { LF.st.lfgMode = 'B'; setSel('kb', 0.033); setSel('doc', 0.27); if (y) y.value = 2024; }
    else if (y) y.value = +$('open').value + 20;
    G.redraw();
  }));
  document.querySelectorAll('#lfg-capture').forEach((b) => b.addEventListener('click', () => { LF.st.lfgRef = G.get(); G.redraw(); }));
  document.querySelectorAll('#lfg-clear').forEach((b) => b.addEventListener('click', () => { LF.st.lfgRef = null; G.redraw(); const c = $('capture'); if (c) c.focus(); }));
  document.querySelectorAll('#lfg-reset').forEach((b) => b.addEventListener('click', () => {
    const he = window.LF_LANG === 'he', setSel = (id, v) => { const e = $(id); if (e) e.value = (he ? 'he:' : '') + v; };
    for (const [id, v] of [['ils', 1960], ['open', D.open], ['d', D.d], ['m', D.m], ['k', D.kA], ['l0', D.l0], ['mcf', D.mcf], ['f', D.f], ['y', D.open + 20]]) { const e = $(id); if (e) e.value = v; }
    setSel('ka', D.kA); setSel('kb', D.kB); setSel('doc', D.doc); setSel('nmoc', D.nmocB); setSel('gas', 'ch4'); setSel('unit', 'm3'); setSel('ilf', 'keep'); LF.st.lfgSrc = 'one';
    LF.st.lfgRef = null; LF.st.lfgMode = 'A'; G.redraw();
  }));
  G.redraw();
};
dash.draw('lfg-ui');
['leach-calc', 'oecd-leach-time', 'oecd-leach-country', 'oecd-leach-year-label'].forEach((n) => dash.draw(n));

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
