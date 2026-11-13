// Builds a world year-by-year landfill series: OECD data (already built) plus UNSD/UNEP waste questionnaire country files.
const fs = require('fs'), path = require('path');
const X = require('../tools/node_modules/xlsx');
const base = path.join(__dirname, '..');
const dl = base + '/dl', out = base + '/out';
const parse = (l) => { const r = []; let c = '', q = false; for (const ch of l) { if (q) { if (ch === '"') q = false; else c += ch; } else if (ch === '"') q = true; else if (ch === ',') { r.push(c); c = ''; } else c += ch; } r.push(c); return r; };
const readCsv = (f) => { const t = fs.readFileSync(f, 'utf8').replace(/^﻿/, '').split(/\r?\n/).filter(Boolean); const h = parse(t[0]); return t.slice(1).map((l) => { const a = parse(l); const o = {}; h.forEach((k, i) => { o[k] = a[i]; }); return o; }); };

// Lookups: OWID names/codes, GDP, population; World Bank regions.
const gdp = {}, pop = {}, nameToCode = {};
for (const r of readCsv(dl + '/owid_gdp.csv')) { if (r.code && !r.code.startsWith('OWID')) { gdp[r.code + '|' + r.year] = +r.ny_gdp_pcap_pp_kd; nameToCode[r.entity.toLowerCase()] = r.code; } }
for (const r of readCsv(dl + '/owid_pop.csv')) { if (r.code && +r.year >= 1995) { pop[r.code + '|' + r.year] = +r.population_historical; nameToCode[r.entity.toLowerCase()] = nameToCode[r.entity.toLowerCase()] || r.code; } }
const regName = { EAS: 'East Asia & Pacific', ECS: 'Europe & Central Asia', LCN: 'Latin America & Caribbean', MEA: 'Middle East & North Africa', NAC: 'North America', SAS: 'South Asia', SSF: 'Sub-Saharan Africa' };
const region = {}, wbName = {};
for (const r of readCsv(dl + '/waw_country.csv')) { region[r.iso3c] = regName[r.region_id] || r.region_id; wbName[r.iso3c] = r.country_name; nameToCode[r.country_name.toLowerCase()] = nameToCode[r.country_name.toLowerCase()] || r.iso3c; }
const alias = {
  'venezuela (bolivarian republic of)': 'VEN', 'bolivia (plurinational state of)': 'BOL', 'iran (islamic republic of)': 'IRN', 'republic of moldova': 'MDA',
  'state of palestine': 'PSE', 'united republic of tanzania': 'TZA', "lao people's democratic republic": 'LAO', 'syrian arab republic': 'SYR', 'viet nam': 'VNM',
  'türkiye': 'TUR', 'turkiye': 'TUR', 'republic of korea': 'KOR', "cote d'ivoire": 'CIV', "côte d'ivoire": 'CIV', 'china, hong kong sar': 'HKG', 'china, macao sar': 'MAC',
  'hong kong sar': 'HKG', 'macao sar': 'MAC', 'russian federation': 'RUS', 'north macedonia': 'MKD', 'the former yugoslav republic of macedonia': 'MKD',
  'micronesia (federated states of)': 'FSM', 'democratic republic of the congo': 'COD', 'congo': 'COG', 'cabo verde': 'CPV', 'eswatini': 'SWZ', 'swaziland': 'SWZ',
  'gambia': 'GMB', 'bahamas': 'BHS', 'curacao': 'CUW', 'curaçao': 'CUW', 'saint kitts and nevis': 'KNA', 'saint lucia': 'LCA', 'saint vincent and the grenadines': 'VCT',
  'brunei darussalam': 'BRN', 'kyrgyzstan': 'KGZ', 'sint maarten (dutch part)': 'SXM', 'anguilla': 'AIA', 'montserrat': 'MSR', 'british virgin islands': 'VGB', 'aruba': 'ABW',
  'bermuda': 'BMU', 'cayman islands': 'CYM', 'turks and caicos islands': 'TCA', 'niue': 'NIU', 'cook islands': 'COK', 'tokelau': 'TKL', 'timor-leste': 'TLS', 'dem. rep  congo': 'COD', 'dem. rep congo': 'COD', 'turks&caicos': 'TCA', 'china macao sar': 'MAC', 'china hong kong sar': 'HKG', 'uruguay': 'URY', 'zambia': 'ZMB', 'dem. rep  congo': 'COD', 'dem. rep congo': 'COD', 'turks&caicos': 'TCA', 'china macao sar': 'MAC', 'china hong kong sar': 'HKG', 'uruguay': 'URY', 'zambia': 'ZMB'
};
const codeOf = (nm) => { const k = nm.toLowerCase().trim(); return alias[k] || nameToCode[k] || null; };

// Variable codes in the UNSD waste questionnaire (table R3, municipal waste).
const V = { gen: 1800, coll: 1814, managed: 1834, recycling: 2837, composting: 2838, incineration: 2577, landfill: 1926 };
const num = (v) => (typeof v === 'number' && isFinite(v)) ? v : (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v.trim()) ? +v : null);

function parseFile(f) {
  const wb = X.readFile(f);
  for (const sn of wb.SheetNames) {
    const a = X.utils.sheet_to_json(wb.Sheets[sn], { header: 1, defval: '', raw: true });
    // Find the code row for landfilling; the sheet holding it is table R3.
    let hasLand = false;
    for (const r of a) if (r.some((c) => num(c) === V.landfill)) { hasLand = true; break; }
    if (!hasLand) continue;
    // Header row: the first with at least 5 cells that are years.
    let yc = null;
    for (const r of a) {
      const m = new Map();
      r.forEach((c, i) => { const v = num(c); if (v && v >= 1990 && v <= 2030 && Number.isInteger(v) && !m.has(v)) m.set(v, i); });
      if (m.size >= 5) { yc = m; break; }
    }
    if (!yc) continue;
    const firstYearCol = Math.min(...yc.values());
    const lastYearCol = Math.max(...yc.values());
    const vals = {};
    for (const [k, code] of Object.entries(V)) {
      // The code cell sits left of the first year column.
      const row = a.find((r) => r.slice(0, firstYearCol).some((c) => num(c) === code));
      if (!row) continue;
      vals[k] = {};
      for (const [y, i] of yc) { if (i > lastYearCol) continue; const v = num(row[i]); if (v != null && v >= 0) vals[k][y] = v; }
    }
    return vals;
  }
  return null;
}

const files = fs.readdirSync(dl + '/un/files');
const unRows = []; const miss = [];
for (const fn of files) {
  const m = fn.replace(/\.xls$/, '').replace(/^\d{4}FINAL_/, '').replace(/_Waste\d*(_Final)?$/i, '').replace(/_Waste\d*_?Final$/i, '').replace(/_/g, ' ');
  const nm = decodeURIComponent(m).replace(/ Waste\d*.*$/i, '').replace(/^(FINAL|Final)\d{4}\s*/, '').replace(/^\d{4}(FINAL|Final)\s*/, '')
    .replace(/^waste es /i, '').replace(/^Waste /, '').replace(/ Provisional.*$/, '').trim();
  const code = codeOf(nm);
  if (!code) { miss.push(nm); continue; }
  let vals; try { vals = parseFile(dl + '/un/files/' + fn); } catch (e) { miss.push(nm + ' (unreadable)'); continue; }
  if (!vals || !vals.landfill) { miss.push(nm + ' (no landfill row)'); continue; }
  for (const y of Object.keys(vals.landfill)) {
    const lf = vals.landfill[y];
    const tot = (vals.managed && vals.managed[y]) || (vals.coll && vals.coll[y]) || (vals.gen && vals.gen[y]) || null;
    const p = pop[code + '|' + y];
    if (!p || !tot || tot <= 0) continue;
    const pct = lf / tot * 100;
    if (pct > 101) continue; // inconsistent figures
    const kg = lf * 1e6 / p;
    const genKg = tot * 1e6 / p;
    if (kg > 1000 || genKg > 2000) continue; // unit errors
    unRows.push({ iso3: code, country: wbName[code] || nm, year: +y, landfill_pct: Math.min(100, pct), landfill_kg_per_capita: kg, msw_kg_per_capita: genKg, source: 'UNSD' });
  }
}

// OECD rows take precedence where both exist.
const oecd = readCsv(out + '/oecd_all_trends.csv').filter((r) => r.type === 'country' && r.landfill_kg_per_capita !== '');
const have = new Set(oecd.map((r) => r.iso3 + '|' + r.year));
const rows = oecd.map((r) => ({ iso3: r.iso3, country: r.country, year: +r.year, landfill_pct: +r.landfill_pct, landfill_kg_per_capita: +r.landfill_kg_per_capita, msw_kg_per_capita: +r.msw_kg_per_capita, source: 'OECD' }));
for (const r of unRows) if (!have.has(r.iso3 + '|' + r.year)) rows.push(r);
const r1 = (v, d) => v == null || !isFinite(v) ? '' : String(Math.round(v * Math.pow(10, d)) / Math.pow(10, d));
const outRows = rows.filter((r) => r.year >= 2000 && r.year <= 2024).map((r) => {
  const g = gdp[r.iso3 + '|' + r.year];
  return [r.iso3, r.country, region[r.iso3] || '', r.year, r1(r.landfill_pct, 1), r1(r.landfill_kg_per_capita, 0), r1(r.msw_kg_per_capita, 0), g ? r1(g, 0) : '', r.source];
}).sort((a, b) => a[0].localeCompare(b[0]) || a[3] - b[3]);
const esc = (v) => /[",]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : v;
fs.writeFileSync(out + '/world_landfill_trends.csv', 'iso3,country,region,year,landfill_pct,landfill_kg_per_capita,msw_kg_per_capita,gdp_pc_ppp,source\n' + outRows.map((r) => r.map(esc).join(',')).join('\n') + '\n');
const cs = new Set(outRows.map((r) => r[0])), un = new Set(outRows.filter((r) => r[8] === 'UNSD').map((r) => r[0]));
console.log('rows', outRows.length, 'countries', cs.size, 'from UNSD', un.size, 'no region', [...cs].filter((c) => !region[c]).join(' '));
console.log('unmatched/skipped:', miss.join(' | '));
const perYear = {}; for (const r of outRows) if (r[7] !== '') perYear[r[3]] = (perYear[r[3]] || 0) + 1;
console.log('countries with GDP per year', JSON.stringify(perYear));
