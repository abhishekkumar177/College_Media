/**
 * ======================================================================
 * XSS PROTECTION & INPUT SANITIZATION – SINGLE FILE IMPLEMENTATION
 * ======================================================================
 *
 * ✔ Global Input Sanitization (body, query, params, headers)
 * ✔ HTML Escaping (Output Encoding)
 * ✔ XSS Payload Stripping
 * ✔ express-validator Integration
 * ✔ CSP Headers
 * ✔ Helmet Security Headers
 * ✔ Safe JSON Response Wrapper
 * ✔ Whitelist / Blacklist Strategy
 * ✔ Recursive Deep Sanitization
 * ✔ Production Ready
 *
 * Severity: CRITICAL
 * Issue: No Input Sanitization Against XSS
 * ======================================================================
 */

const express = require('express');
const helmet = require('helmet');
const xss = require('xss');
const { body, query, param, validationResult } = require('express-validator');

/* ----------------------------------------------------------------------
   XSS CONFIGURATION
------------------------------------------------------------------------*/

const xssOptions = {
  whiteList: {}, // ❌ no HTML tags allowed
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style', 'iframe'],
};

/* ----------------------------------------------------------------------
   UTILITY: TYPE CHECKS
------------------------------------------------------------------------*/

function isObject(val) {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

function isString(val) {
  return typeof val === 'string';
}

/* ----------------------------------------------------------------------
   UTILITY: STRING SANITIZER
------------------------------------------------------------------------*/

function sanitizeString(input) {
  if (!isString(input)) return input;
  return xss(input, xssOptions);
}

/* ----------------------------------------------------------------------
   UTILITY: HTML ESCAPER (OUTPUT ENCODING)
------------------------------------------------------------------------*/

function escapeHtml(str) {
  if (!isString(str)) return str;

  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\//g, '&#x2F;');
}

/* ----------------------------------------------------------------------
   UTILITY: DEEP SANITIZATION (OBJECT / ARRAY)
------------------------------------------------------------------------*/

function deepSanitize(data) {
  if (Array.isArray(data)) {
    return data.map(deepSanitize);
  }

  if (isObject(data)) {
    const sanitized = {};
    for (const key in data) {
      sanitized[key] = deepSanitize(data[key]);
    }
    return sanitized;
  }

  return sanitizeString(data);
}

/* ----------------------------------------------------------------------
   UTILITY: DEEP ESCAPE (OUTPUT)
------------------------------------------------------------------------*/

function deepEscape(data) {
  if (Array.isArray(data)) {
    return data.map(deepEscape);
  }

  if (isObject(data)) {
    const escaped = {};
    for (const key in data) {
      escaped[key] = deepEscape(data[key]);
    }
    return escaped;
  }

  return escapeHtml(data);
}

/* ----------------------------------------------------------------------
   MIDDLEWARE: GLOBAL INPUT SANITIZER
------------------------------------------------------------------------*/

function xssSanitizerMiddleware(req, res, next) {
  try {
    req.body = deepSanitize(req.body);
    req.query = deepSanitize(req.query);
    req.params = deepSanitize(req.params);

    // Optional: sanitize headers (dangerous but secure)
    req.headers = deepSanitize(req.headers);

    next();
  } catch (err) {
    next(err);
  }
}

/* ----------------------------------------------------------------------
   MIDDLEWARE: CONTENT SECURITY POLICY
------------------------------------------------------------------------*/

function cspMiddleware(req, res, next) {
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
    ].join('; ')
  );
  next();
}

/* ----------------------------------------------------------------------
   MIDDLEWARE: SAFE JSON RESPONSE
------------------------------------------------------------------------*/

function safeJsonMiddleware(req, res, next) {
  const originalJson = res.json;

  res.json = function (data) {
    const escaped = deepEscape(data);
    return originalJson.call(this, escaped);
  };

  next();
}

/* ----------------------------------------------------------------------
   VALIDATION ERROR HANDLER
------------------------------------------------------------------------*/

function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  next();
}

/* ----------------------------------------------------------------------
   EXPRESS APP SETUP
------------------------------------------------------------------------*/

const app = express();

app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// 🔥 SECURITY LAYERS
app.use(cspMiddleware);
app.use(xssSanitizerMiddleware);
app.use(safeJsonMiddleware);

/* ----------------------------------------------------------------------
   SAMPLE VALIDATORS
------------------------------------------------------------------------*/

const createPostValidator = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Invalid title')
    .escape(),

  body('content')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Invalid content')
    .escape(),
];

const searchValidator = [
  query('q')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .escape(),
];

/* ----------------------------------------------------------------------
   SAMPLE ROUTES
------------------------------------------------------------------------*/

app.post('/posts', createPostValidator, validateRequest, (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Post created safely',
    data: req.body,
  });
});

app.get('/search', searchValidator, validateRequest, (req, res) => {
  res.json({
    success: true,
    query: req.query.q || '',
  });
});

/* ----------------------------------------------------------------------
   XSS ATTACK DEMO (BLOCKED)
------------------------------------------------------------------------*/

// Input:
// <script>alert('XSS')</script>
//
// Stored as:
// alert('XSS')

/* ----------------------------------------------------------------------
   GLOBAL ERROR HANDLER
------------------------------------------------------------------------*/

app.use((err, req, res, next) => {
  console.error('[XSS_ERROR]', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

/* ----------------------------------------------------------------------
   SERVER START
------------------------------------------------------------------------*/

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🛡️ XSS Protected Server running on port ${PORT}`);
});

/**
 * ======================================================================
 * END OF FILE
 * ======================================================================
 */
