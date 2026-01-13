const jwt = require("jsonwebtoken");
const { jwtSecrets } = require("../config/secrets");

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Token missing" });
  }

  let decoded = null;

  for (const secret of jwtSecrets) {
    try {
      decoded = jwt.verify(token, secret.key);
      req.user = decoded;
      return next(); // success
    } catch (err) {
      // try next secret
    }
  }

  return res.status(401).json({
    success: false,
    message: "Invalid or expired token",
  });
};

module.exports = authenticate;
