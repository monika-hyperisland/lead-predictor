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

function formatCurrency(amount) {
  return `${state.currency}${Math.round(amount).toLocaleString()}`;
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
  valueEl.textContent = Math.round(value).toLocaleString();
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
  render();
}

init();
