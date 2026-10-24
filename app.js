/* Co-Design Bench project page. Renders every interactive view from window.CDB_DATA
   (data/site-data.js). No framework, no network requests. */
(function () {
  'use strict';
  var D = window.CDB_DATA;
  if (!D) { console.error('CDB_DATA missing'); return; }

  var SVGNS = 'http://www.w3.org/2000/svg';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MODELS = D.models;
  var MODEL = {};
  MODELS.forEach(function (m) { MODEL[m.id] = m; });

  // ---------- helpers ----------
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'text') n.textContent = v;
      else if (k === 'class') n.className = v;
      else if (k === 'style') n.setAttribute('style', v);
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function svg(tag, attrs, kids) {
    var n = document.createElementNS(SVGNS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (attrs[k] == null) return;
      if (k === 'text') n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function $(id) { return document.getElementById(id); }
  // Wrap runs of CJK characters so screen readers switch voice (WCAG 3.1.2).
  function langText(str) {
    var f = document.createDocumentFragment(), re = /[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]+/g, last = 0, m;
    str = String(str == null ? '' : str);
    while ((m = re.exec(str))) {
      if (m.index > last) f.appendChild(document.createTextNode(str.slice(last, m.index)));
      var s = document.createElement('span'); s.lang = 'zh-Hans'; s.textContent = m[0]; f.appendChild(s); last = re.lastIndex;
    }
    if (last < str.length) f.appendChild(document.createTextNode(str.slice(last)));
    return f;
  }
  function pauseVideos(n) { if (n) n.querySelectorAll('video').forEach(function (v) { v.pause(); }); }
  function clear(n) { pauseVideos(n); while (n && n.firstChild) n.removeChild(n.firstChild); return n; }
  function videoPlayer(src, poster, label) {
    var v = el('video', { src: src, poster: poster, controls: true, loop: true, playsinline: true, preload: 'metadata', 'aria-label': label }, [el('a', { href: src, text: 'Open video' })]);
    v.muted = true;
    return v;
  }
  function pct(v, d) { return (v * 100).toFixed(d == null ? 1 : d); }
  function fix(v, d) { return v == null ? '–' : Number(v).toFixed(d); }
  function icon(id, size) {
    var m = MODEL[id];
    return el('img', { class: 'model-icon', src: m ? m.icon : '', alt: '', width: size || 26, height: size || 26, loading: 'lazy' });
  }
  function modelLabel(id) { var m = MODEL[id]; return m ? m.name : id; }

  // ---------- tooltip ----------
  var tip = $('tooltip');
  function showTip(evt, lines) {
    clear(tip);
    lines.forEach(function (l, i) { tip.appendChild(el(i === 0 ? 'b' : 'span', { text: l })); if (i > 0 && i < lines.length - 1) tip.appendChild(el('br')); });
    tip.classList.add('show');
    var x = evt.clientX, y = evt.clientY;
    if (x == null || (x === 0 && y === 0)) { var r = evt.target.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top; }
    var w = tip.offsetWidth, h = tip.offsetHeight;
    var left = Math.min(window.innerWidth - w - 10, Math.max(10, x + 14));
    var top = y - h - 12; if (top < 8) top = y + 18;
    tip.style.left = left + 'px'; tip.style.top = top + 'px';
  }
  function hideTip() { tip.classList.remove('show'); }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hideTip(); });
  var live = $('live-status');
  function announce(msg) { if (live) { live.textContent = ''; setTimeout(function () { live.textContent = msg; }, 30); } }
  function bindTip(node, linesFn) {
    node.addEventListener('pointermove', function (e) { showTip(e, linesFn()); });
    node.addEventListener('pointerleave', hideTip);
    node.addEventListener('focus', function (e) { showTip(e, linesFn()); });
    node.addEventListener('blur', hideTip);
  }

  // ---------- featured run ----------
  function bindDemo() {
    var player = $('intro-player'), watch = $('watch-demo'), inspect = $('inspect-demo');
    var playButton;
    if (player) {
      player.controls = false;
      playButton = el('button', { type: 'button', class: 'demo-play', 'aria-label': 'Play agent run highlights', text: '▶', onclick: function () {
        var playing = player.play();
        if (playing && playing.then) playing.then(function () { player.focus({ preventScroll: true }); }).catch(function () { playButton.focus(); });
      } });
      player.parentElement.insertBefore(playButton, player.nextSibling);
    }
    if (watch && player) watch.addEventListener('click', function () {
      var playing = player.play();
      if (playing && playing.catch) playing.catch(function () { player.focus(); });
    });
    if (inspect) inspect.addEventListener('click', function () {
      pauseVideos($('intro-video'));
      var i = D.cases.map(function (c) { return c.id; }).indexOf('7d7953f8');
      if (i >= 0) openCase(i);
    });
    if (player) {
      player.addEventListener('loadedmetadata', function () {
        if (Number.isFinite(player.duration)) $('demo-duration').textContent = Math.round(player.duration) + ' sec';
      });
      player.addEventListener('play', function () {
        player.controls = true;
        playButton.hidden = true;
        document.querySelectorAll('video').forEach(function (v) { if (v !== player) v.pause(); });
      });
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          if (!entries[0].isIntersecting) player.pause();
        });
        io.observe(player);
      }
    }
  }

  function bindAuthorDetails() {
    var details = document.querySelector('.author-affiliations');
    if (!details || !window.matchMedia) return;
    var phone = window.matchMedia('(max-width: 760px)');
    function update() { details.open = !phone.matches; }
    update();
    if (phone.addEventListener) phone.addEventListener('change', update);
  }

  // ---------- figure 1a: saturation ----------
  // Charts render at their container's pixel width so text keeps its real size.
  function hostWidth(host, max) { return Math.max(240, Math.min(max || 640, Math.floor(host.clientWidth || 560))); }
  function renderSaturation() {
    var host = $('saturation-chart'); if (!host || !D.saturation) return;
    clear(host);
    var bars = D.saturation.bars;
    var W = hostWidth(host, 620), compact = W < 460, tiny = W < 330;
    var H = compact ? 300 : 330, L = tiny ? 26 : compact ? 30 : 38, R = tiny ? 64 : compact ? 70 : 92, T = 26;
    var B = 64;
    var pw = W - L - R, ph = H - T - B;
    var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'presentation', class: tiny ? 'compact tiny' : compact ? 'compact' : null });
    var y = function (v) { return T + ph - (v / 100) * ph; };
    [0, 20, 40, 60, 80, 100].forEach(function (t) {
      s.appendChild(svg('line', { x1: L, x2: L + pw, y1: y(t), y2: y(t), class: 'grid' }));
      s.appendChild(svg('text', { x: L - 8, y: y(t) + 4, 'text-anchor': 'end', class: 'axis', text: t }));
    });
    var gapAfter = 2; // a wider gap separates the two benchmarks
    var slot = pw / (bars.length + 0.8);
    var bw = Math.min(56, slot * 0.6);
    bars.forEach(function (b, i) {
      var cx = L + slot * (i + 0.5) + (i > gapAfter ? slot * 0.8 : 0);
      var isOurs = b.group === 'Co-Design Bench';
      var x = cx - bw / 2, top = y(b.value), h = T + ph - top;
      var r = 4;
      var path = 'M' + x + ',' + (T + ph) + 'V' + (top + r) + 'Q' + x + ',' + top + ' ' + (x + r) + ',' + top + 'H' + (x + bw - r) + 'Q' + (x + bw) + ',' + top + ' ' + (x + bw) + ',' + (top + r) + 'V' + (T + ph) + 'Z';
      var bar = svg('path', { d: path, fill: isOurs ? 'var(--accent)' : '#c3cbdd' });
      s.appendChild(bar);
      bindTip(bar, function () { return [b.value.toFixed(1) + '%', b.group + ' · ' + b.regime + ' · ' + b.model, 'n = ' + b.n + ' tasks']; });
      s.appendChild(svg('text', { x: cx, y: top - 8, 'text-anchor': 'middle', class: 'lbl-strong', text: b.value.toFixed(1) }));
      s.appendChild(svg('text', { x: cx, y: T + ph + 18, 'text-anchor': 'middle', class: 'lbl', text: compact && b.regime === 'Single-shot' ? 'Single' : b.regime }));
      s.appendChild(svg('text', { x: cx, y: T + ph + 34, 'text-anchor': 'middle', class: 'axis', text: b.modelShort }));
      if (isOurs) {
        // headroom bracket
        var bx = x + bw + 14, y1 = y(100), y2 = top;
        s.appendChild(svg('path', { d: 'M' + (bx - 5) + ',' + y1 + 'H' + bx + 'V' + y2 + 'H' + (bx - 5), fill: 'none', stroke: 'var(--ink-2)', 'stroke-width': 1.5 }));
        s.appendChild(svg('text', { x: bx + 8, y: (y1 + y2) / 2 - 2, class: 'lbl-strong', text: D.saturation.headroom.toFixed(1) + ' pts' }));
        s.appendChild(svg('text', { x: bx + 8, y: (y1 + y2) / 2 + 15, class: 'axis', text: 'headroom' }));
      }
    });
    // group labels
    var g1 = L + slot * 1.5, g2 = L + slot * 3.5 + slot * 0.8;
    s.appendChild(svg('line', { x1: L + slot * 0.15, x2: L + slot * 2.85, y1: H - 18, y2: H - 18, stroke: 'var(--line)', 'stroke-width': 1 }));
    s.appendChild(svg('text', { x: g1, y: H - 4, 'text-anchor': 'middle', class: 'lbl', text: 'WebCompass-edit' }));
    s.appendChild(svg('line', { x1: g2 - slot * 0.42, x2: g2 + slot * 0.42, y1: H - 18, y2: H - 18, stroke: 'var(--line)', 'stroke-width': 1 }));
    s.appendChild(svg('text', { x: g2, y: H - 4, 'text-anchor': 'middle', class: 'lbl-strong', text: 'Co-Design Bench' }));
    host.appendChild(s);
  }

  // ---------- track modality bar ----------
  var MOD_COLORS = { none: '#a9aeb9', image: '#7090d8', video: '#244bb2', audio: '#4a8d9a', document: '#c9a15d' };
  function renderModalityBar() {
    var bar = $('me-modality-bar'), legend = $('me-modality-legend'); if (!bar || !D.modality) return;
    clear(bar); clear(legend);
    D.modality.order.forEach(function (k) {
      var n = D.modality.counts[k];
      bar.appendChild(el('span', { style: 'flex:' + n + ';background:' + MOD_COLORS[k], title: D.modality.labels[k] + ': ' + n }));
      legend.appendChild(el('li', null, [el('i', { style: 'background:' + MOD_COLORS[k] }), el('b', { text: String(n) }), ' ' + D.modality.labels[k]]));
    });
  }

  // ---------- taxonomy ----------
  var taxMode = 'any';
  function renderTaxonomy() {
    var host = $('taxonomy'); if (!host || !D.taxonomy) return;
    clear(host);
    var dims = [];
    D.taxonomy.forEach(function (r) {
      var d = dims.filter(function (x) { return x.name === r.dimension; })[0];
      if (!d) { d = { name: r.dimension, cats: [] }; dims.push(d); }
      var c = d.cats.filter(function (x) { return x.name === r.category; })[0];
      if (!c) { c = { name: r.category, leaves: [] }; d.cats.push(c); }
      c.leaves.push(r);
    });
    var maxAny = Math.max.apply(null, D.taxonomy.map(function (r) { return taxMode === 'any' ? r.any : r.primary; }));
    dims.forEach(function (d) {
      var prim = 0; d.cats.forEach(function (c) { c.leaves.forEach(function (l) { prim += l.primary; }); });
      var col = el('div', { class: 'tax-col' }, [
        el('div', { class: 'tax-head' }, [el('h4', { text: d.name }), el('span', { text: prim + ' primary tasks' })])
      ]);
      d.cats.forEach(function (c) {
        var cp = 0; c.leaves.forEach(function (l) { cp += l.primary; });
        var cat = el('div', { class: 'tax-cat' }, [el('h5', null, [c.name, el('span', { text: cp + ' primary' })])]);
        c.leaves.forEach(function (l) {
          var v = taxMode === 'any' ? l.any : l.primary;
          var row = el('div', { class: 'tax-leaf' }, [
            el('span', { text: l.capability }),
            el('span', { class: 'leaf-track', 'aria-hidden': 'true' }, [el('span', { style: 'width:' + (maxAny ? v / maxAny * 100 : 0) + '%' })]),
            el('b', { text: String(v) })
          ]);
          bindTip(row, function () { return [l.capability, l.primary + ' tasks as primary label', l.any + ' tasks with any label']; });
          cat.appendChild(row);
        });
        col.appendChild(cat);
      });
      host.appendChild(col);
    });
    $('tax-caption').textContent = taxMode === 'any'
      ? 'Tasks requiring each capability (labels overlap).'
      : 'Tasks whose main delivery objective is each capability (sums to 273).';
  }
  document.querySelectorAll('[data-tax-mode]').forEach(function (b) {
    b.addEventListener('click', function () {
      taxMode = b.getAttribute('data-tax-mode');
      document.querySelectorAll('[data-tax-mode]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      renderTaxonomy();
    });
  });

  // ---------- comparison table ----------
  function mark(v) {
    var map = { yes: ['yes', '✓', 'reported'], no: ['no', '×', 'not reported'], partial: ['partial', '△', 'subset or metric-dependent'] };
    var m = map[v] || map.no;
    return el('span', { class: 'mark ' + m[0], role: 'img', 'aria-label': m[2], text: m[1] });
  }
  function renderCompare() {
    var t = $('compare-table'); if (!t || !D.related) return;
    var head = el('thead', null, [el('tr', null, [
      el('th', { scope: 'col', text: 'Benchmark / subset' }), el('th', { scope: 'col', text: 'Real-user sessions' }), el('th', { scope: 'col', text: 'Input modalities' }),
      el('th', { scope: 'col', text: 'Reference-free acceptance' }), el('th', { scope: 'col', text: 'Agentic evaluation' }), el('th', { scope: 'col', text: 'Adversarial verification' })
    ])]);
    var body = el('tbody');
    var lastGroup = null;
    D.related.forEach(function (r) {
      if (r.group && r.group !== lastGroup && !r.ours) { body.appendChild(el('tr', { class: 'group' }, [el('td', { colspan: 6, text: r.group })])); lastGroup = r.group; }
      body.appendChild(el('tr', { class: r.ours ? 'ours' : null }, [
        el('th', { scope: 'row' }, [r.name, r.cite ? el('small', { text: r.cite }) : null]),
        el('td', null, [mark(r.realUser)]), el('td', null, [el('span', { class: 'modal-chip', text: r.modalities })]),
        el('td', null, [mark(r.refFree)]), el('td', null, [mark(r.agentic)]), el('td', null, [mark(r.adversarial)])
      ]));
    });
    t.appendChild(head); t.appendChild(body);
  }

  // ---------- leaderboard ----------
  var LB = { track: 'overall', view: 'completion', sort: 'strict', dir: -1, query: '' };
  function trackData(track) { return track === 'overall' ? D.overall : D[track]; }
  function rankBy(track) {
    var data = trackData(track);
    var ids = MODELS.map(function (m) { return m.id; }).sort(function (a, b) { return data[b].strict - data[a].strict; });
    var r = {}; ids.forEach(function (id, i) { r[id] = i + 1; }); return r;
  }
  function columns() {
    var c = [];
    if (LB.view === 'completion') {
      c.push({ key: 'strict', label: 'Strict ↓', title: 'Mean strict completion (%)', meter: true, main: true });
      c.push({ key: 'graded', label: 'Graded', title: 'Mean graded completion (%)', meter: true });
      c.push({ key: 'full', label: 'Full pass', title: 'Full-pass rate (%)', fmt: function (v) { return v.toFixed(1) + '%'; } });
      if (LB.track === 'overall') {
        c.push({ key: 'meStrict', label: 'ME strict', title: 'Strict completion on the 100 ME tasks (%)', get: function (id) { return D.me[id].strict; }, pctFmt: true });
        c.push({ key: 'reStrict', label: 'RE strict', title: 'Strict completion on the 173 RE tasks (%)', get: function (id) { return D.re[id].strict; }, pctFmt: true });
      } else {
        c.push({ key: 'otherRank', label: LB.track === 'me' ? 'Rank on RE' : 'Rank on ME', title: 'Rank by strict completion on the other track', get: function (id) { return rankBy(LB.track === 'me' ? 're' : 'me')[id]; }, fmt: function (v) { return String(v); }, asc: true });
      }
    } else {
      c.push({ key: 'strict', label: 'Strict', title: 'Mean strict completion (%)', meter: true, main: true });
      c.push({ key: 'turns', label: 'Turns', title: 'Median solver turns per task', fmt: function (v) { return String(v); } });
      c.push({ key: 'len', label: 'Len.', title: 'Mean output tokens per turn', fmt: function (v) { return String(v); } });
      c.push({ key: 'tokensM', label: 'Tokens', title: 'Total token traffic per task (millions)', fmt: function (v) { return v.toFixed(2) + 'M'; } });
      c.push({ key: 'mix', label: 'Tool mix', title: 'Share of tool calls: execution / inspection / modification / auxiliary', mix: true, nosort: true });
      c.push({ key: 'exec', label: 'Exec %', title: 'Execution (Bash) share of tool calls', fmt: function (v) { return v.toFixed(1); } });
      c.push({ key: 'insp', label: 'Insp. %', title: 'Inspection (Read/Grep/Glob) share of tool calls', fmt: function (v) { return v.toFixed(1); } });
      c.push({ key: 'mod', label: 'Mod. %', title: 'Modification (Edit/Write) share of tool calls', fmt: function (v) { return v.toFixed(1); } });
    }
    return c;
  }
  function valueOf(col, id) {
    if (col.get) return col.get(id);
    return trackData(LB.track)[id][col.key];
  }
  var revealedOnce = false;
  function renderLeaderboard(animate) {
    var head = $('score-head'), body = $('score-body'); if (!head) return;
    var cols = columns();
    if (!cols.some(function (c) { return c.key === LB.sort; })) { LB.sort = 'strict'; LB.dir = -1; }
    var ranks = rankBy(LB.track);
    // head
    clear(head);
    var tr = el('tr', null, [el('th', { scope: 'col' }, [el('span', { class: 'th-static', text: '#' })]), el('th', { scope: 'col' }, [el('span', { class: 'th-static', text: 'Model' })])]);
    cols.forEach(function (c) {
      var th = el('th', { scope: 'col', title: c.title });
      if (c.nosort) th.appendChild(el('span', { class: 'th-static', text: c.label }));
      else {
        var active = LB.sort === c.key;
        if (active) th.setAttribute('aria-sort', LB.dir < 0 ? 'descending' : 'ascending');
        var label = c.label.replace(' ↓', '') + (active ? (LB.dir < 0 ? ' ↓' : ' ↑') : '');
        th.appendChild(el('button', { type: 'button', 'data-key': c.key, text: label, onclick: function () {
          if (LB.sort === c.key) LB.dir = -LB.dir; else { LB.sort = c.key; LB.dir = c.asc ? 1 : -1; }
          renderLeaderboard(false);
          var nb = head.querySelector('button[data-key="' + c.key + '"]'); if (nb) nb.focus();
        } }));
      }
      tr.appendChild(th);
    });
    head.appendChild(tr);
    // rows
    clear(body);
    var sortCol = cols.filter(function (c) { return c.key === LB.sort; })[0];
    var q = LB.query.trim().toLowerCase();
    var ids = MODELS.map(function (m) { return m.id; }).filter(function (id) {
      if (!q) return true; var m = MODEL[id]; return (m.name + ' ' + m.org).toLowerCase().indexOf(q) >= 0;
    });
    ids.sort(function (a, b) { return LB.dir * (valueOf(sortCol, a) - valueOf(sortCol, b)) || ranks[a] - ranks[b]; });
    if (!ids.length) {
      body.appendChild(el('tr', { class: 'empty-row' }, [el('td', { colspan: cols.length + 2, text: 'No model matches “' + LB.query + '”.' })]));
    }
    var data = trackData(LB.track);
    ids.forEach(function (id, i) {
      var m = MODEL[id];
      var row = el('tr', { class: ranks[id] === 1 ? 'top-model' : null }, [
        el('td', { text: String(ranks[id]).padStart(2, '0') }),
        el('td', null, [el('span', { class: 'model-name' }, [icon(id), el('span', null, [m.name, el('small', { text: m.org })])])])
      ]);
      cols.forEach(function (c) {
        var v = valueOf(c, id);
        if (c.meter) {
          var td = el('td', { class: 'score-cell' + (c.main ? ' score-cell--main' : '') }, [
            el('span', { class: 'score-meter' + (animate && !reduceMotion ? ' score-bar-pending' : ''), style: '--value:' + (v * 100).toFixed(1) + '%;--bar-delay:' + (i * 45) + 'ms' }, [
              el('span', { class: 'score-track' }, [el('span', { class: 'score-fill' })]), el('span', { class: 'score-value', text: pct(v) })
            ])
          ]);
          row.appendChild(td);
        } else if (c.mix) {
          var d = data[id];
          var aux = Math.max(0, 100 - d.exec - d.insp - d.mod);
          var bar = el('span', { class: 'mix-bar', role: 'img', 'aria-label': 'Execution ' + d.exec + '%, inspection ' + d.insp + '%, modification ' + d.mod + '%, auxiliary ' + aux.toFixed(1) + '%' }, [
            el('span', { style: 'flex:' + d.exec + ' 1 0;background:var(--exec)' }), el('span', { style: 'flex:' + d.insp + ' 1 0;background:var(--insp)' }),
            el('span', { style: 'flex:' + d.mod + ' 1 0;background:var(--mod)' }), el('span', { style: 'flex:' + aux.toFixed(1) + ' 1 0;background:var(--aux)' })
          ]);
          bindTip(bar, function () { return [m.name, 'Exec ' + d.exec.toFixed(1) + '% · Insp. ' + d.insp.toFixed(1) + '%', 'Mod. ' + d.mod.toFixed(1) + '% · Aux. ' + aux.toFixed(1) + '%']; });
          row.appendChild(el('td', { class: 'mix-cell' }, [bar]));
        } else if (c.pctFmt) {
          row.appendChild(el('td', { text: pct(v) }));
        } else {
          row.appendChild(el('td', { text: c.fmt ? c.fmt(v) : String(v) }));
        }
      });
      body.appendChild(row);
    });
    // reveal animation
    if (animate && !reduceMotion) {
      var pend = body.querySelectorAll('.score-bar-pending');
      var go = function () { pend.forEach(function (p) { p.classList.remove('score-bar-pending'); p.classList.add('score-bar-revealed'); }); };
      if (!revealedOnce && 'IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { revealedOnce = true; go(); io.disconnect(); } }, { threshold: .2 });
        io.observe($('score-table'));
      } else requestAnimationFrame(go);
    }
    // caption + note
    var trackName = LB.track === 'overall' ? 'all 273 tasks (Table 5)' : LB.track === 'me' ? 'the 100 Multimodal Editing tasks (Table 2)' : 'the 173 Repository Editing tasks (Table 2)';
    $('score-caption').textContent = 'Results of ten model endpoints on ' + trackName;
    $('table-note').textContent = (LB.view === 'completion'
      ? 'Scores are percentages (69.9% = 0.699 in the paper). Full pass requires every criterion. Source: ' + trackName + '. Click a heading to sort.'
      : 'Rollout statistics on ' + trackName + ' under the shared Claude Code harness. Tool shares are rounded; grey shows auxiliary calls. Click a heading to sort.');
    $('mix-legend').hidden = LB.view !== 'rollout';
    document.querySelectorAll('[data-view="rollout"]').forEach(function (b) {
      b.title = LB.track === 'overall' ? 'Rollout statistics are reported per track; this switches to ME' : '';
    });
  }
  document.querySelectorAll('[data-track]').forEach(function (b) {
    b.addEventListener('click', function () {
      LB.track = b.getAttribute('data-track');
      if (LB.track === 'overall') LB.view = 'completion';
      document.querySelectorAll('[data-track]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      document.querySelectorAll('[data-view]').forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-view') === LB.view)); });
      renderLeaderboard(false);
    });
  });
  document.querySelectorAll('[data-view]').forEach(function (b) {
    b.addEventListener('click', function () {
      LB.view = b.getAttribute('data-view');
      if (LB.view === 'rollout' && LB.track === 'overall') {
        LB.track = 'me';
        document.querySelectorAll('[data-track]').forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-track') === 'me')); });
        announce('Rollout statistics are per track; showing ME');
      }
      document.querySelectorAll('[data-view]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      renderLeaderboard(false);
    });
  });
  var search = $('model-search');
  if (search) search.addEventListener('input', function () {
    LB.query = search.value; renderLeaderboard(false);
    var n = $('score-body').querySelectorAll('tr:not(.empty-row)').length;
    announce(n ? n + ' of 10 models shown' : 'No model matches ' + LB.query);
  });

  // ---------- slope chart: ME rank -> RE rank ----------
  function renderSlope() {
    var host = $('slope-chart'); if (!host) return;
    clear(host);
    var rm = rankBy('me'), rr = rankBy('re');
    var W = hostWidth(host, 600), compact = W < 460, tiny = W < 330, rowH = 30, T = 30, H = T + rowH * 10 + 6;
    var xL = tiny ? Math.round(W * 0.42) : compact ? Math.round(W * 0.37) : 196, xR = W - xL;
    var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, class: tiny ? 'compact tiny' : compact ? 'compact' : null });
    s.appendChild(svg('text', { x: xL, y: 14, 'text-anchor': 'middle', class: 'axis', text: 'ME rank' }));
    s.appendChild(svg('text', { x: xR, y: 14, 'text-anchor': 'middle', class: 'axis', text: 'RE rank' }));
    var yOf = function (r) { return T + (r - 0.5) * rowH; };
    var HL = D.slopeHighlight || {};
    var order = MODELS.map(function (m) { return m.id; }).sort(function (a, b) { return (HL[a] ? 1 : 0) - (HL[b] ? 1 : 0); });
    order.forEach(function (id) {
      var y1 = yOf(rm[id]), y2 = yOf(rr[id]);
      var color = HL[id] || '#c9c6bf';
      var g = svg('g', {});
      g.appendChild(svg('line', { x1: xL, y1: y1, x2: xR, y2: y2, stroke: color, 'stroke-width': HL[id] ? 2.5 : 2, 'stroke-linecap': 'round' }));
      [[xL, y1], [xR, y2]].forEach(function (p) { g.appendChild(svg('circle', { cx: p[0], cy: p[1], r: 5, fill: color, stroke: 'var(--white)', 'stroke-width': 2 })); });
      var gap = tiny ? 7 : compact ? 9 : 14;
      g.appendChild(svg('text', { x: xL - gap, y: y1 + 4, 'text-anchor': 'end', class: HL[id] ? 'lbl-strong' : 'lbl', text: (compact ? '' : rm[id] + '  ') + modelLabel(id) }));
      g.appendChild(svg('text', { x: xR + gap, y: y2 + 4, 'text-anchor': 'start', class: HL[id] ? 'lbl-strong' : 'lbl', text: (compact ? '' : rr[id] + '  ') + modelLabel(id) }));
      g.appendChild(svg('rect', { x: 0, y: Math.min(y1, y2) - 12, width: W, height: Math.abs(y2 - y1) + 24, class: 'hit' }));
      bindTip(g, function () { return [modelLabel(id), 'ME rank ' + rm[id] + ' · strict ' + pct(D.me[id].strict), 'RE rank ' + rr[id] + ' · strict ' + pct(D.re[id].strict)]; });
      s.appendChild(g);
    });
    host.appendChild(s);
  }

  // ---------- delivery gap chart ----------
  function renderGap() {
    var host = $('gap-chart'); if (!host) return;
    clear(host);
    var ids = MODELS.map(function (m) { return m.id; });
    var W = hostWidth(host, 600), compact = W < 460, tiny = W < 330;
    var L = tiny ? 116 : compact ? 132 : 150, R = tiny ? 22 : compact ? 36 : 46, T = 8, rowH = 29, H = T + rowH * ids.length + 26;
    var pw = W - L - R;
    var x = function (v) { return L + v / 100 * pw; };
    var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, class: tiny ? 'compact tiny' : compact ? 'compact' : null });
    [0, 25, 50, 75, 100].forEach(function (t) {
      s.appendChild(svg('line', { x1: x(t), x2: x(t), y1: T, y2: T + rowH * ids.length, class: 'grid' }));
      s.appendChild(svg('text', { x: x(t), y: H - 6, 'text-anchor': t === 100 ? 'end' : t === 0 ? 'start' : 'middle', class: 'axis', text: t + '%' }));
    });
    ids.forEach(function (id, i) {
      var o = D.overall[id], cy = T + rowH * i + rowH / 2, bh = 14;
      var sv = o.strict * 100, fv = o.full;
      var g = svg('g', {});
      g.appendChild(svg('text', { x: L - 10, y: cy + 4, 'text-anchor': 'end', class: i === 0 ? 'lbl-strong' : 'lbl', text: modelLabel(id) }));
      g.appendChild(svg('path', { d: roundRight(x(0), cy - bh / 2, x(sv) - x(0), bh, 4), fill: 'var(--accent-wash)' }));
      g.appendChild(svg('path', { d: roundRight(x(0), cy - bh / 2, Math.max(2, x(fv) - x(0) - 2), bh, 4), fill: 'var(--accent)' }));
      g.appendChild(svg('text', { x: x(sv) + 6, y: cy + 4, class: 'axis', text: sv.toFixed(1) }));
      g.appendChild(svg('text', { x: x(fv) + 4, y: cy + 4, class: 'lbl-strong', style: 'font-size:12px', text: fv.toFixed(1) }));
      g.appendChild(svg('rect', { x: 0, y: cy - rowH / 2, width: W, height: rowH, class: 'hit' }));
      bindTip(g, function () { return [modelLabel(id), 'Strict ' + sv.toFixed(1) + '% · Graded ' + (o.graded * 100).toFixed(1) + '%', 'Full pass ' + fv.toFixed(1) + '% of 273 tasks']; });
      s.appendChild(g);
    });
    host.appendChild(s);
  }
  function roundRight(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    return 'M' + x + ',' + y + 'H' + (x + w - r) + 'Q' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + r) + 'V' + (y + h - r) + 'Q' + (x + w) + ',' + (y + h) + ' ' + (x + w - r) + ',' + (y + h) + 'H' + x + 'Z';
  }

  // ---------- breakdown explorer ----------
  var currentGroup = null;
  function renderExplorerNav() {
    var host = $('category-groups'), sel = $('category-select'); if (!host || !D.groups) return;
    var sections = [];
    D.groups.forEach(function (g) {
      var s = sections.filter(function (x) { return x.name === g.section; })[0];
      if (!s) { s = { name: g.section, items: [] }; sections.push(s); }
      s.items.push(g);
    });
    sections.forEach(function (s) {
      var og = el('optgroup', { label: s.name });
      var list = el('div', { class: 'category-list' });
      s.items.forEach(function (g) {
        list.appendChild(el('button', { type: 'button', class: g.level === 'category' ? 'sub' : null, 'data-group': g.id, 'aria-pressed': 'false', onclick: function () { selectGroup(g.id); } }, [
          g.label + (g.lowSample ? ' †' : ''), el('span', { text: g.tasks + ' tasks' })
        ]));
        og.appendChild(el('option', { value: g.id, text: (g.level === 'category' ? '\u00a0\u00a0' : '') + g.label + (g.lowSample ? ' †' : '') + ' (' + g.tasks + ')' }));
      });
      host.appendChild(el('div', { class: 'category-group' }, [el('h4', { text: s.name }), list]));
      sel.appendChild(og);
    });
    sel.addEventListener('change', function () { selectGroup(sel.value); });
  }
  function selectGroup(id) {
    var g = D.groups.filter(function (x) { return x.id === id; })[0]; if (!g) return;
    currentGroup = g;
    document.querySelectorAll('[data-group]').forEach(function (b) { var on = b.getAttribute('data-group') === id; b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on)); });
    $('category-select').value = id;
    $('chart-title').textContent = g.label + (g.lowSample ? ' †' : '');
    $('chart-count').textContent = g.tasks + ' tasks · ' + (g.tasks * 10).toLocaleString('en-US') + ' model–task pairs · ' + g.scope;
    var host = clear($('category-bars'));
    var ids = MODELS.map(function (m) { return m.id; }).sort(function (a, b) { return g.values[b] - g.values[a]; });
    var max = 100;
    ids.forEach(function (mid, i) {
      var v = g.values[mid];
      var row = el('div', { class: 'chart-row' + (i === 0 ? ' is-lead' : '') }, [
        el('span', { class: 'chart-row-name' }, [icon(mid, 20), el('span', { text: modelLabel(mid) })]),
        el('span', { class: 'chart-track' }, [
          el('span', { class: 'chart-fill', style: 'display:block;width:' + (v / max * 100) + '%' }),
          g.pooled != null ? el('span', { class: 'pooled-line', style: 'left:calc(' + (g.pooled / max * 100) + '% - 1px)' }) : null
        ]),
        el('span', { class: 'chart-row-value', text: v.toFixed(1) })
      ]);
      bindTip(row, function () { return [v.toFixed(1) + '%', modelLabel(mid) + ' · ' + g.label, 'Pooled strict ' + (g.pooled != null ? g.pooled.toFixed(1) + '%' : '–')]; });
      host.appendChild(row);
    });
    var meta = clear($('chart-meta'));
    if (g.pooled != null) meta.appendChild(el('span', null, [el('i', { class: 'pooled-key' }), 'Pooled strict ', el('b', { text: g.pooled.toFixed(1) + '%' })]));
    if (g.full != null) meta.appendChild(el('span', null, ['Full-pass rate ', el('b', { text: g.full.toFixed(1) + '%' })]));
    if (g.zero != null) meta.appendChild(el('span', null, ['Zero-pass rate ', el('b', { text: g.zero.toFixed(1) + '%' })]));
    if (g.graded != null) meta.appendChild(el('span', null, ['Pooled graded ', el('b', { text: g.graded.toFixed(1) + '%' })]));
    $('chart-note').textContent = g.note || '';
  }

  // ---------- cases ----------
  var caseIndex = 0, caseTab = 'annotation', caseModel = null;
  function renderCases() {
    var grid = $('showcase-grid'); if (!grid || !D.cases) return;
    var order = ['7d7953f8', 'f725ea72', 'b0e36f34'];
    order.forEach(function (id) {
      var i = D.cases.map(function (c) { return c.id; }).indexOf(id);
      if (i < 0) return;
      var c = D.cases[i];
      var card = el('button', { type: 'button', class: 'showcase-card', 'aria-label': 'Open task: ' + c.title, onclick: function () { openCase(i); } }, [
        el('span', { class: 'card-image' }, [el('img', { src: (c.outputPosters && c.outputPosters['qwen3.8-max-0902']) || c.editsBaseline || c.images.card, alt: '', loading: 'lazy' }), el('span', { class: 'card-badge', text: c.badge })]),
        el('span', { class: 'card-info' }, [
          el('span', { class: 'card-eyebrow' }, [el('span', { text: c.modalityLabel })]),
          el('h3', { text: c.title }),
          el('span', { class: 'card-description', text: ({
            '7d7953f8': 'Recreate three text animations from a video reference.',
            'f725ea72': 'Correct a receipt entry and update every dependent view.',
            'b0e36f34': 'Reconcile an audit export across KPIs, tables and charts.'
          })[c.id] || c.summary }),
          el('span', { class: 'card-bottom' }, [
            el('span', { class: 'cap-tag', title: 'Task capability' }, [el('i', { text: c.capability.code }), c.capability.name]),
            c.scoreSummary ? el('span', null, [el('b', { text: c.scoreSummary.value }), ' ', el('small', { text: c.scoreSummary.label })]) : el('span', { text: 'Open ↗' })
          ])
        ])
      ]);
      grid.appendChild(card);
    });
  }
  var dialog = $('task-dialog');
  function openCase(i) {
    caseIndex = (i + D.cases.length) % D.cases.length;
    var c = D.cases[caseIndex];
    caseTab = c.views[0].id;
    caseModel = null;
    fillCase(c);
    if (!dialog.open) { dialog.showModal(); document.body.classList.add('dialog-open'); $('close-dialog').focus(); }
  }
  function fillCase(c) {
    $('detail-kicker').textContent = (caseIndex + 1) + ' / ' + D.cases.length + ' · Multimodal Editing';
    $('detail-id').textContent = 'Task ' + c.id + ' · ' + c.modalityLabel;
    $('detail-title').textContent = c.title;
    $('detail-description').textContent = c.summary;
    var chips = clear($('detail-chips'));
    chips.appendChild(el('span', { class: 'chip accent', title: 'Task capability', text: 'Capability: ' + c.capability.code + ' · ' + c.capability.name }));
    chips.appendChild(el('span', { class: 'chip', text: 'Input: ' + c.badge }));
    if (c.nCriteria) chips.appendChild(el('span', { class: 'chip', text: c.nCriteria + ' hidden criteria' }));
    // tabs
    var tabs = clear($('detail-tabs'));
    c.views.forEach(function (v, vi) {
      var sel = v.id === caseTab;
      tabs.appendChild(el('button', { type: 'button', role: 'tab', id: 'tab-' + v.id, 'data-view': v.id, 'aria-controls': 'media-stage', 'aria-selected': String(sel), tabindex: sel ? '0' : '-1',
        onclick: function () { caseTab = v.id; fillCase(c); focusIn('#detail-tabs', '[data-view="' + v.id + '"]'); },
        onkeydown: function (e) {
          var k = e.key, n = c.views.length, j = vi;
          if (k === 'ArrowRight') j = (vi + 1) % n; else if (k === 'ArrowLeft') j = (vi - 1 + n) % n; else if (k === 'Home') j = 0; else if (k === 'End') j = n - 1; else return;
          e.preventDefault(); e.stopPropagation(); caseTab = c.views[j].id; fillCase(c); focusIn('#detail-tabs', '[data-view="' + caseTab + '"]');
        } }, [v.label]));
    });
    $('media-stage').setAttribute('aria-labelledby', 'tab-' + caseTab);
    var v = c.views.filter(function (x) { return x.id === caseTab; })[0] || c.views[0];
    var stage = clear($('media-stage'));
    var picker = clear($('edit-picker'));
    picker.hidden = v.id !== 'edits';
    if (v.id === 'edits') {
      var ids = MODELS.map(function (m) { return m.id; }).filter(function (id) { return c.outputs[id]; })
        .sort(function (a, b) { return c.scores[b].strict - c.scores[a].strict || c.scores[b].graded - c.scores[a].graded; });
      picker.hidden = ids.length === 1;
      if (!caseModel || (caseModel !== 'baseline' && !c.outputs[caseModel])) caseModel = ids[0];
      if (ids.length > 1) {
        picker.appendChild(el('button', { type: 'button', class: 'edit-chip', 'data-model': 'baseline', 'aria-pressed': String(caseModel === 'baseline'), onclick: function () { caseModel = 'baseline'; fillCase(c); focusIn('#edit-picker', '[data-model="baseline"]'); } }, [el('span', { class: 'edit-chip-name', text: 'Starting app' })]));
        ids.forEach(function (id) {
          var sc = c.scores[id];
          picker.appendChild(el('button', { type: 'button', class: 'edit-chip' + (sc.strict === 1 ? ' full' : ''), 'data-model': id, 'aria-pressed': String(caseModel === id), onclick: function () { caseModel = id; fillCase(c); focusIn('#edit-picker', '[data-model="' + id + '"]'); } }, [
            icon(id, 18), el('span', { class: 'edit-chip-name', text: modelLabel(id) }), el('b', { text: pct(sc.strict, 0) })
          ]));
        });
      }
      var src = caseModel === 'baseline' ? c.editsBaseline : c.outputs[caseModel];
      var clip = c.outputVideos && c.outputVideos[caseModel];
      stage.className = 'media-stage' + (clip ? ' video' : '');
      if (clip) stage.appendChild(videoPlayer(clip, (c.outputPosters && c.outputPosters[caseModel]) || src, 'Browser recording of the final application produced by ' + modelLabel(caseModel)));
      else stage.appendChild(el('a', { href: src, target: '_blank', rel: 'noopener', title: 'Open full-size image' }, [el('img', { src: src, alt: caseModel === 'baseline' ? 'Unchanged starting application' : 'Final application produced by ' + modelLabel(caseModel) })]));
      if (caseModel === 'baseline') $('media-caption').textContent = 'The unchanged starting application, captured the same way as the model outputs. ' + (c.baselineNote || c.editsNote || '');
      else {
        var s = c.scores[caseModel];
        $('media-caption').textContent = modelLabel(caseModel) + ' · strict ' + pct(s.strict, 1) + '% · ' + s.pass + ' PASS, ' + s.partial + ' PARTIAL, ' + s.fail + ' FAIL of ' + s.n + ' hidden criteria. ' + (c.editsNote || '');
      }
    } else if (v.type === 'video') {
      stage.className = 'media-stage video';
      stage.appendChild(videoPlayer(v.src, v.poster, v.alt));
      $('media-caption').textContent = v.caption;
    } else {
      stage.className = 'media-stage' + (v.fit === 'contain' ? ' contain' : '');
      stage.appendChild(el('a', { href: v.src, target: '_blank', rel: 'noopener', title: 'Open full-size image' }, [el('img', { src: v.src, alt: v.alt })]));
      $('media-caption').textContent = v.caption;
    }
    // evaluator panel
    var panel = clear($('score-panel'));
    panel.appendChild(el('h3', { class: 'panel-title', text: 'What the evaluator checks' }));
    c.targets.forEach(function (t) {
      var box = el('div', { class: 'target' }, [el('h4', { text: t.heading }), el('p', { text: t.text })]);
      if (t.items && t.items.length) box.appendChild(el('ul', null, t.items.map(function (x) { return el('li', { text: x }); })));
      panel.appendChild(box);
    });
    panel.appendChild(el('p', { class: 'micro', style: 'margin:10px 0 0;font-size:.875rem', text: c.targetsNote || 'Three selected targets from the paper (Figure 5). The full rubric contains additional criteria and stays hidden from solvers.' }));
    if (c.scores) {
      var scoreIds = MODELS.map(function (m) { return m.id; }).filter(function (id) { return c.scores[id] != null; });
      panel.appendChild(el('h3', { text: scoreIds.length === 1 ? 'Score for this run' : 'How the ten endpoints scored on this task' }));
      var list = el('div', { class: 'model-scores' });
      scoreIds
        .sort(function (a, b) { return c.scores[b].strict - c.scores[a].strict; })
        .forEach(function (id) {
          var sc = c.scores[id];
          list.appendChild(el('div', { class: 'model-score-row' }, [
            el('span', { class: 'name' }, [icon(id, 18), el('span', { text: modelLabel(id) })]),
            el('span', { class: 'track', 'aria-hidden': 'true' }, [el('span', { style: 'width:' + (sc.strict * 100) + '%' })]),
            el('b', { text: pct(sc.strict, 0) })
          ]));
        });
      panel.appendChild(list);
      panel.appendChild(el('p', { class: 'micro', style: 'margin:10px 0 0;font-size:.875rem', text: c.scoresNote || 'Strict completion (%) of each endpoint’s final application on this task, from the frozen paper runs.' }));
    }
    // context
    var ctx = clear($('task-context'));
    var left = el('div', null, [el('h3', { text: 'The request' })]);
    var q = el('div', { class: 'query-block' });
    c.query.forEach(function (row) { q.appendChild(el('div', null, [el('span', { class: 'k', text: row.k }), el('span', { text: row.v })])); });
    left.appendChild(q);
    if (c.request) {
      left.appendChild(el('h3', { style: 'margin-top:24px', text: 'Task request given to the agent (translated from Chinese)' }));
      left.appendChild(el('p', { class: 'request-text', text: c.request }));
    }
    var right = el('div', null, [el('h3', { text: 'Inputs' })]);
    c.attachments.forEach(function (a) { right.appendChild(el('span', { class: 'attachment-label' }, [el('span', { 'aria-hidden': 'true', text: a.icon || '▣' }), a.label])); });
    if (c.capabilities && c.capabilities.length) {
      right.appendChild(el('h3', { style: 'margin-top:20px', text: 'Capabilities' }));
      c.capabilities.forEach(function (x) { right.appendChild(el('span', { class: 'chip', style: 'margin:0 6px 7px 0', text: x })); });
    }
    ctx.appendChild(left); ctx.appendChild(right);
  }
  function focusIn(scope, sel) { var n = document.querySelector(scope + ' ' + sel); if (n) n.focus(); }
  function closeCase() { dialog.close(); }
  if (dialog) {
    dialog.addEventListener('close', function () { pauseVideos(dialog); document.body.classList.remove('dialog-open'); hideTip(); });
    dialog.addEventListener('click', function (e) {
      if (e.target !== dialog) return;
      var r = dialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeCase();
    });
    $('close-dialog').addEventListener('click', closeCase);
    $('previous-task').addEventListener('click', function () { openCase(caseIndex - 1); });
    $('next-task').addEventListener('click', function () { openCase(caseIndex + 1); });
    dialog.addEventListener('keydown', function (e) {
      if (e.target.closest && e.target.closest('[role=tablist],[role=group],input,select,a')) return;
      if (e.key === 'ArrowLeft') openCase(caseIndex - 1);
      if (e.key === 'ArrowRight') openCase(caseIndex + 1);
    });
  }

  // ---------- inside a run ----------
  var runIndex = 0;
  var PHASE = { understand: 'Understand', inspect: 'Inspect', edit: 'Edit', verify: 'Verify', finish: 'Finish' };
  function renderRunPicker() {
    var host = $('run-picker'); if (!host || !D.runs) return;
    host.hidden = D.runs.runs.length === 1;
    if (host.hidden) { renderRun(true); return; }
    D.runs.runs.forEach(function (r, i) {
      var c = r.compare || {};
      host.appendChild(el('button', { type: 'button', 'aria-pressed': String(i === runIndex), 'aria-label': r.title + ', strict ' + (c.score != null ? (c.score * 100).toFixed(1) + '%' : 'n/a'), onclick: function () { runIndex = i; host.querySelectorAll('button').forEach(function (b, j) { b.setAttribute('aria-pressed', String(j === i)); }); renderRun(); } }, [
        el('span', { class: 'rp-head' }, [el('b', null, [r.icon ? icon(r.icon, 20) : null, r.title]), r.role ? el('em', { text: r.role }) : null]),
        c.score != null ? el('span', { class: 'rp-score' }, [
          el('span', { class: 'rp-track', 'aria-hidden': 'true' }, [el('span', { style: 'width:' + (c.score * 100) + '%' })]),
          el('strong', { text: (c.score * 100).toFixed(1) + '%' }), el('small', { text: c.scoreLabel || 'graded score' })
        ]) : el('span', { text: r.modelLabel + ' · task ' + r.task }),
        c.score != null ? el('span', { class: 'rp-meta', text: c.meta || (c.steps + ' ' + c.stepsLabel + ' · ' + c.toolCalls + ' tool calls · image ' + c.image) }) : null
      ]));
    });
    renderRun(true);
  }
  function renderRun(silent) {
    var r = D.runs.runs[runIndex];
    if (!silent) announce('Showing ' + r.title + ', ' + r.steps.length + ' steps');
    var tl = clear($('run-timeline'));
    r.steps.forEach(function (s, i) {
      var body = el('div', { class: 't-body' }, [
        el('div', { class: 't-head' }, [el('h3', null, [langText(s.title)]), el('span', { text: (PHASE[s.phase] || s.phase) + (s.tool && s.tool.toLowerCase() !== String(s.phase).toLowerCase() ? ' · ' + s.tool : '') })]),
        el('p', null, [langText(s.detail)])
      ]);
      if (s.excerpt) body.appendChild(el('pre', { class: 't-excerpt' }, [langText(s.excerpt)]));
      if (s.image) body.appendChild(el('a', { class: 't-image', href: s.image, target: '_blank', rel: 'noopener' }, [el('img', { src: s.image, alt: s.imageAlt || '', loading: 'lazy' })]));
      tl.appendChild(el('li', null, [el('span', { class: 't-dot ' + s.phase, 'aria-hidden': 'true', text: String(i + 1) }), body]));
    });
    var sum = clear($('run-summary'));
    sum.appendChild(el('h3', { text: r.title + ' · ' + r.harness }));
    var stats = el('div', { class: 'run-stats' });
    r.stats.forEach(function (st) { stats.appendChild(el('div', null, [el('b', { text: st.value }), st.label])); });
    sum.appendChild(stats);
    sum.appendChild(el('div', { class: 'phase-legend', style: 'margin-top:14px' }, Object.keys(PHASE).map(function (p) {
      return el('span', null, [el('i', { class: 't-dot-key', style: 'background:' + ({ understand: '#5f6b88', inspect: '#1c7fa4', edit: '#a24f80', verify: '#9c6e1f', finish: 'var(--ink)' })[p] }), PHASE[p]]);
    })));
    if (r.note) sum.appendChild(el('p', { class: 'run-note', text: r.note }));
    if (r.finalRender) {
      sum.appendChild(el('p', { class: 'run-final-label', text: r.finalLabel || 'Final application' }));
      if (r.finalVideo) sum.appendChild(el('div', { class: 'run-final' }, [videoPlayer(r.finalVideo, r.finalRender, 'Browser recording of the final application produced by ' + r.title)]));
      else sum.appendChild(el('a', { class: 'run-final', href: r.finalRender, target: '_blank', rel: 'noopener' }, [el('img', { src: r.finalRender, alt: 'Final application produced by ' + r.title, loading: 'lazy' })]));
      var ci = D.cases.map(function (x) { return x.id; }).indexOf(r.task);
      if (ci >= 0) sum.appendChild(el('button', { type: 'button', class: 'text-link run-compare-link', onclick: function () { pauseVideos(sum); openCase(ci); caseTab = 'edits'; caseModel = r.id; fillCase(D.cases[ci]); } }, ['View model output ', el('span', { 'aria-hidden': 'true', text: '↗' })]));
    }
  }

  // ---------- bibtex ----------
  var copyBtn = $('copy-bibtex');
  if (copyBtn && !$('bibtex-text').textContent.trim()) copyBtn.hidden = true;  // nothing to copy while the BibTeX block is empty
  if (copyBtn) copyBtn.addEventListener('click', function () {
    var text = $('bibtex-text').textContent;
    var done = function () { copyBtn.textContent = 'Copied ✓'; setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1800); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
    function fallback() {
      var r = document.createRange(); r.selectNodeContents($('bibtex-text'));
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
      try { document.execCommand('copy'); done(); } catch (e) { copyBtn.textContent = 'Press ⌘/Ctrl+C'; }
    }
  });

  // ---------- nav highlight ----------
  if ('IntersectionObserver' in window) {
    var links = {}; document.querySelectorAll('.site-header nav a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        Object.keys(links).forEach(function (k) { links[k].removeAttribute('aria-current'); });
        if (links[e.target.id]) links[e.target.id].setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['intro-video', 'benchmark', 'leaderboard', 'cases', 'evaluation', 'citation'].forEach(function (id) { var n = $(id); if (n) io.observe(n); });
    var heroEl = document.querySelector('.hero'); if (heroEl) io.observe(heroEl);
  }

  // ---------- boot ----------
  if (D.authors) $('authors').textContent = D.authors;
  bindAuthorDetails();
  bindDemo();
  renderSaturation();
  renderModalityBar();
  renderTaxonomy();
  renderCompare();
  renderLeaderboard(true);
  renderSlope();
  renderGap();
  renderExplorerNav();
  selectGroup(D.defaultGroup || D.groups[0].id);
  renderCases();
  renderRunPicker();
  window.addEventListener('scroll', hideTip, { passive: true });
  var chartWidths = {}, resizeTimer = null;
  var CHARTS = { 'saturation-chart': renderSaturation, 'slope-chart': renderSlope, 'gap-chart': renderGap };
  Object.keys(CHARTS).forEach(function (id) { var h = $(id); if (h) chartWidths[id] = h.clientWidth; });
  // Charts are measured again when their detail view becomes visible.
  document.querySelectorAll('details').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) { pauseVideos(d); return; }
      requestAnimationFrame(function () {
        Object.keys(CHARTS).forEach(function (id) {
          var h = $(id);
          if (h && h.getClientRects().length && h.clientWidth > 0) {
            chartWidths[id] = h.clientWidth; CHARTS[id]();
          }
        });
      });
    });
  });
  function revealHashTarget() {
    var target = $(location.hash.slice(1));
    if (!target) return;
    var node = target;
    while (node) {
      if (node.tagName === 'DETAILS') node.open = true;
      node = node.parentElement;
    }
    requestAnimationFrame(function () { target.scrollIntoView({ block: 'start', behavior: 'instant' }); });
  }
  window.addEventListener('hashchange', revealHashTarget);
  if (location.hash) revealHashTarget();
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      Object.keys(CHARTS).forEach(function (id) {
        var h = $(id); if (!h) return;
        if (Math.abs(h.clientWidth - (chartWidths[id] || 0)) > 4) { chartWidths[id] = h.clientWidth; CHARTS[id](); }
      });
    }, 160);
  });
})();
