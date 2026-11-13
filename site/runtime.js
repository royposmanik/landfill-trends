// A small stand-in for the claude.ai dashboard runtime, so the same page runs as a plain website.
// It provides dash.calc, dash.draw, dash.data and dash.colors, loads the CSV files in data/,
// and redraws every [data-draw] element when data arrives, when asked, and when the window resizes.
window.dash = (function () {
  const SOURCES = {
    oecd: 'data/oecd_landfill_trends.csv',
    waw: 'data/waw_country_landfill.csv',
    world_trends: 'data/world_landfill_trends.csv',
    il_methane: 'data/il_landfill_methane.csv',
    il_capacity: 'data/il_landfill_capacity.csv'
  };
  const status = {}, rows = {}, calcs = {}, draws = {}, mounted = new Map();
  let cache = {}, started = false;
  for (const k of Object.keys(SOURCES)) { status[k] = 'loading'; rows[k] = []; }

  function data(id) {
    if (SOURCES[id]) return { status: status[id], data: rows[id] };
    const c = calcs[id];
    if (!c) return { status: 'missing', data: [] };
    const ins = c.inputs.map((i) => data(i));
    const bad = ins.find((x) => x.status !== 'ok');
    if (bad) return { status: bad.status, data: [] };
    if (!(id in cache)) {
      try { cache[id] = c.fn(...ins.map((x) => x.data)); } catch (e) { console.error('calc ' + id, e); cache[id] = []; }
    }
    return { status: 'ok', data: cache[id] };
  }

  function paintSwatches() {
    document.querySelectorAll('[data-color]').forEach((s) => {
      const c = s.dataset.color;
      s.style.background = c === 'critical' ? 'var(--cds-chart-status-critical)' : api.colors[+c % api.colors.length];
    });
  }

  function render(name) {
    if (!started) return;
    document.querySelectorAll('[data-draw]').forEach((el) => {
      const n = el.dataset.draw;
      if (name && n !== name) return;
      const f = draws[n];
      if (!f) return;
      try {
        if (typeof f === 'function') f(el);
        else {
          if (!mounted.has(el)) mounted.set(el, f.mount ? f.mount(el) : {});
          if (f.update) f.update(el, mounted.get(el));
        }
      } catch (e) { console.error('draw ' + n, e); }
    });
    if (!name) paintSwatches();
  }

  const api = {
    colors: ['#2a78b5', '#d9822b', '#3f9c6d', '#b5452f', '#7d5ba6', '#2a9d9b', '#c2577a', '#8a7f3f'],
    calc(name, o) { calcs[name] = o; cache = {}; },
    draw(name, f) { if (f !== undefined) { draws[name] = f; return; } render(name); },
    data,
    start() {
      started = true;
      render();
      for (const [k, url] of Object.entries(SOURCES)) {
        fetch(url).then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); })
          .then((t) => { rows[k] = d3.csvParse(t); status[k] = 'ok'; })
          .catch((e) => { console.error('load ' + k, e); status[k] = 'error'; })
          .finally(() => { cache = {}; render(); });
      }
      let t = null, lastW = window.innerWidth;
      window.addEventListener('resize', () => {
        if (window.innerWidth === lastW) return;
        lastW = window.innerWidth;
        clearTimeout(t); t = setTimeout(() => render(), 200);
      });
    }
  };
  return api;
})();
