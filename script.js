// Lead Predictor - application state and input wiring

const state = {
  currency: "$",
  campaignStart: null,
  campaignEnd: null,
  totalRevenue: 10000,
  avgOrderValue: 1000,
  leadResponseRate: 40,
  prospectResponseRate: 20,
};

const els = {
  currency: document.getElementById("currency"),
  campaignStart: document.getElementById("campaign-start"),
  campaignEnd: document.getElementById("campaign-end"),
  totalRevenue: document.getElementById("total-revenue"),
  avgOrderValue: document.getElementById("avg-order-value"),
  leadResponseRate: document.getElementById("lead-response-rate"),
  prospectResponseRate: document.getElementById("prospect-response-rate"),
  leadResponseRateValue: document.getElementById("lead-response-rate-value"),
  prospectResponseRateValue: document.getElementById("prospect-response-rate-value"),
  prospectsValue: document.getElementById("prospects-value"),
  prospectsPercent: document.getElementById("prospects-percent"),
  prospectsBar: document.getElementById("prospects-bar"),
  leadsValue: document.getElementById("leads-value"),
  leadsPercent: document.getElementById("leads-percent"),
  leadsBar: document.getElementById("leads-bar"),
  customersValue: document.getElementById("customers-value"),
  customersPercent: document.getElementById("customers-percent"),
  customersBar: document.getElementById("customers-bar"),
};

const CURRENCY_CODES = {
  $: "USD",
  "\u20ac": "EUR",
};

function formatCurrency(amount) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: CURRENCY_CODES[state.currency],
  }).format(amount);
}

// Formula 01: Customers = Total Revenue / Average Order Value
function calculateCustomers() {
  if (!state.avgOrderValue) return 0;
  return state.totalRevenue / state.avgOrderValue;
}

// Formula 02: Leads = Customers * 100 / Lead Response Rate
function calculateLeads(customers) {
  if (!state.leadResponseRate) return 0;
  return (customers * 100) / state.leadResponseRate;
}

// Formula 03: Prospects = Leads * 100 / Prospect Response Rate
function calculateProspects(leads) {
  if (!state.prospectResponseRate) return 0;
  return (leads * 100) / state.prospectResponseRate;
}

function updateSummaryCard(valueEl, percentEl, barEl, value, percent) {
  valueEl.textContent = formatCurrency(value);
  percentEl.textContent = `${percent.toFixed(0)}%`;
  barEl.style.width = `${Math.min(percent, 100)}%`;
}

function render() {
  const customers = calculateCustomers();
  const leads = calculateLeads(customers);
  const prospects = calculateProspects(leads);

  updateSummaryCard(els.prospectsValue, els.prospectsPercent, els.prospectsBar, prospects, 100);
  updateSummaryCard(
    els.leadsValue,
    els.leadsPercent,
    els.leadsBar,
    leads,
    prospects ? (leads / prospects) * 100 : 0
  );
  updateSummaryCard(
    els.customersValue,
    els.customersPercent,
    els.customersBar,
    customers,
    prospects ? (customers / prospects) * 100 : 0
  );

  drawChart(buildMonthlyData(prospects, leads, customers));
}

const chart = {
  canvas: document.getElementById("funnel-chart"),
  tooltip: document.getElementById("chart-tooltip"),
  bars: [],
};
chart.ctx = chart.canvas.getContext("2d");

function monthsBetween(startStr, endStr) {
  if (!startStr || !endStr) return 6;
  const start = new Date(startStr);
  const end = new Date(endStr);
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(1, months);
}

// Builds a cumulative ramp of totals per month, ending at the final target values
function buildMonthlyData(prospects, leads, customers) {
  const monthCount = monthsBetween(state.campaignStart, state.campaignEnd);
  const data = [];
  for (let m = 1; m <= monthCount; m++) {
    const progress = m / monthCount;
    data.push({
      month: m,
      prospects: prospects * progress,
      leads: leads * progress,
      customers: customers * progress,
    });
  }
  return data;
}

function resizeCanvas() {
  const rect = chart.canvas.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  chart.canvas.width = rect.width * dpr;
  chart.canvas.height = rect.height * dpr;
  chart.canvas.style.width = `${rect.width}px`;
  chart.canvas.style.height = `${rect.height}px`;
  chart.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawChart(data) {
  resizeCanvas();
  const ctx = chart.ctx;
  const width = chart.canvas.clientWidth;
  const height = chart.canvas.clientHeight;
  ctx.clearRect(0, 0, width, height);

  const maxValue = Math.max(1, ...data.map((d) => d.prospects));
  const padding = { top: 20, right: 20, bottom: 30, left: 20 };
  const plotHeight = height - padding.top - padding.bottom;
  const plotWidth = width - padding.left - padding.right;
  const gap = 12;
  const barWidth = plotWidth / data.length - gap;

  chart.bars = data.map((d, i) => {
    const x = padding.left + i * (barWidth + gap);
    const prospectsH = (d.prospects / maxValue) * plotHeight;
    const leadsH = (d.leads / maxValue) * plotHeight;
    const customersH = (d.customers / maxValue) * plotHeight;
    const baseY = padding.top + plotHeight;

    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue("--bar-prospects")
      .trim();
    ctx.fillRect(x, baseY - prospectsH, barWidth, prospectsH);

    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue("--bar-leads")
      .trim();
    ctx.fillRect(x, baseY - leadsH, barWidth, leadsH);

    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue("--bar-customers")
      .trim();
    ctx.fillRect(x, baseY - customersH, barWidth, customersH);

    ctx.fillStyle = "#8b96ab";
    ctx.font = "11px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText(`M${d.month}`, x + barWidth / 2, height - 8);

    return { x, y: padding.top, width: barWidth, height: plotHeight, data: d };
  });
}

function bindChartTooltip() {
  chart.canvas.addEventListener("mousemove", (e) => {
    const rect = chart.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const bar = chart.bars.find(
      (b) => mx >= b.x && mx <= b.x + b.width && my >= b.y && my <= b.y + b.height
    );

    if (!bar) {
      chart.tooltip.classList.add("hidden");
      return;
    }

    chart.tooltip.innerHTML =
      `Month #${bar.data.month}<br>` +
      `Prospects: ${Math.round(bar.data.prospects).toLocaleString()}<br>` +
      `Leads: ${Math.round(bar.data.leads).toLocaleString()}<br>` +
      `Customers: ${Math.round(bar.data.customers).toLocaleString()}`;
    chart.tooltip.style.left = `${e.clientX - rect.left + 12}px`;
    chart.tooltip.style.top = `${e.clientY - rect.top + 12}px`;
    chart.tooltip.classList.remove("hidden");
  });

  chart.canvas.addEventListener("mouseleave", () => {
    chart.tooltip.classList.add("hidden");
  });

  window.addEventListener("resize", () => render());
}

function setDefaultDates() {
  const start = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + 6);

  state.campaignStart = start.toISOString().slice(0, 10);
  state.campaignEnd = end.toISOString().slice(0, 10);

  els.campaignStart.value = state.campaignStart;
  els.campaignEnd.value = state.campaignEnd;
}

function bindInputs() {
  els.currency.addEventListener("change", (e) => {
    state.currency = e.target.value;
    render();
  });

  els.campaignStart.addEventListener("change", (e) => {
    state.campaignStart = e.target.value;
    render();
  });

  els.campaignEnd.addEventListener("change", (e) => {
    state.campaignEnd = e.target.value;
    render();
  });

  els.totalRevenue.addEventListener("input", (e) => {
    state.totalRevenue = Number(e.target.value) || 0;
    render();
  });

  els.avgOrderValue.addEventListener("input", (e) => {
    state.avgOrderValue = Number(e.target.value) || 0;
    render();
  });

  els.leadResponseRate.addEventListener("input", (e) => {
    state.leadResponseRate = Number(e.target.value) || 0;
    els.leadResponseRateValue.textContent = `${state.leadResponseRate.toFixed(2)}%`;
    render();
  });

  els.prospectResponseRate.addEventListener("input", (e) => {
    state.prospectResponseRate = Number(e.target.value) || 0;
    els.prospectResponseRateValue.textContent = `${state.prospectResponseRate.toFixed(2)}%`;
    render();
  });
}

function init() {
  els.totalRevenue.value = state.totalRevenue;
  els.avgOrderValue.value = state.avgOrderValue;
  els.leadResponseRate.value = state.leadResponseRate;
  els.prospectResponseRate.value = state.prospectResponseRate;
  els.leadResponseRateValue.textContent = `${state.leadResponseRate.toFixed(2)}%`;
  els.prospectResponseRateValue.textContent = `${state.prospectResponseRate.toFixed(2)}%`;
  setDefaultDates();
  bindInputs();
  bindChartTooltip();
  render();
}

init();
