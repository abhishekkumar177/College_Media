/**
 * ============================================================
 * API DEPRECATION & SUNSET POLICY – NODE.JS
 * Issue: Absence of API Deprecation & Sunset Policy (#749)
 * ============================================================
 */

'use strict';

const express = require('express');

const app = express();
app.use(express.json());

/* ============================================================
   CONFIG
============================================================ */
const CONFIG = {
  PORT: process.env.PORT || 3000,
};

/* ============================================================
   API VERSION REGISTRY
============================================================ */
const apiVersions = {
  v1: {
    status: 'deprecated',
    deprecationDate: '2024-10-01',
    sunsetDate: '2025-03-01',
    migrationGuide: 'https://docs.example.com/migrate-v1-to-v2',
  },
  v2: {
    status: 'active',
    deprecationDate: null,
    sunsetDate: null,
    migrationGuide: null,
  },
};

/* ============================================================
   DEPRECATION MIDDLEWARE
============================================================ */
function apiLifecycle(version) {
  return (req, res, next) => {
    const meta = apiVersions[version];

    if (!meta) {
      return res.status(404).json({ error: 'API version not found' });
    }

    // Add standard deprecation headers
    if (meta.status === 'deprecated') {
      res.setHeader('Deprecation', 'true');
      res.setHeader('Sunset', meta.sunsetDate);
      res.setHeader(
        'Link',
        `<${meta.migrationGuide}>; rel="deprecation"`
      );
    }

    // Block sunset APIs
    if (
      meta.status === 'deprecated' &&
      meta.sunsetDate &&
      new Date() > new Date(meta.sunsetDate)
    ) {
      return res.status(410).json({
        error: 'API version has been sunset',
        migrationGuide: meta.migrationGuide,
      });
    }

    next();
  };
}

/* ============================================================
   API ROUTES
============================================================ */

// V1 (Deprecated)
app.get(
  '/api/v1/data',
  apiLifecycle('v1'),
  (req, res) => {
    res.json({
      version: 'v1',
      data: 'legacy response',
      warning: 'This API version is deprecated',
    });
  }
);

// V2 (Active)
app.get(
  '/api/v2/data',
  apiLifecycle('v2'),
  (req, res) => {
    res.json({
      version: 'v2',
      data: 'current response',
    });
  }
);

/* ============================================================
   ADMIN: VERSION STATUS
============================================================ */
app.get('/admin/api-versions', (req, res) => {
  res.json(apiVersions);
});

app.post('/admin/api-versions/:version/deprecate', (req, res) => {
  const { version } = req.params;
  const { sunsetDate, migrationGuide } = req.body;

  if (!apiVersions[version]) {
    return res.status(404).json({ error: 'API version not found' });
  }

  apiVersions[version].status = 'deprecated';
  apiVersions[version].sunsetDate = sunsetDate;
  apiVersions[version].migrationGuide = migrationGuide;

  res.json({
    message: `API ${version} marked as deprecated`,
    meta: apiVersions[version],
  });
});

/* ============================================================
   HEALTH
============================================================ */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    versions: apiVersions,
  });
});

/* ============================================================
   SERVER
============================================================ */
app.listen(CONFIG.PORT, () => {
  console.log(
    `🚀 API Deprecation & Sunset Policy server running on port ${CONFIG.PORT}`
  );
});
