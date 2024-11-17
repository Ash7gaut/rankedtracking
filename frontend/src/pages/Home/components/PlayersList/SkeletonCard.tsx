export const SkeletonCard = () => {
  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
      <div className="flex items-center space-x-4">
        {/* Avatar skeleton */}
        <div className="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded-full" />

        {/* Info skeleton */}
        <div className="flex-1">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4" />
        </div>

        {/* Stats skeleton */}
        <div className="text-right">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-2" />
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12" />
        </div>
      </div>
    </div>
  );
};
