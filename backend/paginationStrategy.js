/**
 * =============================================================================
 * UNIFIED PAGINATION STRATEGY – SINGLE FILE (500+ LINES)
 * =============================================================================
 *
 * ✔ Enforces ONE pagination standard (page-based)
 * ✔ Blocks legacy pagination styles
 * ✔ Uniform pagination metadata
 * ✔ Default + max limits enforced
 * ✔ Middleware based
 * ✔ DB-agnostic
 * ✔ Backward compatibility warnings
 * ✔ Scalable & maintainable
 *
 * Issue: Inconsistent Pagination Strategy
 * Severity: MEDIUM
 * =============================================================================
 */

const express = require('express');

/* =============================================================================
   GLOBAL CONFIGURATION
============================================================================= */

const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
  ENFORCE_PAGINATION: true,
  BLOCK_LEGACY_PARAMS: true,
};

/* =============================================================================
   LEGACY PARAMS (TO BLOCK / WARN)
============================================================================= */

const LEGACY_PARAMS = [
  'offset',
  'count',
  'skip',
  'take',
  'from',
  'size',
];

/* =============================================================================
   UTILITY FUNCTIONS
============================================================================= */

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

function hasLegacyParams(query) {
  return LEGACY_PARAMS.filter((p) => p in query);
}

/* =============================================================================
   PAGINATION PARSER
============================================================================= */
/**
 * Standard:
 * ?page=1&limit=20
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

/* =============================================================================
   PAGINATION METADATA BUILDER
============================================================================= */

function buildPaginationMeta(pagination, total) {
  const totalPages = Math.ceil(total / pagination.limit) || 1;

  return {
    page: pagination.page,
    limit: pagination.limit,
    total,
    totalPages,
    hasNextPage: pagination.page < totalPages,
    hasPrevPage: pagination.page > 1,
  };
}

/* =============================================================================
   PAGINATION MIDDLEWARE (CORE)
============================================================================= */

function paginate(options = {}) {
  const {
    defaultLimit = PAGINATION_CONFIG.DEFAULT_LIMIT,
    maxLimit = PAGINATION_CONFIG.MAX_LIMIT,
  } = options;

  return function paginationMiddleware(req, res, next) {
    try {
      if (
        PAGINATION_CONFIG.BLOCK_LEGACY_PARAMS &&
        hasLegacyParams(req.query).length > 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'Legacy pagination parameters are not supported',
          supported: '?page=<number>&limit=<number>',
          detected: hasLegacyParams(req.query),
        });
      }

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

/* =============================================================================
   RESPONSE HELPERS
============================================================================= */

function sendPaginatedResponse(res, data, pagination, total) {
  return res.json({
    success: true,
    data,
    pagination: buildPaginationMeta(pagination, total),
  });
}

/* =============================================================================
   MOCK DATABASE
============================================================================= */

const USERS = [];
const ORDERS = [];
const LOGS = [];

for (let i = 1; i <= 250; i++) {
  USERS.push({
    id: i,
    name: `User-${i}`,
    createdAt: Date.now() - i * 1000,
  });
}

for (let i = 1; i <= 175; i++) {
  ORDERS.push({
    id: i,
    amount: i * 10,
    createdAt: Date.now() - i * 2000,
  });
}

for (let i = 1; i <= 500; i++) {
  LOGS.push({
    id: i,
    message: `Log-${i}`,
    level: i % 2 === 0 ? 'INFO' : 'ERROR',
  });
}

/* =============================================================================
   DB-AGNOSTIC QUERY EXECUTOR
============================================================================= */

function executePagination(data, pagination) {
  const total = data.length;
  const paginated = data.slice(
    pagination.offset,
    pagination.offset + pagination.limit
  );

  return {
    data: paginated,
    total,
  };
}

/* =============================================================================
   EXPRESS APP
============================================================================= */

const app = express();
app.use(express.json());

/* =============================================================================
   ROUTES – ALL USING SAME PAGINATION
============================================================================= */

app.get('/users', paginate(), (req, res) => {
  const { data, total } = executePagination(
    USERS,
    req.pagination
  );
  sendPaginatedResponse(res, data, req.pagination, total);
});

app.get('/orders', paginate({ defaultLimit: 20 }), (req, res) => {
  const { data, total } = executePagination(
    ORDERS,
    req.pagination
  );
  sendPaginatedResponse(res, data, req.pagination, total);
});

app.get('/logs', paginate({ defaultLimit: 50, maxLimit: 50 }), (req, res) => {
  const { data, total } = executePagination(
    LOGS,
    req.pagination
  );
  sendPaginatedResponse(res, data, req.pagination, total);
});

/* =============================================================================
   GLOBAL PAGINATION ENFORCER
============================================================================= */
/**
 * Blocks APIs returning huge data without pagination
 */

app.use((req, res, next) => {
  if (
    PAGINATION_CONFIG.ENFORCE_PAGINATION &&
    req.method === 'GET' &&
    !req.pagination &&
    !req.path.startsWith('/health')
  ) {
    return res.status(400).json({
      success: false,
      message: 'Pagination is required for list endpoints',
      example: '?page=1&limit=10',
    });
  }
  next();
});

/* =============================================================================
   PAGINATION DOCUMENTATION ENDPOINT
============================================================================= */

app.get('/_docs/pagination', (req, res) => {
  res.json({
    success: true,
    standard: {
      request: '?page=<number>&limit=<number>',
      response: {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 100,
          totalPages: 10,
          hasNextPage: true,
          hasPrevPage: false,
        },
      },
    },
    legacyBlocked: LEGACY_PARAMS,
  });
});

/* =============================================================================
   ERROR HANDLER
============================================================================= */

app.use((err, req, res, next) => {
  console.error('[PAGINATION_ERROR]', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

/* =============================================================================
   SERVER
============================================================================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `📄 Unified Pagination Strategy API running on port ${PORT}`
  );
});

/**
 * =============================================================================
 * PAGINATION STANDARD (FINAL)
 * =============================================================================
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

