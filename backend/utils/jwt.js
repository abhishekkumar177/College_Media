const jwt = require("jsonwebtoken");
const { jwtSecrets } = require("../config/secrets");

const getCurrentSecret = () => {
  return jwtSecrets.find((s) => s.active === true);
};

const signToken = (payload) => {
  const currentSecret = getCurrentSecret();

  return jwt.sign(payload, currentSecret.key, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    header: {
      kid: currentSecret.version, // key id for rotation
    },
  });
};

module.exports = { signToken };
