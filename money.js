/* Money area: Finances (home, Transactions, History, Radar, Rental CF) and Net Worth (home, Real Estate).
   Same cards, rows and levels as the real app; every figure comes from DEMO. */
(function () {
  var D = window.DEMO, T = D.totals, U = window.UI, P = window.PAGES;
  var cur = U.cur, cur0 = U.cur0, km = U.km, esc = U.esc;
  function sum(l, f) { return l.reduce(function (t, x) { return t + f(x); }, 0); }
  function byType(types) { return D.accounts.filter(function (a) { return types.indexOf(a.type) >= 0; }); }
  function head(title, sub, right) { return '<header class="top"><div><h1>' + title + '</h1><div class="sub">' + sub + '</div></div>' + (right || "") + '</header>'; }
  function lvdots() { return ' <span class="lvdots">○○</span>'; }
  var okc = "background:rgba(46,107,69,.12);border-color:rgba(46,107,69,.35);color:#2E6B45";
  var todo = "background:rgba(199,122,46,.14);border-color:rgba(199,122,46,.45);color:#9A5B1E";

  // a section card: header with total; rows open to their transactions
  function section(key, title, color, list, sub) {
    var tot = sum(list, function (a) { return a.bal; });
    return '<div class="card g3d fgroup lvbox" style="--tc:' + color + '" data-lvkey="fin:' + key + '"><div class="ghead lvhead"><span>' + title + lvdots() + '</span><b>' + cur(tot) + '</b></div>' +
      '<div class="gsub lv1">' + (sub || list.length + " account" + (list.length !== 1 ? "s" : "")) + '</div>' +
      list.slice().sort(function (a, b) { return b.bal - a.bal; }).map(function (a, i) { return U.acctrow(a, { alt: i % 2 === 1 }); }).join("") + '</div>';
  }

  // ---------------- Finances home ----------------
  P.finances = { html: function () {
    var cards = byType(["card"]), latest = D.tx.filter(function (t) { return U.isCard(U.acct(t.acct)) || t.acct === "a1" || t.acct === "a3"; }).slice(0, 15);
    var h = head("Finances", "Tuesday, Sep 29", '<button class="btn" onclick="UI.toast(\'Demo · banks refresh once a day\')">↻ Refresh</button>');
    h += '<div class="row" style="gap:8px;flex-wrap:wrap;margin:0 0 8px"><a class="btn" style="' + okc + '" href="#/finances/history">✓ History complete</a>' +
      '<a class="btn" style="' + todo + '" href="#/finances/transactions">To review · 3</a>' +
      '<a class="btn" style="background:rgba(179,38,30,.12);border-color:rgba(179,38,30,.4);color:#B3261E" href="#/finances/radar">⚠ ' + D.alerts.length + ' need attention ›</a>' +
      '<a class="btn" href="#/finances" onclick="UI.toast(\'Demo · adding is turned off\');return false">＋ Add transaction</a></div>';
    h += '<div class="card g3d fin3d fcompact lvbox" id="flatest" style="--tc:#2F8FB0" data-lvkey="fin:latest"><div class="row between lvhead" style="cursor:pointer"><b style="font-size:17px">Latest' + lvdots() + '</b><a class="small" href="#/finances/transactions">All ›</a></div>' +
      '<div class="fchips lv1" id="fwho">' + ["All", "Alex", "Jordan", "Maya"].map(function (p) { return '<a class="fchip' + (p === "All" ? " on" : "") + '" data-p="' + p + '" href="#">' + p + '</a>'; }).join("") + '</div>' +
      '<div id="flist">' + latest.map(function (t, i) { return '<div class="' + (i < 5 ? "lv1" : "lv2") + '" data-p="' + (t.who || "Alex") + '">' + U.txrow(t, true) + '</div>'; }).join("") + '</div></div>';
    // credit cards: one line per card, payment state
    h += '<div class="card g3d fgroup lvbox" style="--tc:#8A5A9E" data-lvkey="fin:cards"><div class="ghead lvhead"><span>Credit cards' + lvdots() + '</span><b>' + cur(-T.cardDebt) + '</b></div>' +
      '<div class="gsub lv1">' + cards.length + ' cards · <b>1 due within 7 days</b> · tap a card for statement / payment details</div>' +
      cards.map(function (a, i) { var soon = a.due === "Oct 14";
        return U.acctrow(a, { alt: i % 2 === 1, state: '<small class="cst ' + (soon ? "due" : "ok") + '">' + (soon ? "due " + a.due : "✓ paid · due " + a.due) + '</small>',
          small: "stmt " + cur(-a.bal * 0.86) + " · paid " + cur(soon ? 0 : -a.bal * 0.86) }); }).join("") + '</div>';
    h += section("cash", "Savings & Checking", "#2F6FD0", byType(["checking", "savings"]), byType(["checking", "savings"]).length + " accounts " + cur(T.cash));
    h += section("cd", "CD", "#1E9AA8", byType(["cd"]), "3 CDs · 4.35% avg · next matures Jan 2027");
    h += section("re", "Real Estate Investment", "#C2410C", byType(["rental"]), "2 rental LLC accounts");
    return h + '<p class="small muted">Live from bank connections, updated in the daily run. Transfers and card payments are not counted as spending.</p>';
  }, init: function (root) {
    var chips = root.querySelector("#fwho"); if (!chips) return;
    chips.addEventListener("click", function (e) { var c = e.target.closest(".fchip"); if (!c) return; e.preventDefault(); e.stopPropagation();
      var p = c.dataset.p, n = 0;
      root.querySelectorAll("#flist>div").forEach(function (r) { r.classList.remove("lv1", "lv2", "fx"); r.style.display = "";
        if (p !== "All" && r.dataset.p !== p) { r.style.display = "none"; return; } r.classList.add(n < 5 ? "lv1" : "lv2"); n++; });
      chips.querySelectorAll(".fchip").forEach(function (x) { x.classList.toggle("on", x === c); }); });
  } };

  // ---------------- Transactions ----------------
  var F = { period: "month", type: "", bank: "", cats: [] };
  P["finances/transactions"] = { html: function () {
    var t0 = F.period === "today" ? new Date(2026, 8, 29) : F.period === "month" ? new Date(2026, 8, 1) : new Date(2026, 0, 1);
    var rows = D.tx.filter(function (t) { var a = U.acct(t.acct);
      return t.date >= t0 && (!F.type || (F.type === "card") === U.isCard(a)) && (!F.bank || a.bank === F.bank); });
    var chipsRows = rows.slice(), catTot = {};
    chipsRows.forEach(function (t) { if (t.cat !== "Transfer" && t.amount < 0) catTot[t.cat] = (catTot[t.cat] || 0) - t.amount; });
    if (F.cats.length) rows = rows.filter(function (t) { return F.cats.indexOf(t.cat) >= 0; });
    var spent = sum(rows.filter(function (t) { return t.amount < 0 && t.cat !== "Transfer"; }), function (t) { return -t.amount; });
    var income = sum(rows.filter(function (t) { return t.amount > 0 && t.cat !== "Transfer"; }), function (t) { return t.amount; });
    var h = head("Transactions", rows.length + " transactions · " + (F.period === "today" ? "today" : F.period === "month" ? "Sep 1 – Sep 29, 2026" : "Aug 1 – Sep 29, 2026"));
    function chip(kind, v, label, on, style) { return '<a class="fchip' + (style ? " ftype" : "") + (on ? " on" : "") + '" data-k="' + kind + '" data-v="' + v + '" href="#"' + (style ? ' style="--ac:' + style + '"' : "") + '>' + label + '</a>'; }
    h += '<div class="ffil"><div class="fchips">' + [["today", "Today"], ["month", "This month"], ["year", "This year"]].map(function (p) { return chip("period", p[0], p[1], F.period === p[0]); }).join("") + '</div>' +
      '<div class="fchips">' + chip("type", "", "All accounts", !F.type) + chip("type", "card", "💳 Cards", F.type === "card", U.CARD) + chip("type", "bank", "🏦 Bank", F.type === "bank", U.BANK) + '</div>' +
      '<div class="fchips wrap">' + chip("bank", "", "All banks", !F.bank) + Object.keys(D.banks).filter(function (k) { return k !== "ATL"; }).map(function (k) { return chip("bank", k, D.banks[k].name, F.bank === k, D.banks[k].color); }).join("") + '</div></div>';
    // spending by day (this month) or by week
    var byday = {}; rows.forEach(function (t) { if (t.amount < 0 && t.cat !== "Transfer") { var k = t.date.toDateString(); byday[k] = (byday[k] || 0) - t.amount; } });
    var days = []; for (var d = new Date(t0); d <= new Date(2026, 8, 29); d.setDate(d.getDate() + 1)) days.push(byday[d.toDateString()] || 0);
    var mx = Math.max.apply(null, days.concat([1]));
    var cats = Object.keys(catTot).sort(function (a, b) { return catTot[b] - catTot[a]; }), ctot = sum(cats, function (c) { return catTot[c]; });
    h += '<div class="card"><div class="row between"><span><span class="small muted">Spent</span><br><b style="font-size:22px">' + cur(spent) + '</b></span>' +
      '<span style="text-align:right"><span class="small muted">Income</span><br><b class="pos" style="font-size:22px">' + cur(income) + '</b></span></div>' +
      (days.length > 1 ? '<div class="fchart">' + days.map(function (v) { return '<a><i style="height:' + Math.round(v / mx * 100) + '%"></i></a>'; }).join("") + '</div>' : "") +
      (ctot ? '<div class="fmix">' + cats.map(function (c) { return '<a style="flex:' + catTot[c] + ';background:' + D.cats[c] + '"></a>'; }).join("") + '</div>' : "") +
      '<div class="fchips wrap" style="margin-top:8px">' + cats.map(function (c) { return '<a class="fchip fcatc' + (F.cats.indexOf(c) >= 0 ? " on" : "") + '" data-k="cat" data-v="' + c + '" style="--cc:' + D.cats[c] + '" href="#"><i></i>' + c + ' <span>' + km(catTot[c]) + '</span></a>'; }).join("") +
      (F.cats.length ? '<a class="fchip" data-k="cat" data-v="" href="#">✕ clear</a>' : "") + '</div></div>';
    var groups = [], last = null;
    rows.forEach(function (t) { var k = t.date.toDateString(); if (k !== last) { groups.push({ d: t.date, rows: [] }); last = k; } groups[groups.length - 1].rows.push(t); });
    h += groups.map(function (g, i) { var sp = sum(g.rows.filter(function (t) { return t.amount < 0 && t.cat !== "Transfer"; }), function (t) { return -t.amount; });
      var diff = Math.round((new Date(2026, 8, 29) - g.d) / 864e5);
      return '<div class="fday"><b>' + (diff === 0 ? "Today" : diff === 1 ? "Yesterday" : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][g.d.getDay()] + ", " + U.md(g.d)) + '</b><span class="small muted">' + (sp ? cur(sp) : "") + '</span></div>' +
        '<div class="card flist">' + (i === 0 ? U.runhead() : "") + g.rows.map(function (t) { return U.txrow(t, false, true); }).join("") + '</div>'; }).join("") ||
      '<div class="card muted">Nothing matches these filters.</div>';
    return h + '<div class="small muted" style="margin-top:8px"><span class="fkey" style="--ac:' + U.CARD + '"></span> credit card · <span class="fkey" style="--ac:' + U.BANK + '"></span> bank account · dot = the bank\'s colour</div>';
  }, init: function (root, again) {
    root.addEventListener("click", function (e) { var c = e.target.closest(".fchip[data-k]"); if (!c) return; e.preventDefault();
      var k = c.dataset.k, v = c.dataset.v;
      if (k === "cat") { if (!v) F.cats = []; else { var i = F.cats.indexOf(v); if (i >= 0) F.cats.splice(i, 1); else F.cats.push(v); } }
      else F[k] = v;
      again(); });
  } };

  // ---------------- History: month by month ----------------
  P["finances/history"] = { html: function () {
    var months = [["Oct", 7120, 9180], ["Nov", 6840, 9180], ["Dec", 9310, 11420], ["Jan", 6620, 9180], ["Feb", 6150, 9180], ["Mar", 7480, 9180], ["Apr", 6930, 9380],
                  ["May", 7810, 9380], ["Jun", 8240, 9380], ["Jul", 9020, 9380], ["Aug", 7560, 9380], ["Sep", 6980, 9380]];
    var mx = Math.max.apply(null, months.map(function (m) { return Math.max(m[1], m[2]); }));
    var avg = sum(months, function (m) { return m[1]; }) / 12;
    var cats = [["Mortgage", 2845], ["Groceries", 1180], ["Dining", 640], ["Kids", 520], ["Utilities", 480], ["Shopping", 610], ["Insurance", 142], ["Fuel & charging", 210], ["Subscriptions", 69]];
    var ctot = sum(cats, function (c) { return c[1]; });
    var h = head("History", "12 months · spent vs income");
    h += '<div class="card g3d lvbox" style="--tc:#2F5BD3" data-lvkey="fin:months"><div class="row between lvhead"><b style="font-size:17px">Month by month' + lvdots() + '</b><span class="small">avg spent <b>' + cur0(avg) + '</b></span></div>' +
      '<div class="fbars">' + months.map(function (m, i) { return '<div><i class="' + (i === 11 ? "live" : "") + '" style="height:' + Math.round(m[1] / mx * 100) + '%"></i><small>' + m[0] + '</small></div>'; }).join("") + '</div>' +
      '<div class="lv1" style="margin-top:8px">' + months.slice().reverse().map(function (m) { return '<div class="row between small" style="padding:3px 0;border-top:1px solid var(--line)"><span>' + m[0] + '</span><span>spent <b>' + cur0(m[1]) + '</b> · income <b class="pos">' + cur0(m[2]) + '</b> · saved <b>' + cur0(m[2] - m[1]) + '</b></span></div>'; }).join("") + '</div></div>';
    h += '<div class="card g3d lvbox" style="--tc:#8A4FB8" data-lvkey="fin:cats"><div class="row between lvhead"><b style="font-size:17px">Where it goes · a usual month' + lvdots() + '</b><b>' + cur0(ctot) + '</b></div>' +
      cats.map(function (c, i) { return '<a class="fcat' + (i >= 5 ? " lv1" : "") + '" href="#/finances/transactions"><span>' + c[0] + '</span><i style="width:' + Math.round(c[1] / cats[0][1] * 100) + '%;background:' + (D.cats[c[0]] || "#2F5BD3") + '"></i><b>' + cur0(c[1]) + '</b></a>'; }).join("") + '</div>';
    return h;
  } };

  // ---------------- Radar ----------------
  function subline(s, kind) {
    var a = U.acct(s.acct), b = U.bankOf(a), RH = { monthly: "Monthly", yearly: "Yearly" };
    return '<div class="swipe lv1"><form class="swacts"><button class="sw done" data-keep>✓<span>Keep</span></button><button class="sw defer">⏹<span>Cancelled</span></button><button class="sw cancel">✕<span>Not a ' + (kind === "bills" ? "bill" : "sub") + '</span></button></form>' +
      '<div class="uline swrow"><span class="ultext"><b>' + esc(s.name) + '</b><span><span class="fwhy rh-' + s.rhythm + '">' + RH[s.rhythm] + '</span>' + b.name + ' ••' + a.end + (s.who ? " · " + s.who : "") + ' · ' + cur(s.ytd) + ' this yr</span></span>' +
      '<span class="ulwhen"><b>' + (s.varies ? "~" : "") + cur(s.amount) + '</b><span>' + s.next + (s.varies ? " · " + cur0(s.varies[0]) + "–" + cur0(s.varies[1]) : "") + '</span></span></div></div>';
  }
  P["finances/radar"] = { html: function () {
    var n = D.alerts.length;
    var h = head("Radar", "Needs attention · subscriptions · bills · spending patterns");
    h += '<div class="card g3d furgent lvbox hasover" style="--tc:#B3261E" data-lvkey="fin:attention"><div class="row between lvhead" style="cursor:pointer"><span class="row" style="gap:10px"><span style="font-size:22px">⚠</span><span><b style="font-size:17px">Needs attention</b>' +
      '<span class="small muted" style="display:block">' + n + ' items · 2 fee / duplicate · 1 from subscriptions</span></span></span><span class="row" style="gap:8px"><b style="font-size:26px">' + n + '</b><span class="lvdots">○○</span></span></div>' +
      D.alerts.map(function (r) { var a = U.acct(r.acct);
        return '<div class="swipe lv1"><form class="swacts"><button class="sw done">✓<span>Handled</span></button><button class="sw defer">👍<span>Not an issue</span></button></form>' +
          '<div class="uline swrow ' + (r.hot ? "overdue" : "soon") + '"><span class="ultext"><b>' + esc(r.name) + '</b><span><span class="fwhy' + (r.hot ? " hot" : "") + '">' + r.why + '</span> ' + U.bankOf(a).name + ' ••' + a.end + '</span></span>' +
          '<span class="ulwhen"><b>' + cur(-r.amount) + '</b><span>' + r.date + '</span></span></div></div>'; }).join("") +
      '<div class="swhint lv1">← Swipe left to clear an item</div></div>';
    [["subs", "Subscriptions", "#2F5BD3", D.subs], ["bills", "Bills", "#2F8FB0", D.bills]].forEach(function (g) {
      var list = g[3], mo = sum(list, function (s) { return s.rhythm === "yearly" ? s.amount / 12 : s.amount; }), ytd = sum(list, function (s) { return s.ytd; });
      h += '<div class="card g3d fin3d fcompact lvbox" style="--tc:' + g[2] + '" data-lvkey="fin:radar-' + g[0] + '"><div class="row between lvhead" style="cursor:pointer"><span><b style="font-size:17px">' + g[1] + '</b>' +
        '<span class="small muted" style="display:block">' + list.length + ' · ' + cur(mo) + '/mo · ' + cur0(ytd) + ' this year</span></span>' +
        '<span class="row" style="gap:8px"><b style="font-size:20px">' + cur0(mo * 12) + '<span class="small muted">/yr</span></b><span class="lvdots">○○</span></span></div>' +
        list.map(function (s) { return subline(s, g[0]); }).join("") + '<div class="swhint lv1">← Swipe left: Keep · Cancelled · Not a ' + (g[0] === "bills" ? "bill" : "sub") + '</div></div>';
    });
    return h + '<p class="small muted">Found in the household\'s own transactions: same merchant and account, about the same amount, at a steady rhythm. Yearly ones get a Daily Tasks reminder 7 days before the charge.</p>';
  } };

  // ---------------- Rental CF ----------------
  var RC = { home: "cedar" };
  P.rentcf = { html: function () {
    var hm = D.homes.filter(function (x) { return x.key === RC.home; })[0], r = D.rentals[RC.home];
    var putIn = r.down + r.closing + r.improve, ys = r.years.map(function (y) { var noi = y[1] - y[2]; return { y: y[0], rent: y[1], opex: y[2], noi: noi, intr: y[3], prin: y[4], cash: noi - y[3] - y[4] }; });
    var tot = { rent: 0, opex: 0, noi: 0, intr: 0, prin: 0, cash: 0 }; ys.forEach(function (y) { for (var k in tot) tot[k] += y[k]; });
    var equity = hm.value - hm.loan, rcash = U.acct(RC.home === "cedar" ? "a8" : "a9").bal;
    var h = head("Rental CF", hm.name + " · bought " + r.bought + " · rented from " + r.firstRent);
    h += '<div class="fchips" style="margin-bottom:6px">' + D.homes.filter(function (x) { return x.kind === "rental"; }).map(function (x) { return '<a class="fchip' + (x.key === RC.home ? " on" : "") + '" data-home="' + x.key + '" href="#" style="' + (x.key === RC.home ? "background:" + x.color + ";border-color:" + x.color : "") + '">⌂ ' + x.name + '</a>'; }).join("") + '</div>';
    h += '<div class="card g3d" style="--tc:' + hm.color + '"><div class="row between"><b style="font-size:17px">Profit incl. principal</b><b style="font-size:22px" class="pos">' + cur0(tot.cash + tot.prin) + '</b></div>' +
      '<div class="lk3 lk4" style="margin-top:6px"><div><span>Cash profit</span><b>' + cur0(tot.cash) + '</b></div><div><span>Principal paid</span><b>' + cur0(tot.prin) + '</b></div>' +
      '<div><span>Put in at purchase</span><b>' + km(putIn) + '</b></div><div><span>NOI this year</span><b>' + km(ys[ys.length - 1].noi) + '</b></div></div>' +
      '<div class="small muted" style="margin-top:6px">Rent ' + cur0(hm.rent) + '/mo · tenant ' + r.tenant + ' · deposit held ' + cur0(hm.rent) + '</div></div>';
    // chart: yearly % (NOI yield, cash-on-cash, + principal) with the $ over each bar
    var mx = Math.max.apply(null, ys.map(function (y) { return (y.cash + y.prin) / putIn; }).concat([0.1]));
    h += '<div class="card g3d lvbox" style="--tc:' + hm.color + '" data-lvkey="rc:chart"><div class="row between lvhead"><b style="font-size:17px">Return by year' + lvdots() + '</b><span class="small muted">cash + principal ÷ put in</span></div>' +
      '<div class="rcbars">' + ys.map(function (y) { var v = (y.cash + y.prin) / putIn;
        return '<div><em>' + km(y.cash + y.prin) + '</em><i style="height:' + Math.max(3, Math.round(v / mx * 100)) + '%;background:' + hm.color + '"></i><small>' + y.y + '</small><small class="muted">' + (v * 100).toFixed(1) + '%</small></div>'; }).join("") + '</div>' +
      '<div class="small muted lv1" style="margin-top:6px">Typical for a rental: 8% a year incl. principal · NOI yield 5.5% · cash-on-cash 5%. First year is partial.</div></div>';
    h += '<div class="card g3d lvbox" style="--tc:' + hm.color + '" data-lvkey="rc:table"><div class="row between lvhead"><b style="font-size:17px">Year by year' + lvdots() + '</b><b>' + cur0(tot.cash) + '</b></div>' +
      '<div class="lv1" style="overflow-x:auto"><table class="rctbl"><tr><th></th><th class="r">Rent</th><th class="r">Costs</th><th class="r">NOI</th><th class="r">Interest, tax &amp; ins.</th><th class="r">Principal</th><th class="r">Cash</th></tr>' +
      ys.map(function (y) { return '<tr><td>' + y.y + '</td><td class="r">' + km(y.rent) + '</td><td class="r">' + km(y.opex) + '</td><td class="r">' + km(y.noi) + '</td><td class="r">' + km(y.intr) + '</td><td class="r">' + km(y.prin) + '</td><td class="r"><b class="' + (y.cash >= 0 ? "pos" : "") + '">' + km(y.cash) + '</b></td></tr>'; }).join("") +
      '<tr class="tot"><td>Total</td><td class="r">' + km(tot.rent) + '</td><td class="r">' + km(tot.opex) + '</td><td class="r">' + km(tot.noi) + '</td><td class="r">' + km(tot.intr) + '</td><td class="r">' + km(tot.prin) + '</td><td class="r"><b>' + km(tot.cash) + '</b></td></tr></table></div></div>';
    h += '<div class="card g3d lvbox" style="--tc:' + hm.color + '" data-lvkey="rc:bs"><div class="row between lvhead"><b style="font-size:17px">Balance sheet' + lvdots() + '</b><b>' + cur0(equity + rcash - hm.rent) + '</b></div>' +
      '<div class="lv1 small">' + [["Cash in the LLC account", rcash], ["Home at today's value", hm.value], ["Lender's loan", -hm.loan], ["Owed to tenant (deposit)", -hm.rent]].map(function (x) { return '<div class="row between" style="padding:3px 0;border-top:1px solid var(--line)"><span>' + x[0] + '</span><b>' + cur0(x[1]) + '</b></div>'; }).join("") + '</div></div>';
    return h;
  }, init: function (root, again) {
    root.addEventListener("click", function (e) { var c = e.target.closest(".fchip[data-home]"); if (!c) return; e.preventDefault(); RC.home = c.dataset.home; again(); });
  } };

  // ---------------- Net Worth ----------------
  function perf(inv, bal) { var g = bal - inv; return "inv " + km(inv) + " · gain <span class=\"" + (g >= 0 ? "nwpos" : "nwneg") + "\">" + km(g, true) + " (" + U.pct(g / inv) + ")</span>"; }
  function pill(name, amount, small, alt) {
    return '<div class="gacct gpill ' + (alt ? "alt" : "") + ' lv1"><div class="grow"><span class="gname"><i></i><span class="gnmain">' + name + '</span>' + (small ? '<small class="nwperf">' + small + '</small>' : "") + '</span>' +
      '<span class="gamt"><b>' + cur(amount) + '</b></span><span class="gchev">›</span></div></div>';
  }
  function l2(key, title, color, total, sumline, inner) {
    return '<div class="card g3d fgroup lvbox nwl2" style="--tc:' + color + '" data-lvkey="nw:' + key + '"><div class="ghead lvhead"><span>' + title + lvdots() + '</span><b>' + cur(total) + '</b></div>' +
      (sumline ? '<div class="nwsum">' + sumline + '</div>' : "") + inner + '</div>';
  }
  P.networth = { html: function () {
    var inv = byType(["cd", "stocks", "retirement", "hsa", "529"]), invIn = sum(inv.filter(function (a) { return a.inv; }), function (a) { return a.inv; }) + 25000;
    var homeVal = sum(D.homes, function (x) { return x.value; }), carVal = sum(D.cars, function (c) { return c.value; });
    var h = head("Net Worth", "What you own − what you owe · from Finances, Homes and Cars", '<a class="btn" href="#/networth/realestate">Real Estate ›</a>');
    h += '<div class="card g3d" style="--tc:#2E8B57"><div class="row between"><b style="font-size:17px">Net worth</b><b style="font-size:22px">' + cur(T.netWorth) + '</b></div>' +
      '<div class="lk3 nwk" style="margin-top:6px"><div><span>You own</span><b>' + cur0(T.own) + '</b></div><div><span>You owe</span><b>' + cur0(T.owe) + '</b></div><div><span>Home equity</span><b>' + cur0(T.homeEquity) + '</b></div></div></div>';
    var own = l2("cash", "Cash & Liquid", "#2F6FD0", T.cash + T.rentalCash, '<span>interest <b class="nwpos">+$871</b></span><span>2026 <b class="nwpos">+$612</b></span>',
        byType(["checking", "savings", "rental"]).map(function (a, i) { return U.acctrow(a, { alt: i % 2 }); }).join("")) +
      l2("inv", "Investments", "#2E8B57", T.invested, '<span>invested <b>' + km(invIn) + '</b></span><span>gain <b class="nwpos">' + km(T.invested - invIn, true) + ' (' + U.pct((T.invested - invIn) / invIn) + ')</b></span>',
        inv.map(function (a, i) { return U.acctrow(a, { alt: i % 2, small: a.inv ? perf(a.inv, a.bal) : "3 CDs · 4.35% avg", who: false }); }).join("")) +
      l2("re", "Real Estate", "#F2612D", homeVal, '<span>equity <b>' + km(T.homeEquity) + '</b></span><span>3 homes</span>',
        D.homes.map(function (x, i) { return pill("⌂ " + x.name + (x.kind === "own" ? " · your home" : " · rental"), x.value, "equity " + km(x.value - x.loan - (x.heloc || 0)) + " · loan " + km(x.loan) + (x.heloc ? " · HELOC " + km(x.heloc) : ""), i % 2); }).join("")) +
      l2("pp", "Personal Property", "#7B2FF7", carVal, '<span>2 vehicles</span>',
        D.cars.map(function (c, i) { return pill("◎ " + c.year + " " + c.name, c.value, "paid " + km(c.paid) + " · value today", i % 2); }).join(""));
    h += '<div class="nwl1 lvbox" data-lvkey="nw:own"><div class="nwhead nwh1 lvhead"><b>What you own' + lvdots() + '</b><b>' + cur(T.own) + '</b></div><div class="lv1">' + own + '</div></div>';
    var owe = l2("loans", "Mortgages & HELOC", "#C2410C", sum(D.homes, function (x) { return x.loan + (x.heloc || 0); }), '<span>borrowed <b>' + km(sum(D.homes, function (x) { return x.borrowed; })) + '</b></span>',
        D.homes.map(function (x, i) { return pill(x.name + " mortgage · " + x.rate + "%", x.loan, "borrowed " + km(x.borrowed) + " · repaid " + km(x.borrowed - x.loan) + " (" + Math.round((1 - x.loan / x.borrowed) * 100) + "%)", i % 2); }).join("") +
        pill("Maple HELOC", D.homes[0].heloc, "limit " + km(D.homes[0].helocLimit) + " · variable rate", true)) +
      l2("car", "Car loans", "#7B2FF7", T.carDebt, "", pill("Ioniq 5 loan · 3.9%", D.cars[0].loan, "borrowed " + km(D.cars[0].borrowed) + " · repaid " + km(D.cars[0].borrowed - D.cars[0].loan), false)) +
      l2("cards", "Credit cards", "#8A5A9E", T.cardDebt, "<span>2 cards · 2 banks</span>", byType(["card"]).map(function (a, i) { return U.acctrow(a, { alt: i % 2 }); }).join(""));
    h += '<div class="nwl1 lvbox" data-lvkey="nw:owe"><div class="nwhead nwh1 lvhead"><b>What you owe' + lvdots() + '</b><b>' + cur(T.owe) + '</b></div><div class="lv1">' + owe + '</div></div>';
    // trend: 12 months, one line
    var pts = D.trend, lo = Math.min.apply(null, pts.map(function (p) { return p.v; })), hi = Math.max.apply(null, pts.map(function (p) { return p.v; }));
    var pad = (hi - lo) * 0.15, y = function (v) { return 100 - (v - lo + pad) / (hi - lo + 2 * pad) * 100; };
    var line = pts.map(function (p, i) { return (i / (pts.length - 1) * 300).toFixed(1) + "," + y(p.v).toFixed(1); }).join(" ");
    var chg = pts[pts.length - 1].v - pts[0].v;
    h += '<div class="card g3d lvbox nwtr" data-lvkey="nw:trend" style="--tc:#1D4ED8;margin-top:14px"><div class="row between lvhead"><b>Trend' + lvdots() + '</b><span class="small">1 year <span style="color:' + (chg >= 0 ? "#2E8B57" : "#C0392B") + '">' + (chg >= 0 ? "+" : "") + cur0(chg) + '</span></span></div>' +
      '<div class="lv1" style="margin-top:6px"><div class="nwtrchart"><svg viewBox="0 0 300 100" preserveAspectRatio="none"><defs><linearGradient id="nwg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1D4ED8" stop-opacity=".28"/><stop offset="1" stop-color="#1D4ED8" stop-opacity="0"/></linearGradient></defs>' +
      '<polygon points="0,100 ' + line + ' 300,100" fill="url(#nwg)"/><polyline points="' + line + '" fill="none" stroke="#1D4ED8" stroke-width="3" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>' +
      [hi, (hi + lo) / 2, lo].map(function (v) { return '<span class="nwtrgy" style="top:' + y(v) + '%">' + km(v) + '</span>'; }).join("") + '</div>' +
      '<div class="nwtrx">' + pts.map(function (p, i) { return i % 2 ? "" : '<span style="left:' + (i / (pts.length - 1) * 100) + '%">' + p.m + '</span>'; }).join("") + '</div></div></div>';
    return h;
  } };

  // ---------------- Net Worth › Real Estate ----------------
  var RE = { metric: "equity" };
  P["networth/realestate"] = { html: function () {
    var homes = D.homes.map(function (x) {
      var r = D.rentals[x.key] || { down: x.down, closing: x.closing, improve: x.improve, years: [], price: x.price, bought: x.bought };
      var putIn = r.down + r.closing + r.improve, cash = sum(r.years, function (y) { return y[1] - y[2] - y[3] - y[4]; }), eq = x.value - x.loan - (x.heloc || 0);
      return { name: x.name, color: x.color, kind: x.kind, price: r.price, bought: r.bought, value: x.value, loan: x.loan + (x.heloc || 0), equity: eq, putIn: putIn, cash: cash,
               back: eq + cash, gain: eq + cash - putIn, pctg: (eq + cash - putIn) / putIn };
    });
    var M = { equity: ["Equity", "equity"], gain: ["Gain", "gain"], pctg: ["Gain %", "pctg"], value: ["Value", "value"] };
    var mk = RE.metric, mx = Math.max.apply(null, homes.map(function (x) { return Math.abs(x[mk]); }));
    var fmt = function (v) { return mk === "pctg" ? U.pct(v) : km(v); };
    var tIn = sum(homes, function (x) { return x.putIn; }), tBack = sum(homes, function (x) { return x.back; });
    var h = head("Real Estate", "3 homes · your home and 2 rentals");
    h += '<div class="card g3d" style="--tc:#F2612D"><div class="lk3 lk4"><div><span>Equity + rental</span><b>' + km(tBack) + '</b></div><div><span>Money in</span><b>' + km(tIn) + '</b></div><div><span>Gain</span><b class="nwpos">' + km(tBack - tIn, true) + '</b></div><div><span>Back ÷ in</span><b>' + (tBack / tIn).toFixed(1) + '×</b></div></div>' +
      '<div class="mbar" style="height:10px;margin-top:8px">' + homes.map(function (x) { return '<i style="flex:' + x.equity + ';background:' + x.color + '"></i>'; }).join("") + '</div>' +
      '<div class="mlegend">' + homes.map(function (x) { return '<span><i style="background:' + x.color + '"></i>' + x.name + '</span>'; }).join("") + '</div></div>';
    h += '<div class="card g3d lvbox" style="--tc:#2E8B57" data-lvkey="re:cmp"><div class="row between lvhead"><b style="font-size:17px">Compare homes' + lvdots() + '</b><span class="small muted">' + M[mk][0] + '</span></div>' +
      '<div class="fchips" style="margin:6px 0">' + Object.keys(M).map(function (k) { return '<a class="fchip' + (k === mk ? " on" : "") + '" data-m="' + k + '" href="#">' + M[k][0] + '</a>'; }).join("") + '</div>' +
      homes.map(function (x) { var w = Math.abs(x[mk]) / mx * 100; return '<div class="rebar"><span class="rebn">' + x.name + ' <small>' + x.bought + '</small></span><span class="rebt"><i class="' + (x[mk] < 0 ? "neg" : "") + '" style="left:0;width:' + w.toFixed(1) + '%;background:' + x.color + '"></i></span><span class="rebv">' + fmt(x[mk]) + '</span></div>'; }).join("") + '</div>';
    var mio = Math.max.apply(null, homes.map(function (x) { return Math.max(x.putIn, x.back); }));
    h += '<div class="card g3d lvbox" style="--tc:#2E8B57" data-lvkey="re:io"><div class="row between lvhead"><b style="font-size:17px">Put in vs got back' + lvdots() + '</b><span class="small">' + km(tIn) + ' → <b>' + km(tBack) + '</b></span></div>' +
      '<div class="relegend lv1"><span><i class="in"></i>put in</span><span><i class="back"></i>equity + rental cash</span></div>' +
      homes.map(function (x) { return '<div class="reio lv1"><div class="row between small"><b>' + x.name + '</b><span>gain <b class="nwpos">' + km(x.gain, true) + '</b> · ' + (x.back / x.putIn).toFixed(1) + '×</span></div>' +
        '<div class="rebar2"><i class="in" style="width:' + (x.putIn / mio * 80).toFixed(1) + '%"></i><em>' + km(x.putIn) + '</em></div><div class="rebar2"><i class="back" style="width:' + (x.back / mio * 80).toFixed(1) + '%"></i><em>' + km(x.back) + '</em></div></div>'; }).join("") + '</div>';
    var rows = [["Bought", "bought", 0], ["Price", "price", 1], ["Value today", "value", 1], ["Loan today", "loan", 1], ["Equity", "equity", 1], ["Put in", "putIn", 1], ["Rental cash", "cash", 1], ["Gain", "gain", 1], ["Gain %", "pctg", 2]];
    h += '<div class="card g3d lvbox" style="--tc:#2E8B57" data-lvkey="re:side"><div class="row between lvhead"><b style="font-size:17px">Side by side' + lvdots() + '</b><span class="small muted">every figure per home</span></div><div class="lv1 retbl-wrap"><table class="retbl"><tr><th></th>' +
      homes.map(function (x) { return '<th style="border-bottom-color:' + x.color + '">' + x.name + '<small>' + (x.kind === "own" ? "your home" : "rental") + '</small></th>'; }).join("") + '</tr>' +
      rows.map(function (r) { return '<tr><td>' + r[0] + '</td>' + homes.map(function (x) { var v = x[r[1]]; return '<td>' + (r[2] === 0 ? v : r[2] === 2 ? U.pct(v) : km(v)) + '</td>'; }).join("") + '</tr>'; }).join("") + '</table></div></div>';
    return h;
  }, init: function (root, again) {
    root.addEventListener("click", function (e) { var c = e.target.closest(".fchip[data-m]"); if (!c) return; e.preventDefault(); RE.metric = c.dataset.m; again(["re:cmp"]); });
  } };
})();
