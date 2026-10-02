/* Hub Demo: the whole app runs in the browser. Addresses are #/<tab>[/<sub-tab>]; each page is registered in window.PAGES.
   Same structure as the real app: T1 Hub -> T2 areas -> T3 tabs -> T4 sub-tabs, with the 'you are here' trail and the
   app map in the top strip, the sub-tab strip, the sideways-scrolling bottom bar (computer) and the five-item bar (phone).
   Nothing is saved anywhere.

   PAGES contract: window.PAGES["<tab>"] = { html: function () { return "<html string>"; }, init: function (box, redraw) {} }
   for a tab's own page, and "<tab>/<sub>" for a sub-tab (keys below). init is optional; redraw() re-renders the page keeping
   open cards open. A key with no page (or a page that throws) shows a neutral 'Not in the demo yet' screen. */
(function () {
  var D = window.DEMO, U = window.UI;

  // t(key, name, icon, subs, short, soon): subs = [[subKey, label, notInDemo?]]; subKey "" is the tab's own page (Overview)
  function t(key, name, icon, subs, short, soon) {
    return { key: key, name: name, icon: icon, subs: subs || [], short: short || name, url: "#/" + key, soon: !!soon };
  }
  var AREAS = [
    { key: "money", name: "Money", icon: "$", color: "#4F6FBF", tabs: [
      t("finances", "Finances", "$", [["", "Overview"], ["review", "To review"], ["coverage", "Coverage"], ["transactions", "All transactions"], ["payroll", "Payroll"]]),
      t("bills", "Bills & Subscriptions", "◎", [["", "Subscriptions"], ["gas", "Gas"], ["electricity", "Electricity"], ["water", "Water & Sewer"], ["hoa", "HOA"]], "Bills"),
      t("rentcf", "Rental Cash Flow", "⚿", [], "Rental CF"),
      t("loans", "HELOC & Car Loan", "⇋", [["", "HELOC"], ["car", "Car Loan"]], "HELOC · Car")] },
    { key: "assets", name: "Assets & Liabilities", short: "Assets", icon: "⌂", color: "#C0714E", tabs: [
      t("networth", "Net Worth", "↗", [["", "Overview"], ["realestate", "Real Estate"]]),
      t("homes", "Home", "⌂", [["", "Overview"], ["log", "＋ Log"], ["history", "History"], ["archived", "Archived"], ["mortgage", "Mortgage"], ["tenants", "Tenants"], ["trend", "Rent Trend"]]),
      t("cars", "Car", "◎", [["", "Overview"], ["log", "＋ Log"], ["history", "History"], ["archived", "Archived"], ["rules", "Rules"], ["swap", "Tire swap"]]),
      t("cards", "Credit Cards", "▭", [["", "Overview"], ["log", "Log"], ["history", "History"], ["archived", "Archived"]], "Cards"),
      t("instruments", "Financial Instruments", "◫", [], "Instruments", true)] },
    { key: "identity", name: "Identity", icon: "◈", color: "#9C5670", tabs: [
      t("vault", "Vault", "◈", [["", "Renewals"], ["documents", "Documents"]]),
      t("person", "Person", "☺", [], 0, true)] },
    { key: "household", name: "Household", icon: "◐", color: "#6E9A78", tabs: [
      t("tasks", "Task Management", "✓", [["", "Daily Tasks"], ["filing", "📂 Filing"], ["notify", "🔔 Notifications"], ["done", "Done for you"]], "Tasks"),
      t("mcf", "Monthly Budgeting", "Σ", [], "Monthly"),
      t("daily", "Daily Budgeting", "◷", [], "Daily"),
      t("medcol", "Medical & Education", "✚", [["", "Education"], ["medical", "Medical"], ["recon", "Recon"]], "Med & Educ")] },
    { key: "tax", name: "Tax & Audit", short: "Tax", icon: "⚖", color: "#6F66B2", tabs: [
      t("reports", "Reports", "Σ", [["", "Reports"], ["cpa", "CPA questions"]]),
      t("filed", "Filed", "⚖", []),
      t("incometax", "Income Tax", "✎", [], 0, true)] },
    { key: "activities", name: "Activities", icon: "✦", color: "#4E918B", tabs: [
      t("guitar", "Guitar", "♫", [], 0, true), t("outdoors", "Hiking · Running · Biking", "▲", [], "Outdoors", true)] }
  ];
  AREAS.forEach(function (a) {
    a.short = a.short || a.name;
    a.ready = a.tabs.filter(function (x) { return !x.soon; });
    a.tabs.forEach(function (x) { x.area = a; x.color = a.color; });
    a.url = a.ready.length ? a.ready[0].url : "#/area/" + a.key;
  });
  var TABS = {}; AREAS.forEach(function (a) { a.tabs.forEach(function (x) { TABS[x.key] = x; }); });
  var TOP = { settings: { name: "Settings", icon: "⚙", color: "#64748B", subs: [["", "Settings"], ["banks", "Bank connections"], ["access", "Sign-in & access"], ["secrets", "🔐 Secrets", 1], ["emails", "Statement emails", 1]] } };
  // the real app's section class for each tab (body class sec-*)
  var SEC = { finances: "finances", bills: "finances", rentcf: "rentals", loans: "finances", networth: "investments", homes: "homes", cars: "tires",
              cards: "finances", vault: "vault", tasks: "tasks", mcf: "finances", daily: "finances", medcol: "medcol", reports: "audit", filed: "audit", settings: "settings" };
  // old addresses -> where they live now
  var ALIAS = { "finances/radar": "bills", "finances/history": "finances", rhomes: "homes", tenants: "homes/tenants", gas: "bills/gas", electricity: "bills/electricity",
                water: "bills/water", hoa: "bills/hoa", utilities: "bills", "tasks/notify": "tasks/notify" };
  delete ALIAS["tasks/notify"];

  function isPhone() { return window.matchMedia("(max-width:600px)").matches; }
  function lastUrl(a) { try { var u = localStorage.getItem("demo.last." + a.key); if (u && a.ready.some(function (x) { return x.url === u; })) return u; } catch (e) {} return a.url; }
  function ico(n) { return '<svg aria-hidden="true"><use href="#' + n + '"/></svg>'; }
  function head(title, sub) { return '<header class="top"><div><h1>' + title + '</h1><div class="sub one">' + sub + '</div></div></header>'; }

  // ---------- pages built into the shell ----------
  function hub() {      // icon grid of every tab grouped by area, no figures
    return '<div class="hubgrid">' + AREAS.map(function (a) {
      return '<section class="hubarea" data-area="' + a.key + '"><h2 class="one">' + a.name + '</h2><div class="hubicons">' + a.tabs.map(function (x) {
        return '<a class="hubi' + (x.soon ? " soon" : "") + '" href="' + x.url + '"><span class="hubg">' + x.icon + '</span><span class="one">' + x.short + '</span></a>'; }).join("") +
        '</div></section>'; }).join("") + '</div><p class="small muted demo-note phhide">Demo with a made-up household · nothing here is real</p>';
  }
  var GL = { money: "dollar", assets: "house", household: "check", identity: "passport", tax: "receipt", activities: "star" };
  function today() {    // the phone's first screen: what needs you, this week, latest transactions
    function row(i, urgent) {
      return '<a class="frow f1 txr tday" href="' + i[9] + '"><span class="ci" style="--cc:' + (urgent ? "#B3261E" : "#A86A00") + '">' + ico(GL[i[3]] || "dots") + '</span>' +
        '<span class="fmain"><span class="fdesc">' + U.esc(i[1]) + '</span><span class="fsub">' + U.esc(i[2]) + '</span></span>' +
        '<span class="fval"><b class="famt">' + U.esc(i[6]) + '</b><small class="fst">' + U.esc(i[4]) + '</small></span><span class="fchev">›</span></a>';
    }
    function group(name, g, urgent) {
      var l = D.taskList.filter(function (x) { return x[0] === g; }); if (!l.length) return "";
      return '<h3 class="tdh">' + name + ' <span class="muted">· ' + l.length + '</span></h3><div class="card flist">' + l.slice(0, 5).map(function (x) { return row(x, urgent); }).join("") +
        (l.length > 5 ? '<a class="frow f1 tmore" href="#/tasks"><span class="fdesc">' + (l.length - 5) + ' more in Tasks</span><span class="fchev">›</span></a>' : "") + '</div>';
    }
    var latest = D.tx.filter(function (x) { return x.cat !== "Transfer"; }).slice(0, 6);
    return head("Today", ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][D.today.getDay()] + ", " + U.md(D.today).replace(" 0", " ")) +
      group("Needs you", "urgent", true) + group("This week", "week", false) +
      '<h3 class="tdh">Latest <a class="small" href="#/finances/transactions" style="float:right;font-weight:600">All ›</a></h3><div class="card flist">' +
      latest.map(function (x) { return U.txrow(x); }).join("") + '</div>';
  }
  function notYet(title, color, why) {    // a screen the demo doesn't have (yet): neutral, never an error
    return head(U.esc(title), why || "Not in the demo yet") + '<div class="card g3d" style="--tc:' + color + '"><b>' + (why ? "Not in the demo" : "Not in the demo yet") +
      '</b><div class="small muted">' + (why ? "This screen is left out of the demo." : "The navigation works; this screen is added in a later step.") + '</div></div>';
  }
  function soonPage(tab) {
    return head(U.esc(tab.name), "Coming soon") + '<div class="card g3d" style="--tc:' + tab.color + '"><b>Coming soon</b><div class="small muted">This tab is planned in the real app and not built yet.</div></div>';
  }

  // ---------- shell ----------
  // top strip: trail Hub › Area › Tab › Sub-tab (tap = the app map), then this tab's sub-tabs
  function strip(area, tab, top, sub) {
    var trail = [{ name: "Hub", icon: "⊞", color: "#6B8F71", lvl: "hub" }], subs = [], base = "";
    if (area) trail.push({ name: area.name, icon: area.icon, color: area.color, lvl: "area" });
    if (tab) { trail.push({ name: tab.name, icon: tab.icon, color: tab.color, lvl: "tab" }); subs = tab.subs; base = tab.url; }
    else if (top) { trail.push({ name: TOP[top].name, icon: TOP[top].icon, color: TOP[top].color, lvl: "page" }); subs = TOP[top].subs; base = "#/" + top; }
    var cur = null; subs.forEach(function (s) { if (s[0] === (sub || "")) cur = s; });
    if (cur && cur[0] !== "") trail.push({ name: cur[1], icon: "", color: trail[trail.length - 1].color, lvl: "sub" });
    var color = tab ? tab.color : top ? TOP[top].color : "#6B8F71";
    var sm = '<span class="trail">' + trail.map(function (c, i) {
      return (i ? "<i>›</i>" : "") + '<span class="tc' + (i === trail.length - 1 ? " last" : " lvl-" + c.lvl) + '" style="--g:' + c.color + '">' + (c.icon ? "<em>" + c.icon + "</em>" : "") +
        (i === 0 && trail.length > 1 ? "" : '<span class="nm">' + U.esc(c.name) + '</span>') + '</span>'; }).join("") + '</span><b class="jcar">▾</b>';
    var map = AREAS.filter(function (a) { return a.ready.length; }).map(function (a) {
      return '<div class="nmrow" data-area="' + a.key + '"><span class="nmk">' + a.short + '</span><span class="nmps">' + a.ready.map(function (x) {
        return '<a href="' + x.url + '" class="nmp' + (tab && tab.key === x.key ? " on" : "") + '">' + U.esc(x.name) + '</a>'; }).join("") + '</span></div>'; }).join("");
    var subsBar = subs.length > 1 ? '<div class="subs">' + subs.map(function (s) {
      return '<a href="' + base + (s[0] ? "/" + s[0] : "") + '" class="' + (s[0] === (sub || "") ? "on" : "") + '" style="--sec:' + color + '">' + U.esc(s[1]) + '</a>'; }).join("") + '</div>' : "";
    return '<nav class="strip" aria-label="Where you are"><a class="ph-back" href="#/today" aria-label="Back" onclick="if(history.length>1){history.back();return false}">' + ico("back") + '</a>' +
      '<details class="jump"><summary title="Where you are · tap for the app map">' + sm + '</summary><div class="jumpmenu navmap nm2">' + map + '</div></details>' + subsBar + '</nav>';
  }

  function bars(area, tab, key) {
    var trow = area && area.ready.length ? '<div class="trow" aria-label="' + area.name + ' tabs">' + area.ready.map(function (x) {
      return '<a href="' + x.url + '" class="t' + (tab && tab.key === x.key ? " on" : "") + '" style="--g:' + x.color + '"><span class="i">' + x.icon + '</span>' + x.short + '</a>'; }).join("") + '</div>' : "";
    var arow = '<a href="#/hub" class="ab' + (key === "" || key === "hub" ? " on" : "") + '" style="--g:#6B8F71" title="Hub"><span class="i">⊞</span>Hub</a>' + AREAS.filter(function (a) {
      return a.ready.length || (area && area.key === a.key); }).map(function (a) {
      return '<a href="' + lastUrl(a) + '" class="ab' + (area && area.key === a.key ? " on" : "") + '" data-area="' + a.key + '" style="--g:' + a.color + '"><span class="i">' + a.icon + '</span>' + a.short + '</a>'; }).join("") +
      '<a href="#/settings" class="ab' + (key.split("/")[0] === "settings" ? " on" : "") + '" style="--g:#64748B" title="Settings"><span class="i">⚙</span>Settings</a>';
    var ak = area ? area.key : "", tk = tab ? tab.key : "";
    var on = (key === "today" || (key === "" && isPhone())) ? "today" : tk === "tasks" ? "tasks" : ak === "money" ? "money" : ak === "assets" ? "assets" : "more";
    var ph = [["today", "Today", "sun", "#/today", ""], ["money", "Money", "dollar", lastUrl(AREAS[0]), "money"], ["assets", "Assets & Liabilities", "house", lastUrl(AREAS[1]), "assets"],
              ["tasks", "Tasks", "check", "#/tasks", ""], ["more", "More", "grid", "#/hub", ""]];
    return '<nav class="tabs" data-area="' + ak + '" data-tab="' + (tab ? tab.url : "") + '">' + trow + '<div class="arow">' + arow + '</div></nav>' +
      '<nav class="phbar" aria-label="Main">' + ph.map(function (p) { return '<a href="' + p[3] + '" class="' + (on === p[0] ? "on" : "") + '"' + (p[4] ? ' data-area="' + p[4] + '"' : "") + '>' + ico(p[2]) + '<span>' + p[1] + '</span></a>'; }).join("") + '</nav>';
  }

  function route() {
    var key = location.hash.replace(/^#\/?/, "").split("?")[0].replace(/\/+$/, "");
    if (ALIAS[key]) { location.replace("#/" + ALIAS[key]); return; }
    var parts = key.split("/"), tkey = parts[0], sub = parts[1] || null, area = null, tab = null, top = null, page = null, body = null, builtin = null;
    if (key === "") builtin = isPhone() ? "today" : "hub";
    else if (key === "hub" || key === "today") builtin = key;
    if (builtin) { page = window.PAGES[builtin] || { html: builtin === "hub" ? hub : today }; }
    else if (TABS[tkey]) {
      tab = TABS[tkey]; area = tab.area;
      if (sub && !tab.subs.some(function (s) { return s[0] === sub; })) { location.replace("#/" + tkey); return; }
      if (tab.soon) body = soonPage(tab);
      else {
        page = window.PAGES[key] || null;
        var subDef = sub ? tab.subs.filter(function (s) { return s[0] === sub; })[0] : null;
        if (subDef && subDef[2]) { page = null; body = notYet(tab.name + " · " + subDef[1], tab.color, "Not in the demo"); }
        else if (!page) body = notYet(subDef ? subDef[1] : tab.name, tab.color);
      }
    } else if (TOP[tkey]) {
      top = tkey;
      var sd = sub ? TOP[top].subs.filter(function (s) { return s[0] === sub; })[0] : null;
      if (sub && !sd) { location.replace("#/" + tkey); return; }
      page = window.PAGES[key] || null;
      if (sd && sd[2]) { page = null; body = notYet(TOP[top].name + " · " + sd[1], TOP[top].color, "Not in the demo"); }
      else if (!page) body = notYet(sd ? sd[1] : TOP[top].name, TOP[top].color);
    } else if (key.indexOf("area/") === 0) { location.replace("#/hub"); return; }
    else { location.replace("#/"); return; }
    if (page && body === null) {
      try { body = page.html(); } catch (e) {
        if (window.console) console.warn("demo page not ready: " + key, e && e.message);
        page = null; body = notYet((tab && tab.name) || (top && TOP[top].name) || key, (tab && tab.color) || "#64748B");
      }
    }
    if (tab) try { localStorage.setItem("demo.last." + area.key, tab.url); } catch (e) {}
    document.body.className = "sec-" + (tab ? SEC[tab.key] || tab.key : top ? SEC[top] || top : "hub");
    document.body.setAttribute("data-area", area ? area.key : "hub");
    var showStrip = !!(area || top || key === "");
    var paint = function () {
      var wrap = document.querySelector(".wrap");
      wrap.innerHTML = (showStrip ? strip(area, tab, top, sub) : "") + '<div class="page"></div>';
      mount(wrap.querySelector(".page"), body, page);
      document.querySelector("#bars").innerHTML = bars(area, tab, key);
      var nav = document.querySelector("nav.strip .subs"), on = nav && nav.querySelector(".on");
      if (on && nav.scrollWidth > nav.clientWidth) nav.scrollLeft = Math.max(0, on.offsetLeft - (nav.clientWidth - on.offsetWidth) / 2);
      document.title = (tab ? tab.name : top ? TOP[top].name : builtin === "today" ? "Today" : "Hub") + " · Hub Demo";
      window.scrollTo(0, 0);
    };
    if (document.startViewTransition && route.done) {       // a quick second tap aborts the first transition: harmless
      var vt = document.startViewTransition(paint), no = function () {};
      vt.ready.catch(no); vt.finished.catch(no); vt.updateCallbackDone.catch(no);
    } else paint();
    route.done = true;
  }
  // put a page's HTML in place, wire levels / swipes, and let the page re-draw itself (filters) keeping open cards open
  function mount(el, html, page) {
    var box = document.createElement("div"); box.innerHTML = html; el.replaceWith(box); box.className = "page";
    U.enhance(box);
    if (page && page.init) page.init(box, function () {
      var open = [].map.call(box.querySelectorAll('[data-lvkey][data-lvl="2"]'), function (x) { return x.dataset.lvkey; });
      var y = window.scrollY; mount(box, page.html(), page);
      open.forEach(function (k) { var x = document.querySelector('.page [data-lvkey="' + k + '"] .lvhead'); if (x) x.click(); });
      window.scrollTo(0, y);
    });
  }
  window.addEventListener("hashchange", route);
  var wasPhone = isPhone();
  window.addEventListener("resize", function () { var p = isPhone(); if (p !== wasPhone) { wasPhone = p; if (!location.hash.replace(/^#\/?/, "")) route(); } });
  document.addEventListener("click", function (e) {        // the app map closes after a pick; taps outside close it too
    var j = document.querySelector("nav.strip details.jump[open]"); if (j && (!j.contains(e.target) || e.target.closest(".jumpmenu a"))) j.open = false; });
  document.addEventListener("keydown", function (e) { var j = document.querySelector("nav.strip details.jump[open]"); if (j && e.key === "Escape") j.open = false; });
  route();
})();
