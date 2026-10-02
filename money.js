/* Money area: Finances (/finances, finances/review|coverage|transactions|payroll), Bills & Subscriptions (bills, bills/gas|electricity|water|hoa),
   Rental Cash Flow (rentcf), HELOC & Car Loan (loans, loans/car). Every figure comes from DEMO or is derived from it here, so
   the same number reads the same on every page. Monthly Budgeting, Daily Budgeting, Credit Cards and Net Worth are other files. */
(function () {
  var D = window.DEMO, U = window.UI, P = window.PAGES;
  var cur = U.cur, cur0 = U.cur0, km = U.km, esc = U.esc;
  function r2(n) { return Math.round(n * 100) / 100; }
  function sum(l, f) { return l.reduce(function (t, x) { return t + f(x); }, 0); }
  function byType(types) { return D.accounts.filter(function (a) { return types.indexOf(a.type) >= 0; }); }
  function head(title, sub, right) { return '<header class="top"><div><h1>' + title + '</h1><div class="sub">' + sub + '</div></div>' + (right || "") + '</header>'; }
  function lvdots() { return ' <span class="lvdots">○○</span>'; }
  var MN = U.MON, TODAY = D.today, CURIDX = 2026 * 12 + 9;            // current month = Oct 2026
  var okc = "background:rgba(46,107,69,.12);border-color:rgba(46,107,69,.35);color:#2E6B45";
  var todo = "background:rgba(199,122,46,.14);border-color:rgba(199,122,46,.45);color:#9A5B1E";
  function off(what) { U.toast("Demo · " + what + " is turned off"); }
  window.mzOff = off;
  function who(t) { var a = U.acct(t.acct); return U.cap(t.who ? t.who.toLowerCase() : (a.who || "casey")); }
  function ymIdx(y, m) { return y * 12 + (m - 1); }
  function mClass(y, m) { var i = ymIdx(y, m); return i > CURIDX ? "zc" : i === CURIDX ? "zp" : i === CURIDX - 1 ? "zy" : "zg"; }
  function undoToast(text, fn) {
    var d = document.createElement("div"); d.className = "toast"; d.innerHTML = esc(text) + ' · <a href="#" style="color:inherit;text-decoration:underline;font-weight:700">Undo</a>'; document.body.appendChild(d);
    requestAnimationFrame(function () { d.classList.add("in"); });
    var kill = function () { d.classList.remove("in"); setTimeout(function () { d.remove(); }, 300); }, tm = setTimeout(kill, 4500);
    d.querySelector("a").addEventListener("click", function (e) { e.preventDefault(); clearTimeout(tm); fn(); kill(); });
  }

  // ---- demo-only styles for the month tables, chips and small blocks of this file (colours = the real app's month-row scheme) ----
  (function () {
    if (document.getElementById("mz-css")) return;
    var s = document.createElement("style"); s.id = "mz-css";
    s.textContent =
      ".mz-tbl{width:100%;border-collapse:separate;border-spacing:0;font-size:13px;font-variant-numeric:tabular-nums}" +
      ".mz-tbl th,.mz-tbl td{padding:7px 6px;text-align:right;white-space:nowrap}.mz-tbl th:first-child,.mz-tbl td:first-child{text-align:left}" +
      ".mz-tbl td{border-bottom:1px solid var(--line)}" +
      ".mz-tbl tr.zg>td{background:#EEEEEA}.mz-tbl tr.zy>td{background:#FFF2CC}.mz-tbl tr.zp>td{background:#FCE4D6;font-weight:600}.mz-tbl tr.zc>td{background:#DDF1F7}" +
      ".mz-tbl tr.mgrp>td{background:#E1E6DF;font-weight:700;cursor:pointer}.mz-tbl tr.mgrp.mgo>td{background:#D6DDD3}" +
      ".mz-tbl tr.mrow{cursor:pointer}.mz-tbl tr.mdet>td{background:var(--card);white-space:normal;text-align:left;padding:8px 12px}" +
      ".mz-tbl tr.mdet,.mz-tbl tr[data-in]{display:none}.mz-tbl tr.mdet.on{display:table-row}.mz-tbl tr[data-in].on{display:table-row}" +
      ".mz-tbl tr.mtot>td{font-weight:700;border-top:2px solid var(--line);background:var(--card)}" +
      ".mz-tbl .chv{display:inline-block;width:12px;color:var(--muted);transition:transform .15s}.mz-tbl tr.mgo .chv,.mz-tbl tr.mrow.mro .chv{transform:rotate(90deg)}" +
      ".mz-wf td:first-child{white-space:normal}.mz-tbl small{color:var(--muted);font-weight:400}.mz-neg{color:#B3261E}.mz-pos{color:#2E8B57}" +
      "@media (prefers-color-scheme:dark){.mz-tbl tr.zg>td{background:#2A2F2C}.mz-tbl tr.zy>td{background:#4A4326}.mz-tbl tr.zp>td{background:#54382B}.mz-tbl tr.zc>td{background:#23424B}" +
      ".mz-tbl tr.mgrp>td{background:#313833}.mz-tbl tr.mgrp.mgo>td{background:#3A433D}.mz-neg{color:#F2A09A}.mz-pos{color:#6FD39A}}" +
      ".mz-dl{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:4px 16px;font-size:13px}.mz-dl div{display:flex;justify-content:space-between;gap:8px;border-bottom:1px dotted var(--line);padding:2px 0}" +
      ".mz-dl span{color:var(--muted)}.mz-dl b{font-variant-numeric:tabular-nums}" +
      ".mz-chip{display:inline-block;border:1.5px solid;border-radius:8px;padding:0 6px;font-size:12px;font-weight:600;margin-right:4px}.mz-chip.plan{border-style:dashed;opacity:.85}" +
      ".mz-sel{position:sticky;z-index:5;background:var(--bg);padding:6px 0;margin:0 -2px}" +
      ".mz-bars{display:flex;gap:6px;align-items:flex-end;height:104px;margin-top:10px}.mz-bars>div{flex:1;min-width:0;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center}" +
      ".mz-bars .pr{display:flex;align-items:flex-end;gap:2px;width:100%;height:84px;justify-content:center}.mz-bars .pr i{display:block;width:42%;max-width:15px;border-radius:4px 4px 1px 1px}" +
      ".mz-bars small{font-size:10.5px;color:var(--muted);margin-top:3px}" +
      ".mz-ch{position:relative;height:190px;margin:10px 0 0 38px}.mz-ch .gl{position:absolute;left:0;right:0;border-top:1px solid var(--line)}.mz-ch .gl span{position:absolute;left:-38px;top:-8px;width:34px;text-align:right;font-size:10.5px;color:var(--muted)}" +
      ".mz-ch .gl.ty{border-top:2px dashed #C98A1B}.mz-ch .gl.ty span{color:#9A6A10;font-weight:700}" +
      ".mz-ch .col{position:absolute;top:0;bottom:0;display:flex;justify-content:center}.mz-ch .bx{position:absolute;width:56%;max-width:46px;border-radius:5px 5px 1px 1px}.mz-ch .bx.pl{outline:1.5px dashed currentColor;outline-offset:-1.5px;opacity:.7}" +
      ".mz-ch .lb{position:absolute;font-size:10.5px;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap;transform:translateX(-50%);left:50%}" +
      ".mz-ax{display:flex;margin:4px 0 0 38px}.mz-ax div{flex:1;text-align:center;font-size:11px;min-width:0}.mz-ax small{display:block;color:var(--muted);font-size:10.5px}" +
      ".mz-rv{border-top:1px solid var(--line);padding:10px 0}.mz-rv:first-of-type{border-top:0}.mz-why{font-size:13px;color:var(--muted);margin:4px 0 6px}.mz-why b{color:var(--text)}" +
      ".mz-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}" +
      ".mz-cov{display:flex;gap:2px;height:14px;margin:6px 0}.mz-cov i{flex:1;border-radius:3px;background:var(--line)}.mz-cov i.f{background:#2F8FB0}.mz-cov i.s{background:#2E8B57}.mz-cov i.g{background:#E0A63A}" +
      ".mz-drop{border:2px dashed var(--line);border-radius:12px;padding:14px;text-align:center;font-size:13px;color:var(--muted);margin-top:6px}" +
      ".mz-note{background:color-mix(in srgb,#C98A1B 12%,transparent);border:1px solid color-mix(in srgb,#C98A1B 40%,transparent);border-radius:10px;padding:8px 10px;font-size:13px;margin:8px 0}" +
      "@media (max-width:600px){.mz-tbl .phx{display:none}.mz-tbl{font-size:12px}.mz-tbl th,.mz-tbl td{padding:7px 4px}.mz-tbl th:first-child,.mz-tbl td:first-child{padding-left:2px}.mz-tbl .chv{width:9px}.mz-ch{margin-left:34px}.mz-ax{margin-left:34px}}";
    document.head.appendChild(s);
  })();

  // shared behaviour of every month table: tap a year row = open / close its months, tap a month = its lines; pinned header offsets; open on the current month
  function mzInit(box, opts) {
    opts = opts || {};
    function pin() {
      var strip = document.querySelector("nav.strip"), h = strip ? strip.getBoundingClientRect().bottom : 0, sel = box.querySelector(".mz-sel");
      if (sel) { sel.style.top = Math.max(0, h) + "px"; h += sel.offsetHeight; }
      box.style.setProperty("--hub-th-top", Math.max(0, h) + "px");
    }
    pin(); window.addEventListener("resize", pin);
    box.addEventListener("click", function (e) {
      var g = e.target.closest("tr.mgrp"), r = e.target.closest("tr.mrow"), x = e.target.closest("[data-expand]");
      if (x) { e.preventDefault(); var all = x.dataset.open !== "1"; x.dataset.open = all ? "1" : "0"; x.textContent = all ? "Collapse all" : "Expand all";
        box.querySelectorAll("tr.mgrp").forEach(function (t) { setGroup(t, all); }); return; }
      if (g) { setGroup(g, !g.classList.contains("mgo")); return; }
      if (r && !e.target.closest("a")) { var d = r.nextElementSibling; if (d && d.classList.contains("mdet")) { d.classList.toggle("on"); r.classList.toggle("mro"); } }
    });
    function setGroup(t, open) {
      t.classList.toggle("mgo", open);
      box.querySelectorAll('tr[data-in="' + t.dataset.g + '"]').forEach(function (m) { m.classList.toggle("on", open);
        if (!open) { var d = m.nextElementSibling; if (d && d.classList.contains("mdet")) { d.classList.remove("on"); m.classList.remove("mro"); } } });
    }
    box.querySelectorAll("tr.mgrp[data-start]").forEach(function (t) { setGroup(t, true); });
    if (opts.scroll !== false) setTimeout(function () { var c = box.querySelector("tr.mz-cur"); if (c) { var y = c.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.45; window.scrollTo(0, Math.max(0, y)); } }, 90);
  }
  function fmt0(v) { return '<span class="' + (v < -0.5 ? "mz-neg" : "") + '">' + cur0(v) + '</span>'; }

  // ================= Finances · Overview =================
  function section(key, title, color, list, sub) {
    var tot = sum(list, function (a) { return a.bal; });
    return '<div class="card g3d fgroup lvbox" style="--tc:' + color + '" data-lvkey="fin:' + key + '"><div class="ghead lvhead"><span>' + title + lvdots() + '</span><b>' + cur(tot) + '</b></div>' +
      '<div class="gsub lv1">' + (sub || list.length + " account" + (list.length !== 1 ? "s" : "")) + '</div>' +
      list.slice().sort(function (a, b) { return b.bal - a.bal; }).map(function (a, i) { return U.acctrow(a, { alt: i % 2 === 1 }); }).join("") + '</div>';
  }
  P.finances = { html: function () {
    var cards = byType(["card"]), latest = D.tx.filter(function (t) { return t.acct !== "a2"; }).slice(0, 40);
    var h = head("Finances", "Thursday, Oct 1", '<button class="btn" onclick="UI.toast(\'Demo · banks refresh once a day\')">↻ Refresh</button>');
    h += '<div class="row" style="gap:8px;flex-wrap:wrap;margin:0 0 8px"><a class="btn" style="' + todo + '" href="#/finances/coverage">History · 1 gap</a>' +
      '<a class="btn" style="' + todo + '" href="#/finances/review">To review · 3</a>' +
      '<a class="btn" style="background:rgba(179,38,30,.12);border-color:rgba(179,38,30,.4);color:#B3261E" href="#/bills">⚠ ' + D.alerts.length + ' need attention ›</a>' +
      '<a class="btn" href="#/finances" onclick="mzOff(\'adding\');return false">＋ Add transaction</a></div>';
    h += '<div class="card g3d fin3d fcompact lvbox" id="flatest" style="--tc:#2F8FB0" data-lvkey="fin:latest"><div class="row between lvhead" style="cursor:pointer"><b style="font-size:17px">Latest' + lvdots() + '</b><a class="small" href="#/finances/transactions">All ›</a></div>' +
      '<div class="fchips lv1" id="fwho">' + ["All", "Casey", "Morgan", "Ellis"].map(function (p) { return '<a class="fchip' + (p === "All" ? " on" : "") + '" data-p="' + p + '" href="#">' + p + '</a>'; }).join("") + '</div>' +
      '<div id="flist">' + latest.map(function (t, i) { return '<div class="' + (i < 5 ? "lv1" : "lv2") + '" data-p="' + who(t) + '">' + U.txrow(t, true) + '</div>'; }).join("") +
      '<div class="small muted" id="fnone" style="display:none;padding:6px 2px">Nothing recent for this person: Ellis has no accounts of their own that send transactions (the 529 is a balance only).</div></div></div>';
    h += '<div class="card g3d fgroup lvbox" style="--tc:#8A5A9E" data-lvkey="fin:cards"><div class="ghead lvhead"><span>Credit cards' + lvdots() + '</span><b>' + cur(-D.totals.cardDebt) + '</b></div>' +
      '<div class="gsub lv1">' + cards.length + ' cards · <b>1 due within 10 days</b> · tap a card for its transactions</div>' +
      cards.map(function (a, i) { var soon = a.due === "Oct 9", pay = D.tx.filter(function (t) { return t.acct === a.id && t.desc === "Payment received"; })[0];
        return U.acctrow(a, { alt: i % 2 === 1, state: '<small class="cst ' + (soon ? "due" : "ok") + '">' + (soon ? "due " + a.due : "due " + a.due + " · paid up to Sep") + '</small>',
          small: pay ? "last payment " + cur(pay.amount) + " · " + U.md(pay.date) : "" }); }).join("") + '</div>';
    var cash = byType(["checking", "savings"]);
    h += section("cash", "Savings & Checking", "#2F6FD0", cash, cash.length + " accounts · " + cur(sum(cash, function (a) { return a.bal; })));
    h += section("re", "Real Estate Investment", "#C2410C", byType(["rental"]), "1 rental LLC account · Juniper");
    return h + '<p class="small muted">Live from bank connections, updated in the daily run. Transfers and card payments are not counted as spending. Brokerage, retirement, HSA and 529 balances are in Net Worth.</p>';
  }, init: function (root) {
    var chips = root.querySelector("#fwho"); if (!chips) return;
    chips.addEventListener("click", function (e) { var c = e.target.closest(".fchip"); if (!c) return; e.preventDefault(); e.stopPropagation();
      var p = c.dataset.p, n = 0;
      root.querySelectorAll("#flist>div[data-p]").forEach(function (r) { r.classList.remove("lv1", "lv2", "fx"); r.style.display = "";
        if (p !== "All" && r.dataset.p !== p) { r.style.display = "none"; return; } r.classList.add(n < 5 ? "lv1" : "lv2"); n++; });
      var none = root.querySelector("#fnone"); none.style.display = n ? "none" : "block"; none.className = "small muted " + (n ? "" : "lv1");
      chips.querySelectorAll(".fchip").forEach(function (x) { x.classList.toggle("on", x === c); }); });
  } };

  // ================= Finances · To review =================
  function findTx(desc, cat) { return D.tx.filter(function (t) { return t.desc === desc && t.amount < 0; })[0] || D.tx.filter(function (t) { return t.cat === cat && t.amount < 0; })[0]; }
  P["finances/review"] = { html: function () {
    var items = [
      { t: findTx("Big Basket Wholesale", "Groceries"), sug: "Groceries", icon: "🛒", why: "Mixed store (groceries, household, fuel). Your own filings at this store for amounts like this are <b>Groceries 31 of 33 times</b>.",
        what: "A warehouse club that sells food, household goods and fuel." },
      { t: findTx("Skate Park Pass", "Family"), sug: "Family", icon: "🆕", why: "New merchant. Corner Cinema, on the same card and filed the same way, is <b>Family</b>; its words ('park', 'pass') match recreation.",
        what: "A public skate park season pass, paid by Morgan's card." },
      { t: findTx("Online Market", "Shopping"), sug: "Shopping", icon: "✉", why: "The order email lists one kind of product (home goods). A shipment email can name the kind, never the item, so this is a suggestion only.",
        what: "A general online store; the email sets the category, not the store name." }
    ];
    var h = head("To review", "3 transactions the app could not file with enough certainty");
    h += '<div class="card g3d" style="--tc:#C77A2E"><div class="row between"><b style="font-size:17px">Needs a decision</b><span class="small muted">last resort · the app tries your own history first</span></div><div id="mzrv">' +
      items.map(function (x, i) { var t = x.t;
        return '<div class="mz-rv" data-i="' + i + '">' + U.txrow(t, true) +
          '<div class="mz-why"><b>' + esc(U.merchant(t.desc)) + '</b> is: ' + x.what + '</div>' +
          '<div class="mz-why">' + x.icon + ' ' + x.why + '</div>' +
          '<div class="mz-btns"><button class="btn primary" data-a="ok" data-c="' + x.sug + '">✓ File as ' + x.sug + '</button><button class="btn" data-a="other">Other category…</button>' +
          '<button class="btn" data-a="sub">Sub-category</button></div></div>'; }).join("") + '</div></div>';
    h += '<div class="card"><b>Filed for you this week</b><div class="small muted" style="margin-top:4px">3 transactions went to the categories your history uses, nothing to decide (audited, with Undo in <a href="#/tasks/done">Done for you</a>): Pine Mutual Auto → Insurance, Hummingbird Wireless → Phone &amp; internet, Interest → Interest.</div></div>';
    return h + '<p class="small muted">Accepting teaches the rule for this merchant; a one-off does not. Nothing here changes in the demo.</p>';
  }, init: function (root) {
    root.addEventListener("click", function (e) { var b = e.target.closest("button[data-a]"); if (!b) return; var row = b.closest(".mz-rv");
      if (b.dataset.a === "ok") { row.style.display = "none"; undoToast("Filed as " + b.dataset.c + " (demo, not saved)", function () { row.style.display = ""; }); }
      else off(b.dataset.a === "sub" ? "choosing a sub-category" : "choosing another category"); });
  } };

  // ================= Finances · All transactions =================
  var F = { period: "last", type: "", bank: "", who: "", cats: [] };
  P["finances/transactions"] = { html: function () {
    var T0 = { today: new Date(2026, 9, 1), month: new Date(2026, 9, 1), last: new Date(2026, 8, 1), all: new Date(2026, 7, 1) }[F.period], T1 = F.period === "last" ? new Date(2026, 8, 30, 23) : new Date(2026, 9, 1, 23);
    var label = { today: "Today · Oct 1", month: "This month · Oct 1", last: "Sep 1 – Sep 30, 2026", all: "Aug 1 – Oct 1, 2026" }[F.period];
    var rows = D.tx.filter(function (t) { var a = U.acct(t.acct);
      return t.date >= T0 && t.date <= T1 && (!F.type || (F.type === "card") === U.isCard(a)) && (!F.bank || a.bank === F.bank) && (!F.who || who(t) === F.who); });
    var catTot = {};
    rows.forEach(function (t) { if (t.cat !== "Transfer" && t.amount < 0) catTot[t.cat] = (catTot[t.cat] || 0) - t.amount; });
    if (F.cats.length) rows = rows.filter(function (t) { return F.cats.indexOf(t.cat) >= 0; });
    var spent = sum(rows.filter(function (t) { return t.amount < 0 && t.cat !== "Transfer"; }), function (t) { return -t.amount; });
    var income = sum(rows.filter(function (t) { return t.amount > 0 && t.cat !== "Transfer"; }), function (t) { return t.amount; });
    var h = head("All transactions", rows.length + " transactions · " + label);
    function chip(kind, v, text, on, style) { return '<a class="fchip' + (style ? " ftype" : "") + (on ? " on" : "") + '" data-k="' + kind + '" data-v="' + v + '" href="#"' + (style ? ' style="--ac:' + style + '"' : "") + '>' + text + '</a>'; }
    h += '<div class="ffil"><div class="fchips">' + [["today", "Today"], ["month", "This month"], ["last", "Last month"], ["all", "Aug – now"]].map(function (p) { return chip("period", p[0], p[1], F.period === p[0]); }).join("") + '</div>' +
      '<div class="fchips">' + chip("type", "", "All accounts", !F.type) + chip("type", "card", "💳 Cards", F.type === "card", U.CARD) + chip("type", "bank", "🏦 Bank", F.type === "bank", U.BANK) +
      ["Casey", "Morgan"].map(function (p) { return chip("who", p, p, F.who === p); }).join("") + '</div>' +
      '<div class="fchips wrap">' + chip("bank", "", "All banks", !F.bank) + ["LCU", "TWB", "QC"].map(function (k) { return chip("bank", k, D.banks[k].short, F.bank === k, D.banks[k].color); }).join("") + '</div></div>';
    var byday = {}; rows.forEach(function (t) { if (t.amount < 0 && t.cat !== "Transfer") { var k = t.date.toDateString(); byday[k] = (byday[k] || 0) - t.amount; } });
    var days = []; for (var d = new Date(T0); d <= T1; d.setDate(d.getDate() + 1)) days.push(byday[d.toDateString()] || 0);
    var mx = Math.max.apply(null, days.concat([1])), cats = Object.keys(catTot).sort(function (a, b) { return catTot[b] - catTot[a]; }), ctot = sum(cats, function (c) { return catTot[c]; });
    h += '<div class="card"><div class="row between"><span><span class="small muted">Spent</span><br><b style="font-size:22px">' + cur(spent) + '</b></span>' +
      '<span style="text-align:right"><span class="small muted">Income</span><br><b class="pos" style="font-size:22px">' + cur(income) + '</b></span></div>' +
      (days.length > 1 ? '<div class="fchart">' + days.map(function (v) { return '<a><i style="height:' + Math.round(v / mx * 100) + '%"></i></a>'; }).join("") + '</div>' : "") +
      (ctot ? '<div class="fmix">' + cats.map(function (c) { return '<a style="flex:' + catTot[c] + ';background:' + D.cats[c] + '"></a>'; }).join("") + '</div>' : "") +
      '<div class="fchips wrap" style="margin-top:8px">' + cats.map(function (c) { return '<a class="fchip fcatc' + (F.cats.indexOf(c) >= 0 ? " on" : "") + '" data-k="cat" data-v="' + c + '" style="--cc:' + D.cats[c] + '" href="#"><i></i>' + c + ' <span>' + km(catTot[c]) + '</span></a>'; }).join("") +
      (F.cats.length ? '<a class="fchip" data-k="cat" data-v="" href="#">✕ clear</a>' : "") + '</div></div>';
    var groups = [], last = null;
    rows.forEach(function (t) { var k = t.date.toDateString(); if (k !== last) { groups.push({ d: t.date, rows: [] }); last = k; } groups[groups.length - 1].rows.push(t); });
    h += groups.map(function (g, i) { var sp = sum(g.rows.filter(function (t) { return t.amount < 0 && t.cat !== "Transfer"; }), function (t) { return -t.amount; });
      var diff = Math.round((TODAY - g.d) / 864e5);
      return '<div class="fday"><b>' + (diff === 0 ? "Today" : diff === 1 ? "Yesterday" : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][g.d.getDay()] + ", " + U.md(g.d)) + '</b><span class="small muted">' + (sp ? cur(sp) : "") + '</span></div>' +
        '<div class="card flist">' + (i === 0 ? U.runhead() : "") + g.rows.map(function (t) { return U.txrow(t, false, true); }).join("") + '</div>'; }).join("") ||
      '<div class="card muted">Nothing matches these filters.</div>';
    return h + '<div class="small muted" style="margin-top:8px"><span class="fkey" style="--ac:' + U.CARD + '"></span> credit card · <span class="fkey" style="--ac:' + U.BANK + '"></span> bank account · the balance is that account\'s balance after the line</div>';
  }, init: function (root, again) {
    root.addEventListener("click", function (e) { var c = e.target.closest(".fchip[data-k]"); if (!c) return; e.preventDefault();
      var k = c.dataset.k, v = c.dataset.v;
      if (k === "cat") { if (!v) F.cats = []; else { var i = F.cats.indexOf(v); if (i >= 0) F.cats.splice(i, 1); else F.cats.push(v); } }
      else F[k] = (k === "who" && F.who === v) ? "" : v;
      again(); });
  } };

  // ================= Finances · History coverage =================
  // Jan 2022 -> Sep 2026 (57 months). f = bank feed, s = statements, g = gap, "" = before the account existed
  var COV = [
    { id: "a1", from: [2022, 1], feed: [2023, 3] }, { id: "a2", from: [2022, 1], feed: [2023, 3] },
    { id: "a3", from: [2022, 1], feed: [2024, 6], gap: [2023, 12], gapText: "Dec 1 – Dec 31, 2023" },
    { id: "a4", from: [2022, 4], feed: [2023, 3] }, { id: "a5", from: [2023, 1], feed: [2023, 3] }, { id: "a6", from: [2022, 1], feed: [2024, 6] }
  ];
  P["finances/coverage"] = { html: function () {
    var h = head("History coverage", "Every account's history, month by month · Jan 2022 – Sep 2026");
    var ok = COV.filter(function (c) { return !c.gap; }).length;
    h += '<div class="card g3d" style="--tc:#2F5BD3"><div class="row between"><b style="font-size:17px">' + ok + ' of ' + COV.length + ' accounts complete</b><span class="small muted">1 gap · statements fill it</span></div>' +
      '<div class="small muted" style="margin-top:4px">Bank connections send recent history; older months come from statements you drop here. Only rows inside a missing range are imported; a processed statement\'s whole period counts as covered.</div>' +
      '<div class="small" style="margin:6px 0 0"><span class="mz-cov" style="display:inline-flex;width:150px;vertical-align:middle"><i class="f"></i><i class="s"></i><i class="g"></i></span> &nbsp;bank feed · statement · missing</div></div>';
    ["LCU", "TWB", "QC"].forEach(function (bk) {
      var list = COV.filter(function (c) { return U.acct(c.id).bank === bk; }); if (!list.length) return;
      h += '<div class="card g3d fgroup lvbox" style="--tc:' + D.banks[bk].color + '" data-lvkey="cov:' + bk + '"><div class="ghead lvhead"><span>' + D.banks[bk].name + lvdots() + '</span><span class="small">' + (list.some(function (c) { return c.gap; }) ? '<b style="color:#B7791F">1 gap</b>' : '<b class="pos">✓ complete</b>') + '</span></div>';
      list.forEach(function (c) { var a = U.acct(c.id), cells = [], i0 = ymIdx(2022, 1), n = 57;
        for (var k = 0; k < n; k++) { var idx = i0 + k, cls = "";
          if (idx >= ymIdx(c.from[0], c.from[1])) cls = idx >= ymIdx(c.feed[0], c.feed[1]) ? "f" : "s";
          if (c.gap && idx === ymIdx(c.gap[0], c.gap[1])) cls = "g"; cells.push('<i class="' + cls + '" title="' + MN[idx % 12] + " " + Math.floor(idx / 12) + '"></i>'); }
        h += '<div class="lv1" style="padding:8px 0;border-top:1px solid var(--line)"><div class="row between"><span><b>' + esc(a.name) + '</b> <em class="muted">••' + a.end + '</em></span>' +
          (c.gap ? '<span class="fwhy hot">1 gap</span>' : '<span class="fwhy rh-quarterly">✓ complete</span>') + '</div>' +
          '<div class="mz-cov">' + cells.join("") + '</div>' +
          '<div class="small muted">' + (c.from[1] === 1 ? "Jan" : MN[c.from[1] - 1]) + ' ' + c.from[0] + ' → today · feed since ' + MN[c.feed[1] - 1] + ' ' + c.feed[0] +
          ' · balance check: bank ' + cur(a.bal) + ' · app ' + (c.gap ? "waits for the gap" : cur(a.bal) + ' <b class="pos">✓</b>') + '</div>' +
          (c.gap ? '<div class="mz-note"><b>Missing ' + c.gapText + '</b>: no statement covers it, so the balance check cannot finish.<div class="mz-drop">Drop a Tidewater ••' + a.end + ' statement for December 2023 here' +
            '<div class="mz-btns" style="justify-content:center"><button class="btn" onclick="mzOff(\'uploading a statement\')">Choose file…</button><button class="btn primary" onclick="mzOff(\'processing\')">Process</button></div></div></div>' : "") + '</div>'; });
      h += '</div>'; });
    h += '<div class="card"><b>Balance-only accounts</b><div class="small muted" style="margin-top:4px">Orchard Invest sends balances, not transactions (brokerage, 401(k), 403(b), HSA, 529): nothing to cover. Statements are never filed to your folders; the app keeps its own copy.</div></div>';
    return h;
  } };

  // ================= Finances · Year-end payroll =================
  // W-2 figures 2025: invented, built so that box 1 (both) = 171,340 and federal tax (both) = 19,880 as on Tax & Audit
  var W2 = [
    { who: "Casey", emp: "Ferncliff Studio", dep: 80407.60, b1: 101000, b2: 9700, b3: 109800, b4: 6807.60, b5: 109800, b6: 1592.10, b12: [["D", "401(k) deferral", 8800], ["W", "HSA, through payroll", 1800]], b17: 2400, other: 92.70, match: 4400, matchAcct: "401(k) ••0583" },
    { who: "Morgan", emp: "Marlowe Health", dep: 52207.20, b1: 70340, b2: 10180, b3: 75940, b4: 4708.28, b5: 75940, b6: 1101.13, b12: [["E", "403(b) deferral", 5600]], b17: 2050, other: 93.39, match: 2900, matchAcct: "403(b) ••0590" }
  ];
  P["finances/payroll"] = { html: function () {
    var h = head("Year-end payroll", "W-2 2025 against your log · Casey and Morgan", '<button class="btn" onclick="mzOff(\'dropping a W-2\')">＋ Drop a W-2</button>');
    h += '<div class="card g3d" style="--tc:#2F5BD3"><div class="row between"><b style="font-size:17px">2025 ties out ✓</b><span class="small muted">read from Income Tax / 2025 · nothing stored but the box amounts</span></div>' +
      '<div class="lk3" style="margin-top:6px"><div><span>Wages · box 1</span><b>' + cur0(sum(W2, function (w) { return w.b1; })) + '</b></div><div><span>Federal tax · box 2</span><b>' + cur0(sum(W2, function (w) { return w.b2; })) + '</b></div><div><span>Paychecks deposited</span><b>' + cur0(sum(W2, function (w) { return w.dep; })) + '</b></div></div>' +
      '<div class="small muted" style="margin-top:6px">Same wages and withheld tax as the filed return on Tax &amp; Audit › Filed. Task "Year-end payroll" starts Jan 10 and closes itself once both are filed.</div></div>';
    W2.forEach(function (w, wi) {
      var ded = [["Federal income tax · box 2", w.b2], ["State income tax · box 17", w.b17], ["Social Security tax · box 4", w.b4], ["Medicare tax · box 6", w.b6]];
      w.b12.forEach(function (c) { ded.push([c[1] + " · 12 " + c[0], c[2]]); }); ded.push(["Post-tax deductions (life, disability)", w.other]);
      var wExtra = sum(w.b12.filter(function (c) { return c[0] === "W"; }), function (c) { return c[2]; }), gross = r2(w.b5 + wExtra - w.dep), dsum = r2(sum(ded, function (d) { return d[1]; }));
      var d12 = sum(w.b12.filter(function (c) { return c[0] !== "W"; }), function (c) { return c[2]; });
      h += '<div class="card g3d lvbox" style="--tc:' + (wi ? "#1E7F74" : "#3B6EA5") + '" data-lvkey="pay:' + w.who + '"><div class="row between lvhead"><b style="font-size:17px">' + w.who + ' · ' + w.emp + lvdots() + '</b><span class="small pos"><b>✓ ties</b></span></div>' +
        '<div class="lv1"><table class="mz-tbl mz-wf" style="margin-top:6px"><thead><tr><th>W-2 box</th><th>W-2</th><th>Your log</th><th class="phx"></th></tr></thead><tbody>' +
        [["1 · Wages", w.b1], ["3 · Social Security wages", w.b3], ["5 · Medicare wages", w.b5]].map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + cur(r[1]) + '</td><td>' + cur(r[1]) + '</td><td class="phx"><span class="fwhy rh-quarterly">in your log</span></td></tr>'; }).join("") +
        ded.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + cur(r[1]) + '</td><td>' + cur(r[1]) + '</td><td class="phx"><span class="fwhy rh-quarterly">in your log</span></td></tr>'; }).join("") +
        '<tr><td>Company match · ' + w.matchAcct + '</td><td><small>not in the W-2</small></td><td>' + cur(w.match) + '</td><td class="phx"><span class="fwhy rh-monthly">from the account</span></td></tr></tbody></table>' +
        '<div class="mz-note" style="margin-top:8px"><b>Tie-out.</b> Box 1 ' + cur(w.b1) + ' = paychecks ' + cur(w.dep) + ' + taxes and post-tax deductions ' + cur(r2(w.b2 + w.b17 + w.b4 + w.b6 + w.other)) + ' <b class="pos">✓</b>. Box 5 ' + cur(w.b5) + ' − box 1 = the ' + cur(d12) + ' deferral. ' +
        'The log\'s Dec 31 "salary adjustment" ' + cur(gross) + ' = every deduction above ' + cur(dsum) + ' <b class="pos">✓ the year nets to the deposits</b>.</div>' +
        '<div class="mz-btns"><button class="btn" onclick="mzOff(\'filing\')">✓ File (nothing to file · already in your log)</button></div></div></div>';
    });
    return h + '<p class="small muted">Rows follow the log\'s Dec 31 convention (gross-up, then each tax and deduction), one set per person. A category your log already holds for that person and year is never filed twice.</p>';
  } };

  // ================= Bills & Subscriptions (Radar) =================
  var UD = D.utilityData;
  function umon(kind, hk) { return UD[kind].homes.filter(function (h) { return h.key === hk; })[0].months; }
  var BILL_STATS = (function () {
    function st(arr) { var v = arr.map(function (m) { return m.cost; }); return { avg: sum(v, function (x) { return x; }) / 12, min: Math.min.apply(null, v), max: Math.max.apply(null, v) }; }
    var o = { "Lakeside Power": st(umon("electricity", "willow")), "Valley Gas Co": st(umon("gas", "willow")), "Metro Water": st(umon("water", "willow")), "Juniper water & sewer": st(umon("water", "juniper")),
      "Willow HOA": st(umon("hoa", "willow")), "Pine Mutual Auto": { avg: 128, min: 128, max: 128 }, "Hummingbird Wireless": { avg: 112, min: 112, max: 112 },
      "StreamBox": { avg: (11.99 * 9 + 12.99 * 3) / 12, min: 11.99, max: 12.99 }, "Pulse Music": { avg: 10.99, min: 10.99, max: 10.99 }, "CloudVault": { avg: 2.99, min: 2.99, max: 2.99 },
      "Trailhead Gym": { avg: 45, min: 45, max: 45 }, "PhotoKit": { avg: 119 / 12, min: 119, max: 119 } };
    return o; })();
  function subline(s, kind) {
    var a = U.acct(s.acct), b = U.bankOf(a), RH = { monthly: "Monthly", yearly: "Yearly" }, st = BILL_STATS[s.name];
    return '<div class="swipe lv1" data-k="' + (s.rental ? "rental" : "own") + '"><form class="swacts"><button class="sw done" data-keep>✓<span>Keep</span></button><button class="sw defer">⏹<span>Cancelled</span></button><button class="sw cancel">✕<span>Not a ' + (kind === "bills" ? "bill" : "sub") + '</span></button></form>' +
      '<div class="uline swrow"><span class="ultext"><b>' + esc(s.name) + '</b><span><span class="fwhy rh-' + s.rhythm + '">' + RH[s.rhythm] + '</span>' + b.short + ' ••' + a.end + (s.who ? " · " + s.who : "") + ' · 12-mo avg ' + cur(st.avg) + (st.min !== st.max ? " · " + cur0(st.min) + "–" + cur0(st.max) : "") + '</span></span>' +
      '<span class="ulwhen"><b>' + (s.varies ? "~" : "") + cur(s.amount) + '</b><span>next ' + s.next + '</span></span></div></div>';
  }
  P.bills = { html: function () {
    var n = D.alerts.length;
    var h = head("Bills & Subscriptions", "Needs attention · subscriptions · bills · spending patterns");
    h += '<div class="card g3d furgent lvbox hasover" style="--tc:#B3261E" data-lvkey="rad:attention"><div class="row between lvhead" style="cursor:pointer"><span class="row" style="gap:10px"><span style="font-size:22px">⚠</span><span><b style="font-size:17px">Needs attention</b>' +
      '<span class="small muted" style="display:block">' + n + ' items · 1 duplicate · 1 price change · 1 new fee</span></span></span><span class="row" style="gap:8px"><b style="font-size:26px">' + n + '</b><span class="lvdots">○○</span></span></div>' +
      D.alerts.map(function (r) { var a = U.acct(r.acct);
        return '<div class="swipe lv1"><form class="swacts"><button class="sw done">✓<span>Seen</span></button><button class="sw defer">👍<span>Not an issue</span></button></form>' +
          '<div class="uline swrow ' + (r.hot ? "overdue" : "soon") + '"><span class="ultext"><b>' + esc(r.name) + '</b><span><span class="fwhy' + (r.hot ? " hot" : "") + '">' + r.why + '</span> ' + U.bankOf(a).short + ' ••' + a.end + '</span></span>' +
          '<span class="ulwhen"><b>' + cur(-r.amount) + '</b><span>' + r.date + '</span></span></div></div>'; }).join("") +
      '<div class="swhint lv1">← Swipe left: Seen · Not an issue</div></div>';
    [["subs", "Subscriptions", "#2F5BD3", D.subs], ["bills", "Bills", "#2F8FB0", D.bills]].forEach(function (g) {
      var list = g[3], mo = sum(list, function (s) { return s.rhythm === "yearly" ? s.amount / 12 : s.amount; }), ytd = sum(list, function (s) { return s.ytd; });
      var next30 = sum(list.filter(function (s) { return /^Oct/.test(s.next); }), function (s) { return s.amount; });
      h += '<div class="card g3d fin3d fcompact lvbox" style="--tc:' + g[2] + '" data-lvkey="rad:' + g[0] + '"><div class="row between lvhead" style="cursor:pointer"><span><b style="font-size:17px">' + g[1] + '</b>' +
        '<span class="small muted" style="display:block">' + list.length + ' · ' + cur(mo) + '/mo · next 30 days ' + cur(next30) + ' · ' + cur0(ytd) + ' this year</span></span>' +
        '<span class="row" style="gap:8px"><b style="font-size:20px">' + cur0(mo * 12) + '<span class="small muted">/yr</span></b><span class="lvdots">○○</span></span></div>' +
        (g[0] === "bills" ? '<div class="fchips lv1" id="mzbk" style="margin:6px 0">' + [["all", "All"], ["own", "Own"], ["rental", "Rental"]].map(function (c, i) { return '<a class="fchip' + (i ? "" : " on") + '" data-b="' + c[0] + '" href="#">' + c[1] + '</a>'; }).join("") + '</div>' : "") +
        list.map(function (s) { return subline(s, g[0]); }).join("") + '<div class="swhint lv1">← Swipe left: Keep · Cancelled · Not a ' + (g[0] === "bills" ? "bill" : "sub") + '</div></div>';
    });
    return h + '<p class="small muted">Found in the household\'s own transactions: same merchant and account, about the same amount, at a steady rhythm (at least 3 charges, 2 for yearly). Yearly ones, like PhotoKit, get a Daily Tasks item 7 days before the charge. Gas, electricity, water and HOA have their own tabs.</p>';
  }, init: function (root) {
    var c = root.querySelector("#mzbk"); if (!c) return;
    c.addEventListener("click", function (e) { var x = e.target.closest(".fchip"); if (!x) return; e.preventDefault(); e.stopPropagation();
      c.querySelectorAll(".fchip").forEach(function (y) { y.classList.toggle("on", y === x); });
      c.parentNode.querySelectorAll(".swipe[data-k]").forEach(function (s) { s.style.display = x.dataset.b === "all" || s.dataset.k === x.dataset.b ? "" : "none"; }); });
  } };

  // ================= Bills · Gas / Electricity / Water & Sewer / HOA =================
  var UT = { gas: { title: "Gas", color: "#C98A12", pay: "Valley Gas Co", day: 10, unit: "therms" }, electricity: { title: "Electricity", color: "#E0A63A", pay: "Lakeside Power", day: 8, unit: "kWh" },
    water: { title: "Water & Sewer", color: "#2F8FB0", pay: "Metro Water", day: 14, unit: "kgal" }, hoa: { title: "HOA", color: "#7A6FA8", pay: "Willow HOA", day: 5, unit: "" } };
  var HOMEACCT = { willow: "a1", juniper: "a4" };
  function utilPage(kind) {
    var u = UT[kind], data = UD[kind];
    var h = head(u.title, kind === "water" ? "Willow and Juniper · what you paid, and usage" : "Willow · what you paid" + (u.unit ? ", and usage" : ""));
    var homes = data.homes.map(function (hh) { var home = D.homes.filter(function (x) { return x.key === hh.key; })[0], months = hh.months, last12 = sum(months, function (m) { return m.cost; }), prev12 = sum(months, function (m) { return m.prev; });
      return { key: hh.key, home: home, months: months, usage: hh.usage, last12: last12, prev12: prev12 }; });
    var totL = sum(homes, function (x) { return x.last12; }), totP = sum(homes, function (x) { return x.prev12; });
    h += '<div class="card g3d" style="--tc:' + u.color + '"><div class="row between"><b style="font-size:17px">Last 12 months</b><b style="font-size:22px">' + cur(totL) + '</b></div>' +
      '<div class="lk3" style="margin-top:6px"><div><span>12 before</span><b>' + cur0(totP) + '</b></div><div><span>Change</span><b class="' + (totL > totP ? "mz-neg" : "mz-pos") + '">' + U.pct(totL / totP - 1) + '</b></div><div><span>Per month</span><b>' + cur0(totL / 12) + '</b></div></div>' +
      (kind === "hoa" ? '<div class="small muted" style="margin-top:6px">Dues went from $' + D.utilityData.hoa.homes[0].months[0].cost + ' to $' + D.utilities.hoa + ' a month in January. Bank payments only; same rows Home and Net Worth count.</div>' :
        '<div class="small muted" style="margin-top:6px">Cost = bank payments tied to a home. Usage comes from the bills (Willow)' + (kind === "water" ? '; Juniper\'s water and sewer is paid from the rental account, so no usage.' : '.') + '</div>') + '</div>';
    homes.forEach(function (x) {
      var acct = U.acct(HOMEACCT[x.key]), bank = U.bankOf(acct), rental = x.home.kind === "rental", mx = Math.max.apply(null, x.months.map(function (m) { return Math.max(m.cost, m.prev); }));
      var run = 0, rows = x.months.map(function (m, i) { run += m.cost; var y = i < 3 ? 2025 : 2026, mi = MN.indexOf(m.m); return { m: m, y: y, mi: mi, run: run, use: x.usage ? x.usage[i] : null, day: x.key === "juniper" ? 6 : u.day }; });
      var expect = r2(x.months[0].cost * 1.03), due = x.key === "juniper" ? 6 : u.day;
      h += '<div class="card g3d lvbox" style="--tc:' + x.home.color + '" data-lvkey="ut:' + kind + x.key + '"><div class="row between lvhead"><b style="font-size:17px">' + x.home.name + (rental ? ' · rental, owner pays' : ' · your home') + lvdots() + '</b><span><b>' + cur(x.last12) + '</b> <span class="small ' + (x.last12 > x.prev12 ? "mz-neg" : "mz-pos") + '">' + U.pct(x.last12 / x.prev12 - 1) + '</span></span></div>' +
        '<div class="small muted lv1">12 before: ' + cur(x.prev12) + ' · paid from ' + bank.short + ' ••' + acct.end + '</div>' +
        '<div class="mz-bars lv1">' + x.months.map(function (m) { return '<div><div class="pr"><i style="height:' + Math.round(m.prev / mx * 100) + '%;background:var(--line)" title="last year ' + cur(m.prev) + '"></i><i style="height:' + Math.round(m.cost / mx * 100) + '%;background:' + x.home.color + '" title="' + cur(m.cost) + '"></i></div><small>' + m.m + '</small></div>'; }).join("") + '</div>' +
        '<div class="small muted lv1" style="margin-top:2px"><span class="fkey" style="--ac:' + x.home.color + '"></span> last 12 months · <span class="fkey" style="--ac:var(--line)"></span> the 12 before</div>' +
        '<div class="lv2"><table class="mz-tbl" style="margin-top:8px"><thead><tr><th>Month</th><th>Cost</th><th class="phx">Last year</th><th>Change</th>' + (x.usage ? '<th class="phx">' + data.unit + '</th>' : "") + '</tr></thead><tbody>' +
        '<tr class= "mrow zp mz-cur"><td><span class="chv">›</span> Oct 2026 <small>due Oct ' + due + '</small></td><td>≈ ' + cur(expect) + '</td><td class="phx">' + cur(x.months[0].cost) + '</td><td><small>expected</small></td>' + (x.usage ? '<td class="phx"></td>' : "") + '</tr>' +
        '<tr class="mdet"><td colspan="' + (x.usage ? 5 : 4) + '"><small>Not paid yet. The estimate is this month last year plus 3 %; Daily Tasks adds a to-do on the due date and closes it when the payment shows.</small></td></tr>' +
        rows.slice().reverse().map(function (r, ri) { var ch = r.m.cost / r.m.prev - 1, cls = ri === 0 ? "zy" : "zg";
          return '<tr class= "mrow ' + cls + '"><td><span class="chv">›</span> ' + r.m.m + ' ' + r.y + '</td><td>' + cur(r.m.cost) + '</td><td class="phx">' + cur(r.m.prev) + '</td><td class="' + (ch > 0.005 ? "mz-neg" : ch < -0.005 ? "mz-pos" : "") + '">' + U.pct(ch) + '</td>' + (x.usage ? '<td class="phx">' + r.use + '</td>' : "") + '</tr>' +
            '<tr class="mdet"><td colspan="' + (x.usage ? 5 : 4) + '">' + MN[r.mi] + ' ' + r.day + ' · ' + bank.short + ' ••' + acct.end + ' · <b>' + cur(r.m.cost) + '</b> to ' + u.pay.replace("Willow HOA", "Willow HOA") + (kind === "water" && x.key === "juniper" ? " (water &amp; sewer, Juniper)" : "") +
            ' · running total ' + cur(r.run) + (r.use ? ' · ' + r.use + ' ' + data.unit + ' · ' + cur(r.m.cost / r.use) + ' per ' + data.unit.replace(/s$/, "").replace("kgal", "kgal") : "") + '</td></tr>'; }).join("") +
        '</tbody></table></div></div>';
    });
    if (homes.length > 1) h += '<div class="card"><b>By 12-month period · every home</b><table class="mz-tbl" style="margin-top:6px"><thead><tr><th>Home</th><th>12 months to Sep 2026</th><th>12 before</th><th>Change</th></tr></thead><tbody>' +
      homes.map(function (x) { return '<tr><td>' + x.home.name + '</td><td>' + cur(x.last12) + '</td><td>' + cur(x.prev12) + '</td><td>' + U.pct(x.last12 / x.prev12 - 1) + '</td></tr>'; }).join("") +
      '<tr class="mtot"><td>Together</td><td>' + cur(totL) + '</td><td>' + cur(totP) + '</td><td>' + U.pct(totL / totP - 1) + '</td></tr></tbody></table></div>';
    return h + '<p class="small muted">Tap the card to open the months; tap a month for its payment. Rows follow the month colours: grey older, yellow last month, peach this month.</p>';
  }
  ["gas", "electricity", "water", "hoa"].forEach(function (k) {
    P["bills/" + k] = { html: function () { return utilPage(k); }, init: function (box) { mzInit(box, { scroll: false }); } };
  });

  // ================= Rental Cash Flow =================
  // Juniper's months come from DEMO.months (rent, juniperMortgage, water, repairs, topUp, rentalNet, invest). The mortgage payment is split
  // into interest / principal / tax & insurance here: balance after the Oct 1, 2026 payment = DEMO's owed figure, P&I and escrow from DEMO.homes.
  var J = D.homes.filter(function (x) { return x.key === "juniper"; })[0], JR = D.rentals.juniper, PUT_IN = JR.down + JR.closing + JR.improve;
  var JM = (function () {
    var list = D.months, iO = 0, r = J.rate / 1200, A = [], out = [];
    list.forEach(function (o, i) { if (o.ym === "2026-10") iO = i; });
    A[iO] = J.loan;
    for (var i = iO - 1; i >= 0; i--) A[i] = (A[i + 1] + J.pi) / (1 + r);
    for (i = iO + 1; i < list.length; i++) A[i] = A[i - 1] * (1 + r) - J.pi;
    list.forEach(function (o, i) {
      var intr = r2(((A[i] + J.pi) / (1 + r)) * r), prin = r2(J.pi - intr), noi = r2(o.rent - o.water - o.repairs - J.escrow);
      out.push({ ym: o.ym, y: o.y, m: o.m, label: MN[o.m - 1] + " " + o.y, plan: o.plan, rent: o.rent, water: o.water, repairs: o.repairs, tax: J.escrow, noi: noi, intr: intr, prin: prin,
        cash: r2(noi - intr - prin), mort: o.juniperMortgage, top: o.topUp, net: o.rentalNet, llc: o.invest, owed: r2(A[i]) });
    });
    return out; })();
  function agg(rows) { var t = { rent: 0, water: 0, repairs: 0, tax: 0, noi: 0, intr: 0, prin: 0, cash: 0, top: 0 }; rows.forEach(function (x) { for (var k in t) t[k] += x[k]; }); for (var k in t) t[k] = r2(t[k]); return t; }
  // earlier years (Jun 2022 - Dec 2024) from DEMO.rentals.juniper.years: [year, rent, operating costs, interest + tax & ins, principal]
  var JH = JR.years.filter(function (y) { return y[0] < 2025; }).map(function (y) {
    var n = y[0] === 2022 ? 7 : 12, water = J.water * n, tax = J.escrow * n, noi = r2(y[1] - y[2] - tax), intr = r2(y[3] - tax);
    return { y: y[0], n: n, rent: y[1], water: water, repairs: r2(y[2] - water), tax: tax, noi: noi, intr: intr, prin: y[4], cash: r2(noi - intr - y[4]), top: 250 * n }; });
  function yearTot(y) { return y < 2025 ? JH.filter(function (x) { return x.y === y; })[0] : agg(JM.filter(function (x) { return x.y === y; })); }
  var RC = { tab: "all" };
  function rcChart(color, stackName) {
    var yrs = [2022, 2023, 2024, 2025, 2026, 2027].map(function (y) { var t = yearTot(y); return { y: y, cash: t.cash, prin: t.prin, noi: t.noi, plan: y >= 2026, tot: r2(t.cash + t.prin) }; });
    var typical = PUT_IN * 0.08, top = Math.max(typical * 1.08, Math.max.apply(null, yrs.map(function (x) { return Math.max(x.cash, 0) + x.prin; }))), bot = Math.min(0, Math.min.apply(null, yrs.map(function (x) { return x.cash; })));
    var span = top - bot, H = 190, y0 = top / span * H, n = yrs.length;
    function ypx(v) { return y0 - v / span * H; }
    var lines = [0, 2, 4, 6, 8].filter(function (p) { return p / 100 * PUT_IN <= top * 1.02; }).map(function (p) { return '<div class="gl' + (p === 8 ? " ty" : "") + '" style="top:' + ypx(p / 100 * PUT_IN).toFixed(1) + 'px"><span>' + p + '%' + '</span></div>'; }).join("") +
      (bot < 0 ? '<div class="gl" style="top:' + ypx(bot).toFixed(1) + 'px"><span>' + (bot / PUT_IN * 100).toFixed(0) + '%</span></div>' : "");
    var cols = yrs.map(function (x, i) {
      var left = (i / n * 100).toFixed(2), w = (100 / n).toFixed(2), cp = Math.max(x.cash, 0), pTop = ypx(cp + x.prin), cTop = ypx(cp), neg = x.cash < 0;
      var bx = '<div class="bx' + (x.plan ? " pl" : "") + '" style="color:' + color + ';background:color-mix(in srgb,' + color + ' 45%,transparent);top:' + pTop.toFixed(1) + 'px;height:' + Math.max(1, cTop - pTop).toFixed(1) + 'px" title="principal ' + cur0(x.prin) + '"></div>' +
        (cp > 0 ? '<div class="bx' + (x.plan ? " pl" : "") + '" style="color:' + color + ';background:' + color + ';top:' + cTop.toFixed(1) + 'px;height:' + (y0 - cTop).toFixed(1) + 'px"></div>' : "") +
        (neg ? '<div class="bx' + (x.plan ? " pl" : "") + '" style="color:#B3261E;background:#B3261E;top:' + y0.toFixed(1) + 'px;height:' + (ypx(x.cash) - y0).toFixed(1) + 'px;border-radius:1px 1px 5px 5px" title="cash ' + cur0(x.cash) + '"></div>' : "");
      return '<div class="col" style="left:' + left + '%;width:' + w + '%">' + bx + '<span class="lb" style="top:' + (pTop - 15).toFixed(1) + 'px">' + km(x.tot) + '</span></div>'; }).join("");
    var ax = yrs.map(function (x) { return '<div>' + x.y + (x.plan ? ' <small>' + (x.y === 2026 ? "9 act + 3 plan" : "plan") + '</small>' : '<small>' + (x.y === 2022 ? "from Jun" : "&nbsp;") + '</small>') + '<small>' + (x.tot / PUT_IN * 100).toFixed(1) + '%</small></div>'; }).join("");
    return '<div class="mz-ch">' + lines + cols + '</div><div class="mz-ax">' + ax + '</div>' +
      '<div class="small muted" style="margin-top:8px"><span class="fkey" style="--ac:' + color + '"></span> cash flow · <span class="fkey" style="--ac:color-mix(in srgb,' + color + ' 45%,transparent)"></span> + principal · <span class="fkey" style="--ac:#B3261E"></span> cash shortfall · <b style="color:#9A6A10">- - -</b> typical 8 % a year incl. principal · $ over each bar = profit incl. principal, % = ÷ ' + km(PUT_IN) + ' put in</div>';
  }
  function rcBody() {
    var done = JM.filter(function (x) { return !x.plan; }), l12 = agg(done.slice(-12)), hist = JH.concat([agg(done)]);
    var cashAll = r2(sum(JH, function (x) { return x.cash; }) + agg(done).cash), prinAll = r2(sum(JH, function (x) { return x.prin; }) + agg(done).prin), noiAll = r2(sum(JH, function (x) { return x.noi; }) + agg(done).noi);
    var topAll = r2(sum(JH, function (x) { return x.top; }) + agg(done).top), deposit = J.rent;
    var h = '<div class="card g3d" style="--tc:' + J.color + '"><div class="row between"><b style="font-size:17px">Cash profit · since Jun 2022</b><b style="font-size:22px" class="' + (cashAll < 0 ? "mz-neg" : "pos") + '">' + cur0(cashAll) + '</b></div>' +
      '<div class="small muted">after every cost and the mortgage, before the principal you repay (that part is equity)</div>' +
      '<div class="lk3 lk4" style="margin-top:6px"><div><span>Principal paid</span><b>' + cur0(prinAll) + '</b></div><div><span>Incl. principal</span><b class="pos">' + cur0(cashAll + prinAll) + '</b></div><div><span>Put in at purchase</span><b>' + km(PUT_IN) + '</b></div><div><span>You added since</span><b>' + km(topAll) + '</b></div></div>' +
      '<div class="lk3 lk4" style="margin-top:6px"><div><span>NOI yield · 12 mo</span><b>' + (l12.noi / J.price * 100).toFixed(1) + '%</b></div><div><span>Cash on cash</span><b>' + (l12.cash / PUT_IN * 100).toFixed(1) + '%</b></div><div><span>+ principal</span><b>' + ((l12.cash + l12.prin) / PUT_IN * 100).toFixed(1) + '%</b></div><div><span>LLC cash</span><b>' + cur0(U.acct("a4").bal) + '</b></div></div>' +
      '<div class="small muted" style="margin-top:6px">Rent ' + cur0(J.rent) + '/mo (A ' + cur0(J.units[0].rent) + ' · B ' + cur0(J.units[1].rent) + ') · deposits held ' + cur0(deposit) + ' · you top up the LLC with $250 a month from Joint Checking</div></div>';
    h += '<div class="card g3d lvbox" style="--tc:' + J.color + '" data-lvkey="rc:chart"><div class="row between lvhead"><b style="font-size:17px">Return by year' + lvdots() + '</b><span class="small muted">profit incl. principal</span></div><div class="lv1">' + rcChart(J.color) + '</div></div>';
    h += rcTable();
    var bs = [["Cash in the LLC account", U.acct("a4").bal], ["Home at today's value", J.value], ["Lender's loan (Bramble Home Loans)", -J.loan], ["Owed to tenants (deposits)", -deposit]], eq = sum(bs, function (x) { return x[1]; });
    h += '<div class="card g3d lvbox" style="--tc:' + J.color + '" data-lvkey="rc:bs"><div class="row between lvhead"><b style="font-size:17px">Balance sheet' + lvdots() + '</b><b>' + cur0(eq) + '</b></div><div class="lv1 small">' +
      bs.map(function (x) { return '<div class="row between" style="padding:3px 0;border-top:1px solid var(--line)"><span>' + x[0] + '</span><b>' + cur0(x[1]) + '</b></div>'; }).join("") +
      '<div class="row between" style="padding:3px 0;border-top:2px solid var(--line)"><b>Equity</b><b>' + cur0(eq) + '</b></div><div class="muted" style="margin-top:4px">The investment line of credit (' + cur0(J.loc.owed) + ') is yours, not the LLC\'s: see HELOC &amp; Car Loan.</div></div></div>';
    return h;
  }
  function monthRow(x, isCur, grp) {
    var cls = mClass(x.y, x.m), id = x.ym, c = x.cash;
    return '<tr class= "mrow ' + cls + (isCur ? " mz-cur" : "") + '"' + (grp ? ' data-in="' + grp + '"' : "") + '><td><span class="chv">›</span> ' + x.label + (x.plan ? ' <small>plan</small>' : "") + '</td><td>' + cur0(x.rent) + '</td><td class="phx">' + cur0(-x.water) + '</td><td class="phx">' + cur0(-x.repairs) + '</td><td class="phx">' + cur0(-x.tax) + '</td><td>' + fmt0(x.noi) + '</td>' +
      '<td class="phx">' + cur0(-x.intr) + '</td><td class="phx">' + cur0(-x.prin) + '</td><td>' + fmt0(c) + '</td></tr>' +
      '<tr class="mdet"><td colspan="9"><div class="mz-dl"><div><span>Rent · Unit A</span><b>' + cur(x.y > 2026 && x.m >= 8 ? 1620 : 1575) + '</b></div><div><span>Rent · Unit B</span><b>' + cur(x.rent - (x.y === 2027 && x.m >= 8 ? 1620 : 1575)) + '</b></div><div><span>Water &amp; sewer</span><b>' + cur(-x.water) + '</b></div><div><span>Repairs &amp; fees</span><b>' + cur(-x.repairs) + '</b></div>' +
      '<div><span>Tax &amp; insurance (escrow)</span><b>' + cur(-x.tax) + '</b></div><div><span>= NOI</span><b>' + cur(x.noi) + '</b></div><div><span>Interest</span><b>' + cur(-x.intr) + '</b></div><div><span>Principal</span><b>' + cur(-x.prin) + '</b></div><div><span>= Cash</span><b>' + cur(x.cash) + '</b></div>' +
      '<div><span>You put in (Joint Checking)</span><b>' + cur(x.top) + '</b></div><div><span>Change in LLC cash</span><b>' + cur(x.net) + '</b></div><div><span>LLC cash, month-end</span><b>' + cur(x.llc) + '</b></div></div>' +
      '<small>Mortgage ' + cur(x.mort) + ' on the 1st = interest + principal + escrow · loan after it ' + cur0(x.owed) + (x.plan ? " · planned: rent and costs as in Monthly Budgeting" : " · from the bank lines") + '</small></td></tr>';
  }
  function grpRow(key, label, t, start, extra) {
    return '<tr class="mgrp" data-g="' + key + '"' + (start ? ' data-start="1"' : "") + '><td><span class="chv">›</span> ' + label + (extra ? ' <small>' + extra + '</small>' : "") + '</td><td>' + cur0(t.rent) + '</td><td class="phx">' + cur0(-t.water) + '</td><td class="phx">' + cur0(-t.repairs) + '</td><td class="phx">' + cur0(-t.tax) + '</td><td>' + fmt0(t.noi) + '</td><td class="phx">' + cur0(-t.intr) + '</td><td class="phx">' + cur0(-t.prin) + '</td><td>' + fmt0(t.cash) + '</td></tr>';
  }
  function rcTable() {
    var h = '<div class="card g3d" style="--tc:' + J.color + '"><div class="row between"><b style="font-size:17px">Month by month</b><a class="small" href="#" data-expand="1" data-open="0">Expand all</a></div>' +
      '<div class="small muted">Rent · costs = NOI · interest and principal = Cash. Years are folded only for history; months ahead are listed one by one.</div>' +
      '<table class="mz-tbl" style="margin-top:6px"><thead><tr><th>Month</th><th>Rent</th><th class="phx">Water</th><th class="phx">Repairs</th><th class="phx">Tax &amp; ins</th><th>NOI</th><th class="phx">Interest</th><th class="phx">Principal</th><th>Cash</th></tr></thead><tbody>';
    JH.forEach(function (x) { h += grpRow("y" + x.y, String(x.y), x, false, x.y === 2022 ? "from Jun" : "year"); });
    var y25 = JM.filter(function (x) { return x.y === 2025; }), y26 = JM.filter(function (x) { return x.y === 2026 && x.m <= 9; });
    h += grpRow("g2025", "2025", agg(y25), false, "year") + y25.map(function (x) { return monthRow(x, false, "g2025"); }).join("");
    h += grpRow("g2026", "2026 so far", agg(y26), true, "Jan–Sep") + y26.map(function (x) { return monthRow(x, false, "g2026"); }).join("");
    JM.filter(function (x) { return x.y > 2026 || (x.y === 2026 && x.m >= 10); }).forEach(function (x) { h += monthRow(x, x.ym === "2026-10"); });
    return h + '</tbody></table></div>';
  }
  function rcAll() {
    var done = JM.filter(function (x) { return !x.plan; }), cashAll = r2(sum(JH, function (x) { return x.cash; }) + agg(done).cash), prinAll = r2(sum(JH, function (x) { return x.prin; }) + agg(done).prin);
    var h = '<div class="card g3d" style="--tc:#8C5A44"><div class="row between"><b style="font-size:17px">All rentals · cash profit</b><b style="font-size:22px" class="' + (cashAll < 0 ? "mz-neg" : "pos") + '">' + cur0(cashAll) + '</b></div>' +
      '<div class="small muted">One rental today, so All = Juniper. Cash held by the rentals: ' + cur0(U.acct("a4").bal) + ' (not part of the profit).</div>' +
      '<div class="lk3" style="margin-top:6px"><div><span>Principal paid</span><b>' + cur0(prinAll) + '</b></div><div><span>Incl. principal</span><b class="pos">' + cur0(cashAll + prinAll) + '</b></div><div><span>Homes</span><b>1 duplex · 2 units</b></div></div></div>';
    h += '<div class="card g3d lvbox" style="--tc:#8C5A44" data-lvkey="rc:all"><div class="row between lvhead"><b style="font-size:17px">Return by year' + lvdots() + '</b><span class="small muted">per home, tap a bar\'s home to open it</span></div><div class="lv1">' + rcChart("#8C5A44") + '</div></div>';
    h += '<div class="card g3d" style="--tc:#8C5A44"><b style="font-size:17px">Each home</b><div class="lk3" style="margin-top:6px"><a href="#" data-home="juniper" style="text-decoration:none;color:inherit"><div style="border-top:4px solid ' + J.color + '"><span>Juniper</span><b>' + cur0(J.value) + '</b><small>rent ' + cur0(J.rent) + '/mo · equity ' + km(J.value - J.loan) + '</small></div></a></div></div>';
    h += '<div class="card g3d" style="--tc:#8C5A44"><div class="row between"><b style="font-size:17px">Month by month · all rentals</b><span class="small muted">open the home for every line</span></div>' +
      '<table class="mz-tbl" style="margin-top:6px"><thead><tr><th>Month</th><th>Juniper cash</th><th class="phx">Principal</th><th>LLC bank</th><th class="phx">Check</th></tr></thead><tbody>';
    function row(x, isCur) { return '<tr class="' + mClass(x.y, x.m) + (isCur ? " mz-cur" : "") + '"><td>' + x.label + (x.plan ? ' <small>plan</small>' : "") + '</td><td>' + fmt0(x.cash) + '</td><td class="phx">' + cur0(x.prin) + '</td><td>' + cur0(x.llc) + '</td><td class="phx">' + (x.plan ? '<small>projection</small>' : '<b class="pos">✓</b>') + '</td></tr>'; }
    JH.forEach(function (x) { h += '<tr class="mgrp"><td>' + x.y + ' <small>year</small></td><td>' + fmt0(x.cash) + '</td><td class="phx">' + cur0(x.prin) + '</td><td></td><td class="phx"></td></tr>'; });
    var y25 = JM.filter(function (x) { return x.y === 2025; }), y26 = JM.filter(function (x) { return x.y === 2026 && x.m <= 9; });
    h += '<tr class="mgrp"><td>2025 <small>year</small></td><td>' + fmt0(agg(y25).cash) + '</td><td class="phx">' + cur0(agg(y25).prin) + '</td><td>' + cur0(y25[11].llc) + '</td><td class="phx"><b class="pos">✓</b></td></tr>';
    h += '<tr class="mgrp mgo"><td>2026 so far <small>Jan–Sep</small></td><td>' + fmt0(agg(y26).cash) + '</td><td class="phx">' + cur0(agg(y26).prin) + '</td><td>' + cur0(y26[8].llc) + '</td><td class="phx"></td></tr>' + y26.map(function (x) { return row(x); }).join("");
    JM.filter(function (x) { return x.y > 2026 || (x.y === 2026 && x.m >= 10); }).forEach(function (x) { h += row(x, x.ym === "2026-10"); });
    return h + '</tbody></table><div class="small muted" style="margin-top:6px">The bank column is the LLC account\'s own balance, ending at today\'s ' + cur(U.acct("a4").bal) + '. Every month since the account opened ties to the bank within $1.</div></div>';
  }
  P.rentcf = { html: function () {
    var h = head("Rental Cash Flow", RC.tab === "all" ? "All rentals · Juniper (duplex, units A and B) · bought Apr 2022 · rented from Jun 2022" : "Juniper · duplex, units A and B · bought Apr 2022 · rented from Jun 2022");
    h += '<div class="mz-sel"><div class="fchips"><a class="fchip' + (RC.tab === "all" ? " on" : "") + '" data-tab="all" href="#">All</a><a class="fchip' + (RC.tab === "juniper" ? " on" : "") + '" data-tab="juniper" href="#" style="' + (RC.tab === "juniper" ? "background:" + J.color + ";border-color:" + J.color + ";color:#fff" : "") + '">Juniper</a></div></div>';
    return h + (RC.tab === "all" ? rcAll() : rcBody()) + '<p class="small muted">Every figure comes from the bank lines of the Juniper LLC account and your own accounts; the loan payment is opened into interest, principal and tax &amp; insurance. Nothing is typed by hand.</p>';
  }, init: function (box, redraw) {
    mzInit(box);
    box.addEventListener("click", function (e) { var t = e.target.closest("[data-tab],[data-home]"); if (!t) return; e.preventDefault(); RC.tab = t.dataset.tab || t.dataset.home; redraw(); });
  } };

  // ================= HELOC & Car Loan =================
  var LOC = J.loc;
  var HR = (function () {            // Juniper's investment line of credit, month by month: owed = previous owed + interest - payment (DEMO.months owed / paid / rate)
    var list = D.months, out = [];
    list.forEach(function (o, i) {
      var prev = i ? list[i - 1].locOwed : (o.locOwed + o.locPaid) / (1 + o.rate / 1200), intr = r2(prev * o.rate / 1200);
      out.push({ ym: o.ym, y: o.y, m: o.m, label: MN[o.m - 1] + " " + o.y, plan: o.plan, pay: o.locPaid, intr: intr, prin: r2(o.locPaid - intr), owed: o.locOwed, prev: r2(prev), rate: o.rate, prime: r2(o.rate - LOC.margin) });
    });
    return out; })();
  function lagg(rows) { return { pay: r2(sum(rows, function (x) { return x.pay; })), intr: r2(sum(rows, function (x) { return x.intr; })), prin: r2(sum(rows, function (x) { return x.prin; })), owed: rows[rows.length - 1].owed }; }
  function lgrp(key, label, t, start, extra, withRate) {
    return '<tr class="mgrp" data-g="' + key + '"' + (start ? ' data-start="1"' : "") + '><td><span class="chv">›</span> ' + label + (extra ? ' <small>' + extra + '</small>' : "") + '</td><td>' + cur0(t.pay) + '</td><td class="phx">' + cur0(t.intr) + '</td><td class="phx">' + cur0(t.prin) + '</td><td>' + cur0(t.owed) + '</td><td class="phx"></td></tr>';
  }
  function chipOf(x) { return '<span class="mz-chip' + (x.plan ? " plan" : "") + '" style="border-color:' + (x.plan ? "#2F8FB0" : "#2E8B57") + ';color:' + (x.plan ? "#2F8FB0" : "#2E8B57") + '">' + (x.plan ? "planned" : "paid") + '</span>'; }
  function hrow(x, isCur, grp) {
    var a3 = U.acct("a3"), a4 = U.acct("a4");
    return '<tr class= "mrow ' + mClass(x.y, x.m) + (isCur ? " mz-cur" : "") + '"' + (grp ? ' data-in="' + grp + '"' : "") + '><td><span class="chv">›</span> ' + x.label + '</td><td>' + cur0(x.pay) + '</td><td class="phx">' + cur0(x.intr) + '</td><td class="phx">' + cur0(x.prin) + '</td><td>' + cur0(x.owed) + '</td><td class="phx">' + x.rate.toFixed(2) + '%</td></tr>' +
      '<tr class="mdet"><td colspan="6">' + chipOf(x) + '<b>' + cur(x.pay) + '</b> on the 20th · Paid from Cash · ' + (x.plan ? 'your plan (Monthly Budgeting shows it too)' : D.banks.TWB.short + ' ••' + a3.end + ' · Morgan · matched to the bank line') + '<br>' +
      '<small>Owed before ' + cur(x.prev) + ' + interest ' + cur(x.intr) + ' (' + x.rate.toFixed(2) + '% = Prime ' + x.prime.toFixed(2) + '% + ' + LOC.margin.toFixed(2) + '%) − payment ' + cur(x.pay) + ' = ' + cur(x.owed) + ' · principal ' + cur(x.prin) + '</small></td></tr>';
  }
  function payoff(owed, rate, pay, ym0) {            // months until the line is paid, continuing the plan past the table
    var n = 0, tot = 0; while (owed > 0.005 && n < 600) { var i = owed * rate / 1200; tot += i; owed = owed + i - Math.min(pay, owed + i); n++; }
    var idx = ym0 + n; return { n: n, interest: r2(tot), label: MN[idx % 12] + " " + Math.floor(idx / 12) };
  }
  P.loans = { html: function () {
    var done = HR.filter(function (x) { return !x.plan; }), cs = HR.filter(function (x) { return x.ym === "2026-10"; })[0], po = payoff(LOC.owed, LOC.rate, LOC.plan, ymIdx(2026, 9) + 0);
    var h = head("HELOC & Car Loan", "Juniper investment line of credit at Tidewater Bank · limit " + cur0(LOC.limit), '<button class="btn" onclick="mzOff(\'editing the plan\')">⚙ Parameters</button>');
    h += '<div class="card g3d" style="--tc:' + J.color + '"><div class="row between"><b style="font-size:17px">Owed today</b><b style="font-size:22px">' + cur(LOC.owed) + '</b></div>' +
      '<div class="lk3 lk4" style="margin-top:6px"><div><span>Limit</span><b>' + cur0(LOC.limit) + '</b></div><div><span>Available</span><b>' + cur0(LOC.avail) + '</b></div><div><span>Rate</span><b>' + LOC.rate.toFixed(2) + '%</b><small>Prime ' + LOC.prime.toFixed(2) + ' + ' + LOC.margin.toFixed(2) + '</small></div><div><span>Plan</span><b>' + cur0(LOC.plan) + '</b><small>on the ' + LOC.planDay + 'th</small></div></div>' +
      '<div class="small muted" style="margin-top:6px">At ' + cur0(LOC.plan) + ' a month it is paid off in ' + po.label + ' (about ' + po.n + ' payments, ' + cur0(po.interest) + ' interest). The rate follows Prime, which counts from the next month. Paid from Cash (Joint Checking), never from the rental income.</div>' +
      '<div class="mz-note" style="border-color:rgba(46,139,87,.4);background:rgba(46,139,87,.10)">✓ Every month of the next 12 covers the interest (≈ ' + cur0(cs.intr) + ' a month). No Urgent task.</div></div>';
    var y25 = HR.filter(function (x) { return x.y === 2025; }), y26 = HR.filter(function (x) { return x.y === 2026 && x.m <= 9; });
    h += '<div class="card g3d" style="--tc:' + J.color + '"><div class="row between"><b style="font-size:17px">Payments</b><a class="small" href="#" data-expand="1" data-open="0">Expand all</a></div>' +
      '<div class="small muted">Solid chip = paid (matched to the bank), dashed = planned. A month opens to its payment. Months ahead are listed one by one.</div>' +
      '<table class="mz-tbl" style="margin-top:6px"><thead><tr><th>Month</th><th>Payment</th><th class="phx">Interest</th><th class="phx">Principal</th><th>Owed</th><th class="phx">Rate</th></tr></thead><tbody>' +
      lgrp("l25", "2025", lagg(y25), false, "year") + y25.map(function (x) { return hrow(x, false, "l25"); }).join("") +
      lgrp("l26", "2026 so far", lagg(y26), true, "Jan–Sep") + y26.map(function (x) { return hrow(x, false, "l26"); }).join("") +
      HR.filter(function (x) { return x.y > 2026 || (x.y === 2026 && x.m >= 10); }).map(function (x) { return hrow(x, x.ym === "2026-10"); }).join("") + '</tbody></table></div>';
    return h + '<p class="small muted">From the bank feed (Tidewater) since the line was opened; the plan is $600 on the 20th. A bank payment in a month replaces the planned one. Edit the plan in ⚙ Parameters (from a month on, or one month only).</p>';
  }, init: function (box) { mzInit(box); } };

  // ---- Car loan: CX-5 at Larkspur Credit Union. DEMO.carx / DEMO.months carLoan: 414 on the 12th, owed today 7,950, 2.49 % ----
  var CL = D.carx.cx5.loan, CAR = D.cars[0], CR = CAR.apr / 1200;
  var CM = (function () {
    var out = [], list = D.months, iO = 0; list.forEach(function (o, i) { if (o.ym === "2026-10") iO = i; });
    var after = []; after[iO - 1] = CAR.loan;                                  // owed after the Sep 12 payment = today's figure
    for (var i = iO - 2; i >= 0; i--) after[i] = (after[i + 1] + CAR.payment) / (1 + CR);
    function mk(idx, prev, pay, plan) { var intr = r2(prev * CR), p = Math.min(pay, r2(prev + intr)), prin = r2(p - intr), y = Math.floor(idx / 12), m = idx % 12 + 1;
      return { ym: y + "-" + ("0" + m).slice(-2), y: y, m: m, label: MN[m - 1] + " " + y, plan: plan, pay: p, intr: intr, prin: prin, owed: r2(prev - prin), prev: r2(prev) }; }
    for (i = 0; i < iO; i++) out.push(mk(ymIdx(2025, 1) + i, i ? after[i - 1] : (after[0] + CAR.payment) / (1 + CR), CAR.payment, false));
    var prev = CAR.loan, idx = ymIdx(2026, 10);
    while (prev > 0.005 && idx < ymIdx(2026, 10) + 60) { var x = mk(idx, prev, CAR.payment, true); out.push(x); prev = x.owed; idx++; }
    return out; })();
  function simulate(extra) { var o = CAR.loan, n = 0, tot = 0; while (o > 0.005 && n < 200) { var i = o * CR; tot += i; o = o + i - Math.min(CAR.payment + extra, o + i); n++; } var idx = ymIdx(2026, 9) + n; return { n: n, interest: r2(tot), label: MN[idx % 12] + " " + Math.floor(idx / 12) }; }
  function crow(x, isCur, grp) {
    var a1 = U.acct("a1");
    return '<tr class= "mrow ' + mClass(x.y, x.m) + (isCur ? " mz-cur" : "") + '"' + (grp ? ' data-in="' + grp + '"' : "") + '><td><span class="chv">›</span> ' + x.label + '</td><td>' + cur0(x.pay) + '</td><td class="phx">' + cur(x.intr) + '</td><td class="phx">' + cur0(x.prin) + '</td><td>' + cur0(x.owed) + '</td></tr>' +
      '<tr class="mdet"><td colspan="5">' + chipOf(x) + '<b>' + cur(x.pay) + '</b> on the 12th · ' + (x.plan ? "scheduled · " + (x.owed === 0 ? "the last payment" : "") : D.banks.LCU.short + ' ••' + a1.end + ' · matched to the bank line') + '<br><small>Owed before ' + cur(x.prev) + ' + interest ' + cur(x.intr) + ' (' + CAR.apr + '% a year) − payment ' + cur(x.pay) + ' = ' + cur(x.owed) + '</small></td></tr>'; }
  P["loans/car"] = { html: function () {
    var last = CM[CM.length - 1], sim0 = simulate(0), sim1 = simulate(100), left = sum(CM.filter(function (x) { return x.plan; }), function (x) { return x.intr; });
    var h = head("HELOC & Car Loan", "2021 Mazda CX-5 · Larkspur Credit Union · " + CAR.apr + "% · " + cur0(CAR.payment) + " on the 12th", '<button class="btn" onclick="mzOff(\'editing the plan\')">⚙ Parameters</button>');
    h += '<div class="card g3d" style="--tc:' + CAR.color + '"><div class="row between"><b style="font-size:17px">Owed today</b><b style="font-size:22px">' + cur(CAR.loan) + '</b></div>' +
      '<div class="lk3 lk4" style="margin-top:6px"><div><span>Borrowed</span><b>' + cur0(CAR.borrowed) + '</b></div><div><span>Payment</span><b>' + cur0(CAR.payment) + '</b></div><div><span>Paid off</span><b>' + last.label + '</b></div><div><span>Interest left</span><b>' + cur0(left) + '</b></div></div>' +
      '<div class="small muted" style="margin-top:6px">Car value today ' + cur0(CAR.value) + ' · ' + CM.filter(function (x) { return x.plan; }).length + ' payments left. Planned payments continue until the balance is zero; the last one is smaller.</div></div>';
    h += '<div class="card g3d lvbox" style="--tc:' + CAR.color + '" data-lvkey="car:what"><div class="row between lvhead"><b style="font-size:17px">What if you paid more?' + lvdots() + '</b><span class="small muted">' + sim0.label + ' as planned</span></div><div class="lv1 small">' +
      '<div class="row between" style="padding:3px 0;border-top:1px solid var(--line)"><span>+ $100 a month</span><b>paid off ' + sim1.label + ' · saves ' + cur0(sim0.interest - sim1.interest) + ' interest</b></div>' +
      '<div class="row between" style="padding:3px 0;border-top:1px solid var(--line)"><span>As planned</span><b>paid off ' + sim0.label + ' · ' + cur0(sim0.interest) + ' interest</b></div>' +
      '<div class="muted" style="margin-top:4px">Set an extra payment for a month with ＋ on its row in the real app; an actual extra payment in the bank replaces it.</div></div></div>';
    var y25 = CM.filter(function (x) { return x.y === 2025; }), y26 = CM.filter(function (x) { return x.y === 2026 && x.m <= 9; });
    function cg(key, label, rows, start, extra) { var t = lagg(rows); return '<tr class="mgrp" data-g="' + key + '"' + (start ? ' data-start="1"' : "") + '><td><span class="chv">›</span> ' + label + ' <small>' + extra + '</small></td><td>' + cur0(t.pay) + '</td><td class="phx">' + cur0(t.intr) + '</td><td class="phx">' + cur0(t.prin) + '</td><td>' + cur0(t.owed) + '</td></tr>'; }
    h += '<div class="card g3d" style="--tc:' + CAR.color + '"><div class="row between"><b style="font-size:17px">Payments</b><a class="small" href="#" data-expand="1" data-open="0">Expand all</a></div>' +
      '<div class="small muted">Years before 2025: ' + cur0(CAR.borrowed - y25[0].prev) + ' of the ' + cur0(CAR.borrowed) + ' was repaid by Dec 2024.</div>' +
      '<table class="mz-tbl" style="margin-top:6px"><thead><tr><th>Month</th><th>Payment</th><th class="phx">Interest</th><th class="phx">Principal</th><th>Owed</th></tr></thead><tbody>' +
      cg("c25", "2025", y25, false, "year") + y25.map(function (x) { return crow(x, false, "c25"); }).join("") +
      cg("c26", "2026 so far", y26, true, "Jan–Sep") + y26.map(function (x) { return crow(x, false, "c26"); }).join("") +
      CM.filter(function (x) { return x.plan; }).map(function (x) { return crow(x, x.ym === "2026-10"); }).join("") + '</tbody></table></div>';
    return h + '<p class="small muted">Interest = the balance × ' + CAR.apr + '% ÷ 12 each month, which is how the lender\'s own statements split it. Monthly Budgeting counts the same ' + cur0(CAR.payment) + ' until ' + last.label + '.</p>';
  }, init: function (box) { mzInit(box); } };
})();
