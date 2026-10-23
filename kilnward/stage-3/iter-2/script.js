// Kilnward · iteration 2 · one firing, start to finish. All data is sample data.
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  /* ---------- firing curve: scrub with pointer or arrow keys ---------- */
  var plot = document.querySelector('.plot');
  if (plot) {
    var TMAX = 1300, PEAK = 8.917;
    var prog = [[0, 20], [2, 220], [6.889, 1100], [8.922, 1222], [9.089, 1222], [10.09, 1000], [12, 847]];
    var segs = [[2, 'S1 · 100 °C/h'], [6.889, 'S2 · 180 °C/h'], [8.922, 'S3 · 60 °C/h'], [9.089, 'Hold · 10 min'], [10.09, 'S4 · fall'], [12.01, 'S5 · 80 °C/h']];
    var interp = function (arr, h) {
      for (var i = 1; i < arr.length; i++) {
        if (h <= arr[i][0]) { var a = arr[i - 1], b = arr[i]; return a[1] + (b[1] - a[1]) * ((h - a[0]) / (b[0] - a[0] || 1)); }
      }
      return arr[arr.length - 1][1];
    };
    var segAt = function (h) { for (var i = 0; i < segs.length; i++) if (h <= segs[i][0]) return segs[i][1]; return segs[segs.length - 1][1]; };
    var clock = function (h) {
      var m = Math.round(h * 60), hh = (18 + Math.floor(m / 60)) % 24, mm = m % 60;
      return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0') + (h >= 6 ? ' Fri' : ' Thu');
    };
    var out = {};
    plot.parentNode.querySelectorAll('[data-r]').forEach(function (el) { out[el.dataset.r] = el; });
    var svgs = plot.querySelectorAll('svg.curve');
    var active = function () {
      for (var i = 0; i < svgs.length; i++) if (svgs[i].getBoundingClientRect().width > 0) return svgs[i];
      return svgs[0];
    };
    var geo = function (svg) {
      var d = svg.dataset;
      return { x0: +d.x0, x1: +d.x1, y0: +d.y0, y1: +d.y1 };
    };
    var loggedOf = function (svg) {
      var g = geo(svg);
      return svg.querySelector('.logged').getAttribute('points').trim().split(/\s+/).map(function (p) {
        var xy = p.split(',');
        return [((+xy[0] - g.x0) / (g.x1 - g.x0)) * 12, ((g.y0 - +xy[1]) / (g.y0 - g.y1)) * TMAX];
      });
    };
    var cur = PEAK;
    var show = function (h, scrub) {
      var svg = active(), g = geo(svg);
      h = Math.max(0, Math.min(12, h)); cur = h;
      var p = interp(prog, h), x = g.x0 + (h / 12) * (g.x1 - g.x0), y = g.y0 - (p / TMAX) * (g.y0 - g.y1);
      var line = svg.querySelector('.cursor-line'), dot = svg.querySelector('.cursor-dot');
      line.setAttribute('x1', x); line.setAttribute('x2', x);
      dot.setAttribute('cx', x); dot.setAttribute('cy', y);
      plot.classList.toggle('is-scrub', !!scrub);
      out.time.textContent = clock(h);
      out.prog.textContent = Math.round(p) + ' °C';
      out.log.textContent = Math.round(interp(loggedOf(svg), h)) + ' °C';
      out.seg.textContent = segAt(h);
    };
    var reset = function () { show(PEAK, false); out.time.textContent = '02:55 Fri · peak'; };
    reset();
    svgs.forEach(function (svg) {
      var hit = svg.querySelector('.hit');
      hit.addEventListener('pointermove', function (e) {
        var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
        var sp = pt.matrixTransform(svg.getScreenCTM().inverse()), g = geo(svg);
        show(Math.round(((sp.x - g.x0) / (g.x1 - g.x0)) * 12 * 12) / 12, true);
      });
      hit.addEventListener('pointerleave', reset);
    });
    plot.addEventListener('keydown', function (e) {
      var step = { ArrowRight: 0.25, ArrowLeft: -0.25 }[e.key];
      if (step) { e.preventDefault(); show(Math.round((cur + step) * 4) / 4, true); }
      else if (e.key === 'Home') { e.preventDefault(); show(0, true); }
      else if (e.key === 'End') { e.preventDefault(); show(12, true); }
      else if (e.key === 'Escape') { reset(); }
    });
    plot.addEventListener('blur', reset);
  }

  /* ---------- booking: session + pieces fill this firing's load ---------- */
  var form = document.getElementById('booker');
  if (form) {
    var CAP = 44, BASE = 35, BASE_MEMBERS = 10, MIN = 1, MAX = 12;
    var meter = document.getElementById('meter');
    for (var i = 0; i < CAP; i++) meter.appendChild(document.createElement('i'));
    var cells = meter.children;
    var outP = document.getElementById('p-out'), up = document.getElementById('p-up'), down = document.getElementById('p-down');
    var overEl = document.getElementById('m-over');
    var total = document.getElementById('m-total'), members = document.getElementById('m-members'), status = document.getElementById('m-status');
    var pieces = 3;
    var radios = form.querySelectorAll('input[name="sess"]');
    var render = function () {
      var r = form.querySelector('input[name="sess"]:checked');
      var feeds = r.dataset.feeds === 'k2';
      radios.forEach(function (x) {
        var tr = x.closest('tr'); tr.classList.toggle('is-on', x === r);
        var pl = tr.querySelector('[data-places]');
        if (pl) pl.textContent = (+x.dataset.taken + (x === r ? 1 : 0)) + ' / ' + x.dataset.cap;
      });
      var add = feeds ? pieces : 0;
      var fit = Math.min(add, CAP - BASE), over = add - fit;
      for (var j = 0; j < CAP; j++) cells[j].className = j < BASE ? 'b' : (j < BASE + fit ? 'a' : '');
      overEl.innerHTML = new Array((feeds ? over : pieces) + 1).join('<i></i>');
      total.textContent = BASE + fit;
      members.textContent = BASE_MEMBERS + (feeds ? 1 : 0);
      meter.setAttribute('aria-label', (BASE + fit) + ' of ' + CAP + ' piece spaces booked for Thursday\'s K2 glaze firing');
      outP.textContent = pieces;
      down.disabled = pieces <= MIN; up.disabled = pieces >= MAX;
      var word = pieces === 1 ? 'piece' : 'pieces';
      status.classList.toggle('is-warn', !feeds || over > 0);
      if (!feeds) status.textContent = 'That session ends after the load closes. Lars\'s ' + pieces + ' ' + word + ' wait for the next K2 glaze, Tue 20 Oct.';
      else if (over > 0) status.textContent = 'Thursday\'s load is full. ' + fit + ' go in, ' + over + ' wait for the next K2 glaze, Tue 20 Oct.';
      else status.textContent = 'Lars\'s ' + pieces + ' ' + word + ' go in Thursday\'s load. ' + (CAP - BASE - fit) + ' spaces left.';
    };
    form.addEventListener('change', render);
    form.querySelectorAll('.sess-tbl tbody tr').forEach(function (tr) {
      tr.addEventListener('click', function (e) {
        var x = tr.querySelector('input'); if (!x || x.disabled || e.target === x || e.target.tagName === 'LABEL') return;
        x.checked = true; render();
      });
    });
    up.addEventListener('click', function () { if (pieces < MAX) { pieces++; render(); } });
    down.addEventListener('click', function () { if (pieces > MIN) { pieces--; render(); } });
    render();
  }

  /* ---------- shelf filters ---------- */
  var chips = document.querySelectorAll('.chip');
  var rows = document.querySelectorAll('.shelf-tbl tbody tr[data-s]');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
      var f = chip.dataset.f;
      rows.forEach(function (r) { r.hidden = !(f === 'all' || r.dataset.s === f); });
    });
  });

  /* ---------- time rail tracks scroll ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.rail-list a'));
  var list = document.querySelector('.rail-list');
  var order = ['booked', 'loaded', 'fired', 'cooling', 'unloaded', 'next'];
  var secs = Array.prototype.slice.call(document.querySelectorAll('[data-stage]'));
  var last = null;
  var setStage = function (stage, el) {
    if (el === last) return; last = el;
    var idx = order.indexOf(stage);
    var heroActive = el && el.classList.contains('hero');
    links.forEach(function (a, i) {
      a.classList.toggle('is-past', !heroActive && i < idx);
      if (i === idx) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
    });
    var a = links[idx];
    if (a && list) list.style.setProperty('--p', heroActive ? 0 : Math.round(a.parentNode.offsetTop + 15));
  };
  var tick = function () {
    var line = window.innerHeight * 0.4, pick = secs[0];
    secs.forEach(function (s) { if (s.getBoundingClientRect().top <= line) pick = s; });
    if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 4) pick = secs[secs.length - 1];
    setStage(pick.dataset.stage, pick);
  };
  var queued = false;
  window.addEventListener('scroll', function () { if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; tick(); }); } }, { passive: true });
  window.addEventListener('resize', function () { last = null; tick(); });
  tick();
})();
