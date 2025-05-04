import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { TimerType, Project } from '../../types';
import { generateId, getCurrentDate } from '../../utils/timeUtils';

interface ProjectSelectorModalProps {
  onClose: () => void;
  onProjectSelected: () => void;
  timerType: TimerType | null;
}

const ProjectSelectorModal = ({ onClose, onProjectSelected, timerType }: ProjectSelectorModalProps) => {
  const { state, setActiveProject, addProject } = useAppContext();
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle project selection
  const handleSelectProject = (projectId: string) => {
    setActiveProject(projectId);
    onProjectSelected();
  };

  // Handle quick project creation
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProjectName.trim()) {
      setError('Project name is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const now = getCurrentDate();
      const projectId = generateId();
      
      const project: Project = {
        id: projectId,
        name: newProjectName,
        description: '',
        color: 'blue-500',
        totalTimeSpent: 0,
        createdAt: now,
        updatedAt: now,
      };
      
      await addProject(project);
      setActiveProject(projectId);
      onProjectSelected();
    } catch (err) {
      setError('Failed to create project. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold dark:text-white">
              {isCreatingProject ? 'Create New Project' : 'Select a Project'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {isCreatingProject ? (
            // Project creation form
            <form onSubmit={handleCreateProject}>
              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
                  {error}
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                  autoFocus
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsCreatingProject(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center"
                >
                  {isSubmitting && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  Create & Select
                </button>
              </div>
            </form>
          ) : (
            // Project selection list
            <>
              {state.projects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    You don't have any projects yet.
                  </p>
                  <button
                    onClick={() => setIsCreatingProject(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Create Your First Project
                  </button>
                </div>
              ) : (
                <>
                  <div className="max-h-60 overflow-y-auto mb-4">
                    <ul className="space-y-2">
                      {state.projects.map(project => (
                        <li key={project.id}>
                          <button
                            onClick={() => handleSelectProject(project.id)}
                            className="w-full text-left px-4 py-3 flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-700"
                          >
                            <div 
                              className="w-4 h-4 rounded-full mr-3 flex-shrink-0" 
                              style={{ backgroundColor: `var(--${project.color.replace('-', '-')})` }}
                            ></div>
                            <div>
                              <div className="font-medium dark:text-white">{project.name}</div>
                              {project.description && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                  {project.description}
                                </div>
                              )}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <button
                      onClick={() => setIsCreatingProject(true)}
                      className="w-full text-left px-3 py-2 text-primary-600 dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Create New Project
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectSelectorModal;
