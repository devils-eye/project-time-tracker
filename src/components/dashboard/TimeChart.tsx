import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useAppContext } from "../../context/AppContext";
import {
  getLast7Days,
  getDaysInCurrentMonth,
  getDayName,
  formatDayMonth,
} from "../../utils/dateUtils";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type TimeRange = "daily" | "weekly" | "monthly";

// Helper function to get CSS variable value
const getCssVariableValue = (variableName: string): string => {
  return (
    getComputedStyle(document.documentElement).getPropertyValue(variableName) ||
    "#6366f1"
  );
};

// Helper function to convert hex to rgba
const hexToRgba = (hex: string, alpha: number = 0.6): string => {
  // Remove the hash if it exists
  hex = hex.replace("#", "");

  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Return rgba string
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const TimeChart = () => {
  const { state } = useAppContext();
  const [timeRange, setTimeRange] = useState<TimeRange>("daily");

  // Get the appropriate dates and labels based on the selected time range
  const getDatesAndLabels = () => {
    switch (timeRange) {
      case "daily":
        // Today's data by hour
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return {
          dates: [today],
          labels: ["Today"],
        };
      case "weekly":
        // Last 7 days
        const last7Days = getLast7Days();
        return {
          dates: last7Days,
          labels: last7Days.map((date) => getDayName(date)),
        };
      case "monthly":
        // Current month
        const daysInMonth = getDaysInCurrentMonth();
        return {
          dates: daysInMonth,
          labels: daysInMonth.map((date) => formatDayMonth(date)),
        };
      default:
        return {
          dates: [],
          labels: [],
        };
    }
  };

  const { dates, labels } = getDatesAndLabels();

  // Group sessions by project and date
  const getProjectDataByDate = () => {
    // Create a map of projects with their colors
    const projectsMap = new Map(
      state.projects.map((project) => [
        project.id,
        {
          name: project.name,
          color: project.color,
          cssColor: getCssVariableValue(`--${project.color}`),
        },
      ])
    );

    // Initialize datasets for each project
    const datasets = state.projects.map((project) => {
      const color = getCssVariableValue(`--${project.color}`);
      return {
        label: project.name,
        data: Array(dates.length).fill(0), // Initialize with zeros for each date
        backgroundColor: hexToRgba(color),
        borderColor: color,
        borderWidth: 1,
      };
    });

    // Calculate hours worked for each project on each date
    dates.forEach((date, dateIndex) => {
      const dayStart = new Date(date);
      const dayEnd = new Date(date);
      dayEnd.setDate(dayEnd.getDate() + 1);

      // Filter sessions for this date
      const sessionsOnDate = state.completedSessions.filter((session) => {
        const sessionDate = new Date(session.startTime);
        return sessionDate >= dayStart && sessionDate < dayEnd;
      });

      // Group by project and calculate hours
      sessionsOnDate.forEach((session) => {
        const projectIndex = state.projects.findIndex(
          (p) => p.id === session.projectId
        );
        if (projectIndex !== -1) {
          // Convert seconds to hours and add to the project's data for this date
          const hoursWorked = Math.round((session.duration / 3600) * 100) / 100;
          datasets[projectIndex].data[dateIndex] += hoursWorked;
        }
      });
    });

    // Filter out projects with no data
    return datasets.filter((dataset) =>
      dataset.data.some((value) => value > 0)
    );
  };

  // Prepare chart data
  const chartData = {
    labels,
    datasets: getProjectDataByDate(),
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Hours Worked by Project",
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.dataset.label || "";
            const value = context.raw || 0;
            return `${label}: ${value.toFixed(2)} hours`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: "Hours",
        },
      },
    },
  };

  // Get project datasets
  const projectDatasets = getProjectDataByDate();
  const hasData = projectDatasets.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold dark:text-white">Time Analysis</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange("daily")}
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === "daily"
                ? "bg-primary-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeRange("weekly")}
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === "weekly"
                ? "bg-primary-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimeRange("monthly")}
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === "monthly"
                ? "bg-primary-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {hasData ? (
        <div className="h-80">
          <Bar
            data={{ ...chartData, datasets: projectDatasets }}
            options={options}
          />
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400 text-center">
            No time data available for this period.
            <br />
            Start tracking time to see your statistics.
          </p>
        </div>
      )}
    </div>
  );
};

export default TimeChart;
