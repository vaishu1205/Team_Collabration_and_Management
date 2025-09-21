import { useState } from "react";

function CreateProject({ onProjectCreated, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/projects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create project");
      }

      // You can replace this with a toast notification in your app
      console.log("Project created successfully!");
      onProjectCreated(data.project);
      onClose();
    } catch (error) {
      setError(error.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  // Color options for quick selection
  const colorOptions = [
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#EF4444", // Red
    "#8B5CF6", // Purple
    "#F97316", // Orange
    "#06B6D4", // Cyan
    "#84CC16", // Lime
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Create New Project</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-500 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                required
                placeholder="Enter project name"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 resize-none"
                placeholder="Describe your project goals and objectives..."
              />
            </div>

            {/* Project Color */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Project Color
              </label>

              {/* Color Picker Grid */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-12 h-12 rounded-xl border-2 transition-all duration-200 ${
                      formData.color === color
                        ? "border-slate-400 scale-110 shadow-lg"
                        : "border-slate-200 hover:border-slate-300 hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Custom Color Input */}
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-12 h-12 border border-slate-200 rounded-xl cursor-pointer"
                />
                <span className="text-sm text-slate-600">
                  Or pick a custom color
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-semibold transition-colors shadow-sm hover:shadow-md flex items-center"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Creating...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Create Project
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateProject;
