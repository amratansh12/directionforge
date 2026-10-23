// Kilnward booking panel. All data is sample data.
(function () {
  'use strict';

  var FIRINGS = {
    k2fri: { kiln: 'Kiln 2', what: 'bisque to cone 04', when: 'fires Fri 30, 19:00', cap: 90, base: 55 },
    k2thu: { kiln: 'Kiln 2', what: 'bisque to cone 04', when: 'fires Thu 5, 19:00', cap: 90, base: 12 },
    k1tue: { kiln: 'Kiln 1', what: 'glaze to cone 6', when: 'fires Tue 3, 20:00', cap: 60, base: 24 }
  };

  // name, time, taken, total, unit, firing, typical pieces
  var WEEK = {
    mon: { label: 'Mon 26', slots: [
      ['Open studio', '10:00–13:00', 6, 10, 'wheels', 'k2fri', 3],
      ['Beginners’ wheel, week 3', '18:30–20:30', 8, 8, 'seats', 'k2fri', 2] ] },
    tue: { label: 'Tue 27', slots: [
      ['Open studio', '10:00–13:00', 4, 10, 'wheels', 'k2fri', 3],
      ['Handbuilding', '18:30–20:30', 5, 8, 'seats', 'k2fri', 2] ] },
    wed: { label: 'Wed 28', slots: [
      ['Open studio', '13:00–16:00', 7, 10, 'wheels', 'k2fri', 3],
      ['Glaze night', '19:00–21:30', 9, 12, 'seats', 'k1tue', 4] ] },
    thu: { label: 'Thu 29', slots: [
      ['Open studio', '10:00–13:00', 5, 10, 'wheels', 'k2fri', 3],
      ['Open studio', '18:00–21:00', 9, 10, 'wheels', 'k2fri', 3] ] },
    fri: { label: 'Fri 30', slots: [
      ['Kids’ clay', '16:00–17:30', 6, 8, 'seats', 'k2thu', 2] ] },
    sat: { label: 'Sat 31', slots: [
      ['Taster session', '10:00–12:00', 8, 8, 'seats', 'k2thu', 2],
      ['Open studio', '13:00–17:00', 10, 10, 'wheels', 'k2thu', 3] ] },
    sun: { label: 'Sun 1', slots: [
      ['Open studio', '11:00–15:00', 3, 10, 'wheels', 'k2thu', 3] ] }
  };

  var form = document.getElementById('booker');
  if (!form) return;
  var list = document.getElementById('slot-list');
  var out = document.getElementById('pieces-out');
  var up = document.getElementById('pieces-up');
  var down = document.getElementById('pieces-down');
  var kilnLine = document.getElementById('kiln-line');
  var base = document.getElementById('meter-base');
  var add = document.getElementById('meter-add');
  var sum = document.getElementById('kiln-sum');
  var summary = document.getElementById('booker-summary');

  var state = { day: 'thu', slot: 0, pieces: 3 };

  function pct(n, cap) { return Math.min(100, (n / cap) * 100).toFixed(1) + '%'; }

  function renderSlots() {
    var day = WEEK[state.day];
    var firstOpen = -1;
    day.slots.forEach(function (s, i) { if (firstOpen < 0 && s[2] < s[3]) firstOpen = i; });
    if (state.slot < 0 || state.slot >= day.slots.length || day.slots[state.slot][2] >= day.slots[state.slot][3]) state.slot = firstOpen;

    list.innerHTML = day.slots.map(function (s, i) {
      var full = s[2] >= s[3];
      var cap = full ? 'Full · join the waitlist' : s[2] + ' of ' + s[3] + ' ' + s[4] + ' taken';
      return '<label class="slot' + (full ? ' is-full' : '') + '">' +
        '<input type="radio" name="slot" value="' + i + '"' + (i === state.slot ? ' checked' : '') + (full ? ' disabled' : '') + '>' +
        '<span class="slot-main"><span class="slot-name">' + s[0] + '</span><span class="slot-time">' + s[1] + '</span></span>' +
        '<span class="slot-cap"><span class="cap-text">' + cap + '</span><span class="cap-bar" aria-hidden="true"><i style="width:' + pct(s[2], s[3]) + '"></i></span></span>' +
        '</label>';
    }).join('');
  }

  function renderKiln() {
    var day = WEEK[state.day];
    var s = day.slots[state.slot];
    up.disabled = !s || state.pieces >= 8;
    down.disabled = !s || state.pieces <= 1;
    out.textContent = state.pieces;

    if (!s) {
      var f0 = FIRINGS[day.slots[0][5]];
      kilnLine.innerHTML = '<b>' + f0.kiln + '</b> · ' + f0.what + ' · ' + f0.when;
      base.style.width = pct(f0.base, f0.cap); add.style.width = '0%';
      sum.textContent = f0.base + ' of ' + f0.cap + ' piece spaces booked so far';
      summary.textContent = day.label + ' is full. Members can join the waitlist and are offered the next place that opens.';
      return;
    }
    var f = FIRINGS[s[5]];
    var after = Math.min(f.cap, f.base + state.pieces);
    kilnLine.innerHTML = '<b>' + f.kiln + '</b> · ' + f.what + ' · ' + f.when;
    base.style.width = pct(f.base, f.cap);
    add.style.width = pct(after - f.base, f.cap);
    sum.textContent = after + ' of ' + f.cap + ' piece spaces with this booking (was ' + f.base + ')';
    summary.textContent = day.label + ', ' + s[0].toLowerCase() + ' ' + s[1] + ': your place makes it ' + (s[2] + 1) + ' of ' + s[3] + ' ' + s[4] + '.';
  }

  form.addEventListener('change', function (e) {
    var t = e.target;
    if (t.name === 'day') {
      state.day = t.value;
      state.slot = 0;
      state.pieces = 3;
      renderSlots();
      var s = WEEK[state.day].slots[state.slot];
      if (s) state.pieces = s[6];
      renderKiln();
    } else if (t.name === 'slot') {
      state.slot = parseInt(t.value, 10);
      state.pieces = WEEK[state.day].slots[state.slot][6];
      renderKiln();
    }
  });
  up.addEventListener('click', function () { if (state.pieces < 8) { state.pieces++; renderKiln(); } });
  down.addEventListener('click', function () { if (state.pieces > 1) { state.pieces--; renderKiln(); } });

  renderSlots();
  renderKiln();

  // ---- entrances: parts of each section arrive in reading order ----
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var risers = Array.prototype.slice.call(document.querySelectorAll('.rise'));
  if (reduce || !('IntersectionObserver' in window)) {
    risers.forEach(function (el) { el.classList.add('in'); });
  } else {
    var groups = new Map();
    risers.forEach(function (el) {
      var sec = el.closest('section') || document.body;
      if (!groups.has(sec)) groups.set(sec, []);
      var arr = groups.get(sec);
      el.style.setProperty('--d', (arr.length * 80) + 'ms');
      arr.push(el);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    risers.forEach(function (el) { io.observe(el); });
  }

  // ---- the hero scene drifts slower than the page (moves the photograph once it is in) ----
  var scene = document.querySelector('.hero-scene');
  if (scene && !reduce) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, window.innerHeight);
        scene.style.transform = 'translate3d(0,' + (y * 0.18).toFixed(1) + 'px,0) scale(1.04)';
        ticking = false;
      });
    }, { passive: true });
  }
})();
