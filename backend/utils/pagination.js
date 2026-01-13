const logger = require('./logger');

/**
 * Pagination Utilities
 * Provides cursor-based and offset-based pagination helpers
 */

/**
 * Parse pagination parameters from request query
 * @param {object} query - Request query object
 * @param {object} options - Default options
 * @returns {object} - Parsed pagination params
 */
const parsePaginationParams = (query, options = {}) => {
    const {
        defaultLimit = 20,
        maxLimit = 100,
        defaultSort = '-createdAt'
    } = options;

    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit) || defaultLimit));
    const skip = (page - 1) * limit;
    const sort = query.sort || defaultSort;

    return {
        page,
        limit,
        skip,
        sort
    };
};

/**
 * Create pagination metadata
 * @param {number} total - Total count of documents
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {object} - Pagination metadata
 */
const createPaginationMeta = (total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
    };
};

/**
 * Offset-based pagination helper for Mongoose queries
 * @param {Model} model - Mongoose model
 * @param {object} query - Query filter
 * @param {object} options - Pagination options
 * @returns {Promise<object>} - Paginated results with metadata
 */
const paginateQuery = async (model, query = {}, options = {}) => {
    try {
        const {
            page = 1,
            limit = 20,
            sort = '-createdAt',
            select = '',
            populate = null
        } = options;

        const skip = (page - 1) * limit;

        // Build query
        let queryBuilder = model.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        if (select) {
            queryBuilder = queryBuilder.select(select);
        }

        if (populate) {
            if (Array.isArray(populate)) {
                populate.forEach(pop => {
                    queryBuilder = queryBuilder.populate(pop);
                });
            } else {
                queryBuilder = queryBuilder.populate(populate);
            }
        }

        // Execute query and count in parallel
        const [data, total] = await Promise.all([
            queryBuilder.exec(),
            model.countDocuments(query)
        ]);

        const meta = createPaginationMeta(total, page, limit);

        return {
            success: true,
            data,
            pagination: meta
        };
    } catch (error) {
        logger.error('Pagination error:', error);
        throw error;
    }
};

/**
 * Cursor-based pagination helper (more efficient for large datasets)
 * @param {Model} model - Mongoose model
 * @param {object} query - Query filter
 * @param {object} options - Pagination options
 * @returns {Promise<object>} - Paginated results with cursor
 */
const paginateCursor = async (model, query = {}, options = {}) => {
    try {
        const {
            limit = 20,
            cursor = null,
            sort = '-createdAt',
            select = '',
            populate = null,
            cursorField = '_id' // Field to use for cursor (usually _id or createdAt)
        } = options;

        // Build query with cursor
        const cursorQuery = { ...query };

        if (cursor) {
            // Determine sort direction
            const sortDirection = sort.startsWith('-') ? -1 : 1;
            const sortField = sort.replace(/^-/, '');

            if (sortDirection === -1) {
                cursorQuery[sortField] = { $lt: cursor };
            } else {
                cursorQuery[sortField] = { $gt: cursor };
            }
        }

        // Build query
        let queryBuilder = model.find(cursorQuery)
            .sort(sort)
            .limit(limit + 1); // Fetch one extra to check if there's a next page

        if (select) {
            queryBuilder = queryBuilder.select(select);
        }

        if (populate) {
            if (Array.isArray(populate)) {
                populate.forEach(pop => {
                    queryBuilder = queryBuilder.populate(pop);
                });
            } else {
                queryBuilder = queryBuilder.populate(populate);
            }
        }

        const results = await queryBuilder.exec();

        const hasNextPage = results.length > limit;
        const data = hasNextPage ? results.slice(0, limit) : results;

        const nextCursor = hasNextPage && data.length > 0
            ? data[data.length - 1][cursorField.replace(/^-/, '')]
            : null;

        return {
            success: true,
            data,
            pagination: {
                hasNextPage,
                nextCursor,
                limit
            }
        };
    } catch (error) {
        logger.error('Cursor pagination error:', error);
        throw error;
    }
};

/**
 * Paginate array (for mock database or in-memory data)
 * @param {Array} array - Array to paginate
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {object} - Paginated results
 */
const paginateArray = (array, page = 1, limit = 20) => {
    const total = array.length;
    const skip = (page - 1) * limit;
    const data = array.slice(skip, skip + limit);
    const meta = createPaginationMeta(total, page, limit);

    return {
        success: true,
        data,
        pagination: meta
    };
};

module.exports = {
    parsePaginationParams,
    createPaginationMeta,
    paginateQuery,
    paginateCursor,
    paginateArray
};
