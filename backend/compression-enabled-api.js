/**
 * ============================================================
 * Large Payload Responses With Compression (Single File)
 * ============================================================
 * Issue Addressed:
 * ❌ Large Payload Responses Without Compression
 *
 * Solution:
 * ✔ Gzip & Brotli compression enabled
 * ✔ Accept-Encoding respected
 * ✔ Size-based compression threshold
 * ✔ Large payload demo endpoints
 *
 * Tech Stack:
 * - Node.js
 * - Express
 * - compression (middleware)
 * ============================================================
 */

const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

/**
 * ============================================================
 * Compression Configuration
 * ============================================================
 */

const COMPRESSION_THRESHOLD_BYTES = 1024; // 1 KB

app.use(
  compression({
    threshold: COMPRESSION_THRESHOLD_BYTES,

    /**
     * Custom filter to decide when to compress
     */
    filter: (req, res) => {
      // Do not compress if explicitly disabled
      if (req.headers['x-no-compression']) {
        return false;
      }

      // Only compress JSON / text responses
      const type = res.getHeader('Content-Type');
      if (type && typeof type === 'string') {
        if (
          type.includes('application/json') ||
          type.includes('text/')
        ) {
          return compression.filter(req, res);
        }
      }

      return false;
    },
  })
);

/**
 * ============================================================
 * Helper Function – Generate Large Payload
 * ============================================================
 */

function generateLargeDataset(count = 5000) {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({
      id: i + 1,
      name: `Item-${i + 1}`,
      description:
        'This is a sample description used to simulate a large payload response for compression testing.',
      createdAt: new Date().toISOString(),
    });
  }
  return data;
}

/**
 * ============================================================
 * APIs (Large Payload Responses)
 * ============================================================
 */

/**
 * Large List API
 */
app.get('/api/items', (req, res) => {
  const items = generateLargeDataset(4000);

  res.status(200).json({
    total: items.length,
    data: items,
  });
});

/**
 * Analytics / Report API
 */
app.get('/api/reports/analytics', (req, res) => {
  const report = generateLargeDataset(3000);

  res.status(200).json({
    generatedAt: new Date().toISOString(),
    report,
  });
});

/**
 * Metadata Heavy API
 */
app.get('/api/config/metadata', (req, res) => {
  const metadata = {
    app: 'College_Media',
    version: '1.0.0',
    environment: 'production',
    features: generateLargeDataset(2000),
  };

  res.status(200).json(metadata);
});

/**
 * Small Payload API (Should NOT be compressed)
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
  });
});

/**
 * ============================================================
 * Debug Endpoint – Compression Visibility
 * ============================================================
 */

app.get('/debug/compression-info', (req, res) => {
  res.status(200).json({
    acceptEncoding: req.headers['accept-encoding'],
    note:
      'Check Content-Encoding header in large responses (gzip / br)',
  });
});

/**
 * ============================================================
 * Server Start (Optional)
 * ============================================================
 */

// Uncomment for local testing
// app.listen(3000, () => {
//   console.log('Server running on port 3000');
// });

module.exports = app;

/**
 * ============================================================
 * End of File
 * ============================================================
 */
