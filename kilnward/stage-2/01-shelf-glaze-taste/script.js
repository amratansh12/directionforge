// Kilnward · Shelf & Glaze. Entrances, the firing tabs and the piece finder.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Number the pieces on each shelf fragment so they settle one after another.
  document.querySelectorAll('[data-ui]').forEach(function (frag) {
    frag.classList.add('settle');
    frag.querySelectorAll('.b, .pc, .tag, .mshelf li').forEach(function (el, i) {
      (el.closest('li[style]') || el).style.setProperty('--i', i % 14);
    });
  });

  // Stagger the parts of each section.
  document.querySelectorAll('main > section, .close').forEach(function (sec) {
    sec.querySelectorAll('.rise').forEach(function (el, i) { el.style.setProperty('--d', (i * 80) + 'ms'); });
  });

  var targets = document.querySelectorAll('.rise, .settle');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
  }

  // Firing tabs.
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function select(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t); });
    t.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (n) { e.preventDefault(); select(n, true); }
    });
  });
  if (tabs.length) select(tabs[0]);

  // Whose piece is this?
  document.querySelectorAll('.firing').forEach(function (panel) {
    var out = panel.querySelector('.who');
    var initial = out.textContent;
    var pieces = panel.querySelectorAll('.pc');
    pieces.forEach(function (pc) {
      pc.setAttribute('aria-label', pc.dataset.who);
      pc.setAttribute('aria-pressed', 'false');
      function show() {
        pieces.forEach(function (p) { p.setAttribute('aria-pressed', p === pc ? 'true' : 'false'); });
        out.textContent = pc.dataset.who;
      }
      pc.addEventListener('click', show);
      pc.addEventListener('focus', show);
      pc.addEventListener('mouseenter', show);
    });
    panel.addEventListener('mouseleave', function () {
      if (panel.contains(document.activeElement)) return;
      pieces.forEach(function (p) { p.setAttribute('aria-pressed', 'false'); });
      out.textContent = initial;
    });
  });
})();
