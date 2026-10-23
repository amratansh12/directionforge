(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- kiln load planner ---------- */
  var SPACES_PER_SHELF = 6, SHELVES = 3, TOTAL = SPACES_PER_SHELF * SHELVES;
  var form = document.querySelector('.queue');
  var shelfEls = document.querySelectorAll('.shelf');
  var count = document.querySelector('.kv-count');
  var note = document.querySelector('.kv-note');
  var status = document.querySelector('.kv-status');

  function render(animate) {
    var boxes = form.querySelectorAll('input[type=checkbox]');
    var free = [SPACES_PER_SHELF, SPACES_PER_SHELF, SPACES_PER_SHELF];
    var placed = [[], [], []];
    var used = 0, waiting = 0, bisque = 0;

    boxes.forEach(function (b) {
      var row = b.closest('.qi');
      var isBisque = b.dataset.type === 'bisque';
      row.classList.toggle('is-bisque', isBisque);
      if (!b.checked) return;
      if (isBisque) bisque++;
      var size = +b.dataset.size;
      var s = free.findIndex(function (f) { return f >= size; });
      if (s === -1) { waiting += size; return; }
      free[s] -= size; used += size;
      placed[s].push({ who: b.dataset.who, size: size, bisque: isBisque });
    });

    shelfEls.forEach(function (el, i) {
      el.innerHTML = '';
      placed[i].forEach(function (p, j) {
        var d = document.createElement('div');
        d.className = 'piece' + (p.bisque ? ' bisque' : '');
        d.style.gridColumn = 'span ' + p.size;
        if (animate && !reduce) d.style.animationDelay = (j * 50) + 'ms'; else d.style.animation = 'none';
        d.textContent = p.who;
        el.appendChild(d);
      });
      for (var k = 0; k < free[i]; k++) {
        var c = document.createElement('div'); c.className = 'cell'; el.appendChild(c);
      }
    });

    count.textContent = used + ' of ' + TOTAL + ' spaces';
    var msg, warn = false;
    if (bisque) {
      warn = true;
      msg = 'Unfired bisque ware is in a glaze load. Move it to Saturday’s bisque firing in Kiln 1.';
    } else if (waiting) {
      warn = true;
      msg = waiting + (waiting === 1 ? ' space' : ' spaces') + ' won’t fit. That work waits for the next glaze firing.';
    } else if (used === TOTAL) {
      msg = 'Kiln is full. Load closes Thu 17:00.';
    } else {
      var left = TOTAL - used;
      msg = 'Room for ' + left + ' more. Load closes Thu 17:00.';
    }
    note.textContent = msg;
    status.classList.toggle('warn', warn);
  }

  if (form) {
    form.addEventListener('change', function () { render(true); });
    render(false);
  }

  /* ---------- entrances ---------- */
  if (!('IntersectionObserver' in window) || reduce) return;

  var flyers = document.querySelectorAll('.flyer');
  flyers.forEach(function (f, i) {
    if (i > 0) f.classList.add('pinning');
    var parts = f.querySelectorAll('.mis, .intro, .lede, .actions, .slip, figure, .weekgrid, .day, .replaces > *, .queue, .kilnview, .firings, .shelflist tr, .timetable tbody tr, .tear-copy, .tabs li');
    parts.forEach(function (p, j) {
      p.classList.add('rise');
      p.style.setProperty('--d', Math.min(j * 70, 900) + 'ms');
    });
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var f = e.target;
      f.classList.add('pinned');
      f.classList.remove('pinning');
      f.querySelectorAll('.rise').forEach(function (p) { p.classList.add('in'); });
      f.querySelectorAll('.mis').forEach(function (m) { m.classList.add('settle'); });
      io.unobserve(f);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });

  flyers.forEach(function (f) { io.observe(f); });
})();
