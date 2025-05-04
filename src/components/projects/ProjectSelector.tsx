import { useState, useEffect, useRef } from "react";
import { useAppContext } from "../../context/AppContext";
import QuickProjectForm from "./QuickProjectForm";

const ProjectSelector = () => {
  const { state, setActiveProject } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [showQuickProjectForm, setShowQuickProjectForm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeProject = state.projects.find(
    (p) => p.id === state.activeProject
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectProject = (projectId: string) => {
    setActiveProject(projectId);
    setIsOpen(false);
  };

  return (
    <div className="w-full max-w-md mx-auto mb-8" ref={dropdownRef}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h3 className="text-lg font-medium mb-2 dark:text-white">
          Active Project
        </h3>

        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between p-3 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {activeProject ? (
              <div className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{
                    backgroundColor: `var(--${activeProject.color.replace(
                      "-",
                      "-"
                    )})`,
                  }}
                ></div>
                <span>{activeProject.name}</span>
              </div>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">
                Select a project
              </span>
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
              {state.projects.length === 0 ? (
                <div className="p-3 text-gray-500 dark:text-gray-400 text-center">
                  No projects available
                </div>
              ) : (
                <ul>
                  {state.projects.map((project) => (
                    <li key={project.id}>
                      <button
                        onClick={() => handleSelectProject(project.id)}
                        className={`w-full text-left px-4 py-2 flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          state.activeProject === project.id
                            ? "bg-gray-100 dark:bg-gray-700"
                            : ""
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-full mr-2"
                          style={{
                            backgroundColor: `var(--${project.color.replace(
                              "-",
                              "-"
                            )})`,
                          }}
                        ></div>
                        <span className="dark:text-white">{project.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowQuickProjectForm(true);
                  }}
                  className="w-full text-left px-3 py-2 text-primary-600 dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Create New Project
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Project Form Modal */}
      {showQuickProjectForm && (
        <QuickProjectForm onClose={() => setShowQuickProjectForm(false)} />
      )}
    </div>
  );
};

export default ProjectSelector;
