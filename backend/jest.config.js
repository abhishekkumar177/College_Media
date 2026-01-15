module.exports = {
    testEnvironment: 'node',
    verbose: true,
    testTimeout: 30000,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html', 'json'],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },
    // Ensure we don't try to test frontend files if they exist in same repo structure
    testMatch: ['**/backend/tests/**/*.test.js'],
    setupFilesAfterEnv: ['./tests/setup.js'],
    // Load test environment variables
    setupFiles: ['dotenv/config'],
    testEnvironmentOptions: {
        NODE_ENV: 'test'
    }
};
