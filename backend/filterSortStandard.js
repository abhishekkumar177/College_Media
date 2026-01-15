/**
 * ============================================================================
 * STANDARDIZED FILTERING & SORTING – SINGLE FILE IMPLEMENTATION
 * ============================================================================
 *
 * ✔ Unified filtering syntax
 * ✔ Unified sorting syntax
 * ✔ Pagination enforcement
 * ✔ Whitelist-based fields
 * ✔ Reusable middleware
 * ✔ Query validation & normalization
 * ✔ Consistent API behavior
 *
 * Issue: Missing Filtering & Sorting Standards
 * Severity: MEDIUM
 * ============================================================================
 */

const express = require('express');

/* ============================================================================
   CONFIGURATION
============================================================================ */

/**
 * Global standards (can be moved to env/config later)
 */
const GLOBAL_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
  DEFAULT_SORT: '-createdAt',
};

/**
 * Allowed operators for filtering
 */
const FILTER_OPERATORS = {
  eq: '$eq',
  ne: '$ne',
  gt: '$gt',
  gte: '$gte',
  lt: '$lt',
  lte: '$lte',
  in: '$in',
  regex: '$regex',
};

/* ============================================================================
   UTILITY HELPERS
============================================================================ */

function isObject(val) {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

function toNumber(value, fallback) {
  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
}

/* ============================================================================
   FILTER PARSER
============================================================================ */
/**
 * Supported syntax:
 * ?filter[name]=john
 * ?filter[price][gte]=100
 * ?filter[status][in]=active,pending
 */

function parseFilters(query, allowedFields = []) {
  const filters = {};

  if (!query.filter || !isObject(query.filter)) {
    return filters;
  }

  for (const field in query.filter) {
    if (!allowedFields.includes(field)) continue;

    const value = query.filter[field];

    // Simple equality
    if (!isObject(value)) {
      filters[field] = value;
      continue;
    }

    // Operator-based filtering
    for (const operator in value) {
      if (!FILTER_OPERATORS[operator]) continue;

      let parsedValue = value[operator];

      if (operator === 'in') {
        parsedValue = parsedValue.split(',');
      }

      filters[field] = {
        ...(filters[field] || {}),
        [FILTER_OPERATORS[operator]]: parsedValue,
      };
    }
  }

  return filters;
}

/* ============================================================================
   SORT PARSER
============================================================================ */
/**
 * Supported syntax:
 * ?sort=name
 * ?sort=-createdAt
 * ?sort=name,-price
 */

function parseSort(sortQuery, allowedFields = []) {
  if (!sortQuery) return GLOBAL_DEFAULTS.DEFAULT_SORT;

  const sortFields = sortQuery.split(',');
  const sortObject = {};

  sortFields.forEach((field) => {
    let order = 1;
    let fieldName = field;

    if (field.startsWith('-')) {
      order = -1;
      fieldName = field.substring(1);
    }

    if (allowedFields.includes(fieldName)) {
      sortObject[fieldName] = order;
    }
  });

  return Object.keys(sortObject).length
    ? sortObject
    : GLOBAL_DEFAULTS.DEFAULT_SORT;
}

/* ============================================================================
   PAGINATION PARSER
============================================================================ */
/**
 * Supported syntax:
 * ?page=1&limit=20
 */

function parsePagination(query) {
  const page = Math.max(
    1,
    toNumber(query.page, GLOBAL_DEFAULTS.PAGE)
  );

  const limit = Math.min(
    GLOBAL_DEFAULTS.MAX_LIMIT,
    toNumber(query.limit, GLOBAL_DEFAULTS.LIMIT)
  );

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/* ============================================================================
   MAIN MIDDLEWARE FACTORY
============================================================================ */
/**
 * Usage:
 * app.get('/users', standardQuery({
 *   filterable: ['name', 'email', 'role'],
 *   sortable: ['name', 'createdAt'],
 * }))
 */

function standardQuery(options = {}) {
  const {
    filterable = [],
    sortable = [],
    defaultSort = GLOBAL_DEFAULTS.DEFAULT_SORT,
  } = options;

  return function (req, res, next) {
    try {
      // FILTER
      const filters = parseFilters(req.query, filterable);

      // SORT
      const sort =
        parseSort(req.query.sort, sortable) || defaultSort;

      // PAGINATION
      const pagination = parsePagination(req.query);

      // Attach standardized query object
      req.standardQuery = {
        filters,
        sort,
        pagination,
      };

      next();
    } catch (err) {
      next(err);
    }
  };
}

/* ============================================================================
   DEMO EXPRESS APP (FOR TESTING / PR DEMO)
============================================================================ */

const app = express();

/* --------------------------------------------------------------------------
   MOCK DATA SOURCE (Replace with DB / Mongoose)
--------------------------------------------------------------------------- */

const USERS = [
  { id: 1, name: 'Ayaan', role: 'admin', createdAt: 10 },
  { id: 2, name: 'Rohit', role: 'user', createdAt: 20 },
  { id: 3, name: 'Zara', role: 'user', createdAt: 30 },
  { id: 4, name: 'Neha', role: 'moderator', createdAt: 40 },
];

/* --------------------------------------------------------------------------
   MOCK QUERY EXECUTOR (Simulates DB)
--------------------------------------------------------------------------- */

function executeQuery(data, query) {
  let result = [...data];

  // Apply filters
  for (const field in query.filters) {
    const condition = query.filters[field];

    if (!isObject(condition)) {
      result = result.filter((item) => item[field] == condition);
      continue;
    }

    for (const op in condition) {
      if (op === '$gte') {
        result = result.filter((i) => i[field] >= condition[op]);
      }
      if (op === '$lte') {
        result = result.filter((i) => i[field] <= condition[op]);
      }
      if (op === '$in') {
        result = result.filter((i) =>
          condition[op].includes(String(i[field]))
        );
      }
    }
  }

  // Apply sort
  if (isObject(query.sort)) {
    const [key] = Object.keys(query.sort);
    const order = query.sort[key];

    result.sort((a, b) =>
      order === 1 ? a[key] - b[key] : b[key] - a[key]
    );
  }

  // Apply pagination
  const { skip, limit } = query.pagination;
  result = result.slice(skip, skip + limit);

  return result;
}

/* --------------------------------------------------------------------------
   ROUTE USING STANDARDIZED QUERY
--------------------------------------------------------------------------- */

app.get(
  '/users',
  standardQuery({
    filterable: ['name', 'role', 'createdAt'],
    sortable: ['name', 'createdAt'],
  }),
  (req, res) => {
    const data = executeQuery(USERS, req.standardQuery);

    res.json({
      success: true,
      meta: {
        page: req.standardQuery.pagination.page,
        limit: req.standardQuery.pagination.limit,
      },
      data,
    });
  }
);

/* ============================================================================
   ERROR HANDLER
============================================================================ */

app.use((err, req, res, next) => {
  console.error('[FILTER_SORT_ERROR]', err);

  res.status(400).json({
    success: false,
    message: 'Invalid filter or sort parameters',
  });
});

/* ============================================================================
   SERVER
============================================================================ */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `📊 Filtering & Sorting Standard Server running on port ${PORT}`
  );
});

/**
 * ============================================================================
 * END OF FILE
 * ============================================================================
 */
