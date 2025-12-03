/**
 * Numat Group dashboard web app
 * - Dashboard + Data entry
 * - Data stored in localStorage
 * - Charts powered by Chart.js
 */

const DIVISIONS = [
  "NumatAGRI NZ",
  "NumatAGRI AU",
  "NumatAGRI Construction",
  "YoungStar",
  "NumatREC",
  "Creo",
];

const STORAGE_KEYS = {
  opportunities: "numat_opportunities",
  sales: "numat_sales",
  targets: "numat_targets",
};

// -------- Sample data --------

const sampleOpportunities = [
  {
    date: "2026-01-05",
    salesperson: "John Smith",
    division: "NumatAGRI NZ",
    customer: "Farm A – Holding Yard",
    estimatedValue: 15000,
    stage: "Won",
    outcome: "Won",
    closeDate: "2026-01-20",
  },
  {
    date: "2026-01-09",
    salesperson: "Kate Brown",
    division: "NumatAGRI AU",
    customer: "Feedlot B",
    estimatedValue: 28000,
    stage: "Quote Sent",
    outcome: "Open",
    closeDate: "",
  },
  {
    date: "2026-01-18",
    salesperson: "Sam Lee",
    division: "NumatAGRI Construction",
    customer: "Dairy C – New Build",
    estimatedValue: 42000,
    stage: "Verbal Yes",
    outcome: "Open",
    closeDate: "",
  },
  {
    date: "2026-02-03",
    salesperson: "Alex Green",
    division: "YoungStar",
    customer: "School D",
    estimatedValue: 9000,
    stage: "Won",
    outcome: "Won",
    closeDate: "2026-02-15",
  },
  {
    date: "2026-02-10",
    salesperson: "Jess White",
    division: "NumatREC",
    customer: "Council E – Playground",
    estimatedValue: 22000,
    stage: "Lost",
    outcome: "Lost",
    closeDate: "2026-02-28",
  },
  {
    date: "2026-02-21",
    salesperson: "John Smith",
    division: "Creo",
    customer: "Council F – Streetscape",
    estimatedValue: 30000,
    stage: "Quote Sent",
    outcome: "Open",
    closeDate: "",
  },
];

const sampleSales = [
  {
    invoiceDate: "2026-01-10",
    division: "NumatAGRI NZ",
    customer: "Farm A – Holding Yard",
    region: "NZ",
    amount: 20000,
  },
  {
    invoiceDate: "2026-01-15",
    division: "Creo",
    customer: "Council F – Streetscape",
    region: "NZ",
    amount: 14000,
  },
  {
    invoiceDate: "2026-01-20",
    division: "YoungStar",
    customer: "School D",
    region: "NZ",
    amount: 11000,
  },
  {
    invoiceDate: "2026-02-02",
    division: "NumatAGRI AU",
    customer: "Feedlot B",
    region: "AU",
    amount: 18000,
  },
  {
    invoiceDate: "2026-02-08",
    division: "NumatREC",
    customer: "Council E – Playground",
    region: "NZ",
    amount: 23000,
  },
  {
    invoiceDate: "2026-02-18",
    division: "NumatAGRI Construction",
    customer: "Dairy C – New Build",
    region: "NZ",
    amount: 45000,
  },
];

const sampleTargets = [
  { year: 2026, month: 1, division: "All Divisions", oppGoal: 25, salesGoal: 500000 },
  { year: 2026, month: 1, division: "NumatAGRI NZ", oppGoal: 10, salesGoal: 200000 },
  { year: 2026, month: 1, division: "NumatAGRI AU", oppGoal: 5, salesGoal: 120000 },
  { year: 2026, month: 1, division: "NumatAGRI Construction", oppGoal: 3, salesGoal: 90000 },
  { year: 2026, month: 1, division: "YoungStar", oppGoal: 3, salesGoal: 80000 },
  { year: 2026, month: 1, division: "NumatREC", oppGoal: 2, salesGoal: 60000 },
  { year: 2026, month: 1, division: "Creo", oppGoal: 2, salesGoal: 50000 },
  { year: 2026, month: 2, division: "All Divisions", oppGoal: 27, salesGoal: 520000 },
  { year: 2026, month: 2, division: "NumatAGRI NZ", oppGoal: 11, salesGoal: 210000 },
  { year: 2026, month: 2, division: "NumatAGRI AU", oppGoal: 5, salesGoal: 125000 },
  { year: 2026, month: 2, division: "NumatAGRI Construction", oppGoal: 3, salesGoal: 95000 },
  { year: 2026, month: 2, division: "YoungStar", oppGoal: 3, salesGoal: 82000 },
  { year: 2026, month: 2, division: "NumatREC", oppGoal: 3, salesGoal: 65000 },
  { year: 2026, month: 2, division: "Creo", oppGoal: 2, salesGoal: 53000 },
];

let opportunities = [];
let sales = [];
let targets = [];

let opportunitiesChart = null;
let salesByDivisionChart = null;
let salesByDivisionYtdChart = null;

// -------- Utilities --------

function loadData() {
  try {
    const ops = JSON.parse(localStorage.getItem(STORAGE_KEYS.opportunities));
    const s = JSON.parse(localStorage.getItem(STORAGE_KEYS.sales));
    const t = JSON.parse(localStorage.getItem(STORAGE_KEYS.targets));
    opportunities = Array.isArray(ops) ? ops : sampleOpportunities.slice();
    sales = Array.isArray(s) ? s : sampleSales.slice();
    targets = Array.isArray(t) ? t : sampleTargets.slice();
  } catch (e) {
    opportunities = sampleOpportunities.slice();
    sales = sampleSales.slice();
    targets = sampleTargets.slice();
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEYS.opportunities, JSON.stringify(opportunities));
  localStorage.setItem(STORAGE_KEYS.sales, JSON.stringify(sales));
  localStorage.setItem(STORAGE_KEYS.targets, JSON.stringify(targets));
}

function resetData() {
  opportunities = sampleOpportunities.slice();
  sales = sampleSales.slice();
  targets = sampleTargets.slice();
  saveData();
  renderTables();
  refreshDashboard();
  populateYearFilter();
}

function parseDate(str) {
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function formatCurrency(num) {
  if (isNaN(num)) return "$0";
  return "$" + num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

// -------- Tables rendering --------

function createInputCell(value, onChange) {
  const td = document.createElement("td");
  const input = document.createElement("input");
  input.type = "text";
  input.value = value ?? "";
  input.className = "table-input";
  input.addEventListener("change", () => onChange(input.value));
  td.appendChild(input);
  return td;
}

function createDeleteCell(onDelete) {
  const td = document.createElement("td");
  const btn = document.createElement("button");
  btn.textContent = "✕";
  btn.className = "delete-btn";
  btn.addEventListener("click", onDelete);
  td.appendChild(btn);
  return td;
}

function renderOpportunitiesTable() {
  const tbody = document.querySelector("#table-opportunities tbody");
  tbody.innerHTML = "";

  opportunities.forEach((opp, index) => {
    const tr = document.createElement("tr");
    tr.appendChild(createInputCell(opp.date, v => (opportunities[index].date = v)));
    tr.appendChild(createInputCell(opp.salesperson, v => (opportunities[index].salesperson = v)));
    tr.appendChild(createInputCell(opp.division, v => (opportunities[index].division = v)));
    tr.appendChild(createInputCell(opp.customer, v => (opportunities[index].customer = v)));
    tr.appendChild(createInputCell(opp.estimatedValue, v => (opportunities[index].estimatedValue = Number(v) || 0)));
    tr.appendChild(createInputCell(opp.stage, v => (opportunities[index].stage = v)));
    tr.appendChild(createInputCell(opp.outcome, v => (opportunities[index].outcome = v)));
    tr.appendChild(createInputCell(opp.closeDate, v => (opportunities[index].closeDate = v)));
    tr.appendChild(createDeleteCell(() => {
      opportunities.splice(index, 1);
      renderOpportunitiesTable();
      populateYearFilter();
    }));
    tbody.appendChild(tr);
  });
}

function renderSalesTable() {
  const tbody = document.querySelector("#table-sales tbody");
  tbody.innerHTML = "";

  sales.forEach((sItem, index) => {
    const tr = document.createElement("tr");
    tr.appendChild(createInputCell(sItem.invoiceDate, v => (sales[index].invoiceDate = v)));
    tr.appendChild(createInputCell(sItem.division, v => (sales[index].division = v)));
    tr.appendChild(createInputCell(sItem.customer, v => (sales[index].customer = v)));
    tr.appendChild(createInputCell(sItem.region, v => (sales[index].region = v)));
    tr.appendChild(createInputCell(sItem.amount, v => (sales[index].amount = Number(v) || 0)));
    tr.appendChild(createDeleteCell(() => {
      sales.splice(index, 1);
      renderSalesTable();
      populateYearFilter();
    }));
    tbody.appendChild(tr);
  });
}

function renderTargetsTable() {
  const tbody = document.querySelector("#table-targets tbody");
  tbody.innerHTML = "";

  targets.forEach((t, index) => {
    const tr = document.createElement("tr");
    tr.appendChild(createInputCell(t.year, v => (targets[index].year = Number(v) || 0)));
    tr.appendChild(createInputCell(t.month, v => (targets[index].month = Number(v) || 0)));
    tr.appendChild(createInputCell(t.division, v => (targets[index].division = v)));
    tr.appendChild(createInputCell(t.oppGoal, v => (targets[index].oppGoal = Number(v) || 0)));
    tr.appendChild(createInputCell(t.salesGoal, v => (targets[index].salesGoal = Number(v) || 0)));
    tr.appendChild(createDeleteCell(() => {
      targets.splice(index, 1);
      renderTargetsTable();
      populateYearFilter();
    }));
    tbody.appendChild(tr);
  });
}

function renderTables() {
  renderOpportunitiesTable();
  renderSalesTable();
  renderTargetsTable();
}

// -------- Dashboard calculations --------

function groupByMonthYear(items, dateKey, valueCallback) {
  const map = new Map(); // key: "YYYY-MM"
  items.forEach(item => {
    const d = parseDate(item[dateKey]);
    if (!d) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const current = map.get(key) || 0;
    map.set(key, current + (valueCallback ? valueCallback(item) : 1));
  });
  return map;
}

function getMonthLabels(allKeys) {
  const unique = Array.from(new Set(allKeys));
  unique.sort();
  return unique;
}

function getAvailableYears() {
  const years = new Set();
  sales.forEach(sItem => {
    const d = parseDate(sItem.invoiceDate);
    if (d) years.add(d.getFullYear());
  });
  opportunities.forEach(o => {
    const d = parseDate(o.date);
    if (d) years.add(d.getFullYear());
  });
  targets.forEach(t => {
    if (t.year) years.add(t.year);
  });
  if (years.size === 0) years.add(new Date().getFullYear());
  return Array.from(years).sort();
}

function getSelectedYear() {
  const select = document.getElementById("year-filter");
  const val = Number(select.value);
  return val || getAvailableYears().slice(-1)[0];
}

function populateYearFilter() {
  const select = document.getElementById("year-filter");
  const years = getAvailableYears();
  const current = getSelectedYear();

  select.innerHTML = "";
  years.forEach(y => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    select.appendChild(opt);
  });

  if (years.includes(current)) {
    select.value = current;
  } else {
    select.value = years.slice(-1)[0];
  }
}

function refreshDashboard() {
  const currentYear = getSelectedYear();

  // --- KPI calculations ---
  const salesYTD = sales
    .map(sItem => (parseDate(sItem.invoiceDate) ? { d: parseDate(sItem.invoiceDate), amount: Number(sItem.amount) || 0 } : null))
    .filter(Boolean)
    .filter(x => x.d.getFullYear() === currentYear)
    .reduce((sum, x) => sum + x.amount, 0);

  const oppWonYTD = opportunities
    .map(o => (parseDate(o.date) ? { d: parseDate(o.date), outcome: (o.outcome || "").toLowerCase() } : null))
    .filter(Boolean)
    .filter(x => x.d.getFullYear() === currentYear && x.outcome === "won")
    .length;

  const allDivTargets = targets.filter(t => t.year === currentYear && t.division === "All Divisions");
  const salesGoalYTD = allDivTargets.reduce((sum, t) => sum + (Number(t.salesGoal) || 0), 0);
  const oppGoalYTD = allDivTargets.reduce((sum, t) => sum + (Number(t.oppGoal) || 0), 0);

  const salesGoalPct = salesGoalYTD ? Math.round((salesYTD / salesGoalYTD) * 100) : 0;
  const oppGoalPct = oppGoalYTD ? Math.round((oppWonYTD / oppGoalYTD) * 100) : 0;

  document.getElementById("kpi-sales-ytd").textContent = formatCurrency(salesYTD);
  document.getElementById("kpi-opp-won-ytd").textContent = String(oppWonYTD);
  document.getElementById("kpi-sales-goal-ytd").textContent = salesGoalPct + "%";
  document.getElementById("kpi-opp-goal-ytd").textContent = oppGoalPct + "%";

  // --- Opportunities chart (Won vs Goal per month) ---
  const wonByMonth = groupByMonthYear(
    opportunities.filter(o => {
      const d = parseDate(o.date);
      return d && d.getFullYear() === currentYear && (o.outcome || "").toLowerCase() === "won";
    }),
    "date",
    () => 1
  );

  const oppGoalByMonth = new Map();
  targets
    .filter(t => t.year === currentYear && t.division === "All Divisions")
    .forEach(t => {
      const key = `${t.year}-${String(t.month).padStart(2, "0")}`;
      const current = oppGoalByMonth.get(key) || 0;
      oppGoalByMonth.set(key, current + (Number(t.oppGoal) || 0));
    });

  const monthKeys = getMonthLabels([...wonByMonth.keys(), ...oppGoalByMonth.keys()]);

  const labels = monthKeys.map(k => {
    const [y, m] = k.split("-");
    const monthIndex = Number(m) - 1;
    const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return shortMonths[monthIndex] + " " + y;
  });

  const wonData = monthKeys.map(k => wonByMonth.get(k) || 0);
  const goalData = monthKeys.map(k => oppGoalByMonth.get(k) || 0);

  const oppCtx = document.getElementById("opportunitiesChart").getContext("2d");
  if (opportunitiesChart) opportunitiesChart.destroy();
  opportunitiesChart = new Chart(oppCtx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Won Opportunities",
          data: wonData,
        },
        {
          label: "Opportunities Goal",
          data: goalData,
          type: "line",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#e5e7eb",
          },
        },
      },
      scales: {
        x: {
          ticks: { color: "#9ca3af" },
          grid: { color: "rgba(148,163,184,0.1)" },
        },
        y: {
          ticks: { color: "#9ca3af" },
          grid: { color: "rgba(148,163,184,0.1)" },
        },
      },
    },
  });

  // --- Sales by Division (stacked per month) ---
  const salesByMonthDivision = new Map();
  sales.forEach(sItem => {
    const d = parseDate(sItem.invoiceDate);
    if (!d || d.getFullYear() !== currentYear) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const div = sItem.division || "Other";
    const mapEntry = salesByMonthDivision.get(key) || {};
    mapEntry[div] = (mapEntry[div] || 0) + (Number(sItem.amount) || 0);
    salesByMonthDivision.set(key, mapEntry);
  });

  const salesMonthKeys = getMonthLabels([...salesByMonthDivision.keys()]);
  const salesLabels = salesMonthKeys.map(k => {
    const [y, m] = k.split("-");
    const monthIndex = Number(m) - 1;
    const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return shortMonths[monthIndex] + " " + y;
  });

  const divisionDatasets = DIVISIONS.map(division => {
    const data = salesMonthKeys.map(k => {
      const entry = salesByMonthDivision.get(k) || {};
      return entry[division] || 0;
    });
    return {
      label: division,
      data,
      stack: "stack1",
    };
  });

  const salesCtx = document.getElementById("salesByDivisionChart").getContext("2d");
  if (salesByDivisionChart) salesByDivisionChart.destroy();
  salesByDivisionChart = new Chart(salesCtx, {
    type: "bar",
    data: {
      labels: salesLabels,
      datasets: divisionDatasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#e5e7eb",
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: { color: "#9ca3af" },
          grid: { color: "rgba(148,163,184,0.1)" },
        },
        y: {
          stacked: true,
          ticks: { color: "#9ca3af" },
          grid: { color: "rgba(148,163,184,0.1)" },
        },
      },
    },
  });

  // --- YTD Sales by Division (bar) ---
  const ytdByDivision = {};
  sales.forEach(sItem => {
    const d = parseDate(sItem.invoiceDate);
    if (!d || d.getFullYear() !== currentYear) return;
    const div = sItem.division || "Other";
    ytdByDivision[div] = (ytdByDivision[div] || 0) + (Number(sItem.amount) || 0);
  });

  const ytdLabels = DIVISIONS.filter(d => (ytdByDivision[d] || 0) > 0);
  const ytdData = ytdLabels.map(d => ytdByDivision[d] || 0);

  const ytdCtx = document.getElementById("salesByDivisionYtdChart").getContext("2d");
  if (salesByDivisionYtdChart) salesByDivisionYtdChart.destroy();
  salesByDivisionYtdChart = new Chart(ytdCtx, {
    type: "bar",
    data: {
      labels: ytdLabels,
      datasets: [
        {
          label: "YTD Sales",
          data: ytdData,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#e5e7eb",
          },
        },
      },
      scales: {
        x: {
          ticks: { color: "#9ca3af" },
          grid: { color: "rgba(148,163,184,0.1)" },
        },
        y: {
          ticks: { color: "#9ca3af" },
          grid: { color: "rgba(148,163,184,0.1)" },
        },
      },
    },
  });
}

// -------- Event handlers & init --------

function addOpportunityRow() {
  opportunities.push({
    date: "",
    salesperson: "",
    division: "",
    customer: "",
    estimatedValue: 0,
    stage: "",
    outcome: "",
    closeDate: "",
  });
  renderOpportunitiesTable();
  populateYearFilter();
}

function addSalesRow() {
  sales.push({
    invoiceDate: "",
    division: "",
    customer: "",
    region: "",
    amount: 0,
  });
  renderSalesTable();
  populateYearFilter();
}

function addTargetRow() {
  const years = getAvailableYears();
  const defaultYear = years.slice(-1)[0] || new Date().getFullYear();
  targets.push({
    year: defaultYear,
    month: 1,
    division: "All Divisions",
    oppGoal: 0,
    salesGoal: 0,
  });
  renderTargetsTable();
  populateYearFilter();
}

function setupNav() {
  const dashboardTab = document.getElementById("tab-dashboard");
  const dataTab = document.getElementById("tab-data");
  const dashboardView = document.getElementById("view-dashboard");
  const dataView = document.getElementById("view-data");

  dashboardTab.addEventListener("click", () => {
    dashboardTab.classList.add("active");
    dataTab.classList.remove("active");
    dashboardView.classList.add("active");
    dataView.classList.remove("active");
    refreshDashboard();
  });

  dataTab.addEventListener("click", () => {
    dataTab.classList.add("active");
    dashboardTab.classList.remove("active");
    dataView.classList.add("active");
    dashboardView.classList.remove("active");
  });
}

function setupButtons() {
  document.getElementById("add-opportunity-row").addEventListener("click", addOpportunityRow);
  document.getElementById("add-sales-row").addEventListener("click", addSalesRow);
  document.getElementById("add-target-row").addEventListener("click", addTargetRow);

  document.getElementById("save-data").addEventListener("click", () => {
    saveData();
    refreshDashboard();
    populateYearFilter();
    alert("Data saved in this browser. Reload the page to confirm it persists.");
  });

  document.getElementById("reset-data").addEventListener("click", () => {
    if (confirm("Reset all data to the original sample set?")) {
      resetData();
    }
  });

  document.getElementById("year-filter").addEventListener("change", () => {
    refreshDashboard();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupNav();
  setupButtons();
  renderTables();
  populateYearFilter();
  refreshDashboard();
});
