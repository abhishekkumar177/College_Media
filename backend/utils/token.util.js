const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/RefreshToken");

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  });
};

const generateRefreshToken = async (userId) => {
  const refreshToken = jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    }
  );

  const expires = new Date();
  expires.setDate(expires.getDate() + 7);

  await RefreshToken.create({
    userId,
    token: refreshToken,
    expiresAt: expires,
  });

  return refreshToken;
};

const verifyRefreshToken = async (token) => {
  const storedToken = await RefreshToken.findOne({ token });

  if (!storedToken || storedToken.revoked) {
    throw new Error("Refresh token invalid or revoked");
  }

  if (storedToken.expiresAt < new Date()) {
    throw new Error("Refresh token expired");
  }

  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
};
