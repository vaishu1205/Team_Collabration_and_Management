import { useState, useEffect } from "react";
import axios from "axios";

function CreateTask({ projectId, onTaskCreated, onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigneeId: "",
    priority: "medium",
    dueDate: "",
  });
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProjectMembers();
  }, []);

  const loadProjectMembers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3001/api/projects/${projectId}/members`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProjectMembers(response.data.members);
    } catch (error) {
      console.error("Error loading members:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const taskData = {
        ...formData,
        projectId,
        assigneeId: formData.assigneeId || null,
      };

      const response = await axios.post(
        "http://localhost:3001/api/tasks",
        taskData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Task created and assigned successfully!");
      onTaskCreated(response.data.task);
      onClose();
    } catch (error) {
      alert("Error creating task");
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
    <div className="fixed inset-0 bg-gradient-to-br from-violet-900/50 to-indigo-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 w-full max-w-md mx-auto my-8 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-500 to-indigo-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Create Task</h2>
                <p className="text-violet-100 text-xs">
                  Add new task to project
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-all duration-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Task Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Task Title
              </label>
              <input
                type="text"
                placeholder="Enter task title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all duration-200"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Description
              </label>
              <textarea
                placeholder="Task description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all duration-200 resize-none"
                rows="2"
              />
            </div>

            {/* Assign To */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Assign To
              </label>
              <select
                value={formData.assigneeId}
                onChange={(e) =>
                  setFormData({ ...formData, assigneeId: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all duration-200"
              >
                <option value="">Select team member</option>
                {projectMembers.map((member) => (
                  <option key={member.id} value={member.user.id}>
                    {member.user.name} ({member.user.email})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for unassigned task
              </p>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all duration-200"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
              {formData.priority && (
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${
                      priorityColors[formData.priority]
                    }`}
                  >
                    {formData.priority.charAt(0).toUpperCase() +
                      formData.priority.slice(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all duration-200"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  "Create Task"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateTask;

