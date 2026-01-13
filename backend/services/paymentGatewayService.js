const apiManager = require("../utils/externalApiManager");

apiManager.registerService("payment", {
  retries: 4,
  timeout: 4000,
  fallback: () => ({ status: "pending" }),
});

const chargeUser = (payload) =>
  apiManager.callService("payment", {
    method: "POST",
    url: "https://httpstat.us/200",
    data: payload,
  });

module.exports = { chargeUser };
