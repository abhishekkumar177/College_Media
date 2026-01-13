const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Database Connection Pool Configuration
 * Implements connection pooling with retry logic and health monitoring
 */

// Connection pool configuration
const poolConfig = {
    // Connection pool settings
    maxPoolSize: parseInt(process.env.DB_POOL_MAX_SIZE) || 10,
    minPoolSize: parseInt(process.env.DB_POOL_MIN_SIZE) || 2,

    // Connection timeout settings
    serverSelectionTimeoutMS: 5000, // Timeout for selecting a server
    socketTimeoutMS: 45000, // Timeout for socket operations
    connectTimeoutMS: 10000, // Timeout for initial connection

    // Retry settings
    retryWrites: true,
    retryReads: true,

    // Monitoring
    autoIndex: process.env.NODE_ENV !== 'production', // Disable in production for performance

    // Connection management
    maxIdleTimeMS: 60000, // Close idle connections after 1 minute
    waitQueueTimeoutMS: 10000, // Timeout for waiting in queue
};

/**
 * Connection state tracking
 */
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY_MS = 5000;

/**
 * Initialize database connection with pooling
 * @param {string} uri - MongoDB connection URI
 * @returns {Promise<mongoose.Connection>} - Mongoose connection
 */
const initializePool = async (uri) => {
    try {
        logger.info('Initializing MongoDB connection pool...', {
            maxPoolSize: poolConfig.maxPoolSize,
            minPoolSize: poolConfig.minPoolSize
        });

        // Connect with pool configuration
        await mongoose.connect(uri, poolConfig);

        const connection = mongoose.connection;

        // Connection event handlers
        connection.on('connected', () => {
            logger.info('MongoDB connection pool established', {
                host: connection.host,
                name: connection.name,
                poolSize: poolConfig.maxPoolSize
            });
            connectionAttempts = 0; // Reset retry counter on success
        });

        connection.on('error', (err) => {
            logger.error('MongoDB connection error:', err);
        });

        connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');

            // Attempt reconnection
            if (connectionAttempts < MAX_RETRY_ATTEMPTS) {
                connectionAttempts++;
                logger.info(`Attempting to reconnect (${connectionAttempts}/${MAX_RETRY_ATTEMPTS})...`);

                setTimeout(() => {
                    mongoose.connect(uri, poolConfig).catch(err => {
                        logger.error('Reconnection failed:', err);
                    });
                }, RETRY_DELAY_MS);
            } else {
                logger.error('Max reconnection attempts reached. Manual intervention required.');
            }
        });

        connection.on('reconnected', () => {
            logger.info('MongoDB reconnected successfully');
            connectionAttempts = 0;
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            try {
                await connection.close();
                logger.info('MongoDB connection closed through app termination');
                process.exit(0);
            } catch (err) {
                logger.error('Error closing MongoDB connection:', err);
                process.exit(1);
            }
        });

        return connection;
    } catch (error) {
        logger.error('Failed to initialize MongoDB connection pool:', error);
        throw error;
    }
};

/**
 * Get connection pool statistics
 * @returns {object} - Pool statistics
 */
const getPoolStats = () => {
    const connection = mongoose.connection;

    if (connection.readyState !== 1) {
        return {
            status: 'disconnected',
            readyState: connection.readyState
        };
    }

    return {
        status: 'connected',
        readyState: connection.readyState,
        host: connection.host,
        name: connection.name,
        models: Object.keys(connection.models),
        config: {
            maxPoolSize: poolConfig.maxPoolSize,
            minPoolSize: poolConfig.minPoolSize
        }
    };
};

/**
 * Health check for database connection
 * @returns {Promise<object>} - Health status
 */
const healthCheck = async () => {
    try {
        const connection = mongoose.connection;

        if (connection.readyState !== 1) {
            return {
                healthy: false,
                status: 'disconnected',
                readyState: connection.readyState
            };
        }

        // Ping database
        await connection.db.admin().ping();

        return {
            healthy: true,
            status: 'connected',
            readyState: connection.readyState,
            responseTime: Date.now()
        };
    } catch (error) {
        logger.error('Database health check failed:', error);
        return {
            healthy: false,
            status: 'error',
            error: error.message
        };
    }
};

/**
 * Close connection pool gracefully
 * @returns {Promise<void>}
 */
const closePool = async () => {
    try {
        await mongoose.connection.close();
        logger.info('MongoDB connection pool closed successfully');
    } catch (error) {
        logger.error('Error closing connection pool:', error);
        throw error;
    }
};

module.exports = {
    initializePool,
    getPoolStats,
    healthCheck,
    closePool,
    poolConfig
};
