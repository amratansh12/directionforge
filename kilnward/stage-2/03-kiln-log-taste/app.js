(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');

  /* ---------- Firing curve (sample programme: cone 6 glaze, 06:00 start) ---------- */
  // [minutes from start, °C]
  var PTS = [[0, 20], [150, 220], [384, 1000], [606, 1222], [616, 1222], [705, 1000], [720, 968]];
  var SEGS = [
    [150, 'segment 1, climbing 80 °C/h to 220 °C'],
    [384, 'segment 2, climbing 200 °C/h to 1000 °C'],
    [606, 'segment 3, climbing 60 °C/h to 1222 °C'],
    [616, 'holding at 1222 °C, cone 6 going down'],
    [705, 'segment 4, cooling 150 °C/h to 1000 °C'],
    [721, 'programme done, kiln off and cooling']
  ];
  function tempAt(m) {
    for (var i = 1; i < PTS.length; i++) {
      if (m <= PTS[i][0]) {
        var a = PTS[i - 1], b = PTS[i];
        return a[1] + (b[1] - a[1]) * (m - a[0]) / (b[0] - a[0]);
      }
    }
    return PTS[PTS.length - 1][1];
  }
  function segAt(m) { for (var i = 0; i < SEGS.length; i++) if (m < SEGS[i][0]) return SEGS[i][1]; return SEGS[SEGS.length - 1][1]; }
  function clock(m) { var t = 360 + Math.round(m); var h = Math.floor(t / 60), mm = t % 60; return (h < 10 ? '0' : '') + h + ':' + (mm < 10 ? '0' : '') + mm; }
  function fmt(n) { return Math.round(n).toLocaleString('en-GB'); }

  var scrub = document.getElementById('scrub');
  var out = document.getElementById('readout');
  var now = document.getElementById('now');
  var dot = document.getElementById('now-dot');
  var rect = document.getElementById('done-rect');

  function draw(m) {
    var T = tempAt(m);
    var x = m / 720;
    now.style.left = (x * 100) + '%';
    dot.style.top = ((1 - T / 1300) * 100) + '%';
    rect.setAttribute('width', String(x * 1200));
    var text = clock(m) + ' · ' + fmt(T) + ' °C · ' + segAt(m);
    out.textContent = text;
    scrub.setAttribute('aria-valuetext', text);
  }

  // The marker starts where the firing would be at this time of day (06:00 to 18:00).
  var d = new Date();
  var mins = d.getHours() * 60 + d.getMinutes() - 360;
  var start = Math.max(0, Math.min(720, mins));
  start = Math.round(start / 5) * 5;
  scrub.value = String(start);

  if (reduce) {
    draw(start);
  } else {
    // Signature move: the log is written out from 06:00 up to now.
    draw(0);
    var t0 = null, dur = 1600;
    var step = function (ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var e = 1 - Math.pow(1 - p, 4);
      draw(start * e);
      if (p < 1) requestAnimationFrame(step);
    };
    setTimeout(function () { requestAnimationFrame(step); }, 250);
  }
  scrub.addEventListener('input', function () { draw(Number(scrub.value)); });

  /* ---------- Shelf filter ---------- */
  var filters = document.querySelectorAll('.filter');
  var rows = document.querySelectorAll('.tbl--shelves tbody tr');
  var count = document.getElementById('shelf-count');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-f');
      filters.forEach(function (b) { var on = b === btn; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      var n = 0, p = 0;
      rows.forEach(function (r) {
        var show = f === 'all' || r.getAttribute('data-s') === f;
        r.hidden = !show;
        if (show) { n++; p += Number(r.children[2].textContent); }
      });
      count.textContent = 'Showing ' + n + (n === 1 ? ' shelf' : ' shelves') + ' · ' + p + ' pieces';
    });
  });

  /* ---------- Entrances: each section's parts arrive in reading order ---------- */
  var groups = [
    ['.ev', 45], ['.tbl tbody tr', 55], ['.segs li', 80], ['.log__row', 90], ['.setup li', 80], ['.spec__list div', 60]
  ];
  groups.forEach(function (g) {
    document.querySelectorAll('.sec').forEach(function (sec) {
      sec.querySelectorAll(g[0]).forEach(function (el, i) { el.style.setProperty('--d', (200 + i * g[1]) + 'ms'); });
    });
  });
  document.querySelectorAll('.sec').forEach(function (sec) {
    sec.querySelectorAll('[data-rise]').forEach(function (el, i) { el.style.setProperty('--d', (i * 80) + 'ms'); });
  });

  var targets = document.querySelectorAll('.sec [data-rise], .week, .kilns, .sched, .shelves, .log, .setup, .spec, .kilnpic');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    targets.forEach(function (el) { io.observe(el); });
  }
})();
