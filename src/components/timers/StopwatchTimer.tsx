import { useEffect, useState, useRef } from "react";
import { formatTime } from "../../utils/timeUtils";
import TimerControls from "./TimerControls";
import { useAppContext } from "../../context/AppContext";
import { generateId, getCurrentDate } from "../../utils/timeUtils";
import FullscreenButton from "./FullscreenButton";

const StopwatchTimer = () => {
  const [time, setTime] = useState(0);
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

  const handleStart = async () => {
    if (!state.activeProject) {
      alert("Please select a project first");
      return;
    }

    setIsRunning(true);
    const now = getCurrentDate();
    setStartTime(now);

    const newSessionId = generateId();
    setSessionId(newSessionId);

    // Start the timer interval first for better UI responsiveness
    const id = window.setInterval(() => {
      setTime((prevTime) => prevTime + 1);
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
        type: "stopwatch",
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

    if (sessionId && startTime && state.activeProject) {
      try {
        const now = getCurrentDate();
        const duration = time;

        await completeTimer({
          id: sessionId,
          projectId: state.activeProject,
          startTime,
          endTime: now,
          duration,
          type: "stopwatch",
        });

        setSessionId(null);
        setStartTime(null);
      } catch (error) {
        console.error("Failed to save timer session:", error);
        // We could show an error message here if needed
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

    const now = getCurrentDate();
    setStartTime(now);

    const newSessionId = generateId();
    setSessionId(newSessionId);

    // Start the timer interval first for better UI responsiveness
    const id = window.setInterval(() => {
      setTime((prevTime) => prevTime + 1);
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
        type: "stopwatch",
      });
    } catch (error) {
      console.error("Failed to resume timer:", error);
      // Continue anyway since the UI is already updated
    }
  };

  const handleReset = async () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    setIsRunning(false);
    setIsPaused(false);
    setTime(0);

    if (sessionId && startTime && state.activeProject) {
      try {
        const now = getCurrentDate();

        await completeTimer({
          id: sessionId,
          projectId: state.activeProject,
          startTime,
          endTime: now,
          duration: time,
          type: "stopwatch",
        });

        setSessionId(null);
        setStartTime(null);
      } catch (error) {
        console.error("Failed to save timer session:", error);
      }
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
        {formatTime(time)}
      </div>

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

export default StopwatchTimer;
