const logger = require('../utils/logger');

/**
 * Middleware to handle API versioning and deprecation headers
 * @param {object} options
 * @param {string} options.sunset - ISO date string for when the endpoint will be removed
 * @param {string} options.deprecation - ISO date string or boolean for when it was deprecated
 * @param {string} options.version - Current API version (e.g., 'v1')
 */
const versionMiddleware = (options = {}) => {
    return (req, res, next) => {
        // Add API version header
        if (options.version) {
            res.setHeader('X-API-Version', options.version);
        }

        // Handle Deprecation header
        if (options.deprecation) {
            // Standard header: Date or boolean
            res.setHeader('Deprecation', options.deprecation === true ? 'true' : options.deprecation);

            // Add a warning link if provided or generic
            const link = options.link || 'https://api.collegemedia.com/docs/deprecation';
            res.setHeader('Link', `<${link}>; rel="deprecation"`);

            logger.warn(`Deprecated API accessed: ${req.method} ${req.originalUrl}`);
        }

        // Handle Sunset header (when it will be removed)
        if (options.sunset) {
            res.setHeader('Sunset', new Date(options.sunset).toUTCString());
        }

        next();
    };
};

/**
 * Middleware to negotiate API version via Accept-Version header
 * Use this at global level if you want to route based on header
 * (Alternatively, using URL prefix /v1/ is simpler and explicit)
 */
const negotiateVersion = (req, res, next) => {
    const version = req.headers['accept-version'];
    if (version) {
        req.apiVersion = version;
    }
    next();
};

module.exports = {
    versionMiddleware,
    negotiateVersion
};
