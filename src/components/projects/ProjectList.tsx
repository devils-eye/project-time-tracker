import { useState } from "react";
import { Project } from "../../types";
import ProjectCard from "./ProjectCard";
import ProjectForm from "./ProjectForm";
import { useAppContext } from "../../context/AppContext";

const ProjectList = () => {
  const { state, addProject, updateProject, deleteProject } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddClick = () => {
    setEditingProject(null);
    setShowForm(true);
    setError(null);
  };

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
    setError(null);
  };

  const handleDeleteClick = async (projectId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      try {
        setIsSubmitting(true);
        await deleteProject(projectId);
      } catch (err) {
        setError("Failed to delete project. Please try again.");
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleFormSubmit = async (project: Project) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (editingProject) {
        await updateProject(project);
      } else {
        await addProject(project);
      }

      setShowForm(false);
      setEditingProject(null);
    } catch (err) {
      setError("Failed to save project. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProject(null);
    setError(null);
  };

  return (
    <div>
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 text-white p-6 rounded-lg mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Your Projects</h2>
            <p className="text-primary-100 mb-4 md:mb-0">
              Create and manage your projects to track time effectively
            </p>
          </div>
          <button
            onClick={handleAddClick}
            className="px-4 py-2 bg-white text-primary-700 rounded-md hover:bg-primary-50 transition-colors flex items-center"
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
            Add Project
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-8">
          <ProjectForm
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            initialProject={editingProject || undefined}
            isSubmitting={isSubmitting}
            error={error}
          />
        </div>
      )}

      {state.projects.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <p className="text-gray-600 mb-4">You don't have any projects yet.</p>
          <button
            onClick={handleAddClick}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => handleEditClick(project)}
              onDelete={() => handleDeleteClick(project.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
