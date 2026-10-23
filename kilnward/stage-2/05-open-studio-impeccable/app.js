/* Kilnward prototype. All data below is synthetic sample data for a fictional studio. */
/* ?vh=900 pins the hero height for tall headless full-page captures */
(function () { var m = location.search.match(/[?&]vh=(\d+)/); if (m) document.documentElement.style.setProperty("--hero-h", m[1] + "px"); })();
(function () {
  "use strict";

  var CAPACITY = 120;       // Kiln 2, mug-sized piece equivalents
  var ALREADY_LOADED = 62;  // greenware from last week, already dry on the cart

  // dry: true when greenware from this session is bone-dry in time for Friday's bisque
  var DAYS = [
    { id: "mon", short: "Mon", date: "26", long: "Monday 26 Oct", sessions: [
      { id: "mon-os", name: "Open studio", time: "10:00–13:00", kind: "open", booked: 6, seats: 10, pcs: 12, dry: true },
      { id: "mon-wb", name: "Wheel basics, week 3", time: "18:30–20:30", kind: "class", booked: 8, seats: 8, pcs: 16, dry: true, waitlist: 2 }
    ]},
    { id: "tue", short: "Tue", date: "27", long: "Tuesday 27 Oct", sessions: [
      { id: "tue-os", name: "Open studio", time: "10:00–16:00", kind: "open", booked: 9, seats: 10, pcs: 14, dry: true },
      { id: "tue-hb", name: "Handbuilding: slab mugs", time: "19:00–21:00", kind: "class", booked: 7, seats: 8, pcs: 14, dry: true }
    ]},
    { id: "wed", short: "Wed", date: "28", long: "Wednesday 28 Oct", sessions: [
      { id: "wed-os", name: "Open studio", time: "13:00–17:00", kind: "open", booked: 5, seats: 10, pcs: 8, dry: true },
      { id: "wed-gl", name: "Glazing night", time: "18:30–21:00", kind: "class", booked: 10, seats: 10, pcs: 0, glaze: true, waitlist: 1 }
    ]},
    { id: "thu", short: "Thu", date: "29", long: "Thursday 29 Oct", sessions: [
      { id: "thu-os", name: "Open studio", time: "10:00–13:00", kind: "open", booked: 4, seats: 10, pcs: 6, dry: false },
      { id: "thu-wb", name: "Wheel basics, week 3 (group B)", time: "18:30–20:30", kind: "class", booked: 6, seats: 8, pcs: 12, dry: false }
    ]},
    { id: "fri", short: "Fri", date: "30", long: "Friday 30 Oct", sessions: [
      { id: "fri-os", name: "Open studio, quiet hours", time: "10:00–13:00", kind: "open", booked: 3, seats: 6, pcs: 5, dry: false, note: "Kiln 2 firing from 18:00" }
    ]},
    { id: "sat", short: "Sat", date: "31", long: "Saturday 31 Oct", sessions: [
      { id: "sat-fc", name: "Family clay morning", time: "10:00–12:00", kind: "class", booked: 12, seats: 12, pcs: 10, dry: false, waitlist: 4 },
      { id: "sat-os", name: "Open studio", time: "13:00–17:00", kind: "open", booked: 8, seats: 10, pcs: 12, dry: false }
    ]},
    { id: "sun", short: "Sun", date: "1", long: "Sunday 1 Nov", sessions: [
      { id: "sun-os", name: "Open studio", time: "12:00–16:00", kind: "open", booked: 7, seats: 10, pcs: 10, dry: false }
    ]}
  ];

  var selected = { "mon-wb": true, "tue-hb": true };
  var currentDay = "mon";

  var CHECK = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="#1F1A17" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function allSessions() { var out = []; DAYS.forEach(function (d) { d.sessions.forEach(function (s) { out.push(s); }); }); return out; }
  function countOn(day) { return day.sessions.filter(function (s) { return selected[s.id]; }).length; }

  /* ---------- hero planner ---------- */
  function renderDays() {
    var row = $("day-row");
    row.innerHTML = DAYS.map(function (d) {
      var n = countOn(d);
      return '<label class="day"><input type="radio" name="day" value="' + d.id + '"' + (d.id === currentDay ? " checked" : "") +
        ' aria-label="' + d.long + ", " + n + (n === 1 ? " session" : " sessions") + ' planned"><span aria-hidden="true">' + d.short + "<b>" + d.date + "</b><small>" + (n ? n + " on" : "&nbsp;") + "</small></span></label>";
    }).join("");
  }

  function sessionDest(s) {
    if (s.glaze) return "to glaze load";
    if (s.dry) return "Fri bisque";
    return "next bisque";
  }

  function renderSessions() {
    var day = DAYS.filter(function (d) { return d.id === currentDay; })[0];
    $("sessions-legend").textContent = day.long + ": open these sessions";
    $("session-list").innerHTML = day.sessions.map(function (s) {
      var meta = s.time + " · " + s.booked + " of " + s.seats + " booked" + (s.waitlist ? ", " + s.waitlist + " waiting" : "") + (s.note ? " · " + s.note : "");
      var pcs = s.glaze ? "<b>0</b>glaze only" : "<b>~" + s.pcs + " pcs</b>" + sessionDest(s);
      return '<li class="sess"><input type="checkbox" id="s-' + s.id + '" value="' + s.id + '"' + (selected[s.id] ? " checked" : "") +
        ' aria-describedby="m-' + s.id + '"><label class="sess__card" for="s-' + s.id + '"><span class="sess__box">' + CHECK + '</span><span class="sess__name">' + esc(s.name) +
        '</span><span class="sess__meta" id="m-' + s.id + '">' + esc(meta) + '</span><span class="sess__pcs">' + pcs + "</span></label></li>";
    }).join("");
  }

  var lastLoad = null;
  function renderKiln() {
    var add = 0, next = 0;
    allSessions().forEach(function (s) {
      if (!selected[s.id] || s.glaze) return;
      if (s.dry) add += s.pcs; else next += s.pcs;
    });
    var total = ALREADY_LOADED + add;
    var basePct = Math.min(100, ALREADY_LOADED / CAPACITY * 100);
    var addPct = Math.max(0, Math.min(100, total / CAPACITY * 100) - basePct);
    $("meter-base").style.width = basePct + "%";
    $("meter-add").style.width = addPct + "%";
    $("meter").classList.toggle("is-over", total > CAPACITY);
    $("meter").setAttribute("aria-label", "Kiln 2 load: " + total + " of " + CAPACITY + " pieces");
    animateNumber($("load-num"), lastLoad === null ? total : lastLoad, total);
    lastLoad = total;

    var note;
    if (total > CAPACITY) {
      note = '<span class="over">Over by ' + (total - CAPACITY) + " pieces.</span> Kilnward moves the newest open-studio work to Kiln 1&rsquo;s bisque on Sat 31 Oct.";
    } else {
      var room = CAPACITY - total;
      note = '<span class="legend-dot legend-dot--base" aria-hidden="true"></span>' + ALREADY_LOADED + ' already dry &nbsp; <span class="legend-dot legend-dot--add" aria-hidden="true"></span>' + add +
        " from this week. " + (room < 15 ? "<b>Nearly full</b>, room for " + room + "." : "Room for " + room + " more.");
    }
    $("kiln-note").innerHTML = note;
    $("kiln-next").textContent = next
      ? "Thursday onward, ~" + next + " pieces won’t be dry by Friday. They wait for the next bisque, Fri 6 Nov."
      : "Work made Thursday onward won’t be dry by Friday; it waits for the next bisque.";
  }

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function animateNumber(el, from, to) {
    if (reduce || from === to) { el.textContent = to; return; }
    var start = null, dur = 520;
    function step(t) {
      if (!start) start = t;
      var p = Math.min(1, (t - start) / dur);
      var e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var planner = $("planner");
  planner.addEventListener("change", function (e) {
    var t = e.target;
    if (t.name === "day") {
      currentDay = t.value;
      renderSessions();
    } else if (t.type === "checkbox") {
      selected[t.value] = t.checked;
      renderKiln();
      // refresh day counts without stealing focus
      var focusedId = document.activeElement && document.activeElement.id;
      renderDays();
      if (focusedId) { var f = $(focusedId); if (f) f.focus(); }
    }
  });

  renderDays();
  renderSessions();
  renderKiln();

  /* ---------- booking week ---------- */
  function renderWeek(filter) {
    $("week-grid").innerHTML = DAYS.map(function (d) {
      var items = d.sessions.filter(function (s) { return filter === "all" || s.kind === filter; });
      var list = items.length ? "<ul>" + items.map(function (s) {
        var full = s.booked >= s.seats;
        var seats = full ? "Full" + (s.waitlist ? ", " + s.waitlist + " waiting" : "") : (s.seats - s.booked) + " of " + s.seats + " left";
        return '<li class="wk-sess ' + (full ? "is-full" : "is-room") + '"><span class="wk-sess__name">' + esc(s.name) + '</span><span class="wk-sess__line"><span class="wk-sess__time">' + s.time +
          '</span><span class="wk-sess__seats"><span class="seat-mark" aria-hidden="true"></span>' + seats + "</span></span></li>";
      }).join("") + "</ul>" : '<p class="wk-none">Nothing booked</p>';
      return '<div class="wk-day' + (items.length ? "" : " is-empty") + '"><h4>' + d.short + " <span>" + d.date + (d.id === "sun" ? " Nov" : " Oct") + "</span></h4>" + list + "</div>";
    }).join("");
  }
  document.querySelectorAll('input[name="week-filter"]').forEach(function (r) {
    r.addEventListener("change", function () { renderWeek(r.value); });
  });
  renderWeek("all");

  /* ---------- firing schedule ---------- */
  var FIRINGS = [
    { id: "f1", what: "Kiln 1 · Glaze, cone 6", when: "Tue 27 Oct, 07:00 → unload Wed after 15:00", status: "Cooling", firing: false,
      load: [["Pieces", "31, from 12 members"], ["Shelf plan", "Tall vases on top, test tiles on the lowest shelf"], ["Watch for", "Two lidded jars fired lid-on, wadded"]] },
    { id: "f2", what: "Kiln 2 · Bisque, cone 04", when: "Fri 30 Oct, 18:00 → unload Sun 1 Nov, 10:00", status: "Loading", firing: true,
      load: [["Pieces", "92 planned of 120"], ["From", "Wheel basics, slab mugs, Monday open studio"], ["Still drying", "Six bowls on cart B, check Thursday"]] },
    { id: "f3", what: "Kiln 1 · Bisque, cone 04", when: "Sat 31 Oct, 08:00 → unload Mon 2 Nov, 09:00", status: "Planned", firing: false,
      load: [["Pieces", "40 space, 18 claimed"], ["Holds", "Overflow from Kiln 2"], ["Note", "Light load; Kilnward will suggest merging if under 25"]] },
    { id: "f4", what: "Kiln 2 · Glaze, cone 6", when: "Tue 3 Nov, 07:00 → unload Thu 5 Nov", status: "Planned", firing: false,
      load: [["Pieces", "From Glazing night, Wed 28 Oct"], ["Members", "10 booked"], ["Note", "Glazes checked for drips before loading"]] }
  ];
  var CHEV = '<svg class="sched__chev" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  $("sched-list").innerHTML = FIRINGS.map(function (f, i) {
    var open = i === 1;
    return '<li class="sched__item"><button type="button" class="sched__btn" aria-expanded="' + open + '" aria-controls="d-' + f.id + '"><span class="sched__what">' + esc(f.what) +
      '</span><span class="sched__when">' + esc(f.when) + '</span><span class="sched__status' + (f.firing ? " is-firing" : "") + '">' + f.status + "</span>" + CHEV +
      '</button><div class="sched__detail" id="d-' + f.id + '"' + (open ? "" : " hidden") + "><dl>" +
      f.load.map(function (p) { return "<dt>" + esc(p[0]) + "</dt><dd>" + esc(p[1]) + "</dd>"; }).join("") + "</dl></div></li>";
  }).join("");
  $("sched-list").addEventListener("click", function (e) {
    var b = e.target.closest(".sched__btn");
    if (!b) return;
    var open = b.getAttribute("aria-expanded") === "true";
    b.setAttribute("aria-expanded", String(!open));
    $(b.getAttribute("aria-controls")).hidden = open;
  });

  var notify = $("notify");
  notify.addEventListener("click", function () {
    var on = notify.getAttribute("aria-checked") !== "true";
    notify.setAttribute("aria-checked", String(on));
    $("notify-state").textContent = on ? "On" : "Off";
  });

  /* ---------- shelves ---------- */
  var SHELVES = [
    { name: "Priya Nandakumar", shelf: "A3", pcs: 4, stage: "ready", label: "Ready for pickup", since: "since Sun 25 Oct" },
    { name: "Tomás Herrera", shelf: "B1", pcs: 7, stage: "glaze", label: "In glaze firing", since: "Kiln 1, out Wed" },
    { name: "June Okafor", shelf: "A1", pcs: 2, stage: "late", label: "Past pickup", since: "23 days on the shelf" },
    { name: "Dev Malhotra", shelf: "C4", pcs: 5, stage: "bisque", label: "Bisqued, needs glaze", since: "since Thu 22 Oct" },
    { name: "Ilse Brandt", shelf: "B2", pcs: 3, stage: "green", label: "Drying", since: "bisque Fri 30 Oct" },
    { name: "Wren Castellano", shelf: "A2", pcs: 6, stage: "ready", label: "Ready for pickup", since: "since Sat 24 Oct" },
    { name: "Mateo Ruiz", shelf: "C1", pcs: 1, stage: "late", label: "Past pickup", since: "31 days on the shelf" },
    { name: "Sun-hee Park", shelf: "B4", pcs: 8, stage: "green", label: "Drying", since: "bisque Fri 30 Oct" },
    { name: "Agnes Whitlow", shelf: "C2", pcs: 2, stage: "bisque", label: "Bisqued, needs glaze", since: "since Mon 19 Oct" },
    { name: "Callum Reid", shelf: "A4", pcs: 3, stage: "ready", label: "Ready for pickup", since: "since Fri 23 Oct" }
  ];
  var search = $("shelf-search");
  var shelfFilter = "all";
  function renderShelves() {
    var q = search.value.trim().toLowerCase();
    var rows = SHELVES.filter(function (r) {
      if (shelfFilter !== "all" && r.stage !== shelfFilter) return false;
      return !q || r.name.toLowerCase().indexOf(q) > -1 || r.shelf.toLowerCase() === q;
    });
    $("shelf-body").innerHTML = rows.map(function (r) {
      return "<tr><td>" + esc(r.name) + '</td><td class="shelf-id">' + r.shelf + '</td><td class="num">' + r.pcs + '</td><td><span class="stage stage--' + r.stage +
        '"><span class="stage__mark" aria-hidden="true"></span><span>' + r.label + '<span class="stage__since">' + esc(r.since) + "</span></span></span></td></tr>";
    }).join("");
    var empty = $("shelf-empty");
    if (!rows.length) {
      empty.hidden = false;
      empty.textContent = q ? "No member or shelf matches “" + search.value.trim() + "”. Try a first name, or a shelf like B2." : "Nothing in this stage right now.";
    } else { empty.hidden = true; }
    var late = SHELVES.filter(function (r) { return r.stage === "late"; }).length;
    $("shelf-count").textContent = "Showing " + rows.length + " of " + SHELVES.length + " members · " + late + " past pickup";
  }
  search.addEventListener("input", renderShelves);
  document.querySelectorAll('input[name="shelf-filter"]').forEach(function (r) {
    r.addEventListener("change", function () { shelfFilter = r.value; renderShelves(); });
  });
  renderShelves();
})();
