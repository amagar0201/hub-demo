/* Hub Demo: the whole app runs in the browser. Addresses are #/<tab>; each page is a function that returns HTML.
   Same structure as the real app: T1 Hub -> T2 areas -> T3 tabs -> T4 sub-tabs. Nothing is saved anywhere. */
(function () {
  var D = window.DEMO, T = D.totals;

  function t(key, name, icon, color, subs, short) {
    return { key: key, name: name, icon: icon, color: color, subs: subs || [], short: short || name, url: "#/" + key };
  }
  var AREAS = [
    { key: "money", name: "Money", icon: "$", color: "#2F5BD3", step: 2, tabs: [
      t("finances", "Finances", "$", "#2F5BD3", [["transactions", "Transactions"], ["history", "History"], ["radar", "Radar"], ["rentcf", "Rental CF"]]),
      t("networth", "Net Worth", "↗", "#2E8B57", [["realestate", "Real Estate"]])] },
    { key: "assets", name: "Assets", icon: "⌂", color: "#F2612D", step: 3, tabs: [
      t("cars", "Cars", "◎", "#7B2FF7", ["＋ Log", "History", "Rules", "Archived"]),
      t("homes", "Homes", "⌂", "#F2612D", ["＋ Log", "History", "Archived"])] },
    { key: "activities", name: "Activities", icon: "✦", color: "#0F8F83", soon: true, tabs: [
      t("guitar", "Guitar", "♫"), t("biking", "Biking", "◍"), t("hiking", "Hiking", "▲"), t("skiing", "Skiing", "❄"), t("travel", "Travel", "✈")] },
    { key: "utilities", name: "Utilities", icon: "ϟ", color: "#C98A12", step: 4, tabs: [
      t("gas", "Gas", "♨", "#D9772B", ["＋ Log reading"]),
      t("electricity", "Electricity", "ϟ", "#C98A12", ["＋ Log reading"], "Power"),
      t("water", "Water & Sewer", "≋", "#2F8FB0", ["＋ Log reading"], "Water"),
      t("hoa", "HOA", "▦", "#7A6FA8")] },
    { key: "identity", name: "Identity", icon: "◈", color: "#9F1239", step: 4, tabs: [
      t("vault", "Vault", "◈", "#9F1239", ["Renewals", "Documents"])] }
  ];
  AREAS.forEach(function (a) { a.tabs.forEach(function (x) { x.area = a; }); a.url = a.soon ? "#/area/" + a.key : a.tabs[0].url; });
  var TABS = {}; AREAS.forEach(function (a) { a.tabs.forEach(function (x) { TABS[x.key] = x; }); });
  var OTHER = { tasks: { name: "Daily Tasks", step: 4 }, settings: { name: "Settings", step: 4 } };

  function money(n, d) { var s = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); return (n < 0 ? "−$" : "$") + s; }
  function short(n) { var a = Math.abs(n); return a >= 1e6 ? "$" + (n / 1e6).toFixed(2) + "M" : a >= 1e4 ? "$" + Math.round(n / 1e3) + "k" : money(n); }

  // ---------- pages ----------
  function hub() {
    var tk = D.tasks, spare = [["money", "Money", "#2F5BD3"], ["assets", "Assets", "#F2612D"], ["utilities", "Utilities", "#C98A12"], ["identity", "Identity", "#9F1239"]];
    var heads = { money: "Net worth " + short(T.netWorth), assets: "Equity " + short(T.homeEquity + T.carEquity),
                  utilities: D.utilities.month + " bills " + money(T.bills), identity: D.renewals[0].what.split(" ·")[0] + " " + D.renewals[0].when };
    var lines = { finances: short(T.cash) + " cash", networth: short(T.netWorth), cars: D.cars[0].next.toLowerCase() + " " + D.cars[0].nextIn,
                  homes: "rent " + money(T.rentDue) + " due Oct 1", gas: money(D.utilities.gas), electricity: money(D.utilities.electricity),
                  water: money(D.utilities.water), hoa: money(D.utilities.hoa), vault: D.renewals.length + " renewals" };
    var h = '<header class="top"><div><h1>Hub</h1><div class="sub">Your starting point</div></div></header><div class="tiles areas">';
    h += '<div class="tile g3dtile atile" style="--tc:' + (tk.urgent ? "#D1495B" : "#6B8F71") + '">' + (tk.urgent ? '<span class="badge">' + tk.urgent + '</span>' : "") +
      '<a class="alink" href="#/tasks"><span class="i">✓</span><b>Daily Tasks</b><div class="small muted">' + (tk.urgent ? tk.urgent + " urgent" : "Nothing urgent") + " · " + tk.week + ' this week</div></a>' +
      '<div class="tchips"><a href="#/tasks" class="tchip" style="--g:#D1495B">⚠ Urgent <span class="muted">· ' + tk.urgent + '</span></a><a href="#/tasks" class="tchip" style="--g:#6B8F71">This week <span class="muted">· ' + tk.week + '</span></a>' +
      spare.filter(function (s) { return tk.byArea[s[0]]; }).map(function (s) { return '<a href="#/tasks" class="tchip" style="--g:' + s[2] + '">' + s[1] + ' <span class="muted">· ' + tk.byArea[s[0]] + '</span></a>'; }).join("") +
      '<a href="#/tasks" class="tchip" style="--g:#64748B">🔔</a></div></div>';
    AREAS.forEach(function (a) {
      var badge = tk.byArea[a.key];
      h += '<div class="tile g3dtile atile' + (a.soon ? " off" : "") + '" style="--tc:' + a.color + '">' + (badge ? '<a class="badge" href="#/tasks" style="text-decoration:none;z-index:2">' + badge + '</a>' : "") +
        '<a class="alink" href="' + lastUrl(a) + '"><span class="i">' + a.icon + '</span><b>' + a.name + '</b><div class="small muted">' + (heads[a.key] || (a.soon ? "Coming soon" : "Open")) + '</div></a><div class="tchips">' +
        (a.soon ? '<span class="small muted">' + a.tabs.map(function (x) { return x.name; }).join(" · ") + '</span>'
                : a.tabs.map(function (x) { return '<a href="' + x.url + '" class="tchip" style="--g:' + x.color + '">' + x.icon + " " + x.name + (lines[x.key] ? ' <span class="muted">· ' + lines[x.key] + '</span>' : "") + '</a>'; }).join("")) +
        '</div></div>';
    });
    return h + '</div><p class="small muted demo-note">Demo with a made-up household · nothing here is real</p>';
  }

  function soonArea(a) {
    return '<header class="top"><div><h1>' + a.name + '</h1><div class="sub">Coming soon</div></div></header><div class="tiles">' +
      a.tabs.map(function (x) { return '<div class="tile g3dtile off" style="--tc:' + a.color + '"><span class="i">' + x.icon + '</span><div><b>' + x.name + '</b><div class="small muted">Coming soon</div></div></div>'; }).join("") + '</div>';
  }

  function later(name, color, step) {    // screens built in the next steps
    return '<header class="top"><div><h1>' + name + '</h1><div class="sub">Screens arrive in step ' + step + '</div></div></header>' +
      '<div class="card g3d" style="--tc:' + color + '"><b>Not built yet</b><div class="small muted">The navigation works; this tab\'s screens come in step ' + step + '.</div></div>';
  }

  // ---------- shell ----------
  function lastUrl(a) { try { var u = localStorage.getItem("demo.last." + a.key); if (u && a.tabs.some(function (x) { return x.url === u; })) return u; } catch (e) {} return a.url; }

  function strip(area, tab, crumb, sub) {
    var s = '<nav class="strip" aria-label="Where you are"><details class="jump"><summary>' +
      (area ? '<span style="color:' + area.color + '">' + area.icon + '</span> ' + (tab ? tab.name : area.name) : "⊞ " + crumb) + ' ▾</summary><div class="jumpmenu">' +
      '<div class="jrow"><a href="#/">⊞ Hub</a><a href="#/tasks">✓ Daily Tasks</a><a href="#/settings">⚙ Settings</a></div>' +
      AREAS.map(function (a) { return '<div class="jrow" style="--g:' + a.color + '"><b>' + a.icon + " " + a.name + '</b>' + a.tabs.map(function (x) {
        return '<a href="' + (a.soon ? a.url : x.url) + '" class="' + (a.soon ? "soon" : "") + (tab && tab.key === x.key ? " on" : "") + '">' + x.name + '</a>'; }).join("") + '</div>'; }).join("") +
      '</div></details><div class="subs">' + (tab ? tab.subs.map(function (n) {
        if (typeof n === "string") return '<a style="--sec:' + tab.color + '">' + n + '</a>';
        return '<a href="' + tab.url + "/" + n[0] + '" class="' + (sub === n[0] ? "on" : "") + '" style="--sec:' + tab.color + '">' + n[1] + '</a>'; }).join("") : "") + '</div></nav>';
    return s;
  }

  function bar(area, tab, key) {
    var h = '<a href="#/" class="hubbtn ' + (key === "" ? "on" : "") + '" title="Hub"><span class="i">⊞</span>Hub</a>';
    AREAS.forEach(function (a) {
      if (a.soon && !(area && area.key === a.key)) return;     // an area shows in the bar once a tab is built
      var open = area && area.key === a.key;
      h += '<div class="tgroup area ' + (open ? "open" : "closed") + '" style="--g:' + a.color + '">';
      if (open && a.tabs.length > 1 && !a.soon) h += a.tabs.map(function (x) { return '<a href="' + x.url + '" class="main ' + (tab && tab.key === x.key ? "on" : "") + '" style="--g:' + x.color + '"><span class="i">' + x.icon + '</span>' + x.short + '</a>'; }).join("");
      else h += '<a href="' + lastUrl(a) + '" class="main ' + (open ? "on" : "") + '"><span class="i">' + a.icon + '</span>' + a.name + '</a>';
      h += '</div>';
    });
    return h + '<a href="#/settings" class="gear ' + (key === "settings" ? "on" : "") + '" title="Settings"><span class="i">⚙</span></a>';
  }

  function route() {
    var key = (location.hash.replace(/^#\/?/, "") || "").split("?")[0], area = null, tab = null, body, crumb = null, page = null;
    var sub = key.split("/")[1] || null, tkey = key.split("/")[0];
    if (key === "") body = hub();
    else if (TABS[tkey]) { tab = TABS[tkey]; area = tab.area; page = window.PAGES[key];
      if (sub && !page) { location.hash = tab.url; return; }
      body = page ? page.html() : later(tab.name, tab.color, area.step); }
    else if (key.indexOf("area/") === 0) { area = AREAS.filter(function (a) { return a.key === key.slice(5); })[0]; body = area ? soonArea(area) : hub(); }
    else if (OTHER[key]) { crumb = OTHER[key].name; body = later(crumb, "#6B8F71", OTHER[key].step); }
    else { location.hash = "#/"; return; }
    if (tab) try { localStorage.setItem("demo.last." + area.key, tab.url); } catch (e) {}
    document.body.className = "sec-" + (tab ? tab.key : tkey || "hub");
    var paint = function () {
      var wrap = document.querySelector(".wrap");
      wrap.innerHTML = (area || crumb ? strip(area, tab, crumb, sub) : "") + '<div class="page"></div>';
      mount(wrap.querySelector(".page"), body, page);
      document.querySelector("nav.tabs").innerHTML = bar(area, tab, key);
      document.title = tab ? tab.name + " · Hub Demo" : crumb ? crumb + " · Hub Demo" : "Hub Demo";
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
  document.addEventListener("click", function (e) {        // the jump menu closes after a pick; taps outside close it too
    var j = document.querySelector("nav.strip details.jump[open]"); if (j && (!j.contains(e.target) || e.target.closest(".jumpmenu a"))) j.open = false; });
  route();
})();
