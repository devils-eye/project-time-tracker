import { Project } from "../../types";
import { formatTime, formatHours } from "../../utils/timeUtils";
import { useAppContext } from "../../context/AppContext";

interface ProjectCardProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}

const ProjectCard = ({ project, onEdit, onDelete }: ProjectCardProps) => {
  const { setActiveProject, state } = useAppContext();
  const isActive = state.activeProject === project.id;

  const handleSelect = () => {
    setActiveProject(isActive ? null : project.id);
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 ${
        isActive ? "border-primary-600" : `border-${project.color}`
      }`}
      style={{
        borderLeftColor: isActive
          ? ""
          : `var(--${project.color.replace("-", "-")})`,
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold dark:text-white">
          {project.name}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="p-1 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
            title="Edit project"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
            title="Delete project"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-300 mb-4">
        {project.description}
      </p>

      {project.goalHours && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Progress:{" "}
              {Math.round(
                (project.totalTimeSpent / (project.goalHours * 3600)) * 100
              )}
              %
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Goal: {formatHours(project.goalHours)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  (project.totalTimeSpent / (project.goalHours * 3600)) * 100
                )}%`,
                backgroundColor: `var(--${project.color})`,
              }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total time:
          </span>
          <span className="ml-2 font-mono dark:text-gray-300">
            {formatTime(project.totalTimeSpent)}
          </span>
        </div>

        <button
          onClick={handleSelect}
          className={`px-4 py-2 rounded-md ${
            isActive
              ? "bg-primary-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {isActive ? "Selected" : "Select"}
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
