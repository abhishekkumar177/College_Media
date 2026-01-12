/**
 * Prevent API freezing due to long-running requests
 * Adds a timeout for every request
 */

const requestTimeout = (timeout = 10000) => {
  return (req, res, next) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          error: {
            code: "REQUEST_TIMEOUT",
            message: "Request took too long to process",
          },
        });
      }
    }, timeout);

    // Clear timeout once response is finished
    res.on("finish", () => clearTimeout(timer));
    res.on("close", () => clearTimeout(timer));

    next();
  };
};

module.exports = requestTimeout;
