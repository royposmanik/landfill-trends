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

// Leachate around the world: European landfills' leachate pollutants (E-PRTR, EEA industrial reporting database).
// rows: [pollutant key, country (ISO2), year, released to water kg, transferred in wastewater kg, reports to water, reports in wastewater]
LF.euLeach = window.LF_EU || { fac: {}, rows: [] };
LF.euLeach.P = {
  n: { en: 'Total nitrogen', he: 'חנקן כללי', t: true },
  c: { en: 'Organic carbon (TOC)', he: 'פחמן אורגני (TOC)', t: true },
  ni: { en: 'Nickel', he: 'ניקל', t: false },
  as: { en: 'Arsenic', he: 'ארסן', t: false }
};
LF.euLeach.T = (en, he) => '<span class="lf-en">' + en + '</span><span class="lf-he-t" lang="he">' + he + '</span>';
LF.euLeach.fmt = (kg, tonnes) => { const v = tonnes ? kg / 1000 : kg; return (v > 0 && v < 10 ? d3.format('.1f') : d3.format(',.0f'))(v); };
LF.euLeach.unit = (tonnes) => LF.euLeach.T(tonnes ? 't' : 'kg', tonnes ? 'טון' : 'ק"ג');
LF.euLeach.name = (c, lang) => {
  try { return new Intl.DisplayNames([lang], { type: 'region' }).of(c); } catch (e) { return c; }
};
LF.euLeach.years = d3.range(2007, 2025);
dash.draw('eu-leach-time', (el) => {
  const E = LF.euLeach, p = LF.st.euLeachP || 'n', sel = LF.st.euLeachY || 2024, info = E.P[p];
  const by = new Map(E.years.map((y) => [y, { w: 0, t: 0, n: 0 }]));
  for (const r of E.rows) if (r[0] === p && by.has(r[2])) { const b = by.get(r[2]); b.w += r[3]; b.t += r[4]; b.n += r[5] + r[6]; }
  const max = d3.max([...by.values()], (b) => b.w + b.t) || 1;
  const ticks = d3.ticks(0, max, 4).filter((t) => t > 0);
  const top = Math.max(max, ticks[ticks.length - 1] || max);
  let h = '<div class="lf-eu-plot">';
  for (const t of ticks) h += '<div class="lf-eu-grid" style="bottom:' + (t / top * 100).toFixed(2) + '%"><span>' + E.fmt(t, info.t) + '</span></div>';
  h += '<div class="lf-eu-cols">';
  for (const y of E.years) {
    const b = by.get(y), tot = b.w + b.t, hp = tot / top * 100;
    const tip = y + ': ' + E.fmt(tot, info.t) + (info.t ? ' t' : ' kg') + ' (' + E.fmt(b.t, info.t) + ' to sewage plants, ' + E.fmt(b.w, info.t) + ' to water)';
    h += '<button type="button" class="lf-eu-col' + (y === sel ? ' lf-eu-on' : '') + '" data-y="' + y + '" title="' + tip + '" aria-label="' + tip + '">' +
      '<span class="lf-eu-stack" style="height:' + hp.toFixed(2) + '%"><i class="lf-eu-t" style="flex:' + b.t + ' 1 0"></i><i class="lf-eu-w" style="flex:' + b.w + ' 1 0"></i>' +
      (b.n ? '<span class="lf-eu-n">' + b.n + '</span>' : '') + '</span></button>';
  }
  h += '</div></div><div class="lf-eu-years">';
  for (const y of E.years) h += '<span' + (y % 4 ? ' class="lf-eu-y2"' : '') + '>' + (y % 2 ? '' : y) + '</span>';
  h += '</div>';
  el.innerHTML = h;
  el.querySelectorAll('.lf-eu-col').forEach((b) => b.addEventListener('click', () => {
    LF.st.euLeachY = +b.dataset.y;
    document.querySelectorAll('#eu-leach-year').forEach((r) => { r.value = b.dataset.y; });
    dash.draw('eu-leach-time'); dash.draw('eu-leach-country'); dash.draw('eu-leach-year-label');
  }));
});
dash.draw('eu-leach-year-label', (el) => { el.textContent = String(LF.st.euLeachY || 2024); });
// By country, as SVG so it can play year by year and be saved as a GIF. One scale for every year of a pollutant.
dash.draw('eu-leach-country', (el) => {
  const E = LF.euLeach, p = LF.st.euLeachP || 'n', y = LF.st.euLeachY || 2024, info = E.P[p];
  const he = window.LF_LANG === 'he', lang = he ? 'he' : 'en';
  const all = E.rows.filter((r) => r[0] === p && r[3] + r[4] > 0);
  const nMax = d3.max(d3.rollup(all, (v) => v.length, (r) => r[2]).values()) || 1;
  const gmax = d3.max(all, (r) => r[3] + r[4]) || 1;
  const rows = all.filter((r) => r[2] === y).sort((a, b) => (b[3] + b[4]) - (a[3] + a[4]));
  const W = Math.max(300, Math.round(el.clientWidth || 670)), narrow = W < 520;
  const nameW = narrow ? 96 : 150, valW = narrow ? 74 : 180, rowH = 24, head = 30, H = head + nMax * rowH + 4;
  const bw = Math.max(40, W - nameW - valW - 8), x = (v) => v / gmax * bw;
  const key = p + '|' + W + '|' + lang;
  let svg = d3.select(el).select('svg');
  const fresh = svg.empty() || svg.attr('data-key') !== key;
  if (fresh) {
    el.innerHTML = '';
    svg = d3.select(el).append('svg').attr('data-key', key).attr('width', W).attr('height', H).attr('viewBox', '0 0 ' + W + ' ' + H)
      .attr('font-size', 13).attr('role', 'img');
    svg.append('text').attr('class', 'lf-eu-svgtitle').attr('y', 16);
    svg.append('text').attr('class', 'lf-eu-empty').attr('x', W / 2).attr('y', head + 40).attr('text-anchor', 'middle');
    svg.append('g').attr('class', 'lf-eu-rows');
  }
  const anim = !fresh && !window.LF_NOANIM && window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  const tr = (s) => (anim ? s.transition().duration(500).ease(d3.easeCubicOut) : s);
  const title = he ? info.he + ' שיוצא ממטמנות בתשטיפים, לפי מדינה, ' + y : info.en + ' leaving landfills in leachate, by country, ' + y;
  svg.attr('aria-label', title);
  svg.select('.lf-eu-svgtitle').text(title).attr('x', he ? W : 0).attr('direction', he ? 'rtl' : 'ltr').attr('text-anchor', 'start');
  svg.select('.lf-eu-empty').text(rows.length ? '' : (he ? 'אף מטמנה לא דיווחה על ' + info.he + ' מעל הסף ב-' + y + '.' : 'No landfill reported ' + info.en.toLowerCase() + ' above the threshold in ' + y + '.'))
    .attr('direction', he ? 'rtl' : 'ltr');
  const unit = info.t ? (he ? 'טון' : 't') : (he ? 'ק"ג' : 'kg');
  const val = (r) => {
    const n = r[5] + r[6], v = E.fmt(r[3] + r[4], info.t) + ' ' + unit;
    if (narrow) return v;
    return v + ' · ' + (he ? (n === 1 ? 'דיווח אחד' : n + ' דיווחים') : (n === 1 ? '1 report' : n + ' reports'));
  };
  const pos = (r, i) => 'translate(0,' + (head + i * rowH) + ')';
  const g = svg.select('.lf-eu-rows').selectAll('g.lf-eu-r').data(rows, (r) => r[1]).join(
    (enter) => {
      const e = enter.append('g').attr('class', 'lf-eu-r').attr('transform', pos).attr('opacity', anim ? 0 : 1);
      e.append('text').attr('class', 'lf-eu-nm').attr('x', nameW - 8).attr('y', 16).attr('text-anchor', 'end');
      e.append('rect').attr('class', 'lf-eu-rt').attr('x', nameW).attr('y', 4).attr('height', 16).attr('fill', '#2a78b5').attr('width', 0);
      e.append('rect').attr('class', 'lf-eu-rw').attr('x', nameW).attr('y', 4).attr('height', 16).attr('fill', 'var(--color-bad)').attr('width', 0);
      e.append('text').attr('class', 'lf-eu-v').attr('x', nameW + 6).attr('y', 16);
      return e;
    },
    (update) => update,
    (exit) => tr(exit).attr('opacity', 0).remove()
  );
  g.select('.lf-eu-nm').text((r) => E.name(r[1], lang));
  g.select('.lf-eu-v').text(val).attr('direction', he ? 'rtl' : 'ltr').attr('text-anchor', he ? 'end' : 'start');
  tr(g).attr('transform', pos).attr('opacity', 1);
  tr(g.select('.lf-eu-rt')).attr('width', (r) => x(r[4]));
  tr(g.select('.lf-eu-rw')).attr('x', (r) => nameW + x(r[4])).attr('width', (r) => Math.max(r[3] + r[4] > 0 && x(r[3] + r[4]) < 2 ? 2 : 0, x(r[3])));
  tr(g.select('.lf-eu-v')).attr('x', (r) => nameW + Math.max(2, x(r[3] + r[4])) + 6);
});
document.querySelectorAll('#eu-leach-p').forEach((s) => s.addEventListener('change', () => { LF.st.euLeachP = lfVal(s); dash.draw('eu-leach-time'); dash.draw('eu-leach-country'); }));
// Play through the years and save the animation as a GIF (the page's own player and GIF maker).
LF.st.euLeachY = LF.st.euLeachY || 2024;
if (LF.player) LF.player('eu-leach', 2007, 2024, 'euLeachY', ['eu-leach-time', 'eu-leach-country', 'eu-leach-year-label'], 900);
if (LF.GIF) LF.GIF.euleach = {
  chart: '#eu-leach-country', key: 'euLeachY', min: 2007, max: 2024, draws: ['eu-leach-country'], labels: ['eu-leach-time', 'eu-leach-year-label'], range: '#eu-leach-year',
  title: () => { const i = LF.euLeach.P[LF.st.euLeachP || 'n']; return window.LF_LANG === 'he' ? 'מטמנות באירופה: ' + i.he + ' בתשטיפים, לפי מדינה' : 'European landfills: ' + i.en.toLowerCase() + ' in leachate, by country'; }
};
let euW = 0;
window.addEventListener('resize', () => { const e = document.getElementById('eu-leach-country'); if (e && Math.abs(e.clientWidth - euW) > 20) { euW = e.clientWidth; dash.draw('eu-leach-country'); } });

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
['leach-comp', 'leach-calc', 'eu-leach-time', 'eu-leach-country', 'eu-leach-year-label'].forEach((n) => dash.draw(n));

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
