import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Home = () => {
  const { state } = useAppContext();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Project Time Tracker</h1>
        <p className="text-xl text-gray-600">
          Track your time efficiently and boost your productivity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center text-center">
          <div className="bg-primary-100 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Track Time</h2>
          <p className="text-gray-600 mb-6">
            Use our flexible timers to track how much time you spend on your projects.
          </p>
          <Link
            to="/timer"
            className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Start Tracking
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center text-center">
          <div className="bg-primary-100 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Manage Projects</h2>
          <p className="text-gray-600 mb-6">
            Create and organize your projects to keep track of where your time goes.
          </p>
          <Link
            to="/projects"
            className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Manage Projects
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 mb-12">
        <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
        <ol className="list-decimal list-inside space-y-4 text-gray-700">
          <li>
            <span className="font-medium">Create a project</span> - Start by creating a project to track time for.
          </li>
          <li>
            <span className="font-medium">Select a project</span> - Choose which project you want to track time for.
          </li>
          <li>
            <span className="font-medium">Start a timer</span> - Use either the countdown or stopwatch timer to track your time.
          </li>
          <li>
            <span className="font-medium">View your stats</span> - Check the dashboard to see how you're spending your time.
          </li>
        </ol>
      </div>

      {state.projects.length === 0 ? (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 text-center">
          <h3 className="text-xl font-medium text-primary-800 mb-2">No Projects Yet</h3>
          <p className="text-primary-600 mb-4">
            Create your first project to start tracking your time.
          </p>
          <Link
            to="/projects"
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors inline-block"
          >
            Create Project
          </Link>
        </div>
      ) : (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 text-center">
          <h3 className="text-xl font-medium text-primary-800 mb-2">Ready to Track Time?</h3>
          <p className="text-primary-600 mb-4">
            You have {state.projects.length} project{state.projects.length !== 1 ? 's' : ''} set up and ready to go.
          </p>
          <Link
            to="/timer"
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors inline-block"
          >
            Start Timer
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;
