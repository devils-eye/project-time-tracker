import { useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { useAppContext } from "../../context/AppContext";
import { isToday } from "../../utils/dateUtils";
import { formatTime } from "../../utils/timeUtils";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

// Helper function to get CSS variable value
const getCssVariableValue = (variableName: string): string => {
  return (
    getComputedStyle(document.documentElement).getPropertyValue(variableName) ||
    "#6366f1"
  );
};

// Helper function to convert hex to rgba
const hexToRgba = (hex: string, alpha: number = 0.8): string => {
  // Remove the hash if it exists
  hex = hex.replace("#", "");

  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Return rgba string
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const ProjectDistributionChart = () => {
  const { state } = useAppContext();

  // Get today's sessions
  const getTodaySessions = () => {
    return state.completedSessions.filter((session) => {
      const sessionDate = new Date(session.startTime);
      return isToday(sessionDate);
    });
  };

  // Group sessions by project
  const getProjectData = () => {
    const todaySessions = getTodaySessions();
    
    // Create a map to store total duration by project
    const projectDurations = new Map<string, number>();
    
    // Calculate total duration for each project
    todaySessions.forEach((session) => {
      const projectId = session.projectId;
      const currentDuration = projectDurations.get(projectId) || 0;
      projectDurations.set(projectId, currentDuration + session.duration);
    });
    
    // Prepare data for the pie chart
    const labels: string[] = [];
    const data: number[] = [];
    const backgroundColor: string[] = [];
    const borderColor: string[] = [];
    
    // Convert the map to arrays for Chart.js
    projectDurations.forEach((duration, projectId) => {
      const project = state.projects.find(p => p.id === projectId);
      if (project) {
        labels.push(project.name);
        // Convert seconds to hours
        data.push(Math.round((duration / 3600) * 100) / 100);
        
        const color = getCssVariableValue(`--${project.color}`);
        backgroundColor.push(hexToRgba(color, 0.7));
        borderColor.push(color);
      }
    });
    
    return {
      labels,
      data,
      backgroundColor,
      borderColor,
      totalTime: todaySessions.reduce((total, session) => total + session.duration, 0)
    };
  };

  const { labels, data, backgroundColor, borderColor, totalTime } = getProjectData();
  const hasData = data.length > 0;

  // Prepare chart data
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor,
        borderColor,
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          padding: 20,
          boxWidth: 12,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: "Today's Time Distribution",
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = Math.round((value / data.reduce((a, b) => a + b, 0)) * 100);
            return `${label}: ${value.toFixed(2)} hours (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold dark:text-white">Today's Distribution</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total: {formatTime(totalTime)}
        </div>
      </div>

      {hasData ? (
        <div className="h-80">
          <Pie data={chartData} options={options} />
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400 text-center">
            No time data available for today.
            <br />
            Start tracking time to see your statistics.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectDistributionChart;
