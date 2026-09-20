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
  customersValue: document.getElementById("customers-value"),
};

function formatCurrency(amount) {
  return `${state.currency}${Math.round(amount).toLocaleString()}`;
}

function calculateCustomers() {
  if (!state.avgOrderValue) return 0;
  return state.totalRevenue / state.avgOrderValue;
}

function render() {
  const customers = calculateCustomers();
  els.customersValue.textContent = Math.round(customers).toLocaleString();
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
}

function init() {
  els.totalRevenue.value = state.totalRevenue;
  els.avgOrderValue.value = state.avgOrderValue;
  setDefaultDates();
  bindInputs();
  render();
}

init();
