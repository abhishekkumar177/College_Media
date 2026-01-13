/**
 * ============================================
 * External API Service (Demo / Future-Ready)
 * ============================================
 */

const httpClient = require("../utils/httpClient");
const logger = require("../utils/logger");

/**
 * Example: Fetch external service status
 * (Simulates payment / notification / media API)
 */
const fetchExternalStatus = async () => {
  return httpClient.safeRequest(
    {
      method: "GET",
      url: "https://httpstat.us/200",
      timeout: 3000,
      retries: 2,
    },
    {
      status: "degraded",
      message: "External service unavailable",
    }
  );
};

/**
 * Example: Create external resource
 */
const createExternalResource = async (payload) => {
  return httpClient.request({
    method: "POST",
    url: "https://httpstat.us/201",
    data: payload,
    timeout: 4000,
    retries: 3,
  });
};

module.exports = {
  fetchExternalStatus,
  createExternalResource,
};
