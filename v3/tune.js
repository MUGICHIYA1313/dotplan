// DOTPLAN デザイン調整モード
// 色・角丸・透け・影・数字の大きさを、画面を見ながらスライダーで調整できる。
// 設定は localStorage（dotplan:tune:v1）に保存され、起動時に自動で反映される。
(function () {
  const KEY = 'dotplan:tune:v1';
  const DEF = {
    bg: '#F3F4F1', ink: '#151515', blue: '#1F6FD6', yel: '#FFD21F',
    blueGlow: 30, yelGlow: 42, r: 22, glass: 78, blur: 14, shadow: 35,
    big: 64, weight: 800, dock: '#151515', active: '#FFD21F'
  };
  const FIELDS = [
    { g: '色' },
    { k: 'bg', t: 'color', l: '背景' },
    { k: 'ink', t: 'color', l: '文字' },
    { k: 'blue', t: 'color', l: '青（シルク刷り）' },
    { k: 'yel', t: 'color', l: '黄（シルク刷り）' },
    { k: 'dock', t: 'color', l: 'タブバーの色' },
    { k: 'active', t: 'color', l: '選択中のタブ' },
    { g: '光のにじみ' },
    { k: 'blueGlow', t: 'range', l: '青の光', min: 0, max: 80, u: '%' },
    { k: 'yelGlow', t: 'range', l: '黄の光', min: 0, max: 80, u: '%' },
    { g: 'カード' },
    { k: 'r', t: 'range', l: '角の丸み', min: 0, max: 36, u: 'px' },
    { k: 'glass', t: 'range', l: '不透明度', min: 30, max: 100, u: '%' },
    { k: 'blur', t: 'range', l: 'すりガラスのぼかし', min: 0, max: 30, u: 'px' },
    { k: 'shadow', t: 'range', l: '影の濃さ', min: 0, max: 80, u: '%' },
    { g: '大きな数字' },
    { k: 'big', t: 'range', l: 'サイズ', min: 40, max: 96, u: 'px' },
    { k: 'weight', t: 'range', l: '太さ', min: 300, max: 900, step: 100, u: '' }
  ];

  const load = () => { try { return Object.assign({}, DEF, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { return Object.assign({}, DEF); } };
  const save = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} };
  let saved = load();
  let cur = Object.assign({}, saved);

  const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(','); };

  function css(v) {
    const b = rgb(v.blue), y = rgb(v.yel), k = rgb(v.ink);
    return `:root{--bg:${v.bg};--ink:${v.ink};--line:${v.ink};--blue:${v.blue};--red:${v.blue};--redt:${v.blue};
  --blue-t:rgba(${b},.78);--blue-w:rgba(${b},.16);--yel:${v.yel};--yel-t:rgba(${y},.88);--yel-w:rgba(${y},.42);
  --glass:rgba(255,255,255,${v.glass / 100});--r:${v.r}px;
  --sh:0 1px 0 rgba(255,255,255,.9) inset,0 10px 28px -18px rgba(${k},${v.shadow / 100})}
html,body{background:${v.bg}}
#app::before{background:radial-gradient(circle at 50% 50%,rgba(${b},${v.blueGlow / 100}),rgba(${b},0) 68%)}
#app::after{background:radial-gradient(circle at 50% 50%,rgba(${y},${v.yelGlow / 100}),rgba(${y},0) 68%)}
.card,.cal,.fcard{-webkit-backdrop-filter:blur(${v.blur}px);backdrop-filter:blur(${v.blur}px)}
.card.print{box-shadow:0 0 0 1.5px rgba(${b},.78),0 18px 34px -18px rgba(${b},.65)}
.mini.blue{box-shadow:0 8px 18px -10px rgba(${b},.9)}
.big{font-size:${v.big}px;font-weight:${v.weight}}
.tabbar{background:rgba(${rgb(v.dock)},.86)}
.tab[aria-current="page"]{background:${v.active};color:${v.ink}}`;
  }

  let styleEl;
  function apply(v) {
    if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = 'dpTune'; document.head.appendChild(styleEl); }
    styleEl.textContent = css(v);
    const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = v.bg;
  }

  // 保存済みの設定を起動時に反映（既定値のままなら何もしない）
  if (JSON.stringify(saved) !== JSON.stringify(DEF)) apply(saved);

  const PCSS = `#dpTunePanel{position:fixed;left:50%;transform:translateX(-50%);bottom:0;width:min(560px,100%);max-height:48vh;z-index:9999;
  background:rgba(250,250,248,.94);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);border-radius:22px 22px 0 0;
  box-shadow:0 -12px 40px -16px rgba(0,0,0,.45);display:flex;flex-direction:column;font-family:-apple-system,BlinkMacSystemFont,'Hiragino Sans',sans-serif;color:#151515}
#dpTunePanel .h{display:flex;align-items:center;gap:8px;padding:12px 16px 10px;border-bottom:1px solid rgba(0,0,0,.08)}
#dpTunePanel .h b{flex:1;font-size:15px}
#dpTunePanel .bd{overflow:auto;padding:4px 16px calc(env(safe-area-inset-bottom,0px) + 14px)}
#dpTunePanel .g{font-size:11px;font-weight:700;letter-spacing:.12em;color:#8E8E88;margin:14px 0 4px}
#dpTunePanel label{display:grid;grid-template-columns:1fr auto;align-items:center;gap:4px 10px;padding:7px 0;font-size:14px}
#dpTunePanel label span.v{font-variant-numeric:tabular-nums;color:#666660;font-size:13px}
#dpTunePanel input[type=range]{grid-column:1/-1;width:100%;accent-color:#1F6FD6}
#dpTunePanel input[type=color]{width:44px;height:30px;border:1px solid rgba(0,0,0,.15);border-radius:8px;padding:0;background:none}
#dpTunePanel button{font:inherit;font-size:13px;font-weight:600;border:0;border-radius:999px;padding:8px 13px;background:#E8E8E3;color:#151515;cursor:pointer}
#dpTunePanel button.pri{background:#151515;color:#fff}
#dpTunePanel .ft{display:flex;flex-wrap:wrap;gap:8px;padding:10px 16px;border-top:1px solid rgba(0,0,0,.08)}
#dpTunePanel .msg{font-size:12px;color:#666660;align-self:center}`;

  let panel;
  function open() {
    if (panel) return;
    if (!document.getElementById('dpTuneCss')) { const s = document.createElement('style'); s.id = 'dpTuneCss'; s.textContent = PCSS; document.head.appendChild(s); }
    panel = document.createElement('div');
    panel.id = 'dpTunePanel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'デザイン調整');
    panel.innerHTML = `<div class="h"><b>デザイン調整</b>
      <button data-t="compare" title="押している間、保存済みのデザインを表示">比べる</button>
      <button data-t="close">閉じる</button></div>
      <div class="bd">${FIELDS.map((f) => f.g ? `<div class="g">${f.g}</div>`
        : f.t === 'color'
          ? `<label>${f.l}<input type="color" data-k="${f.k}" value="${cur[f.k]}"></label>`
          : `<label>${f.l}<span class="v" data-v="${f.k}">${cur[f.k]}${f.u}</span><input type="range" data-k="${f.k}" min="${f.min}" max="${f.max}" step="${f.step || 1}" value="${cur[f.k]}"></label>`).join('')}</div>
      <div class="ft"><button class="pri" data-t="save">保存</button><button data-t="revert">保存した状態に戻す</button>
        <button data-t="reset">最初の設定に戻す</button><button data-t="copy">設定をコピー</button><span class="msg"></span></div>`;
    document.body.appendChild(panel);

    const msg = (t) => { const m = panel.querySelector('.msg'); m.textContent = t; clearTimeout(msg.t); msg.t = setTimeout(() => { m.textContent = ''; }, 2200); };
    const sync = () => {
      panel.querySelectorAll('[data-k]').forEach((el) => { el.value = cur[el.dataset.k]; });
      FIELDS.forEach((f) => { const s = panel.querySelector(`[data-v="${f.k}"]`); if (s) s.textContent = cur[f.k] + f.u; });
      apply(cur);
    };
    panel.addEventListener('input', (e) => {
      const k = e.target.dataset.k; if (!k) return;
      cur[k] = e.target.type === 'range' ? Number(e.target.value) : e.target.value;
      const f = FIELDS.find((x) => x.k === k); const s = panel.querySelector(`[data-v="${k}"]`);
      if (s) s.textContent = cur[k] + f.u;
      apply(cur);
    });
    panel.addEventListener('click', (e) => {
      const t = e.target.closest('[data-t]'); if (!t) return;
      const a = t.dataset.t;
      if (a === 'close') { apply(saved); close(); }
      else if (a === 'save') { saved = Object.assign({}, cur); save(saved); msg('保存しました'); }
      else if (a === 'revert') { cur = Object.assign({}, saved); sync(); msg('保存した状態に戻しました'); }
      else if (a === 'reset') { cur = Object.assign({}, DEF); sync(); msg('最初の設定にしました（保存で確定）'); }
      else if (a === 'copy') {
        const txt = 'DOTPLAN デザイン設定\n' + JSON.stringify(cur, null, 2);
        (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => msg('コピーしました。Claudeに送ってね'), () => { prompt('この設定をコピーしてください', txt); });
      }
    });
    const cmp = panel.querySelector('[data-t="compare"]');
    const on = (e) => { e.preventDefault(); apply(saved); cmp.textContent = '保存済み'; };
    const off = () => { apply(cur); cmp.textContent = '比べる'; };
    cmp.addEventListener('pointerdown', on); cmp.addEventListener('pointerup', off); cmp.addEventListener('pointerleave', off); cmp.addEventListener('pointercancel', off);
  }
  function close() { if (panel) { panel.remove(); panel = null; } cur = Object.assign({}, saved); }

  window.DPTune = { open, close };
  if (/[?&#]tune\b/.test(location.search + location.hash)) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', open); else open();
  }
})();
