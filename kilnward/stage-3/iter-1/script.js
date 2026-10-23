// Kilnward · Stage 3 · Iteration 1 · Kiln room wall. Sample data only.
(function () {
  document.documentElement.classList.add('js');
  var narrow = window.matchMedia('(max-width: 720px)');

  /* ---------- firing curve scrub ---------- */
  var plot = document.querySelector('.plot');
  var svg = plot && plot.querySelector('svg.curve');
  if (svg) {
    var X0 = 64, X1 = 968, Y0 = 430, Y1 = 34, TMAX = 1300, NOW = 8.667;
    var prog = [[0, 20], [2, 220], [6.889, 1100], [8.922, 1222], [9.089, 1222], [10.09, 1000], [12, 847]];
    var segs = [[2, 'S1 · 100 °C/h'], [6.889, 'S2 · 180 °C/h'], [8.922, 'S3 · 60 °C/h'], [9.089, 'Hold · 10 min'], [10.09, 'S4 · fall to 1000 °C'], [12.01, 'S5 · 80 °C/h']];
    var toX = function (h) { return X0 + (h / 12) * (X1 - X0); };
    var toY = function (t) { return Y0 - (t / TMAX) * (Y0 - Y1); };
    var logged = svg.querySelector('.logged').getAttribute('points').trim().split(/\s+/).map(function (p) {
      var xy = p.split(',');
      return [((+xy[0] - X0) / (X1 - X0)) * 12, ((Y0 - +xy[1]) / (Y0 - Y1)) * TMAX];
    });
    var interp = function (arr, h) {
      for (var i = 1; i < arr.length; i++) {
        if (h <= arr[i][0]) {
          var a = arr[i - 1], b = arr[i];
          return a[1] + (b[1] - a[1]) * ((h - a[0]) / (b[0] - a[0] || 1));
        }
      }
      return arr[arr.length - 1][1];
    };
    var segAt = function (h) { for (var i = 0; i < segs.length; i++) if (h <= segs[i][0]) return segs[i][1]; return segs[segs.length - 1][1]; };
    var clock = function (h) {
      var m = Math.round(h * 60), hh = (18 + Math.floor(m / 60)) % 24, mm = m % 60;
      return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
    };
    var out = {};
    plot.parentNode.querySelectorAll('[data-r]').forEach(function (el) { out[el.dataset.r] = el; });
    var line = svg.querySelector('.cursor-line'), dot = svg.querySelector('.cursor-dot');
    var cur = NOW;

    var show = function (h, scrub) {
      h = Math.max(0, Math.min(12, h));
      cur = h;
      var p = interp(prog, h), x = toX(h);
      line.setAttribute('x1', x); line.setAttribute('x2', x);
      dot.setAttribute('cx', x); dot.setAttribute('cy', toY(p));
      plot.classList.toggle('is-scrub', !!scrub);
      out.time.textContent = clock(h) + (h >= 6 ? ' Fri' : ' Thu');
      out.prog.textContent = '~' + Math.round(p) + ' °C';
      out.log.textContent = h <= NOW + 0.001 ? Math.round(interp(logged, h)) + ' °C' : 'not yet';
      out.seg.textContent = segAt(h);
    };
    var reset = function () { show(NOW, false); out.time.textContent = '02:40 Fri · now'; out.prog.textContent = '1207 °C'; };
    reset();

    // Phones: the log opens on its live end (now, the peak, the cooling notes).
    var openLiveEnd = function () {
      if (plot.scrollWidth > plot.clientWidth + 4) plot.scrollLeft = plot.scrollWidth;
    };
    openLiveEnd();

    var hit = svg.querySelector('.hit');
    hit.addEventListener('pointermove', function (e) {
      var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      var sp = pt.matrixTransform(svg.getScreenCTM().inverse());
      show(Math.round(((sp.x - X0) / (X1 - X0)) * 12 * 12) / 12, true);
    });
    hit.addEventListener('pointerleave', reset);
    plot.addEventListener('keydown', function (e) {
      var step = { ArrowRight: 0.25, ArrowLeft: -0.25 }[e.key];
      if (step) { e.preventDefault(); show(Math.round((cur + step) * 4) / 4, true); }
      else if (e.key === 'Home') { e.preventDefault(); show(0, true); }
      else if (e.key === 'End') { e.preventDefault(); show(12, true); }
      else if (e.key === 'Escape') { reset(); }
    });
    plot.addEventListener('blur', reset);
  }

  /* ---------- week grid: phones open on the firing days ---------- */
  var wk = document.querySelector('.week-wrap');
  var thu = wk && wk.querySelector('[data-firing]');
  if (wk && thu && wk.scrollWidth > wk.clientWidth + 4) {
    wk.scrollLeft = thu.getBoundingClientRect().left - wk.querySelector('.week').getBoundingClientRect().left - 52;
  }

  /* ---------- kiln load meter ---------- */
  var form = document.querySelector('.load-form');
  if (form) {
    var CAP = 64, BASE = 38, MIN = 0, MAX = 30;
    var cells = document.querySelectorAll('.levels .c');
    var byIndex = [];
    cells.forEach(function (c) { byIndex[+c.dataset.i] = c; });
    var outN = document.getElementById('pieces-out');
    var sumN = document.querySelector('[data-sum="n"]');
    var sumL = document.querySelector('[data-sum="left"]');
    var sumP = document.getElementById('load-sum');
    var over = document.querySelector('.overflow');
    var ovCells = document.querySelector('.ov-cells');
    var down = form.querySelector('[data-step="-1"]'), up = form.querySelector('[data-step="1"]');
    var checked = form.querySelector('input[name="sess"]:checked');
    var pieces = +checked.dataset.pcs;

    var render = function () {
      var total = BASE + pieces;
      for (var i = 0; i < CAP; i++) {
        byIndex[i].className = 'c' + (i < BASE ? ' c-base' : i < total ? ' c-add' : '');
      }
      var spill = Math.max(0, total - CAP);
      over.hidden = spill === 0;
      ovCells.innerHTML = '';
      for (var j = 0; j < spill; j++) { var s = document.createElement('i'); s.className = 'c c-over'; ovCells.appendChild(s); }
      outN.textContent = pieces;
      sumN.textContent = Math.min(total, CAP);
      sumL.textContent = spill ? spill + ' over, wait for Wed' : (CAP - total) + ' left';
      sumP.classList.toggle('is-over', spill > 0);
      down.disabled = pieces <= MIN;
      up.disabled = pieces >= MAX;
    };
    form.addEventListener('change', function (e) {
      if (e.target.name === 'sess') { pieces = +e.target.dataset.pcs; render(); }
    });
    form.addEventListener('click', function (e) {
      var b = e.target.closest('[data-step]');
      if (!b || b.disabled) return;
      pieces = Math.max(MIN, Math.min(MAX, pieces + +b.dataset.step));
      render();
    });
    render();
  }

  /* ---------- shelf filters ---------- */
  var chips = document.querySelectorAll('.chip');
  var rows = document.querySelectorAll('.shelf-tbl tbody tr[data-s]');
  var empty = document.querySelector('.empty-row');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
      var f = chip.dataset.f, shown = 0;
      rows.forEach(function (r) {
        var ok = f === 'all' || (f === 'ready' && r.dataset.s === 'ready') || (f === 'old' && r.hasAttribute('data-old'));
        r.hidden = !ok; if (ok) shown++;
      });
      empty.hidden = shown !== 0;
    });
  });
})();
