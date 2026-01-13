const safeApiCall = require("../utils/apiClient");

exports.getExternalPosts = async (req, res, next) => {
  try {
    const data = await safeApiCall({
      method: "GET",
      url: "https://jsonplaceholder.typicode.com/posts",
      fallback: {
        success: true,
        data: [],
        message: "External service unavailable, showing fallback data",
      },
    });

    return res.status(200).json({
      success: true,
      source: "external-api",
      count: Array.isArray(data?.data) ? data.data.length : 0,
      data: data?.data ?? data,
    });
  } catch (err) {
    // loud failure (should rarely hit because safeApiCall handles fallback)
    err.status = 502;
    err.message = "Failed to fetch external posts";
    next(err);
  }
};
