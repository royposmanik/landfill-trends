const fs = require('fs');
const f = process.argv[2] + '/index.html';
let h = fs.readFileSync(f, 'utf8');
const must = (c, m) => { if (!c) { console.error('FAILED: ' + m); process.exit(1); } };
let n = 0;
h = h.replace(/<button type="button" class="lf-btn" data-gif-btn="(\w+)"[^>]*>[\s\S]*?<\/button>/g, (m, id) => { n++; return '<div class="lf-gif-ctl" data-draw="gif-ctl" data-gif="' + id + '"></div>'; });
must(n === 6, 'buttons ' + n);
const before = h.length;
h = h.replace(/\s*<div class="lf-gif" data-draw="gif-panel" data-gif="\w+" hidden><\/div>/g, '');
must(h.length < before, 'panels');
const lis = "document.querySelectorAll('[data-gif-btn]').forEach((b) => b.addEventListener('click', () => make(b.dataset.gifBtn)));";
must(h.includes(lis), 'listener');
h = h.replace(lis, 'LF.makeGif = make;');
h = h.split("dash.draw('gif-panel')").join("dash.draw('gif-ctl')");
const a = h.indexOf("lfReg('gif-panel'"), b = h.indexOf('\n(function () {\n  const roots', a);
must(a > 0 && b > a, 'gif-panel drawing');
h = h.slice(0, a) + `// GIF button plus its status and preview, drawn together so the control always shows something.
lfReg('gif-ctl', (el) => {
  const id = el.dataset.gif, st = LF.st.gifs[id], he = window.LF_LANG === 'he';
  const b = document.createElement('button'); b.type = 'button'; b.className = 'lf-btn'; b.textContent = '⤓ GIF';
  b.title = he ? 'הורדת האנימציה כ-GIF' : 'Download this animation as a GIF';
  b.disabled = !!(st && st.status === 'working');
  b.addEventListener('click', () => LF.makeGif(id));
  const kids = [b];
  if (st) {
    const box = document.createElement('div'); box.className = 'lf-gif';
    const p = document.createElement('p'); p.className = 'lf-note'; p.textContent = st.msg || '';
    box.appendChild(p);
    if (st.status === 'ready' && st.url) {
      const img = document.createElement('img'); img.src = st.url; img.alt = he ? 'אנימציית GIF של הגרף' : 'Animated GIF of this chart'; img.className = 'lf-gif-img';
      const a = document.createElement('a'); a.href = st.url; a.download = st.filename; a.textContent = 'Download ' + st.filename; a.className = 'lf-note';
      box.append(img, a);
    }
    if (st.status !== 'working') {
      const x = document.createElement('button'); x.type = 'button'; x.className = 'lf-btn'; x.textContent = 'Close';
      x.addEventListener('click', () => { delete LF.st.gifs[id]; dash.draw('gif-ctl'); });
      box.appendChild(x);
    }
    kids.push(box);
  }
  el.replaceChildren(...kids);
});
` + h.slice(b);
h = h.replace('</style>', '.lf-gif-ctl { display: contents; }\n.lf-gif { flex-basis: 100%; }\n.lf.lf-he .lf-gif { direction: rtl; }\n</style>');
must(!h.includes('gif-panel'), 'leftover gif-panel');
fs.writeFileSync(f, h);
console.log('ok');
