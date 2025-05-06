import { useState, useEffect } from 'react';
import * as db from '../../services/db';

/**
 * Component to monitor database status and provide recovery options
 */
const DatabaseStatus = () => {
  const [status, setStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);

  // Check database status on mount
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        // Try to initialize the database
        await db.initDB();
        
        // Try to get projects as a test
        const projects = await db.getAllProjects();
        console.log(`Database check: found ${projects.length} projects`);
        
        setStatus('ok');
      } catch (error) {
        console.error('Database status check failed:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : String(error));
      }
    };

    checkDatabase();
  }, []);

  // Handle recovery attempt
  const handleRecovery = async () => {
    setIsRecovering(true);
    try {
      // Try to reinitialize the database
      await db.initDB();
      
      // Try to load initial data
      await db.loadInitialData();
      
      // Check if it worked
      const projects = await db.getAllProjects();
      console.log(`Recovery: found ${projects.length} projects`);
      
      setStatus('ok');
      setErrorMessage(null);
    } catch (error) {
      console.error('Recovery failed:', error);
      setErrorMessage(`Recovery failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRecovering(false);
    }
  };

  // If everything is ok, don't render anything
  if (status === 'ok' || status === 'checking') {
    return null;
  }

  // Render error state
  return (
    <div className="fixed bottom-4 right-4 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg shadow-lg max-w-md z-50">
      <div className="flex items-center">
        <div className="mr-3 text-red-500 dark:text-red-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 className="font-medium text-red-800 dark:text-red-200">Database Error</h3>
          <p className="text-sm text-red-700 dark:text-red-300">
            There was a problem with the application database.
          </p>
        </div>
      </div>
      
      {showDetails && errorMessage && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-950 rounded text-xs font-mono overflow-auto max-h-24">
          {errorMessage}
        </div>
      )}
      
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={handleRecovery}
          disabled={isRecovering}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50"
        >
          {isRecovering ? 'Recovering...' : 'Attempt Recovery'}
        </button>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

export default DatabaseStatus;
