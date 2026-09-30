/* The made-up household behind every screen. Nothing here comes from a real person: names, banks, homes, cars and
   amounts are invented. Screens compute their figures from these objects, so the same number reads the same everywhere. */
window.DEMO = (function () {
  var people = [
    { key: "alex", name: "Alex", role: "self" },
    { key: "jordan", name: "Jordan", role: "spouse" },
    { key: "maya", name: "Maya", role: "child" },
    { key: "theo", name: "Theo", role: "child" }
  ];

  var banks = {
    NCU: { name: "Northwind CU", short: "Northwind", color: "#2F6FA3" },
    HB: { name: "Harbor Bank", short: "Harbor", color: "#1F8A70" },
    SUM: { name: "Summit Card", short: "Summit", color: "#8E44AD" },
    PINE: { name: "Pinecrest Savings", short: "Pinecrest", color: "#B7791F" },
    ATL: { name: "Atlas Invest", short: "Atlas", color: "#2E8B57" }
  };

  // type: checking | savings | cd | card | stocks | retirement | hsa | 529 | rental
  var accounts = [
    { id: "a1", bank: "NCU", name: "Everyday Checking", end: "4417", type: "checking", bal: 12480.55, who: "alex" },
    { id: "a2", bank: "NCU", name: "Rainy-day Savings", end: "4418", type: "savings", bal: 21905.10, who: "alex" },
    { id: "a3", bank: "HB", name: "Joint Checking", end: "7302", type: "checking", bal: 6112.84, who: "jordan" },
    { id: "a4", bank: "PINE", name: "High-Yield Savings", end: "9051", type: "savings", bal: 7711.62, who: "jordan" },
    { id: "a5", bank: "NCU", name: "CDs (3)", end: "4420", type: "cd", bal: 25000.00, who: "alex" },
    { id: "a6", bank: "SUM", name: "Rewards Card", end: "2266", type: "card", bal: -1842.37, who: "alex", due: "Oct 14" },
    { id: "a7", bank: "HB", name: "Everyday Visa", end: "5530", type: "card", bal: -623.19, who: "jordan", due: "Oct 21" },
    { id: "a8", bank: "HB", name: "Cedar LLC Checking", end: "8124", type: "rental", bal: 3410.00, home: "cedar" },
    { id: "a9", bank: "HB", name: "Birch LLC Checking", end: "8125", type: "rental", bal: 2905.45, home: "birch" },
    { id: "a10", bank: "ATL", name: "Brokerage", end: "6630", type: "stocks", bal: 84220.00, who: "alex", inv: 61500 },
    { id: "a11", bank: "ATL", name: "401(k)", end: "6631", type: "retirement", bal: 212480.00, who: "alex", inv: 158200 },
    { id: "a12", bank: "ATL", name: "HSA", end: "6632", type: "hsa", bal: 9340.00, who: "alex", inv: 7900 },
    { id: "a13", bank: "ATL", name: "College 529", end: "1188", type: "529", bal: 31760.00, who: "maya", inv: 27400 }
  ];

  var homes = [
    { key: "maple", name: "Maple", kind: "own", color: "#F2612D", value: 685000, loan: 402300, heloc: 18500, rate: 5.125, borrowed: 448000, helocLimit: 60000, bought: "May 2021", price: 560000, down: 112000, closing: 9100, improve: 18400 },
    { key: "cedar", name: "Cedar", kind: "rental", color: "#C2410C", value: 412000, loan: 268900, rent: 2350, rate: 6.25, borrowed: 284000 },
    { key: "birch", name: "Birch", kind: "rental", color: "#D97706", value: 389000, loan: 251400, rent: 2195, rate: 6.5, borrowed: 278400 }
  ];

  var cars = [
    { key: "ioniq", name: "Ioniq 5", year: 2023, color: "#7B2FF7", value: 31000, loan: 14820, borrowed: 32000, paid: 46500, miles: 21480, next: "Tire rotation", nextIn: "in 12 days" },
    { key: "outback", name: "Outback", year: 2019, color: "#4F7C8A", value: 16500, loan: 0, paid: 27800, miles: 68210, next: "Oil change", nextIn: "in 640 mi" }
  ];

  var utilities = { gas: 62.40, electricity: 148.15, water: 90.75, hoa: 185.00, month: "Sep" };

  var tasks = { urgent: 2, week: 5, byArea: { money: 2, assets: 3, rentals: 1, utilities: 1, identity: 1 } };
  var renewals = [{ what: "Passport · Jordan", when: "in 7 mo" }, { what: "Driver's license · Alex", when: "in 11 mo" }];

  function sum(list, f) { return list.reduce(function (t, x) { return t + f(x); }, 0); }
  var cash = sum(accounts.filter(function (a) { return a.type === "checking" || a.type === "savings"; }), function (a) { return a.bal; });
  var invested = sum(accounts.filter(function (a) { return ["stocks", "retirement", "hsa", "529", "cd"].indexOf(a.type) >= 0; }), function (a) { return a.bal; });
  var rentalCash = sum(accounts.filter(function (a) { return a.type === "rental"; }), function (a) { return a.bal; });
  var cardDebt = -sum(accounts.filter(function (a) { return a.type === "card"; }), function (a) { return a.bal; });
  var homeValue = sum(homes, function (h) { return h.value; });
  var homeDebt = sum(homes, function (h) { return h.loan + (h.heloc || 0); });
  var carValue = sum(cars, function (c) { return c.value; });
  var carDebt = sum(cars, function (c) { return c.loan; });

  var totals = {
    cash: cash, invested: invested, rentalCash: rentalCash, cardDebt: cardDebt,
    homeEquity: homeValue - homeDebt, carEquity: carValue - carDebt,
    own: cash + invested + rentalCash + homeValue + carValue,
    owe: cardDebt + homeDebt + carDebt,
    bills: utilities.gas + utilities.electricity + utilities.water + utilities.hoa,
    rentDue: sum(homes.filter(function (h) { return h.rent; }), function (h) { return h.rent; })
  };
  totals.netWorth = totals.own - totals.owe;

  // ---------- transactions (Aug 1 → today), made up with a fixed seed so every visit shows the same list ----------
  var today = new Date(2026, 8, 29);
  var seed = 20260929;
  function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
  function pick(list) { return list[Math.floor(rnd() * list.length)]; }
  function r2(n) { return Math.round(n * 100) / 100; }

  var cats = {
    "Groceries": "#2A9D5C", "Dining": "#E07B24", "Fuel & charging": "#5A6B85", "Shopping": "#8A4FB8", "Kids": "#D1495B",
    "Utilities": "#C98A12", "Mortgage": "#2F6FA3", "HOA": "#7A6FA8", "Subscriptions": "#1E9AA8", "Insurance": "#A0522D",
    "Health": "#C0405E", "Salary": "#2E8B57", "Rent": "#2E8B57", "Interest": "#2E8B57", "Transfer": "#8A938C", "Travel": "#1F77B4"
  };
  var spend = [
    ["Groceries", ["Fresh Fields Market", "Harvest Grocer", "Corner Co-op", "Big Box Wholesale"], 40, 210],
    ["Dining", ["Corner Bakery", "Noodle House", "Taco Garage", "Sunny Side Cafe", "Pizza Palace"], 12, 85],
    ["Fuel & charging", ["QuickCharge", "Valley Fuel"], 14, 62],
    ["Shopping", ["Online Market", "Home Goods Depot", "Book Nook", "Sports Outlet"], 18, 240],
    ["Kids", ["Little Stars Dance", "Rec Center Swim", "School Store"], 15, 120],
    ["Health", ["Family Pharmacy", "Bright Smiles Dental"], 12, 160]
  ];
  var tx = [], id = 1;
  function add(d, acct, desc, cat, amount, who) {
    tx.push({ id: id++, date: new Date(2026, d[0], d[1]), acct: acct, desc: desc, cat: cat, amount: r2(amount), who: who || null });
  }
  for (var day = new Date(2026, 7, 1); day <= today; day.setDate(day.getDate() + 1)) {
    var m = day.getMonth(), dd = day.getDate(), dow = day.getDay(), d = [m, dd];
    if (dd === 1) { add(d, "a1", "Maple mortgage · Northwind CU", "Mortgage", -2845.00);
      add(d, "a8", "Cedar mortgage payment", "Mortgage", -1985.40); add(d, "a9", "Birch mortgage payment", "Mortgage", -1862.15);
      add(d, "a1", "Transfer to Rainy-day Savings", "Transfer", -500); }
    if (dd === 2) { add(d, "a8", "Rent · Cedar tenant", "Rent", 2350); add(d, "a9", "Rent · Birch tenant", "Rent", 2195); }
    if (dd === 5) { add(d, "a3", "Summit Card payment", "Transfer", -1600); add(d, "a8", "Cedar HOA", "HOA", -210); }
    if (dd === 8) { add(d, "a1", "Maple HOA", "HOA", -185); add(d, "a1", "Lakeside Power", "Utilities", -(m === 7 ? 162.30 : 148.15)); }
    if (dd === 11) { add(d, "a1", "Valley Gas Co", "Utilities", -(m === 7 ? 48.90 : 62.40)); add(d, "a9", "Birch water & sewer", "Utilities", -58.20); }
    if (dd === 14) { add(d, "a3", "Harbor Visa payment", "Transfer", -700); add(d, "a1", "Metro Water", "Utilities", -90.75); }
    if (dd === 15 || dd === 30) add(d, "a3", "Payroll · Brightline Labs", "Salary", 2280.40, "Jordan");
    if (dd === 20) { add(d, "a6", "StreamFlix", "Subscriptions", m === 7 ? -13.99 : -15.49, "Alex"); add(d, "a1", "Safe Auto Insurance", "Insurance", -142.00); }
    if (dd === 22) add(d, "a7", "Tune Music+", "Subscriptions", -10.99, "Jordan");
    if (dd === 25) { add(d, "a6", "CloudDrive 2TB", "Subscriptions", -2.99, "Alex"); add(d, "a2", "Interest", "Interest", m === 7 ? 71.18 : 73.40); }
    if (dd === 3) add(d, "a7", "Iron Fitness", "Subscriptions", -39.00, "Jordan");
    if (dd === 27) add(d, "a1", "Summit Card payment", "Transfer", -900);
    if (dow === 5 && (Math.floor((day - new Date(2026, 7, 7)) / 864e5) % 14 === 0)) add(d, "a1", "Payroll · Northgate Systems", "Salary", 3410.25, "Alex");
    var n = dow === 0 || dow === 6 ? 3 : 2;
    for (var k = 0; k < n; k++) {
      var s = pick(spend), card = rnd() < 0.6 ? "a6" : "a7";
      add(d, card, pick(s[1]), s[0], -(s[2] + rnd() * (s[3] - s[2])), card === "a6" ? "Alex" : pick(["Jordan", "Maya", "Jordan"]));
    }
  }
  add([8, 17], "a6", "Corner Bakery", "Dining", -18.40, "Alex");
  add([8, 17], "a6", "Corner Bakery", "Dining", -18.40, "Alex");
  add([8, 12], "a7", "Foreign transaction fee", "Travel", -2.13, "Jordan");
  tx.sort(function (a, b) { return b.date - a.date || b.id - a.id; });
  // running balance per account, worked back from today's balance
  accounts.forEach(function (a) {
    var run = a.bal;
    tx.forEach(function (t) { if (t.acct === a.id) { t.run = r2(run); run -= t.amount; } });
  });

  var subs = [
    { name: "StreamFlix", acct: "a6", rhythm: "monthly", amount: 15.49, next: "Oct 20", ytd: 127.90, who: "Alex" },
    { name: "Iron Fitness", acct: "a7", rhythm: "monthly", amount: 39.00, next: "Oct 3", ytd: 351.00, who: "Jordan" },
    { name: "Tune Music+", acct: "a7", rhythm: "monthly", amount: 10.99, next: "Oct 22", ytd: 98.91, who: "Jordan" },
    { name: "CloudDrive 2TB", acct: "a6", rhythm: "monthly", amount: 2.99, next: "Oct 25", ytd: 26.91, who: "Alex" },
    { name: "Shield Antivirus", acct: "a6", rhythm: "yearly", amount: 49.99, next: "Nov 3", ytd: 0, who: "Alex" },
    { name: "Big Box Membership", acct: "a1", rhythm: "yearly", amount: 65.00, next: "Feb 12", ytd: 65.00 }
  ];
  var bills = [
    { name: "Lakeside Power", acct: "a1", rhythm: "monthly", amount: 148.15, next: "Oct 8", ytd: 1402.30, varies: [96, 212] },
    { name: "Valley Gas Co", acct: "a1", rhythm: "monthly", amount: 62.40, next: "Oct 11", ytd: 812.60, varies: [31, 188] },
    { name: "Metro Water", acct: "a1", rhythm: "monthly", amount: 90.75, next: "Oct 14", ytd: 780.10, varies: [64, 118] },
    { name: "Maple HOA", acct: "a1", rhythm: "monthly", amount: 185.00, next: "Oct 8", ytd: 1665.00 },
    { name: "Safe Auto Insurance", acct: "a1", rhythm: "monthly", amount: 142.00, next: "Oct 20", ytd: 1278.00 },
    { name: "Cedar HOA", acct: "a8", rhythm: "monthly", amount: 210.00, next: "Oct 5", ytd: 1890.00, rental: true },
    { name: "Birch water & sewer", acct: "a9", rhythm: "monthly", amount: 58.20, next: "Oct 11", ytd: 511.40, rental: true, varies: [41, 77] }
  ];
  var alerts = [
    { name: "StreamFlix", why: "Price up $13.99 → $15.49", acct: "a6", amount: -15.49, date: "Sep 20", hot: false },
    { name: "Corner Bakery", why: "Possible duplicate", acct: "a6", amount: -18.40, date: "Sep 17", hot: true },
    { name: "Foreign transaction fee", why: "Fee", acct: "a7", amount: -2.13, date: "Sep 12", hot: true }
  ];

  // ---------- rentals: yearly figures (made up), used by Rental CF and Real Estate ----------
  var rentals = {
    cedar: { bought: "Jun 2021", price: 355000, down: 71000, closing: 6200, improve: 4800, firstRent: "Aug 2021", tenant: "since Jul 2025",
      years: [[2021, 9400, 2310, 4760, 1690], [2022, 27600, 6480, 11200, 4180], [2023, 27600, 7120, 11020, 4450], [2024, 28200, 7340, 10830, 4740], [2025, 28200, 7610, 10620, 5050], [2026, 21150, 5820, 7810, 3860]] },
    birch: { bought: "Mar 2023", price: 348000, down: 69600, closing: 5900, improve: 7300, firstRent: "May 2023", tenant: "since May 2024",
      years: [[2023, 16800, 4980, 11200, 1800], [2024, 25800, 6760, 16900, 2620], [2025, 26340, 7040, 16700, 2840], [2026, 19755, 5390, 12400, 2250]] }
  };   // year: rent, operating costs, interest + tax & insurance, principal

  // ---------- net worth, month by month (ends at today's figure) ----------
  var trend = [];
  (function () { var v = totals.netWorth, steps = [9800, 6200, -4100, 12400, 7300, 5100, -2600, 9900, 8800, 4700, 6300];
    trend.unshift({ m: "Sep", v: v });
    ["Aug", "Jul", "Jun", "May", "Apr", "Mar", "Feb", "Jan", "Dec", "Nov", "Oct"].forEach(function (mn, i) { v -= steps[i]; trend.unshift({ m: mn, v: v }); }); })();

  var rentalProfit = 0;
  Object.keys(rentals).forEach(function (k) { rentals[k].years.forEach(function (y) { rentalProfit += y[1] - y[2] - y[3] - y[4]; }); });

  // ---------- cars: tire sets, loan, service, history ----------
  var carx = {
    ioniq: { body: "sedan", perMonth: 1020, since: "Mar 2023",
      sets: [{ season: "Summer", desc: "Michelin Primacy 235/55R19", miles: 14120, warranty: 50000, on: true, sinceRot: 4380 },
             { season: "Winter", desc: "Bridgestone Blizzak 235/55R19", miles: 7360, warranty: 40000, on: false }],
      loan: { bought: 46500, year: 2023, amount: 32000, apr: 3.9, owed: 14820, lender: "Northwind CU", last: [612.40, "Sep 12", 560, 52], payoff: "Aug 2028", principal: 17180, interest: 2410 },
      service: [["Tire rotation", "Oct 11", 12, "soon"], ["Cabin air filter", "Dec 2026", 70, ""], ["Brake fluid check", "Mar 2027", 170, ""]] },
    outback: { body: "suv", perMonth: 640, since: "Jun 2019",
      sets: [{ season: "Summer", desc: "Yokohama Geolandar 225/65R17", miles: 22800, warranty: 60000, on: true, sinceRot: 3900 },
             { season: "Winter", desc: "Nokian Hakkapeliitta 225/65R17", miles: 16400, warranty: 45000, on: false }],
      loan: { bought: 27800, year: 2019, amount: 18000, apr: 2.9, owed: 0, lender: "Harbor Bank", paidOff: "May 2023" },
      service: [["Oil change", "≈ Oct 20", 21, "soon"], ["Registration renewal", "Oct 31", 32, "soon"], ["Wiper blades", "Nov 2026", 45, ""]] }
  };
  var carEvents = [
    ["Sep 14, 2026", "outback", "Odometer", 68210, "", 0], ["Aug 30, 2026", "ioniq", "Service", 20900, "Tire rotation · QuickLube", 49.99],
    ["Jul 18, 2026", "outback", "Service", 66100, "Oil change · Valley Auto", 72.40], ["May 02, 2026", "ioniq", "Swap", 18650, "Winter → Summer", 60],
    ["Apr 28, 2026", "outback", "Swap", 64300, "Winter → Summer", 60], ["Mar 15, 2026", "outback", "Service", 63500, "Brakes, front pads", 289.10],
    ["Dec 06, 2025", "ioniq", "Swap", 15100, "Summer → Winter", 60], ["Dec 05, 2025", "outback", "Swap", 61020, "Summer → Winter", 60],
    ["Oct 12, 2025", "ioniq", "Service", 14400, "Cabin air filter", 38.00], ["Aug 21, 2025", "outback", "Service", 59200, "Oil change · Valley Auto", 69.90]
  ];
  var swap = { season: "Winter", date: "Nov 12", inDays: 44, why: "First night below 38°F is usually the second week of November",
    days: [["Tue", 61, 42], ["Wed", 58, 40], ["Thu", 54, 37], ["Fri", 49, 33, "snow"], ["Sat", 52, 35], ["Sun", 57, 39], ["Mon", 60, 41], ["Tue", 62, 43]] };
  var carsArchived = [{ name: "2011 Minivan", color: "#8A8F98", body: "suv", bought: 24900, from: "Apr 2011", to: "Jun 2019", how: "Traded in", sale: 6200, odo: 131400 }];

  // ---------- homes: leases, tasks, upcoming money, history ----------
  var homex = {
    maple: { kind: "Own home", mortgage: { servicer: "Northwind CU", last: [2845, "Sep 01"], next: "Oct 01", principal: 45700, interest: 91200 },
      heloc: { owed: 18500, rate: 8.25, avail: 41500, paid: 6200, repaid: 4100, last: [450, "Sep 15"] },
      tasks: [["Furnace filter", "Sep 26", -3, "overdue", "R"], ["Clean gutters", "Oct 15", 16, "soon", "Y"], ["Sprinkler blowout", "Oct 20", 21, "soon", "Y"], ["Smoke detector batteries", "Nov 01", 33, "", "G"]] },
    cedar: { kind: "Rental", llc: "Cedar Rental LLC", lease: { tenant: "R. Alvarez", start: "Jul 01, 2026", end: "Jun 30, 2027", daysLeft: 274, pct: 25, extra: 60, pets: "1 cat" },
      mortgage: { servicer: "Keystone Home Loans", last: [1985.40, "Sep 01"], next: "Oct 01", principal: 15100, interest: 70600 },
      tasks: [["HVAC service", "Oct 28", 29, "", "Y"], ["Lease renewal talk", "Mar 2027", 150, "", "G"]] },
    birch: { kind: "Rental", llc: "Birch Rental LLC", lease: { tenant: "S. Nguyen", start: "May 01, 2026", end: "Apr 30, 2027", daysLeft: 213, pct: 42, extra: 0, pets: "none" },
      mortgage: { servicer: "Keystone Home Loans", last: [1862.15, "Sep 01"], next: "Oct 01", principal: 27000, interest: 59100 },
      tasks: [["Water heater flush", "Oct 09", 10, "soon", "Y"], ["Replace furnace filter", "Nov 15", 47, "", "G"]] }
  };
  var upcoming = [["Rent", "cedar", 2350, true, "Oct 02", 3], ["Rent", "birch", 2195, true, "Oct 02", 3], ["Mortgage", "maple", 2845, false, "Oct 01", 2],
                  ["Mortgage", "cedar", 1985.40, false, "Oct 01", 2], ["Mortgage", "birch", 1862.15, false, "Oct 01", 2], ["HOA", "cedar", 210, false, "Oct 05", 6],
                  ["HOA", "maple", 185, false, "Oct 08", 9]];
  var homeEvents = [["Sep 26, 2026", "maple", "Task done", "Deep clean dryer vent", 0], ["Aug 19, 2026", "birch", "Repair", "Garbage disposal replaced", 214],
                    ["Jul 01, 2026", "cedar", "Lease", "Renewed · R. Alvarez · $2,350", 0], ["Jun 11, 2026", "maple", "Improvement", "Patio pavers", 3850],
                    ["May 01, 2026", "birch", "Lease", "Renewed · S. Nguyen · $2,195", 0], ["Apr 03, 2026", "cedar", "Repair", "Dishwasher pump", 186],
                    ["Mar 22, 2026", "maple", "Task done", "Water softener salt", 24]];
  var values = { maple: [685000, 692400, 668000], cedar: [412000, 405900, 418200], birch: [389000, 394100, 381500] };  // yours · Redfin · RentCast
  var homesArchived = [{ name: "Aspen", color: "#8A8F98", kind: "Rental (sold)", bought: "Aug 2016", price: 229000, sold: "Mar 2024", sale: 341000, net: 108400 }];
  var tenancies = {
    cedar: [{ tenant: "J. Parker", start: "Aug 2021", end: "Jun 2023", periods: [["Aug 2021", "Onboard", 2150], ["Jul 2022", "Renewal", 2250]] },
            { tenant: "M. Ortiz", start: "Jul 2023", end: "Jun 2025", periods: [["Jul 2023", "Onboard", 2295], ["Jul 2024", "Renewal", 2295]] },
            { tenant: "R. Alvarez", start: "Jul 2025", end: "Jun 2027", current: true, periods: [["Jul 2025", "Onboard", 2350], ["Jul 2026", "Renewal", 2350]] }],
    birch: [{ tenant: "K. Brooks", start: "May 2023", end: "Apr 2024", periods: [["May 2023", "Onboard", 2100]] },
            { tenant: "S. Nguyen", start: "May 2024", end: "Apr 2027", current: true, periods: [["May 2024", "Onboard", 2150], ["May 2025", "Renewal", 2195], ["May 2026", "Renewal", 2195]] }]
  };

  return { people: people, banks: banks, accounts: accounts, homes: homes, cars: cars, utilities: utilities, rentalProfit: rentalProfit,
           carx: carx, carEvents: carEvents, swap: swap, carsArchived: carsArchived, homex: homex, upcoming: upcoming, homeEvents: homeEvents,
           values: values, homesArchived: homesArchived, tenancies: tenancies,
           tasks: tasks, renewals: renewals, totals: totals, today: today, cats: cats, tx: tx, subs: subs, bills: bills,
           alerts: alerts, rentals: rentals, trend: trend };
})();
