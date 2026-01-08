const SkeletonPost = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
      {/* Header */}
      <div className="flex items-center p-4 space-x-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        <div className="h-4 w-32 bg-gray-300 rounded"></div>
      </div>

      {/* Image */}
      <div className="w-full h-64 bg-gray-300"></div>

      {/* Actions */}
      <div className="p-4 space-y-3">
        <div className="flex space-x-4">
          <div className="h-6 w-6 bg-gray-300 rounded"></div>
          <div className="h-6 w-6 bg-gray-300 rounded"></div>
        </div>

        <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
        <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
};

export default SkeletonPost;
