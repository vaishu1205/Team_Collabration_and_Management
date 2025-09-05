import { useState, useEffect } from "react";
import axios from "axios";

function ProjectTimeline({ project, onClose }) {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, [project.id]);

  const loadTimeline = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3001/api/calendar/timeline/${project.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTimeline(response.data.timeline);
    } catch (error) {
      console.error("Error loading timeline:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return "✅";
      case "in_progress":
        return "🔄";
      case "blocked":
        return "🚫";
      default:
        return "📋";
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl h-5/6 mx-4 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">📊 Project Timeline</h1>
              <p className="text-green-100 mt-1">
                {project.name} - Gantt Chart View
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200"
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

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p>Loading project timeline...</p>
            </div>
          ) : timeline.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-gray-500 text-lg">No tasks with dates found</p>
              <p className="text-gray-400 text-sm mt-2">
                Add due dates to tasks to see them in the timeline
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {timeline.map((task, index) => {
                const duration = calculateDuration(
                  task.startDate,
                  task.endDate
                );
                const daysFromStart = calculateDuration(
                  timeline[0].startDate,
                  task.startDate
                );
                const totalProjectDays = calculateDuration(
                  timeline[0].startDate,
                  timeline[timeline.length - 1].endDate
                );

                return (
                  <div
                    key={task.id}
                    className="bg-white border rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">
                          {getStatusIcon(task.status)}
                        </span>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {task.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Assigned to:{" "}
                            <span className="font-medium">{task.assignee}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            task.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : task.status === "in_progress"
                              ? "bg-blue-100 text-blue-800"
                              : task.status === "blocked"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {task.status.replace("_", " ")}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {duration} day{duration !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    {/* Timeline Bar */}
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-8 mb-2">
                        <div
                          className="h-8 rounded-full flex items-center px-3 text-white text-sm font-medium"
                          style={{
                            backgroundColor: task.color,
                            width: `${Math.max(
                              (duration / totalProjectDays) * 100,
                              5
                            )}%`,
                            marginLeft: `${
                              (daysFromStart / totalProjectDays) * 100
                            }%`,
                          }}
                        >
                          {task.progress}%
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{formatDate(task.startDate)}</span>
                        <span>{formatDate(task.endDate)}</span>
                      </div>
                    </div>

                    {/* Priority Badge */}
                    <div className="mt-2 flex justify-between items-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          task.priority === "urgent"
                            ? "bg-red-500 text-white"
                            : task.priority === "high"
                            ? "bg-orange-500 text-white"
                            : task.priority === "medium"
                            ? "bg-yellow-500 text-white"
                            : "bg-blue-500 text-white"
                        }`}
                      >
                        {task.priority} priority
                      </span>
                      <div className="text-xs text-gray-500">
                        Progress: {task.progress}% complete
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Timeline Summary */}
              <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">
                  📈 Project Timeline Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {timeline.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {timeline.filter((t) => t.status === "completed").length}
                    </div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {
                        timeline.filter((t) => t.status === "in_progress")
                          .length
                      }
                    </div>
                    <div className="text-sm text-gray-600">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {calculateDuration(
                        timeline[0]?.startDate || new Date(),
                        timeline[timeline.length - 1]?.endDate || new Date()
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Total Days</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectTimeline;
