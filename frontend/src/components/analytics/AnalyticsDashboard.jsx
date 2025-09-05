import { useState, useEffect } from "react";
import axios from "axios";

function AnalyticsDashboard({ project, onClose }) {
  const [analytics, setAnalytics] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("overview");

  useEffect(() => {
    loadAnalytics();
    loadPerformance();
  }, [project.id]);

  const loadAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3001/api/analytics/project/${project.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  };

  const loadPerformance = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3001/api/analytics/team/${project.id}/performance`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPerformance(response.data.performance);
    } catch (error) {
      console.error("Error loading performance:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  const getAlertColor = (type) => {
    switch (type) {
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "warning":
        return (
          <svg
            className="w-5 h-5 text-yellow-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            className="w-5 h-5 text-red-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5 text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-5/6 mx-4 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">📊 Project Analytics</h1>
              <p className="text-blue-100 mt-1">
                {project.name} - Performance Dashboard
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

          {/* Navigation Tabs */}
          <div className="mt-4">
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveView("overview")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === "overview"
                    ? "bg-white text-blue-600"
                    : "text-blue-100 hover:text-white hover:bg-blue-500"
                }`}
              >
                📈 Overview
              </button>
              <button
                onClick={() => setActiveView("team")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === "team"
                    ? "bg-white text-blue-600"
                    : "text-blue-100 hover:text-white hover:bg-blue-500"
                }`}
              >
                👥 Team Performance
              </button>
              <button
                onClick={() => setActiveView("productivity")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === "productivity"
                    ? "bg-white text-blue-600"
                    : "text-blue-100 hover:text-white hover:bg-blue-500"
                }`}
              >
                📊 Productivity Trends
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeView === "overview" && analytics && (
            <div className="space-y-6">
              {/* Alerts Section */}
              {analytics.alerts && analytics.alerts.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    🚨 Important Alerts
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analytics.alerts.map((alert, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${getAlertColor(
                          alert.type
                        )}`}
                      >
                        <div className="flex items-start space-x-3">
                          {getAlertIcon(alert.type)}
                          <div className="flex-1">
                            <h3 className="font-semibold">{alert.title}</h3>
                            <p className="text-sm mt-1">{alert.message}</p>
                            {alert.members && (
                              <p className="text-xs mt-2 font-medium">
                                Affected: {alert.members.join(", ")}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                  <div className="text-3xl font-bold">
                    {analytics.project.stats.totalTasks}
                  </div>
                  <div className="text-blue-100">Total Tasks</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg">
                  <div className="text-3xl font-bold">
                    {analytics.project.stats.completedTasks}
                  </div>
                  <div className="text-green-100">Completed</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-lg">
                  <div className="text-3xl font-bold">
                    {analytics.project.stats.inProgressTasks}
                  </div>
                  <div className="text-yellow-100">In Progress</div>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-lg">
                  <div className="text-3xl font-bold">
                    {analytics.project.stats.overdueTasks}
                  </div>
                  <div className="text-red-100">Overdue</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg">
                  <div className="text-3xl font-bold">
                    {analytics.project.stats.completionPercentage}%
                  </div>
                  <div className="text-purple-100">Complete</div>
                </div>
              </div>

              {/* Team Workload Distribution */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">
                    👥 Team Workload Distribution
                  </h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {analytics.teamWorkload.map((member) => (
                      <div
                        key={member.member.id}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                              {member.member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {member.member.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {member.member.role}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-lg font-bold ${
                                member.taskStats.completionRate >= 80
                                  ? "text-green-600"
                                  : member.taskStats.completionRate >= 60
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {member.taskStats.completionRate}%
                            </div>
                            <div className="text-xs text-gray-500">
                              Completion Rate
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2 mb-3">
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">
                              {member.taskStats.total}
                            </div>
                            <div className="text-xs text-gray-500">Total</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">
                              {member.taskStats.completed}
                            </div>
                            <div className="text-xs text-gray-500">Done</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-yellow-600">
                              {member.taskStats.inProgress}
                            </div>
                            <div className="text-xs text-gray-500">Active</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-red-600">
                              {member.taskStats.overdue}
                            </div>
                            <div className="text-xs text-gray-500">Overdue</div>
                          </div>
                        </div>

                        <div className="flex justify-between text-sm text-gray-600">
                          <span>
                            ⏱️ {member.timeTracking.totalHoursWorked}h total
                          </span>
                          <span>
                            📈 {member.timeTracking.avgHoursPerTask}h avg/task
                          </span>
                        </div>

                        {member.recentActivity.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs font-medium text-gray-700 mb-2">
                              Recent Activity:
                            </p>
                            {member.recentActivity
                              .slice(0, 2)
                              .map((activity, idx) => (
                                <div
                                  key={idx}
                                  className="text-xs text-gray-600 mb-1"
                                >
                                  • {activity.activity}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === "team" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                🏆 Team Performance Comparison
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {performance.map((member) => (
                  <div
                    key={member.member.id}
                    className="bg-white rounded-lg shadow-sm border p-6"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                        {member.member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {member.member.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {member.member.email}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Tasks Assigned
                        </span>
                        <span className="font-semibold">
                          {member.metrics.tasksAssigned}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Tasks Completed
                        </span>
                        <span className="font-semibold text-green-600">
                          {member.metrics.tasksCompleted}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Hours Logged
                        </span>
                        <span className="font-semibold">
                          {member.metrics.totalHoursLogged}h
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Avg Completion
                        </span>
                        <span className="font-semibold">
                          {member.metrics.avgCompletionRate}%
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">
                            Productivity Score
                          </span>
                          <div className="flex items-center space-x-2">
                            <div
                              className={`text-xl font-bold ${
                                member.metrics.productivityScore >= 80
                                  ? "text-green-600"
                                  : member.metrics.productivityScore >= 60
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {member.metrics.productivityScore}
                            </div>
                            <span className="text-sm text-gray-500">/100</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className={`h-2 rounded-full ${
                              member.metrics.productivityScore >= 80
                                ? "bg-green-500"
                                : member.metrics.productivityScore >= 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{
                              width: `${member.metrics.productivityScore}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === "productivity" && analytics && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                📈 7-Day Productivity Trend
              </h2>
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="grid grid-cols-7 gap-4">
                  {analytics.productivityTrend.map((day, index) => (
                    <div key={index} className="text-center">
                      <div className="text-sm text-gray-600 mb-2">
                        {new Date(day.date).toLocaleDateString([], {
                          weekday: "short",
                        })}
                      </div>
                      <div className="space-y-2">
                        <div className="bg-green-100 rounded p-2">
                          <div className="text-lg font-bold text-green-600">
                            {day.tasksCompleted}
                          </div>
                          <div className="text-xs text-green-700">
                            Completed
                          </div>
                        </div>
                        <div className="bg-blue-100 rounded p-2">
                          <div className="text-lg font-bold text-blue-600">
                            {day.progressUpdates}
                          </div>
                          <div className="text-xs text-blue-700">Updates</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {analytics.alerts && analytics.alerts.length === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium text-green-800">
                      All systems running smoothly!
                    </span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    No alerts or issues detected. Team is performing well.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
