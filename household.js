/* Household area: Task Management (tasks, tasks/filing|notify|done), Monthly Budgeting (mcf), Daily Budgeting (daily),
   Medical & Education (medcol, medcol/medical|recon). Every figure comes from window.DEMO (months, accounts, taskList) or is
   derived here from it, so the same number reads the same on every page. Nothing is saved anywhere. */
(function () {
  var D = window.DEMO, U = window.UI, P = window.PAGES;
  var esc = U.esc;
  function r2(n) { return Math.round(n * 100) / 100; }
  function n2(n) { return (n < 0 ? "−" : "") + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function n0(n) { return (n < 0 ? "−" : "") + Math.round(Math.abs(n)).toLocaleString("en-US"); }
  function off(what) { return 'onclick="UI.toast(\'Demo · ' + what + ' is turned off\');return false"'; }
  function head(title, sub, right) { return '<header class="top row between"><div><h1>' + title + '</h1><div class="sub">' + sub + '</div></div>' + (right || "") + '</header>'; }
  function acct(id) { return D.accounts.filter(function (a) { return a.id === id; })[0]; }
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var AREA = { money: ["Money", "#4F6FBF"], assets: ["Assets", "#C0714E"], household: ["Household", "#6E9A78"], identity: ["Identity", "#9C5670"], tax: ["Tax", "#6F66B2"], activities: ["Activities", "#4E918B"] };

  // undo toast: an in-page change that can be taken back (nothing is saved)
  function undoToast(text, undo) {
    var d = document.createElement("div"); d.className = "toast"; d.style.pointerEvents = "auto";
    d.innerHTML = esc(text) + ' · <a href="#" style="color:inherit;font-weight:700;text-decoration:underline">Undo</a>';
    document.body.appendChild(d);
    requestAnimationFrame(function () { d.classList.add("in"); });
    var gone = function () { d.classList.remove("in"); setTimeout(function () { d.remove(); }, 300); };
    d.querySelector("a").addEventListener("click", function (e) { e.preventDefault(); undo(); gone(); });
    setTimeout(gone, 4500);
  }

  var CSS = '<style>' +
    '.hh-tbl{width:100%;border-collapse:collapse;font-size:12.5px;font-variant-numeric:tabular-nums;white-space:nowrap}' +
    '.hh-tbl th{position:sticky;top:0;z-index:3;background:#1F3A5F;color:#fff;font-weight:700;font-size:13px;padding:7px 6px;text-align:right;border-top:0}' +
    '.hh-tbl th:first-child,.hh-tbl th.l{text-align:left}' +
    '.hh-tbl td{padding:6px;border-top:1px solid rgba(0,0,0,.06);text-align:right;color:var(--text)}' +
    '.hh-tbl td.l{text-align:left}.hh-box{overflow:auto;max-height:calc(100vh - 250px);min-height:260px;border:1px solid var(--line);border-radius:12px;background:var(--card)}' +
    '@media (prefers-color-scheme:dark){.hh-tbl th{background:#2B4C77}.hh-tbl td{border-top-color:rgba(255,255,255,.08)}}' +
    '.hh-pill{display:inline-block;font-size:11px;font-weight:700;padding:1px 8px;border-radius:999px;border:1px solid currentColor;line-height:1.6}' +
    '.hh-warn{color:#B45309}.hh-ok{color:#2E7D4F}.hh-red{color:#B3261E}.hh-blue{color:#2F5BD3}' +
    '.hh-leg{display:flex;gap:8px;flex-wrap:wrap;font-size:12px;margin:6px 0}.hh-leg span{padding:2px 9px;border-radius:999px;border:1px solid rgba(0,0,0,.08);color:#2F3A33}' +
    /* month colours (the Book's own scheme) */
    ':root{--m-old:#E2EFDA;--m-last:#DDEBF7;--m-now:#CDEFF3;--m-item:#FFF2CC;--m-call:#EADCF6;--m-focus:#E8761B;--m-t:#2F3A33}' +
    '@media (prefers-color-scheme:dark){:root{--m-old:#2B3A2B;--m-last:#2A394B;--m-now:#1F4147;--m-item:#4A4325;--m-call:#41335A;--m-t:#E7E4DC}}' +
    '.mcf-tbl tr.m td{color:var(--m-t)}.mcf-tbl tr.mg td{background:var(--m-old)}.mcf-tbl tr.mb td{background:var(--m-last)}.mcf-tbl tr.mc td{background:var(--m-now)}' +
    '.mcf-tbl tr.m{cursor:pointer}.mcf-tbl tr.m.now td{font-weight:700}' +
    '.mcf-tbl tr.focus td{border-top:2px solid var(--m-focus);border-bottom:2px solid var(--m-focus)}.mcf-tbl tr.focus td:first-child{border-left:2px solid var(--m-focus)}.mcf-tbl tr.focus td:last-child{border-right:2px solid var(--m-focus)}' +
    '.mcf-tbl tr.yr td{background:var(--card);font-weight:700;cursor:pointer;color:var(--text)}' +
    '.mcf-tbl tr.sub td{background:var(--card);font-size:12px;color:var(--text)}.mcf-tbl tr.sub.it td{background:var(--m-item);color:var(--m-t)}.mcf-tbl tr.sub.call td{background:var(--m-call);color:var(--m-t)}' +
    '.mcf-tbl tr.sub.hd td{font-weight:700;font-size:11.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.03em}' +
    '.mcf-tbl .hid{display:none}.mcf-tbl .neg{color:#B3261E}.mcf-tbl .pos{color:#2E7D4F}' +
    '.mcf-tbl td.dim{color:var(--muted)}' +
    '.hh-tbl .phn{display:none}.hh-tbl .t2{display:none}' +
    '@media (min-width:900px){.hh-wide{width:min(1240px,calc(100vw - 48px));position:relative;left:50%;transform:translateX(-50%)}}' +
    '@media (max-width:600px){.hh-tbl td.phn.l{white-space:normal;max-width:190px}.hh-tbl .t1{display:none}.hh-tbl .t2{display:inline}.hh-tbl .dk{display:none}.hh-tbl .phn{display:table-cell}.hh-tbl{font-size:12px}.hh-tbl th{font-size:12px;padding:6px 4px}.hh-tbl td{padding:6px 4px}.hh-box{max-height:calc(100vh - 230px)}}' +
    /* edit overlay */
    '.hh-ov{position:fixed;inset:0;z-index:9000;background:var(--bg);overflow:auto;padding:12px 14px 40px}' +
    '.hh-ov .ovh{position:sticky;top:-12px;background:var(--bg);padding:8px 0;z-index:2;display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:space-between}' +
    '.hh-ov .ml{border:1px solid var(--line);border-radius:12px;background:var(--card);margin:8px 0;overflow:hidden}' +
    '.hh-ov .ml>.mh{display:grid;grid-template-columns:1.1fr repeat(6,1fr);gap:6px;padding:9px 10px;cursor:pointer;font-size:12.5px;font-variant-numeric:tabular-nums;align-items:center}' +
    '.hh-ov .ml>.mh span:not(:first-child){text-align:right}.hh-ov .ml.cur{border:2px solid var(--m-focus)}' +
    '.hh-ov .mb2{display:none;padding:6px 12px 12px;border-top:1px solid var(--line)}.hh-ov .ml.open .mb2{display:block}' +
    '.hh-ov .ci2{display:grid;grid-template-columns:70px 64px 1fr 110px;gap:6px;align-items:center;padding:4px 0;font-size:12.5px}' +
    '.hh-ov input,.hh-ov select{font:inherit;padding:5px 7px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--text);min-width:0;width:100%;box-sizing:border-box}' +
    '.hh-ov .mhh{display:grid;grid-template-columns:1.1fr repeat(6,1fr);gap:6px;padding:4px 10px;font-size:11.5px;font-weight:700;color:#fff;background:#1F3A5F;border-radius:8px}.hh-ov .mhh span:not(:first-child){text-align:right}' +
    '@media (max-width:600px){.hh-ov .ml>.mh,.hh-ov .mhh{grid-template-columns:1.2fr 1fr 1fr 1fr}.hh-ov .mh .dk,.hh-ov .mhh .dk{display:none}.hh-ov .ci2{grid-template-columns:54px 1fr 90px}.hh-ov .ci2 .cd{display:none}}' +
    /* tasks */
    '.inv{padding:10px 12px 12px 34px;border-bottom:1px solid var(--line);background:var(--card);font-size:13px;display:grid;gap:6px}.inv h4{margin:0;font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}' +
    '.inv .acts{display:flex;gap:6px;flex-wrap:wrap}.uline[data-inv]{cursor:pointer}' +
    '.fdoc{display:grid;gap:8px}.fdoc .nm{font-weight:700;overflow-wrap:anywhere}.fdoc .pf{display:grid;grid-template-columns:78px 1fr;gap:2px 8px;font-size:13px}.fdoc .pf span:nth-child(odd){color:var(--muted)}' +
    '.fdoc.done{opacity:.75}.fdoc.done .acts{display:none}.fdoc .okl{display:none;color:#2E7D4F;font-weight:700}.fdoc.done .okl{display:block}' +
    '.mc-line{display:flex;align-items:center;gap:8px;padding:8px 4px;border-top:1px solid var(--line);font-size:13px}.mc-line .t{flex:1;min-width:0}.mc-line .t b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.mc-line .t span{display:block;color:var(--muted);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mc-line .a{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}' +
    '.mc-line.est .a,.mc-line.est .t b{color:var(--muted);font-style:italic}' +
    '</style>';

  // ===================================================== Daily Tasks =====================================================
  function when(t) { var d = t[5]; return d == null ? (t[7] === "notice" ? t[4] : "—") : d < 0 ? -d + " d late" : d === 0 ? "Today" : d === 1 ? "Tomorrow" : "in " + d + " d"; }
  var INV = {
    "Possible duplicate: Maple & Rye Bakery": ["Two charges of $18.40 from the same bakery within two minutes on Sep 17, both on Quill ••7751.", "You marked bakery look-alikes \"Not an issue\" 2 of the last 3 times.", ["Not an issue", "Dispute with Quill"]],
    "Furnace filter": ["Willow's furnace filter repeats every 3 months; the last one was logged Jun 26.", "You usually mark it done the same weekend.", ["Done", "Snooze 1 week"]]
  };
  function invBox(t) {
    var i = INV[t[1]], why = i ? i[0] : esc(t[2]) + (t[6] ? " · " + t[6] : "") + " · due " + t[4] + ".";
    var usual = i ? i[1] : (t[7] === "notice" ? "You usually mark this kind of notice \"Seen\" and move on." : "You usually finish this kind of task within two days of the due date.");
    var btns = (i ? i[2] : [t[7] === "notice" ? "Seen" : "Done", "Snooze 1 week"]);
    return '<div class="inv"><div><h4>What I found</h4>' + why + '</div><div><h4>🧠 What you usually do</h4>' + usual + '</div>' +
      '<div class="acts">' + btns.map(function (b) { return '<button class="btn" ' + off(b.toLowerCase()) + '>' + b + '</button>'; }).join("") + '<a class="btn" href="' + t[9] + '">Open where it\'s done ↗</a></div></div>';
  }
  function trow(t, idx) {
    var late = t[8] || (t[5] != null && t[5] < 0), lead = t[7] === "notice" ? "Seen" : "Done";
    return '<div class="swipe" data-area="' + t[3] + '" data-i="' + idx + '"><form class="swlead"><button type="button" class="sw done">✓<span>' + lead + '</span></button></form>' +
      '<form class="swacts">' + (t[7] === "notice" ? '<button type="button" class="sw done">👍<span>Not an issue</span></button>' : "") + '<button type="button" class="sw defer">⏰<span>Tomorrow</span></button><button type="button" class="sw defer">💤<span>1 week</span></button><button type="button" class="sw cancel">✕<span>Skip</span></button></form>' +
      '<div class="uline swrow' + (late ? " overdue" : "") + '" data-inv="' + idx + '"><i class="tdot" style="background:' + AREA[t[3]][1] + '"></i><span class="ultext"><b>' + esc(t[1]) + '</b><span>' + esc(t[2]) + '</span></span>' +
      '<span class="tgo" title="Investigate" style="padding:4px 6px;font-size:16px">🔍</span>' +
      '<span class="ulwhen"><b>' + (t[6] || when(t)) + '</b><span>' + (t[6] ? when(t) : (t[5] != null ? t[4] : "")) + '</span></span></div></div>';
  }
  var TA = { area: "" };
  P.tasks = { html: function () {
    var L = D.taskList, groups = [["urgent", "Urgent", "#D1495B"], ["week", "This week", "#6B8F71"], ["later", "Later · 30 days", "#8A9A8E"], ["fyi", "FYI", "#64748B"]];
    var counts = {}; L.forEach(function (t) { counts[t[3]] = (counts[t[3]] || 0) + 1; });
    var h = CSS + head("Daily Tasks", D.tasks.urgent + ' urgent · ' + D.tasks.week + ' this week · Oct 1, 2026', '<span class="row" style="gap:6px"><a class="fchip" href="#/tasks/filing">📂</a><a class="fchip" href="#/tasks/notify">🔔</a></span>');
    h += '<div class="fchips" id="tareas"><a class="fchip' + (!TA.area ? " on" : "") + '" data-a="" href="#">All</a>' + Object.keys(AREA).filter(function (k) { return counts[k]; }).map(function (k) {
      return '<a class="fchip' + (TA.area === k ? " on" : "") + '" data-a="' + k + '" href="#"><i class="tdot" style="background:' + AREA[k][1] + '"></i>' + AREA[k][0] + ' <span class="muted">' + counts[k] + '</span></a>'; }).join("") + '</div>';
    groups.forEach(function (g) {
      var rows = L.map(function (t, i) { return [t, i]; }).filter(function (x) { return x[0][0] === g[0] && (!TA.area || x[0][3] === TA.area); });
      h += '<details class="card g3d tgroup" style="--tc:' + g[2] + '"' + (g[0] === "urgent" ? " open" : "") + '><summary class="row between"><b>' + (g[0] === "urgent" ? "⚠ " : "") + g[1] + '</b><span class="small muted">' + rows.length + '</span></summary>' +
        rows.map(function (x) { return trow(x[0], x[1]); }).join("") + (rows.length ? "" : '<div class="small muted" style="margin-top:6px">Nothing here</div>') +
        (g[0] === "urgent" && rows.length ? '<div class="swhint">→ right: done · ← left: snooze or skip · tap a line: 🔍 Investigate opens right here</div>' : "") + '</details>';
    });
    h += '<details class="card g3d tgroup" style="--tc:#8A9A8E"><summary class="row between"><b>Planned · 12 months</b><span class="small muted">' + D.planned.reduce(function (a, p) { return a + p[1]; }, 0) + '</span></summary>' +
      D.planned.map(function (p) { return '<div class="row between small" style="margin-top:6px"><span>' + p[0] + '</span><span class="muted">' + p[1] + '</span></div>'; }).join("") + '</details>';
    h += '<details class="card"><summary class="row between"><b>Add a task</b><span class="small muted">checks what\'s already there</span></summary><form style="display:grid;gap:6px;margin-top:8px" ' + off("adding") + '>' +
      '<input placeholder="What needs doing"><div class="row" style="gap:6px"><select><option>No home / car</option><option>Willow</option><option>Juniper</option><option>CX-5</option></select><input type="date"></div>' +
      '<button class="btn" ' + off("adding") + '>Add task</button></form></details>';
    h += '<details class="card"><summary class="row between"><b>Done recently</b><span class="small muted">' + D.tasksDone.length + ' · last 30 days</span></summary>' + D.tasksDone.map(function (d) {
      return '<div class="row between small" style="margin-top:4px"><span><i class="tdot" style="background:' + AREA[d[1]][1] + '"></i> ' + esc(d[0]) + '</span><span class="muted">' + (d[2] === "done" ? "✓" : d[2]) + ' ' + d[3] + '</span></div>'; }).join("") + '</details>';
    return h;
  }, init: function (root, again) {
    root.addEventListener("click", function (e) {
      var c = e.target.closest("#tareas .fchip"); if (c) { e.preventDefault(); TA.area = c.dataset.a; again(); return; }
      var r = e.target.closest(".uline[data-inv]"); if (!r) return;
      var sw = r.closest(".swipe"); if (sw.classList.contains("isopen") || sw.classList.contains("dragging")) return;
      var nx = sw.nextElementSibling;
      if (nx && nx.classList.contains("inv")) { nx.remove(); return; }
      var d = document.createElement("div"); d.innerHTML = invBox(D.taskList[+r.dataset.inv]); sw.parentNode.insertBefore(d.firstChild, sw.nextSibling);
    });
    // swipe buttons: hide the row with an Undo toast (capture phase, before the shared "not saved" handler)
    root.addEventListener("click", function (e) {
      var b = e.target.closest(".swipe .sw"); if (!b) return;
      e.stopPropagation(); e.preventDefault();
      var sw = b.closest(".swipe"), row = sw.querySelector(".swrow");
      row.style.transform = ""; sw.classList.remove("isopen");
      var inv = sw.nextElementSibling; if (inv && inv.classList.contains("inv")) inv.remove();
      sw.style.display = "none";
      var w = (b.querySelector("span") || b).textContent.trim();
      undoToast(w + " · " + sw.querySelector(".ultext b").textContent + " (demo, not saved)", function () { sw.style.display = ""; });
    }, true);
  } };

  // ===================================================== Filing =====================================================
  var FOLDERS = ["04 Assets / Willow / Appliances & Warranties", "04 Assets / Willow / Mortgage & Escrow", "04 Assets / Juniper / Insurance", "04 Assets / Juniper / Rent 2026-27 L. Moreau",
    "07 Insurance / Juniper", "07 Insurance / Willow", "02 Tax / Income Tax / 2025", "02 Tax / Property Tax", "Misc / From Hub / 2026"];
  var DOCS = [
    { nm: "water-heater-warranty-card.pdf", src: "Upload box · Oct 1", kind: "Warranty", home: "Willow", folder: FOLDERS[0], name: "2026 Water heater warranty (Willow).pdf", then: "A task 30 days before the warranty ends will be added." },
    { nm: "PM-policy-renewal-2026.pdf", src: "Gmail · Pine Mutual · Sep 29", kind: "Insurance", home: "Juniper", folder: FOLDERS[4], name: "2026 Juniper landlord policy.pdf", then: "An 'Insurance renewal' task will be added 21 days before the next renewal." },
    { nm: "1098_Willow_2025.pdf", src: "Gmail · Larkspur Credit Union · Sep 27", kind: "Tax form", home: "Willow", folder: FOLDERS[6], name: "2025 1098 Willow mortgage interest.pdf", then: "Tax forms are only placed in the Income Tax folder." }
  ];
  P["tasks/filing"] = { html: function () {
    var h = CSS + head("📂 Filing", DOCS.length + " documents waiting · nothing is copied until you approve", '<button class="btn" id="fileall">Approve all</button>');
    h += DOCS.map(function (d, i) {
      return '<div class="card g3d fdoc" style="--tc:#6E9A78" data-i="' + i + '"><div class="row between"><span class="nm">' + esc(d.nm) + '</span><span class="hh-pill hh-blue">' + d.kind + '</span></div>' +
        '<div class="pf"><span>From</span><span>' + d.src + '</span><span>Home</span><span>' + d.home + '</span><span>Folder</span><span class="fld">' + d.folder + '</span><span>New name</span><span>' + esc(d.name) + '</span></div>' +
        '<div class="small muted">' + d.then + '</div>' +
        '<div class="acts row" style="gap:6px;flex-wrap:wrap"><button class="btn primary ap">Approve</button><select class="chg" style="min-height:44px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--text);padding:0 8px"><option value="">Change folder…</option>' +
        FOLDERS.map(function (f) { return '<option>' + f + '</option>'; }).join("") + '</select><button class="btn sk">Skip</button></div>' +
        '<div class="okl">✓ Filed to <span class="fld2"></span> · <a href="#" class="und">Undo</a></div></div>';
    }).join("");
    h += '<div class="card"><b>Left out on purpose</b><div class="small muted" style="margin-top:6px">Bank and card statements are never filed. 1 duplicate was skipped (same size as a file already in 02 Tax). Documents only go into your own folders after you approve them, never overwriting, and never into the Vault folders.</div></div>';
    h += '<details class="card"><summary class="row between"><b>Drop a file</b><span class="small muted">or use the Hub Inbox folder</span></summary><div style="margin-top:8px;border:2px dashed var(--line);border-radius:12px;padding:22px;text-align:center" class="small muted">Drop files here · they are read on this Mac and proposed a folder</div></details>';
    return h;
  }, init: function (root) {
    function fileIt(card) { card.classList.add("done"); card.querySelector(".fld2").textContent = card.querySelector(".fld").textContent; }
    root.addEventListener("click", function (e) {
      var card = e.target.closest(".fdoc"), b = e.target;
      if (b.id === "fileall") { root.querySelectorAll(".fdoc:not(.done)").forEach(fileIt); UI.toast("Demo · filed 3 documents (nothing is saved)"); return; }
      if (!card) return;
      if (b.classList.contains("ap")) { fileIt(card); undoToast("Approved (demo, not saved)", function () { card.classList.remove("done"); }); }
      else if (b.classList.contains("sk")) { card.style.display = "none"; undoToast("Skipped (demo, not saved)", function () { card.style.display = ""; }); }
      else if (b.classList.contains("und")) { e.preventDefault(); card.classList.remove("done"); }
    });
    root.addEventListener("change", function (e) { if (!e.target.classList.contains("chg") || !e.target.value) return;
      var card = e.target.closest(".fdoc"); card.querySelector(".fld").textContent = e.target.value; UI.toast("Folder changed · Approve to file it"); });
  } };

  // ===================================================== Notifications =====================================================
  P["tasks/notify"] = { html: function () {
    return CSS + head("🔔 Notifications", "Daily Tasks on your lock screen · per device") +
      '<div class="card g3d" style="--tc:#6B8F71"><div class="row between"><b>This device</b><span class="small muted">off</span></div><div class="small muted" style="margin-top:6px">On an iPhone, add the app to the home screen first, then turn it on here.</div>' +
      '<div class="row" style="gap:8px;margin-top:10px"><button class="btn" ' + off("notifications") + '>Turn on</button></div></div>' +
      '<div class="card"><b>Devices</b>' +
      [["iPhone · Casey", "Home-screen app · turned on Sep 12", "on"], ["iPhone · Morgan", "Home-screen app · turned on Sep 14", "on"], ["MacBook · Safari", "Never turned on", "off"]].map(function (d) {
        return '<div class="row between" style="padding:8px 0;border-top:1px solid var(--line)"><span><b>' + d[0] + '</b><div class="small muted">' + d[1] + '</div></span><button class="btn" ' + off(d[2] === "on" ? "turning off" : "notifications") + '>' + (d[2] === "on" ? "Turn off" : "Turn on") + '</button></div>'; }).join("") + '</div>' +
      '<details class="card" open><summary class="row between"><b>What you\'ll get</b><span class="small muted">rules</span></summary><div class="small" style="margin-top:6px;display:grid;gap:4px">' +
      ['One summary every morning after the daily run (\'⚠ ' + D.tasks.urgent + ' urgent · ' + D.tasks.week + ' this week\').', 'A separate push only for a <b>new Urgent</b> item, at most 3 a day; the rest are in the summary.',
       'Nothing between 21:30 and 07:30.', 'The lock screen never shows amounts, account endings or ID details.', 'Each person only hears about the tabs they may open.'].map(function (x) { return '<div>• ' + x + '</div>'; }).join("") + '</div></details>' +
      '<details class="card"><summary class="row between"><b>Last sent</b><span class="small muted">this week</span></summary>' +
      [["Oct 01 · 08:31", "Morning summary · 2 urgent · 5 this week"], ["Sep 30 · 08:30", "Morning summary · 1 urgent · 4 this week"], ["Sep 28 · 14:02", "New urgent · Possible duplicate charge"]].map(function (x) {
        return '<div class="row between small" style="margin-top:6px"><span>' + x[1] + '</span><span class="muted">' + x[0] + '</span></div>'; }).join("") + '</details>';
  } };

  // ===================================================== Done for you =====================================================
  var DFY = [["Filed 6 utility bills as Utilities", "Valley Gas · Lakeside Power · Metro Water; you filed these 12 of 12 times", "money"],
             ["Marked \"Seen\": Auto-invest check", "you marked this notice Seen 4 times in a row", "money"],
             ["Skipped a duplicate document", "1098 from Larkspur, same size as the file in 02 Tax", "tax"],
             ["Marked Not an issue: card fee < $3", "you did this 5 of 5 times", "money"],
             ["Tidied 3 categories", "filed like your history for the same merchant", "money"],
             ["Cancellation email: PhotoKit trial", "marked Cancelled for you", "money"]];
  P["tasks/done"] = { html: function () {
    return CSS + head("Done for you", DFY.length + " items this week · Sep 21–27, 2026") +
      '<div class="card"><div class="small muted">The app only handles a kind of item when your own past choices were at least 80 % one way over 10 or more. Real-world to-dos, security and bank items are never touched. Each one can be undone for 8 days.</div></div>' +
      '<div class="card g3d" style="--tc:#6B8F71" id="dfy">' + DFY.map(function (d, i) {
        return '<div class="row between mc-line" data-i="' + i + '" style="align-items:flex-start"><span class="t" style="white-space:normal"><b style="white-space:normal"><i class="tdot" style="background:' + AREA[d[2]][1] + '"></i> ' + esc(d[0]) + '</b><span style="white-space:normal">' + esc(d[1]) + '</span></span><button class="btn und">Undo</button></div>'; }).join("") + '</div>' +
      '<details class="card"><summary class="row between"><b>What it would do next</b><span class="small muted">learning</span></summary><div class="small muted" style="margin-top:6px">After you undo an item, that kind counts against automatic handling, and the app asks you again next time.</div></details>';
  }, init: function (root) {
    root.addEventListener("click", function (e) { var b = e.target.closest(".und"); if (!b) return; var l = b.closest(".mc-line");
      l.style.opacity = .45; undoToast("Undone (demo, not saved)", function () { l.style.opacity = 1; }); });
  } };

  // ===================================================== Monthly Budgeting (the Book) =====================================================
  var M = D.months, CUR = M.map(function (m) { return m.ym; }).indexOf("2026-10"), LAST = CUR - 1, CHK = M.map(function (m) { return m.ym; }).indexOf("2026-07"), FOCUS = CHK + 1;
  function mcls(i) { return i >= CUR ? "mc" : i >= LAST - 3 ? "mb" : "mg"; }
  function allCash(m) { return r2(m.cash + m.invest + m.s529); }
  function rentB(m) { return m.y < 2026 ? 1450 : m.y === 2026 ? 1495 : 1540; }
  // tracked items: [day, code, description, amount (out is negative), status ok = matched ✓ / plan, app's amount]
  var TRK = { "2025-03": [["Mar 14", "HOME", "Garage door tune-up", -185, "ok"]], "2025-06": [["Jun 20", "CAR", "CX-5 tire rotation & alignment", -120, "ok"]],
    "2025-11": [["Nov 12", "SUBS", "PhotoKit yearly", -119, "ok"]], "2025-12": [["Dec 18", "TRAVEL", "Holiday travel", -1150, "ok"]], "2026-02": [["Feb 10", "TAX", "Tax prep fee", -240, "ok"]],
    "2026-06": [["Jun 11", "HOME", "Back-yard fence stain", -480, "ok"]], "2026-08": [["Aug 20", "EDU", "Band instrument rental · Ellis", -210, "ok"]],
    "2026-09": [["Sep 08", "EDU", "SAT prep course · Ellis", -389, "ok"], ["Sep 26", "HOME", "Dryer vent cleaning", -85, "ok"]],
    "2026-10": [["Oct 20", "CAR", "Oil change · CX-5", -95, "plan", -112], ["Oct 24", "HOME", "Hose bibs shut off · supplies", -30, "plan", -30]],
    "2026-11": [["Nov 12", "SUBS", "PhotoKit yearly", -119, "plan", -119]], "2026-12": [["Dec 18", "TRAVEL", "Holiday travel", -1200, "plan", -1150]],
    "2027-01": [["Jan 19", "ID", "Driver's license renewal · Morgan", -45, "plan", -45]], "2027-03": [["Mar 12", "HOME", "Furnace service", -160, "plan", -160]],
    "2027-04": [["Apr 02", "TAX", "Tax prep fee", -250, "plan", -240]], "2027-06": [["Jun 20", "CAR", "CX-5 inspection", -140, "plan", -140]], "2027-08": [["Aug 15", "EDU", "Back-to-school · Ellis", -420, "plan", -400]] };
  function trk(m) { return TRK[m.ym] || []; }
  function trkSum(m) { return trk(m).reduce(function (t, x) { return t + x[3]; }, 0); }
  function cell(v, cls) { return '<td class="dk ' + (cls || "") + '">' + v + '</td>'; }
  function expl(i) {
    var o = M[i], p = M[i - 1]; if (!p) return null;
    var inv529 = 300, auto = r2(o.savings - o.topUp - inv529), rb = rentB(o), ra = r2(o.rent - rb);
    var interest = r2(o.locOwed - p.locOwed + o.locPaid), mk = r2(o.s529 - p.s529 - inv529);
    var L = [];
    function add(col, label, v) { L.push({ col: col, label: label, v: r2(v) }); }
    add("cash", "Pay · Casey + Morgan", o.income); add("cash", "Spending", -o.spending); add("cash", "Willow mortgage", -o.mortgage);
    if (o.carLoan) add("cash", "Car loan · CX-5", -o.carLoan);
    add("cash", "Line of credit paid", -o.locPaid); add("cash", "Moved to Juniper LLC", -o.topUp); add("cash", "529 · Ellis contribution", -inv529); add("cash", "Auto-invest to your brokerage", -auto);
    add("loc", "Paid by you", -o.locPaid); add("loc", "Interest (" + o.rate.toFixed(2) + "%)", interest);
    add("s529", "Added from your cash", inv529); add("s529", "Market change", mk);
    add("inv", "Rent · Unit A", ra); add("inv", "Rent · Unit B", rb); add("inv", "From your cash", o.topUp); add("inv", "Juniper mortgage", -o.juniperMortgage); add("inv", "Water & sewer", -o.water);
    if (o.repairs) add("inv", "Repairs", -o.repairs);
    add("all", "Cash", o.cash - p.cash); add("all", "529 · Ellis", o.s529 - p.s529); add("all", "Invest Bal (rental cash)", o.invest - p.invest);
    return L;
  }
  function subRows(i) {
    var o = M[i], L = expl(i), cols = ["cash", "loc", "s529", "inv", "all"], names = { cash: "Cash", loc: "HELOC", s529: "529", inv: "Invest Bal", all: "All Cash" }, h = "";
    var open = function (extra) { return '<tr class="sub hid ' + extra + '" data-of="' + i + '">'; };
    h += open("hd") + '<td class="dk"></td><td class="dk l">What changed since ' + (M[i - 1] ? M[i - 1].label : "the start") + '</td><td class="dk"></td><td class="dk"></td><td class="dk"></td><td class="dk">Cash</td><td class="dk">HELOC</td><td class="dk">529</td><td class="dk">Invest</td><td class="dk">All Cash</td><td class="phn l" colspan="4">What changed since ' + (M[i - 1] ? M[i - 1].label : "the start") + '</td></tr>';
    if (L) L.forEach(function (x) {
      var idx = cols.indexOf(x.col), cells = "";
      cols.forEach(function (c, k) { cells += '<td class="dk ' + (c === x.col ? (x.v < 0 ? "neg" : "pos") : "") + '">' + (c === x.col ? n2(x.v) : "") + '</td>'; });
      h += open("") + '<td class="dk"></td><td class="dk l">' + esc(x.label) + '</td><td class="dk"></td><td class="dk"></td><td class="dk"></td>' + cells +
        '<td class="phn l" colspan="3">' + esc(names[x.col]) + ' · ' + esc(x.label) + '</td><td class="phn ' + (x.v < 0 ? "neg" : "pos") + '">' + n2(x.v) + '</td></tr>';
    });
    h += open("") + '<td class="dk"></td><td class="dk l">Manual adjustment</td><td class="dk"></td><td class="dk"></td><td class="dk pos">0.00</td><td class="dk" colspan="5"></td><td class="phn l" colspan="3">Manual adjustment · none, ties to the bank</td><td class="phn pos">0.00</td></tr>';
    trk(o).forEach(function (t) {
      h += open("it") + '<td class="dk">' + t[1] + '</td><td class="dk l">' + esc(t[2]) + '</td><td class="dk">' + t[0] + '</td><td class="dk">' + n2(t[3]) + (t[4] === "ok" ? " ✓" : "") + '</td><td class="dk" colspan="6"></td>' +
        '<td class="phn l" colspan="3">' + t[0] + ' · ' + esc(t[2]) + (t[4] === "ok" ? " ✓" : "") + '</td><td class="phn">' + n2(t[3]) + '</td></tr>';
    });
    if (o.ym === "2026-09") h += open("call") + '<td class="dk">NEW</td><td class="dk l" colspan="4">Sep 24 · College Board · AP exam fee · Quill ••7751 · one-off, not tracked yet</td><td class="dk" colspan="5"><a class="hh-pill hh-ok" href="#" ' + off("tracking") + '>✓ Verify · track it</a> <a class="hh-pill" href="#" ' + off("dismissing") + '>Not tracked</a></td>' +
      '<td class="phn l" colspan="4">Sep 24 · AP exam fee −98.00 · <a href="#" ' + off("tracking") + '>✓ Verify</a></td></tr>';
    return h;
  }
  function monthRow(i) {
    var o = M[i], cls = "m " + mcls(i) + (i === CUR ? " now" : "") + (i === FOCUS ? " focus" : ""), items = trk(o), ts = trkSum(o);
    var nm = items.length ? items.map(function (t) { return t[2]; }).slice(0, 1)[0] + (items.length > 1 ? " +" + (items.length - 1) : "") : "—";
    var lock = i <= CHK ? " 🔒" : "";
    var ahead = i >= CUR, tr = items.length ? n2(ts) + (!ahead && items.every(function (t) { return t[4] === "ok"; }) ? " ✓" : "") : "—";
    return '<tr class="' + cls + '" data-i="' + i + '" data-y="' + (o.y === 2026 && i < CUR ? "2026" : o.y === 2025 ? "2025" : "") + '"' + (o.y === 2025 || (o.y === 2026 && i < CUR) ? "" : "") + '>' +
      '<td class="dk l dim">' + (i < CUR ? "EOM" : i === CUR ? "NOW" : "PLAN") + '</td><td class="dk l">' + esc(nm) + '</td><td class="l">' + o.label + lock + (i === FOCUS ? ' <button class="hh-pill hh-ok" style="background:transparent;cursor:pointer" data-chk="1"><span class="t1">✓ Checked</span><span class="t2">✓</span></button>' : "") + '</td>' +
      '<td>' + tr + '</td><td class="dk">' + (i === 0 ? "—" : "0.00") + '</td><td>' + n2(o.cash) + '</td><td class="dk">' + n2(o.locOwed) + '</td><td class="dk">' + n2(o.s529) + '</td><td class="dk">' + n2(o.invest) + '</td><td>' + n2(allCash(o)) + '</td></tr>' + subRows(i);
  }
  function yearRow(y, last, label, open) {
    var o = M[last];
    return '<tr class="yr" data-yr="' + y + '"><td class="dk l"><span class="ch">' + (open ? "▾" : "▸") + '</span></td><td class="dk l">' + label + '</td><td class="l">' + y + ' 🔒</td><td>—</td><td class="dk">0.00</td><td>' + n2(o.cash) + '</td><td class="dk">' + n2(o.locOwed) + '</td><td class="dk">' + n2(o.s529) + '</td><td class="dk">' + n2(o.invest) + '</td><td>' + n2(allCash(o)) + '</td></tr>';
  }
  P.mcf = { html: function () {
    var c = M[LAST], h = CSS + head("Monthly Budgeting", 'Cash ' + U.cur0(c.cash) + ' · All Cash ' + U.cur0(allCash(c)) + ' · Juniper line owed ' + U.cur0(c.locOwed) + ' · checked through Jul 2026', '<button class="btn" id="mcfedit">✎ Edit</button>');
    h += '<div class="hh-leg"><span style="background:var(--m-old)">Older months</span><span style="background:var(--m-last)">Last 4 months</span><span style="background:var(--m-now)">This month &amp; ahead</span><span style="background:var(--m-item)">Tracked items</span><span style="border:2px solid var(--m-focus)">Next to check</span></div>';
    h += '<div class="hh-box hh-wide"><table class="hh-tbl mcf-tbl"><thead><tr><th class="l dk">Code</th><th class="l dk">Desc</th><th class="l">Month</th><th><span class="t1">Tracked Payments</span><span class="t2">Tracked</span></th><th class="dk">Manual Adj</th><th>Cash</th><th class="dk">HELOC</th><th class="dk">529</th><th class="dk">Invest Bal</th><th>All Cash</th></tr></thead><tbody>';
    var i;
    var i25 = M.map(function (m) { return m.ym; }).indexOf("2025-12");
    h += yearRow(2025, i25, "Closed year · 12 months", false);
    for (i = 0; i <= i25; i++) h += monthRow(i).replace('<tr class="m', '<tr class="m hid').replace('class="m hid mg', 'class="m hid mg');
    h += yearRow(2026, LAST, "This year · closed months", true);
    for (i = i25 + 1; i <= LAST; i++) h += monthRow(i);
    for (i = CUR; i < M.length; i++) h += monthRow(i);
    h += '</tbody></table></div><p class="small muted" style="margin:8px 0">Tap a month to see what changed in each column. HELOC = what is owed on the Juniper line of credit. Months ahead come from the plan: your pay, the bills and your tracked items.</p>';
    return h;
  }, init: function (box) {
    var tbl = box.querySelector(".mcf-tbl");
    tbl.addEventListener("click", function (e) {
      if (e.target.closest("[data-chk]")) { e.stopPropagation(); UI.toast("Demo · checking a month is turned off"); return; }
      var yr = e.target.closest("tr.yr");
      if (yr) { var y = yr.dataset.yr, open = yr.querySelector(".ch").textContent === "▸"; yr.querySelector(".ch").textContent = open ? "▾" : "▸";
        [].forEach.call(tbl.querySelectorAll('tr.m[data-y="' + y + '"]'), function (r) { r.classList.toggle("hid", !open); if (!open) tbl.querySelectorAll('tr.sub[data-of="' + r.dataset.i + '"]').forEach(function (s) { s.classList.add("hid"); }); });
        return; }
      var m = e.target.closest("tr.m"); if (!m) return;
      var subs = tbl.querySelectorAll('tr.sub[data-of="' + m.dataset.i + '"]'), show = subs[0].classList.contains("hid");
      [].forEach.call(subs, function (s) { s.classList.toggle("hid", !show); });
    });
    box.querySelector("#mcfedit").addEventListener("click", function () { openEdit(box); });
  } };

  function openEdit(box) {
    var ov = document.createElement("div"); ov.className = "hh-ov";
    var h = '<div class="ovh"><div><b style="font-size:18px">✎ Edit</b><div class="small muted">One line per month · demo: saving is turned off</div></div><span class="row" style="gap:6px"><button class="btn" id="ovpar">⚙ Model parameters</button><button class="btn primary" id="ovclose">✓ Close &amp; back</button></span></div>';
    h += '<div id="ovpanel" style="display:none" class="card"></div>';
    h += '<div class="mhh"><span>Month</span><span>Tracked</span><span>Cash</span><span class="dk">HELOC</span><span class="dk">529</span><span class="dk">Invest Bal</span><span>All Cash</span></div>';
    for (var i = LAST; i < M.length; i++) {
      var o = M[i], items = trk(o), locked = i === LAST, cur = i === CUR;
      var body = '<div class="mb2">' + (locked ? '<div class="small muted">🔒 Last closed month · read only</div>' : "");
      items.forEach(function (t, k) {
        var app = t[5] != null ? t[5] : t[3], same = Math.abs(app - t[3]) < .005;
        body += '<div class="ci2"><span>' + t[0] + '</span><span class="cd">' + t[1] + '</span><span>' + esc(t[2]) + '</span><span><input class="ed" value="' + n2(t[3]) + '" ' + (locked || t[4] === "ok" ? "disabled" : "") + '></span></div>' +
          (locked || t[4] === "ok" ? "" : '<div class="small muted" style="text-align:right;margin-top:-2px">' + (same ? "the app agrees" : "app: " + n2(app) + ' · <a href="#" class="useapp">Use app\'s value</a>') + ' · <a href="#" class="rm">✕ remove</a></div>');
      });
      if (!items.length) body += '<div class="small muted">No tracked items this month.</div>';
      if (!locked) body += '<div class="ci2" style="margin-top:6px"><span><input placeholder="Date"></span><span class="cd"><input placeholder="Code"></span><span><input class="newd" placeholder="Add a line: what, e.g. dentist"></span><span><input placeholder="Amount"></span></div>' +
        '<div class="small muted">App\'s suggestion as you type: code from the words, the amount of your last similar item, and how it will be matched to a bank line.</div>';
      body += '<div class="small muted" style="margin-top:8px"><b>Model lines</b> · Pay Casey ' + n2(o.income - 2 * (o.y <= 2025 ? 2175.30 : o.y === 2026 ? 2240.15 : r2(2240.15 * 1.03))) + ' · Pay Morgan ' + n2(2 * (o.y <= 2025 ? 2175.30 : o.y === 2026 ? 2240.15 : r2(2240.15 * 1.03))) + ' · Spending ' + n2(o.spending) + ' · Mortgage ' + n2(o.mortgage) + ' · Line of credit ' + n2(o.locPaid) + '</div></div>';
      h += '<div class="ml' + (cur ? " cur open" : "") + '"><div class="mh"><span><b>' + o.label + '</b>' + (locked ? " 🔒" : cur ? " · now" : "") + '</span><span>' + (items.length ? n2(trkSum(o)) : "—") + '</span><span>' + n2(o.cash) + '</span><span class="dk">' + n2(o.locOwed) + '</span><span class="dk">' + n2(o.s529) + '</span><span class="dk">' + n2(o.invest) + '</span><span>' + n2(allCash(o)) + '</span></div>' + body + '</div>';
    }
    ov.innerHTML = h; box.appendChild(ov);
    var cs = M[CUR + 3], c26 = D.people[0].name;
    ov.querySelector("#ovpanel").innerHTML = '<b>Model parameters</b><div class="small muted">The only recurring figures you set; everything else the model works out. A step applies from its month on.</div>' +
      '<table class="hh-tbl" style="margin-top:8px"><thead><tr><th class="l">From</th><th>Pay · Casey</th><th>Pay · Morgan</th><th>529 · Ellis added</th></tr></thead><tbody>' +
      '<tr><td class="l">Jan 2026</td><td>3,185.40</td><td>2,240.15</td><td>300.00</td></tr><tr><td class="l">Jan 2027 · +3%</td><td>' + n2(r2(3185.40 * 1.03)) + '</td><td>' + n2(r2(2240.15 * 1.03)) + '</td><td>300.00</td></tr></tbody></table>';
    ov.addEventListener("click", function (e) {
      var t = e.target;
      if (t.id === "ovclose") { ov.remove(); return; }
      if (t.id === "ovpar") { var p = ov.querySelector("#ovpanel"); p.style.display = p.style.display === "none" ? "" : "none"; return; }
      if (t.classList.contains("useapp") || t.classList.contains("rm")) { e.preventDefault(); UI.toast("Demo · editing is turned off"); return; }
      var mh = t.closest(".mh"); if (mh && !t.closest("input")) mh.parentNode.classList.toggle("open");
    });
    ov.addEventListener("change", function (e) { if (e.target.tagName === "INPUT") { UI.toast("Demo · saving is turned off"); e.target.value = e.target.defaultValue; } });
  }

  // ===================================================== Daily Budgeting =====================================================
  var T0 = new Date(2026, 9, 1);
  function dt(y, m, d) { return new Date(y, m, d); }
  var PER = [dt(2026, 7, 22), dt(2026, 8, 5), dt(2026, 8, 19), dt(2026, 9, 3), dt(2026, 9, 17), dt(2026, 9, 31), dt(2026, 10, 14), dt(2026, 10, 28)].map(function (s) { return { s: s, e: new Date(s.getFullYear(), s.getMonth(), s.getDate() + 13) }; });
  // PER[0..1] earlier (shown on demand), PER[2] = Sep 19-Oct 2 (current)
  var CURP = 2;
  function pad(n) { return ("0" + n).slice(-2); }
  function md2(d) { return MON[d.getMonth()] + " " + pad(d.getDate()); }
  function dim(y, m) { return new Date(y, m + 1, 0).getDate(); }
  function monthly(day, f) { return function (p) { var out = [], d = new Date(p.s); while (d <= p.e) { var dd = day === "end" ? dim(d.getFullYear(), d.getMonth()) : day; if (d.getDate() === dd) out.push({ d: new Date(d), v: f(d) }); d.setDate(d.getDate() + 1); } return out; }; }
  function every14(f) { return function (p) { var out = [], d = new Date(p.s); while (d <= p.e) { var diff = Math.round((d - dt(2026, 7, 7)) / 864e5); if (diff % 14 === 0) out.push({ d: new Date(d), v: f(d) }); d.setDate(d.getDate() + 1); } return out; }; }
  function two(day) { var a = monthly(day, function () { return [2240.15, "est"]; }), b = monthly("end", function () { return [2240.15, "est"]; }); return function (p) { return a(p).concat(b(p)); }; }
  var A = "auto", B = "bill", E = "est", S = "sched";
  var ROWS = [
    { sec: "In", name: "Casey · Payroll", due: "every other Fri", f: every14(function () { return [3185.40, E]; }), kind: "in", acct: "Larkspur ••2093" },
    { sec: "In", name: "Morgan · Payroll", due: "15th + last", f: two(15), kind: "in", acct: "Tidewater ••6618" },
    { sec: "Credit cards", name: "Quill Everyday Card ••7751", due: 18, f: monthly(18, function (d) { return d.getMonth() === 8 ? [2566.02, E] : d.getMonth() === 9 ? [-acct("a5").bal, B] : [1240, E]; }), kind: "out" },
    { sec: "Credit cards", name: "Tidewater Visa ••3307", due: 9, f: monthly(9, function (d) { return d.getMonth() === 8 ? [512.40, E] : d.getMonth() === 9 ? [-acct("a6").bal, S] : [470, E]; }), kind: "out" },
    { sec: "Credit cards", name: "Payment Credit · HSA (dental, Morgan)", due: "", f: function (p) { return (p.s <= dt(2026, 9, 9) && p.e >= dt(2026, 9, 9)) ? [{ d: dt(2026, 9, 9), v: [-184, "chk"] }] : []; }, kind: "out", note: "Withdraw $184.00 from the HSA to pay this back; red until you schedule it." },
    { sec: "Bills", name: "Willow mortgage · Larkspur", due: 1, f: monthly(1, function () { return [D.homes[0].payment, A]; }), kind: "out" },
    { sec: "Bills", name: "Car loan · CX-5 · Larkspur", due: 12, f: monthly(12, function () { return [D.cars[0].payment, A]; }), kind: "out" },
    { sec: "Bills", name: "HOA · Willow", due: 5, f: monthly(5, function () { return [D.homes[0].hoa, A]; }), kind: "out" },
    { sec: "Bills", name: "Power · Lakeside", due: 8, f: monthly(8, function (d) { return d.getMonth() === 9 ? [131.10, B] : d.getMonth() === 10 ? [r2(101.20 * 1.03), E] : [131.10, E]; }), kind: "out" },
    { sec: "Bills", name: "Gas · Valley", due: 10, f: monthly(10, function (d) { return d.getMonth() === 9 ? [r2(34.20 * 1.03), E] : d.getMonth() === 10 ? [r2(71.40 * 1.03), E] : [38.60, E]; }), kind: "out" },
    { sec: "Bills", name: "Water · Metro", due: 14, f: monthly(14, function (d) { return d.getMonth() === 9 ? [r2(68.10 * 1.03), E] : d.getMonth() === 10 ? [r2(57.40 * 1.03), E] : [79.40, E]; }), kind: "out" },
    { sec: "Bills", name: "Auto insurance · Pine Mutual", due: 20, f: monthly(20, function () { return [128, A]; }), kind: "out" },
    { sec: "Bills", name: "Phone & internet · Hummingbird", due: 22, f: monthly(22, function () { return [112, A]; }), kind: "out" },
    { sec: "Bills", name: "Line of credit · Juniper", due: 20, f: monthly(20, function () { return [D.homes[1].loc.plan, B]; }), kind: "out" },
    { sec: "Savings & moves", name: "Auto-invest · Orchard Brokerage", due: 3, f: monthly(3, function () { return [400, A]; }), kind: "out" },
    { sec: "Savings & moves", name: "529 contribution · Ellis", due: 3, f: monthly(3, function () { return [300, A]; }), kind: "out" },
    { sec: "Savings & moves", name: "Transfer to Juniper LLC", due: 3, f: monthly(3, function () { return [D.months[CUR].topUp, A]; }), kind: "out" },
    { sec: "FYI · never counted", name: "Juniper mortgage · Bramble (from the LLC)", due: 1, f: monthly(1, function () { return [D.homes[1].payment, A]; }), kind: "fyi" },
    { sec: "FYI · never counted", name: "Rent in · Units A + B (to the LLC)", due: 1, f: monthly(1, function () { return [D.homes[1].rent, A]; }), kind: "fyi", rentIn: 1 },
    { sec: "FYI · never counted", name: "Water & sewer · Juniper (from the LLC)", due: 6, f: monthly(6, function () { return [D.homes[1].water, A]; }), kind: "fyi" }
  ];
  function cellsFor(row, p) {
    return row.f(p).map(function (o) {
      var v = o.v, st = v[1], paid = o.d <= T0 && st !== "chk";
      if (paid) st = "paid";
      return { d: o.d, amt: v[0], st: st };
    });
  }
  var STL = { est: "Estimate", bill: "Bill in", auto: "Autopaid", sched: "Scheduled", paid: "Paid ✓", chk: "To check" };
  function dcell(c, extra) { if (!c.length) return '<td class="' + extra + '"></td>'; var st = c[0].st, tot = c.reduce(function (t, x) { return t + x.amt; }, 0);
    return '<td class="d-' + st + ' ' + extra + '" title="' + c.map(function (x) { return md2(x.d) + " · " + STL[x.st]; }).join(" / ") + '">' + n2(tot) + (st === "paid" ? " ✓" : "") + (c.length > 1 ? "<small> ×" + c.length + "</small>" : "") + '<small class="dd">' + md2(c[0].d) + '</small></td>'; }
  function dailyFigures() {
    var res = PER.map(function (p) { var inn = 0, out = 0; ROWS.forEach(function (r) { var c = cellsFor(r, p), t = c.reduce(function (s, x) { return s + x.amt; }, 0); if (r.kind === "in") inn += t; else if (r.kind === "out") out += t; }); return { inn: r2(inn), out: r2(out) }; });
    var left = []; var chk = acct("a1").bal + acct("a3").bal; left[CURP] = r2(chk + 3185.40);   // the Oct 2 payday is still to come
    var pr = []; pr[CURP] = r2(left[CURP] - res[CURP].inn + res[CURP].out);
    for (var k = CURP + 1; k < PER.length; k++) { left[k] = r2(left[k - 1] + res[k].inn - res[k].out); pr[k] = left[k - 1]; }
    for (var j = CURP - 1; j >= 0; j--) { left[j] = pr[j + 1]; pr[j] = r2(left[j] - res[j].inn + res[j].out); }
    return { res: res, left: left, prior: pr };
  }
  P.daily = { html: function () {
    var F = dailyFigures(), cols = [], sections = [], h;
    for (var k = 0; k < PER.length - 1; k++) cols.push(k);   // 7 columns: 2 earlier + current + next 4 = indexes 0..6
    var show = [0, 1, 2, 3, 4, 5, 6];
    h = CSS + '<style>.hh-tbl td.d-est{background:#FFF2CC;font-style:italic;color:#2F3A33}.hh-tbl td.d-bill{background:#DDEBF7;color:#1F3A5F}.hh-tbl td.d-auto{background:#F8D7E3;color:#5A2236}.hh-tbl td.d-sched{background:#E2EFDA;color:#1E4D2B}.hh-tbl td.d-paid{background:#C6E0B4;color:#1E4D2B;font-weight:600}.hh-tbl td.d-chk{background:#F8CBCB;color:#7A1F1F}' +
      '.hh-tbl td small.dd{display:block;font-size:10px;opacity:.7;font-style:normal}.hh-tbl tr.sec td{background:var(--bg);font-weight:700;text-align:left;color:var(--muted);font-size:11.5px;text-transform:uppercase;letter-spacing:.04em}.hh-tbl tr.tot td{font-weight:700;border-top:2px solid var(--line)}' +
      '.dtbl td:first-child,.dtbl th:first-child{position:sticky;left:0;z-index:2;background:var(--card);text-align:left}.dtbl th:first-child{background:#1F3A5F;z-index:4}.dtbl tr.sec td:first-child{background:var(--bg)}' +
      '.dtbl .er{display:none}.dtbl.showE .er{display:table-cell}.dtbl td.cur,.dtbl th.cur{box-shadow:inset 2px 0 #2F5BD3,inset -2px 0 #2F5BD3}' +
      '@media (max-width:600px){.dtbl .nt{display:none}.dtbl .bl,.dtbl .dy{display:none}.dtbl td:first-child{max-width:118px;white-space:normal;line-height:1.2}}' +
      '@media (prefers-color-scheme:dark){.hh-tbl td.d-est,.hh-tbl td.d-bill,.hh-tbl td.d-auto,.hh-tbl td.d-sched,.hh-tbl td.d-paid,.hh-tbl td.d-chk{filter:brightness(.78) saturate(.9)}}</style>';
    h += head("Daily Budgeting", "Two-week periods from Saturday · this period Sep 19 – Oct 2 · cash left after the listed items " + U.cur0(F.left[CURP]), '<button class="btn" ' + off("editing") + '>✎ Edit</button>');
    h += '<div class="hh-leg">' + ["est", "bill", "auto", "sched", "paid", "chk"].map(function (s) { return '<span class="d-' + s + '" style="' + { est: "background:#FFF2CC", bill: "background:#DDEBF7", auto: "background:#F8D7E3", sched: "background:#E2EFDA", paid: "background:#C6E0B4", chk: "background:#F8CBCB" }[s] + '">' + STL[s] + '</span>'; }).join("") + '</div>';
    h += '<div class="hh-box hh-wide"><table class="hh-tbl dtbl" id="dtbl"><thead><tr><th class="l">Row</th><th class="bl" style="width:46px">Bill</th><th class="dy">Due</th>';
    show.forEach(function (k) { h += '<th class="' + (k < CURP ? "er" : "") + (k === CURP ? " cur" : "") + '">' + (k === CURP ? "Now · " : "") + md2(PER[k].s) + '–' + md2(PER[k].e) + '</th>'; });
    h += '</tr><tr><th class="l" style="font-size:11px;font-weight:600"><a href="#" id="erl" style="color:#fff">◂ Earlier periods</a></th><th class="bl"></th><th class="dy"></th>' + show.map(function (k) { return '<th class="' + (k < CURP ? "er" : "") + '" style="font-size:11px;font-weight:600">Prior ' + n0(F.prior[k]) + '</th>'; }).join("") + '</tr></thead><tbody>';
    var last = "";
    ROWS.forEach(function (r) {
      if (r.sec !== last) { last = r.sec; h += '<tr class="sec"><td colspan="' + (3 + show.length) + '">' + r.sec + '</td></tr>'; }
      h += '<tr><td class="l">' + esc(r.name) + (r.note ? '<div class="small muted nt" style="white-space:normal;font-size:11px">' + esc(r.note) + '</div>' : "") + '</td><td class="bl muted">' + (r.kind === "in" ? "" : r.kind === "fyi" ? "LLC" : r.sec === "Credit cards" ? "Stmt" : "Auto") + '</td><td class="dy muted">' + (r.due || "") + '</td>';
      show.forEach(function (k) { h += dcell(cellsFor(r, PER[k]), (k < CURP ? "er " : "") + (k === CURP ? "cur" : "")); });
      h += '</tr>';
    });
    function trw(lab, key, red) { return '<tr class="tot"><td class="l">' + lab + '</td><td class="bl"></td><td class="dy"></td>' + show.map(function (k) { var v = key === "inn" ? F.res[k].inn : key === "out" ? F.res[k].out : F.left[k]; return '<td class="' + (k < CURP ? "er " : "") + (k === CURP ? "cur " : "") + (red && v < 0 ? "hh-red" : "") + '">' + n2(v) + '</td>'; }).join("") + '</tr>'; }
    h += trw("In", "inn") + trw("Out", "out") + trw("Total left", "left", true);
    h += '</tbody></table></div><p class="small muted" style="margin:8px 0">A statement always wins over an estimate; before a statement the row uses your figure, else the trend. Payment Credit lines are money coming back (HSA) that lowers a card payment. FYI rows are paid from the Juniper LLC account and never count here. Tap ✎ Edit to type a formula like <b>400+150</b> into any cell (turned off in the demo).</p>';
    return h;
  }, init: function (box) {
    var t = box.querySelector("#dtbl");
    box.querySelector("#erl").addEventListener("click", function (e) { e.preventDefault(); t.classList.toggle("showE"); this.textContent = t.classList.contains("showE") ? "▸ Hide earlier" : "◂ Earlier periods"; });
  } };

  // ===================================================== Medical & Education =====================================================
  // line: [date, who, what, where, amount, card, chip, state]   chip: "" = resolved · text = the one missing piece
  var EDU = [
    { term: "Ellis-HS-JR-2026", lines: [
      ["Aug 12", "Activity & parking fees", "Ridgeview High", 145.00, "Quill ••7751", "", ""],
      ["Aug 20", "Band instrument rental", "Ridgeview High", 210.00, "Tidewater Visa ••3307", "No bill", ""],
      ["Sep 08", "SAT prep course", "Brightpath Tutoring", 389.00, "Quill ••7751", "", ""],
      ["Sep 22", "Chemistry lab kit", "Ridgeview High", 27.80, "Quill ••7751", "No bill", ""],
      ["Sep 24", "AP exam fee", "College Board", 98.00, "Quill ••7751", "No bill", ""],
      ["Nov", "Spring semester fees", "Ridgeview High", 145.00, "", "", "est"]] },
    { term: "Ellis-HS-SO-2025", lines: [
      ["Aug 14, 2025", "Activity & parking fees", "Ridgeview High", 135.00, "Quill ••7751", "", ""],
      ["Jan 21, 2026", "Biology lab fee", "Ridgeview High", 32.00, "Quill ••7751", "", ""],
      ["Mar 02, 2026", "AP prep book", "Book Nook", 62.40, "Quill ••7751", "", ""],
      ["May 07, 2026", "AP exam fee", "College Board", 96.00, "Quill ••7751", "", ""]] },
    { term: "Ellis-HS-FR-2024", lines: [
      ["Aug 16, 2024", "Activity & parking fees", "Ridgeview High", 125.00, "Quill ••7751", "", ""],
      ["Oct 03, 2024", "Field trip · science museum", "Ridgeview High", 28.00, "Quill ••7751", "", ""],
      ["Feb 11, 2025", "Orchestra instrument rental", "Ridgeview High", 190.00, "Tidewater Visa ••3307", "", ""]] }];
  var MED = [
    { term: "Medical-2026", lines: [
      ["Jan 14", "Dental cleaning", "Bright Smiles Dental · Morgan", 140.00, "Tidewater Visa ••3307", "", "", "Paid back Feb 02"],
      ["Mar 03", "Physical", "Ridgeview Pediatrics · Ellis", 65.00, "Quill ••7751", "", "", "Paid back Mar 20"],
      ["Apr 22", "Eye exam + lenses", "Lakeshore Eye · Casey", 312.00, "Tidewater Visa ••3307", "", "", "Paid back May 06"],
      ["Jun 09", "Prescription", "Ridgeview Pharmacy · Ellis", 24.30, "Quill ••7751", "", "", "Paid back Jun 24"],
      ["Aug 18", "Urgent care visit", "Valley Urgent Care · Ellis", 95.00, "Quill ••7751", "", "", "Paid back Sep 02"],
      ["Sep 24", "Dental · crown", "Bright Smiles Dental · Morgan", 184.00, "Tidewater Visa ••3307", "Not back from the HSA", "", ""]] },
    { term: "Medical-2025", lines: [
      ["Jul 08, 2025", "Dental cleaning", "Bright Smiles Dental · Casey", 140.00, "Tidewater Visa ••3307", "", "", "Paid back Jul 24, 2025"],
      ["Nov 04, 2025", "Flu shots · Casey + Morgan", "Ridgeview Pharmacy", 60.00, "Tidewater Visa ••3307", "", "", "Paid back Nov 20, 2025"],
      ["Dec 12, 2025", "Physical", "Ridgeview Pediatrics · Ellis", 65.00, "Quill ••7751", "", "", "Paid back Dec 29, 2025"]] }];
  function sumL(t) { return r2(t.lines.reduce(function (s, l) { return s + (l[6] === "est" ? 0 : l[3]); }, 0)); }
  function needs(t) { return t.lines.filter(function (l) { return l[5]; }).length; }
  function termHead(t, kind) {
    var n = needs(t);
    return '<summary class="row between"><span><b>' + t.term + '</b><div class="small muted">' + t.lines.filter(function (l) { return l[6] !== "est"; }).length + ' lines · ' + U.cur(sumL(t)) + '</div></span><span>' +
      (n ? '<span class="hh-pill hh-warn">⚠ ' + n + ' need attention</span>' : '<span class="hh-pill hh-ok">All set ✓</span>') + '</span></summary>';
  }
  function line(l, kind) {
    var est = l[6] === "est", chip = l[5] ? '<span class="hh-pill hh-warn">⚠ ' + l[5] + '</span>' : (est ? '<span class="hh-pill" style="color:var(--muted)">Estimate</span>' : (kind === "med" && l[7] ? '<span class="small muted">✓ ' + l[7] + '</span>' : ''));
    return '<div class="mc-line' + (est ? " est" : "") + '"><span class="small muted" style="width:62px;flex:none">' + l[0].replace(/, \d{4}/, "") + '</span><span class="t"><b>' + esc(l[1]) + '</b><span>' + esc(l[2]) + (l[4] ? " · " + l[4] : "") + '</span></span>' +
      '<span>' + chip + '</span><span class="a">' + (est ? "~" : "") + U.cur(l[3]) + '</span></div>';
  }
  function termBlock(t, kind, open) {
    return '<details class="card g3d" style="--tc:' + (kind === "med" ? "#C0405E" : "#6E9A78") + '"' + (open ? " open" : "") + '>' + termHead(t, kind) + t.lines.map(function (l) { return line(l, kind); }).join("") +
      (kind === "edu" ? '<div class="small muted" style="margin-top:6px">A bill is a receipt or invoice in Ellis\'s folder; \"No bill\" lines can be filed from 📂 Filing.</div>' : needs(t) ? '<div class="small muted" style="margin-top:6px">Withdraw the amount from the HSA into Joint Checking; the line closes when the money arrives.</div>' : "") + '</details>';
  }
  function mtabs(on) { return ""; }
  P.medcol = { html: function () {
    var open = EDU.filter(function (t) { return needs(t); }).length;
    var tot = EDU.reduce(function (s, t) { return s + sumL(t); }, 0);
    return CSS + head("Education", "Ellis · 11th grade · Ridgeview High · " + U.cur(tot) + " tracked", '<span class="row" style="gap:6px"><button class="btn" id="expall">Expand all</button></span>') +
      '<div class="card g3d" style="--tc:#6E9A78"><div class="row between"><span><b>High-school costs</b><div class="small muted">Fees, exams and test prep, grouped by school year</div></span><span class="hh-pill hh-warn">⚠ ' + open + ' term needs attention</span></div>' +
      '<div class="small muted" style="margin-top:6px">Ellis\'s 529 (' + U.cur0(acct("a11").bal) + ') is kept for college; nothing is withdrawn for high school.</div></div>' +
      EDU.map(function (t, i) { return termBlock(t, "edu", i === 0); }).join("");
  }, init: function (box) { expandBtn(box); } };
  function expandBtn(box) { var b = box.querySelector("#expall"); if (b) b.addEventListener("click", function () { var d = box.querySelectorAll("details.card"), all = [].every.call(d, function (x) { return x.open; }); [].forEach.call(d, function (x) { x.open = !all; }); b.textContent = all ? "Expand all" : "Collapse all"; }); }
  var H = acct("a10");
  P["medcol/medical"] = { html: function () {
    var owed = r2(MED[0].lines.filter(function (l) { return l[5]; }).reduce(function (s, l) { return s + l[3]; }, 0));
    return CSS + head("Medical", "Family medical bills · paid from the HSA ••" + H.end + " " + U.cur(H.bal), '<button class="btn" id="expall">Expand all</button>') +
      '<div class="card g3d" style="--tc:#C0405E"><div class="row between"><span><b>Ready to withdraw</b><div class="small muted">Bills paid by card that the HSA has not paid back</div></span><b>' + U.cur(owed) + '</b></div></div>' +
      MED.map(function (t, i) { return termBlock(t, "med", i === 0); }).join("");
  }, init: function (box) { expandBtn(box); } };
  P["medcol/recon"] = { html: function () {
    function yr(t) { var s = r2(t.lines.reduce(function (a, l) { return a + l[3]; }, 0)), back = r2(t.lines.filter(function (l) { return !l[5]; }).reduce(function (a, l) { return a + l[3]; }, 0)); return [s, back, r2(s - back)]; }
    var y26 = yr(MED[0]), y25 = yr(MED[1]);
    function trw(y, v) { return '<tr><td class="l">' + y + '</td><td>' + n2(v[0]) + '</td><td>' + n2(v[1]) + '</td><td class="' + (v[2] ? "hh-warn" : "hh-ok") + '"><b>' + n2(v[2]) + '</b></td></tr>'; }
    var w = [];
    MED.forEach(function (t) { t.lines.forEach(function (l) { if (!l[5]) w.push(l); }); });
    return CSS + head("Recon", "What was paid from the HSA against what was withdrawn, by calendar year") +
      '<div class="card g3d" style="--tc:#C0405E"><b>HSA ••' + H.end + ' · by calendar year</b><div class="hh-box" style="max-height:none;min-height:0;margin-top:8px"><table class="hh-tbl"><thead><tr><th class="l">Year</th><th>Expenses paid</th><th>Withdrawn</th><th>Still withdrawable</th></tr></thead><tbody>' +
      trw(2026, y26) + trw(2025, y25) + '<tr class="tot"><td class="l">Total</td><td>' + n2(y26[0] + y25[0]) + '</td><td>' + n2(y26[1] + y25[1]) + '</td><td><b>' + n2(y26[2] + y25[2]) + '</b></td></tr></tbody></table></div>' +
      '<div class="small muted" style="margin-top:8px">Each withdrawal pays back one charge exactly; the only open line is the Sep 24 dental crown (' + U.cur(y26[2]) + '). The HSA holds ' + U.cur(H.bal) + ', put in ' + U.cur(H.inv) + '.</div></div>' +
      '<details class="card"><summary class="row between"><b>Withdrawals matched to charges</b><span class="small muted">' + w.length + '</span></summary>' +
      w.map(function (l) { return '<div class="row between small" style="margin-top:6px"><span>' + esc(l[1]) + ' · ' + esc(l[2]) + '<div class="muted">' + l[7] + '</div></span><b>' + U.cur(l[3]) + '</b></div>'; }).join("") + '</details>' +
      '<details class="card"><summary class="row between"><b>Education · 529 · Ellis ••' + acct("a11").end + '</b><span class="small muted">nothing withdrawn</span></summary><div class="small muted" style="margin-top:6px">Balance ' + U.cur(acct("a11").bal) + ' · put in ' + U.cur(acct("a11").inv) + '. High-school costs are paid from your cards and are not paid back from the 529.</div></details>';
  } };
})();
