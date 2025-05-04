import { useState } from 'react';
import { TimerType } from '../../types';

interface TimerControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onTimerTypeChange: (type: TimerType) => void;
  timerType: TimerType;
  onDurationChange?: (duration: number) => void;
  initialDuration?: number;
}

const TimerControls = ({
  isRunning,
  onStart,
  onPause,
  onReset,
  onTimerTypeChange,
  timerType,
  onDurationChange,
  initialDuration = 0,
}: TimerControlsProps) => {
  const [hours, setHours] = useState(Math.floor(initialDuration / 3600));
  const [minutes, setMinutes] = useState(Math.floor((initialDuration % 3600) / 60));
  const [seconds, setSeconds] = useState(initialDuration % 60);

  const handleDurationChange = () => {
    if (onDurationChange) {
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      onDurationChange(totalSeconds);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-center mb-6">
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-l-md ${
              timerType === 'stopwatch'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => onTimerTypeChange('stopwatch')}
          >
            Stopwatch
          </button>
          <button
            className={`px-4 py-2 rounded-r-md ${
              timerType === 'countdown'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => onTimerTypeChange('countdown')}
          >
            Countdown
          </button>
        </div>
      </div>

      {timerType === 'countdown' && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Set Duration</h3>
          <div className="flex space-x-2">
            <div>
              <label className="block text-sm text-gray-600">Hours</label>
              <input
                type="number"
                min="0"
                value={hours}
                onChange={(e) => {
                  setHours(parseInt(e.target.value) || 0);
                }}
                onBlur={handleDurationChange}
                className="w-20 p-2 border rounded"
                disabled={isRunning}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Minutes</label>
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => {
                  setMinutes(parseInt(e.target.value) || 0);
                }}
                onBlur={handleDurationChange}
                className="w-20 p-2 border rounded"
                disabled={isRunning}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Seconds</label>
              <input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => {
                  setSeconds(parseInt(e.target.value) || 0);
                }}
                onBlur={handleDurationChange}
                className="w-20 p-2 border rounded"
                disabled={isRunning}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center space-x-4">
        {!isRunning ? (
          <button
            onClick={onStart}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Start
          </button>
        ) : (
          <button
            onClick={onPause}
            className="px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
          >
            Pause
          </button>
        )}
        <button
          onClick={onReset}
          className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default TimerControls;
