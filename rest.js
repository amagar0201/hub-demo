/* Daily Tasks, Utilities, Identity Vault, Audit and Settings. Same cards and rows as the real app; nothing is saved. */
(function () {
  var D = window.DEMO, U = window.UI, P = window.PAGES;
  var cur = U.cur, cur0 = U.cur0, km = U.km;
  function head(title, sub, right) { return '<header class="top"><div><h1>' + title + '</h1><div class="sub">' + sub + '</div></div>' + (right || "") + '</header>'; }
  function byKey(list, k) { return list.filter(function (x) { return x.key === k; })[0]; }
  function off(what) { return 'onclick="UI.toast(\'Demo · ' + what + ' is turned off\');return false"'; }
  var AREA = { money: ["Money", "#2F5BD3"], assets: ["Assets", "#F2612D"], rentals: ["Rentals", "#1F6F8B"], utilities: ["Utilities", "#C98A12"], identity: ["Identity", "#9F1239"] };

  // ================= Daily Tasks =================
  function when(t) { var d = t[5]; return d == null ? (t[7] === "notice" ? t[4] : "—") : d < 0 ? -d + " d late" : d === 0 ? "Today" : d === 1 ? "Tomorrow" : "in " + d + " d"; }
  function trow(t) {
    var late = t[8] || (t[5] != null && t[5] < 0), lead = t[7] === "notice" ? "Seen" : "Done";
    return '<div class="swipe" data-area="' + t[3] + '"><form class="swlead"><button class="sw done">✓<span>' + lead + '</span></button></form>' +
      '<form class="swacts">' + (t[7] === "notice" ? '<button class="sw done">👍<span>Not an issue</span></button>' : "") + '<button class="sw defer">⏰<span>Tomorrow</span></button><button class="sw defer">💤<span>1 week</span></button><button class="sw cancel">✕<span>Skip</span></button></form>' +
      '<a class="uline swrow' + (late ? " overdue" : "") + '" href="' + t[9] + '"><i class="tdot" style="background:' + AREA[t[3]][1] + '"></i><span class="ultext"><b>' + t[1] + '</b><span>' + t[2] + '</span></span>' +
      '<span class="tgo" style="padding:4px 6px;font-size:16px;color:var(--sec,#2F5BD3)">↗</span>' +
      '<span class="ulwhen"><b>' + (t[6] || when(t)) + '</b><span>' + (t[6] ? when(t) : (t[5] != null ? t[4] : "")) + '</span></span></a></div>';
  }
  var TA = { area: "" };
  P.tasks = { html: function () {
    var L = D.taskList, groups = [["urgent", "Urgent", "#D1495B"], ["week", "This week", "#6B8F71"], ["later", "Later · 30 days", "#8A9A8E"], ["fyi", "FYI", "#64748B"]];
    var counts = {}; L.forEach(function (t) { counts[t[3]] = (counts[t[3]] || 0) + 1; });
    var h = '<header class="top row between"><div><h1>Daily Tasks</h1><div class="sub">' + D.tasks.urgent + ' urgent · ' + D.tasks.week + ' this week · Sep 29, 2026</div></div><a class="fchip" href="#/tasks/notify">🔔</a></header>';
    h += '<div class="fchips" id="tareas"><a class="fchip' + (!TA.area ? " on" : "") + '" data-a="" href="#">All</a>' + Object.keys(AREA).filter(function (k) { return counts[k]; }).map(function (k) {
      return '<a class="fchip' + (TA.area === k ? " on" : "") + '" data-a="' + k + '" href="#"><i class="tdot" style="background:' + AREA[k][1] + '"></i>' + AREA[k][0] + ' <span class="muted">' + counts[k] + '</span></a>'; }).join("") + '</div>';
    groups.forEach(function (g) {
      var rows = L.filter(function (t) { return t[0] === g[0] && (!TA.area || t[3] === TA.area); });
      h += '<details class="card g3d tgroup" style="--tc:' + g[2] + '"' + (g[0] === "urgent" ? " open" : "") + '><summary class="row between"><b>' + (g[0] === "urgent" ? "⚠ " : "") + g[1] + '</b><span class="small muted">' + rows.length + '</span></summary>' +
        rows.map(trow).join("") + (rows.length ? "" : '<div class="small muted" style="margin-top:6px">Nothing here</div>') +
        (g[0] === "urgent" && rows.length ? '<div class="swhint">→ right: done · ← left: snooze or skip · tap: open it where it\'s done</div>' : "") + '</details>';
    });
    h += '<details class="card g3d tgroup" style="--tc:#8A9A8E"><summary class="row between"><b>Planned · 12 months</b><span class="small muted">' + D.planned.reduce(function (a, p) { return a + p[1]; }, 0) + '</span></summary>' +
      D.planned.map(function (p) { return '<div class="row between small" style="margin-top:6px"><span>' + p[0] + '</span><span class="muted">' + p[1] + '</span></div>'; }).join("") + '</details>';
    h += '<details class="card"><summary class="row between"><b>Add a task</b><span class="small muted">checks what\'s already there</span></summary><form style="display:grid;gap:6px;margin-top:8px" ' + off("adding") + '>' +
      '<input placeholder="What needs doing"><div class="row" style="gap:6px"><select><option>No home / car</option><option>Maple</option><option>Cedar</option><option>Birch</option><option>Ioniq 5</option><option>Outback</option></select><input type="date"></div>' +
      '<button class="btn" ' + off("adding") + '>Add task</button></form></details>';
    h += '<details class="card"><summary class="row between"><b>Done recently</b><span class="small muted">' + D.tasksDone.length + ' · last 30 days</span></summary>' + D.tasksDone.map(function (d) {
      return '<div class="row between small" style="margin-top:4px"><span><i class="tdot" style="background:' + AREA[d[1]][1] + '"></i> ' + d[0] + '</span><span class="muted">' + (d[2] === "done" ? "✓" : d[2]) + ' ' + d[3] + '</span></div>'; }).join("") + '</details>';
    return h;
  }, init: function (root, again) {
    root.addEventListener("click", function (e) { var c = e.target.closest("#tareas .fchip"); if (!c) return; e.preventDefault(); TA.area = c.dataset.a; again(); });
  } };
  P["tasks/notify"] = { html: function () {
    return head("🔔 Notifications", "Daily Tasks on your lock screen · per device") +
      '<div class="card g3d" style="--tc:#6B8F71"><div class="row between"><b>This device</b><span class="small muted">off</span></div><div class="small muted" style="margin-top:6px">On an iPhone, add the app to the home screen first, then turn it on here.</div>' +
      '<div class="row" style="gap:8px;margin-top:10px"><button class="btn" ' + off("notifications") + '>Turn on</button></div></div>' +
      '<details class="card" open><summary class="row between"><b>What you\'ll get</b><span class="small muted">rules</span></summary><div class="small" style="margin-top:6px;display:grid;gap:4px">' +
      ['One summary every morning after the daily run (\'⚠ 2 urgent · 5 this week\').', 'A separate push only for a <b>new Urgent</b> item — at most 3 a day; the rest are in the summary.',
       'Nothing between 21:30 and 07:30.', 'The lock screen never shows amounts, account endings or ID details.'].map(function (x) { return '<div>• ' + x + '</div>'; }).join("") + '</div></details>';
  } };

  // ================= Utilities =================
  var UK = { gas: "Gas", electricity: "Electricity", water: "Water & Sewer", hoa: "HOA" };
  function pct(a, b) { if (!a || !b) return ""; var p = (a - b) / b * 100; return '<span class="' + (p >= 30 ? "due" : "muted") + '">' + (p >= 0 ? "+" : "") + Math.round(p) + '%</span>'; }
  function utilPage(kind) {
    var u = D.utilityData[kind], tot = 0, prev = 0;
    u.homes.forEach(function (x) { x.months.forEach(function (m) { tot += m.cost; prev += m.prev || 0; }); });
    var bank = { maple: "Northwind ••4417", cedar: "Harbor ••8124", birch: "Harbor ••8125" };
    var h = head(UK[kind], "Last 12 months " + cur0(tot) + " · year before " + cur0(prev) + " " + pct(tot, prev));
    u.homes.forEach(function (x) {
      var hm = byKey(D.homes, x.key), last12 = x.months.reduce(function (a, m) { return a + m.cost; }, 0), prev12 = x.months.reduce(function (a, m) { return a + (m.prev || 0); }, 0), sep = x.months[11];
      h += '<details class="card g3d" style="--tc:' + hm.color + '"><summary class="row between"><span><b>' + hm.name + '</b><div class="small muted">Sep ' + cur0(sep.cost) + ' · a year before ' + cur0(sep.prev) + ' · 12 mo ' + pct(last12, prev12) + '</div></span><b>' + cur0(last12) + '</b></summary>' +
        x.months.slice().reverse().map(function (m, i) { var j = 11 - i, use = x.usage ? x.usage[j] : null;
          return '<details class="umonth"><summary class="row between small"><span>' + m.m + ' ' + (j >= 3 ? 2026 : 2025) + (use != null ? '<span class="muted"> · ' + use + ' ' + u.unit + '</span>' : "") + '</span>' +
            '<span><span class="muted">' + cur0(m.prev) + ' →</span> <b>' + cur0(m.cost) + '</b> ' + pct(m.cost, m.prev) + '</span></summary>' +
            '<div class="row between small" style="margin-top:2px"><span>' + (j >= 3 ? "" : "") + m.m + ' 11 · ' + bank[x.key] + ' · ' + (hm.kind === "own" ? "Own home" : "Rental") + '</span><span>' + cur0(m.cost) + '</span></div></details>'; }).join("") + '</details>';
    });
    h += '<details class="card"><summary class="row between"><b>By year</b><span class="small muted">every home, sold ones too</span></summary>' +
      [[2026, tot * 0.74], [2025, prev], [2024, prev * 0.94], [2023, prev * 0.9]].map(function (y) { return '<div class="row between small" style="margin-top:4px"><span>' + y[0] + (y[0] === 2026 ? " so far" : "") + '</span><b>' + cur0(y[1]) + '</b></div>'; }).join("") + '</details>';
    return h + '<p class="small muted" style="margin-top:10px">What the banks paid, tied to each home (the same rows Homes counts).' + (u.unit ? ' Usage: Maple meter readings.' : "") + ' Bill jumps are flagged in Finances › Radar.</p>';
  }
  ["gas", "electricity", "water", "hoa"].forEach(function (k) { P[k] = { html: function () { return utilPage(k); } }; });

  // ================= Identity Vault =================
  var SC = { expired: "#B23B2E", renew: "#C77A2E", soon: "#C9A227", ok: "#6B8F71" }, SL = { renew: "renew now", soon: "coming up", ok: "ok" };
  function vaultHead() { return head("Identity Vault", "Identity &amp; education for the family · locks after 5 min idle", '<button class="btn" ' + off("locking") + '>🔒 Lock</button>'); }
  P.vault = { html: function () {
    var n = { renew: 0, soon: 0 }; D.vaultDocs.forEach(function (d) { if (n[d[4]] != null) n[d[4]]++; });
    return vaultHead() + '<details class="card g3d" style="--tc:' + SC.renew + '" open><summary class="row between"><b>Renewals</b><span class="small muted">' + n.renew + ' to renew · ' + n.soon + ' coming up</span></summary>' +
      D.vaultDocs.map(function (d) {
        return '<details style="margin-top:6px"><summary class="row between small" style="gap:8px;list-style:none;cursor:pointer"><span style="flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"><span class="dot" style="background:' + SC[d[4]] + '"></span> ' + d[0] + ' · ' + d[1] + '</span>' +
          '<span class="muted" style="white-space:nowrap">' + (d[3] <= 120 ? d[3] + " d left" : d[2].replace(/ \d+,/, "")) + '</span></summary><div class="small muted" style="margin:4px 0 0 18px">Expires ' + d[2] + ' · ' + SL[d[4]] + (d[5] ? "<br>" + d[5] : "") + '</div></details>'; }).join("") +
      '<div class="small muted" style="margin-top:8px">Each one also appears in Daily Tasks on its start-renewal date.</div></details>' +
      '<details class="card"><summary class="row between"><b>Add a document to track</b><span class="small muted">names &amp; dates only</span></summary><div class="small muted" style="margin-top:6px">Kind · whose · label · issued / expires · start-renewal lead time. Never ID numbers.</div></details>';
  } };
  P["vault/documents"] = { html: function () {
    return vaultHead() + D.vaultFolders.map(function (f) { var total = f[1].reduce(function (a, s) { return a + s[1]; }, 0);
      return '<details class="card"><summary class="row between"><b>' + f[0] + '</b><span class="small muted">' + total + ' files</span></summary>' + f[1].map(function (s) {
        return '<details class="vsub"><summary class="row between small"><b>' + s[0] + '</b><span class="muted">' + s[1] + '</span></summary><div class="small muted" style="padding:4px 0 4px 10px">Files open and download from the family\'s own cloud folder; the app never copies them.</div></details>'; }).join("") + '</details>'; }).join("");
  } };

  // ================= Audit =================
  var AY = { y: 2025 };
  function yearchips(route) {
    return '<div class="ychips">' + D.audit.years.map(function (y) { var c = D.audit.check[y];
      return '<a class="chip' + (y === AY.y ? " on" : "") + '" data-y="' + y + '" href="#">' + y + (c ? ' <span class="warnn">⚠' + c + '</span>' : ' <span class="okn">✓</span>') + '</a>'; }).join("") + '</div>';
  }
  function yinit(root, again) { root.addEventListener("click", function (e) { var c = e.target.closest(".ychips .chip"); if (!c) return; e.preventDefault(); AY.y = +c.dataset.y; again(); }); }
  function ev(b, l) { return '<span class="evbar"><i class="b" style="width:' + b + '%"></i><i class="l" style="width:' + l + '%"></i><i class="y" style="width:' + (100 - b - l) + '%"></i></span><span class="evtxt">bank ' + b + '% · log ' + l + '%</span>'; }
  P.reports = { html: function () {
    var A = D.audit, sc = 1 - (2025 - AY.y) * 0.04;
    var h = head("Reports · " + AY.y, "From the household's own data, read-only · each line opens to its transactions") + yearchips() +
      '<div class="dlbar"><a class="chip" href="#" ' + off("downloading") + '>⬇ Excel pack ' + AY.y + '</a><a class="chip" href="#" ' + off("printing") + '>🖨 Print / PDF</a></div>';
    h += '<details class="card g3d" style="--tc:#4F46E5"><summary class="row between"><span><b>Σ Year summary</b><div class="small muted">' + (A.check[AY.y] ? A.check[AY.y] + " ⚠" : "all ✓") + ' vs the filed return</div></span><b>' + cur0(A.summary[0][1] * sc) + '</b></summary>' +
      '<div class="small muted" style="margin:4px 0">Your data · the filed return</div>' + A.summary.map(function (r) { return '<div class="grow row between"><span>' + r[0] + '</span><b class="gamt">' + cur0(r[1] * sc) + ' <span class="muted">· ' + cur0(r[2] * sc) + '</span></b></div>'; }).join("") +
      '<p class="small muted">Line by line with explanations: <a href="#/filed">Filed vs App ›</a></p></details>';
    var net = 0; A.rentals.forEach(function (r) { r.lines.forEach(function (l) { net += l[0] === "3" ? l[2] : -l[2]; }); });
    h += '<details class="card g3d" style="--tc:#F2612D"><summary class="row between"><span><b>⌂ Rentals per home</b><div class="small">' + ev(78, 22) + '</div></span><b>' + cur0(net * sc) + '</b></summary><div class="small muted" style="margin:4px 0">Schedule E lines</div>' +
      A.rentals.map(function (r) { var n = r.lines.reduce(function (a, l) { return a + (l[0] === "3" ? l[2] : -l[2]); }, 0);
        return '<details class="grow"><summary class="row between"><span><b>' + r.name + '</b><div class="small muted">rent ' + cur0(r.rent * sc) + ' · incl. depreciation</div></span><b class="gamt">' + cur0(n * sc) + '</b></summary>' +
          r.lines.map(function (l) { return '<details class="grow fig"><summary class="row between"><span><span class="ln">' + l[0] + '</span> ' + l[1] + '</span><b class="gamt">' + cur0(l[2] * sc) + '</b></summary><div class="small">' + ev(90, 10) + '</div></details>'; }).join("") + '</details>'; }).join("") + '</details>';
    [["₹ Foreign accounts (FBAR / 8938)", "#0F8F83", "No foreign accounts · FBAR not needed", "—"], ["▣ Home cost basis", "#7B2FF7", "price + closing + improvements − depreciation", "3 homes"],
     ["✓ Itemized deductions", "#2F5BD3", "Schedule A · your data vs the return", cur0(29840 * sc)], ["✚ HSA and 529", "#2E8B57", "money in and out vs qualifying costs that year", ""]].forEach(function (c) {
      h += '<details class="card g3d" style="--tc:' + c[1] + '"><summary class="row between"><span><b>' + c[0] + '</b><div class="small muted">' + c[2] + '</div></span><b>' + c[3] + '</b></summary><div class="small muted" style="margin-top:6px">Opens to its lines and the transactions behind each one.</div></details>'; });
    return h + '<p class="small muted" style="margin-top:10px">Evidence bar: <span class="evkey b"></span> bank feed / statements · <span class="evkey l"></span> typed log · <span class="evkey y"></span> year-end rows (weakest proof).</p>';
  }, init: yinit };
  P.filed = { html: function () {
    var A = D.audit, c = A.check[AY.y], st = { ok: "✓", small: "≈", explained: "≈", check: "⚠" };
    var rows = AY.y === 2025 ? A.filed : A.filed.map(function (r) { return [c ? (r[0] === "check" ? "check" : r[0]) : (r[0] === "check" ? "explained" : r[0])].concat(r.slice(1)); });
    var n = { ok: 0, small: 0, explained: 0, check: 0 }; rows.forEach(function (r) { n[r[0]]++; });
    return head("Filed vs App · " + AY.y, "The filed return, line by line, against the household's data") + yearchips() +
      '<div class="card g3d" style="--tc:#4F46E5"><div class="row between"><span><b>' + n.check + ' to explain</b><div class="small muted">✓ ' + n.ok + ' match · ≈ ' + n.small + ' small · ' + n.explained + ' explained</div></span><span class="small muted" style="text-align:right">Form 1040 · ' + AY.y + '<br>read Sep 28</span></div></div>' +
      '<div class="card"><div class="row between small muted fhead"><span>Line</span><span>Filed · App · Diff</span></div>' + rows.map(function (r) { var d = r[4] - r[5];
        return '<details class="grow frow st-' + r[0] + '"><summary class="row between"><span><span class="sti">' + st[r[0]] + '</span> ' + r[1] + ' <span class="small muted">' + r[2] + ' ' + r[3] + '</span></span>' +
          '<b class="gamt">' + cur0(r[4]) + ' <span class="muted">· ' + cur0(r[5]) + '</span>' + (d && r[0] !== "ok" ? ' <span class="' + (r[0] === "check" ? "due" : "muted") + '">' + (d > 0 ? "+" : "") + cur0(d) + '</span>' : "") + '</b></summary>' +
          (r[6] ? '<div class="small" style="margin:4px 0">' + r[6] + '</div>' : "") + (r[0] !== "ok" ? '<form class="anote"><textarea rows="2" placeholder="Your explanation (kept with the ' + AY.y + ' return; clears the ⚠)"></textarea><div class="row between small"><span class="muted"></span><button ' + off("saving") + '>Save note</button></div></form>' : "") + '</details>'; }).join("") + '</div>' +
      '<p class="small muted">Only line amounts are kept from the return (never SSNs, bank numbers, names or the preparer\'s details). ✓ within $1 · ≈ small or explained · ⚠ needs you.</p>';
  }, init: yinit };
  P["reports/cpa"] = { html: function () {
    var q = D.audit.filed.filter(function (r) { return r[0] === "check"; });
    return head("Questions for your CPA", "Every year's open points from Filed vs App, with what the app found and your notes") +
      '<div class="dlbar"><a class="chip" href="#" ' + off("downloading") + '>⬇ Excel</a><a class="chip" href="#" ' + off("printing") + '>🖨 Print / PDF</a></div>' +
      [[2025, q], [2023, [["check", "Estimated tax payments", "1040", "26", 4000, 3000, "The app sees three $1,000 payments; the return claims four."], ["check", "Dividends", "1040", "3b", 1690, 1512, "A brokerage 1099 correction arrived after filing?"]]]].map(function (y) {
        return '<details class="card g3d cpa" style="--tc:#4F46E5"><summary class="row between"><span><b>' + y[0] + ' return</b><div class="small muted">' + y[1].length + ' question' + (y[1].length === 1 ? "" : "s") + '</div></span><a class="small" href="#/filed">Filed vs App ›</a></summary>' +
          y[1].map(function (r) { return '<div class="grow"><b>' + r[1] + '</b> <span class="small muted">' + r[2] + ' ' + r[3] + '</span><div class="small">Return ' + cur0(r[4]) + ' · your records ' + cur0(r[5]) + ' · difference ' + cur0(r[4] - r[5]) + '</div><div class="small muted">' + r[6] + '</div></div>'; }).join("") + '</details>'; }).join("") +
      '<p class="small muted">Built from the filed returns and the household\'s own records (read-only). Not tax advice: it\'s the list of what to ask and what to bring.</p>';
  } };

  // ================= Settings =================
  function row(icon, title, sub, chip, href) {
    return '<a class="card row between" href="' + (href || "#/settings") + '" style="display:flex;text-decoration:none;color:inherit"><span><b style="font-size:17px">' + icon + ' ' + title + '</b><span class="small muted" style="display:block">' + sub + '</span></span>' + (chip || "") + '<span class="bchev">›</span></a>';
  }
  P.settings = { html: function () {
    return head("Settings", "Every setup lives here: connections, accounts and the daily run") +
      '<div class="card"><div class="row between"><b style="font-size:17px">Daily run · 08:30</b><span class="hchip ok">🟢 All OK</span></div><div class="small muted">Last run Sep 29 08:30 (scheduled)</div>' +
      D.dailyRun.map(function (j) { return '<div class="small row between" style="margin-top:4px"><span>' + j[0] + '</span><span class="muted">✓</span></div>'; }).join("") +
      '<div style="margin-top:10px"><button class="btn" ' + off("running") + '>↻ Run now</button> <span class="small muted">Everything is computed once a day, in this one run.</span></div></div>' +
      row("", "Sign-in &amp; access", "Passkeys, recovery codes, people ›", "", "#/settings/access") + row("🔐", "Secrets", "API keys, bank tokens, app passwords · admin passcode", "") +
      row("🔔", "Notifications", "Daily Tasks on your lock screen · turn on per device", "", "#/tasks/notify") +
      '<div class="card"><div class="row between"><b style="font-size:17px">Appearance</b></div><div class="fchips" id="thchips" style="margin-top:8px"><a class="fchip on" data-th="auto" href="#">Auto</a><a class="fchip" data-th="light" href="#">☀ Light</a><a class="fchip" data-th="dark" href="#">🌙 Dark</a></div></div>' +
      '<div class="small muted" style="margin:14px 4px 4px;font-weight:700;letter-spacing:.04em">CONNECTIONS</div>' +
      row("🏦", "Bank connections", "5 connected", '<span class="hchip ok">🟢 Healthy</span>', "#/settings/banks") + row("🚗", "Car connection", "Connected · 1/1 calls today", '<span class="hchip ok">🟢 Connected</span>') +
      row("🏠", "Home values", "Redfin + RentCast · used for equity on the Homes tab", "", "#/homes/values");
  }, init: function (root) {
    var chips = root.querySelector("#thchips"); if (!chips) return;
    try { var v = localStorage.getItem("demo.theme") || "auto"; chips.querySelectorAll(".fchip").forEach(function (c) { c.classList.toggle("on", c.dataset.th === v); }); } catch (e) {}
    chips.addEventListener("click", function (e) { var c = e.target.closest(".fchip"); if (!c) return; e.preventDefault();
      try { localStorage.setItem("demo.theme", c.dataset.th); } catch (x) {} window.hubTheme(c.dataset.th);
      chips.querySelectorAll(".fchip").forEach(function (x) { x.classList.toggle("on", x === c); }); });
  } };
  P["settings/banks"] = { html: function () {
    return head("Bank connections", "Connect or disconnect any bank · health checked in the daily run") + Object.keys(D.banks).map(function (k) {
      var b = D.banks[k], n = D.accounts.filter(function (a) { return a.bank === k; }).length;
      return '<details class="card bconn" style="--tc:' + b.color + '"><summary class="bsum"><span class="bdot"></span><span style="flex:1"><b>' + b.name + '</b><span class="small muted" style="display:block">' + n + ' account' + (n > 1 ? "s" : "") + ' · updated Sep 29 08:31</span></span><span class="hchip ok">🟢 OK</span><span class="bchev">›</span></summary>' +
        D.accounts.filter(function (a) { return a.bank === k; }).map(function (a) { return '<div class="bacc"><span style="flex:1">' + a.name + ' <span class="muted">••' + a.end + '</span></span><b>' + cur(a.bal) + '</b></div>'; }).join("") + '</details>'; }).join("") +
      '<button class="btn primary" style="margin-top:8px" ' + off("connecting a bank") + '>＋ Connect a bank</button>';
  } };
  P["settings/access"] = { html: function () {
    return head("Sign-in &amp; access", "Passkeys (Face ID), recovery codes, who can open what") +
      '<div class="card"><b>Devices signed in</b>' + [["iPhone", "now"], ["iPad", "Sep 27"], ["Mac · Safari", "Sep 29"]].map(function (d) { return '<div class="row between small" style="margin-top:6px"><span>' + d[0] + ' <span class="muted">· last used ' + d[1] + '</span></span><button class="btn" ' + off("signing out") + '>Sign out</button></div>'; }).join("") + '</div>' +
      '<div class="card"><b>Recovery codes</b><div class="small muted">8 of 10 left · keep them printed and offline</div></div>' +
      '<div class="card"><b>People</b><div class="small muted" style="margin-top:4px">Alex · owner, every area<br>Jordan · Money, Assets, Rentals, Identity</div></div>' +
      '<div class="card"><b>Extra checks</b><div class="small muted" style="margin-top:4px">Money, Rentals, Audit: Face ID, 15 min idle<br>Identity: passcode + Face ID, 5 min idle<br>Every unlock ends after 8 h or when the app is in the background</div></div>';
  } };
})();
