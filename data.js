/* The made-up household behind every screen. Nothing here comes from a real person: names, banks, homes, cars and
   amounts are invented. Screens compute their figures from these objects, so the same number reads the same everywhere.
   "Today" is Thursday Oct 1, 2026. */
window.DEMO = (function () {
  function r2(n) { return Math.round(n * 100) / 100; }
  function sum(list, f) { return list.reduce(function (t, x) { return t + f(x); }, 0); }
  var today = new Date(2026, 9, 1);

  var people = [
    { key: "casey", name: "Casey", role: "self" },
    { key: "morgan", name: "Morgan", role: "partner" },
    { key: "ellis", name: "Ellis", role: "child", age: 16, grade: "11th grade" }
  ];

  var banks = {
    LCU: { name: "Larkspur Credit Union", short: "Larkspur", color: "#3B6EA5" },
    TWB: { name: "Tidewater Bank", short: "Tidewater", color: "#1E7F74" },
    QC: { name: "Quill Card", short: "Quill", color: "#7C4DAA" },
    ORI: { name: "Orchard Invest", short: "Orchard", color: "#3F8F4F" }
  };

  // type: checking | savings | card | stocks | retirement | hsa | 529 | rental.   bal = balance today (cards negative)
  var accounts = [
    { id: "a1", bank: "LCU", name: "Everyday Checking", end: "2093", type: "checking", bal: 8940.12, who: "casey" },
    { id: "a2", bank: "LCU", name: "Savings", end: "2094", type: "savings", bal: 42000.00, who: "casey" },
    { id: "a3", bank: "TWB", name: "Joint Checking", end: "6618", type: "checking", bal: 4385.70, who: "morgan" },
    { id: "a4", bank: "TWB", name: "Juniper LLC Checking", end: "6640", type: "rental", bal: 5120.33, home: "juniper" },
    { id: "a5", bank: "QC", name: "Everyday Card", end: "7751", type: "card", bal: -1264.08, who: "casey", due: "Oct 18" },
    { id: "a6", bank: "TWB", name: "Visa", end: "3307", type: "card", bal: -488.52, who: "morgan", due: "Oct 9" },
    { id: "a7", bank: "ORI", name: "Brokerage", end: "0582", type: "stocks", bal: 36900.00, who: "casey", inv: 31000 },
    { id: "a8", bank: "ORI", name: "401(k)", end: "0583", type: "retirement", bal: 118400.00, who: "casey", inv: 92000 },
    { id: "a9", bank: "ORI", name: "403(b)", end: "0590", type: "retirement", bal: 74250.00, who: "morgan", inv: 60100 },
    { id: "a10", bank: "ORI", name: "HSA", end: "0584", type: "hsa", bal: 5830.00, who: "casey", inv: 5100 },
    { id: "a11", bank: "ORI", name: "529 · Ellis", end: "0591", type: "529", bal: 26480.00, who: "ellis", inv: 23000 }
  ];

  var JUN = (function () { var b = 391200, r = 0.06125 / 12, by = {};
    for (var n = 0; n < 53; n++) { var yr = 2022 + Math.floor((n + 5) / 12), pr = 2377.05 - b * r; b -= pr; by[yr] = (by[yr] || 0) + pr; }
    return { bal: Math.round(b * 100) / 100, byYear: by }; })();
  var homes = [
    { key: "willow", name: "Willow", kind: "own", type: "Townhouse", color: "#C0714E", value: 452000, loan: 241600, rate: 3.875,
      borrowed: 304000, bought: "Sep 2018", price: 338000, down: 34000, lender: "Larkspur Credit Union",
      pi: 1429.52, escrow: 410, payment: 1839.52, payDay: 1, hoa: 240 },
    // Juniper's balance and yearly principal come from its own schedule, so every page ties (Rental CF, Net Worth, Mortgage)
    { key: "juniper", name: "Juniper", kind: "rental", type: "Duplex", color: "#8C5A44", value: 528000, loan: JUN.bal, rate: 6.125,
      borrowed: 391200, bought: "Apr 2022", price: 489000, down: 97800, closing: 8400, lender: "Bramble Home Loans",
      pi: 2377.05, escrow: 640, payment: 3017.05, payDay: 1, rent: 3070, water: 118, llcAcct: "a4",
      units: [{ key: "A", name: "Unit A", tenant: "T. Vance", since: "Aug 2024", rent: 1575 },
              { key: "B", name: "Unit B", tenant: "L. Moreau", since: "Jan 2026", rent: 1495 }],
      loc: { bank: "Tidewater", limit: 40000, owed: 14600, avail: 25400, rate: 7.75, prime: 7.25, margin: 0.5, plan: 600, planDay: 20 } }
  ];

  var cars = [
    { key: "cx5", name: "CX-5", make: "Mazda", year: 2021, color: "#B23A48", value: 19500, loan: 7950, borrowed: 24000, paid: 31800,
      apr: 2.49, payment: 414, payDay: 12, lender: "Larkspur Credit Union", miles: 48620, next: "Oil change", nextIn: "in 19 days" }
  ];

  // ---------- Willow's utilities (Oct 2025 -> Sep 2026) ----------
  var UM = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  var uGas = [34.20, 71.40, 118.30, 152.10, 139.60, 108.20, 77.50, 47.30, 29.40, 25.10, 31.20, 38.60];
  var uPow = [96.40, 101.20, 112.60, 118.30, 108.10, 98.40, 86.20, 92.70, 128.40, 172.50, 149.30, 131.10];
  var uWat = [68.10, 57.40, 55.20, 54.90, 54.80, 56.30, 63.20, 82.40, 98.10, 101.30, 92.20, 79.40];
  var uHoa = [235, 235, 235, 240, 240, 240, 240, 240, 240, 240, 240, 240];
  var utilities = { gas: uGas[11], electricity: uPow[11], water: uWat[11], hoa: 240, month: "Sep" };

  var tx = [], id = 1, seed = 20261001;
  function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
  function pick(list) { return list[Math.floor(rnd() * list.length)]; }

  var cats = {
    "Groceries": "#2A9D5C", "Dining": "#E07B24", "Fuel": "#5A6B85", "Shopping": "#8A4FB8", "Family": "#D1495B", "Education": "#C0405E",
    "Utilities": "#C98A12", "Mortgage": "#2F6FA3", "HOA": "#7A6FA8", "Subscriptions": "#1E9AA8", "Insurance": "#A0522D", "Phone & internet": "#4F7C8A",
    "Health": "#C0405E", "Salary": "#2E8B57", "Rent": "#2E8B57", "Interest": "#2E8B57", "Car loan": "#7B2FF7", "Line of credit": "#2F6FA3",
    "Savings & investing": "#3F8F4F", "Fees": "#8A938C", "Transfer": "#8A938C", "Travel": "#1F77B4"
  };

  function add(y, m, d, acct, desc, cat, amount, who, extra) {
    var t = { id: id++, date: new Date(y, m, d), acct: acct, desc: desc, cat: cat, amount: r2(amount), who: who || null };
    if (extra) for (var k in extra) t[k] = extra[k];
    tx.push(t); return t;
  }
  function pair(y, m, d, from, to, descFrom, descTo, amt, cat) {      // a transfer: both legs
    add(y, m, d, from, descFrom, cat || "Transfer", -amt); add(y, m, d, to, descTo, cat || "Transfer", amt);
  }
  function lastDay(y, m) { return new Date(y, m + 1, 0).getDate(); }

  var spendMenu = [   // [category, merchants, low, high, weight]
    ["Groceries", ["Fernhill Market", "Corner Co-op", "Big Basket Wholesale", "Greenleaf Grocer"], 38, 190, 5],
    ["Dining", ["Noodle Bar 9", "Sunny Side Cafe", "Pizza Foundry", "Maple & Rye Bakery", "Taco Garage"], 11, 78, 4],
    ["Fuel", ["Valley Fuel", "QuickStop Gas"], 34, 58, 2],
    ["Shopping", ["Online Market", "Home Goods Depot", "Book Nook", "Trail & Tackle"], 16, 210, 3],
    ["Family", ["Ridgeview Pharmacy", "Skate Park Pass", "Corner Cinema"], 14, 90, 2],
    ["Health", ["Family Pharmacy", "Eastside Vision"], 12, 96, 1]
  ];
  var menuBag = []; spendMenu.forEach(function (s) { for (var i = 0; i < s[4]; i++) menuBag.push(s); });

  // ---- generate Aug 1 -> Oct 1, 2026 ----
  var casey0 = new Date(2026, 7, 7);                  // Casey is paid every other Friday
  var cardPay = { a5: {}, a6: {} };
  for (var day = new Date(2026, 7, 1); day <= today; day.setDate(day.getDate() + 1)) {
    var Y = day.getFullYear(), M = day.getMonth(), dd = day.getDate(), mi = M === 7 ? 0 : M === 8 ? 1 : 2;   // 0 Aug, 1 Sep, 2 Oct
    if (dd === 1) {
      add(Y, M, dd, "a1", "Willow mortgage · Larkspur CU", "Mortgage", -1839.52, "Casey");
      add(Y, M, dd, "a4", "Juniper mortgage · Bramble Home Loans", "Mortgage", -3017.05);
      add(Y, M, dd, "a4", "Rent · Unit A · T. Vance", "Rent", 1575);
      add(Y, M, dd, "a4", "Rent · Unit B · L. Moreau", "Rent", 1495);
    }
    if (dd === 2) pair(Y, M, dd, "a1", "a2", "Transfer to Savings", "Transfer from Everyday Checking", 300);
    if (dd === 3) {
      pair(Y, M, dd, "a3", "a4", "Transfer to Juniper LLC", "Transfer from Joint Checking", 250, "Savings & investing");
      pair(Y, M, dd, "a1", "a7", "Auto-invest · Orchard Brokerage", "Auto-invest from Everyday Checking", 400, "Savings & investing");
      pair(Y, M, dd, "a1", "a11", "529 contribution · Ellis", "Contribution from Everyday Checking", 300, "Savings & investing");
      add(Y, M, dd, "a6", "Trailhead Gym", "Subscriptions", -45, "Morgan");
    }
    if (dd === 5) add(Y, M, dd, "a1", "Willow HOA", "HOA", -240);
    if (dd === 6) add(Y, M, dd, "a4", "Metro Water · Juniper water & sewer", "Utilities", -118);
    if (dd === 8) add(Y, M, dd, "a1", "Lakeside Power", "Utilities", -uPow[mi + 10]);
    if (dd === 9 && mi === 1) cardPay.a6.sep = add(Y, M, dd, "a3", "Visa payment · Tidewater", "Transfer", 0);
    if (dd === 9 && mi === 0) pair(Y, M, dd, "a3", "a6", "Visa payment · Tidewater", "Payment received", 402.15);
    if (dd === 10) add(Y, M, dd, "a1", "Valley Gas Co", "Utilities", -uGas[mi + 10]);
    if (dd === 12) add(Y, M, dd, "a1", "Mazda loan · Larkspur CU", "Car loan", -414);
    if (dd === 14) add(Y, M, dd, "a1", "Metro Water", "Utilities", -uWat[mi + 10]);
    if (dd === 15 || dd === lastDay(Y, M)) add(Y, M, dd, "a3", "Payroll · Marlowe Health", "Salary", 2240.15, "Morgan");
    if (dd === 18 && mi === 0) pair(Y, M, dd, "a1", "a5", "Everyday Card payment · Quill", "Payment received", 1160.22);
    if (dd === 18 && mi === 1) cardPay.a5.sep = add(Y, M, dd, "a1", "Everyday Card payment · Quill", "Transfer", 0);
    if (dd === 20) {
      add(Y, M, dd, "a3", "Juniper line of credit payment · Tidewater", "Line of credit", -600, "Morgan");
      add(Y, M, dd, "a5", "StreamBox", "Subscriptions", mi === 0 ? -11.99 : -12.99, "Casey", { fixed: 1 });
      add(Y, M, dd, "a1", "Pine Mutual Auto", "Insurance", -128);
    }
    if (dd === 22) { add(Y, M, dd, "a6", "Pulse Music", "Subscriptions", -10.99, "Morgan", { fixed: 1 });
      add(Y, M, dd, "a1", "Hummingbird Wireless", "Phone & internet", -112); }
    if (dd === 25) { add(Y, M, dd, "a5", "CloudVault", "Subscriptions", -2.99, "Casey", { fixed: 1 });
      add(Y, M, dd, "a2", "Interest", "Interest", mi === 0 ? 29.84 : 31.12); }
    if (day.getDay() === 5 && Math.round((day - casey0) / 864e5) % 14 === 0) add(Y, M, dd, "a1", "Payroll · Ferncliff Studio", "Salary", 3185.40, "Casey");
    var n = (day.getDay() === 0 || day.getDay() === 6) ? 3 : 2;
    for (var k = 0; k < n; k++) {
      var s = pick(menuBag), r = rnd(), amt = s[2] + rnd() * (s[3] - s[2]), acct, who;
      if (r < 0.40) { acct = "a5"; who = "Casey"; } else if (r < 0.52) { acct = "a6"; who = "Morgan"; }
      else if (r < 0.78) { acct = "a1"; who = "Casey"; } else { acct = "a3"; who = "Morgan"; }
      add(Y, M, dd, acct, pick(s[1]), s[0], -amt, who, { rand: 1 });
    }
  }
  // fixed one-offs: Ellis's school costs, a dental bill, a duplicate charge, a small fee
  add(2026, 7, 14, "a5", "Ridgeview High · activity fee", "Education", -85, "Casey", { fixed: 1 });
  add(2026, 7, 26, "a5", "Prep Academy · test prep", "Education", -240, "Casey", { fixed: 1 });
  add(2026, 8, 12, "a6", "Bright Smiles Dental", "Health", -184, "Morgan", { fixed: 1 });
  add(2026, 8, 17, "a5", "Maple & Rye Bakery", "Dining", -18.40, "Casey", { fixed: 1 });
  add(2026, 8, 17, "a5", "Maple & Rye Bakery", "Dining", -18.40, "Casey", { fixed: 1 });
  add(2026, 8, 24, "a5", "College Board · AP exam fee", "Education", -98, "Casey", { fixed: 1 });
  add(2026, 8, 28, "a3", "Paper statement fee", "Fees", -2, "Morgan", { fixed: 1 });

  add(2026, 8, 30, "a5", "Fernhill Market", "Groceries", -61.30, "Casey", { fixed: 1 });
  add(2026, 9, 1, "a5", "Noodle Bar 9", "Dining", -24.50, "Casey", { fixed: 1 });
  add(2026, 9, 1, "a6", "Eastside Vision", "Health", -38.00, "Morgan", { fixed: 1 });
  // scale September + Oct 1 spending on each card so the balance today is exactly what the card says
  [["a5", 1264.08], ["a6", 488.52]].forEach(function (c) {
    var list = tx.filter(function (t) { return t.acct === c[0] && t.amount < 0 && t.date >= new Date(2026, 8, 1); });
    var fixed = -sum(list.filter(function (t) { return t.fixed; }), function (t) { return t.amount; });
    var rl = list.filter(function (t) { return t.rand; }), rs = -sum(rl, function (t) { return t.amount; });
    var f = (c[1] - fixed) / rs;
    rl.forEach(function (t) { t.amount = r2(t.amount * f); });
    var left = r2(c[1] + sum(list, function (t) { return t.amount; })); if (rl.length) rl[0].amount = r2(rl[0].amount - left);
  });
  // card payments in September = what the card owed from August
  ["a5", "a6"].forEach(function (c) {
    var aug = -sum(tx.filter(function (t) { return t.acct === c && t.date < new Date(2026, 8, 1) && t.amount < 0; }), function (t) { return t.amount; });
    var pay = cardPay[c].sep; pay.amount = -r2(aug);
    tx.push({ id: id++, date: pay.date, acct: c, desc: "Payment received", cat: "Transfer", amount: r2(aug), who: null });
  });
  // today's card charges are still pending
  tx.forEach(function (t) { if (t.date >= new Date(2026, 8, 30) && (t.acct === "a5" || t.acct === "a6") && t.amount < 0) t.pending = true; });
  tx.sort(function (a, b) { return b.date - a.date || b.id - a.id; });
  accounts.forEach(function (a) {      // running balance per account, worked back from today's balance
    var run = a.bal; tx.forEach(function (t) { if (t.acct === a.id) { t.run = r2(run); run = r2(run - t.amount); } });
  });

  var subs = [
    { name: "StreamBox", acct: "a5", rhythm: "monthly", amount: 12.99, next: "Oct 20", ytd: r2(11.99 * 8 + 12.99), who: "Casey" },
    { name: "Pulse Music", acct: "a6", rhythm: "monthly", amount: 10.99, next: "Oct 22", ytd: r2(10.99 * 9), who: "Morgan" },
    { name: "CloudVault", acct: "a5", rhythm: "monthly", amount: 2.99, next: "Oct 25", ytd: r2(2.99 * 9), who: "Casey" },
    { name: "Trailhead Gym", acct: "a6", rhythm: "monthly", amount: 45.00, next: "Oct 3", ytd: 405, who: "Morgan" },
    { name: "PhotoKit", acct: "a5", rhythm: "yearly", amount: 119.00, next: "Nov 14", ytd: 0, who: "Casey" }
  ];
  function ytd9(a) { return r2(sum(a.slice(3), function (x) { return x; })); }
  var bills = [
    { name: "Lakeside Power", acct: "a1", rhythm: "monthly", amount: uPow[11], next: "Oct 8", ytd: ytd9(uPow), varies: [86, 173] },
    { name: "Valley Gas Co", acct: "a1", rhythm: "monthly", amount: uGas[11], next: "Oct 10", ytd: ytd9(uGas), varies: [25, 152] },
    { name: "Metro Water", acct: "a1", rhythm: "monthly", amount: uWat[11], next: "Oct 14", ytd: ytd9(uWat), varies: [54, 102] },
    { name: "Willow HOA", acct: "a1", rhythm: "monthly", amount: 240, next: "Oct 5", ytd: 2160 },
    { name: "Pine Mutual Auto", acct: "a1", rhythm: "monthly", amount: 128, next: "Oct 20", ytd: 1152 },
    { name: "Hummingbird Wireless", acct: "a1", rhythm: "monthly", amount: 112, next: "Oct 22", ytd: 1008 },
    { name: "Juniper water & sewer", acct: "a4", rhythm: "monthly", amount: 118, next: "Oct 6", ytd: 1062, rental: true }
  ];
  var alerts = [
    { name: "StreamBox", why: "Price up $11.99 → $12.99", acct: "a5", amount: -12.99, date: "Sep 20", hot: false },
    { name: "Maple & Rye Bakery", why: "Possible duplicate", acct: "a5", amount: -18.40, date: "Sep 17", hot: true },
    { name: "Paper statement fee", why: "New fee", acct: "a3", amount: -2.00, date: "Sep 28", hot: false }
  ];

  // ---------- totals (always computed from the accounts, homes and cars above) ----------
  var cash = sum(accounts.filter(function (a) { return a.type === "checking" || a.type === "savings"; }), function (a) { return a.bal; });
  var invested = sum(accounts.filter(function (a) { return ["stocks", "retirement", "hsa", "529"].indexOf(a.type) >= 0; }), function (a) { return a.bal; });
  var rentalCash = sum(accounts.filter(function (a) { return a.type === "rental"; }), function (a) { return a.bal; });
  var cardDebt = -sum(accounts.filter(function (a) { return a.type === "card"; }), function (a) { return a.bal; });
  var homeValue = sum(homes, function (h) { return h.value; });
  var homeDebt = sum(homes, function (h) { return h.loan + (h.loc ? h.loc.owed : 0); });
  var carValue = sum(cars, function (c) { return c.value; });
  var carDebt = sum(cars, function (c) { return c.loan; });
  var totals = {
    cash: cash + rentalCash, householdCash: cash, invested: invested, rentalCash: rentalCash, cardDebt: cardDebt,
    homeValue: homeValue, homeDebt: homeDebt, carValue: carValue, carDebt: carDebt,
    homeEquity: homeValue - homeDebt, carEquity: carValue - carDebt,
    own: cash + rentalCash + invested + homeValue + carValue,
    owe: cardDebt + homeDebt + carDebt,
    bills: utilities.gas + utilities.electricity + utilities.water + utilities.hoa,
    rentDue: sum(homes.filter(function (h) { return h.rent; }), function (h) { return h.rent; })
  };
  totals.netWorth = totals.own - totals.owe;
  Object.keys(totals).forEach(function (k) { totals[k] = r2(totals[k]); });

  // ---------- months: Jan 2025 -> Dec 2027 (up to Sep 2026 = actuals, Oct 2026 on = plan) ----------
  // cash = household cash (Everyday Checking + Savings + Joint Checking) at month-end; invest = the rental LLC's cash.
  // Identity for every month:  cash = previous cash + income - spending - payments   (payments = mortgage + carLoan + locPaid + savings)
  // and  invest = previous invest + rent + topUp - juniperMortgage - water - repairs.
  var months = [];
  (function () {
    var MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    function paydays(y, m) {          // Casey's every-other-Friday pay days that fall in a month
      var n = 0; for (var k = -80; k <= 80; k++) { var d = new Date(2026, 7, 7 + 14 * k); if (d.getFullYear() === y && d.getMonth() === m) n++; } return n; }
    function caseyPay(y) { return y <= 2025 ? 3092.60 : y === 2026 ? 3185.40 : r2(3185.40 * 1.03); }
    function morganPay(y) { return y <= 2025 ? 2175.30 : y === 2026 ? 2240.15 : r2(2240.15 * 1.03); }
    function rentA(y, m) { return (y === 2027 && m >= 7) ? 1620 : 1575; }
    function rentB(y) { return y < 2026 ? 1450 : y === 2026 ? 1495 : 1540; }
    var season = [0.96, 0.92, 0.97, 0.98, 1.0, 1.02, 1.04, 1.03, 1.0, 1.0, 1.04, 1.18];
    var inMonth = function (t, y, m) { return t.date.getFullYear() === y && t.date.getMonth() === m; };
    // actual Aug / Sep 2026 from the transactions above (household cash accounts a1-a3, the rental account a4)
    function actual(m) {
      var cashTx = tx.filter(function (t) { return inMonth(t, 2026, m) && (t.acct === "a1" || t.acct === "a2" || t.acct === "a3"); });
      var income = 0, mort = 0, car = 0, loc = 0, sav = 0, spend = 0;
      cashTx.forEach(function (t) {
        var a = t.amount;
        if (t.cat === "Salary" || t.cat === "Interest") income += a;
        else if (t.cat === "Mortgage") mort -= a;
        else if (t.cat === "Car loan") car -= a;
        else if (t.cat === "Line of credit") loc -= a;
        else if (/^Transfer to Juniper|^Auto-invest|^529 contribution/.test(t.desc)) sav -= a;
        else if (/^Transfer to Savings|^Transfer from Everyday/.test(t.desc)) { /* inside household cash */ }
        else spend -= a;
      });
      var rent = 0, rmort = 0, wat = 0, top = 0, rep = 0;
      tx.filter(function (t) { return inMonth(t, 2026, m) && t.acct === "a4"; }).forEach(function (t) {
        if (t.cat === "Rent") rent += t.amount; else if (t.cat === "Mortgage") rmort -= t.amount; else if (t.cat === "Utilities") wat -= t.amount;
        else if (/^Transfer from/.test(t.desc)) top += t.amount; else rep -= t.amount; });
      return { income: r2(income), spending: r2(spend), mortgage: r2(mort), carLoan: r2(car), locPaid: r2(loc), savings: r2(sav),
               rent: r2(rent), topUp: r2(top), jMort: r2(rmort), water: r2(wat), repairs: r2(rep) };
    }
    var act = { 7: actual(7), 8: actual(8) };
    var baseSpend = ((act[7].spending / season[7]) + (act[8].spending / season[8])) / 2;
    function comp(y, m) {
      if (y === 2026 && (m === 7 || m === 8)) return act[m];
      var inc = r2(paydays(y, m) * caseyPay(y) + 2 * morganPay(y));
      var growth = Math.pow(1.03, Math.max(0, y - 2026)) * (y === 2025 ? 0.965 : 1);
      var wob = 1 + (((y * 7 + m * 13) % 9) - 4) * 0.012;
      var carLoanPay = (y * 12 + m) <= (2028 * 12 + 4) ? 414 : 0;
      var rp = ((y * 5 + m) % 7 === 3) ? 160 + ((y + m) % 4) * 60 : 0;
      return { income: inc, spending: r2(baseSpend * season[m] * growth * wob), mortgage: 1839.52, carLoan: carLoanPay, locPaid: 600, savings: 950,
               rent: rentA(y, m) + rentB(y), topUp: 250, jMort: 3017.05, water: 118, repairs: rp };
    }
    var oct1 = function (acct) { return sum(tx.filter(function (t) { return t.acct === acct && t.date >= today; }), function (t) { return t.amount; }); };
    var cashSep = r2(sum(["a1", "a2", "a3"], function (a) { var b = accounts.filter(function (x) { return x.id === a; })[0].bal; return b - oct1(a); }));
    var invSep = r2(accounts[3].bal - oct1("a4"));
    var rate = function (y, m) { return y < 2026 ? 8.5 : (y === 2026 && m < 3) ? 8.25 : (y === 2026 && m < 6) ? 8.0 : 7.75; };
    var growth529 = function (y, m) { return 0.004 + (((y * 3 + m * 5) % 7) - 3) * 0.0035; };
    var list = [], i0 = 2025 * 12, iS = 2026 * 12 + 8, iE = 2027 * 12 + 11;
    for (var i = i0; i <= iE; i++) { var y = Math.floor(i / 12), m = i % 12, c = comp(y, m);
      list.push({ ym: y + "-" + ("0" + (m + 1)).slice(-2), label: MN[m] + " " + y, y: y, m: m + 1, plan: i >= 2026 * 12 + 9,
        income: c.income, spending: c.spending, mortgage: c.mortgage, carLoan: c.carLoan, locPaid: c.locPaid, savings: c.savings,
        rent: c.rent, topUp: c.topUp, juniperMortgage: c.jMort, water: c.water, repairs: c.repairs, rate: rate(y, m) }); }
    function delta(o) { return o.income - o.spending - (o.mortgage + o.carLoan + o.locPaid + o.savings); }
    function rnet(o) { return o.rent + o.topUp - o.juniperMortgage - o.water - o.repairs; }
    var pS = iS - i0;
    list[pS].cash = cashSep; list[pS].invest = invSep; list[pS].s529 = 26480; list[pS].locOwed = 14600;
    for (var j = pS; j > 0; j--) {           // back in time
      var o = list[j], p = list[j - 1];
      p.cash = r2(o.cash - delta(o)); p.invest = r2(o.invest - rnet(o));
      p.s529 = r2((o.s529 - 300) / (1 + growth529(o.y, o.m)));
      p.locOwed = r2((o.locOwed + o.locPaid) / (1 + o.rate / 1200));
    }
    for (var q = pS + 1; q < list.length; q++) {   // plan: forward
      var oo = list[q], pp = list[q - 1];
      oo.cash = r2(pp.cash + delta(oo)); oo.invest = r2(pp.invest + rnet(oo));
      oo.s529 = r2(pp.s529 * 1.004 + 300);
      oo.locOwed = Math.max(0, r2(pp.locOwed * (1 + oo.rate / 1200) - oo.locPaid));
    }
    list.forEach(function (o) { o.payments = r2(o.mortgage + o.carLoan + o.locPaid + o.savings); o.rentalNet = r2(rnet(o)); o.delta = r2(delta(o)); months.push(o); });
  })();

  // ---------- net worth, month by month (ends at today's figure) ----------
  var trend = [];
  (function () { var v = totals.netWorth, steps = [7200, 5100, -3300, 9800, 6100, 4400, -2100, 8200, 7000, 3900, 5200];
    trend.unshift({ m: "Sep", v: v });
    ["Aug", "Jul", "Jun", "May", "Apr", "Mar", "Feb", "Jan", "Dec", "Nov", "Oct"].forEach(function (mn, i) { v -= steps[i]; trend.unshift({ m: mn, v: v }); }); })();

  // ---------- Juniper: yearly figures (made up), used by Rental CF and Real Estate ----------
  // year: rent, operating costs (water + repairs), interest + tax & insurance, principal
  var rentals = { juniper: { bought: "Apr 2022", price: 489000, down: 97800, closing: 8400, improve: 3600, firstRent: "Jun 2022", tenant: "Unit A since Aug 2024 · Unit B since Jan 2026",
    years: [[2022, 18900, 1650, 19300, 2230], [2023, 34980, 2010, 31250, 5010], [2024, 36060, 1880, 30780, 5480], [2025, 36780, 2310, 30280, 5990], [2026, 27645, 1560, 22420, 4790]] } };
  rentals.juniper.years.forEach(function (y) {
    y[4] = Math.round(JUN.byYear[y[0]] || 0);
    if (y[0] >= 2025) y[1] = Math.round(months.filter(function (o) { return o.y === y[0] && !o.plan; }).reduce(function (t, o) { return t + o.rent; }, 0)); });
  var rentalProfit = 0;
  Object.keys(rentals).forEach(function (k) { rentals[k].years.forEach(function (y) { rentalProfit += y[1] - y[2] - y[3] - y[4]; }); });

  // ---------- car ----------
  var carx = {
    cx5: { body: "suv", perMonth: 540, since: "2021",
      sets: [{ season: "Summer", desc: "Falken Azenis 225/55R19", miles: 24300, warranty: 50000, on: true, sinceRot: 3100 },
             { season: "All-weather", desc: "Michelin CrossClimate 225/55R19", miles: 12100, warranty: 60000, on: false }],
      loan: { bought: 31800, year: 2021, amount: 24000, apr: 2.49, owed: 7950, lender: "Larkspur Credit Union", last: [414, "Sep 12", 17.32, 396.68], payoff: "May 2028", principal: 16050, interest: 1412 },
      service: [["Oil change", "≈ Oct 20", 19, "soon"], ["Tire rotation", "Nov 2026", 45, ""], ["Brake fluid", "Mar 2027", 170, ""]] }
  };
  var carEvents = [
    ["Sep 18, 2026", "cx5", "Odometer", 48620, "", 0], ["Aug 08, 2026", "cx5", "Service", 47900, "Cabin air filter · Valley Auto", 34.50],
    ["Apr 24, 2026", "cx5", "Swap", 45800, "All-weather → Summer", 60], ["Mar 14, 2026", "cx5", "Service", 45300, "Oil change · Valley Auto", 68.90],
    ["Nov 15, 2025", "cx5", "Swap", 42100, "Summer → All-weather", 60], ["Aug 30, 2025", "cx5", "Service", 40800, "Brake pads, front", 242.00]
  ];
  var swap = { season: "All-weather", date: "Nov 14", inDays: 44, why: "Nights usually drop below 40°F in the second week of November",
    days: [["Thu", 63, 44], ["Fri", 60, 41], ["Sat", 56, 38], ["Sun", 52, 35], ["Mon", 55, 37], ["Tue", 59, 40], ["Wed", 62, 43], ["Thu", 64, 45]] };
  var carsArchived = [];

  // ---------- homes: leases, tasks, upcoming money, history ----------
  var homex = {
    willow: { kind: "Own home", mortgage: { servicer: "Larkspur Credit Union", last: [1839.52, "Oct 01"], next: "Nov 01", principal: 62400, interest: 59800 },
      tasks: [["Furnace filter", "Sep 26", -5, "overdue", "R"], ["Clean gutters", "Oct 15", 14, "soon", "Y"], ["Hose bibs shut off", "Oct 24", 23, "", "Y"], ["Smoke detector batteries", "Nov 01", 31, "", "G"]] },
    juniper: { kind: "Rental", llc: "Juniper LLC", lease: { tenant: "T. Vance · L. Moreau", start: "Aug 2024 · Jan 2026", end: "Jul 2027 · Dec 2026", daysLeft: 91, pct: 77, extra: 0, pets: "none" },
      mortgage: { servicer: "Bramble Home Loans", last: [3017.05, "Oct 01"], next: "Nov 01", principal: Math.round(391200 - JUN.bal), interest: 79400 },
      loc: { servicer: "Tidewater Bank", last: [600, "Sep 20"], next: "Oct 20" },
      tasks: [["Smoke alarm check · both units", "Oct 12", 11, "soon", "Y"], ["Lease renewal offer · Unit B", "Oct 31", 30, "", "Y"], ["Gutter clean", "Nov 05", 35, "", "G"]] }
  };
  var upcoming = [["HOA", "willow", 240, false, "Oct 05", 4], ["Water & sewer", "juniper", 118, false, "Oct 06", 5], ["Line of credit", "juniper", 600, false, "Oct 20", 19],
                  ["Rent", "juniper", 3070, true, "Nov 01", 31], ["Mortgage", "willow", 1839.52, false, "Nov 01", 31], ["Mortgage", "juniper", 3017.05, false, "Nov 01", 31]];
  var homeEvents = [["Sep 26, 2026", "willow", "Task done", "Dryer vent cleaned", 0], ["Aug 19, 2026", "juniper", "Repair", "Unit A faucet cartridge", 126],
                    ["Jun 11, 2026", "willow", "Improvement", "Back-yard fence stain", 480], ["Apr 03, 2026", "juniper", "Repair", "Unit B bath fan", 164],
                    ["Mar 22, 2026", "willow", "Task done", "Water heater anode check", 0], ["Jan 02, 2026", "juniper", "Lease", "Unit B · L. Moreau · $1,495", 0],
                    ["Aug 01, 2025", "juniper", "Lease", "Unit A renewed · T. Vance · $1,575", 0]];
  var values = { willow: [452000, 458200, 446900], juniper: [528000, 533400, 521700] };   // yours · Redfin · RentCast
  var homesArchived = [];
  var tenancies = {
    A: [{ tenant: "D. Hale", start: "Jun 2022", end: "Jul 2024", periods: [["Jun 2022", "Onboard", 1450], ["Jun 2023", "Renewal", 1500]] },
        { tenant: "T. Vance", start: "Aug 2024", end: "Jul 2027", current: true, periods: [["Aug 2024", "Onboard", 1525], ["Aug 2025", "Renewal", 1575]] }],
    B: [{ tenant: "R. Okafor", start: "Jun 2022", end: "Dec 2025", periods: [["Jun 2022", "Onboard", 1395], ["Jun 2023", "Renewal", 1425], ["Jun 2025", "Renewal", 1450]] },
        { tenant: "L. Moreau", start: "Jan 2026", end: "Dec 2026", current: true, periods: [["Jan 2026", "Onboard", 1495]] }]
  };

  // ---------- Daily Tasks: one list, every area; hub counts come from it ----------
  // [group, title, where, area, due text, days, amount, kind, hot, link]   area: money | assets | household | identity | tax | activities
  var taskList = [
    ["urgent", "Furnace filter", "Willow · every 3 mo", "assets", "Sep 26", -5, "", "todo", false, "#/homes"],
    ["urgent", "Possible duplicate: Maple & Rye Bakery", "Quill ••7751 · twice on Sep 17", "money", "Sep 17", null, "$18.40", "notice", true, "#/bills"],
    ["week", "Money next 7 days", "in $3,185 · out $2,311", "money", "Oct 01", 0, "", "notice", false, "#/finances"],
    ["week", "Trailhead Gym renews", "Tidewater ••3307 · monthly", "money", "Oct 03", 2, "$45.00", "notice", false, "#/bills"],
    ["week", "HOA · Willow", "Larkspur ••2093", "money", "Oct 05", 4, "$240.00", "todo", false, "#/bills/hoa"],
    ["week", "Submit HSA claim · dental", "Bright Smiles Dental · Morgan", "household", "Oct 05", 4, "$184.00", "todo", false, "#/medcol/medical"],
    ["week", "Lakeside Power bill", "Larkspur ••2093", "money", "Oct 08", 7, "$131.10", "todo", false, "#/bills/electricity"],
    ["later", "Visa card payment", "Visa ••3307", "money", "Oct 09", 8, "$488.52", "todo", false, "#/cards"],
    ["later", "Smoke alarm check", "Juniper · both units", "assets", "Oct 12", 11, "", "todo", false, "#/homes"],
    ["later", "Clean gutters", "Willow", "assets", "Oct 15", 14, "", "todo", false, "#/homes"],
    ["later", "AP exam fee due", "Ellis · Ridgeview High", "household", "Oct 15", 14, "$98.00", "todo", false, "#/medcol"],
    ["later", "Everyday Card payment", "Quill ••7751", "money", "Oct 18", 17, "$1,264.08", "todo", false, "#/cards"],
    ["later", "Oil change", "CX-5 · ≈ 19 days", "assets", "Oct 20", 19, "", "todo", false, "#/cars"],
    ["later", "Line of credit payment", "Juniper · Tidewater", "money", "Oct 20", 19, "$600.00", "todo", false, "#/loans"],
    ["later", "Start renewal: Driver's license", "Morgan · expires Jan 2027", "identity", "Oct 31", 30, "", "todo", false, "#/vault"],
    ["later", "Lease renewal offer · Unit B", "L. Moreau · lease ends Dec 2026", "assets", "Oct 31", 30, "", "todo", false, "#/homes"],
    ["fyi", "StreamBox price went up", "$11.99 → $12.99 · Quill ••7751", "money", "Sep 20", null, "", "notice", false, "#/bills"],
    ["fyi", "Paper statement fee", "Tidewater ••6618", "money", "Sep 28", null, "$2.00", "notice", false, "#/bills"],
    ["fyi", "Categories tidied", "3 transactions filed like your history", "money", "Sep 29", null, "", "notice", false, "#/finances/transactions"]
  ];
  var planned = [["November 2026", 5], ["December 2026", 4], ["January 2027", 6], ["February 2027", 3], ["March 2027", 5], ["April 2027", 4]];
  var tasksDone = [["Dryer vent cleaned", "assets", "done", "09-26"], ["Sep rent · Unit A", "assets", "done", "09-01"], ["Sep rent · Unit B", "assets", "done", "09-01"], ["Auto-invest check", "money", "seen", "09-03"]];
  var tasks = { urgent: 0, week: 0, byArea: {} };
  tasks.urgent = taskList.filter(function (t) { return t[0] === "urgent"; }).length;
  tasks.week = taskList.filter(function (t) { return t[0] === "week"; }).length;
  taskList.forEach(function (t) { if (t[0] === "urgent" || t[0] === "week") tasks.byArea[t[3]] = (tasks.byArea[t[3]] || 0) + 1; });
  var renewals = [{ what: "Driver's license · Morgan", when: "in 3 mo" }, { what: "Passport · Casey", when: "in 11 mo" }];

  // ---------- Utilities: 12 months per home (Oct 2025 -> Sep 2026), the year before for comparison ----------
  function series(list, before) { return UM.map(function (m, i) { return { m: m, cost: list[i], prev: before ? r2(list[i] * before[i]) : null }; }); }
  var jitter = [1.04, 0.97, 1.08, 0.95, 1.02, 0.99, 1.06, 0.93, 1.01, 0.98, 1.05, 0.96];
  var flat118 = UM.map(function () { return 118; });
  var utilityData = {
    gas: { unit: "therms", homes: [{ key: "willow", months: series(uGas, jitter), usage: [30, 62, 104, 134, 123, 96, 68, 41, 25, 22, 27, 34] }] },
    electricity: { unit: "kWh", homes: [{ key: "willow", months: series(uPow, jitter), usage: [640, 672, 745, 782, 716, 651, 570, 612, 850, 1140, 990, 868] }] },
    water: { unit: "kgal", homes: [{ key: "willow", months: series(uWat, jitter), usage: [4.4, 3.7, 3.5, 3.5, 3.5, 3.6, 4.1, 5.3, 6.4, 6.6, 6.0, 5.1] },
                                   { key: "juniper", months: series(flat118, UM.map(function () { return 0.97; })) }] },
    hoa: { homes: [{ key: "willow", months: series(uHoa, UM.map(function () { return 0.979; })) }] }
  };

  // ---------- Identity Vault: names and dates only ----------
  var vaultDocs = [["Driver's license", "Morgan", "Jan 19, 2027", 110, "soon", "Renew online up to 6 months before"],
                   ["Learner's permit", "Ellis", "Mar 02, 2027", 152, "ok", "Road test once 6 months are done"],
                   ["Passport", "Casey", "Aug 21, 2027", 324, "ok", "Start renewal 9 months before"],
                   ["Driver's license", "Casey", "May 06, 2028", 583, "ok", ""],
                   ["Passport", "Morgan", "Feb 11, 2029", 863, "ok", ""],
                   ["Passport", "Ellis", "Jun 24, 2030", 1362, "ok", "Under 16 when issued: 5-year passport"]];
  var vaultFolders = [["Education & Identity", [["Casey", 9], ["Morgan", 8], ["Ellis", 6], ["In this folder", 2]]],
                      ["Insurance & Records", [["Home insurance", 5], ["Vehicle", 4], ["Medical cards", 3]]]];

  // ---------- Tax & Audit: filed returns vs the household's data ----------
  var audit = { years: [2025, 2024, 2023, 2022, 2021], check: { 2025: 1, 2024: 0, 2023: 1, 2022: 0, 2021: 0 },
    summary: [["Wages (W-2 box 1)", 171340, 171340], ["Federal tax withheld", 19880, 19880], ["Interest · US accounts", 598, 612], ["Dividends · US accounts", 1384, 1384],
              ["Juniper rental, tax view (incl. depreciation)", -2610, -2610]],
    rentals: [{ name: "Juniper", rent: 36780, lines: [["3", "Rents received", 36780], ["7", "Cleaning & maintenance", 1180], ["9", "Insurance", 1410], ["12", "Mortgage interest", 22640], ["16", "Taxes", 4980], ["17", "Utilities (water & sewer)", 1416], ["18", "Depreciation", 7400]] }],
    filed: [["ok", "Wages", "1040", "1a", 171340, 171340, ""], ["small", "Taxable interest", "1040", "2b", 598, 612, "$14 from a savings account's last statement of the year"],
            ["ok", "Ordinary dividends", "1040", "3b", 1384, 1384, ""], ["ok", "Rental real estate", "Sch 1", "5", -2610, -2610, ""],
            ["check", "Charitable gifts", "Sch A", "12", 1900, 1425, "The app sees $1,425 in gifts; $475 more on the return (cash gifts, or a gift from an account the app doesn't have?)"],
            ["ok", "Mortgage interest (Willow)", "Sch A", "8a", 9180, 9180, ""], ["ok", "Federal tax withheld", "1040", "25a", 19880, 19880, ""],
            ["explained", "Refund", "1040", "35a", 1342, 1342, "Arrived Mar 9 into Larkspur ••2093"]] };

  // ---------- Settings ----------
  var dailyRun = [["Bank feed", "ok"], ["Car odometer (1 call)", "ok"], ["Home values", "ok"], ["Tire swap plan", "ok"], ["Statement emails", "ok"], ["Categories check", "ok"], ["Daily Tasks", "ok"], ["Morning summary", "ok"], ["Backup", "ok"]];

  return { today: today, people: people, banks: banks, accounts: accounts, homes: homes, cars: cars, utilities: utilities, rentalProfit: rentalProfit,
           carx: carx, carEvents: carEvents, swap: swap, carsArchived: carsArchived, homex: homex, upcoming: upcoming, homeEvents: homeEvents,
           values: values, homesArchived: homesArchived, tenancies: tenancies,
           taskList: taskList, planned: planned, tasksDone: tasksDone, utilityData: utilityData, vaultDocs: vaultDocs, vaultFolders: vaultFolders, audit: audit, dailyRun: dailyRun,
           tasks: tasks, renewals: renewals, totals: totals, cats: cats, tx: tx, subs: subs, bills: bills,
           alerts: alerts, rentals: rentals, trend: trend, months: months };
})();
