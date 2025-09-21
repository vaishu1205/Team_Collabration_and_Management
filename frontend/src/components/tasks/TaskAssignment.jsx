import { useState, useEffect } from "react";
import axios from "axios";

function TaskAssignment({ project, onClose, onTaskCreated }) {
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigneeId: "",
    priority: "medium",
    dueDate: "",
    estimatedHours: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3001/api/projects/${project.id}/members`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMembers(response.data.members);
    } catch (error) {
      console.error("Error loading members:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3001/api/tasks",
        {
          ...formData,
          projectId: project.id,
          estimatedHours: formData.estimatedHours
            ? parseFloat(formData.estimatedHours)
            : null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Task assigned successfully!");
      onTaskCreated();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = {
    low: "from-blue-100 to-cyan-100 text-blue-800",
    medium: "from-yellow-100 to-orange-100 text-yellow-800",
    high: "from-orange-100 to-red-100 text-orange-800",
    urgent: "from-red-100 to-pink-100 text-red-800",
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-violet-900/50 to-indigo-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-500 to-indigo-600 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Assign New Task
                </h2>
                <p className="text-violet-100">
                  Create and assign a task to team members
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
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

          {/* Project Info */}
          <div className="mt-4 p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
            <div className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: project.color }}
              ></div>
              <span className="font-semibold text-white">{project.name}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all duration-200"
                placeholder="e.g., Implement user authentication system"
                required
              />
            </div>

            {/* Task Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Task Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows="3"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all duration-200 resize-none"
                placeholder="Detailed description of what needs to be done..."
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assign To */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Assign To *
                </label>
                <div className="relative">
                  <select
                    value={formData.assigneeId}
                    onChange={(e) =>
                      setFormData({ ...formData, assigneeId: e.target.value })
                    }
                    className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all duration-200 appearance-none"
                    required
                  >
                    <option value="">Select team member</option>
                    {members.map((member) => (
                      <option key={member.user.id} value={member.user.id}>
                        {member.user.name} ({member.user.email})
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>
                {members.length === 0 && (
                  <p className="text-xs text-red-600 mt-2 flex items-center space-x-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>
                      No team members available. Add members to the project
                      first.
                    </span>
                  </p>
                )}
              </div>

              {/* Priority Level */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Priority Level
                </label>
                <div className="relative">
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all duration-200 appearance-none"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                {formData.priority && (
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${
                        priorityColors[formData.priority]
                      }`}
                    >
                      {formData.priority.charAt(0).toUpperCase() +
                        formData.priority.slice(1)}{" "}
                      Priority
                    </span>
                  </div>
                )}
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Due Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all duration-200"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Estimated Hours */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estimated Hours
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="200"
                    value={formData.estimatedHours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimatedHours: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all duration-200"
                    placeholder="e.g., 8"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title || !formData.assigneeId}
                className="px-6 py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Assigning Task...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                    <span>Assign Task</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TaskAssignment;
