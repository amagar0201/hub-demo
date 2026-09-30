/* Assets area (Cars, Homes) and Rentals area (Rental Homes, Tenants). Same tiles, cards and levels as the real app. */
(function () {
  var D = window.DEMO, U = window.UI, P = window.PAGES;
  var cur0 = U.cur0, km = U.km, esc = U.esc;
  function head(title, sub, right) { return '<header class="top"><div><h1>' + title + '</h1><div class="sub">' + sub + '</div></div>' + (right || "") + '</header>'; }
  function logBtn() { return '<a class="btn primary" href="#" onclick="UI.toast(\'Demo · logging is turned off\');return false">＋ Log</a>'; }
  function miles(n) { return Math.round(n).toLocaleString("en-US"); }
  function byKey(list, k) { return list.filter(function (x) { return x.key === k; })[0]; }

  var SIL = {
    suv: '<svg viewBox="0 0 64 32" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M5 22V16.5C5 15 6 14 7.5 13.8L14 13L19 6.5C19.8 5.5 21 5 22.3 5H47C48.5 5 49.7 5.8 50.3 7L54 13L57.5 13.8C59 14.2 60 15.4 60 17V22C60 23.1 59.1 24 58 24H55A6 6 0 0 0 43 24H21A6 6 0 0 0 9 24H7C5.9 24 5 23.1 5 22ZM21 7.5L17 12.8H30V7.5ZM32.5 7.5V12.8H44V7.5ZM46.5 7.5V12.8H51L48.3 7.9C48 7.6 47.7 7.5 47.3 7.5Z"/><circle cx="15" cy="24" r="4.6" fill="currentColor"/><circle cx="49" cy="24" r="4.6" fill="currentColor"/></svg>',
    sedan: '<svg viewBox="0 0 64 32" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M4 22C4 19 5 17.5 8 17L17 15.5C20 11 25 8 31 7.5C38 7 44 8.5 50 13L56 15C59 16 60 18 60 21V22C60 23 59 24 58 24H55A6 6 0 0 0 43 24H21A6 6 0 0 0 9 24H6C5 24 4 23 4 22ZM21 15C24 11.5 27 10 31 9.8V15ZM33 9.8C38 9.8 42 11 46 14.5L33 15Z"/><circle cx="15" cy="24" r="4.6" fill="currentColor"/><circle cx="49" cy="24" r="4.6" fill="currentColor"/></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true" style="width:58%"><path fill="currentColor" d="M12 3 2 11.5h3V21h5.5v-6h3v6H19v-9.5h3z"/></svg>'
  };
  function vicon(color, body, size) { return '<span class="vicon" style="--vc:' + color + ';width:' + size + 'px;height:' + size + 'px">' + SIL[body] + '</span>'; }
  function swipeTask(inner) {
    return '<div class="swipe"><form class="swacts"><button class="sw done">✓<span>Done</span></button><button class="sw defer">⏸<span>+1 month</span></button><button class="sw cancel">✕<span>Cancel</span></button></form>' + inner + '</div>';
  }
  function when(d) { return d < 0 ? -d + "d late" : d === 0 ? "today" : "in " + d + "d"; }

  // ================= Cars =================
  function carUrgent() {
    var items = [];
    D.cars.forEach(function (c) { D.carx[c.key].service.forEach(function (s) { if (s[3]) items.push({ car: c, s: s }); }); });
    var ov = items.filter(function (x) { return x.s[3] === "overdue"; }).length;
    return '<section class="tile3 urgent' + (ov ? " hasover" : "") + '" data-lvkey="cars:urgent" data-lvgroup="cars"><button class="t3head lvhead" type="button"><span class="t3icon">⚠</span>' +
      '<span class="t3main"><span class="t3title">Urgent</span><span class="t3sub">' + items.length + ' items' + (ov ? " · " + ov + " overdue" : "") + '</span></span><span class="t3big">' + items.length + '</span></button>' +
      '<div class="t3body">' + items.map(function (x) {
        return swipeTask('<a class="uline swrow ' + x.s[3] + '" href="#/cars/history"><span class="ulicon">' + vicon(x.car.color, D.carx[x.car.key].body, 28) + '</span>' +
          '<span class="ultext"><b>' + x.s[0] + '</b><span>' + x.car.name + ' · ' + miles(x.car.miles) + ' mi</span></span><span class="ulwhen"><b>' + x.s[1] + '</b><span>' + when(x.s[2]) + '</span></span></a>'); }).join("") +
      '<div class="swhint">← Swipe a service item left: Done (today) · +1 month · Cancel</div>' +
      '<a class="uline" href="#/cars/swap"><span class="ulicon">❄</span><span class="ultext"><b>' + D.swap.season + ' tire swap</b><span>' + D.swap.why + '</span></span><span class="ulwhen"><b>' + D.swap.date + '</b><span>in ' + D.swap.inDays + 'd</span></span></a>' +
      '</div></section>';
  }
  function carCard(c, x) {
    var ln = x.loan, pct = Math.round((1 - ln.owed / ln.amount) * 100);
    var h = '<div class="card vcard" style="--vc:' + c.color + '"><div class="row between" style="align-items:flex-start"><div class="row" style="gap:12px">' + vicon(c.color, x.body, 44) +
      '<span><h2 style="margin:0;white-space:nowrap;font-size:18px">' + c.year + ' ' + c.name + '</h2><span class="vlinks"><a href="#/cars/history">All events ›</a><a href="#/cars/history">Mileage ›</a><a href="#/cars/history">Service ›</a></span></span></div>' +
      '<span class="chip Summer" style="flex:none"><span class="dot Summer"></span>Summer on</span></div>' +
      '<div class="small muted odoline" style="margin-top:8px">Odometer ' + miles(c.miles) + ' · Sep 14 · ≈ ' + miles(c.miles + 500) + ' today</div>' +
      '<ul class="comingup">' + x.service.map(function (s) { return '<li class="' + s[3] + '"><a href="#/cars/history">🔧 ' + s[0] + ' · ' + s[1] + ' <span class="cuwhen">(in ' + s[2] + ' days)</span></a></li>'; }).join("") + '</ul>' +
      '<a class="loanbox tight" href="#/cars"><div class="lk3 lk4"><div><span>Bought</span><b>' + cur0(ln.bought) + '</b><small>' + ln.year + '</small></div>' +
      '<div><span>Loan</span><b>' + cur0(ln.amount) + '</b><small>' + ln.apr + '% APR</small></div>' +
      '<div><span>Outstanding</span><b>' + cur0(ln.owed) + (ln.owed ? "" : ' <span class="paidok">✓</span>') + '</b><span class="pbar"><i style="width:' + pct + '%"></i><em>' + (ln.owed ? pct + "% paid" : "Paid off") + '</em></span></div>' +
      '<div><span>Last paid</span>' + (ln.last ? '<b>' + cur0(ln.last[0]) + '</b><small>' + ln.last[1] + '</small><small>P $' + ln.last[2] + ' · I $' + ln.last[3] + '</small>' : '<b>—</b><small>paid off ' + ln.paidOff + '</small>') + '</div></div>' +
      '<div class="small lkfoot"><span>' + (ln.payoff ? "🏁 Payoff ≈ " + ln.payoff : ln.lender) + '</span><span>All payments ›</span></div></a><div style="margin-top:8px">' +
      x.sets.map(function (s) { var wp = Math.round(s.miles / s.warranty * 100);
        return '<a class="setrow" href="#/cars/history"><div class="row between"><span class="row"><span class="dot ' + s.season + '"></span><b>' + s.season + '</b>' + (s.on ? ' <span class="small muted">· on car</span>' : "") + '</span>' +
          '<span class="big" style="font-size:22px">' + miles(s.miles) + ' <span class="small muted">mi</span></span></div><div class="small muted sdesc">' + s.desc + '</div>' +
          '<div class="bar' + (wp >= 80 ? " hot" : "") + '"><i style="width:' + wp + '%"></i></div><div class="small muted">' + wp + '% of ' + miles(s.warranty) + ' mi warranty' + (s.on ? " · " + miles(s.sinceRot) + " mi since rotation" : "") + '</div></a>'; }).join("") +
      '</div><div class="row wrapf" style="margin-top:10px"><a class="btn" href="#" onclick="UI.toast(\'Demo · logging is turned off\');return false">⇄ Swap</a><a class="btn" href="#" onclick="UI.toast(\'Demo · logging is turned off\');return false">Odometer</a></div></div>';
    return h;
  }
  P.cars = { html: function () {
    var h = head("Cars", "Tuesday, Sep 29 · <a href=\"#/cars/archived\">Archived (" + D.carsArchived.length + ") ›</a>", logBtn()) + '<div class="mobi homes cars">' + carUrgent();
    D.cars.forEach(function (c) {
      var x = D.carx[c.key], ln = x.loan, u = x.service.filter(function (s) { return s[3]; }).length;
      h += '<section class="tile3 car3" data-lvkey="cars:' + c.key + '" data-lvgroup="cars" style="--vc:' + c.color + '"><button class="t3head lvhead" type="button"><span class="t3pic">' + vicon(c.color, x.body, 58) + '</span>' +
        '<span class="t3main"><span class="t3title">' + c.name + '</span><span class="t3sub">' + miles(c.miles) + ' mi · <span class="dot Summer"></span> Summer on' + (ln.owed ? '<span class="ohead"> · <b>' + cur0(ln.owed) + '</b> owed</span>' : "") + '</span>' +
        (ln.owed ? '<span class="t3sub2 compact">💳 ' + ln.apr + '% · paid P ' + km(ln.principal) + ' · I ' + km(ln.interest) + '</span>' : '<span class="t3sub2 compact">💳 loan paid off ' + ln.paidOff + '</span>') +
        (u ? '<span class="t3sub2"><span class="late">' + u + ' urgent</span></span>' : "") + '</span><span class="t3lvl lvdots">○○</span></button>' +
        '<div class="t3body">' + carCard(c, x) + '</div></section>';
    });
    return h + '</div>';
  } };
  P["cars/history"] = { html: function () {
    return head("History", "Every swap, service and odometer reading") + '<div class="card">' + D.carEvents.map(function (e) {
      var c = byKey(D.cars, e[1]);
      return '<div class="ev"><div class="when">' + e[0].replace(", 2026", "").replace(", 2025", " '25") + '</div><div class="what"><span class="vtag" style="--vc:' + c.color + '">' + vicon(c.color, D.carx[c.key].body, 22) + c.name + '</span> <b>' + e[2] + '</b>' +
        (e[4] ? '<div class="small muted">' + e[4] + '</div>' : "") + '<div class="small muted">' + miles(e[3]) + ' mi' + (e[5] ? " · " + U.cur(e[5]) : "") + '</div></div></div>'; }).join("") + '</div>';
  } };
  P["cars/swap"] = { html: function () {
    var s = D.swap;
    return head("Tire swap", "Planned from the weather forecast and past winters") +
      '<div class="card swapcard Winter"><div class="row between"><span class="row" style="gap:10px"><span class="swapicon">❄</span><span><b style="font-size:17px">Winter tires by ' + s.date + '</b><div class="small muted">' + s.why + '</div></span></span><b style="font-size:22px">' + s.inDays + 'd</b></div>' +
      '<div class="fcgrid">' + s.days.map(function (d) { return '<div class="fc' + (d[3] ? " snow" : "") + '"><b>' + d[0] + '</b><span class="small">' + d[1] + '° / ' + d[2] + '°</span>' + (d[3] ? '<span class="small">❄</span>' : "") + '</div>'; }).join("") + '</div>' +
      '<div class="small muted" style="margin-top:8px">A reminder goes to Daily Tasks 15 days before. Forecast: one free weather call a day, in the daily run.</div></div>';
  } };
  P["cars/archived"] = { html: function () {
    return head("Archived cars", "Sold / no longer owned · <a href=\"#/cars\">Active cars ›</a>") + '<div class="mobi homes">' + D.carsArchived.map(function (a) {
      return '<section class="tile3 car3" data-lvkey="carsA:1" style="--vc:' + a.color + '"><button class="t3head lvhead" type="button"><span class="t3pic">' + vicon(a.color, a.body, 58) + '</span>' +
        '<span class="t3main"><span class="t3title">' + a.name + '</span><span class="t3sub">' + a.from + ' – ' + a.to + '</span><span class="t3sub2">Bought <b>' + cur0(a.bought) + '</b> · ' + a.how + ' <b>' + cur0(a.sale) + '</b></span></span><span class="t3lvl lvdots">○○</span></button>' +
        '<div class="t3body"><div class="card vcard" style="--vc:' + a.color + '"><div class="lk3"><div><span>Bought</span><b>' + cur0(a.bought) + '</b></div><div><span>' + a.how + '</span><b>' + cur0(a.sale) + '</b></div><div><span>Last odometer</span><b>' + miles(a.odo) + '</b></div></div>' +
        '<div class="small muted" style="margin-top:6px">Loan paid off · 8 years owned</div></div></div></section>'; }).join("") + '</div>';
  } };

  // ================= Homes =================
  function hicon(hm, size) { return vicon(hm.color, "home", size); }
  function taskRow(hm, t, swipe) {
    var inner = '<a class="uline ' + (swipe ? "swrow " : "") + t[3] + '" href="#/homes/history"><span class="ulicon">' + hicon(hm, 28) + '</span><span class="ultext"><b><span class="hdot ' + t[4] + '"></span>' + t[0] + '</b><span>' + hm.name + '</span></span>' +
      '<span class="ulwhen"><b>' + t[1] + '</b><span>' + when(t[2]) + '</span></span></a>';
    return swipe ? swipeTask(inner) : inner;
  }
  function rentvcost(hm) {
    var r = D.rentals[hm.key], y = r.years[r.years.length - 1], ytdCost = y[2] + y[3] + y[4];
    var life = r.years.reduce(function (a, v) { return [a[0] + v[1], a[1] + v[2] + v[3] + v[4]]; }, [0, 0]);
    return [["2026 so far", y[1], ytdCost], ["Lifetime since " + r.firstRent.slice(-4), life[0], life[1]]].map(function (x) {
      var mx = Math.max(x[1], x[2], 1), net = x[1] - x[2];
      return '<div class="rvc"><div class="rvh"><span>' + x[0] + '</span><b class="' + (net < 0 ? "late" : "pos") + '">' + (net < 0 ? "−" : "+") + cur0(Math.abs(net)) + ' net</b></div>' +
        '<div class="rvrow"><span class="rvk">Income</span><span class="rvbar"><i class="in" style="width:' + (100 * x[1] / mx).toFixed(1) + '%"></i></span><span class="rvv">' + cur0(x[1]) + '</span></div>' +
        '<div class="rvrow"><span class="rvk">Expenses</span><span class="rvbar"><i class="ex" style="width:' + (100 * x[2] / mx).toFixed(1) + '%"></i></span><span class="rvv">' + cur0(x[2]) + '</span></div></div>'; }).join("");
  }
  function homeCard(hm) {
    var x = D.homex[hm.key], l = x.lease, g = x.mortgage, r = D.rentals[hm.key] || hm, price = r.price, pct = Math.round((1 - hm.loan / hm.borrowed) * 100);
    var down = price - hm.borrowed, paid = hm.borrowed - hm.loan;
    var h = '<div class="card vcard" style="--vc:' + hm.color + '"><div class="row between" style="align-items:flex-start"><div class="row" style="gap:12px">' + hicon(hm, 44) +
      '<span><h2 style="margin:0;font-size:18px">' + hm.name + '</h2><span class="vlinks"><a href="#/homes/history">All tasks ›</a>' + (l ? '<a href="#/tenants">Tenants ›</a><a href="#/rentcf">Rental CF ›</a>' : "") + '<a href="#/homes/history">History ›</a></span></span></div>' +
      '<span class="chip" style="flex:none">' + x.kind + '</span></div>' + (x.llc ? '<div class="small muted" style="margin-top:8px">' + x.llc + '</div>' : "");
    if (l) h += '<div class="grid2" style="margin-top:10px"><div class="fact"><div class="k">Tenant</div><div class="v">' + l.tenant + '</div></div>' +
      '<div class="fact"><div class="k">Rent / month</div><div class="v">' + cur0(hm.rent) + (l.extra ? ' <span class="small muted">+ $' + l.extra + ' utilities</span>' : "") + '</div></div>' +
      '<div class="fact"><div class="k">Lease</div><div class="v">' + l.start + ' – ' + l.end + '</div></div><div class="fact"><div class="k">Renewal</div><div class="v">in ' + l.daysLeft + ' days</div></div></div>' +
      '<div class="bar"><i style="width:' + l.pct + '%"></i></div><div class="small muted">' + l.pct + '% of lease term · Pets: ' + l.pets + '</div>';
    h += '<a class="loanbox tight mortbox" href="#/networth"><div class="lk3 lk4"><div><span>Bought</span><b>' + cur0(price) + '</b><small>' + r.bought.slice(-4) + '</small></div>' +
      '<div><span>Loan</span><b>' + cur0(hm.borrowed) + '</b><small class="rate">' + hm.rate + '%</small></div>' +
      '<div><span>Owed</span><b>' + cur0(hm.loan) + '</b><span class="pbar"><i style="width:' + pct + '%"></i><em>' + pct + '% paid</em></span></div>' +
      '<div><span>Last paid</span><b>' + cur0(g.last[0]) + '</b><small>' + g.last[1] + ' · next ' + g.next + '</small></div></div>' +
      '<div class="mortbar"><i class="md" style="width:' + (100 * down / price).toFixed(1) + '%"></i><i class="mp" style="width:' + (100 * paid / price).toFixed(1) + '%"></i><i class="mo" style="width:' + (100 * hm.loan / price).toFixed(1) + '%"></i></div>' +
      '<div class="small muted mlegend mortleg"><span><i style="background:#2F6FA3"></i>down ' + km(down) + '</span><span><i style="background:#5DA9E9"></i>paid ' + km(paid) + '</span><span><i style="background:var(--line)"></i>owed ' + km(hm.loan) + '</span></div>' +
      '<div class="small muted" style="margin-top:4px">Paid ' + cur0(g.principal) + ' principal + ' + cur0(g.interest) + ' interest · ' + hm.rate + '%</div>' +
      '<div class="small lkfoot"><span>🏦 ' + g.servicer + ' live · Sep 28</span><span>Mortgage ›</span></div></a>';
    if (x.heloc) { var hl = x.heloc;
      h += '<a class="loanbox tight mortbox" href="#/networth"><div class="lk3 lk4"><div><span>HELOC</span><b>' + cur0(hl.owed) + '</b><small>owed</small></div><div><span>Paid total</span><b>' + cur0(hl.paid) + '</b><small>since Jan 25</small></div>' +
        '<div><span>Available</span><b>' + cur0(hl.avail) + '</b><small>' + hl.rate + '%</small></div><div><span>Last paid</span><b>' + cur0(hl.last[0]) + '</b><small>' + hl.last[1] + '</small></div></div>' +
        '<div class="small lkfoot"><span>🏦 Northwind CU live · Sep 28</span><span>HELOC ›</span></div></a>'; }
    h += '<a class="loanbox tight" href="#/homes/values"><div class="lk3 lk4"><div><span>Value</span><b>' + cur0(hm.value) + '</b><small>your value · Sep 01</small></div>' +
      '<div><span>Equity</span><b>' + cur0(hm.value - hm.loan - (hm.heloc || 0)) + '</b><small>' + Math.round((hm.value - hm.loan - (hm.heloc || 0)) / hm.value * 100) + '% of value</small></div></div></a>';
    if (D.rentals[hm.key]) h += '<a class="loanbox moneybox" href="#/rentcf">' + rentvcost(hm) + '<div class="small lkfoot"><span>Banks to Sep 28</span><span>Money ›</span></div></a>';
    return h + '<ul class="comingup">' + x.tasks.map(function (t) { return '<li class="' + t[3] + '"><a href="#/homes/history"><span class="hdot ' + t[4] + '"></span>' + t[0] + ' · ' + t[1] + ' <span class="cuwhen">(' + when(t[2]) + ')</span></a></li>'; }).join("") + '</ul></div>';
  }
  P.homes = { html: function () {
    var urgent = []; D.homes.forEach(function (hm) { D.homex[hm.key].tasks.forEach(function (t) { if (t[3]) urgent.push([hm, t]); }); });
    urgent.sort(function (a, b) { return a[1][2] - b[1][2]; });
    var ov = urgent.filter(function (u) { return u[1][3] === "overdue"; }).length;
    var upin = 0, upout = 0; D.upcoming.forEach(function (u) { if (u[3]) upin += u[2]; else upout += u[2]; });
    var h = head("Homes", "Tuesday, Sep 29 · <a href=\"#/homes/archived\">Archived (" + D.homesArchived.length + ") ›</a>", logBtn()) + '<div class="mobi homes">';
    h += '<section class="tile3 urgent' + (ov ? " hasover" : "") + '" data-lvkey="homes:urgent" data-lvgroup="homes"><button class="t3head lvhead" type="button"><span class="t3icon">⚠</span><span class="t3main"><span class="t3title">Urgent</span>' +
      '<span class="t3sub">' + urgent.length + ' items' + (ov ? " · " + ov + " overdue" : "") + '</span></span><span class="t3big">' + urgent.length + '</span></button><div class="t3body">' +
      urgent.map(function (u) { return taskRow(u[0], u[1], true); }).join("") + '<div class="swhint">← Swipe a task left: Done (today) · +1 month · Cancel</div></div></section>';
    h += '<section class="tile3 upmoney" data-lvkey="homes:upcoming" data-lvgroup="homes"><button class="t3head lvhead" type="button"><span class="t3icon">💵</span><span class="t3main"><span class="t3title">Upcoming money</span>' +
      '<span class="t3sub">Next 15 days · in ' + cur0(upin) + ' · out ' + cur0(upout) + '</span><span class="t3sub2 compact">' + D.upcoming.slice(0, 3).map(function (u) { return u[0] + " " + byKey(D.homes, u[1]).name + " " + u[4]; }).join(" · ") + '</span></span><span class="t3big">' + D.upcoming.length + '</span></button><div class="t3body">' +
      D.upcoming.map(function (u) { var hm = byKey(D.homes, u[1]);
        return '<a class="uline" href="#/homes"><span class="ulicon">' + hicon(hm, 28) + '</span><span class="ultext"><b>' + u[0] + ' · ' + hm.name + ' <span class="upamt' + (u[3] ? " in" : "") + '">' + (u[3] ? "+" : "−") + cur0(u[2]) + '</span></b><span>last month the same</span></span>' +
          '<span class="ulwhen"><b>' + u[4] + '</b><span>in ' + u[5] + 'd</span></span></a>'; }).join("") + '<div class="swhint">Guessed from the last months\' payments · bank feed through Sep 28</div></div></section>';
    D.homes.forEach(function (hm) {
      var x = D.homex[hm.key], l = x.lease, u = x.tasks.filter(function (t) { return t[3]; }).length, eq = hm.value - hm.loan - (hm.heloc || 0);
      h += '<section class="tile3 car3" data-lvkey="homes:' + hm.key + '" data-lvgroup="homes" style="--vc:' + hm.color + '"><button class="t3head lvhead" type="button"><span class="t3pic">' + hicon(hm, 58) + '</span>' +
        '<span class="t3main"><span class="t3title">' + hm.name + '</span><span class="t3sub">' + (l ? l.tenant + " · " + cur0(hm.rent) + "/mo" : x.kind) + '</span>' +
        '<span class="t3sub2 compact">🏦' + km(hm.loan) + ' · 📈' + km(eq) + (u ? ' · <span class="late">' + u + ' urgent</span>' : "") + '</span>' +
        '<span class="t3sub2 compact loanln">🏦 ' + hm.rate + '% · paid P ' + km(x.mortgage.principal) + ' · I ' + km(x.mortgage.interest) + '</span>' +
        (x.heloc ? '<span class="t3sub2 compact loanln">💳 ' + x.heloc.rate + '% · ' + km(x.heloc.avail) + ' avail</span>' : "") + '</span><span class="t3lvl lvdots">○○</span></button>' +
        '<div class="t3body">' + homeCard(hm) + '</div></section>';
    });
    return h + '</div>';
  } };
  P["homes/history"] = { html: function () {
    return head("History", "Tasks done, repairs, improvements and leases") + '<div class="card">' + D.homeEvents.map(function (e) {
      var hm = byKey(D.homes, e[1]);
      return '<div class="ev"><div class="when">' + e[0].replace(", 2026", "") + '</div><div class="what"><span class="vtag" style="--vc:' + hm.color + '">' + hicon(hm, 22) + hm.name + '</span> <b>' + e[2] + '</b><div class="small muted">' + e[3] + (e[4] ? " · " + cur0(e[4]) : "") + '</div></div></div>'; }).join("") + '</div>';
  } };
  P["homes/values"] = { html: function () {
    return head("Home values", "Your value wins · else Redfin (monthly email) · else RentCast (at most once a month)") + '<div class="card"><table><tr><th>Home</th><th class="r">Yours</th><th class="r">Redfin</th><th class="r">RentCast</th></tr>' +
      D.homes.map(function (hm) { var v = D.values[hm.key]; return '<tr><td><span class="vtag" style="--vc:' + hm.color + '">' + hicon(hm, 22) + hm.name + '</span></td><td class="r"><b>' + km(v[0]) + '</b></td><td class="r">' + km(v[1]) + '</td><td class="r">' + km(v[2]) + '</td></tr>'; }).join("") +
      '</table><div class="small muted" style="margin-top:6px">RentCast calls this month: 3 of 45 · the free plan allows 50.</div></div>';
  } };
  P["homes/archived"] = { html: function () {
    return head("Archived homes", "Sold / no longer managed · <a href=\"#/homes\">Active homes ›</a>") + '<div class="mobi homes">' + D.homesArchived.map(function (a) {
      return '<section class="tile3 car3" data-lvkey="homesA:1" style="--vc:' + a.color + '"><button class="t3head lvhead" type="button"><span class="t3pic">' + vicon(a.color, "home", 58) + '</span>' +
        '<span class="t3main"><span class="t3title">' + a.name + '</span><span class="t3sub">' + a.kind + ' · ' + a.bought + ' – ' + a.sold + '</span><span class="t3sub2">Bought <b>' + km(a.price) + '</b> · sold <b>' + km(a.sale) + '</b></span></span><span class="t3lvl lvdots">○○</span></button>' +
        '<div class="t3body"><div class="card vcard" style="--vc:' + a.color + '"><div class="lk3"><div><span>Bought</span><b>' + cur0(a.price) + '</b></div><div><span>Sold</span><b>' + cur0(a.sale) + '</b></div><div><span>Net proceeds</span><b>' + cur0(a.net) + '</b></div></div></div></div></section>'; }).join("") + '</div>';
  } };

  // ================= Rentals: Rental Homes, Tenants =================
  function rentalHomes() { return D.homes.filter(function (x) { return x.kind === "rental"; }); }
  function rentalCard(hm) {
    var r = D.rentals[hm.key], x = D.homex[hm.key], l = x.lease, y = r.years[r.years.length - 1], prev = r.years[r.years.length - 2];
    var rent12 = y[1] + prev[1] / 4, noi12 = rent12 - (y[2] + prev[2] / 4), net12 = noi12 - (y[3] + prev[3] / 4) - (y[4] + prev[4] / 4);
    var profit = r.years.reduce(function (a, v) { return a + v[1] - v[2] - v[3] - v[4]; }, 0), prin = r.years.reduce(function (a, v) { return a + v[4]; }, 0);
    var row = function (k, v, cls) { return '<div class="row between"><span class="muted">' + k + '</span><span class="' + (cls || "") + '">' + v + '</span></div>'; };
    return '<details class="card g3d" style="--tc:' + hm.color + '"><summary class="row between" style="gap:10px"><span class="row" style="gap:10px;min-width:0">' + hicon(hm, 40) +
      '<span style="min-width:0"><b>' + hm.name + '</b><div class="small muted">' + l.tenant + ' · ends ' + l.end.replace(/ \d+,/, "") + '</div></span></span><b class="gamt">' + cur0(hm.rent + l.extra) + '<span class="small muted">/mo</span></b></summary>' +
      '<div class="small" style="margin-top:6px">' + row("Rent this month", cur0(hm.rent + l.extra) + " of " + cur0(hm.rent + l.extra) + ' <span class="muted">· Aug ' + cur0(hm.rent + l.extra) + '</span>') +
      row("Last 12 months · rent", cur0(rent12)) + row("NOI (rent − running costs)", cur0(noi12)) + row("Cash after the mortgage", cur0(net12), net12 < 0 ? "neg" : "") +
      row("Cash profit so far · incl. principal", cur0(profit) + " · " + cur0(profit + prin)) +
      '<div class="row between" style="border-top:1px solid var(--line);margin-top:3px;padding-top:3px"><span class="muted">Mortgage · ' + x.mortgage.servicer + ' · ' + hm.rate + '%</span><span>' + cur0(hm.loan) + ' owed · ' + cur0(x.mortgage.last[0]) + '/mo</span></div>' +
      row("Value · equity", cur0(hm.value) + " · <b>" + cur0(hm.value - hm.loan) + "</b>") +
      x.tasks.map(function (t) { return '<div class="row between"><span class="' + (t[3] === "overdue" ? "due" : "") + '">' + t[0] + '</span><span class="muted">' + t[1] + '</span></div>'; }).join("") + '</div>' +
      '<div class="fchips" style="margin-top:8px;flex-wrap:wrap"><a class="fchip" href="#/rentcf">Rental CF ›</a><a class="fchip" href="#/tenants">Tenants ›</a><a class="fchip" href="#/homes">Homes ›</a></div></details>';
  }
  P.rhomes = { html: function () {
    var list = rentalHomes();
    return head("Rental Homes", list.length + " rentals · the same figures as Homes and Rental CF") + list.map(rentalCard).join("") +
      '<p class="small muted">Expected = rent + pet / other rent + utility allowance (Tenants). 12-month figures: Rental CF through Sep 28.</p>';
  } };
  P["rhomes/archived"] = { html: function () {
    return head("Rental Homes · sold", D.homesArchived.length + " rental") + D.homesArchived.map(function (a) {
      return '<details class="card g3d" style="--tc:' + a.color + '"><summary class="row between"><span class="row" style="gap:10px">' + vicon(a.color, "home", 40) + '<span><b>' + a.name + '</b><div class="small muted">sold ' + a.sold.slice(-4) + '</div></span></span><b class="gamt">' + km(a.sale) + '</b></summary>' +
        '<div class="small" style="margin-top:6px"><div class="row between"><span class="muted">Bought</span><span>' + a.bought + ' · ' + cur0(a.price) + '</span></div><div class="row between"><span class="muted">Net proceeds</span><span>' + cur0(a.net) + '</span></div></div></details>'; }).join("");
  } };

  var TN = { home: "cedar" };
  function charts(hm, ts) {
    // rent over time: a step line through each rent period (Aug 2021 = x 0 … Sep 2026 = x 1)
    var pts = [], all = [];
    ts.forEach(function (t) { t.periods.forEach(function (p) { all.push(p); }); });
    function mx(s) { var m = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }, p = s.split(" "); return (+p[1] - 2021) * 12 + m[p[0]]; }
    var x0 = mx(all[0][0]), x1 = mx("Sep 2027"), W = 298, H = 110;
    var lo = Math.min.apply(null, all.map(function (p) { return p[2]; })) - 100, hi = Math.max.apply(null, all.map(function (p) { return p[2]; })) + 100;
    var X = function (m) { return 34 + (m - x0) / (x1 - x0) * W; }, Y = function (v) { return 90 - (v - lo) / (hi - lo) * 80; };
    var d = ""; all.forEach(function (p, i) { var x = X(mx(p[0])), y = Y(p[2]); d += (i ? "H" + x.toFixed(1) + "V" : "M" + x.toFixed(1) + " ") + y.toFixed(1); });
    d += "H" + X(mx("Sep 2026")).toFixed(1);
    var years = []; for (var yr = +all[0][0].slice(-4) + 1; yr <= 2027; yr++) years.push(yr);
    var svg = '<svg class="rch" viewBox="0 0 340 ' + H + '">' + [lo + 100, hi - 100].map(function (v) { return '<line class="g" x1="34" x2="332" y1="' + Y(v) + '" y2="' + Y(v) + '"/><text class="ax" x="30" y="' + (Y(v) + 3) + '" text-anchor="end">$' + (v / 1000).toFixed(2) + 'k</text>'; }).join("") +
      years.map(function (y) { return '<text class="ax" x="' + X(mx("Jan " + y)) + '" y="' + (H - 4) + '" text-anchor="middle">' + y + '</text>'; }).join("") +
      '<line x1="' + X(mx("Sep 2026")) + '" x2="' + X(mx("Sep 2026")) + '" y1="6" y2="92" stroke="var(--muted)" stroke-dasharray="2 3"/>' +
      '<path d="' + d + '" fill="none" stroke="var(--tc)" stroke-width="2" stroke-linejoin="round"/>' +
      all.map(function (p) { return '<circle cx="' + X(mx(p[0])) + '" cy="' + Y(p[2]) + '" r="4" fill="var(--tc)" stroke="var(--card)" stroke-width="2"><title>' + p[0] + " · " + p[1] + " · $" + p[2] + '</title></circle>'; }).join("") + '</svg>';
    var tl = '<svg class="rch" viewBox="0 0 340 50">' + years.map(function (y) { return '<line class="g" x1="' + X(mx("Jan " + y)) + '" x2="' + X(mx("Jan " + y)) + '" y1="4" y2="34"/><text class="ax" x="' + X(mx("Jan " + y)) + '" y="46" text-anchor="middle">' + y + '</text>'; }).join("") +
      ts.map(function (t) { var a = X(mx(t.start)), b = X(mx(t.end)) + 4; return '<rect x="' + (a + 1) + '" y="8" width="' + (b - a - 2) + '" height="20" rx="4" fill="var(--tc)" fill-opacity="' + (t.current ? ".9" : ".6") + '"><title>' + t.tenant + '</title></rect>' +
        '<text x="' + (a + 5) + '" y="21.5" font-size="9" fill="#fff" font-weight="600">' + t.tenant + '</text>'; }).join("") + '</svg>';
    var first = all[0][2], now = all[all.length - 1][2];
    return '<div class="small" style="font-weight:600;margin-top:6px">Rent over time</div>' + svg + '<div class="small muted">Now ' + cur0(now) + '/mo · ' + (now >= first ? "+" : "") + Math.round((now / first - 1) * 100) + '% since ' + all[0][0] + ' (' + cur0(first) + ')</div>' +
      '<div class="small" style="font-weight:600;margin-top:12px">Tenants over time</div>' + tl + '<div class="small muted">Occupied 100% since the first tenant · no vacant months</div>';
  }
  P.tenants = { html: function () {
    var hm = byKey(D.homes, TN.home), ts = D.tenancies[TN.home], t = ts.filter(function (x) { return x.current; })[0], l = D.homex[TN.home].lease;
    var h = head("Tenants", hm.name + " · " + ts.length + " tenanc" + (ts.length === 1 ? "y" : "ies"));
    h += '<div class="fchips" style="margin-bottom:6px">' + rentalHomes().map(function (x) { return '<a class="fchip' + (x.key === TN.home ? " on" : "") + '" data-home="' + x.key + '" href="#"' + (x.key === TN.home ? ' style="background:' + x.color + ';border-color:' + x.color + '"' : "") + '>⌂ ' + x.name + '</a>'; }).join("") + '</div>';
    h += '<details class="card g3d" style="--tc:' + hm.color + '"><summary class="row between" style="gap:8px"><span><b>' + t.tenant + '</b><div class="small muted">since ' + t.start + ' · ends ' + l.end.replace(/ \d+,/, "") + '</div></span><b class="gamt">' + cur0(hm.rent + l.extra) + '<span class="small muted">/mo</span></b></summary>' +
      '<div class="small" style="margin-top:6px"><div class="row between"><span class="muted">Rent</span><span>' + cur0(hm.rent) + '</span></div>' + (l.extra ? '<div class="row between"><span class="muted">Utility allowance</span><span>' + cur0(l.extra) + '</span></div>' : "") +
      '<div class="row between" style="border-top:1px solid var(--line);font-weight:600"><span>Expected in the bank</span><span>' + cur0(hm.rent + l.extra) + '</span></div><div class="row between"><span class="muted">Deposit (1 month\'s rent)</span><span>' + cur0(hm.rent) + '</span></div>' +
      '<div class="muted">Pets: ' + l.pets + '</div></div>' +
      '<div class="fchips" style="margin-top:8px;flex-wrap:wrap">' + ["Renewal", "Rent change", "Move-out", "New tenant"].map(function (k) { return '<a class="fchip" href="#" onclick="UI.toast(\'Demo · changes are turned off\');return false">' + k + ' ▸</a>'; }).join("") + '</div></details>';
    h += '<details class="card g3d" style="--tc:' + hm.color + '"><summary class="row between"><b>Rent &amp; tenants over time</b><span class="small muted">' + ts.length + ' tenants</span></summary>' + charts(hm, ts) + '</details>';
    h += '<details class="card"><summary class="row between"><b>Tenancies</b><span class="small muted">' + ts.length + '</span></summary>' + ts.slice().reverse().map(function (x) {
      var a = x.periods[0][2], b = x.periods[x.periods.length - 1][2];
      return '<details style="border-top:1px solid var(--line);padding:6px 0"><summary class="row between small" style="gap:6px"><span><b>' + x.tenant + '</b>' + (x.current ? ' <span class="chip">Now</span>' : "") + '<br><span class="muted">' + x.start + ' – ' + x.end + '</span></span>' +
        '<span style="white-space:nowrap">' + cur0(a) + (b !== a ? " → " + cur0(b) : "") + '</span></summary>' + x.periods.map(function (p) {
          return '<div class="row between small" style="padding:3px 0 3px 8px"><span>' + p[0] + ' · ' + p[1] + '</span><b>' + cur0(p[2]) + '</b></div>'; }).join("") +
        '<div class="small muted" style="padding-left:8px">Deposit ' + cur0(a) + ' (1 month\'s rent)' + (x.current ? "" : " · moved out " + x.end + " · refunded in full") + '</div></details>'; }).join("") + '</details>';
    return h + '<p class="small muted">Expected = rent + pet / other rent + utility allowance (what reaches the bank; Rental CF\'s rent check uses it).</p>';
  }, init: function (root, again) {
    root.addEventListener("click", function (e) { var c = e.target.closest(".fchip[data-home]"); if (!c) return; e.preventDefault(); TN.home = c.dataset.home; again(); });
  } };
})();
