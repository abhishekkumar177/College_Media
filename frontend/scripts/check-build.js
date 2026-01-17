#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Check build prerequisites to prevent common build failures
 */

function checkNodeVersion() {
  const nodeVersion = process.versions.node;
  const majorVersion = parseInt(nodeVersion.split('.')[0]);

  if (majorVersion < 18) {
    console.error(`❌ Node.js version ${nodeVersion} is not supported. Minimum required version is 18.0.0`);
    console.error('Please upgrade Node.js to version 18 or higher.');
    process.exit(1);
  }

  console.log(`✅ Node.js version: ${nodeVersion}`);
}

function checkPackageLock() {
  const packageLockPath = path.join(__dirname, '..', 'package-lock.json');

  if (!fs.existsSync(packageLockPath)) {
    console.error('❌ package-lock.json not found. Please run "npm install" first.');
    process.exit(1);
  }

  try {
    const packageLockContent = fs.readFileSync(packageLockPath, 'utf8');
    JSON.parse(packageLockContent);
    console.log('✅ package-lock.json is valid');
  } catch (error) {
    console.error('❌ package-lock.json is corrupted or invalid JSON');
    console.error('Please delete package-lock.json and node_modules, then run "npm install"');
    process.exit(1);
  }
}

function checkEnvironmentVariables() {
  const requiredEnvVars = ['NODE_ENV'];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('Please set these environment variables before building.');
    process.exit(1);
  }

  console.log('✅ Required environment variables are set');
}

function main() {
  console.log('🔍 Checking build prerequisites...\n');

  try {
    checkNodeVersion();
    checkPackageLock();
    checkEnvironmentVariables();

    console.log('\n🎉 All checks passed! Proceeding with build...');
  } catch (error) {
    console.error('\n💥 Build check failed:', error.message);
    process.exit(1);
  }
}

main();
