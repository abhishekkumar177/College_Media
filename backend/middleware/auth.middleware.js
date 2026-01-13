module.exports = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Token missing",
    });
  }

  // fake verify for now
  req.user = { id: "123", role: "user" };

  next(); // ❗ VERY IMPORTANT
};
