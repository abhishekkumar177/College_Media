const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false });
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const user = await User.findById(decoded.userId);

  if (
    user.passwordChangedAt &&
    decoded.iat * 1000 < user.passwordChangedAt.getTime()
  ) {
    return res.status(401).json({ success: false });
  }

  req.user = { id: user._id, role: user.role };
  next();
};
