/**
 * ============================================
 * Centralized Security Headers Configuration
 * ============================================
 * Helmet configuration extracted for:
 * - Clean server.js
 * - Easy maintenance
 * - Production-ready security
 */

module.exports = (ENV) => ({
  // Prevent clickjacking
  frameguard: { action: "deny" },

  // Disable MIME type sniffing
  noSniff: true,

  // Disable legacy XSS header (modern browsers handle this)
  xssFilter: false,

  // Hide X-Powered-By
  hidePoweredBy: true,

  // Referrer policy
  referrerPolicy: { policy: "no-referrer" },

  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: ENV === "production" ? [] : null,
    },
  },

  // Enable HSTS only in production
  hsts:
    ENV === "production"
      ? {
          maxAge: 15552000, // 180 days
          includeSubDomains: true,
          preload: true,
        }
      : false,
});
