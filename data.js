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
    NCU: { name: "Northwind CU", color: "#2F6FA3" },
    HB: { name: "Harbor Bank", color: "#1F8A70" },
    SUM: { name: "Summit Card", color: "#8E44AD" },
    PINE: { name: "Pinecrest Savings", color: "#B7791F" },
    ATL: { name: "Atlas Invest", color: "#2E8B57" }
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
    { id: "a10", bank: "ATL", name: "Brokerage", end: "6630", type: "stocks", bal: 84220.00, who: "alex" },
    { id: "a11", bank: "ATL", name: "401(k)", end: "6631", type: "retirement", bal: 212480.00, who: "alex" },
    { id: "a12", bank: "ATL", name: "HSA", end: "6632", type: "hsa", bal: 9340.00, who: "alex" },
    { id: "a13", bank: "ATL", name: "College 529", end: "1188", type: "529", bal: 31760.00, who: "maya" }
  ];

  var homes = [
    { key: "maple", name: "Maple", kind: "own", color: "#F2612D", value: 685000, loan: 402300, heloc: 18500, rate: 5.125 },
    { key: "cedar", name: "Cedar", kind: "rental", color: "#C2410C", value: 412000, loan: 268900, rent: 2350, rate: 6.25 },
    { key: "birch", name: "Birch", kind: "rental", color: "#D97706", value: 389000, loan: 251400, rent: 2195, rate: 6.5 }
  ];

  var cars = [
    { key: "ioniq", name: "Ioniq 5", year: 2023, color: "#7B2FF7", value: 31000, loan: 14820, miles: 21480, next: "Tire rotation", nextIn: "in 12 days" },
    { key: "outback", name: "Outback", year: 2019, color: "#4F7C8A", value: 16500, loan: 0, miles: 68210, next: "Oil change", nextIn: "in 640 mi" }
  ];

  var utilities = { gas: 62.40, electricity: 148.15, water: 90.75, hoa: 185.00, month: "Sep" };

  var tasks = { urgent: 2, week: 5, byArea: { money: 2, assets: 3, utilities: 1, identity: 1 } };
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

  return { people: people, banks: banks, accounts: accounts, homes: homes, cars: cars, utilities: utilities,
           tasks: tasks, renewals: renewals, totals: totals };
})();
