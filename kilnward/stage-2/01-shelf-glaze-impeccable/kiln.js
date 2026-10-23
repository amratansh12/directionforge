/* Kilnward demo: kiln load planner. All data is synthetic sample data. */
(function () {
  "use strict";

  var FIRINGS = {
    bisque: {
      caption: "Kiln 1, Tuesday 16:00 · three shelves, top to bottom",
      title: "Bisque to cone 04",
      shelves: [
        { name: "Top shelf", clearance: 12, pieces: [
          { n: "Cups ×4", h: 8, w: 13, who: "Beginners" },
          { n: "Bowl", h: 9, w: 17, who: "R. Okafor" },
          { n: "Dishes ×3", h: 4, w: 15, who: "P. Nandakumar" }
        ]},
        { name: "Middle shelf", clearance: 18, pieces: [
          { n: "Mugs ×6", h: 11, w: 22, who: "Beginners" },
          { n: "Teapot", h: 15, w: 15, who: "J. Ashworth" },
          { n: "Bowls ×2", h: 9, w: 16, who: "S. Mercer" }
        ]},
        { name: "Bottom shelf", clearance: 28, pieces: [
          { n: "Tall vase", h: 26, w: 11, who: "R. Okafor" },
          { n: "Jug", h: 21, w: 14, who: "M. Lindqvist" },
          { n: "Planters ×2", h: 17, w: 22, who: "M. Lindqvist" }
        ]}
      ],
      segments: [
        ["1", "60 °C / h", "200 °C", "2 h"],
        ["2", "100 °C / h", "600 °C", "none"],
        ["3", "150 °C / h", "1060 °C", "10 min"]
      ],
      notes: [
        ["Starts", "Tue 16:00"],
        ["Ends, roughly", "Wed 04:30"],
        ["Unload", "Thu 09:00, once below 60 °C"],
        ["On unload", "14 members told where their pieces are"]
      ]
    },
    glaze: {
      caption: "Kiln 2, Friday 15:00 · three shelves, top to bottom",
      title: "Glaze to cone 6",
      shelves: [
        { name: "Top shelf", clearance: 10, pieces: [
          { n: "Small bowls ×3", h: 7, w: 20, who: "A. Byrne" },
          { n: "Cups ×4", h: 8, w: 16, who: "J. Ashworth" }
        ]},
        { name: "Middle shelf", clearance: 16, pieces: [
          { n: "Mugs ×6", h: 11, w: 24, who: "Glaze night" },
          { n: "Lidded jar", h: 14, w: 13, who: "S. Mercer" }
        ]},
        { name: "Bottom shelf", clearance: 24, pieces: [
          { n: "Vase", h: 22, w: 12, who: "A. Byrne" },
          { n: "Serving bowl", h: 11, w: 27, who: "R. Okafor" }
        ]}
      ],
      segments: [
        ["1", "110 °C / h", "600 °C", "none"],
        ["2", "220 °C / h", "1180 °C", "none"],
        ["3", "60 °C / h", "1222 °C", "10 min"],
        ["4", "cool 80 °C / h", "1000 °C", "none"]
      ],
      notes: [
        ["Starts", "Fri 15:00"],
        ["Ends, roughly", "Sat 02:30"],
        ["Unload", "Sun, not before 12:00"],
        ["On unload", "9 members told their work is ready"]
      ]
    }
  };

  var shelvesEl = document.getElementById("kiln-shelves");
  var captionEl = document.getElementById("kiln-caption");
  var titleEl = document.getElementById("schedule-title");
  var bodyEl = document.getElementById("schedule-body");
  var notesEl = document.getElementById("schedule-notes");
  var buttons = document.querySelectorAll(".seg-btn");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function render(key, animate) {
    var f = FIRINGS[key];
    captionEl.textContent = f.caption;
    titleEl.textContent = f.title;

    shelvesEl.textContent = "";
    f.shelves.forEach(function (s) {
      var tallest = Math.max.apply(null, s.pieces.map(function (p) { return p.h; }));
      var spare = s.clearance - tallest;

      var row = el("div", "kshelf");
      row.style.setProperty("--clear", s.clearance);

      var head = el("p", "kshelf-head");
      head.appendChild(el("span", "kshelf-name", s.name));
      head.appendChild(el("span", "kshelf-clear", s.clearance + " cm clearance · " + spare + " cm to spare"));
      row.appendChild(head);

      var space = el("div", "kspace");
      space.setAttribute("aria-hidden", "true");
      s.pieces.forEach(function (p, i) {
        var b = el("span", "kpiece");
        b.style.setProperty("--cm", p.h);
        b.style.setProperty("--w", p.w);
        b.style.setProperty("--i", i);
        space.appendChild(b);
      });
      row.appendChild(space);

      var labels = el("ul", "klabels");
      labels.setAttribute("role", "list");
      s.pieces.forEach(function (p) {
        var li = el("li", "klabel");
        li.style.setProperty("--w", p.w);
        li.appendChild(el("span", "kl-n", p.n));
        li.appendChild(el("span", "kl-d", p.h + " cm · " + p.who));
        labels.appendChild(li);
      });
      row.appendChild(labels);
      shelvesEl.appendChild(row);
    });

    bodyEl.textContent = "";
    f.segments.forEach(function (seg) {
      var tr = el("tr");
      seg.forEach(function (c, i) {
        var td = el(i === 0 ? "th" : "td", null, c);
        if (i === 0) td.setAttribute("scope", "row");
        tr.appendChild(td);
      });
      bodyEl.appendChild(tr);
    });

    notesEl.textContent = "";
    f.notes.forEach(function (n) {
      var d = el("div", "sn");
      d.appendChild(el("dt", null, n[0]));
      d.appendChild(el("dd", null, n[1]));
      notesEl.appendChild(d);
    });

    if (animate && !reduce.matches) settle();
  }

  /* The one authored motion: pieces settle onto their shelf. */
  function settle() {
    shelvesEl.classList.remove("is-settling");
    void shelvesEl.offsetWidth;
    shelvesEl.classList.add("is-settling");
  }

  Array.prototype.forEach.call(buttons, function (btn) {
    btn.addEventListener("click", function () {
      Array.prototype.forEach.call(buttons, function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      render(btn.getAttribute("data-firing"), true);
    });
  });

  render("bisque", false);

  if ("IntersectionObserver" in window && !reduce.matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { settle(); io.disconnect(); }
      });
    }, { threshold: 0.4 });
    io.observe(shelvesEl);
  }
})();
