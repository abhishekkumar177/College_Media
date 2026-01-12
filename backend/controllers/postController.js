const safeApiCall = require("../utils/apiClient");

exports.getExternalPosts = async (req, res) => {
  const data = await safeApiCall({
    method: "GET",
    url: "https://jsonplaceholder.typicode.com/posts",
    fallback: {
      success: true,
      data: [],
      message: "Showing cached / empty data",
    },
  });

  res.status(200).json(data);
};
