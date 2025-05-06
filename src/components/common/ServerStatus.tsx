import { useState, useEffect } from "react";

/**
 * Component to monitor server connection status
 */
const ServerStatus = () => {
  const [status, setStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");
  const [retrying, setRetrying] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Check server connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Add timeout to the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        const response = await fetch("/api/settings", {
          signal: controller.signal,
          cache: "no-store", // Prevent caching
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          setStatus("connected");
        } else {
          setStatus("disconnected");
        }
      } catch (error) {
        console.error("Server connection check failed:", error);
        setStatus("disconnected");
      }

      setLastChecked(new Date());
    };

    checkConnection();

    // Set up periodic check every 15 seconds
    const interval = setInterval(checkConnection, 15000);

    return () => clearInterval(interval);
  }, []);

  // Handle retry attempt
  const handleRetry = async () => {
    setRetrying(true);
    try {
      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch("/api/settings", {
        signal: controller.signal,
        cache: "no-store", // Prevent caching
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setStatus("connected");
      } else {
        setStatus("disconnected");
      }
    } catch (error) {
      console.error("Server connection retry failed:", error);
      setStatus("disconnected");
    } finally {
      setRetrying(false);
      setLastChecked(new Date());
    }
  };

  // If connected or still checking, don't render anything
  if (status === "connected" || status === "checking") {
    return null;
  }

  // Format last checked time
  const lastCheckedText = lastChecked
    ? `Last checked: ${lastChecked.toLocaleTimeString()}`
    : "Checking connection...";

  // Render disconnected state
  return (
    <div className="fixed bottom-4 left-4 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg shadow-lg max-w-md z-50">
      <div className="flex items-center">
        <div className="mr-3 text-red-500 dark:text-red-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div>
          <h3 className="font-medium text-red-800 dark:text-red-200">
            Server Connection Error
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300">
            Cannot connect to the server. Your changes will be saved locally but
            not across browsers.
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {lastCheckedText}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={handleRetry}
          disabled={retrying}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50"
        >
          {retrying ? "Checking..." : "Retry Connection"}
        </button>

        <a
          href="/"
          className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded inline-block"
        >
          Reload Page
        </a>

        <button
          onClick={() => {
            window.open("./start.sh", "_blank");
          }}
          className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded"
        >
          Server Setup Help
        </button>
      </div>
    </div>
  );
};

export default ServerStatus;
