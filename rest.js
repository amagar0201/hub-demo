/* Identity Vault, Tax & Audit (Reports, CPA questions, Filed vs App) and Settings. Same cards, tables and rows as the real app; nothing is saved. */
(function () {
  var D = window.DEMO, U = window.UI, P = window.PAGES;
  var cur0 = U.cur0, esc = U.esc;
  function head(title, sub, right) { return '<header class="top"><div><h1>' + title + '</h1><div class="sub one">' + sub + '</div></div>' + (right || "") + '</header>'; }
  function off(what) { return 'onclick="UI.toast(\'Demo · ' + what + ' is turned off\');return false"'; }
  var TH = "background:#1F3A5F;color:#fff;font-weight:700;font-size:13px;padding:7px 10px;text-align:left;white-space:nowrap";
  var TD = "padding:7px 10px;border-top:1px solid var(--line);font-size:14px";

  // ================= Identity Vault · Renewals =================
  var SC = { soon: "#C9A227", ok: "#6B8F71" };
  P.vault = { html: function () {
    var rows = D.vaultDocs.slice().sort(function (a, b) { return a[3] - b[3]; });
    var n = rows.filter(function (d) { return d[4] === "soon"; }).length;
    var h = head("Identity Vault", "Renewals for the household · names and dates only, never ID numbers");
    h += '<div class="card g3d" style="--tc:#9C5670"><div class="row between"><span><b>Renewals</b><div class="small muted">' + n + ' to start now · ' + (rows.length - n) + ' tracked</div></span>' +
      '<a class="fchip" href="#/vault/documents">Documents ›</a></div>' +
      '<div style="overflow-x:auto;margin-top:8px"><table style="width:100%;border-collapse:collapse;min-width:440px"><thead><tr><th style="' + TH + '">Document</th><th style="' + TH + '">Whose</th><th style="' + TH + '">Expires</th><th style="' + TH + ';text-align:right">Days</th><th style="' + TH + '"></th></tr></thead><tbody>' +
      rows.map(function (d) {
        return '<tr><td style="' + TD + '"><span class="dot" style="background:' + SC[d[4]] + '"></span> ' + esc(d[0]) + (d[5] ? '<div class="small muted">' + esc(d[5]) + '</div>' : "") + '</td><td style="' + TD + '">' + d[1] + '</td><td style="' + TD + ';white-space:nowrap">' + d[2] + '</td><td style="' + TD + ';text-align:right">' + d[3] + '</td>' +
          '<td style="' + TD + ';text-align:right;white-space:nowrap">' + (d[4] === "soon" ? '<button class="btn" ' + off("starting a renewal") + '>Start renewal</button>' : '<span class="small muted">Tracked</span>') + '</td></tr>'; }).join("") + '</tbody></table></div>' +
      '<div class="small muted" style="margin-top:8px">Each one also shows up in Daily Tasks as a "Start renewal" item when its lead time begins. A renewed document replaces the old date.</div></div>';
    h += '<details class="card"><summary class="row between"><b>Add a document to track</b><span class="small muted">names &amp; dates only</span></summary><form style="display:grid;gap:6px;margin-top:8px" ' + off("adding") + '>' +
      '<div class="row" style="gap:6px"><select><option>Passport</option><option>Driver\'s license</option><option>Permit</option></select><select><option>Casey</option><option>Morgan</option><option>Ellis</option></select></div>' +
      '<div class="row" style="gap:6px"><input type="date"><input placeholder="Start renewal (months before)" inputmode="decimal"></div><button class="btn" ' + off("adding") + '>Add</button></form></details>';
    return h;
  } };

  // ================= Identity Vault · Documents =================
  var FILES = {
    "Casey": ["Birth certificate.pdf", "Passport · photo page.pdf", "Driver's license · front.jpg", "Driver's license · back.jpg", "Degree certificate.pdf", "Transcript.pdf", "Vehicle title.pdf", "Marriage certificate.pdf", "Voter card.pdf"],
    "Morgan": ["Birth certificate.pdf", "Passport · photo page.pdf", "Driver's license · front.jpg", "Driver's license · back.jpg", "Degree certificate.pdf", "Nursing license.pdf", "Marriage certificate.pdf", "Immunization record.pdf"],
    "Ellis": ["Birth certificate.pdf", "Passport · photo page.pdf", "Learner's permit.jpg", "School ID.jpg", "Immunization record.pdf", "Report card · junior year.pdf"],
    "In this folder": ["README · where things live.txt", "Renewal checklist.pdf"],
    "Home insurance": ["Policy declarations 2026.pdf", "Roof inspection.pdf", "Willow · endorsement.pdf", "Juniper · landlord policy.pdf", "Claims · none.txt"],
    "Vehicle": ["Insurance card.pdf", "Registration 2026.pdf", "Title.pdf", "Service records.pdf"],
    "Medical cards": ["Family health plan card.pdf", "HSA card.jpg", "Vaccination summary.pdf"]
  };
  P["vault/documents"] = { html: function () {
    var h = head("Identity Vault", "Folders you chose · view and download only, nothing is moved or copied");
    D.vaultFolders.forEach(function (f, i) {
      var total = f[1].reduce(function (a, s) { return a + s[1]; }, 0);
      h += '<div class="card g3d" data-lvkey="vf' + i + '" style="--tc:#9C5670"><div class="row between lvhead" role="button" style="cursor:pointer"><span><b>' + esc(f[0]) + '</b><div class="small muted">' + f[1].length + ' folders · ' + total + ' files</div></span><span class="lvdots small muted">○○</span></div><div class="lvbody">' +
        f[1].map(function (s) {
          var names = (FILES[s[0]] || []).slice(0, s[1]);
          return '<details class="vsub" style="margin-top:6px"><summary class="row between small" style="cursor:pointer"><b>' + esc(s[0]) + '</b><span class="muted">' + s[1] + ' files</span></summary>' +
            names.map(function (n) { return '<a class="frow f1" href="#" onclick="UI.toast(\'Demo · files don\\u2019t open\');return false" style="padding:6px 4px 6px 10px"><span class="fmain"><span class="fdesc">' + esc(n) + '</span></span><span class="fchev">›</span></a>'; }).join("") + '</details>'; }).join("") + '</div></div>';
    });
    return h + '<p class="small muted">Demo · files don\'t open. In the real app they stream from the family\'s own cloud folder and are never copied.</p>';
  } };

  // ================= Tax & Audit data (invented; ties to the household in data.js) =================
  var YEARS = D.audit.years;                       // 2025 .. 2021
  var SCALE = { 2025: 1, 2024: 0.96, 2023: 0.92, 2022: 0.88, 2021: 0.84 };
  function r10(n) { return Math.round(n / 10) * 10; }
  // Juniper (bought Apr 2022, tenants from Jun 2022): rent, repairs, insurance, interest, taxes, water & sewer, depreciation, other
  var JUN = { 2025: [36780, 1180, 1410, 22640, 4980, 1416, 7400, 364], 2024: [36020, 1620, 1340, 23010, 4900, 1416, 7400, 210],
              2023: [34700, 960, 1290, 23360, 4780, 1416, 7400, 180], 2022: [19920, 2150, 1240, 17900, 3560, 1062, 5550, 420] };
  var JL = [["3", "Rents received"], ["7", "Cleaning & maintenance"], ["9", "Insurance"], ["12", "Mortgage interest"], ["16", "Taxes"], ["17", "Utilities (water & sewer)"], ["18", "Depreciation"], ["19", "Other (supplies, fees)"]];
  function jnet(y) { var j = JUN[y]; if (!j) return null; return j[0] - j.slice(1).reduce(function (a, b) { return a + b; }, 0); }
  var WILLOW_INT = { 2025: 9180, 2024: 9350, 2023: 9510, 2022: 9660, 2021: 9800 };
  var REFUND = { 2025: 1342, 2024: 1180, 2023: 860, 2022: 1510, 2021: 2030 };
  function fig(y) {
    var s = SCALE[y], f = {};
    f.wages = r10(171340 * s); f.wh = r10(19880 * s); f.div = r10(1384 * s); f.int = r10(598 * s); f.charity = r10(1900 * s);
    f.mort = WILLOW_INT[y]; f.salt = 10000; f.rental = jnet(y); f.refund = REFUND[y];
    f.divApp = y === 2023 ? f.div - 150 : f.div;
    f.intApp = y === 2025 ? f.int + 14 : f.int;
    f.charityApp = y === 2025 ? 1425 : f.charity;
    return f;
  }
  // filed vs app lines for a year: [state, label, form, line, filed, app, note]
  function filedRows(y) {
    var f = fig(y), r = [];
    r.push(["ok", "Wages", "1040", "1a", f.wages, f.wages, ""]);
    r.push([f.intApp !== f.int ? "small" : "ok", "Taxable interest", "1040", "2b", f.int, f.intApp, f.intApp !== f.int ? "The app sees $" + (f.intApp - f.int) + " more: a savings account's last statement of the year" : ""]);
    r.push([f.divApp !== f.div ? "check" : "ok", "Ordinary dividends", "1040", "3b", f.div, f.divApp, f.divApp !== f.div ? "The app's feed shows $" + (f.div - f.divApp) + " less than the return. A corrected 1099-DIV may have arrived after the return was filed." : ""]);
    if (f.rental != null) r.push(["ok", "Rental real estate", "Sch 1", "5", f.rental, f.rental, y === 2022 ? "Part year: bought Apr 2022, first tenants Jun 2022" : ""]);
    r.push([f.charityApp !== f.charity ? "check" : "ok", "Charitable gifts", "Sch A", "12", f.charity, f.charityApp, f.charityApp !== f.charity ? "The app sees $" + f.charityApp.toLocaleString("en-US") + " in gifts; $" + (f.charity - f.charityApp) + " more on the return (cash gifts, or a gift from an account the app doesn't have?)" : ""]);
    r.push(["ok", "Mortgage interest (Willow)", "Sch A", "8a", f.mort, f.mort, ""]);
    r.push(["ok", "Federal tax withheld", "1040", "25a", f.wh, f.wh, ""]);
    r.push(["explained", "Refund", "1040", "35a", f.refund, f.refund, "Arrived in March into Larkspur ••2093"]);
    return r;
  }
  function nCheck(y) { return filedRows(y).filter(function (r) { return r[0] === "check"; }).length; }

  // an invented list of bank / log lines that adds up to a figure
  function split(total, weights) { var s = weights.reduce(function (a, b) { return a + b; }, 0), out = [], run = 0;
    weights.forEach(function (w, i) { var v = i === weights.length - 1 ? Math.round((total - run) * 100) / 100 : Math.round(total * w / s * 100) / 100; run += v; out.push(v); }); return out; }
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  // kind: "m" monthly · "q" quarterly · "y" one year-end line · [[date, text, weight, src?]] named lines
  function evidence(total, kind, desc, src) {
    var lines = [];
    if (kind === "m") split(total, [1.02, 0.98, 1, 1.01, 0.99, 1, 1.03, 0.97, 1, 1.02, 0.98, 1]).forEach(function (v, i) { lines.push([MON[i] + " 28", desc, v, src || "b"]); });
    else if (kind === "q") split(total, [1, 1, 1, 1]).forEach(function (v, i) { lines.push([["Mar 31", "Jun 30", "Sep 30", "Dec 31"][i], desc, v, src || "b"]); });
    else if (kind === "y") lines.push(["Dec 31", desc, total, src || "y"]);
    else split(total, kind.map(function (k) { return k[2]; })).forEach(function (v, i) { lines.push([kind[i][0], kind[i][1], v, kind[i][3] || "b"]); });
    return lines;
  }
  function txlist(lines) {
    return '<div class="txlist">' + lines.map(function (l) { return '<div class="tx"><span class="d">' + l[0] + '</span><span class="w">' + esc(l[1]) + '</span>' + (l[3] === "l" ? '<span class="src">log</span>' : l[3] === "y" ? '<span class="src">year-end</span>' : "") + '<b>' + U.cur(l[2]) + '</b></div>'; }).join("") + '</div>';
  }
  function ev(b, l) { return '<span class="evbar"><i class="b" style="width:' + b + '%"></i><i class="l" style="width:' + l + '%"></i><i class="y" style="width:' + (100 - b - l) + '%"></i></span><span class="evtxt">bank ' + b + '% · log ' + l + '%</span>'; }
  function figure(ln, label, amount, lines, b, l, extra) {
    return '<details class="grow fig"><summary class="row between"><span>' + (ln ? '<span class="ln">' + ln + '</span> ' : "") + esc(label) + '<div class="small">' + ev(b == null ? 100 : b, l || 0) + '</div></span><b class="gamt">' + cur0(amount) + (extra || "") + '</b></summary>' + txlist(lines) + '</details>';
  }

  var AY = { y: 2025 };
  function yearchips() {
    return '<div class="ychips">' + YEARS.map(function (y) { var c = nCheck(y);
      return '<a class="chip' + (y === AY.y ? " on" : "") + '" data-y="' + y + '" href="#">' + y + (c ? ' <span class="warnn">⚠' + c + '</span>' : ' <span class="okn">✓</span>') + '</a>'; }).join("") + '</div>';
  }
  function yinit(root, again) { root.addEventListener("click", function (e) { var c = e.target.closest(".ychips .chip"); if (!c) return; e.preventDefault(); AY.y = +c.dataset.y; again(); }); }
  function depTo(y) { var t = 0; for (var k = 2022; k <= y; k++) if (JUN[k]) t += JUN[k][6]; return t; }

  // ================= Reports =================
  P.reports = { html: function () {
    var y = AY.y, f = fig(y), n = nCheck(y), jun = JUN[y], s = SCALE[y];
    var h = head("Reports · " + y, "From the household's own data, read-only · every figure opens to its transactions") + yearchips() +
      '<div class="dlbar"><a class="chip" href="#" ' + off("downloading") + '>⬇ Excel pack ' + y + '</a><a class="chip" href="#" ' + off("printing") + '>🖨 Print / PDF</a></div>';
    // Year summary
    var sumRows = [["Wages (W-2 box 1)", f.wages, f.wages, evidence(f.wages, "m", "Payroll · Ferncliff Studio + Marlowe Health")],
      ["Federal tax withheld", f.wh, f.wh, evidence(f.wh, "q", "Withholding on the pay stubs", "y")],
      ["Interest · US accounts", f.intApp, f.int, evidence(f.intApp, "q", "Interest · Larkspur Savings, Tidewater Checking")],
      ["Dividends · US accounts", f.divApp, f.div, evidence(f.divApp, "q", "Dividends · Orchard Brokerage")]];
    if (jun) sumRows.push(["Juniper rental, tax view (incl. depreciation)", f.rental, f.rental, evidence(Math.abs(f.rental), "q", "Rents less costs and depreciation")]);
    h += '<details class="card g3d" style="--tc:#6F66B2"><summary class="row between"><span><b>Σ Year summary</b><div class="small muted">' + (n ? n + " ⚠" : "all ✓") + ' vs the filed return</div></span><b>' + cur0(f.wages) + '</b></summary>' +
      '<div class="row between small muted fhead"><span>Line</span><span>Your data · the filed return</span></div>' +
      sumRows.map(function (r) { return '<details class="grow fig"><summary class="row between"><span>' + r[0] + '</span><b class="gamt">' + cur0(r[1]) + ' <span class="muted">· ' + cur0(r[2]) + '</span></b></summary>' + txlist(r[3]) + '</details>'; }).join("") +
      '<p class="small muted">Line by line with explanations: <a href="#/filed">Filed vs App ›</a></p></details>';
    // Rentals per home: Juniper (one property, two units)
    if (jun) {
      var rentA = Math.round(jun[0] * 1575 / 3070), rentB = jun[0] - rentA;
      var D18 = { "7": "Cleaning & maintenance · Juniper", "9": "Insurance · Juniper landlord policy", "12": "Interest paid · Bramble Home Loans", "16": "Taxes paid from escrow · Juniper", "17": "Water & sewer · Metro Water (owner paid)", "18": "Depreciation (27.5-year schedule)", "19": "Supplies and fees" };
      h += '<details class="card g3d" style="--tc:#C0714E"><summary class="row between"><span><b>⌂ Rentals per home</b><div class="small">' + ev(78, 22) + '</div></span><b>' + cur0(f.rental) + '</b></summary><div class="small muted" style="margin:4px 0">Schedule E lines · depreciation from the household\'s own rental rows</div>' +
        '<details class="grow" open><summary class="row between"><span><b>Juniper</b> <span class="small muted">duplex · units A and B</span><div class="small muted">rent ' + cur0(jun[0]) + ' · incl. depreciation</div></span><b class="gamt">' + cur0(f.rental) + '</b></summary>' +
        figure("3", "Rents received", jun[0], evidence(jun[0], [["Unit A", "Rent · T. Vance (Unit A)", rentA], ["Unit B", "Rent · L. Moreau (Unit B)", rentB]])) +
        JL.slice(1).map(function (l, i) {
          var kind = l[0] === "18" ? "y" : l[0] === "17" ? "m" : "q";
          return figure(l[0], l[1], jun[i + 1], evidence(jun[i + 1], kind, D18[l[0]]), l[0] === "18" ? 0 : 90, l[0] === "18" ? 0 : 10); }).join("") +
        '<div class="small muted" style="padding:6px 0">Principal, deposits and closing costs are kept apart from these lines (they are not income or cost on Schedule E).</div></details></details>';
    }
    // Home cost basis
    var wBasis = 338000 + 6200 + 1850 + 3400, jBasis = 489000 + 8400 + 2900, dep = depTo(y);
    h += '<details class="card g3d" style="--tc:#7B5BD3"><summary class="row between"><span><b>▣ Home cost basis</b><div class="small muted">cost basis, per home</div></span><b>' + cur0(wBasis + (jun ? jBasis - dep : 0)) + '</b></summary>' +
      '<details class="grow fig"><summary class="row between"><span>Willow <span class="small muted">own home · bought Sep 2018</span></span><b class="gamt">' + cur0(wBasis) + '</b></summary>' +
      txlist([["Sep 2018", "Purchase price", 338000, "b"], ["Sep 2018", "Closing costs", 6200, "b"], ["Jun 2021", "Water heater", 1850, "b"], ["Oct 2023", "Back fence", 3400, "b"]]) + '</details>' +
      (jun ? '<details class="grow fig"><summary class="row between"><span>Juniper <span class="small muted">rental · bought Apr 2022</span></span><b class="gamt">' + cur0(jBasis - dep) + '</b></summary>' +
        txlist([["Apr 2022", "Purchase price", 489000, "b"], ["Apr 2022", "Closing costs", 8400, "b"], ["Mar 2023", "Unit B flooring", 2900, "b"], ["Dec 31", "Depreciation to " + y, -dep, "y"]]) + '</details>' : "") + '</details>';
    // Itemized
    var item = f.mort + f.salt + f.charity;
    h += '<details class="card g3d" style="--tc:#4F6FBF"><summary class="row between"><span><b>✓ Itemized deductions</b><div class="small muted">Schedule A · your data vs the return</div></span><b>' + cur0(item) + '</b></summary>' +
      figure("8a", "Mortgage interest · Willow", f.mort, evidence(f.mort, "q", "Interest paid · Larkspur Credit Union")) +
      figure("5", "State and local taxes (capped)", f.salt, evidence(f.salt, [["Apr 15", "State income tax · balance due", 1620], ["Jun 30", "Property tax · Willow, 1st half", 1190], ["Dec 31", "Property tax · Willow, 2nd half", 1190], ["Dec 31", "State tax withheld · both paychecks", 5999.99, "y"]]), 65, 0) +
      figure("12", "Gifts to charity", f.charity, evidence(f.charityApp, [["Mar 12", "Food bank", 300], ["Jun 8", "Public radio", 240], ["Nov 20", "Animal shelter", 385], ["Dec 22", "Neighbourhood fund", 500]]).concat(f.charity !== f.charityApp ? [["Filed", "On the return, not found in the app", f.charity - f.charityApp, "y"]] : []), 80, 20) + '</details>';
    // HSA / 529
    var hIn = r10(2400 * s), hOut = r10(1980 * s), pIn = r10(3000 * s);
    h += '<details class="card g3d" style="--tc:#2E8B57"><summary class="row between"><span><b>✚ HSA and 529</b><div class="small muted">money in and out, per year</div></span><b>' + cur0(hIn + pIn) + '</b></summary>' +
      figure("", "HSA · money in (paycheck + employer)", hIn, evidence(hIn, "q", "HSA contribution · Orchard HSA ••0584")) +
      figure("", "HSA · paid out for medical bills", hOut, evidence(hOut, [["Feb 6", "Dental · Marlowe Family Dental", 30], ["May 14", "Pharmacy", 20], ["Aug 2", "Vision · Clearview Optical", 25], ["Nov 9", "Urgent care", 25]])) +
      figure("", "529 · Ellis · money in", pIn, evidence(pIn, "q", "529 contribution · Orchard 529 ••0591")) +
      '<div class="small muted" style="padding:6px 0">No 529 money was taken out this year.</div></details>';
    return h + '<p class="small muted" style="margin-top:10px">Evidence bar: <span class="evkey b"></span> bank feed / statements · <span class="evkey l"></span> typed log · <span class="evkey y"></span> year-end rows (weakest proof).</p>';
  }, init: yinit };

  // ================= Filed vs App =================
  var ST = { ok: "✓", small: "≈", explained: "≈", check: "⚠" };
  P.filed = { html: function () {
    var y = AY.y, rows = filedRows(y), n = { ok: 0, small: 0, explained: 0, check: 0 }; rows.forEach(function (r) { n[r[0]]++; });
    return head("Filed vs App · " + y, "The filed return, line by line, against the household's data") + yearchips() +
      '<div class="card g3d" style="--tc:#6F66B2"><div class="row between"><span><b>' + n.check + ' to explain</b><div class="small muted">✓ ' + n.ok + ' match · ≈ ' + (n.small + n.explained) + ' small or explained</div></span><span class="small muted" style="text-align:right">Form 1040 · ' + y + '<br>read Sep 28</span></div></div>' +
      '<div class="card"><div class="row between small muted fhead"><span>Line</span><span>Filed · App · Diff</span></div>' + rows.map(function (r) { var d = r[4] - r[5];
        return '<details class="grow frow st-' + r[0] + '"><summary class="row between"><span><span class="sti">' + ST[r[0]] + '</span> ' + r[1] + ' <span class="small muted">' + r[2] + ' ' + r[3] + '</span></span>' +
          '<b class="gamt">' + cur0(r[4]) + ' <span class="muted">· ' + cur0(r[5]) + '</span>' + (d && (r[0] === "check" || r[0] === "small") ? ' <span class="' + (r[0] === "check" ? "due" : "muted") + '">' + (d > 0 ? "+" : "−") + cur0(Math.abs(d)) + '</span>' : "") + '</b></summary>' +
          (r[6] ? '<div class="small" style="margin:4px 0">' + esc(r[6]) + '</div>' : "") +
          (r[0] === "check" || r[0] === "small" ? '<form class="anote"><textarea rows="2" placeholder="Your explanation (kept with the ' + y + ' return; clears the ⚠)"></textarea><div class="row between small"><span class="muted"></span><button type="button" ' + off("saving") + '>Save note</button></div></form>' : "") + '</details>'; }).join("") + '</div>' +
      '<p class="small muted">Only line amounts are kept from the return (never ID numbers, bank numbers, names or the preparer\'s details). ✓ within $1 · ≈ small or explained · ⚠ needs you.</p>';
  }, init: yinit };

  // ================= CPA questions =================
  P["reports/cpa"] = { html: function () {
    var qs = YEARS.map(function (y) { return [y, filedRows(y).filter(function (r) { return r[0] === "check"; })]; }).filter(function (q) { return q[1].length; });
    return head("Questions for your CPA", "Every year's open points from Filed vs App, with what the app found and your notes") +
      '<div class="dlbar"><a class="chip" href="#" ' + off("downloading") + '>⬇ Excel</a><a class="chip" href="#" ' + off("printing") + '>🖨 Print / PDF</a></div>' +
      qs.map(function (q) {
        return '<details class="card g3d cpa" style="--tc:#6F66B2" open><summary class="row between"><span><b>' + q[0] + ' return</b><div class="small muted">' + q[1].length + ' question' + (q[1].length === 1 ? "" : "s") + '</div></span><a class="small" href="#/filed" onclick="event.stopPropagation()">Filed vs App ›</a></summary>' +
          q[1].map(function (r) { return '<div class="grow"><b>' + r[1] + '</b> <span class="small muted">' + r[2] + ' ' + r[3] + '</span><div class="small">Return ' + cur0(r[4]) + ' · your records ' + cur0(r[5]) + ' · difference ' + cur0(r[4] - r[5]) + '</div><div class="small muted">' + esc(r[6]) + '</div></div>'; }).join("") + '</details>'; }).join("") +
      '<details class="card"><summary class="row between"><b>What to bring</b><span class="small muted">checklist</span></summary><div class="small" style="margin-top:6px;display:grid;gap:4px">' +
      ["Receipts or acknowledgements for the gifts above", "The brokerage's final 1099 for each year with a dividend question", "Both W-2s and the year-end pay stubs", "Juniper's yearly rent roll and the insurance and tax bills"].map(function (x) { return '<div>☐ ' + x + '</div>'; }).join("") + '</div></details>' +
      '<p class="small muted">Built from the filed returns and the household\'s own records (read-only). Not tax advice: it\'s the list of what to ask and what to bring.</p>';
  } };

  // ================= Settings =================
  function row(icon, title, sub, chip, href) {
    return '<a class="card row between" href="' + (href || "#/settings") + '" style="display:flex;text-decoration:none;color:inherit"><span><b style="font-size:17px">' + (icon ? icon + ' ' : "") + title + '</b><span class="small muted" style="display:block">' + sub + '</span></span>' + (chip || "") + '<span class="bchev">›</span></a>';
  }
  var PARAMS = [["Daily run", "Run time", "08:30", "08:30"], ["Daily run", "Retry a failed job after", "30 min", "30 min"], ["Tasks", "Done-for-you needs this share of your own choices", "80 %", "80 %"],
    ["Tasks", "Quiet hours for pushes", "21:30–07:30", "21:30–07:30"], ["Money", "Large one-off (callout) from", "$1,500", "$1,500"], ["Money", "Cash floor warning", "$6,000", "$5,000"],
    ["Rentals", "Vacancy · maintenance · growth", "5 % · 5 % · 3 %", "5 % · 5 % · 3 %"], ["Rentals", "Property management", "none", "none"], ["Cars", "Oil change every", "7,500 mi", "7,500 mi"], ["Home values", "Estimates refreshed every", "30 days", "30 days"]];
  function sysHealth() {
    var jobs = D.dailyRun;
    return '<details class="card g3d" style="--tc:#64748B" open><summary class="row between"><b style="font-size:17px">System</b><span class="hchip ok">🟢 All OK</span></summary>' +
      [["Daily run", "Oct 1, 08:30 · " + jobs.length + " of " + jobs.length + " jobs ok"], ["Database", "Healthy · 38 MB"], ["Backup", "Oct 1, 08:41 · 7 daily, 8 weekly, 12 monthly"], ["Live copy", "Within seconds of every change"],
       ["Restore test", "Passed Sep 1"], ["Bank feeds", Object.keys(D.banks).length + " of " + Object.keys(D.banks).length + " updated today"], ["Disk", "412 GB free of 994 GB"]].map(function (r) {
        return '<div class="row between small" style="margin-top:6px;gap:8px"><span>' + r[0] + '</span><span class="muted" style="text-align:right">' + r[1] + ' <b style="color:#2E8B57">✓</b></span></div>'; }).join("") + '</details>';
  }
  P.settings = { html: function () {
    var h = head("Settings", "Every setup lives here: connections, accounts and the daily run") + sysHealth();
    h += '<div class="card"><div class="row between"><b style="font-size:17px">Daily run · 08:30</b><span class="hchip ok">🟢 All OK</span></div><div class="small muted">Last run Oct 1 08:30 (scheduled)</div>' +
      D.dailyRun.map(function (j) { return '<div class="small row between" style="margin-top:4px"><span>' + j[0] + '</span><span class="muted">✓</span></div>'; }).join("") +
      '<div style="margin-top:10px"><button class="btn" ' + off("running") + '>↻ Run now</button> <span class="small muted">Everything is computed once a day, in this one run.</span></div></div>';
    h += row("", "Sign-in &amp; access", "Passkeys, recovery codes, who can open what", "", "#/settings/access") + row("🔐", "Secrets", "API keys, bank tokens, app passwords · Face ID to open", "") +
      row("🔔", "Notifications", "Daily Tasks on your lock screen · turn on per device", "", "#/tasks/notify") +
      '<div class="card"><div class="row between"><b style="font-size:17px">Appearance</b><span class="small muted">this device</span></div><div class="fchips" id="thchips" style="margin-top:8px"><a class="fchip on" data-th="auto" href="#">Auto</a><a class="fchip" data-th="light" href="#">☀ Light</a><a class="fchip" data-th="dark" href="#">🌙 Dark</a></div></div>';
    h += '<details class="card g3d" style="--tc:#C0714E"><summary class="row between"><span><b style="font-size:17px">🏠 Home values</b><div class="small muted">Yours wins until you clear it · used for equity</div></span><span class="small muted">' + D.homes.length + ' homes</span></summary>' +
      '<div style="overflow-x:auto;margin-top:8px"><table style="width:100%;border-collapse:collapse;min-width:420px"><thead><tr><th style="' + TH + '">Home</th><th style="' + TH + ';text-align:right">Yours</th><th style="' + TH + ';text-align:right">Estimate A</th><th style="' + TH + ';text-align:right">Estimate B</th><th style="' + TH + '"></th></tr></thead><tbody>' +
      D.homes.map(function (hm) { var v = D.values[hm.key];
        return '<tr><td style="' + TD + '"><b>' + hm.name + '</b><div class="small muted">' + hm.type + (hm.kind === "rental" ? " · rental" : "") + '</div></td><td style="' + TD + ';text-align:right"><b>' + cur0(v[0]) + '</b></td><td style="' + TD + ';text-align:right">' + cur0(v[1]) + '</td><td style="' + TD + ';text-align:right">' + cur0(v[2]) + '</td>' +
          '<td style="' + TD + ';text-align:right;white-space:nowrap"><button class="btn" ' + off("setting a value") + '>Set</button> <button class="btn" ' + off("clearing") + '>Clear</button> <button class="btn" ' + off("refreshing") + '>↻</button></td></tr>'; }).join("") +
      '</tbody></table></div><div class="small muted" style="margin-top:6px">Estimates update once a month, in the daily run. Equity = value − mortgage − any line of credit on the home.</div></details>';
    h += '<details class="card g3d" style="--tc:#64748B"><summary class="row between"><span><b style="font-size:17px">⚙ All parameters</b><div class="small muted">Every setting in one place · edits are audited with Undo</div></span><span class="small muted">' + PARAMS.length + '</span></summary>' +
      '<div style="overflow-x:auto;margin-top:8px"><table style="width:100%;border-collapse:collapse;min-width:440px"><thead><tr><th style="' + TH + '">Group</th><th style="' + TH + '">Setting</th><th style="' + TH + ';text-align:right">Value</th><th style="' + TH + ';text-align:right">Default</th></tr></thead><tbody>' +
      PARAMS.map(function (p) { return '<tr onclick="UI.toast(\'Demo · editing is turned off\')" style="cursor:pointer"><td style="' + TD + '" class="muted">' + p[0] + '</td><td style="' + TD + '">' + p[1] + '</td><td style="' + TD + ';text-align:right"><b>' + p[2] + '</b></td><td style="' + TD + ';text-align:right" class="muted">' + p[3] + '</td></tr>'; }).join("") + '</tbody></table></div></details>';
    h += '<div class="small muted" style="margin:14px 4px 4px;font-weight:700;letter-spacing:.04em">CONNECTIONS</div>' +
      row("🏦", "Bank connections", Object.keys(D.banks).length + " connected", '<span class="hchip ok">🟢 Healthy</span>', "#/settings/banks") +
      row("🚗", "Car connection", "Connected · 1 of 1 calls today", '<span class="hchip ok">🟢 Connected</span>');
    return h;
  }, init: function (root) {
    var chips = root.querySelector("#thchips"); if (!chips) return;
    try { var v = localStorage.getItem("demo.theme") || "auto"; chips.querySelectorAll(".fchip").forEach(function (c) { c.classList.toggle("on", c.dataset.th === v); }); } catch (e) {}
    chips.addEventListener("click", function (e) { var c = e.target.closest(".fchip"); if (!c) return; e.preventDefault();
      try { localStorage.setItem("demo.theme", c.dataset.th); } catch (x) {} if (window.hubTheme) window.hubTheme(c.dataset.th);
      chips.querySelectorAll(".fchip").forEach(function (x) { x.classList.toggle("on", x === c); }); });
  } };

  P["settings/banks"] = { html: function () {
    return head("Bank connections", "Connect or disconnect any bank · health checked in the daily run") + Object.keys(D.banks).map(function (k) {
      var b = D.banks[k], accts = D.accounts.filter(function (a) { return a.bank === k; });
      return '<details class="card bconn" style="--tc:' + b.color + '"><summary class="bsum"><span class="bdot"></span><span style="flex:1;min-width:0"><b>' + b.name + '</b><span class="small muted" style="display:block">' + accts.length + ' account' + (accts.length > 1 ? "s" : "") + ' · updated Oct 1 08:31</span></span><span class="hchip ok">🟢 OK</span><span class="bchev">›</span></summary>' +
        accts.map(function (a) { return '<div class="bacc"><span style="flex:1;min-width:0">' + esc(a.name) + ' <span class="muted">••' + a.end + '</span></span><b>' + U.cur(a.bal) + '</b></div>'; }).join("") +
        '<div class="row" style="gap:8px;margin-top:8px"><button class="btn" ' + off("reconnecting") + '>Reconnect</button><button class="btn" ' + off("disconnecting") + '>Disconnect</button></div></details>'; }).join("") +
      '<button class="btn primary" style="margin-top:8px" ' + off("connecting a bank") + '>＋ Connect a bank</button>';
  } };

  P["settings/access"] = { html: function () {
    return head("Sign-in &amp; access", "Passkeys (Face ID), recovery codes, who can open what") +
      '<div class="card"><b>Devices signed in</b>' + [["iPhone", "now"], ["Mac · Safari", "Sep 29"]].map(function (d) { return '<div class="row between small" style="margin-top:8px"><span>' + d[0] + ' <span class="muted">· last used ' + d[1] + '</span></span><button class="btn" ' + off("signing out") + '>Sign out</button></div>'; }).join("") + '</div>' +
      '<div class="card"><b>Recovery codes</b><div class="small muted">8 of 10 left · keep them printed and offline</div><div style="margin-top:8px"><button class="btn" ' + off("making new codes") + '>Make new codes</button></div></div>' +
      '<div class="card"><b>People</b><div class="small muted" style="margin-top:4px">Casey · owner, every area<br>Morgan · Money, Assets &amp; Liabilities, Household<br>Ellis · Today and Education only</div></div>' +
      '<div class="card"><b>The one lock</b><div class="small muted" style="margin-top:4px">Face ID opens the whole app · 15 min idle · when the app is in the background over a minute · 8 h at most · 🔒 on every page</div></div>';
  } };
})();
