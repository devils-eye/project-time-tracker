import { useState, useEffect } from "react";
import { Project } from "../../types";
import { generateId, getCurrentDate } from "../../utils/timeUtils";

interface ProjectFormProps {
  onSubmit: (project: Project) => void;
  onCancel: () => void;
  initialProject?: Project;
  isSubmitting?: boolean;
  error?: string | null;
}

const colorOptions = [
  // Primary colors
  { value: "red-500", label: "Red" },
  { value: "blue-500", label: "Blue" },
  { value: "green-500", label: "Green" },
  { value: "yellow-500", label: "Yellow" },
  { value: "purple-500", label: "Purple" },
  { value: "pink-500", label: "Pink" },
  { value: "indigo-500", label: "Indigo" },

  // Additional colors
  { value: "orange-500", label: "Orange" },
  { value: "teal-500", label: "Teal" },
  { value: "cyan-500", label: "Cyan" },
  { value: "lime-500", label: "Lime" },
  { value: "emerald-500", label: "Emerald" },
  { value: "sky-500", label: "Sky" },
  { value: "amber-500", label: "Amber" },
  { value: "rose-500", label: "Rose" },
  { value: "fuchsia-500", label: "Fuchsia" },
  { value: "slate-500", label: "Slate" },
  { value: "gray-500", label: "Gray" },
];

const ProjectForm = ({
  onSubmit,
  onCancel,
  initialProject,
  isSubmitting = false,
  error = null,
}: ProjectFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("blue-500");
  const [goalHours, setGoalHours] = useState<string>("");

  useEffect(() => {
    if (initialProject) {
      setName(initialProject.name);
      setDescription(initialProject.description);
      setColor(initialProject.color);
      setGoalHours(initialProject.goalHours?.toString() || "");
    }
  }, [initialProject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Project name is required");
      return;
    }

    const now = getCurrentDate();

    // Parse goal hours to a number if provided
    const parsedGoalHours =
      goalHours.trim() !== "" ? parseFloat(goalHours) : undefined;

    const project: Project = {
      id: initialProject?.id || generateId(),
      name,
      description,
      color,
      totalTimeSpent: initialProject?.totalTimeSpent || 0,
      goalHours: parsedGoalHours,
      createdAt: initialProject?.createdAt || now,
      updatedAt: now,
    };

    onSubmit(project);

    // Reset form if not editing
    if (!initialProject) {
      setName("");
      setDescription("");
      setColor("blue-500");
      setGoalHours("");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6 dark:text-white">
        {initialProject ? "Edit Project" : "Create New Project"}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
          >
            Project Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full p-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="goalHours"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
          >
            Goal Hours (optional)
          </label>
          <div className="relative">
            <input
              type="number"
              id="goalHours"
              value={goalHours}
              onChange={(e) => setGoalHours(e.target.value)}
              min="0"
              step="0.5"
              placeholder="e.g., 40"
              className="w-full p-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Set a target number of hours to work on this project
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Color
          </label>
          <div className="grid grid-cols-6 sm:grid-cols-9 gap-3 max-w-2xl">
            {colorOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setColor(option.value)}
                className="relative flex items-center justify-center"
                title={option.label}
              >
                <span
                  className={`absolute inset-0 rounded-full ${
                    color === option.value
                      ? "ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500"
                      : ""
                  }`}
                  style={{
                    backgroundColor: `var(--${option.value})`,
                  }}
                ></span>
                <span className="relative w-8 h-8"></span>
              </button>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Selected:{" "}
            {colorOptions.find((opt) => opt.value === color)?.label || "Blue"}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center"
          >
            {isSubmitting && (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {initialProject ? "Update Project" : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
