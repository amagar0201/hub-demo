/* Shared pieces for every demo screen: money formatting, one-line transaction rows, account rows,
   the two-level detail pattern (tap a card header: closed <-> open) and swipe rows (nothing is saved). */
window.PAGES = {};
window.UI = (function () {
  var D = window.DEMO;
  var ACCT = {}; D.accounts.forEach(function (a) { ACCT[a.id] = a; });
  var CARD = "#8A5A9E", BANK = "#2F8FB0";

  function cur(n, sign) {
    if (n == null) return "—";
    var s = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (n < 0 ? "−$" : (sign ? "+$" : "$")) + s;
  }
  function cur0(n) { return (n < 0 ? "−$" : "$") + Math.round(Math.abs(n)).toLocaleString("en-US"); }
  function km(v, sign) {
    var a = Math.abs(v), s = a >= 1e6 ? (a / 1e6).toFixed(2) + "M" : a >= 1e4 ? Math.round(a / 1e3) + "k" : a >= 1e3 ? (a / 1e3).toFixed(1) + "k" : Math.round(a);
    return (v < 0 ? "−" : (sign && v > 0 ? "+" : "")) + "$" + s;
  }
  function pct(v) { return (v >= 0 ? "+" : "") + (v * 100).toFixed(1) + "%"; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function md(d) { return MON[d.getMonth()] + " " + ("0" + d.getDate()).slice(-2); }
  function acct(id) { return ACCT[id]; }
  function bankOf(a) { return D.banks[a.bank]; }
  function isCard(a) { return a.type === "card"; }

  // ---- pictures (mirror of the real app's look helpers; the demo has no real logos, so a bank is a coloured letter tile) ----
  var GLYPH = { "Groceries": "cart", "Dining": "fork", "Fuel": "fuel", "Shopping": "bag", "Family": "people", "Education": "cap", "Utilities": "bolt",
    "Mortgage": "house", "HOA": "house", "Subscriptions": "star", "Insurance": "shield", "Phone & internet": "phone", "Health": "heart", "Salary": "pay",
    "Rent": "key", "Interest": "percent", "Car loan": "car", "Line of credit": "swap", "Savings & investing": "nest", "Fees": "receipt", "Transfer": "swap", "Travel": "plane" };
  function caticon(cat, title) {
    var g = GLYPH[cat] || "dots", col = D.cats[cat] || "#8E9490";
    return '<span class="ci" style="--cc:' + col + '" title="' + esc(title || cat || "") + '"><svg aria-hidden="true"><use href="#' + g + '"/></svg></span>';
  }
  function banklogo(key, title) {
    var b = D.banks[key]; if (!b) return "";
    return '<span class="bl blt" style="--bc:' + b.color + '" title="' + esc(title || b.name) + '">' + esc(b.short.slice(0, 2).toUpperCase()) + '</span>';
  }
  function icon(name) { return '<svg aria-hidden="true"><use href="#' + name + '"/></svg>'; }
  // a short readable merchant name: drops reference numbers / store numbers, title-cases shouting text
  function merchant(desc) {
    var s = String(desc || "").replace(/\s*#\s*\d+.*$/, "").replace(/\s*\*\w*\d\w*.*$/, "").replace(/(\s+\S*\d{4,}\S*)+\s*$/, "").trim();
    if (s && s === s.toUpperCase()) s = s.toLowerCase().replace(/(^|\s)(\S)/g, function (m, a, b) { return a + b.toUpperCase(); });
    return s || String(desc || "");
  }

  // one transaction: one line on a computer, two lines on a phone (phone.css) - category picture, merchant, bank logo + card,
  // someone else's name in blue, amount with Pending / date under it, optional running balance
  function txrow(t, showDate, run) {
    var a = ACCT[t.acct], ac = isCard(a) ? CARD : BANK, xfer = t.cat === "Transfer", pos = t.amount > 0 && !xfer, b = bankOf(a);
    var who = t.who && t.who !== "Casey" ? t.who : "";
    return '<a class="frow f1 txr' + (pos ? " fin" : "") + '" href="#/finances/transactions" style="--ac:' + ac + '">' +
      (showDate ? '<span class="fd">' + md(t.date) + '</span>' : "") +
      caticon(t.cat, xfer ? "Transfer" : t.cat) +
      '<span class="fmain"><span class="fdesc" title="' + esc(t.desc) + '">' + (t.pending ? '<span class="fpend">P</span> ' : "") + esc(merchant(t.desc)) + '</span>' +
      '<span class="fsub' + (who ? " who" : "") + '">' + banklogo(a.bank) + '<span>' + b.short + ' ••' + a.end + (who ? " · " + who : "") + '</span></span></span>' +
      '<span class="fcatp" style="--cc:' + (D.cats[t.cat] || "#8A938C") + '">' + (xfer ? "transfer" : t.cat) + '</span>' +
      '<span class="fwho">' + banklogo(a.bank) + '<span class="fwb">' + b.short + '</span> ••' + a.end + '</span>' +
      '<span class="fval"><b class="famt' + (pos ? " pos" : "") + '">' + (t.amount > 0 ? cur(t.amount, true) : cur(-t.amount)) + '</b><small class="fst">' + (t.pending ? "Pending" : md(t.date)) + '</small></span>' +
      (run ? '<span class="frun">' + cur(t.run) + '</span>' : "") + '<span class="fchev">›</span></a>';
  }
  function runhead() { return '<div class="frow f1 fhead"><span class="fdesc"></span><span class="famt">Amount</span><span class="frun">Balance</span><span class="fchev"></span></div>'; }

  // an account row (G3): name · ending, amount; tap opens its latest transactions with running balance
  function acctrow(a, opts) {
    opts = opts || {};
    var b = bankOf(a), rows = D.tx.filter(function (t) { return t.acct === a.id; }).slice(0, 8);
    var small = opts.small || "", state = opts.state || "";
    return '<div class="gacct gpill ' + (opts.alt ? "alt" : "") + ' lv1" style="--tc:' + (opts.color || b.color) + '">' +
      '<div class="grow" role="button" onclick="this.parentNode.classList.toggle(\'gopen\')"><span class="gname"><i></i><span class="gnmain">' + b.name +
      (a.who && opts.who !== false ? ' · <b>' + cap(a.who) + '</b>' : "") + ' · ' + esc(a.name) + ' <em>••' + a.end + '</em></span>' +
      (small ? '<small class="nwperf">' + small + '</small>' : "") + '</span>' +
      '<span class="gamt">' + state + '<b>' + cur(a.bal) + '</b></span><span class="gchev">›</span></div>' +
      '<div class="gtx fcompact">' + (rows.length ? runhead() + rows.map(function (t) { return txrow(t, true, true); }).join("") :
        '<div class="small muted" style="padding:4px 0">Balance only · this account sends no transactions.</div>') +
      (rows.length ? '<a class="small" style="display:block;text-align:right;padding:4px 0" href="#/finances/transactions">All ' + esc(a.name) + ' transactions ›</a>' : "") + '</div></div>';
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function toast(text) {
    var d = document.createElement("div"); d.className = "toast"; d.textContent = text; document.body.appendChild(d);
    requestAnimationFrame(function () { d.classList.add("in"); });
    setTimeout(function () { d.classList.remove("in"); setTimeout(function () { d.remove(); }, 300); }, 2200);
  }

  // detail levels: [data-lvkey] opens / closes on a tap of its .lvhead; every page starts closed
  function levels(root) {
    function set(el, l) { el.dataset.lvl = l; el.classList.remove("lvl0", "lvl2"); el.classList.add("lvl" + l);
      if (el.classList.contains("tile3")) { el.classList.toggle("open", l == 2);          // Cars / Homes tiles
        var box = el.closest(".mobi"); if (box) box.classList.toggle("has-open", !!box.querySelector(".tile3.lvl2")); }
      var m = el.querySelector(".lvdots"); if (m) m.textContent = l == 2 ? "●●" : "○○"; }
    root.querySelectorAll("[data-lvkey]").forEach(function (el) {
      set(el, 0);
      var head = el.querySelector(".lvhead"); if (!head) return;
      head.addEventListener("click", function (e) {
        if (e.target.closest("a[href]")) return;
        e.preventDefault(); e.stopPropagation();
        var l = el.dataset.lvl == 2 ? 0 : 2, g = el.dataset.lvgroup;      // lvgroup: one open at a time
        if (l == 2 && g) root.querySelectorAll('[data-lvgroup="' + g + '"]').forEach(function (x) { if (x !== el && x.dataset.lvl == 2) set(x, 0); });
        set(el, l);
      });
    });
  }

  // swipe rows: drag left to reveal the actions; an action hides the row (demo: nothing is saved)
  function swipes(root) {
    var open = null;
    function set(sw, x) { sw.querySelector(".swrow").style.transform = "translateX(" + x + "px)"; }
    function close(sw) { if (!sw) return; set(sw, 0); sw.classList.remove("isopen"); if (open === sw) open = null; }
    root.querySelectorAll(".swipe").forEach(function (sw) {
      var acts = sw.querySelector(".swacts"), W = acts ? acts.querySelectorAll(".sw").length * 74 : 222;
      var row = sw.querySelector(".swrow"), x0 = 0, y0 = 0, dx = 0, drag = false, axis = null, base = 0, moved = false;
      row.addEventListener("pointerdown", function (e) { x0 = e.clientX; y0 = e.clientY; dx = 0; axis = null; moved = false; drag = true;
        base = sw.classList.contains("isopen") ? -W : 0; if (open && open !== sw) close(open); });
      row.addEventListener("pointermove", function (e) { if (!drag) return; var mx = e.clientX - x0, my = e.clientY - y0;
        if (!axis) { if (Math.abs(mx) < 6 && Math.abs(my) < 6) return; axis = Math.abs(mx) > Math.abs(my) ? "x" : "y";
          if (axis === "x") { sw.classList.add("dragging"); try { row.setPointerCapture(e.pointerId); } catch (_) {} } }
        if (axis !== "x") return; moved = true; dx = Math.max(-W - 40, Math.min(0, base + mx)); set(sw, dx); e.preventDefault(); });
      function end() { if (!drag) return; drag = false; sw.classList.remove("dragging"); if (axis !== "x") return;
        if (dx < -W / 3) { set(sw, -W); sw.classList.add("isopen"); open = sw; } else close(sw); }
      row.addEventListener("pointerup", end); row.addEventListener("pointercancel", end);
      row.addEventListener("click", function (e) { if (moved || sw.classList.contains("isopen")) { e.preventDefault(); e.stopPropagation(); if (!moved) close(sw); } }, true);
      sw.querySelectorAll(".sw").forEach(function (b) { b.addEventListener("click", function (e) {
        e.preventDefault(); close(sw); if (!b.hasAttribute("data-keep")) sw.style.display = "none";
        toast(((b.querySelector("span") || b).textContent || "Done").trim() + " · demo, not saved"); }); });
    });
    document.addEventListener("pointerdown", function (e) { if (open && !open.contains(e.target)) close(open); });
  }

  function enhance(root) { levels(root); swipes(root); }

  return { cur: cur, cur0: cur0, km: km, pct: pct, esc: esc, md: md, acct: acct, bankOf: bankOf, isCard: isCard, txrow: txrow,
           runhead: runhead, caticon: caticon, banklogo: banklogo, merchant: merchant, icon: icon, acctrow: acctrow, toast: toast, enhance: enhance, cap: cap, CARD: CARD, BANK: BANK, MON: MON };
})();
