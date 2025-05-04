const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 dark:border-primary-400"></div>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Loading your data...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
