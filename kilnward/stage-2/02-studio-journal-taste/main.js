// Kilnward · Issue 07: entrance stagger and the shelf finder.
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduce && 'IntersectionObserver' in window) {
    root.classList.add('js');
    // Stagger the parts of each section: heading, then text, then figure.
    document.querySelectorAll('main section, main article').forEach(function (sec) {
      sec.querySelectorAll('.reveal').forEach(function (el, i) { el.style.setProperty('--d', (i * 80) + 'ms'); });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
    // Anything already on screen settles on the first frames.
    requestAnimationFrame(function () {
      document.querySelectorAll('.opening .reveal').forEach(function (el) { el.classList.add('is-in'); });
    });
  }

  // The shelf finder (sample data, mirrors the table beside it).
  var notes = {
    ada: '<strong>Shelf 14.</strong> Three vases and a planter from Thursday’s glaze firing, ready to collect after 10:00.',
    tomas: '<strong>Shelf 07.</strong> Two jugs held over: too tall for the third shelf, first in on the next glaze firing.',
    priya: '<strong>Shelf 22.</strong> A planter and four cups from Thursday’s glaze firing, ready to collect after 10:00.',
    hannah: '<strong>Shelf 03.</strong> Five bowls from Thursday’s glaze firing, ready to collect after 10:00.',
    jun: '<strong>Shelf 18.</strong> Three bowls and two lids, bisqued on Monday and waiting to be glazed.',
    mireille: '<strong>Shelf 11.</strong> Six mugs ready since 2 October. One reminder sent on Wednesday.'
  };
  var select = document.getElementById('member');
  var out = document.getElementById('finder-out');
  var rows = document.querySelectorAll('.table--shelves tbody tr');
  if (select && out) {
    select.addEventListener('change', function () {
      var v = select.value;
      rows.forEach(function (r) { r.classList.toggle('is-found', r.getAttribute('data-member') === v); });
      out.innerHTML = v ? notes[v] : 'Pick a name to see what is on their shelf this Saturday.';
    });
  }
})();
