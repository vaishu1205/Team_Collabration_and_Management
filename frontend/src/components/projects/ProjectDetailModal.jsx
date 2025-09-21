import { useState, useEffect } from "react";
import axios from "axios";
import ProgressUpdate from "../progress/ProgressUpdate";
import ProgressHistory from "../progress/ProgressHistory";
import ProjectChat from "../chat/ProjectChat";
import TaskAssignment from "../tasks/TaskAssignment";
import TaskManagement from "../tasks/TaskManagement";
import AnalyticsDashboard from "../analytics/AnalyticsDashboard";
import FileManager from "../files/FileManager";
import TimeTracker from "../time/TimeTracker";
import Timesheet from "../time/Timesheet";
import Calendar from "../calendar/Calendar";
import ProjectTimeline from "../calendar/ProjectTimeline";
import UpcomingDeadlines from "../calendar/UpcomingDeadlines";
import EmailSettings from "../settings/EmailSettings";

function ProjectDetailModal({ project, onClose }) {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showProgressUpdate, setShowProgressUpdate] = useState(false);
  const [showProgressHistory, setShowProgressHistory] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks");
  const [showTaskAssignment, setShowTaskAssignment] = useState(false);
  const [showTaskManagement, setShowTaskManagement] = useState(false);
  const [selectedTaskForManagement, setSelectedTaskForManagement] =
    useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showTimeTracker, setShowTimeTracker] = useState(false);
  const [showTimesheet, setShowTimesheet] = useState(false);
  const [selectedTaskForTimer, setSelectedTaskForTimer] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showDeadlines, setShowDeadlines] = useState(false);
  const [showEmailSettings, setShowEmailSettings] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    loadTasks();
    loadMembers();
  }, [project.id]);

  const loadTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3001/api/tasks/project/${project.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTasks(response.data.tasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

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

  const canUpdateTask = (task) => {
    return task.assignee && task.assignee.id === currentUser?.id;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "from-emerald-100 to-teal-100 text-emerald-800";
      case "in_progress":
        return "from-yellow-100 to-orange-100 text-yellow-800";
      case "blocked":
        return "from-red-100 to-pink-100 text-red-800";
      default:
        return "from-gray-100 to-gray-200 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "from-red-500 to-pink-500 text-white";
      case "high":
        return "from-orange-500 to-red-500 text-white";
      case "medium":
        return "from-yellow-500 to-orange-500 text-white";
      default:
        return "from-blue-500 to-cyan-500 text-white";
    }
  };

  if (!currentUser) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-violet-900/50 to-indigo-900/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">
              Loading project details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-violet-900/50 to-indigo-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-500 to-indigo-600 p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div
                className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
                style={{ backgroundColor: project.color }}
              ></div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {project.name}
                </h1>
                <p className="text-violet-100 mt-1">{project.description}</p>
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

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setShowEmailSettings(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <span>📧</span>
              <span>Email Settings</span>
            </button>
            <button
              onClick={() => setShowTimesheet(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <span>📋</span>
              <span>Timesheet</span>
            </button>
            {currentUser?.role === "manager" && (
              <button
                onClick={() => setShowAnalytics(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <span>📊</span>
                <span>Analytics</span>
              </button>
            )}
            <button
              onClick={() => setShowChat(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <span>💬</span>
              <span>Team Chat</span>
            </button>
            <button
              onClick={() => setShowCalendar(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <span>📅</span>
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setShowTimeline(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <span>📈</span>
              <span>Timeline</span>
            </button>
            <button
              onClick={() => setShowDeadlines(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <span>⏰</span>
              <span>Deadlines</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("tasks")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "tasks"
                    ? "border-white text-white"
                    : "border-transparent text-violet-200 hover:text-white"
                }`}
              >
                Tasks & Progress
              </button>
              <button
                onClick={() => setActiveTab("files")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "files"
                    ? "border-white text-white"
                    : "border-transparent text-violet-200 hover:text-white"
                }`}
              >
                📂 Project Files
              </button>
              <button
                onClick={() => setActiveTab("members")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "members"
                    ? "border-white text-white"
                    : "border-transparent text-violet-200 hover:text-white"
                }`}
              >
                Team Members ({members.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50/30 to-white/30">
          {activeTab === "tasks" && (
            <div className="space-y-6">
              {/* Task Management Header */}
              {currentUser?.role === "manager" && (
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-800">
                    Task Management
                  </h3>
                  <button
                    onClick={() => setShowTaskAssignment(true)}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-cyan-600 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    + Assign New Task
                  </button>
                </div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4">
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
                      <div className="text-2xl font-bold text-blue-600">
                        {tasks.length}
                      </div>
                      <div className="text-sm text-gray-600">Total Tasks</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mr-4">
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-emerald-600">
                        {tasks.filter((t) => t.status === "completed").length}
                      </div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-4">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {tasks.filter((t) => t.status === "in_progress").length}
                      </div>
                      <div className="text-sm text-gray-600">In Progress</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
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
                          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {tasks.filter((t) => t.status === "blocked").length}
                      </div>
                      <div className="text-sm text-gray-600">Blocked</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-4">
                {tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-gray-500"
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
                    <p className="text-gray-600 font-medium">
                      No tasks in this project yet
                    </p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-2">
                            {task.title}
                          </h3>
                          <p className="text-gray-600 mb-3">
                            {task.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            {task.assignee && (
                              <span className="flex items-center space-x-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                                  {task.assignee.name.charAt(0).toUpperCase()}
                                </div>
                                <span>{task.assignee.name}</span>
                              </span>
                            )}
                            {task.dueDate && (
                              <span className="flex items-center space-x-1">
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
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                <span>
                                  Due:{" "}
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getPriorityColor(
                              task.priority
                            )} shadow-lg`}
                          >
                            {task.priority}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getStatusColor(
                              task.status
                            )} shadow-lg`}
                          >
                            {task.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>

                      {/* TASK ACTION BUTTONS */}
                      {canUpdateTask(task) && (
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => {
                              setSelectedTaskForTimer(task);
                              setShowTimeTracker(true);
                            }}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-600 text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            ⏱️ Track Time
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setShowProgressUpdate(true);
                            }}
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-cyan-600 text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            📈 Update Progress
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setShowProgressHistory(true);
                            }}
                            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-lg hover:from-gray-600 hover:to-gray-700 text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            📊 View History
                          </button>
                        </div>
                      )}

                      {currentUser?.role === "manager" && (
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => {
                              setSelectedTaskForManagement(task);
                              setShowTaskManagement(true);
                            }}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            Manage Task
                          </button>
                          {!canUpdateTask(task) && task.assignee && (
                            <button
                              onClick={() => {
                                setSelectedTask(task);
                                setShowProgressHistory(true);
                              }}
                              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium transition-all duration-200"
                            >
                              View Progress
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "files" && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <FileManager type="project" id={project.id} title="Project" />
            </div>
          )}

          {activeTab === "members" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">
                        {member.user.name}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {member.user.email}
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          member.role === "manager"
                            ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800"
                            : "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800"
                        }`}
                      >
                        {member.role}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      <strong>Tasks assigned:</strong>{" "}
                      {
                        tasks.filter((t) => t.assignee?.id === member.user.id)
                          .length
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ALL MODALS */}
      {showTaskAssignment && (
        <TaskAssignment
          project={project}
          onClose={() => setShowTaskAssignment(false)}
          onTaskCreated={() => {
            loadTasks();
            setShowTaskAssignment(false);
          }}
        />
      )}

      {showTaskManagement && selectedTaskForManagement && (
        <TaskManagement
          task={selectedTaskForManagement}
          members={members}
          onClose={() => setShowTaskManagement(false)}
          onTaskUpdated={() => {
            loadTasks();
            setShowTaskManagement(false);
          }}
        />
      )}

      {showProgressUpdate && selectedTask && (
        <ProgressUpdate
          task={selectedTask}
          onClose={() => setShowProgressUpdate(false)}
          onProgressUpdated={() => {
            loadTasks();
            setShowProgressUpdate(false);
          }}
        />
      )}

      {showProgressHistory && selectedTask && (
        <ProgressHistory
          task={selectedTask}
          onClose={() => setShowProgressHistory(false)}
        />
      )}

      {showAnalytics && (
        <AnalyticsDashboard
          project={project}
          onClose={() => setShowAnalytics(false)}
        />
      )}

      {/* Calendar Views */}
      {showCalendar && (
        <Calendar project={project} onClose={() => setShowCalendar(false)} />
      )}

      {showTimeline && (
        <ProjectTimeline
          project={project}
          onClose={() => setShowTimeline(false)}
        />
      )}

      {showDeadlines && (
        <UpcomingDeadlines onClose={() => setShowDeadlines(false)} />
      )}

      {showTimeTracker && (
        <TimeTracker
          project={project}
          task={selectedTaskForTimer}
          onClose={() => setShowTimeTracker(false)}
        />
      )}

      {showTimesheet && <Timesheet onClose={() => setShowTimesheet(false)} />}

      {showChat && (
        <ProjectChat
          project={project}
          currentUser={currentUser}
          onClose={() => setShowChat(false)}
        />
      )}

      {/* EMAIL SETTINGS MODAL */}
      {showEmailSettings && (
        <EmailSettings onClose={() => setShowEmailSettings(false)} />
      )}
    </div>
  );
}

export default ProjectDetailModal;

