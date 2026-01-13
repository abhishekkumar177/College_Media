/**
 * ============================================
 * External API Controller (Demo)
 * ============================================
 */

const {
  fetchExternalStatus,
} = require("../services/externalApiService");

const checkExternalService = async (req, res, next) => {
  try {
    const result = await fetchExternalStatus();

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  checkExternalService,
};
