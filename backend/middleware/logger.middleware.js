module.exports = (req, res, next) => {
  console.log(`[LOGGER] ${req.method} ${req.originalUrl}`);
  next(); // ❗ MUST
};
