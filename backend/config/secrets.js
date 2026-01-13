/**
 * Centralized Secrets Manager
 * Supports secret rotation without downtime
 */

const loadJwtSecrets = () => {
  const secrets = [];

  if (process.env.JWT_SECRET_CURRENT) {
    secrets.push({
      key: process.env.JWT_SECRET_CURRENT,
      version: process.env.JWT_SECRET_VERSION || "current",
      active: true,
    });
  }

  if (process.env.JWT_SECRET_PREVIOUS) {
    secrets.push({
      key: process.env.JWT_SECRET_PREVIOUS,
      version: "previous",
      active: false,
    });
  }

  if (secrets.length === 0) {
    throw new Error("❌ No JWT secrets configured");
  }

  return secrets;
};

module.exports = {
  jwtSecrets: loadJwtSecrets(),
};
