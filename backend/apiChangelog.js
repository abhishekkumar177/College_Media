/**
 * ============================================================================
 * API CHANGELOG & RELEASE NOTES – SINGLE FILE IMPLEMENTATION
 * ============================================================================
 *
 * ✔ Centralized API changelog system
 * ✔ Versioned release notes
 * ✔ Keep a Changelog compliant format
 * ✔ API endpoint to expose changelog
 * ✔ Structured change categories
 * ✔ Supports breaking changes & deprecations
 * ✔ Ready for CI / automation
 *
 * Issue: No API Changelog or Release Notes
 * Severity: MEDIUM
 * ============================================================================
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

/* ============================================================================
   CONFIGURATION
============================================================================ */

const CHANGELOG_CONFIG = {
  FILE_NAME: 'CHANGELOG.md',
  PROJECT_NAME: 'College_Media API',
  BASE_VERSION: '1.0.0',
  CHANGELOG_DIR: process.cwd(),
};

/* ============================================================================
   CHANGE TYPES (KEEP A CHANGELOG STANDARD)
============================================================================ */

const CHANGE_TYPES = {
  ADDED: 'Added',
  CHANGED: 'Changed',
  DEPRECATED: 'Deprecated',
  REMOVED: 'Removed',
  FIXED: 'Fixed',
  SECURITY: 'Security',
};

/* ============================================================================
   CHANGELOG TEMPLATE
============================================================================ */

function getChangelogHeader() {
  return `# Changelog

All notable changes to **${CHANGELOG_CONFIG.PROJECT_NAME}** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/).

`;
}

/* ============================================================================
   FILE HELPERS
============================================================================ */

function changelogPath() {
  return path.join(CHANGELOG_CONFIG.CHANGELOG_DIR, CHANGELOG_CONFIG.FILE_NAME);
}

function ensureChangelogExists() {
  const filePath = changelogPath();

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, getChangelogHeader(), 'utf8');
  }
}

function readChangelog() {
  ensureChangelogExists();
  return fs.readFileSync(changelogPath(), 'utf8');
}

function writeChangelog(content) {
  fs.writeFileSync(changelogPath(), content, 'utf8');
}

/* ============================================================================
   VERSION UTILITIES
============================================================================ */

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function createVersionHeader(version) {
  return `## [${version}] - ${getToday()}\n`;
}

function createSectionHeader(type) {
  return `### ${type}\n`;
}

/* ============================================================================
   CHANGELOG ENTRY BUILDER
============================================================================ */

function buildReleaseBlock(version, changes) {
  let block = createVersionHeader(version);

  Object.values(CHANGE_TYPES).forEach((type) => {
    if (changes[type] && changes[type].length > 0) {
      block += createSectionHeader(type);

      changes[type].forEach((item) => {
        block += `- ${item}\n`;
      });

      block += '\n';
    }
  });

  return block;
}

/* ============================================================================
   CHANGELOG MANAGER
============================================================================ */

function addRelease(version, changes) {
  ensureChangelogExists();

  const current = readChangelog();
  const releaseBlock = buildReleaseBlock(version, changes);

  const updated =
    getChangelogHeader() +
    releaseBlock +
    current.replace(getChangelogHeader(), '');

  writeChangelog(updated);
}

/* ============================================================================
   SAMPLE RELEASE DATA (DEMO)
============================================================================ */

const SAMPLE_RELEASE = {
  [CHANGE_TYPES.ADDED]: [
    'Added standardized filtering and sorting support across APIs',
    'Introduced idempotency handling for POST requests',
  ],
  [CHANGE_TYPES.FIXED]: [
    'Fixed XSS vulnerability by adding global input sanitization',
  ],
  [CHANGE_TYPES.SECURITY]: [
    'Hardened request validation and response encoding',
  ],
};

/* ============================================================================
   EXPRESS APP
============================================================================ */

const app = express();
app.use(express.json());

/* ============================================================================
   API METADATA
============================================================================ */

const API_METADATA = {
  name: CHANGELOG_CONFIG.PROJECT_NAME,
  version: CHANGELOG_CONFIG.BASE_VERSION,
  description: 'Backend API for College Media platform',
  maintainedBy: 'Backend Team',
};

/* ============================================================================
   ROUTE: GET API INFO
============================================================================ */

app.get('/api/meta', (req, res) => {
  res.json({
    success: true,
    api: API_METADATA,
  });
});

/* ============================================================================
   ROUTE: GET CHANGELOG (RAW)
============================================================================ */

app.get('/api/changelog', (req, res) => {
  ensureChangelogExists();

  res.type('text/markdown');
  res.send(readChangelog());
});

/* ============================================================================
   ROUTE: GET RELEASE NOTES (JSON)
============================================================================ */

function parseReleases(markdown) {
  const releases = [];
  const blocks = markdown.split('## ').slice(1);

  blocks.forEach((block) => {
    const [header, ...rest] = block.split('\n');
    const version = header.split(']')[0].replace('[', '');

    releases.push({
      version,
      notes: rest.join('\n').trim(),
    });
  });

  return releases;
}

app.get('/api/releases', (req, res) => {
  const content = readChangelog();
  const releases = parseReleases(content);

  res.json({
    success: true,
    count: releases.length,
    releases,
  });
});

/* ============================================================================
   ROUTE: ADD NEW RELEASE (ADMIN / CI)
============================================================================ */
/**
 * Payload:
 * {
 *   "version": "1.1.0",
 *   "changes": {
 *     "Added": ["New endpoint"],
 *     "Fixed": ["Bug fix"]
 *   }
 * }
 */

app.post('/api/releases', (req, res) => {
  const { version, changes } = req.body;

  if (!version || !changes) {
    return res.status(400).json({
      success: false,
      message: 'Version and changes are required',
    });
  }

  addRelease(version, changes);

  res.status(201).json({
    success: true,
    message: `Release ${version} added successfully`,
  });
});

/* ============================================================================
   DEPRECATION HELPER
============================================================================ */

function deprecationNotice(message, removalVersion) {
  return {
    deprecated: true,
    message,
    removalVersion,
  };
}

/* ============================================================================
   SAMPLE DEPRECATED ENDPOINT
============================================================================ */

app.get('/api/v1/legacy-endpoint', (req, res) => {
  res.json({
    success: true,
    data: [],
    deprecation: deprecationNotice(
      'This endpoint will be removed',
      '2.0.0'
    ),
  });
});

/* ============================================================================
   ERROR HANDLER
============================================================================ */

app.use((err, req, res, next) => {
  console.error('[CHANGELOG_ERROR]', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

/* ============================================================================
   INITIALIZE DEMO RELEASE (ONLY ON FIRST RUN)
============================================================================ */

ensureChangelogExists();

/* ============================================================================
   SERVER
============================================================================ */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `📘 API Changelog & Release Notes server running on port ${PORT}`
  );
});

/**
 * ============================================================================
 * END OF FILE
 * ============================================================================
 */
