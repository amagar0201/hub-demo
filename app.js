/* Hub Demo: the whole app runs in the browser. Addresses are #/<tab>[/<sub-tab>]; each page is in PAGES.
   Same structure as the real app: T1 Hub -> T2 areas -> T3 tabs -> T4 sub-tabs, with the 'you are here' trail and
   the whole app map in the top strip. Nothing is saved anywhere. */
(function () {
  var D = window.DEMO, T = D.totals;

  // subs: [key, label] - the tab's T4 sub-tabs (its overview is the tab itself)
  function t(key, name, icon, color, subs, short, soon) {
    return { key: key, name: name, icon: icon, color: color, subs: subs || [], short: short || name, url: "#/" + key, soon: !!soon };
  }
  var AREAS = [
    { key: "money", name: "Money", icon: "$", color: "#2F5BD3", tabs: [
      t("finances", "Finances", "$", "#2F5BD3", [["transactions", "Transactions"], ["history", "History"], ["radar", "Radar"]]),
      t("networth", "Net Worth", "↗", "#2E8B57", [["realestate", "Real Estate"]])] },
    { key: "assets", name: "Assets", icon: "⌂", color: "#F2612D", tabs: [
      t("cars", "Cars", "◎", "#7B2FF7", [["history", "History"], ["swap", "Tire swap"], ["archived", "Archived"]]),
      t("homes", "Homes", "⌂", "#F2612D", [["history", "History"], ["values", "Home values"], ["archived", "Archived"]])] },
    { key: "rentals", name: "Rentals", icon: "⚿", color: "#1F6F8B", tabs: [
      t("rhomes", "Rental Homes", "⌂", "#1F6F8B", [["archived", "Archived"]], "Homes"),
      t("rentcf", "Rental CF", "$", "#145A73", [], "CF"),
      t("tenants", "Tenants", "☺", "#2A8C8C")] },
    { key: "activities", name: "Activities", icon: "✦", color: "#0F8F83", tabs: [
      t("guitar", "Guitar", "♫", 0, 0, 0, 1), t("biking", "Biking", "◍", 0, 0, 0, 1), t("hiking", "Hiking", "▲", 0, 0, 0, 1),
      t("skiing", "Skiing", "❄", 0, 0, 0, 1), t("travel", "Travel", "✈", 0, 0, 0, 1)] },
    { key: "utilities", name: "Utilities", icon: "ϟ", color: "#C98A12", tabs: [
      t("gas", "Gas", "♨", "#D9772B"), t("electricity", "Electricity", "ϟ", "#C98A12", [], "Power"),
      t("water", "Water & Sewer", "≋", "#2F8FB0", [], "Water"), t("hoa", "HOA", "▦", "#7A6FA8")] },
    { key: "identity", name: "Identity", icon: "◈", color: "#9F1239", tabs: [
      t("vault", "Vault", "◈", "#9F1239", [["documents", "Documents"]])] },
    { key: "audit", name: "Audit", icon: "⚖", color: "#4F46E5", tabs: [
      t("reports", "Reports", "Σ", "#4F46E5", [["cpa", "CPA questions"]]), t("filed", "Filed vs App", "⚖", "#6366F1", [], "Filed"),
      t("incometax", "Income Tax", "✎", "#4F46E5", [], 0, 1)] }
  ];
  AREAS.forEach(function (a) {
    a.ready = a.tabs.filter(function (x) { return !x.soon; });
    a.tabs.forEach(function (x) { x.area = a; });
    a.url = a.ready.length ? a.ready[0].url : "#/area/" + a.key;
  });
  var TABS = {}; AREAS.forEach(function (a) { a.ready.forEach(function (x) { TABS[x.key] = x; }); });
  var TOP = { tasks: { name: "Daily Tasks", icon: "✓", subs: [["notify", "🔔 Notifications"]] },
              settings: { name: "Settings", icon: "⚙", subs: [["banks", "Bank connections"], ["access", "Sign-in & access"]] } };

  function money(n) { return (n < 0 ? "−$" : "$") + Math.round(Math.abs(n)).toLocaleString("en-US"); }
  function short(n) { var a = Math.abs(n); return a >= 1e6 ? "$" + (n / 1e6).toFixed(2) + "M" : a >= 1e4 ? "$" + Math.round(n / 1e3) + "k" : money(n); }

  // ---------- pages ----------
  function hub() {
    var tk = D.tasks, spare = [["money", "Money", "#2F5BD3"], ["assets", "Assets", "#F2612D"], ["rentals", "Rentals", "#1F6F8B"], ["utilities", "Utilities", "#C98A12"], ["identity", "Identity", "#9F1239"]];
    var heads = { money: "Net worth " + short(T.netWorth), assets: "Equity " + short(T.homeEquity + T.carEquity), rentals: "Rent " + money(T.rentDue) + "/mo · 2 rented",
                  utilities: D.utilities.month + " bills " + money(T.bills), identity: D.renewals[0].what.split(" ·")[0] + " " + D.renewals[0].when, audit: "2021–2025 checked" };
    var lines = { finances: short(T.cash) + " cash", networth: short(T.netWorth), cars: D.cars[0].next.toLowerCase() + " " + D.cars[0].nextIn,
                  homes: "3 homes", rhomes: "rent due Oct 1", rentcf: "profit " + short(D.rentalProfit), tenants: "2 leases",
                  gas: money(D.utilities.gas), electricity: money(D.utilities.electricity), water: money(D.utilities.water), hoa: money(D.utilities.hoa),
                  vault: D.renewals.length + " renewals", reports: "7 reports", filed: "1 to check" };
    var h = '<header class="top"><div><h1>Hub</h1><div class="sub">Your starting point</div></div></header><div class="tiles areas">';
    h += '<div class="tile g3dtile atile" style="--tc:' + (tk.urgent ? "#D1495B" : "#6B8F71") + '">' + (tk.urgent ? '<span class="badge">' + tk.urgent + '</span>' : "") +
      '<a class="alink" href="#/tasks"><span class="i">✓</span><b>Daily Tasks</b><div class="small muted">' + (tk.urgent ? tk.urgent + " urgent" : "Nothing urgent") + " · " + tk.week + ' this week</div></a>' +
      '<div class="tchips"><a href="#/tasks" class="tchip" style="--g:#D1495B">⚠ Urgent <span class="muted">· ' + tk.urgent + '</span></a><a href="#/tasks" class="tchip" style="--g:#6B8F71">This week <span class="muted">· ' + tk.week + '</span></a>' +
      spare.filter(function (s) { return tk.byArea[s[0]]; }).map(function (s) { return '<a href="#/tasks" class="tchip" style="--g:' + s[2] + '">' + s[1] + ' <span class="muted">· ' + tk.byArea[s[0]] + '</span></a>'; }).join("") +
      '<a href="#/tasks/notify" class="tchip" style="--g:#64748B">🔔</a></div></div>';
    AREAS.forEach(function (a) {
      var badge = tk.byArea[a.key], soon = !a.ready.length;
      h += '<div class="tile g3dtile atile' + (soon ? " off" : "") + '" style="--tc:' + a.color + '">' + (badge ? '<a class="badge" href="#/tasks" style="text-decoration:none;z-index:2">' + badge + '</a>' : "") +
        '<a class="alink" href="' + lastUrl(a) + '"><span class="i">' + a.icon + '</span><b>' + a.name + '</b><div class="small muted">' + (heads[a.key] || (soon ? "Coming soon" : "Open")) + '</div></a><div class="tchips">' +
        (soon ? '<span class="small muted">' + a.tabs.map(function (x) { return x.name; }).join(" · ") + '</span>'
              : a.ready.map(function (x) { return '<a href="' + x.url + '" class="tchip" style="--g:' + x.color + '">' + x.icon + " " + x.name + (lines[x.key] ? ' <span class="muted">· ' + lines[x.key] + '</span>' : "") + '</a>'; }).join("")) +
        '</div></div>';
    });
    return h + '</div><p class="small muted demo-note">Demo with a made-up household · nothing here is real</p>';
  }

  function soonArea(a) {
    return '<header class="top"><div><h1>' + a.name + '</h1><div class="sub">Coming soon</div></div></header><div class="tiles">' +
      a.tabs.map(function (x) { return '<div class="tile g3dtile off" style="--tc:' + a.color + '"><span class="i">' + x.icon + '</span><div><b>' + x.name + '</b><div class="small muted">Coming soon</div></div></div>'; }).join("") + '</div>';
  }

  function later(name, color) {    // a screen the demo doesn't have yet
    return '<header class="top"><div><h1>' + name + '</h1><div class="sub">Coming to the demo soon</div></div></header>' +
      '<div class="card g3d" style="--tc:' + color + '"><b>Not in the demo yet</b><div class="small muted">The navigation works; this screen is added in a later step.</div></div>';
  }

  // ---------- shell ----------
  function lastUrl(a) { try { var u = localStorage.getItem("demo.last." + a.key); if (u && a.ready.some(function (x) { return x.url === u; })) return u; } catch (e) {} return a.url; }

  // top strip: trail Hub › Area › Tab › Sub-tab (tap = whole app map), then this tab's sub-tabs
  function strip(area, tab, top, sub) {
    var trail = [{ name: "Hub", icon: "⊞", url: "#/", color: "#6B8F71", lvl: "Hub" }];
    if (top) trail.push({ name: TOP[top].name, icon: TOP[top].icon, url: "#/" + top, color: "#6B8F71", lvl: "Page" });
    if (area) trail.push({ name: area.name, icon: area.icon, url: lastUrl(area), color: area.color, lvl: "Area" });
    if (tab) trail.push({ name: tab.name, icon: tab.icon, url: tab.url, color: tab.color, lvl: "Tab" });
    var subs = tab ? tab.subs : top ? TOP[top].subs : [], subName = null;
    subs.forEach(function (s) { if (s[0] === sub) subName = s[1]; });
    if (subName) trail.push({ name: subName, icon: "", url: (tab ? tab.url : "#/" + top) + "/" + sub, color: tab ? tab.color : "#6B8F71", lvl: "Sub-tab" });
    var sm = '<span class="trail">' + trail.map(function (c, i) {
      return (i ? "<i>›</i>" : "") + '<span class="tc' + (i === trail.length - 1 ? " last" : " lvl-" + c.lvl.toLowerCase()) + '" style="--g:' + c.color + '">' + (c.icon ? "<em>" + c.icon + "</em>" : "") +
        (i === 0 && trail.length > 1 ? "" : '<span class="nm">' + c.name + '</span>') + '</span>'; }).join("") + '</span><b class="jcar">▾</b>';
    var here = '<div class="here"><span class="k">You are here</span>' + trail.map(function (c, i) {
      return (i ? " <i>›</i> " : "") + '<a href="' + c.url + '" style="--g:' + c.color + '">' + (i ? "<small>" + c.lvl + "</small>" : "") + c.icon + " " + c.name + '</a>'; }).join("") + '</div>';
    var mtop = '<div class="mtop"><div class="mnode' + (!area && !top ? " on" : "") + '"><a href="#/" class="mt">⊞ Hub</a></div>' + Object.keys(TOP).map(function (k) {
      return '<div class="mnode' + (top === k ? " on" : "") + '"><a href="#/' + k + '" class="mt">' + TOP[k].icon + " " + TOP[k].name + '</a><div class="msubs">' +
        TOP[k].subs.map(function (s) { return '<a href="#/' + k + "/" + s[0] + '" class="' + (top === k && sub === s[0] ? "on" : "") + '">' + s[1] + '</a>'; }).join("") + '</div></div>'; }).join("") + '</div>';
    var mareas = '<div class="mareas">' + AREAS.map(function (a) {
      var soon = a.tabs.filter(function (x) { return x.soon; }).map(function (x) { return x.name; });
      return '<div class="marea' + (area && area.key === a.key ? " on" : "") + '" style="--g:' + a.color + '"><a href="' + lastUrl(a) + '" class="ma"><span>' + a.icon + '</span> ' + a.name + '</a>' +
        a.ready.map(function (x) { return '<div class="mtab' + (tab && tab.key === x.key ? " on" : "") + '" style="--g:' + x.color + '"><a href="' + x.url + '" class="mt"><span>' + x.icon + '</span> ' + x.name + '</a>' +
          (x.subs.length ? '<div class="msubs">' + x.subs.map(function (s) { return '<a href="' + x.url + "/" + s[0] + '" class="' + (tab && tab.key === x.key && sub === s[0] ? "on" : "") + '">' + s[1] + '</a>'; }).join("") + '</div>' : "") + '</div>'; }).join("") +
        (soon.length ? '<div class="msoon">Soon: ' + soon.join(" · ") + '</div>' : "") + '</div>'; }).join("") + '</div>';
    var subsBar = subs.length ? '<div class="subs">' + subs.map(function (s) {
      return '<a href="' + (tab ? tab.url : "#/" + top) + "/" + s[0] + '" class="' + (sub === s[0] ? "on" : "") + '" style="--sec:' + (tab ? tab.color : "#6B8F71") + '">' + s[1] + '</a>'; }).join("") + '</div>' : "";
    return '<nav class="strip" aria-label="Where you are"><details class="jump"><summary title="Where you are · tap for the app map">' + sm + '</summary>' +
      '<div class="jumpmenu navmap">' + here + mtop + mareas + '</div></details>' + subsBar + '</nav>';
  }

  function bar(area, tab, key) {
    var h = '<a href="#/" class="hubbtn ' + (key === "" ? "on" : "") + '" title="Hub"><span class="i">⊞</span>Hub</a>';
    AREAS.forEach(function (a) {
      var open = area && area.key === a.key;
      if (!a.ready.length && !open) return;     // an area shows in the bar once a tab is built
      h += '<div class="tgroup area ' + (open ? "open" : "closed") + '" style="--g:' + a.color + '">';
      if (open && a.ready.length > 1) h += a.ready.map(function (x) { return '<a href="' + x.url + '" class="main ' + (tab && tab.key === x.key ? "on" : "") + '" style="--g:' + x.color + '"><span class="i">' + x.icon + '</span>' + x.short + '</a>'; }).join("");
      else h += '<a href="' + lastUrl(a) + '" class="main ' + (open ? "on" : "") + '"><span class="i">' + a.icon + '</span>' + a.name + '</a>';
      h += '</div>';
    });
    return h + '<a href="#/settings" class="gear ' + (key === "settings" ? "on" : "") + '" title="Settings"><span class="i">⚙</span></a>';
  }

  function route() {
    var key = (location.hash.replace(/^#\/?/, "") || "").split("?")[0], area = null, tab = null, top = null, body, page = null;
    var sub = key.split("/")[1] || null, tkey = key.split("/")[0];
    page = window.PAGES[key] || null;
    if (key === "") body = hub();
    else if (TABS[tkey]) { tab = TABS[tkey]; area = tab.area; body = page ? page.html() : later(tab.name + (sub ? " · " + sub : ""), tab.color); }
    else if (key.indexOf("area/") === 0) { area = AREAS.filter(function (a) { return a.key === key.slice(5); })[0]; body = area ? soonArea(area) : hub(); }
    else if (TOP[tkey]) { top = tkey; body = page ? page.html() : later(TOP[tkey].name, "#6B8F71"); }
    else { location.hash = "#/"; return; }
    if (tab) try { localStorage.setItem("demo.last." + area.key, tab.url); } catch (e) {}
    document.body.className = "sec-" + (tab ? tab.key : tkey || "hub") + (area ? " area-" + area.key : "");
    var paint = function () {
      var wrap = document.querySelector(".wrap");
      wrap.innerHTML = strip(area, tab, top, sub) + '<div class="page"></div>';
      mount(wrap.querySelector(".page"), body, page);
      document.querySelector("nav.tabs").innerHTML = bar(area, tab, key);
      document.title = tab ? tab.name + " · Hub Demo" : top ? TOP[top].name + " · Hub Demo" : "Hub Demo";
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
    window.UI.enhance(box);
    if (page && page.init) page.init(box, function () {
      var open = [].map.call(box.querySelectorAll('[data-lvkey][data-lvl="2"]'), function (x) { return x.dataset.lvkey; });
      var y = window.scrollY; mount(box, page.html(), page);
      open.forEach(function (k) { var x = document.querySelector('.page [data-lvkey="' + k + '"] .lvhead'); if (x) x.click(); });
      window.scrollTo(0, y);
    });
  }
  window.addEventListener("hashchange", route);
  document.addEventListener("click", function (e) {        // the app map closes after a pick; taps outside close it too
    var j = document.querySelector("nav.strip details.jump[open]"); if (j && (!j.contains(e.target) || e.target.closest(".jumpmenu a"))) j.open = false; });
  document.addEventListener("keydown", function (e) { var j = document.querySelector("nav.strip details.jump[open]"); if (j && e.key === "Escape") j.open = false; });
  route();
})();
