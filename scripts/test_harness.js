// Builds a local test page that stubs the dashboard runtime (dash.*) so the page can be viewed in a browser.
const fs = require('fs');
const [src, outDir] = process.argv.slice(2);
const page = fs.readFileSync(src + '/index.html', 'utf8');
for (const f of ['world.js', 'il.js', 'gifenc.js']) fs.copyFileSync(src + '/' + f, outDir + '/' + f);
const csv = {
  oecd: 'oecd_landfill_trends.csv', waw: 'waw_country_landfill.csv',
  il_methane: 'il_landfill_methane.csv', il_capacity: 'il_landfill_capacity.csv', world_trends: 'world_landfill_trends.csv'
};
const data = {};
for (const [k, f] of Object.entries(csv)) data[k] = fs.readFileSync(src + '/' + f, 'utf8');
const stub = `
<style>
:root{--color-bg:#faf9f5;--color-fg:#1f1e1d;--color-fg-muted:#6b6a66;--color-panel:#fff;--color-border-line:#e3e1d9;--color-ok:#2f7d4f;--color-bad:#b5452f;
--cds-gap-xs:4px;--cds-gap-sm:8px;--cds-gap-md:12px;--cds-gap-xl:28px;--cds-pad-lg:16px;--cds-radius:8px;--cds-font-size-caption:12px;--cds-font-size-body:15px;--cds-font-size-heading:19px;--cds-font-size-title:30px;--cds-font-weight-medium:550;
--cds-chart-muted:#b9b6ab;--cds-chart-grid:#ecebe6;--cds-chart-axis:#9b9890;--cds-text-secondary:#6b6a66;--cds-surface-popover:#fff;--cds-border:#ddd;--cds-shadow-popover:0 2px 8px rgba(0,0,0,.12);--cds-chart-status-critical:#c0392b;
--font-anthropic-serif:Georgia,serif;--font-anthropic-sans:system-ui,sans-serif}
body{background:var(--color-bg);color:var(--color-fg);font-family:var(--font-anthropic-sans);margin:0;padding:24px 16px;max-width:1100px;margin:auto}
.dash-select{font:inherit}
</style>
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
<script>
(function(){
  const RAW = ${JSON.stringify(data)};
  const parsed = {}; for (const k in RAW) parsed[k] = d3.csvParse(RAW[k]);
  const calcs = {}, draws = {}, mounted = new Map(), cache = {};
  window.dash = {
    colors: ['#3b6fb6','#d9822b','#5a9e6f','#b5452f','#7d5ba6','#2a9d9b','#c2577a','#8a7f3f'],
    calc(n, o) { calcs[n] = o; },
    draw(n, f) { if (typeof f !== 'undefined') { draws[n] = f; return; } render(n); },
    data(id) {
      if (parsed[id]) return { status: 'ok', data: parsed[id] };
      if (calcs[id]) { if (!cache[id]) cache[id] = calcs[id].fn(...calcs[id].inputs.map((i) => dash.data(i).data)); return { status: 'ok', data: cache[id] }; }
      return { status: 'missing', data: [] };
    }
  };
  function render(name) {
    document.querySelectorAll('[data-draw]').forEach((el) => {
      const n = el.dataset.draw; if (name && n !== name) return;
      const f = draws[n]; if (!f) return;
      try {
        if (typeof f === 'function') f(el);
        else { if (!mounted.has(el)) mounted.set(el, f.mount(el)); f.update(el, mounted.get(el)); }
      } catch (e) { console.error('draw ' + n, e); el.textContent = 'ERROR ' + n + ': ' + e.message; el.style.color = 'red'; }
    });
    document.querySelectorAll('[data-color]').forEach((s) => { const c = s.dataset.color; s.style.background = c === 'critical' ? '#c0392b' : dash.colors[+c]; });
  }
  window.addEventListener('load', () => { render(); window.__ok = true; });
})();
</script>`;
const kv = `<script>dash.draw('kv', (el) => { const d = dash.data(el.dataset.source); const r = d.data[+el.dataset.row||0]; if (!r) return; const v = r[el.dataset.field]; el.textContent = el.dataset.fmt === 'text' ? v : (LF.FMT[el.dataset.fmt] || LF.FMT.int)(v); });</script>`;
let html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + stub + '</head><body>' + page + '</body></html>';
fs.writeFileSync(outDir + '/index.html', html);
console.log('harness written', html.length);
