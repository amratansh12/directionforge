// Kilnward · Final · Kiln Log. Every value here is sample data.
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  /* ---------- A · firing curve: scrub with pointer or arrow keys ---------- */
  var plot = document.querySelector('.plot');
  if (plot) {
    var TMAX = 1300, NOW = 8.667;
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
    var svgs = Array.prototype.slice.call(plot.querySelectorAll('svg.curve'));
    var geo = function (svg) { var d = svg.dataset; return { x0: +d.x0, x1: +d.x1, y0: +d.y0, y1: +d.y1 }; };
    var logs = svgs.map(function (svg) {
      var g = geo(svg);
      return svg.querySelector('.logged').getAttribute('points').trim().split(/\s+/).map(function (p) {
        var xy = p.split(',');
        return [((+xy[0] - g.x0) / (g.x1 - g.x0)) * 12, ((g.y0 - +xy[1]) / (g.y0 - g.y1)) * TMAX];
      });
    });
    var active = function () {
      for (var i = 0; i < svgs.length; i++) if (svgs[i].getBoundingClientRect().width > 0) return i;
      return 0;
    };
    var cur = NOW;
    var show = function (h, scrub) {
      var i = active(), svg = svgs[i], g = geo(svg);
      h = Math.max(0, Math.min(12, h)); cur = h;
      var p = interp(prog, h), x = g.x0 + (h / 12) * (g.x1 - g.x0), y = g.y0 - (p / TMAX) * (g.y0 - g.y1);
      var line = svg.querySelector('.cursor-line'), dot = svg.querySelector('.cursor-dot');
      line.setAttribute('x1', x); line.setAttribute('x2', x);
      dot.setAttribute('cx', x); dot.setAttribute('cy', y);
      plot.classList.toggle('is-scrub', !!scrub);
      out.time.textContent = clock(h);
      out.prog.textContent = Math.round(p) + ' °C';
      out.log.textContent = h <= NOW + 0.001 ? Math.round(interp(logs[i], h)) + ' °C' : 'not yet';
      out.seg.textContent = segAt(h);
    };
    var reset = function () { show(NOW, false); out.time.textContent = '02:40 Fri · now'; out.log.textContent = '1207 °C'; };
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

  /* ---------- B · kiln capacity meter: next K1 bisque load ---------- */
  var CAP = 60, BOOKED = 34, MAXP = 30;
  var SESS = {
    w1: { name: 'Wheel I · wk 3', members: 8, pieces: 14 },
    os: { name: 'Tuesday open studio', members: 6, pieces: 7 },
    w2: { name: 'Wheel II · wk 5', members: 7, pieces: 12 },
    ow: { name: 'Wednesday open studio', members: 9, pieces: 9 }
  };
  var form = document.getElementById('meter');
  if (form) {
    var cells = Array.prototype.slice.call(document.querySelectorAll('#cells i'));
    var pOut = document.getElementById('p-out');
    var up = document.getElementById('p-up'), down = document.getElementById('p-down');
    var tAdd = document.getElementById('t-add'), tFree = document.getElementById('t-free');
    var status = document.getElementById('m-status');
    var ov = document.getElementById('ov'), ovCells = document.getElementById('ov-cells');
    var state = { s: 'w1', p: SESS.w1.pieces };

    var render = function () {
      var total = BOOKED + state.p;
      var fit = Math.min(state.p, CAP - BOOKED);
      var over = Math.max(0, total - CAP);
      cells.forEach(function (c, i) { c.className = i < BOOKED ? 'b' : (i < BOOKED + fit ? 'a' : ''); });
      ov.hidden = over === 0;
      ovCells.innerHTML = new Array(over + 1).join('<i></i>');
      pOut.textContent = state.p;
      tAdd.textContent = fit;
      tFree.textContent = Math.max(0, CAP - total);
      up.disabled = state.p >= MAXP;
      down.disabled = state.p <= 1;
      var s = SESS[state.s];
      var who = s.name + ', ' + s.members + ' members: ';
      if (over > 0) {
        status.classList.add('is-over');
        status.innerHTML = who + '<span class="m">60 / 60</span>, full. <span class="m">' + over + '</span> ' + (over === 1 ? 'piece rolls' : 'pieces roll') + ' to K1 bisque <span class="m">Thu 22 · 18:00</span>.';
      } else {
        status.classList.remove('is-over');
        var left = CAP - total;
        status.innerHTML = who + '<span class="m">' + total + ' / 60</span>. ' + (left === 0 ? 'Fits exactly; the load is full.' : 'Fits, with <span class="m">' + left + '</span> ' + (left === 1 ? 'space' : 'spaces') + ' left.');
      }
    };
    form.addEventListener('change', function (e) {
      if (e.target.name === 'sess') { state.s = e.target.value; state.p = SESS[state.s].pieces; render(); }
    });
    var keepFocus = function (btn, other) { if (btn.disabled) other.focus(); };
    up.addEventListener('click', function () { if (state.p < MAXP) { state.p++; render(); keepFocus(up, down); } });
    down.addEventListener('click', function () { if (state.p > 1) { state.p--; render(); keepFocus(down, up); } });
    render();
  }

  /* ---------- booked · week grid: on phones open on the firing days ---------- */
  var wrap = document.querySelector('.week-wrap');
  var openOnFiring = function () {
    if (wrap && wrap.scrollWidth > wrap.clientWidth + 4) {
      var thu = wrap.querySelector('.wh.is-fire');
      if (thu) wrap.scrollLeft = Math.max(0, thu.offsetLeft - 52);
    }
  };
  openOnFiring();

  /* ---------- unloaded · shelf filters ---------- */
  var chips = document.querySelectorAll('.chip');
  var rows = document.querySelectorAll('.shelf-tbl tbody tr[data-s]');
  var empty = document.querySelector('.empty-row');
  var count = document.getElementById('shelf-count');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
      var f = chip.dataset.f, shown = 0;
      rows.forEach(function (r) {
        var ok = f === 'all' || (f === 'old' ? r.hasAttribute('data-old') : r.dataset.s === f);
        r.hidden = !ok; if (ok) shown++;
      });
      empty.hidden = shown !== 0;
      if (count) count.textContent = shown + (shown === 1 ? ' shelf' : ' shelves') + ' shown.';
    });
  });
})();
