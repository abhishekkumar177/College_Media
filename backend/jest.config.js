module.exports = {
    testEnvironment: 'node',
    verbose: true,
    testTimeout: 30000,
    // Ensure we don't try to test frontend files if they exist in same repo structure
    testMatch: ['**/backend/tests/**/*.test.js'],
    setupFilesAfterEnv: ['./tests/setup.js'],
};
