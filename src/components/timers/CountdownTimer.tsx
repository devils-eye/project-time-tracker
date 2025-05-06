import { useEffect, useState, useRef } from "react";
import { formatTime } from "../../utils/timeUtils";
import TimerControls from "./TimerControls";
import { useAppContext } from "../../context/AppContext";
import { generateId, getCurrentDate } from "../../utils/timeUtils";
import FullscreenButton from "./FullscreenButton";

const CountdownTimer = () => {
  const [initialDuration, setInitialDuration] = useState(1800); // Default: 30 minutes
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);

  // Reference to the timer container for fullscreen
  const timerContainerRef = useRef<HTMLDivElement>(null);

  const { state, startTimer, completeTimer } = useAppContext();

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  useEffect(() => {
    if (!isRunning && !isPaused) {
      setTimeLeft(initialDuration);
    }
  }, [initialDuration, isRunning, isPaused]);

  const handleStart = async () => {
    if (!state.activeProject) {
      alert("Please select a project first");
      return;
    }

    if (timeLeft <= 0) {
      setTimeLeft(initialDuration);
    }

    setIsRunning(true);
    setIsPaused(false);
    const now = getCurrentDate();
    setStartTime(now);

    const newSessionId = generateId();
    setSessionId(newSessionId);

    // Start the timer interval first for better UI responsiveness
    const id = window.setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(id);
          setIntervalId(null);
          setIsRunning(false);
          setIsPaused(false);

          // Complete the timer session
          if (sessionId && startTime && state.activeProject) {
            const endTime = getCurrentDate();

            completeTimer({
              id: sessionId,
              projectId: state.activeProject,
              startTime,
              endTime,
              duration: initialDuration,
              type: "countdown",
              initialDuration,
            }).catch((error) => {
              console.error("Failed to complete timer:", error);
            });

            setSessionId(null);
            setStartTime(null);
          }

          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    setIntervalId(id);

    try {
      // Then save the timer session to the server
      await startTimer({
        id: newSessionId,
        projectId: state.activeProject,
        startTime: now,
        endTime: null,
        duration: 0,
        type: "countdown",
        initialDuration,
      });
    } catch (error) {
      console.error("Failed to start timer:", error);
      // Continue anyway since the UI is already updated
    }
  };

  const handlePause = async () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    setIsRunning(false);
    setIsPaused(true);

    // If we have an active session, complete it
    if (sessionId && startTime && state.activeProject) {
      try {
        const now = getCurrentDate();
        const duration = initialDuration - timeLeft;

        await completeTimer({
          id: sessionId,
          projectId: state.activeProject,
          startTime,
          endTime: now,
          duration,
          type: "countdown",
          initialDuration,
        });

        // Create a new session ID for when we resume
        setSessionId(null);
        setStartTime(null);
      } catch (error) {
        console.error("Failed to pause timer:", error);
        // Continue anyway since the UI is already updated
      }
    }
  };

  const handleResume = async () => {
    if (!state.activeProject) {
      alert("Please select a project first");
      return;
    }

    setIsRunning(true);
    setIsPaused(false);

    // Create a new session if needed
    if (!sessionId) {
      const now = getCurrentDate();
      const newSessionId = generateId();
      setSessionId(newSessionId);
      setStartTime(now);

      try {
        // Save the new session to the server
        await startTimer({
          id: newSessionId,
          projectId: state.activeProject,
          startTime: now,
          endTime: null,
          duration: initialDuration - timeLeft,
          type: "countdown",
          initialDuration,
        });
      } catch (error) {
        console.error("Failed to resume timer:", error);
        // Continue anyway since the UI is already updated
      }
    }

    const id = window.setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(id);
          setIntervalId(null);
          setIsRunning(false);
          setIsPaused(false);

          // Complete the timer session
          if (sessionId && startTime && state.activeProject) {
            const endTime = getCurrentDate();

            completeTimer({
              id: sessionId,
              projectId: state.activeProject,
              startTime,
              endTime,
              duration: initialDuration,
              type: "countdown",
              initialDuration,
            }).catch((error) => {
              console.error("Failed to complete timer:", error);
            });

            setSessionId(null);
            setStartTime(null);
          }

          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    setIntervalId(id);
  };

  const handleReset = async () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(initialDuration);

    if (sessionId && startTime && state.activeProject) {
      try {
        const now = getCurrentDate();
        const duration = initialDuration - timeLeft;

        await completeTimer({
          id: sessionId,
          projectId: state.activeProject,
          startTime,
          endTime: now,
          duration,
          type: "countdown",
          initialDuration,
        });

        setSessionId(null);
        setStartTime(null);
      } catch (error) {
        console.error("Failed to save timer session:", error);
      }
    }
  };

  const handleDurationChange = (duration: number) => {
    setInitialDuration(duration);
    if (!isRunning) {
      setTimeLeft(duration);
    }
  };

  // Get the active project color
  const activeProject = state.projects.find(
    (p) => p.id === state.activeProject
  );
  const projectColor = activeProject?.color || "amber-500";

  return (
    <div className="flex flex-col items-center" ref={timerContainerRef}>
      <div
        className="text-8xl md:text-9xl mb-8 p-4 timer-display w-full text-center"
        style={{ color: `var(--${projectColor})` }}
      >
        {formatTime(timeLeft)}
      </div>

      {!isRunning ? (
        <div className="mb-6 w-full max-w-md">
          <h3 className="text-lg font-medium mb-2 dark:text-white">
            Set Duration
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400">
                Hours
              </label>
              <input
                type="number"
                min="0"
                value={Math.floor(initialDuration / 3600)}
                onChange={(e) => {
                  const hours = parseInt(e.target.value) || 0;
                  const minutes = Math.floor((initialDuration % 3600) / 60);
                  const seconds = initialDuration % 60;
                  handleDurationChange(hours * 3600 + minutes * 60 + seconds);
                }}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400">
                Minutes
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={Math.floor((initialDuration % 3600) / 60)}
                onChange={(e) => {
                  const hours = Math.floor(initialDuration / 3600);
                  const minutes = parseInt(e.target.value) || 0;
                  const seconds = initialDuration % 60;
                  handleDurationChange(hours * 3600 + minutes * 60 + seconds);
                }}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400">
                Seconds
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={initialDuration % 60}
                onChange={(e) => {
                  const hours = Math.floor(initialDuration / 3600);
                  const minutes = Math.floor((initialDuration % 3600) / 60);
                  const seconds = parseInt(e.target.value) || 0;
                  handleDurationChange(hours * 3600 + minutes * 60 + seconds);
                }}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex space-x-4">
        {!isRunning && !isPaused ? (
          <button
            onClick={handleStart}
            className="px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-lg font-medium"
          >
            Start
          </button>
        ) : isPaused ? (
          <button
            onClick={handleResume}
            className="px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-lg font-medium"
          >
            Resume
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="px-8 py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-lg font-medium"
          >
            Pause
          </button>
        )}
        <button
          onClick={handleReset}
          className="px-8 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-lg font-medium"
        >
          Reset
        </button>

        {(isRunning || isPaused) && (
          <FullscreenButton targetRef={timerContainerRef} />
        )}
      </div>
    </div>
  );
};

export default CountdownTimer;
