/* Assets & Liabilities: Net Worth (networth, networth/realestate), Home (homes, homes/log|history|archived|mortgage|tenants|trend),
   Car (cars, cars/log|history|archived|rules|swap), Credit Cards (cards, cards/log|history|archived).
   Every figure comes from DEMO (data.js) or is derived from it here, so it ties out with every other page. Nothing saves. */
(function () {
  var D = window.DEMO, U = window.UI, P = window.PAGES;
  var cur = U.cur, cur0 = U.cur0, km = U.km, esc = U.esc;
  var OFF = "UI.toast('Demo · saving is turned off');return false";
  function head(title, sub, right) { return '<header class="top"><div><h1>' + title + '</h1><div class="sub">' + sub + '</div></div>' + (right || "") + '</header>'; }
  function logBtn(href) { return '<a class="btn primary" href="' + (href || "#") + '"' + (href ? "" : ' onclick="' + OFF + '"') + '>＋ Log</a>'; }
  function miles(n) { return Math.round(n).toLocaleString("en-US"); }
  function byKey(list, k) { return list.filter(function (x) { return x.key === k; })[0]; }
  function sum(l, f) { return l.reduce(function (t, x) { return t + f(x); }, 0); }
  function kv(k, v, cls) { return '<div class="row between small" style="padding:2px 0"><span class="muted">' + k + '</span><span class="' + (cls || "") + '">' + v + '</span></div>'; }
  function sgn(v) { return '<b class="' + (v >= 0 ? "nwpos" : "nwneg") + '">' + km(v, true) + '</b>'; }
  var DAY = "Thursday, Oct 1";
  var W = byKey(D.homes, "willow"), J = byKey(D.homes, "juniper"), CAR = D.cars[0], CX = D.carx[CAR.key], HX = D.homex;
  var CARNAME = CAR.year + " " + CAR.make + " " + CAR.name;

  var css = document.createElement("style");
  css.textContent = [
    ".mg{border-collapse:collapse;width:100%;table-layout:fixed;font-size:13px}.mg th,.mg td{padding:5px 6px;border-top:1px solid var(--line);text-align:left;vertical-align:top;overflow:hidden;text-overflow:ellipsis}",
    ".mg th{border-top:0;font-size:13px;font-weight:600;white-space:nowrap;border-bottom:2px solid var(--hc,var(--line))}.mg th small{display:block;font-weight:400;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".mg col.c-d{width:6.4em}.mg col.c-k{width:6.8em}.mg td.mgev{cursor:pointer;white-space:nowrap}.mg td.mgh{text-align:right}.mg .mgb{display:block;font-variant-numeric:tabular-nums;font-weight:600}",
    ".mg .mgr{display:block;font-size:11px;color:var(--muted);white-space:nowrap}.mg tr.now td{border-top:2px solid var(--line);font-weight:600}",
    ".mg .mgk{display:inline-block;padding:0 6px;border-radius:999px;border:1px solid var(--kc);color:var(--kc);font-size:11px;line-height:17px}.mg .mgk-origination{--kc:#2E6B45}.mg .mgk-transfer{--kc:#9A5B1E}",
    ".mg .mgds,.mg .mgks{display:none}.mg .nolk{color:inherit}",
    "@media (max-width:740px){.mg{font-size:10px}.mg th{font-size:10px}.mg th small,.mg .mgr{font-size:9px}.mg th,.mg td{padding:4px 2px}.mg col.c-d{width:3.7em}.mg col.c-k{width:2.8em}",
    ".mg .mgdl,.mg .mgkl,.mg .mghl{display:none}.mg .mgds,.mg .mgks{display:inline}.mg .mgk{padding:0 4px;font-size:9px;line-height:14px;font-weight:600}}",
    ".rtc,.rt{--s1:#2a78d6;--s2:#eb6834;--rtc-grid:rgba(0,0,0,.09);--rtc-ring:#fff}@media (prefers-color-scheme:dark){.rtc,.rt{--s1:#3987e5;--s2:#d95926;--rtc-grid:rgba(255,255,255,.10);--rtc-ring:#2f3231}}",
    ".rtc-head{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:4px 12px;margin:8px 0 4px}.rtc-title{font-size:12px;font-weight:600;color:var(--muted)}",
    ".rtc-legend{display:flex;flex-wrap:wrap;gap:2px 12px;font-size:12px}.rtc-key{white-space:nowrap;display:inline-flex;align-items:center;gap:5px}.rtc-key i{display:inline-block;width:14px;height:2px;border-radius:1px}.rtc-key b{font-variant-numeric:tabular-nums}",
    ".rtc-plot{position:relative}.rtc-plot svg{display:block;width:100%;overflow:visible;touch-action:pan-y}.rtc-plot text{fill:var(--muted);font-size:9px;font-variant-numeric:tabular-nums}",
    ".rtc-tip{position:absolute;top:0;pointer-events:none;background:var(--card,#fff);border:1px solid var(--line);border-radius:8px;padding:6px 8px;font-size:12px;line-height:1.5;box-shadow:0 4px 14px rgba(0,0,0,.18);white-space:nowrap;z-index:2}",
    "@media (prefers-color-scheme:dark){.rtc-tip{background:#262928}}.rtc-tip .k{display:inline-block;width:12px;height:2px;margin-right:6px;vertical-align:middle;border-radius:1px}.rtc-tip b{font-variant-numeric:tabular-nums;margin-left:8px}",
    "@media (max-width:740px){.rtc-legend,.rtc-tip{font-size:10px}.rtc-plot text{font-size:9px}}",
    ".rt{border-collapse:collapse;width:100%;table-layout:fixed;font-size:13px;white-space:nowrap}.rt th,.rt td{overflow:hidden;text-overflow:ellipsis;padding:4px 6px;border-top:1px solid var(--line);text-align:left}",
    ".rt th{border-top:0}.rt td.n,.rt th.n{text-align:right}.rt td.n small{display:block;color:var(--muted);font-size:11px}.rt th.h{border-bottom:3px solid var(--hc)}",
    ".rt col.c-d{width:7.1em}.rt col.c-e{width:6.9em}.rt col.c-h{width:5.8em}.rt tr.now td{font-weight:600;border-top:2px solid var(--line)}",
    ".rt tr.yr td{font-weight:600;cursor:pointer;border-top:2px solid var(--line)}.rt tr.yr td.n{font-weight:400;color:var(--muted)}.rt tr.yr .chev{display:inline-block;transition:transform .15s;margin-right:4px}",
    ".rt tr.yr.open .chev{transform:rotate(90deg)}.rt tr.yr.open td.n{visibility:hidden}.rt .ds,.rt .pe,.rt .es{display:none}",
    ".rt .ev{display:inline-block;padding:0 6px;border-radius:999px;border:1px solid var(--ec);color:var(--ec);font-size:11px;line-height:17px;white-space:nowrap}",
    ".rt .ev-on{--ec:#2E6B45}.rt .ev-ren{--ec:#2F5BD3}.rt .ev-inc{--ec:#9A5B1E}.rt .est{color:var(--muted)}",
    "@media (max-width:740px){.rt{font-size:9px}.rt th,.rt td{padding:3px 1px}.rt th{font-size:8px}.rt td.n small{font-size:8px}.rt .ev{font-size:8px;line-height:13px;padding:0 3px;font-weight:600}",
    ".rt col.c-d{width:3.9em}.rt col.c-end{width:0}.rt col.c-e{width:1.9em}.rt col.c-h{width:5.1em}.rt .el,.rt .dl{display:none}.rt .te{padding:0;font-size:0;border-left:0}.rt .es,.rt .ds{display:inline}.rt small.pe{display:block;color:var(--muted);font-size:8px}}",
    ".ccev{padding:8px 4px;border-top:1px solid var(--line);gap:8px;align-items:baseline}.ccev:first-child{border-top:0}.ccev .num{flex:none}",
    ".afrm{display:grid;gap:2px}.afrm .two{display:grid;grid-template-columns:1fr 1fr;gap:10px}.afrm input,.afrm select{width:100%;font:inherit;font-size:15px}",
    ".fc.cold{background:color-mix(in srgb,#2F6FA3 10%,var(--card))}"
  ].join("\n");
  document.head.appendChild(css);

  var SIL = {
    suv: '<svg viewBox="0 0 64 32" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M5 22V16.5C5 15 6 14 7.5 13.8L14 13L19 6.5C19.8 5.5 21 5 22.3 5H47C48.5 5 49.7 5.8 50.3 7L54 13L57.5 13.8C59 14.2 60 15.4 60 17V22C60 23.1 59.1 24 58 24H55A6 6 0 0 0 43 24H21A6 6 0 0 0 9 24H7C5.9 24 5 23.1 5 22ZM21 7.5L17 12.8H30V7.5ZM32.5 7.5V12.8H44V7.5ZM46.5 7.5V12.8H51L48.3 7.9C48 7.6 47.7 7.5 47.3 7.5Z"/><circle cx="15" cy="24" r="4.6" fill="currentColor"/><circle cx="49" cy="24" r="4.6" fill="currentColor"/></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true" style="width:58%"><path fill="currentColor" d="M12 3 2 11.5h3V21h5.5v-6h3v6H19v-9.5h3z"/></svg>'
  };
  function vicon(color, body, size) { return '<span class="vicon" style="--vc:' + color + ';width:' + size + 'px;height:' + size + 'px">' + SIL[body] + '</span>'; }
  function hicon(hm, size) { return vicon(hm.color, "home", size); }
  function swipeTask(inner) {
    return '<div class="swipe"><form class="swacts"><button class="sw done">✓<span>Done</span></button><button class="sw defer">⏸<span>+1 month</span></button><button class="sw cancel">✕<span>Cancel</span></button></form>' + inner + '</div>';
  }
  function when(d) { return d < 0 ? -d + "d late" : d === 0 ? "today" : "in " + d + "d"; }
  function seasonCls(s) { return s === "Summer" ? "Summer" : "Winter"; }
  function table(headers, rows, cls) {
    return '<div style="overflow-x:auto"><table class="' + (cls || "") + '" style="width:100%;border-collapse:collapse"><thead><tr>' + headers.map(function (h) { return '<th' + (h[1] ? ' class="r"' : "") + '>' + h[0] + '</th>'; }).join("") + '</tr></thead><tbody>' +
      rows.join("") + '</tbody></table></div>';
  }
  function nothing(title, sub, back) {
    return head(title, sub) + '<div class="card g3d"><div class="row" style="gap:10px"><b>Nothing archived</b></div><div class="small muted" style="margin-top:4px">' + back + '</div></div>';
  }
  function field(label, inner) { return '<label>' + label + '</label>' + inner; }
  function logForm(title, sub, kinds, owners, ownerLabel, extra) {
    var h = head(title, sub) + '<form class="card g3d afrm" onsubmit="' + OFF + '">';
    h += field("What", '<select>' + kinds.map(function (k) { return '<option>' + k + '</option>'; }).join("") + '</select>');
    h += field(ownerLabel, '<select>' + owners.map(function (k) { return '<option>' + k + '</option>'; }).join("") + '</select>');
    h += '<div class="two"><div>' + field("Date", '<input type="text" value="Oct 01, 2026">') + '</div><div>' + field(extra, '<input type="text" inputmode="decimal" placeholder="e.g. 400+150">') + '</div></div>';
    h += field("Description", '<input type="text" placeholder="What was done">') +
      '<div class="row" style="gap:8px;margin-top:12px"><button class="btn primary" type="submit" disabled style="opacity:.55;cursor:not-allowed">Save</button><span class="small muted">Demo · saving is turned off</span></div></form>';
    return h;
  }

  // =====================================================================================================================
  // Net Worth
  // =====================================================================================================================
  var T = D.totals;
  function acct(id) { return U.acct(id); }
  function perf(inv, bal) { var g = bal - inv; return "put in " + km(inv) + " · gain " + sgn(g) + " (" + U.pct(g / inv) + ")"; }
  function sumline(inv, bal) { var g = bal - inv; return '<div class="nwsum"><span>put in <b>' + km(inv) + '</b></span><span>gain <b class="' + (g >= 0 ? "nwpos" : "nwneg") + '">' + km(g, true) + ' (' + U.pct(g / inv) + ')</b></span></div>'; }
  function pill(name, amount, small, detail, alt) {
    return '<div class="gacct gpill ' + (alt ? "alt" : "") + ' lv1"><div class="grow" role="button" onclick="this.parentNode.classList.toggle(\'gopen\')"><span class="gname"><i></i><span class="gnmain">' + name + '</span>' +
      (small ? '<small class="nwperf">' + small + '</small>' : "") + '</span><span class="gamt"><b>' + cur(amount) + '</b></span><span class="gchev">›</span></div><div class="gtx fcompact">' + detail + '</div></div>';
  }
  function l3(title, color, total, parent, key, sum, inner) {
    var share = parent ? total / parent : null;
    return '<div class="nwl3 lvbox lv1" data-lvkey="' + key + '" style="--tc:' + color + '"><div class="nwl3h lvhead"><span>' + title + ' <span class="lvdots">○○</span></span><b>' + cur(total) + '</b></div>' +
      (share != null ? '<div class="nwshare" title="' + (share * 100).toFixed(1) + '% of the group"><i style="width:' + Math.max(share * 100, 1.5) + '%"></i><em>' + (share < 0.1 ? (share * 100).toFixed(1) : Math.round(share * 100)) + '%</em></div>' : "") +
      (sum || "") + inner + '</div>';
  }
  function l2(title, color, total, key, sum, inner) {
    return '<div class="card g3d fgroup lvbox nwl2" style="--tc:' + color + '" data-lvkey="' + key + '"><div class="ghead lvhead"><span>' + title + ' <span class="lvdots">○○</span></span><b>' + cur(total) + '</b></div>' + (sum || "") + inner + '</div>';
  }
  function rows(list, owe) {
    return list.map(function (a, i) {
      var a2 = a;
      if (owe) { a2 = {}; for (var k in a) a2[k] = a[k]; a2.bal = -a.bal; }
      var inv = a.inv != null ? perf(a.inv, a.bal) : "";
      return U.acctrow(a2, { alt: i % 2 === 1, small: inv, state: owe && a.due ? '<small class="cst">due ' + a.due + '</small> ' : "" });
    }).join("");
  }
  function homeEquity(h) { return h.value - h.loan - (h.loc ? h.loc.owed : 0); }
  function putIn(h) { var r = D.rentals[h.key]; return h.down + (h.closing || (h.key === "willow" ? 5100 : 0)) + (r ? r.improve : (h.key === "willow" ? 480 : 0)); }
  var CASHACC = ["a1", "a2", "a3", "a4"].map(acct), STK = [acct("a7")], RET = [acct("a8"), acct("a9")], HSA = [acct("a10")], S529 = [acct("a11")], CARDS = [acct("a5"), acct("a6")];
  function sumBal(l) { return sum(l, function (a) { return a.bal; }); }
  function sumInv(l) { return sum(l, function (a) { return a.inv; }); }

  function ownSide() {
    var cashTot = sumBal(CASHACC), houseCash = sum(CASHACC.filter(function (a) { return a.type !== "rental"; }), function (a) { return a.bal; });
    var g1 = l2("Cash &amp; Liquid", "#2F5BD3", cashTot, "nw:own:cash",
      '<div class="nwsum"><span>household <b>' + km(houseCash) + '</b></span><span>Juniper LLC <b>' + km(T.rentalCash) + '</b></span></div>', rows(CASHACC));
    var reRows = D.homes.map(function (h, i) {
      var eq = homeEquity(h), pi = putIn(h);
      var detail = kv("Value (your figure)", cur(h.value)) + kv("Mortgage owed", cur(h.loan)) + (h.loc ? kv("Line of credit owed", cur(h.loc.owed)) : "") + kv("Equity", "<b>" + cur(eq) + "</b>") +
        kv("Bought", cur(h.price) + " · " + h.bought) + '<a class="small" style="display:block;text-align:right;padding:4px 0" href="#/homes">Open ' + h.name + ' ›</a>';
      return pill(h.name + ' · ' + h.type.toLowerCase(), h.value, "equity " + km(eq) + " · put in " + km(pi) + " · gain " + sgn(eq - pi) + " (" + U.pct((eq - pi) / pi) + ")", detail, i % 2 === 1);
    }).join("");
    var rePut = sum(D.homes, putIn), reEq = sum(D.homes, homeEquity);
    var invTot = T.invested + T.homeValue;
    var inner = l3("Stocks", "#2E8B57", sumBal(STK), invTot, "nw:own:inv:stocks", sumline(sumInv(STK), sumBal(STK)), rows(STK)) +
      l3("Retirement", "#3F8F4F", sumBal(RET), invTot, "nw:own:inv:ret", sumline(sumInv(RET), sumBal(RET)), rows(RET)) +
      l3("Real Estate", "#C0714E", T.homeValue, invTot, "nw:own:inv:re",
        '<div class="nwsum"><span>equity <b>' + km(reEq) + '</b></span><span>put in <b>' + km(rePut) + '</b></span><span>gain <b class="' + (reEq - rePut >= 0 ? "nwpos" : "nwneg") + '">' + km(reEq - rePut, true) + ' (' + U.pct((reEq - rePut) / rePut) + ')</b></span></div>' +
        reRows + '<a class="small lv1" style="display:block;text-align:right;padding:4px 8px" href="#/networth/realestate">Compare homes ›</a>') +
      l3("HSA", "#1E9AA8", sumBal(HSA), invTot, "nw:own:inv:hsa", sumline(sumInv(HSA), sumBal(HSA)), rows(HSA)) +
      l3("529 · Ellis", "#8A5A9E", sumBal(S529), invTot, "nw:own:inv:529", sumline(sumInv(S529), sumBal(S529)), rows(S529));
    var allInv = sumInv(STK.concat(RET, HSA, S529)), allBal = sumBal(STK.concat(RET, HSA, S529));
    var g2 = l2("Investments", "#2E8B57", invTot, "nw:own:inv", sumline(allInv, allBal).replace(/<\/div>$/, '<span>homes <b>' + km(T.homeValue) + '</b> at market value</span></div>'), inner);
    var carPill = pill(CARNAME, CAR.value, "bought " + km(CAR.paid) + " · " + sgn(CAR.value - CAR.paid) + " (" + U.pct((CAR.value - CAR.paid) / CAR.paid) + ")",
      kv("Value", cur(CAR.value)) + kv("Loan owed", cur(CAR.loan)) + kv("Odometer", miles(CAR.miles) + " mi") + '<a class="small" style="display:block;text-align:right;padding:4px 0" href="#/cars">Open Car ›</a>');
    var g3 = l2("Personal Property", "#7B2FF7", T.carValue, "nw:own:prop", '<div class="nwsum"><span>1 vehicle</span></div>', carPill);
    return '<div class="nwl1 lvbox" data-lvkey="nw:own"><div class="nwhead nwh1 lvhead"><b>What you own <span class="lvdots">○○</span></b><b>' + cur(T.own) + '</b></div>' +
      '<div class="nwsum"><span>Cash <b>' + km(T.cash) + '</b></span><span>Investments <b>' + km(invTot) + '</b></span><span>Property <b>' + km(T.carValue) + '</b></span></div><div class="lv1">' + g1 + g2 + g3 + '</div></div>';
  }
  function debtSum(borrowed, repaid, interest, rate) {
    return '<span>borrowed <b>' + km(borrowed) + '</b></span><span>repaid <b class="nwpos">' + km(repaid) + ' (' + Math.round(repaid / borrowed * 100) + '%)</b></span>' + (interest ? '<span>interest <b>' + km(interest) + '</b></span>' : "") + '<span>' + rate + '%</span>';
  }
  function loanPill(name, amount, borrowed, repaid, interest, rate, detail, alt) {
    return pill(name, amount, "borrowed " + km(borrowed) + " · repaid " + km(repaid) + " (" + Math.round(repaid / borrowed * 100) + "%)" + (interest ? " · interest " + km(interest) : "") + " · " + rate + "%", detail, alt);
  }
  function oweSide() {
    var mort = D.homes.map(function (h, i) {
      var g = HX[h.key].mortgage;
      return loanPill(h.name + " mortgage · " + h.lender, h.loan, h.borrowed, h.borrowed - h.loan, g.interest, h.rate,
        kv("Payment", cur(h.payment) + " on the " + h.payDay + "st") + kv("Principal + interest", cur(h.pi)) + kv("Escrow", cur(h.escrow)) + kv("Last paid", cur(g.last[0]) + " · " + g.last[1]) +
        '<a class="small" style="display:block;text-align:right;padding:4px 0" href="#/homes/mortgage">Mortgage ›</a>', i % 2 === 1);
    }).join("");
    var loc = J.loc;
    var locPill = pill("Juniper line of credit · " + loc.bank, loc.owed, "limit " + km(loc.limit) + " · available " + km(loc.avail) + " · " + loc.rate + "%",
      kv("Owed", cur(loc.owed)) + kv("Available", cur(loc.avail)) + kv("Rate", "Prime " + loc.prime + "% + " + loc.margin + "% = " + loc.rate + "%") + kv("Plan", cur(loc.plan) + " on the " + loc.planDay + "th") +
      '<a class="small" style="display:block;text-align:right;padding:4px 0" href="#/loans">HELOC &amp; Car Loan ›</a>');
    var homeDebt = sum(D.homes, function (h) { return h.loan; }) + loc.owed;
    var g1 = l2("Home loans", "#2F6FA3", homeDebt, "nw:owe:home", '<div class="nwsum">' + debtSum(sum(D.homes, function (h) { return h.borrowed; }), sum(D.homes, function (h) { return h.borrowed - h.loan; }), sum(D.homes, function (h) { return HX[h.key].mortgage.interest; }), "3.875–6.125") + '</div>', mort + locPill);
    var ln = CX.loan;
    var g2 = l2("Car loan", "#7B2FF7", CAR.loan, "nw:owe:car", '<div class="nwsum">' + debtSum(ln.amount, ln.principal, ln.interest, ln.apr) + '</div>',
      loanPill(CARNAME + " · " + ln.lender, CAR.loan, ln.amount, ln.principal, ln.interest, ln.apr, kv("Payment", cur(CAR.payment) + " on the " + CAR.payDay + "th") + kv("Last paid", cur(ln.last[0]) + " · " + ln.last[1]) + kv("Payoff", ln.payoff) +
        '<a class="small" style="display:block;text-align:right;padding:4px 0" href="#/loans/car">Car Loan ›</a>'));
    var g3 = l2("Credit Cards", "#8A5A9E", T.cardDebt, "nw:owe:cards", '<div class="nwsum"><span>2 cards · 2 banks</span></div>', rows(CARDS, true));
    return '<div class="nwl1 lvbox" data-lvkey="nw:owe"><div class="nwhead nwh1 lvhead"><b>What you owe <span class="lvdots">○○</span></b><b>' + cur(T.owe) + '</b></div>' +
      '<div class="nwsum"><span>Home loans <b>' + km(homeDebt) + '</b></span><span>Car loan <b>' + km(CAR.loan) + '</b></span><span>Cards <b>' + km(T.cardDebt) + '</b></span></div><div class="lv1">' + g1 + g2 + g3 + '</div></div>';
  }
  function chg(v) { return '<span style="color:' + (v >= 0 ? "#2E8B57" : "#C0392B") + '">' + (v >= 0 ? "+" : "−") + cur(Math.abs(v)) + '</span>'; }
  function trendCard() {
    var pts = D.trend, n = pts.length, vs = pts.map(function (p) { return p.v; }), lo = Math.min.apply(null, vs), hi = Math.max.apply(null, vs), pad = (hi - lo) * 0.12;
    lo -= pad; hi += pad;
    var X = function (i) { return i * 300 / (n - 1); }, Y = function (v) { return 100 - (v - lo) / (hi - lo) * 100; };
    var line = pts.map(function (p, i) { return X(i).toFixed(1) + "," + Y(p.v).toFixed(1); }).join(" ");
    var grid = [0.15, 0.5, 0.85].map(function (f) { var v = lo + (hi - lo) * (1 - f); return { y: f * 100, label: km(v) }; });
    var tip = pts.map(function (p, i) { return { x: +(X(i) / 3).toFixed(1), y: [+Y(p.v).toFixed(1)], d: p.m, v: [p.v] }; });
    var d12 = vs[n - 1] - vs[0], d30 = vs[n - 1] - vs[n - 2];
    return '<div class="card g3d lvbox nwtr" data-lvkey="nw:trend" style="--tc:#1D4ED8;margin-top:14px"><div class="row between lvhead"><b>Trend <span class="lvdots">○○</span></b><span class="small">since ' + pts[0].m + ' ' + chg(d12) + '</span></div>' +
      '<div class="lv1" style="margin-top:6px"><div class="nwtrw"><div class="nwtrchart"><svg viewBox="0 0 300 100" preserveAspectRatio="none"><defs><linearGradient id="nwtrg1" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1D4ED8" stop-opacity=".28"/><stop offset="1" stop-color="#1D4ED8" stop-opacity="0"/></linearGradient></defs>' +
      grid.map(function (g) { return '<line x1="0" x2="300" y1="' + g.y + '" y2="' + g.y + '" class="nwtrgl" vector-effect="non-scaling-stroke"/>'; }).join("") +
      '<polygon points="0,100 ' + line + ' 300,100" fill="url(#nwtrg1)"/><polyline points="' + line + '" fill="none" stroke="#1D4ED8" stroke-width="3.5" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>' +
      grid.map(function (g) { return '<span class="nwtrgy" style="top:' + g.y + '%">' + g.label + '</span>'; }).join("") +
      '<div class="nwtip" hidden><i class="nwtipl"></i><i class="nwtipd" style="background:#1D4ED8"></i><div class="nwtipb"></div></div><script type="application/json" class="nwtipdata">' + JSON.stringify({ pts: tip }) + '</script></div>' +
      '<div class="nwtrx">' + pts.map(function (p, i) { return i % 2 === 0 || i === n - 1 ? '<span style="left:' + (X(i) / 3).toFixed(1) + '%">' + p.m + '</span>' : ""; }).join("") + '</div>' +
      '<div class="nwtrk"><div style="--sc:#1D4ED8"><span><i></i>Net worth</span><b>' + cur(T.netWorth) + '</b><span class="small">' + chg(d12) + '</span></div></div></div>' +
      '<div class="row between small" style="margin-top:4px"><span>30 days ' + chg(d30) + '</span><span class="muted">━ month-end net worth, logged daily</span></div></div></div>';
  }
  function cashFlowCard() {
    var ms = D.months.filter(function (m) { return !m.plan; }).slice(-12).reverse();
    function spent(m) { return m.spending + m.mortgage + m.carLoan + m.locPaid; }
    var inc = sum(ms, function (m) { return m.income; }), out = sum(ms, spent), net = inc - out;
    return '<div class="card g3d lvbox" data-lvkey="nw:cf" style="--tc:#2F5BD3;margin-top:8px"><div class="row between lvhead"><b>Cash Flow <span class="lvdots">○○</span></b><span class="small">' + ms[0].label + ' ' + chg(ms[0].income - spent(ms[0])) + '</span></div><div class="lv1">' +
      '<div class="lk3 lk4" style="margin-top:6px"><div><span>In · 12 mo</span><b>' + cur(inc) + '</b></div><div><span>Out · 12 mo</span><b>' + cur(out) + '</b></div><div><span>Net · 12 mo</span><b>' + cur(net) + '</b></div><div><span>Avg / month</span><b>' + cur(net / 12) + '</b></div></div>' +
      '<div class="small muted" style="margin-top:4px">Kept ' + Math.round(net / inc * 100) + '% of income · out = day-to-day spending + mortgages, car loan and line of credit · logged daily</div>' +
      ms.map(function (m) { return '<a class="row between" href="#/finances" style="border-left:3px solid var(--tc);padding:4px 0 4px 8px;margin-top:4px;color:inherit;text-decoration:none"><div><b>' + m.label + '</b><div class="small muted">in ' + cur(m.income) + ' · out ' + cur(spent(m)) + '</div></div><b>' + chg(m.income - spent(m)) + '</b></a>'; }).join("") +
      '</div></div>';
  }
  P.networth = { html: function () {
    return head("Net Worth", "What you own − what you owe · from Finances, Homes and Cars", '<a class="btn" href="#/networth/realestate">Real Estate ›</a>') +
      '<div class="card g3d" style="--tc:#2E8B57"><div class="row between"><b style="font-size:17px">Net worth</b><b style="font-size:20px">' + cur(T.netWorth) + '</b></div>' +
      '<div class="lk3 nwk" style="margin-top:6px"><div><span>You own</span><b>' + cur(T.own) + '</b></div><div><span>You owe</span><b>' + cur(T.owe) + '</b></div><div><span>Home equity</span><b>' + cur(T.homeEquity) + '</b></div></div></div>' +
      ownSide() + oweSide() + trendCard() + cashFlowCard();
  }, init: function (box) {
    var MON = { Jan: "January", Feb: "February", Mar: "March", Apr: "April", May: "May", Jun: "June", Jul: "July", Aug: "August", Sep: "September", Oct: "October", Nov: "November", Dec: "December" };
    box.querySelectorAll(".nwtr .nwtrchart").forEach(function (ch) {
      var raw = ch.querySelector(".nwtipdata"); if (!raw) return;
      var data = JSON.parse(raw.textContent), tip = ch.querySelector(".nwtip"), bx = tip.querySelector(".nwtipb"), line = tip.querySelector(".nwtipl"), dot = tip.querySelector(".nwtipd");
      function show(ev) {
        var r = ch.getBoundingClientRect(), px = (ev.clientX - r.left) / r.width * 100, best = null;
        data.pts.forEach(function (p) { if (!best || Math.abs(p.x - px) < Math.abs(best.x - px)) best = p; });
        if (!best) return;
        line.style.left = best.x + "%"; dot.style.left = best.x + "%"; dot.style.top = best.y[0] + "%";
        bx.innerHTML = "<b>" + MON[best.d] + "</b><div>Net worth<b>" + cur0(best.v[0]) + "</b></div>";
        bx.style.left = best.x > 55 ? "" : (best.x + 3) + "%"; bx.style.right = best.x > 55 ? (100 - best.x + 3) + "%" : "";
        tip.hidden = false;
      }
      ch.addEventListener("pointermove", show); ch.addEventListener("pointerdown", function (e) { e.stopPropagation(); show(e); });
      ch.addEventListener("click", function (e) { e.stopPropagation(); });
      ch.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") tip.hidden = true; });
    });
  } };

  // ---------- Net Worth › Real Estate ----------
  var RE = { metric: "equity" };
  function reFigs(h) {
    var r = D.rentals[h.key], pi = putIn(h), eq = homeEquity(h), net = h.value * 0.94 - h.loan - (h.loc ? h.loc.owed : 0);
    var cash = r ? D.rentalProfit : 0, principal = r ? sum(r.years, function (y) { return y[4]; }) : 0;
    var rent12 = r ? sum(D.months.filter(function (m) { return !m.plan; }).slice(-12), function (m) { return m.rent; }) : 0;
    return { h: h, price: h.price, down: h.down, closing: h.closing || 5100, improve: r ? r.improve : 480, putIn: pi, value: h.value, loan: h.loan, loc: h.loc ? h.loc.owed : 0, equity: eq, net: net,
      cash: cash, principal: principal, rent12: rent12, gain: net + cash - pi, back: net + cash };
  }
  var REM = [["equity", "Equity"], ["value", "Value"], ["putIn", "Money in"], ["gain", "Gain"]];
  P["networth/realestate"] = { html: function () {
    var f = D.homes.map(reFigs), mx = Math.max.apply(null, f.map(function (x) { return Math.abs(x[RE.metric]); }));
    var h = head("Real Estate", "Willow and Juniper · every figure from Home, the bank lines and your Rental CF", '<a class="btn" href="#/networth">‹ Net Worth</a>');
    h += '<div class="card g3d" style="--tc:#2E8B57"><div class="row between"><b>Compare homes</b><span class="small muted">one metric, every home as a bar</span></div><div class="fchips" style="margin:8px 0">' +
      REM.map(function (m) { return '<a class="fchip' + (m[0] === RE.metric ? " on" : "") + '" data-m="' + m[0] + '" href="#">' + m[1] + '</a>'; }).join("") + '</div>' +
      f.map(function (x) {
        var v = x[RE.metric];
        return '<div class="rebar"><span class="rebn">' + x.h.name + '<br><small>' + x.h.type + ' · ' + x.h.bought + '</small></span><span class="rebt"><i class="' + (v < 0 ? "neg" : "") + '" style="left:0;width:' + (Math.abs(v) / mx * 100).toFixed(1) + '%;background:' + x.h.color + '"></i></span><span class="rebv">' + km(v) + '</span></div>';
      }).join("") + '<div class="small muted">Gain = what you would net if sold (value − 6% − loans) + rental cash profit − money in.</div></div>';
    h += '<div class="card g3d" style="--tc:#2E8B57"><b>Put in vs got back</b><div class="relegend small"><span><i class="in"></i>money in</span><span><i class="back"></i>back so far</span></div>' +
      f.map(function (x) {
        var m = Math.max(x.putIn, x.back);
        return '<div class="reio"><div class="row between"><b>' + x.h.name + '</b><span class="small muted">back ÷ in <b>' + (x.back / x.putIn).toFixed(2) + '×</b></span></div>' +
          '<div class="rebar2"><i class="in" style="width:' + (x.putIn / m * 70).toFixed(1) + '%"></i><em>' + cur0(x.putIn) + ' in</em></div>' +
          '<div class="rebar2"><i class="back" style="width:' + (x.back / m * 70).toFixed(1) + '%"></i><em>' + cur0(x.back) + ' back</em></div></div>';
      }).join("") + '<div class="small muted" style="margin-top:4px">Back so far = net if sold + rental cash profit. Money in = down payment + closing + improvements you paid yourself.</div></div>';
    var R = [["Bought", function (x) { return x.h.bought; }], ["Price", function (x) { return cur0(x.price); }], ["Down payment", function (x) { return cur0(x.down); }], ["Closing", function (x) { return cur0(x.closing); }],
      ["Improvements", function (x) { return cur0(x.improve); }], ["Money in", function (x) { return cur0(x.putIn); }, 1], ["Value now", function (x) { return cur0(x.value); }], ["Mortgage owed", function (x) { return cur0(x.loan); }],
      ["Line of credit owed", function (x) { return x.loc ? cur0(x.loc) : "—"; }], ["Equity", function (x) { return cur0(x.equity); }, 1], ["Net if sold (−6%)", function (x) { return cur0(x.net); }],
      ["Rent · last 12 mo", function (x) { return x.rent12 ? cur0(x.rent12) : "own home"; }], ["Cash profit to date", function (x) { return x.h.kind === "rental" ? cur0(x.cash) : "—"; }],
      ["Principal paid on rent", function (x) { return x.principal ? cur0(x.principal) : "—"; }], ["Gain", function (x) { return '<b class="' + (x.gain >= 0 ? "nwpos" : "nwneg") + '">' + cur0(x.gain) + '</b>'; }, 1],
      ["Gain on money in", function (x) { return U.pct(x.gain / x.putIn); }]];
    h += '<div class="card g3d" style="--tc:#2E8B57"><b>Side by side</b><div class="retbl-wrap"><table class="retbl"><thead><tr><th>&nbsp;</th>' + f.map(function (x) { return '<th>' + x.h.name + '<small>' + x.h.type + '</small></th>'; }).join("") + '</tr></thead><tbody>' +
      R.map(function (r) { return '<tr><td>' + r[0] + '</td>' + f.map(function (x) { return '<td' + (r[2] ? ' class="tot"' : "") + '>' + r[1](x) + '</td>'; }).join("") + '</tr>'; }).join("") + '</tbody></table></div></div>';
    return h + '<p class="small muted">No sold homes. Cash profit comes from Rental CF (all rent − running costs − interest − principal); Willow is your own home, so no rent is counted.</p>';
  }, init: function (box, redraw) {
    box.addEventListener("click", function (e) { var c = e.target.closest(".fchip[data-m]"); if (!c) return; e.preventDefault(); RE.metric = c.dataset.m; redraw(); });
  } };

  // =====================================================================================================================
  // Home
  // =====================================================================================================================
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
        '<div class="rvrow"><span class="rvk">Expenses</span><span class="rvbar"><i class="ex" style="width:' + (100 * x[2] / mx).toFixed(1) + '%"></i></span><span class="rvv">' + cur0(x[2]) + '</span></div></div>';
    }).join("");
  }
  function homeCard(hm) {
    var x = HX[hm.key], g = x.mortgage, r = D.rentals[hm.key], pct = Math.round((1 - hm.loan / hm.borrowed) * 100), paid = hm.borrowed - hm.loan, down = hm.price - hm.borrowed, eq = homeEquity(hm);
    var h = '<div class="card vcard" style="--vc:' + hm.color + '"><div class="row between" style="align-items:flex-start"><div class="row" style="gap:12px">' + hicon(hm, 44) +
      '<span><h2 style="margin:0;font-size:18px">' + hm.name + '</h2><span class="vlinks"><a href="#/homes/history">All tasks ›</a>' + (hm.units ? '<a href="#/homes/tenants">Tenants ›</a><a href="#/rentcf">Rental CF ›</a>' : '<a href="#/bills/hoa">HOA ›</a>') + '<a href="#/homes/history">History ›</a></span></span></div>' +
      '<span class="chip" style="flex:none">' + x.kind + '</span></div>' + (x.llc ? '<div class="small muted" style="margin-top:8px">' + x.llc + ' · ' + hm.type + ' · units A and B</div>' : '<div class="small muted" style="margin-top:8px">' + hm.type + ' · HOA ' + cur0(hm.hoa) + '/mo</div>');
    if (hm.units) {
      h += '<div class="grid2" style="margin-top:10px">' + hm.units.map(function (u) { return '<div class="fact"><div class="k">' + u.name + ' · ' + u.tenant + '</div><div class="v">' + cur0(u.rent) + '<span class="small muted">/mo · since ' + u.since + '</span></div></div>'; }).join("") +
        '<div class="fact"><div class="k">Rent / month</div><div class="v">' + cur0(hm.rent) + '</div></div><div class="fact"><div class="k">Next lease end</div><div class="v">Unit B · in ' + x.lease.daysLeft + ' days</div></div></div>' +
        '<div class="bar"><i style="width:' + x.lease.pct + '%"></i></div><div class="small muted">' + x.lease.pct + '% of Unit B\'s lease term · Unit A runs to Jul 2027 · Pets: ' + x.lease.pets + '</div>';
    }
    h += '<a class="loanbox tight mortbox" href="#/homes/mortgage"><div class="lk3 lk4"><div><span>Bought</span><b>' + cur0(hm.price) + '</b><small>' + hm.bought.slice(-4) + '</small></div>' +
      '<div><span>Loan</span><b>' + cur0(hm.borrowed) + '</b><small class="rate">' + hm.rate + '%</small></div>' +
      '<div><span>Owed</span><b>' + cur0(hm.loan) + '</b><span class="pbar"><i style="width:' + pct + '%"></i><em>' + pct + '% paid</em></span></div>' +
      '<div><span>Payment</span><b>' + cur0(hm.payment) + '</b><small>P&amp;I ' + cur0(hm.pi) + ' + escrow ' + cur0(hm.escrow) + '</small><small>next ' + g.next + '</small></div></div>' +
      '<div class="mortbar"><i class="md" style="width:' + (100 * down / hm.price).toFixed(1) + '%"></i><i class="mp" style="width:' + (100 * paid / hm.price).toFixed(1) + '%"></i><i class="mo" style="width:' + (100 * hm.loan / hm.price).toFixed(1) + '%"></i></div>' +
      '<div class="small muted mlegend mortleg"><span><i style="background:#2F6FA3"></i>down ' + km(down) + '</span><span><i style="background:#5DA9E9"></i>paid ' + km(paid) + '</span><span><i style="background:var(--line)"></i>owed ' + km(hm.loan) + '</span></div>' +
      '<div class="small muted" style="margin-top:4px">Paid ' + cur0(paid) + ' principal + ' + cur0(g.interest) + ' interest · ' + hm.rate + '%</div>' +
      '<div class="small lkfoot"><span>🏦 ' + g.servicer + ' · last paid ' + g.last[1] + '</span><span>Mortgage ›</span></div></a>';
    if (hm.loc) { var l = hm.loc;
      h += '<a class="loanbox tight mortbox" href="#/loans"><div class="lk3 lk4"><div><span>Line of credit</span><b>' + cur0(l.owed) + '</b><small>owed</small></div><div><span>Limit</span><b>' + cur0(l.limit) + '</b><small>' + l.bank + '</small></div>' +
        '<div><span>Available</span><b>' + cur0(l.avail) + '</b><small>' + l.rate + '%</small></div><div><span>Plan</span><b>' + cur0(l.plan) + '</b><small>on the ' + l.planDay + 'th · next Oct 20</small></div></div>' +
        '<div class="small lkfoot"><span>🏦 ' + l.bank + ' · Prime ' + l.prime + '% + ' + l.margin + '%</span><span>Line of credit ›</span></div></a>'; }
    h += '<a class="loanbox tight" href="#/networth/realestate"><div class="lk3 lk4"><div><span>Value</span><b>' + cur0(hm.value) + '</b><small>your value · Sep 01</small></div>' +
      '<div><span>Equity</span><b>' + cur0(eq) + '</b><small>' + Math.round(eq / hm.value * 100) + '% of value</small></div></div></a>';
    if (r) h += '<a class="loanbox moneybox" href="#/rentcf">' + rentvcost(hm) + '<div class="small lkfoot"><span>Banks to Oct 01</span><span>Money ›</span></div></a>';
    return h + '<ul class="comingup">' + x.tasks.map(function (t) { return '<li class="' + t[3] + '"><a href="#/homes/history"><span class="hdot ' + t[4] + '"></span>' + t[0] + ' · ' + t[1] + ' <span class="cuwhen">(' + when(t[2]) + ')</span></a></li>'; }).join("") + '</ul></div>';
  }
  function homeTile(hm) {
    var x = HX[hm.key], g = x.mortgage, u = x.tasks.filter(function (t) { return t[3]; }).length, eq = homeEquity(hm);
    return '<section class="tile3 car3" data-lvkey="homes:' + hm.key + '" data-lvgroup="homes" style="--vc:' + hm.color + '"><button class="t3head lvhead" type="button"><span class="t3pic">' + hicon(hm, 58) + '</span>' +
      '<span class="t3main"><span class="t3title">' + hm.name + '</span><span class="t3sub">' + (hm.units ? hm.type + " · 2 units · " + cur0(hm.rent) + "/mo" : x.kind + " · " + hm.type) + '</span>' +
      '<span class="t3sub2 compact">🏦' + km(hm.loan + (hm.loc ? hm.loc.owed : 0)) + ' · 📈' + km(eq) + (u ? ' · <span class="late">' + u + ' urgent</span>' : "") + '</span>' +
      '<span class="t3sub2 compact loanln">🏦 ' + hm.rate + '% · ' + cur0(hm.payment) + '/mo · P ' + km(hm.borrowed - hm.loan) + ' · I ' + km(g.interest) + '</span>' +
      (hm.loc ? '<span class="t3sub2 compact loanln">💳 ' + hm.loc.rate + '% · ' + km(hm.loc.avail) + ' avail</span>' : "") + '</span><span class="t3lvl lvdots">○○</span></button>' +
      '<div class="t3body">' + homeCard(hm) + '</div></section>';
  }
  P.homes = { html: function () {
    var urgent = []; D.homes.forEach(function (hm) { HX[hm.key].tasks.forEach(function (t) { if (t[3]) urgent.push([hm, t]); }); });
    urgent.sort(function (a, b) { return a[1][2] - b[1][2]; });
    var ov = urgent.filter(function (u) { return u[1][3] === "overdue"; }).length, upin = 0, upout = 0;
    D.upcoming.forEach(function (u) { if (u[3]) upin += u[2]; else upout += u[2]; });
    var h = head("Home", DAY + " · <a href=\"#/homes/archived\">Archived (" + D.homesArchived.length + ") ›</a>", logBtn("#/homes/log")) + '<div class="mobi homes">';
    h += '<section class="tile3 urgent' + (ov ? " hasover" : "") + '" data-lvkey="homes:urgent" data-lvgroup="homes"><button class="t3head lvhead" type="button"><span class="t3icon">⚠</span><span class="t3main"><span class="t3title">Urgent</span>' +
      '<span class="t3sub">' + urgent.length + ' items' + (ov ? " · " + ov + " overdue" : "") + '</span></span><span class="t3big">' + urgent.length + '</span></button><div class="t3body">' +
      urgent.map(function (u) { return taskRow(u[0], u[1], true); }).join("") + '<div class="swhint">← Swipe a task left: Done (today) · +1 month · Cancel</div></div></section>';
    h += '<section class="tile3 upmoney" data-lvkey="homes:upcoming" data-lvgroup="homes"><button class="t3head lvhead" type="button"><span class="t3icon">💵</span><span class="t3main"><span class="t3title">Upcoming money</span>' +
      '<span class="t3sub">Next 31 days · in ' + cur0(upin) + ' · out ' + cur0(upout) + '</span><span class="t3sub2 compact">' + D.upcoming.slice(0, 3).map(function (u) { return u[0] + " " + byKey(D.homes, u[1]).name + " " + u[4]; }).join(" · ") + '</span></span><span class="t3big">' + D.upcoming.length + '</span></button><div class="t3body">' +
      D.upcoming.map(function (u) { var hm = byKey(D.homes, u[1]);
        return '<a class="uline" href="#/homes"><span class="ulicon">' + hicon(hm, 28) + '</span><span class="ultext"><b>' + u[0] + ' · ' + hm.name + ' <span class="upamt' + (u[3] ? " in" : "") + '">' + (u[3] ? "+" : "−") + cur0(u[2]) + '</span></b><span>same as last month</span></span>' +
          '<span class="ulwhen"><b>' + u[4] + '</b><span>in ' + u[5] + 'd</span></span></a>'; }).join("") + '<div class="swhint">Guessed from the last months\' payments · bank feed through Oct 01</div></div></section>';
    h += D.homes.map(homeTile).join("");
    return h + '</div>';
  } };
  P["homes/log"] = { html: function () {
    return logForm("＋ Log", "A task done, repair, improvement, lease or note for a home", ["Task done", "Repair", "Improvement", "Lease", "Note"], D.homes.map(function (h) { return h.name; }), "Home", "Amount ($)");
  } };
  P["homes/history"] = { html: function () {
    return head("History", "Tasks done, repairs, improvements and leases") + '<div class="card g3d">' + table([["Date"], ["Home"], ["Kind"], ["What"], ["Amount", 1]], D.homeEvents.map(function (e) {
      var hm = byKey(D.homes, e[1]);
      return '<tr><td style="white-space:nowrap">' + e[0].replace(", 2026", "") + '</td><td><span class="vtag" style="--vc:' + hm.color + '">' + hicon(hm, 22) + hm.name + '</span></td><td>' + e[2] + '</td><td>' + esc(e[3]) + '</td><td class="r">' + (e[4] ? cur0(e[4]) : "") + '</td></tr>';
    })) + '</div>';
  } };
  P["homes/archived"] = { html: function () { return nothing("Archived homes", 'Sold / no longer managed · <a href="#/homes">Active homes ›</a>', "Both homes are active. A home you sell lands here with its sale figures."); } };

  // ---------- Home › Mortgage ----------
  var JT = { date: "Aug 01 '23", ds: "8/23", balance: 386050 };
  P["homes/mortgage"] = { html: function () {
    var ev = [
      { d: "Sep 14 '18", s: "9/18", home: "willow", kind: "origination", label: "Origination", lender: W.lender, balance: W.borrowed, rate: W.rate },
      { d: "Apr 08 '22", s: "4/22", home: "juniper", kind: "origination", label: "Origination", lender: "Cobalt Lending", balance: J.borrowed, rate: J.rate },
      { d: JT.date, s: JT.ds, home: "juniper", kind: "transfer", label: "Transfer", lender: "Cobalt Lending", servicer: J.lender, balance: JT.balance, rate: J.rate }
    ];
    var cols = [W, J];
    var h = head("Mortgage", ev.length + " loan events · 2 homes · who holds each loan and when it changed", '<a class="btn" style="min-height:30px;padding:0 10px" href="#" onclick="' + OFF + '">＋ Event</a>');
    h += '<div class="card g3d" data-open style="min-width:0"><div style="max-width:100%;min-width:0;overflow-x:auto"><table class="mg"><colgroup><col class="c-d"><col class="c-k"><col><col></colgroup><thead><tr><th>Date</th><th><span class="mgkl">Event</span></th>' +
      cols.map(function (c) { return '<th style="--hc:' + c.color + '"><span class="nm">' + c.name + '</span><small>' + (c.key === "willow" ? 'Willow HOA <span class="mghl">$' + c.hoa + '</span>' : '<span class="muted">no HOA</span>') + '</small></th>'; }).join("") + '</tr></thead><tbody>';
    ev.forEach(function (r) {
      h += '<tr><td class="mgev" onclick="UI.toast(\'Demo · loan events are read-only here\')"><span class="mgdl">' + r.d + '</span><span class="mgds">' + r.s + '</span></td><td class="mgev"><span class="mgk mgk-' + r.kind + '"><span class="mgkl">' + r.label + '</span><span class="mgks">' + r.label.charAt(0) + '</span></span></td>';
      cols.forEach(function (c) {
        h += '<td class="mgh">' + (c.key === r.home ? '<span class="nolk">' + r.lender + '</span>' + (r.servicer ? '<span class="mgr">paid to ' + r.servicer + '</span>' : "") + '<span class="mgb">' + Math.round(r.balance).toLocaleString("en-US") + '</span><span class="mgr">' + r.rate + '%</span>' : "") + '</td>';
      });
      h += '</tr>';
    });
    h += '<tr class="now"><td><span class="mgdl">Oct 01 \'26</span><span class="mgds">10/26</span></td><td><span class="mgkl">Today</span><span class="mgks">•</span></td>' +
      cols.map(function (c) { return '<td class="mgh"><span class="nolk">' + c.lender + '</span><span class="mgb">' + Math.round(c.loan).toLocaleString("en-US") + '</span><span class="mgr">' + c.rate + '%</span></td>'; }).join("") + '</tr></tbody></table></div>' +
      '<div class="row between" style="margin-top:8px;gap:8px;flex-wrap:wrap"><span class="small muted">Tap a date for the event · a lender name opens its site</span></div></div>' +
      '<p class="small muted">Balances: the lender\'s own papers or the bank first. Today = the live balance Home shows (Willow ' + cur0(W.loan) + ', Juniper ' + cur0(J.loan) + '). Juniper\'s loan was sold to a new servicer in Aug 2023; the payment of ' + cur(J.payment) + ' did not change. The line of credit on Juniper is on <a href="#/loans">HELOC &amp; Car Loan</a>.</p>';
    return h;
  } };

  // ---------- Home › Tenants ----------
  var MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function mx(s) { var p = s.split(" "); return (+p[1] - 2022) * 12 + MN.indexOf(p[0]); }
  function mlabel(i) { return MN[((i % 12) + 12) % 12] + " " + (2022 + Math.floor(i / 12)); }
  var NOW = mx("Oct 2026");
  var UNITCOL = { A: "var(--s1)", B: "var(--s2)" };
  function unitPeriods(u) {   // [{start (month index), rent, event, tenant, tenancy}]
    var out = [];
    D.tenancies[u].forEach(function (t) { t.periods.forEach(function (p) { out.push({ unit: u, start: mx(p[0]), startS: p[0], event: p[1], rent: p[2], tenant: t.tenant, t: t }); }); });
    out.sort(function (a, b) { return a.start - b.start; });
    out.forEach(function (p, i) {
      var nx = out[i + 1]; p.end = nx ? nx.start - 1 : mx(p.t.end);
      p.chg = i ? (p.rent / out[i - 1].rent - 1) * 100 : null;
    });
    return out;
  }
  var UP = { A: unitPeriods("A"), B: unitPeriods("B") };
  function rentAt(u, i) { var r = null; UP[u].forEach(function (p) { if (p.start <= i) r = p.rent; }); return r; }
  function mono(pts) {
    var n = pts.length, dx = [], m = [], t = [], i, d;
    for (i = 0; i < n - 1; i++) { dx[i] = pts[i + 1][0] - pts[i][0]; m[i] = (pts[i + 1][1] - pts[i][1]) / dx[i]; }
    t[0] = m[0]; t[n - 1] = m[n - 2];
    for (i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
    for (i = 0; i < n - 1; i++) {
      if (m[i] === 0) { t[i] = t[i + 1] = 0; continue; }
      var a = t[i] / m[i], b = t[i + 1] / m[i], s = a * a + b * b; if (s > 9) { var k = 3 / Math.sqrt(s); t[i] = k * a * m[i]; t[i + 1] = k * b * m[i]; }
    }
    d = "M" + pts[0][0].toFixed(1) + " " + pts[0][1].toFixed(1);
    for (i = 0; i < n - 1; i++) d += "C" + (pts[i][0] + dx[i] / 3).toFixed(1) + " " + (pts[i][1] + t[i] * dx[i] / 3).toFixed(1) + " " + (pts[i + 1][0] - dx[i] / 3).toFixed(1) + " " + (pts[i + 1][1] - t[i + 1] * dx[i] / 3).toFixed(1) + " " + pts[i + 1][0].toFixed(1) + " " + pts[i + 1][1].toFixed(1);
    return d;
  }
  var CH = { w: 340, h: 150, l: 44, r: 8, t: 8, b: 20, x0: 0, x1: NOW - 1, lo: 1300, hi: 1600 };
  function CXf(i) { return CH.l + (i - CH.x0) / (CH.x1 - CH.x0) * (CH.w - CH.l - CH.r); }
  function CYf(v) { return CH.t + (CH.hi - v) / (CH.hi - CH.lo) * (CH.h - CH.t - CH.b); }
  function chartFrame() {
    var s = "";
    [1300, 1400, 1500, 1600].forEach(function (v) { s += '<line x1="' + CH.l + '" x2="' + (CH.w - CH.r) + '" y1="' + CYf(v) + '" y2="' + CYf(v) + '" stroke="var(--rtc-grid)"/><text x="' + (CH.l - 5) + '" y="' + (CYf(v) + 3) + '" text-anchor="end">$' + (v / 1000).toFixed(1) + 'k</text>'; });
    [2023, 2024, 2025, 2026].forEach(function (y) { var x = CXf(mx("Jan " + y)); s += '<line x1="' + x + '" x2="' + x + '" y1="' + CH.t + '" y2="' + (CH.h - CH.b) + '" stroke="var(--rtc-grid)"/><text x="' + x + '" y="' + (CH.h - 5) + '" text-anchor="middle">' + y + '</text>'; });
    return s;
  }
  function trendChart(smooth) {
    var s = '<svg viewBox="0 0 ' + CH.w + ' ' + CH.h + '" role="img" aria-label="Rent over time">' + chartFrame();
    ["A", "B"].forEach(function (u) {
      var pts = UP[u].map(function (p) { return [CXf(p.start), CYf(p.rent)]; }); pts.push([CXf(NOW - 1), CYf(UP[u][UP[u].length - 1].rent)]);
      var d;
      if (smooth) d = mono(pts);
      else { d = "M" + pts[0][0].toFixed(1) + " " + pts[0][1].toFixed(1); for (var i = 1; i < pts.length; i++) d += "H" + pts[i][0].toFixed(1) + "V" + pts[i][1].toFixed(1); }
      s += '<path d="' + d + '" fill="none" stroke="' + UNITCOL[u] + '" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>';
      UP[u].forEach(function (p) { s += '<circle cx="' + CXf(p.start) + '" cy="' + CYf(p.rent) + '" r="3.5" fill="' + UNITCOL[u] + '" stroke="var(--rtc-ring)" stroke-width="1.5"><title>' + p.startS + ' · ' + p.event + ' · $' + p.rent + '</title></circle>'; });
    });
    s += '<line class="rtc-cross" x1="0" x2="0" y1="' + CH.t + '" y2="' + (CH.h - CH.b) + '" stroke="var(--muted)" stroke-dasharray="2 3" visibility="hidden"/></svg>';
    return s;
  }
  function chartPanel(smooth) {
    return '<div class="rtc"><div class="rtc-head"><span class="rtc-title">US $ · rent per month</span><span class="rtc-legend">' +
      ["A", "B"].map(function (u) { return '<span class="rtc-key"><i style="background:' + UNITCOL[u] + '"></i>Unit ' + u + ' <b>$' + UP[u][UP[u].length - 1].rent.toLocaleString("en-US") + '</b></span>'; }).join("") + '</span></div>' +
      '<div class="rtc-plot">' + trendChart(smooth) + '<div class="rtc-tip" hidden></div></div></div>';
  }
  function chartInit(box) {
    box.querySelectorAll(".rtc-plot").forEach(function (pl) {
      var svg = pl.querySelector("svg"), tip = pl.querySelector(".rtc-tip"), cross = svg.querySelector(".rtc-cross");
      function show(ev) {
        var r = svg.getBoundingClientRect(), vx = (ev.clientX - r.left) / r.width * CH.w;
        var i = Math.round(CH.x0 + (vx - CH.l) / (CH.w - CH.l - CH.r) * (CH.x1 - CH.x0)); i = Math.max(0, Math.min(CH.x1, i));
        var x = CXf(i); cross.setAttribute("x1", x); cross.setAttribute("x2", x); cross.setAttribute("visibility", "visible");
        tip.innerHTML = "<b style='margin:0'>" + mlabel(i) + "</b>" + ["A", "B"].map(function (u) { var v = rentAt(u, i); return v ? "<div><span class='k' style='background:" + UNITCOL[u] + "'></span>Unit " + u + "<b>$" + v.toLocaleString("en-US") + "</b></div>" : ""; }).join("");
        tip.hidden = false; var pct = x / CH.w * 100; tip.style.left = pct > 55 ? "" : (pct + 2) + "%"; tip.style.right = pct > 55 ? (100 - pct + 2) + "%" : "";
      }
      pl.addEventListener("pointermove", show); pl.addEventListener("pointerdown", show);
      pl.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") { tip.hidden = true; cross.setAttribute("visibility", "hidden"); } });
    });
  }
  var TN = { applied: false };
  function tenancyCard(u) {
    var unit = J.units.filter(function (x) { return x.key === u; })[0], t = D.tenancies[u].filter(function (x) { return x.current; })[0], first = t.periods[0][2];
    return '<details class="card g3d" open style="--tc:' + J.color + '"><summary class="row between" style="gap:8px"><span><b>Unit ' + u + ' · ' + t.tenant + '</b><div class="small muted">since ' + t.start + ' · lease ends ' + t.end + '</div></span><b class="gamt">' + cur0(unit.rent) + '<span class="small muted">/mo</span></b></summary>' +
      '<div class="small" style="margin-top:6px">' + kv("Rent", cur0(unit.rent)) + kv("Utility allowance", "none") + '<div class="row between" style="border-top:1px solid var(--line);font-weight:600"><span>Expected in the bank</span><span>' + cur0(unit.rent) + '</span></div>' +
      kv("Deposit held", cur0(first) + " (first month's rent)") + kv("Pets", "none") + kv("Paid into", "Juniper LLC Checking ••6640") + '</div>' +
      '<div class="small muted" style="margin-top:6px">Water &amp; sewer ' + cur0(J.water) + '/mo is paid by you for the building, not billed to the unit.</div>' +
      '<div class="fchips" style="margin-top:8px;flex-wrap:wrap">' + ["Renewal", "Rent change", "Move-out", "New tenant"].map(function (k) { return '<a class="fchip" href="#" onclick="UI.toast(\'Demo · changes are turned off\');return false">' + k + ' ▸</a>'; }).join("") + '</div></details>';
  }
  function stepChartCard() {
    var s = '<svg class="rtc-tl" viewBox="0 0 340 74" role="img" aria-label="Tenants over time">';
    [2023, 2024, 2025, 2026].forEach(function (y) { var x = CXf(mx("Jan " + y)); s += '<line x1="' + x + '" x2="' + x + '" y1="4" y2="56" stroke="var(--rtc-grid)"/><text x="' + x + '" y="70" text-anchor="middle" style="fill:var(--muted);font-size:9px">' + y + '</text>'; });
    ["A", "B"].forEach(function (u, k) {
      D.tenancies[u].forEach(function (t) {
        var a = CXf(mx(t.start)), b = CXf(Math.min(mx(t.end) + 1, NOW));
        s += '<rect x="' + (a + 1) + '" y="' + (6 + k * 25) + '" width="' + Math.max(b - a - 2, 4) + '" height="20" rx="4" fill="' + UNITCOL[u] + '" fill-opacity="' + (t.current ? ".92" : ".6") + '"><title>Unit ' + u + ' · ' + t.tenant + '</title></rect><text x="' + (a + 5) + '" y="' + (20 + k * 25) + '" style="font-size:9px;fill:#fff;font-weight:600">' + t.tenant + '</text>';
      });
    });
    return s + '</svg>';
  }
  P["homes/tenants"] = { html: function () {
    var nTen = D.tenancies.A.length + D.tenancies.B.length;
    var h = head("Tenants", "Juniper · 2 units · " + nTen + " tenancies");
    h += tenancyCard("A") + tenancyCard("B");
    h += '<details class="card g3d rtc" style="--tc:' + J.color + '"><summary class="row between"><b>Rent &amp; tenants over time</b><span class="small muted">' + nTen + ' tenancies</span></summary>' + chartPanel(false) +
      '<div class="small" style="font-weight:600;margin-top:12px">Tenants over time</div>' + stepChartCard() + '<div class="small muted">Occupied 100% since the first tenants · no vacant months</div></details>';
    h += '<details class="card"><summary class="row between"><b>Tenancies</b><span class="small muted">' + nTen + '</span></summary>' + ["A", "B"].map(function (u) {
      return '<div class="small" style="font-weight:700;margin:8px 0 2px">Unit ' + u + '</div>' + D.tenancies[u].slice().reverse().map(function (x) {
        var a = x.periods[0][2], b = x.periods[x.periods.length - 1][2];
        return '<details style="border-top:1px solid var(--line);padding:6px 0"><summary class="row between small" style="gap:6px"><span><b>' + x.tenant + '</b>' + (x.current ? ' <span class="chip">Now</span>' : "") + '<br><span class="muted">' + x.start + ' – ' + x.end + '</span></span><span style="white-space:nowrap">' + cur0(a) + (b !== a ? " → " + cur0(b) : "") + '</span></summary>' +
          x.periods.map(function (p) { return '<div class="row between small" style="padding:3px 0 3px 8px"><span>' + p[0] + ' · ' + p[1] + '</span><b>' + cur0(p[2]) + '</b></div>'; }).join("") +
          '<div class="small muted" style="padding-left:8px">Deposit ' + cur0(a) + ' (1 month\'s rent)' + (x.current ? "" : " · moved out " + x.end + " · refunded in full") + '</div></details>';
      }).join("");
    }).join("") + '</details>';
    h += '<details class="card g3d" open style="--tc:#2F5BD3"><summary class="row between"><b>Check leases</b><span class="small muted">' + (TN.applied ? "all agree" : "1 to look at") + '</span></summary>' +
      (TN.applied ? '<div class="small" style="margin-top:6px">✓ The Unit A renewal period was added. Lease table, Rent Trend and the bank now agree for both units.</div>' :
        '<div class="small muted" style="margin-top:6px">Lease table vs Rent Trend vs the bank. Tick what to apply.</div>' +
        '<label class="row" style="gap:10px;align-items:flex-start;margin:8px 0;color:inherit;font-size:14px"><input type="checkbox" checked style="width:20px;height:20px;margin-top:2px"><span><b>Unit A · T. Vance · add the renewal from Aug 2026</b><br><span class="small muted">The lease runs to Jul 2027 but the table stops at Aug 2025. Rent stays $1,575; the bank shows $1,575 on the 1st every month since Aug 2025.</span></span></label>' +
        '<div class="row" style="gap:8px"><button class="btn primary" type="button" data-apply>Apply 1 change</button><span class="small muted">Undo stays in the toast</span></div>') +
      '<div class="small muted" style="margin-top:8px">Unit B · L. Moreau: lease $1,495 · Rent Trend $1,495 · bank $1,495 ✓</div></details>';
    return h + '<p class="small muted">Expected = rent + pet / other rent + utility allowance (what reaches the bank; Rental CF\'s rent check uses it).</p>';
  }, init: function (box, redraw) {
    chartInit(box);
    var b = box.querySelector("[data-apply]"); if (b) b.addEventListener("click", function () { TN.applied = true; redraw(); U.toast("Demo · applied on this page only, nothing is saved"); });
  } };

  // ---------- Home › Rent Trend ----------
  function dshort(i, day) { return MN[i % 12] + " " + (day || "01") + " '" + String(2022 + Math.floor(i / 12)).slice(2); }
  function dmon(i) { return MN[i % 12] + "'" + String(2022 + Math.floor(i / 12)).slice(2); }
  function lastDay(i) { return new Date(2022 + Math.floor(i / 12), (i % 12) + 1, 0).getDate(); }
  var TR = { open: {} };
  P["homes/trend"] = { html: function () {
    var all = [].concat(UP.A, UP.B).sort(function (a, b) { return b.start - a.start || (a.unit < b.unit ? -1 : 1); });
    var years = [2026, 2025, 2024, 2023, 2022];
    function atEnd(u, y) { var r = null; UP[u].forEach(function (p) { if (p.start <= mx("Dec " + y)) r = p.rent; }); return r; }
    var h = head("Rent Trend", all.length + " events · 2 units · from your leases", '<button class="btn" id="rtall" type="button" style="min-height:30px;padding:0 10px">Expand all</button>');
    h += '<details class="card g3d rtc" open><summary class="row between"><b>Rent over time</b><span class="small muted">touch for the lease rent of any month</span></summary>' + chartPanel(true) + '</details>';
    h += '<div class="card g3d"><div style="max-width:100%;min-width:0"><table class="rt"><colgroup><col class="c-d"><col class="c-d c-end"><col><col class="c-e"><col class="c-h"><col class="c-h"></colgroup>' +
      '<thead><tr><th>Month<span class="pe"> / End</span></th><th class="te">End</th><th>Tenant</th><th><span class="el">Event</span></th><th class="n h" style="--hc:var(--s1)">Unit A</th><th class="n h" style="--hc:var(--s2)">Unit B</th></tr></thead><tbody>';
    years.forEach(function (y) {
      var rowsY = all.filter(function (p) { return 2022 + Math.floor(p.start / 12) === y; }), isNow = y === 2026, open = isNow || TR.open[y];
      h += '<tr class="yr' + (open ? " open" : "") + '" data-y="' + y + '"><td colspan="4" class="ycell"><span class="chev">▸</span>' + y + ' <span class="muted" style="font-weight:400">· ' + rowsY.length + ' event' + (rowsY.length !== 1 ? "s" : "") + '</span></td>' +
        ["A", "B"].map(function (u) { var v = isNow ? null : atEnd(u, y); return '<td class="n">' + (v ? "$" + v.toLocaleString("en-US") : "") + '</td>'; }).join("") + '</tr>';
      rowsY.forEach(function (p) {
        var ek = p.event.toLowerCase(), ec = ek.indexOf("onboard") >= 0 || ek.indexOf("existing") >= 0 ? "ev-on" : ek.indexOf("renew") >= 0 ? "ev-ren" : "ev-inc";
        h += '<tr class="yrow" data-y="' + y + '"' + (open ? "" : " hidden") + '><td><span class="dl">' + dshort(p.start) + '</span><span class="ds">' + dmon(p.start) + '</span><small class="pe">' + dmon(p.end) + '~</small></td>' +
          '<td class="muted te"><span class="dl">' + dshort(p.end, lastDay(p.end)) + '</span><span class="ds">' + dmon(p.end) + '</span><span class="est" title="worked out: the day before the next period">~</span></td>' +
          '<td title="' + esc(p.tenant) + '">' + esc(p.tenant) + '</td><td><span class="ev ' + ec + '"><span class="el">' + p.event + '</span><span class="es">' + p.event.charAt(0) + '</span></span></td>' +
          ["A", "B"].map(function (u) { return '<td class="n">' + (u === p.unit ? '<b>$' + p.rent.toLocaleString("en-US") + '</b>' + (p.chg != null ? '<small>' + (p.chg > 0 ? "+" : "") + p.chg.toFixed(1) + '%</small>' : "") : "") + '</td>'; }).join("") + '</tr>';
      });
    });
    h += '<tr class="now"><td colspan="4" class="ycell">Rent now</td>' + ["A", "B"].map(function (u) { var p = UP[u][UP[u].length - 1]; return '<td class="n">$' + p.rent.toLocaleString("en-US") + '<small>' + dmon(p.start) + '</small></td>'; }).join("") + '</tr></tbody></table></div></div>';
    return h + '<p class="small muted">Generated from the lease table (Tenants), nothing typed: rent = rent + pet / other rent as the lease says. A closed year shows the rent in force at its end; tap a year to open it. Change % = vs that unit\'s previous line; ~ = end worked out as the day before the next period.</p>';
  }, init: function (box) {
    chartInit(box);
    function setYear(tr, open) { tr.classList.toggle("open", open); box.querySelectorAll('tr.yrow[data-y="' + tr.dataset.y + '"]').forEach(function (r) { r.hidden = !open; }); }
    box.querySelectorAll("tr.yr").forEach(function (tr) { tr.addEventListener("click", function () { var o = !tr.classList.contains("open"); TR.open[tr.dataset.y] = o; setYear(tr, o); }); });
    var all = box.querySelector("#rtall"); if (all) all.addEventListener("click", function () {
      var open = all.textContent.indexOf("Expand") === 0; box.querySelectorAll("tr.yr").forEach(function (tr) { TR.open[tr.dataset.y] = open; setYear(tr, open); }); all.textContent = open ? "Collapse all" : "Expand all"; });
  } };

  // =====================================================================================================================
  // Car
  // =====================================================================================================================
  var SW = D.swap;
  function carUrgent() {
    var items = CX.service.filter(function (s) { return s[3]; });
    return '<section class="tile3 urgent" data-lvkey="cars:urgent" data-lvgroup="cars"><button class="t3head lvhead" type="button"><span class="t3icon">⚠</span>' +
      '<span class="t3main"><span class="t3title">Urgent</span><span class="t3sub">' + items.length + ' item' + (items.length === 1 ? "" : "s") + '</span></span><span class="t3big">' + items.length + '</span></button><div class="t3body">' +
      items.map(function (s) { return swipeTask('<a class="uline swrow ' + s[3] + '" href="#/cars/rules"><span class="ulicon">' + vicon(CAR.color, CX.body, 28) + '</span><span class="ultext"><b>' + s[0] + '</b><span>' + CAR.name + ' · ' + miles(CAR.miles) + ' mi</span></span><span class="ulwhen"><b>' + s[1] + '</b><span>' + when(s[2]) + '</span></span></a>'); }).join("") +
      '<div class="swhint">← Swipe a service item left: Done (today) · +1 month · Cancel</div>' +
      '<a class="uline" href="#/cars/swap"><span class="ulicon">❄</span><span class="ultext"><b>' + SW.season + ' tire swap</b><span>' + SW.why + '</span></span><span class="ulwhen"><b>' + SW.date + '</b><span>in ' + SW.inDays + 'd</span></span></a></div></section>';
  }
  function carCard() {
    var ln = CX.loan, pct = Math.round((1 - ln.owed / ln.amount) * 100);
    return '<div class="card vcard" style="--vc:' + CAR.color + '"><div class="row between" style="align-items:flex-start"><div class="row" style="gap:12px">' + vicon(CAR.color, CX.body, 44) +
      '<span><h2 style="margin:0;white-space:nowrap;font-size:18px">' + CARNAME + '</h2><span class="vlinks"><a href="#/cars/history">All events ›</a><a href="#/cars/history">Mileage ›</a><a href="#/cars/rules">Rules ›</a></span></span></div>' +
      '<span class="chip Summer" style="flex:none"><span class="dot Summer"></span>Summer on</span></div>' +
      '<div class="small muted odoline" style="margin-top:8px">Odometer ' + miles(CAR.miles) + ' · Sep 18 · about ' + CX.perMonth + ' mi a month</div>' +
      '<ul class="comingup">' + CX.service.map(function (s) { return '<li class="' + s[3] + '"><a href="#/cars/rules">🔧 ' + s[0] + ' · ' + s[1] + ' <span class="cuwhen">(in ' + s[2] + ' days)</span></a></li>'; }).join("") + '</ul>' +
      '<a class="loanbox tight" href="#/loans/car"><div class="lk3 lk4"><div><span>Bought</span><b>' + cur0(ln.bought) + '</b><small>' + ln.year + '</small></div><div><span>Loan</span><b>' + cur0(ln.amount) + '</b><small>' + ln.apr + '% APR</small></div>' +
      '<div><span>Outstanding</span><b>' + cur0(ln.owed) + '</b><span class="pbar"><i style="width:' + pct + '%"></i><em>' + pct + '% paid</em></span></div>' +
      '<div><span>Last paid</span><b>' + cur0(ln.last[0]) + '</b><small>' + ln.last[1] + '</small><small>P $' + ln.last[2] + ' · I $' + ln.last[3] + '</small></div></div>' +
      '<div class="small lkfoot"><span>🏁 Payoff ≈ ' + ln.payoff + ' · ' + ln.lender + '</span><span>All payments ›</span></div></a><div style="margin-top:8px">' +
      CX.sets.map(function (s) { var wp = Math.round(s.miles / s.warranty * 100), sc = seasonCls(s.season);
        return '<a class="setrow" href="#/cars/history"><div class="row between"><span class="row"><span class="dot ' + sc + '"></span><b>' + s.season + '</b>' + (s.on ? ' <span class="small muted">· on car</span>' : "") + '</span>' +
          '<span class="big" style="font-size:22px">' + miles(s.miles) + ' <span class="small muted">mi</span></span></div><div class="small muted sdesc">' + s.desc + '</div>' +
          '<div class="bar' + (wp >= 80 ? " hot" : "") + '"><i style="width:' + wp + '%"></i></div><div class="small muted">' + wp + '% of ' + miles(s.warranty) + ' mi warranty' + (s.on ? " · " + miles(s.sinceRot) + " mi since rotation" : "") + '</div></a>'; }).join("") +
      '</div><div class="row wrapf" style="margin-top:10px"><a class="btn" href="#" onclick="' + OFF + '">⇄ Swap</a><a class="btn" href="#" onclick="' + OFF + '">Odometer</a></div></div>';
  }
  P.cars = { html: function () {
    var ln = CX.loan, u = CX.service.filter(function (s) { return s[3]; }).length;
    return head("Car", DAY + " · <a href=\"#/cars/archived\">Archived (" + D.carsArchived.length + ") ›</a>", logBtn("#/cars/log")) + '<div class="mobi homes cars">' + carUrgent() +
      '<section class="tile3 car3" data-lvkey="cars:' + CAR.key + '" data-lvgroup="cars" style="--vc:' + CAR.color + '"><button class="t3head lvhead" type="button"><span class="t3pic">' + vicon(CAR.color, CX.body, 58) + '</span>' +
      '<span class="t3main"><span class="t3title">' + CAR.name + '</span><span class="t3sub">' + miles(CAR.miles) + ' mi · <span class="dot Summer"></span> Summer on<span class="ohead"> · <b>' + cur0(ln.owed) + '</b> owed</span></span>' +
      '<span class="t3sub2 compact">💳 ' + ln.apr + '% · paid P ' + km(ln.principal) + ' · I ' + km(ln.interest) + '</span>' + (u ? '<span class="t3sub2"><span class="late">' + u + ' urgent</span></span>' : "") + '</span><span class="t3lvl lvdots">○○</span></button>' +
      '<div class="t3body">' + carCard() + '</div></section></div>';
  } };
  P["cars/log"] = { html: function () {
    return logForm("＋ Log", "A swap, service, odometer reading or expense", ["Odometer", "Service", "Tire swap", "Expense"], [CARNAME], "Car", "Odometer (mi)");
  } };
  P["cars/history"] = { html: function () {
    return head("History", "Every swap, service and odometer reading") + '<div class="card g3d">' + table([["Date"], ["Event"], ["Odometer", 1], ["Details"], ["Cost", 1]], D.carEvents.map(function (e) {
      return '<tr><td style="white-space:nowrap">' + e[0].replace(", 2026", "").replace(", 2025", " ’25") + '</td><td><b>' + e[2] + '</b></td><td class="r">' + miles(e[3]) + ' mi</td><td>' + esc(e[4] || "") + '</td><td class="r">' + (e[5] ? cur(e[5]) : "") + '</td></tr>';
    })) + '</div>';
  } };
  P["cars/archived"] = { html: function () { return nothing("Archived cars", 'Sold / no longer owned · <a href="#/cars">Active cars ›</a>', "The " + CARNAME + " is your only car. A car you sell lands here with its purchase and sale figures."); } };
  P["cars/rules"] = { html: function () {
    var sv = {}; CX.service.forEach(function (s) { sv[s[0]] = s; });
    var rules = [["Oil change", "every 7,500 mi or 7 months", "Mar 14, 2026 · 45,300 mi", sv["Oil change"][1], sv["Oil change"][2], sv["Oil change"][3]],
      ["Tire rotation", "every 6,000 mi or at each swap", "Apr 24, 2026 · 45,800 mi", sv["Tire rotation"][1], sv["Tire rotation"][2], ""],
      ["Cabin air filter", "every 12 months", "Aug 08, 2026 · 47,900 mi", "Aug 2027", 311, ""],
      ["Brake fluid", "every 3 years", "Mar 2024", sv["Brake fluid"][1], sv["Brake fluid"][2], ""],
      ["Front brake pads", "look at every swap, replace when worn", "Aug 30, 2025 · 40,800 mi", "at the Nov swap", 44, ""],
      ["Tire swap", "nights under 40°F (to all-weather) or above 50°F (to summer)", "Apr 24, 2026", SW.date, SW.inDays, ""]];
    return head("Rules", "How often each job comes up for " + CARNAME, '<a class="btn" href="#" onclick="' + OFF + '">＋ Rule</a>') +
      '<div class="card g3d">' + table([["Job"], ["Every"], ["Last done"], ["Next"], ["In", 1]], rules.map(function (r) {
        return '<tr><td><b>' + r[0] + '</b></td><td>' + r[1] + '</td><td class="muted">' + r[2] + '</td><td>' + r[3] + '</td><td class="r' + (r[5] ? " due" : "") + '">' + r[4] + 'd</td></tr>';
      })) + '</div><p class="small muted">Each rule becomes a Daily Tasks item 15 days before it is due; the odometer reading you log (or the daily car call) moves the mileage-based ones.</p>';
  } };
  P["cars/swap"] = { html: function () {
    var cold = SW.days.filter(function (d) { return d[2] < 40; }).length;
    return head("Tire swap", "Summer ⇄ all-weather · planned from the weather forecast and past years") +
      '<div class="card swapcard Winter"><div class="row between"><span class="row" style="gap:10px"><span class="swapicon">❄</span><span><b style="font-size:17px">All-weather tires by ' + SW.date + '</b><div class="small muted">' + SW.why + '</div></span></span><b style="font-size:22px">' + SW.inDays + 'd</b></div>' +
      '<div class="small" style="font-weight:600;margin-top:10px">Next 8 days · high / low °F</div>' +
      '<div class="fcgrid">' + SW.days.map(function (d) { return '<div class="fc' + (d[2] < 40 ? " cold" : "") + '"><b>' + d[0] + '</b><span class="small">' + d[1] + '° / ' + d[2] + '°</span></div>'; }).join("") + '</div>' +
      '<div class="small muted" style="margin-top:8px">' + (cold ? cold + " of 8 nights under 40°F." : "No night under 40°F in the next 8 days: not yet.") + ' The swap goes on the calendar when nights stay under 40°F; a reminder reaches Daily Tasks 15 days before (Oct 30).</div></div>' +
      '<div class="card g3d"><b>Sets</b>' + CX.sets.map(function (s) {
        return '<div class="row between" style="padding:8px 0;border-top:1px solid var(--line)"><span class="row"><span class="dot ' + seasonCls(s.season) + '"></span><span><b>' + s.season + '</b>' + (s.on ? ' <span class="small muted">· on car</span>' : ' <span class="small muted">· in storage</span>') + '<div class="small muted">' + s.desc + '</div></span></span><b>' + miles(s.miles) + ' mi</b></div>'; }).join("") + '</div>' +
      '<div class="card g3d"><b>Past swaps</b>' + D.carEvents.filter(function (e) { return e[2] === "Swap"; }).map(function (e) { return '<div class="row between small" style="padding:6px 0;border-top:1px solid var(--line)"><span>' + e[0] + ' · ' + e[4] + '</span><span class="muted">' + miles(e[3]) + ' mi · ' + cur(e[5]) + '</span></div>'; }).join("") +
      '<div class="row wrapf" style="margin-top:10px"><a class="btn" href="#" onclick="' + OFF + '">⇄ Swap now</a></div></div>';
  } };

  // =====================================================================================================================
  // Credit Cards
  // =====================================================================================================================
  var ISSU = ["#8A5A9E", "#1E9AA8"], CARDIDS = ["a5", "a6"];
  function cardTx(id) { return D.tx.filter(function (t) { return t.acct === id; }); }
  function monthKey(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2); }
  function mlab(k) { return U.MON[+k.slice(5) - 1] + " " + k.slice(0, 4); }
  function cardEvents() {
    var ev = [];
    CARDIDS.forEach(function (id) {
      var a = acct(id), tx = cardTx(id), oct = -sum(tx.filter(function (t) { return t.amount < 0 && t.date >= D.today; }), function (t) { return t.amount; });
      tx.filter(function (t) { return t.amount > 0; }).forEach(function (t) { ev.push({ date: t.date, kind: "Payment", card: a, amount: t.amount }); });
      var aug = -sum(tx.filter(function (t) { return t.amount < 0 && t.date < new Date(2026, 8, 1); }), function (t) { return t.amount; });
      ev.push({ date: new Date(2026, 8, 1), kind: "Statement", card: a, amount: aug });
      ev.push({ date: new Date(2026, 9, 1), kind: "Statement", card: a, amount: -a.bal - oct });
    });
    ev.sort(function (a, b) { return b.date - a.date; });
    return ev;
  }
  function cardSub(a) { return "due " + a.due + " · pays from " + (a.id === "a5" ? "Larkspur ••2093" : "Tidewater ••6618"); }
  P.cards = { html: function () {
    var next = CARDS.slice().sort(function (a, b) { return new Date("2026 " + a.due) - new Date("2026 " + b.due); })[0];
    return head("Credit Cards", "Balance, due date and what each card paid · " + CARDS.length + " cards") +
      '<div class="card g3d fgroup gcard lvbox lvl2" style="--tc:#8A5A9E" data-lvkey="cards:grp"><div class="ghead lvhead"><span>Credit cards <span class="lvdots">●●</span></span><b>' + cur(T.cardDebt) + '</b></div>' +
      '<div class="gsub lv1">' + CARDS.length + ' cards · next due: <b>' + next.name + ' ' + next.due + '</b> · none missed</div>' +
      CARDS.map(function (a, i) { return U.acctrow(a, { alt: i % 2 === 1, color: ISSU[i], small: cardSub(a), state: '<small class="cst">due ' + a.due + '</small> ' }); }).join("") +
      '</div><p class="small muted">Purchases are under Finances › All transactions. Card rows here are the same as on Finances (' + cur(T.cardDebt) + ' owed in all).</p>';
  } };
  P["cards/log"] = { html: function () {
    var ev = cardEvents(), months = {};
    ev.forEach(function (e) { (months[monthKey(e.date)] = months[monthKey(e.date)] || []).push(e); });
    return head("Credit Cards · Log", "Payments, refunds, fees and statements") + Object.keys(months).sort().reverse().map(function (k) {
      var evs = months[k], paid = sum(evs.filter(function (e) { return e.kind === "Payment"; }), function (e) { return e.amount; });
      return '<div class="card g3d lvbox" data-lvkey="cc:log:' + k + '"><div class="ghead lvhead"><span>' + mlab(k) + ' · ' + evs.length + ' event' + (evs.length !== 1 ? "s" : "") + '</span><b>' + cur(paid) + ' paid</b></div><div class="lv1">' +
        evs.map(function (e) { return '<div class="row between ccev"><span class="one"><span class="muted">' + U.md(e.date) + '</span> · <b>' + e.kind + '</b> · ' + U.banklogo(e.card.bank) + ' ' + U.bankOf(e.card).short + ' ••' + e.card.end + '</span><b class="num">' + cur(e.amount) + '</b></div>'; }).join("") +
        '<div class="small muted" style="padding:6px 4px">No fees or interest: both cards were paid in full.</div></div></div>';
    }).join("") + '<p class="small muted">Statement = what the month\'s charges came to; the payment in the next month matches it. Earlier months are not part of this demo.</p>';
  } };
  P["cards/history"] = { html: function () {
    return head("Credit Cards · History", "Charges and payments by month") + ["2026-10", "2026-09", "2026-08"].map(function (k) {
      var per = CARDIDS.map(function (id) {
        var tx = cardTx(id).filter(function (t) { return monthKey(t.date) === k; });
        return { a: acct(id), charges: -sum(tx.filter(function (t) { return t.amount < 0; }), function (t) { return t.amount; }), paid: sum(tx.filter(function (t) { return t.amount > 0; }), function (t) { return t.amount; }) };
      });
      var ch = sum(per, function (x) { return x.charges; }), pd = sum(per, function (x) { return x.paid; });
      return '<div class="card g3d lvbox" data-lvkey="cc:hist:' + k + '"><div class="ghead lvhead"><span>' + mlab(k) + (k === "2026-10" ? " · so far" : "") + '</span><b>' + cur(ch) + ' charged</b></div><div class="lv1">' +
        '<div class="row between small muted"><span>paid / credited</span><b>' + cur(pd) + '</b></div>' +
        per.map(function (x) { return '<div class="row between ccev"><span class="one">' + U.banklogo(x.a.bank) + ' ' + U.bankOf(x.a).short + ' ' + x.a.name + ' ••' + x.a.end + '</span><span class="num">' + cur(x.charges) + ' · <span class="muted">' + cur(x.paid) + ' paid</span></span></div>'; }).join("") + '</div></div>';
    }).join("");
  } };
  P["cards/archived"] = { html: function () {
    return head("Credit Cards · Archived", "Cards with nothing in the last 12 months") + '<div class="card g3d"><b>Nothing archived</b><div class="small muted" style="margin-top:4px">Both cards were used this month. A card idle for 12 months moves here.</div></div>';
  } };
})();
