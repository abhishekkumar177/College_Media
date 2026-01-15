/**
 * ============================================================================
 * STANDARDIZED PAGINATION STRATEGY – SINGLE FILE IMPLEMENTATION
 * ============================================================================
 *
 * ✔ Single pagination style (page-based)
 * ✔ Enforced defaults & limits
 * ✔ Uniform response metadata
 * ✔ Middleware-based enforcement
 * ✔ DB-agnostic (works with arrays / Mongo / SQL)
 * ✔ Performance safe (no unpaginated responses)
 *
 * Issue: Inconsistent Pagination Strategy
 * Severity: MEDIUM
 * ============================================================================
 */

const express = require('express');

/* ============================================================================
   GLOBAL PAGINATION CONFIG
============================================================================ */

const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
};

/* ============================================================================
   UTILITY HELPERS
============================================================================ */

function toInt(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function isObject(val) {
  return val !== null && typeof val === 'object';
}

/* ============================================================================
   PAGINATION PARSER
============================================================================ */
/**
 * Supported query:
 * ?page=1&limit=20
 *
 * Rejected / ignored:
 * offset, skip, take, count (legacy styles)
 */

function parsePagination(query) {
  const page = clamp(
    toInt(query.page, PAGINATION_CONFIG.DEFAULT_PAGE),
    1,
    Number.MAX_SAFE_INTEGER
  );

  const limit = clamp(
    toInt(query.limit, PAGINATION_CONFIG.DEFAULT_LIMIT),
    PAGINATION_CONFIG.MIN_LIMIT,
    PAGINATION_CONFIG.MAX_LIMIT
  );

  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset,
  };
}

/* ============================================================================
   PAGINATION RESPONSE BUILDER
============================================================================ */

function buildPaginationMeta({ page, limit }, total) {
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/* ============================================================================
   PAGINATION MIDDLEWARE (CORE FIX)
============================================================================ */
/**
 * Usage:
 * app.get('/users', paginate(), controller)
 */

function paginate(options = {}) {
  const {
    defaultLimit = PAGINATION_CONFIG.DEFAULT_LIMIT,
    maxLimit = PAGINATION_CONFIG.MAX_LIMIT,
  } = options;

  return function paginationMiddleware(req, res, next) {
    try {
      const page = clamp(
        toInt(req.query.page, PAGINATION_CONFIG.DEFAULT_PAGE),
        1,
        Number.MAX_SAFE_INTEGER
      );

      const limit = clamp(
        toInt(req.query.limit, defaultLimit),
        PAGINATION_CONFIG.MIN_LIMIT,
        maxLimit
      );

      const offset = (page - 1) * limit;

      // Attach standardized pagination object
      req.pagination = {
        page,
        limit,
        offset,
      };

      next();
    } catch (err) {
      next(err);
    }
  };
}

/* ============================================================================
   SAFE PAGINATED RESPONSE WRAPPER
============================================================================ */
/**
 * Ensures consistent response structure across APIs
 */

function sendPaginatedResponse(res, data, pagination, total) {
  return res.json({
    success: true,
    data,
    pagination: buildPaginationMeta(pagination, total),
  });
}

/* ============================================================================
   DEMO EXPRESS APP
============================================================================ */

const app = express();
app.use(express.json());

/* ============================================================================
   MOCK DATA SOURCE (SIMULATES DB)
============================================================================ */

const USERS = [];
for (let i = 1; i <= 137; i++) {
  USERS.push({
    id: i,
    name: `User-${i}`,
    createdAt: Date.now() - i * 1000,
  });
}

/* ============================================================================
   MOCK QUERY EXECUTOR
============================================================================ */
/**
 * This simulates how pagination would work with DB queries.
 * Replace slice logic with:
 * - Mongo: .skip(offset).limit(limit)
 * - SQL: LIMIT limit OFFSET offset
 */

function queryWithPagination(data, pagination) {
  const total = data.length;
  const paginatedData = data.slice(
    pagination.offset,
    pagination.offset + pagination.limit
  );

  return { data: paginatedData, total };
}

/* ============================================================================
   ROUTES USING STANDARD PAGINATION
============================================================================ */

/**
 * GET /users?page=1&limit=20
 */
app.get('/users', paginate(), (req, res) => {
  const { data, total } = queryWithPagination(
    USERS,
    req.pagination
  );

  return sendPaginatedResponse(
    res,
    data,
    req.pagination,
    total
  );
});

/* ============================================================================
   ANOTHER EXAMPLE ENDPOINT
============================================================================ */

app.get('/admins', paginate({ defaultLimit: 5 }), (req, res) => {
  const admins = USERS.filter((u) => u.id % 5 === 0);

  const { data, total } = queryWithPagination(
    admins,
    req.pagination
  );

  return sendPaginatedResponse(
    res,
    data,
    req.pagination,
    total
  );
});

/* ============================================================================
   LEGACY PARAM GUARD (OPTIONAL HARDENING)
============================================================================ */
/**
 * Warns or blocks legacy pagination styles
 */

app.use((req, res, next) => {
  const legacyParams = ['offset', 'skip', 'take', 'count'];

  const usedLegacy = legacyParams.filter(
    (p) => p in req.query
  );

  if (usedLegacy.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Unsupported pagination parameters used',
      supported: '?page=<number>&limit=<number>',
      detected: usedLegacy,
    });
  }

  next();
});

/* ============================================================================
   ERROR HANDLER
============================================================================ */

app.use((err, req, res, next) => {
  console.error('[PAGINATION_ERROR]', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

/* ============================================================================
   SERVER
============================================================================ */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `📄 Standardized Pagination API running on port ${PORT}`
  );
});

/**
 * ============================================================================
 * PAGINATION STANDARD (DOCUMENTATION SNIPPET)
 * ============================================================================
 *
 * Request:
 *   GET /resource?page=1&limit=20
 *
 * Response:
 * {
 *   "success": true,
 *   "data": [],
 *   "pagination": {
 *     "page": 1,
 *     "limit": 20,
 *     "total": 200,
 *     "totalPages": 10,
 *     "hasNextPage": true,
 *     "hasPrevPage": false
 *   }
 * }
 *
 * ============================================================================
 * END OF FILE
 * ============================================================================
 */
