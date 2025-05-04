import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import StopwatchTimer from "../components/timers/StopwatchTimer";
import CountdownTimer from "../components/timers/CountdownTimer";
import ProjectSelectorModal from "../components/projects/ProjectSelectorModal";
import { TimerType } from "../types";

const Timer = () => {
  const [timerType, setTimerType] = useState<TimerType | null>(null);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const { state } = useAppContext();

  // Function to handle timer selection
  const handleSelectTimerType = (type: TimerType) => {
    setTimerType(type);
    // If no project is selected, show the project selector
    if (!state.activeProject) {
      setShowProjectSelector(true);
    }
  };

  // Function to handle project selection completion
  const handleProjectSelected = () => {
    setShowProjectSelector(false);
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      {/* Timer Type Selection Screen */}
      {timerType === null && (
        <div className="flex-grow flex flex-col items-center justify-center py-12">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-800 dark:text-white">
            Select Timer Type
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            <button
              onClick={() => handleSelectTimerType("stopwatch")}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-transparent hover:border-primary-500 flex flex-col items-center"
            >
              <div className="text-5xl text-primary-500 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-24 w-24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 7v5l2 2"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 3v2M21 12h-2M12 19v2M3 12h2"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
                Stopwatch
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Count up from zero to track how much time you spend
              </p>
            </button>

            <button
              onClick={() => handleSelectTimerType("countdown")}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-transparent hover:border-primary-500 flex flex-col items-center"
            >
              <div className="text-5xl text-primary-500 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-24 w-24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
                Countdown
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Set a duration and count down to zero
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Timer Display */}
      {timerType !== null && state.activeProject && (
        <div className="flex-grow flex flex-col items-center justify-center py-8">
          <div className="w-full max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setTimerType(null)}
                className="text-primary-600 dark:text-primary-400 hover:underline flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Back
              </button>

              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{
                    backgroundColor: `var(--${state.projects
                      .find((p) => p.id === state.activeProject)
                      ?.color.replace("-", "-")})`,
                  }}
                ></div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {
                    state.projects.find((p) => p.id === state.activeProject)
                      ?.name
                  }
                </span>
                <button
                  onClick={() => setShowProjectSelector(true)}
                  className="ml-2 text-primary-600 dark:text-primary-400 text-sm hover:underline"
                >
                  Change
                </button>
              </div>
            </div>

            {timerType === "stopwatch" ? (
              <StopwatchTimer />
            ) : (
              <CountdownTimer />
            )}
          </div>
        </div>
      )}

      {/* Project Selector Modal */}
      {showProjectSelector && (
        <ProjectSelectorModal
          onClose={() => setShowProjectSelector(false)}
          onProjectSelected={handleProjectSelected}
          timerType={timerType}
        />
      )}
    </div>
  );
};

export default Timer;
