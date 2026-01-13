/**
 * ============================================
 * Pagination Utility
 * ============================================
 */

const { AppError } = require("../middleware/errorMiddleware");

const paginate = async (model, query = {}, options = {}) => {
  let page = parseInt(options.page || "1");
  let limit = parseInt(options.limit || "10");

  if (page <= 0 || limit <= 0) {
    throw new AppError(
      "Page and limit must be positive numbers",
      400,
      "INVALID_PAGINATION"
    );
  }

  const skip = (page - 1) * limit;

  const [data, totalRecords] = await Promise.all([
    model.find(query).skip(skip).limit(limit),
    model.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalRecords / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      totalPages,
      totalRecords,
    },
  };
};

module.exports = paginate;
