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
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "blocked":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      default:
        return "bg-blue-500 text-white";
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl h-5/6 flex flex-col mx-4">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: project.color }}
              ></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {project.name}
                </h1>
                <p className="text-gray-600">{project.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* TIME TRACKING BUTTONS */}
              <button
                onClick={() => setShowEmailSettings(true)}
                className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 font-medium text-sm"
              >
                ✉️ Email Settings
              </button>
              <button
                onClick={() => setShowTimesheet(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium text-sm"
              >
                📋 Timesheet
              </button>
              {currentUser?.role === "manager" && (
                <button
                  onClick={() => setShowAnalytics(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium text-sm"
                >
                  📊 Analytics
                </button>
              )}
              <button
                onClick={() => setShowChat(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
              >
                Team Chat
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
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
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCalendar(true)}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 font-medium text-sm"
            >
              📅 Calendar
            </button>
            <button
              onClick={() => setShowTimeline(true)}
              className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 font-medium text-sm"
            >
              📊 Timeline
            </button>
            <button
              onClick={() => setShowDeadlines(true)}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 font-medium text-sm"
            >
              ⏰ Deadlines
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-4 border-b">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("tasks")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "tasks"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Tasks & Progress
              </button>
              <button
                onClick={() => setActiveTab("files")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "files"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                📂 Project Files
              </button>
              <button
                onClick={() => setActiveTab("members")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "members"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Team Members ({members.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "tasks" && (
            <div className="space-y-6">
              {/* Task Management Header */}
              {currentUser?.role === "manager" && (
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Task Management</h3>
                  <button
                    onClick={() => setShowTaskAssignment(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    + Assign New Task
                  </button>
                </div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {tasks.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Tasks</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {tasks.filter((t) => t.status === "completed").length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {tasks.filter((t) => t.status === "in_progress").length}
                  </div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {tasks.filter((t) => t.status === "blocked").length}
                  </div>
                  <div className="text-sm text-gray-600">Blocked</div>
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-4">
                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No tasks in this project yet.
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white border rounded-lg p-6 shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {task.title}
                          </h3>
                          <p className="text-gray-600 mb-3">
                            {task.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            {task.assignee && (
                              <span className="flex items-center">
                                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs mr-2">
                                  {task.assignee.name.charAt(0).toUpperCase()}
                                </div>
                                {task.assignee.name}
                              </span>
                            )}
                            {task.dueDate && (
                              <span>
                                Due:{" "}
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              task.status
                            )}`}
                          >
                            {task.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>

                      {/* TASK ACTION BUTTONS */}
                      {canUpdateTask(task) && (
                        <div className="flex space-x-3 pt-3 border-t">
                          <button
                            onClick={() => {
                              setSelectedTaskForTimer(task);
                              setShowTimeTracker(true);
                            }}
                            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm font-medium"
                          >
                            ⏱️ Track Time
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setShowProgressUpdate(true);
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium"
                          >
                            📈 Update Progress
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setShowProgressHistory(true);
                            }}
                            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm font-medium"
                          >
                            📊 View History
                          </button>
                        </div>
                      )}

                      {currentUser?.role === "manager" && (
                        <div className="flex space-x-2 pt-3 border-t">
                          <button
                            onClick={() => {
                              setSelectedTaskForManagement(task);
                              setShowTaskManagement(true);
                            }}
                            className="bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 text-sm"
                          >
                            Manage Task
                          </button>
                          {!canUpdateTask(task) && task.assignee && (
                            <button
                              onClick={() => {
                                setSelectedTask(task);
                                setShowProgressHistory(true);
                              }}
                              className="bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 text-sm"
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
            <div>
              <FileManager type="project" id={project.id} title="Project" />
            </div>
          )}

          {activeTab === "members" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="bg-white border rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {member.user.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {member.user.email}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                          member.role === "manager"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {member.role}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-500">
                    Tasks assigned:{" "}
                    {
                      tasks.filter((t) => t.assignee?.id === member.user.id)
                        .length
                    }
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

      {showTimeTracker && (
        <TimeTracker
          project={project}
          task={selectedTaskForTimer}
          onClose={() => setShowTimeTracker(false)}
        />
      )}
    </div>
  );
}

export default ProjectDetailModal;

// import { useState, useEffect } from "react";
// import axios from "axios";
// import ProgressUpdate from "../progress/ProgressUpdate";
// import ProgressHistory from "../progress/ProgressHistory";
// import ProjectChat from "../chat/ProjectChat";
// import TaskAssignment from "../tasks/TaskAssignment";
// import TaskManagement from "../tasks/TaskManagement";
// import AnalyticsDashboard from "../analytics/AnalyticsDashboard";
// import FileManager from "../files/FileManager";
// import TimeTracker from "../time/TimeTracker";
// import Timesheet from "../time/Timesheet";

// function ProjectDetailModal({ project, onClose }) {
//   const [tasks, setTasks] = useState([]);
//   const [members, setMembers] = useState([]);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [selectedTask, setSelectedTask] = useState(null);
//   const [showProgressUpdate, setShowProgressUpdate] = useState(false);
//   const [showProgressHistory, setShowProgressHistory] = useState(false);
//   const [showChat, setShowChat] = useState(false);
//   const [activeTab, setActiveTab] = useState("tasks");
//   const [showTaskAssignment, setShowTaskAssignment] = useState(false);
//   const [showTaskManagement, setShowTaskManagement] = useState(false);
//   const [selectedTaskForManagement, setSelectedTaskForManagement] =
//     useState(null);
//   const [showAnalytics, setShowAnalytics] = useState(false);
//   const [showTimeTracker, setShowTimeTracker] = useState(false);
//   const [showTimesheet, setShowTimesheet] = useState(false);
//   const [selectedTaskForTimer, setSelectedTaskForTimer] = useState(null);

//   useEffect(() => {
//     const userData = localStorage.getItem("user");
//     if (userData) {
//       setCurrentUser(JSON.parse(userData));
//     }
//     loadTasks();
//     loadMembers();
//   }, [project.id]);

//   const loadTasks = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.get(
//         `http://localhost:3001/api/tasks/project/${project.id}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setTasks(response.data.tasks);
//     } catch (error) {
//       console.error("Error loading tasks:", error);
//     }
//   };

//   const loadMembers = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.get(
//         `http://localhost:3001/api/projects/${project.id}/members`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setMembers(response.data.members);
//     } catch (error) {
//       console.error("Error loading members:", error);
//     }
//   };

//   const canUpdateTask = (task) => {
//     return task.assignee && task.assignee.id === currentUser?.id;
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "completed":
//         return "bg-green-100 text-green-800";
//       case "in_progress":
//         return "bg-yellow-100 text-yellow-800";
//       case "blocked":
//         return "bg-red-100 text-red-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const getPriorityColor = (priority) => {
//     switch (priority) {
//       case "urgent":
//         return "bg-red-500 text-white";
//       case "high":
//         return "bg-orange-500 text-white";
//       case "medium":
//         return "bg-yellow-500 text-white";
//       default:
//         return "bg-blue-500 text-white";
//     }
//   };

//   if (!currentUser) {
//     return (
//       <div className="text-center py-8">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
//         <p>Loading...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl h-5/6 flex flex-col mx-4">
//         {/* Header */}
//         <div className="p-6 border-b">
//           <div className="flex justify-between items-center">
//             <div className="flex items-center space-x-3">
//               <div
//                 className="w-4 h-4 rounded-full"
//                 style={{ backgroundColor: project.color }}
//               ></div>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">
//                   {project.name}
//                 </h1>
//                 <p className="text-gray-600">{project.description}</p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-3">
//               {/* TIME TRACKING BUTTONS */}
//               <button
//                 onClick={() => setShowTimesheet(true)}
//                 className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium text-sm"
//               >
//                 📋 Timesheet
//               </button>
//               {currentUser?.role === "manager" && (
//                 <button
//                   onClick={() => setShowAnalytics(true)}
//                   className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium text-sm"
//                 >
//                   📊 Analytics
//                 </button>
//               )}
//               <button
//                 onClick={() => setShowChat(true)}
//                 className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
//               >
//                 Team Chat
//               </button>
//               <button
//                 onClick={onClose}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <svg
//                   className="w-6 h-6"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M6 18L18 6M6 6l12 12"
//                   />
//                 </svg>
//               </button>
//             </div>
//           </div>

//           {/* Tabs */}
//           <div className="mt-4 border-b">
//             <nav className="-mb-px flex space-x-8">
//               <button
//                 onClick={() => setActiveTab("tasks")}
//                 className={`py-2 px-1 border-b-2 font-medium text-sm ${
//                   activeTab === "tasks"
//                     ? "border-blue-500 text-blue-600"
//                     : "border-transparent text-gray-500 hover:text-gray-700"
//                 }`}
//               >
//                 Tasks & Progress
//               </button>
//               <button
//                 onClick={() => setActiveTab("files")}
//                 className={`py-2 px-1 border-b-2 font-medium text-sm ${
//                   activeTab === "files"
//                     ? "border-blue-500 text-blue-600"
//                     : "border-transparent text-gray-500 hover:text-gray-700"
//                 }`}
//               >
//                 📂 Project Files
//               </button>
//               <button
//                 onClick={() => setActiveTab("members")}
//                 className={`py-2 px-1 border-b-2 font-medium text-sm ${
//                   activeTab === "members"
//                     ? "border-blue-500 text-blue-600"
//                     : "border-transparent text-gray-500 hover:text-gray-700"
//                 }`}
//               >
//                 Team Members ({members.length})
//               </button>
//             </nav>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="flex-1 overflow-y-auto p-6">
//           {activeTab === "tasks" && (
//             <div className="space-y-6">
//               {/* Task Management Header */}
//               {currentUser?.role === "manager" && (
//                 <div className="flex justify-between items-center">
//                   <h3 className="text-lg font-semibold">Task Management</h3>
//                   <button
//                     onClick={() => setShowTaskAssignment(true)}
//                     className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
//                   >
//                     + Assign New Task
//                   </button>
//                 </div>
//               )}

//               {/* Stats Cards */}
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                 <div className="bg-blue-50 p-4 rounded-lg">
//                   <div className="text-2xl font-bold text-blue-600">
//                     {tasks.length}
//                   </div>
//                   <div className="text-sm text-gray-600">Total Tasks</div>
//                 </div>
//                 <div className="bg-green-50 p-4 rounded-lg">
//                   <div className="text-2xl font-bold text-green-600">
//                     {tasks.filter((t) => t.status === "completed").length}
//                   </div>
//                   <div className="text-sm text-gray-600">Completed</div>
//                 </div>
//                 <div className="bg-yellow-50 p-4 rounded-lg">
//                   <div className="text-2xl font-bold text-yellow-600">
//                     {tasks.filter((t) => t.status === "in_progress").length}
//                   </div>
//                   <div className="text-sm text-gray-600">In Progress</div>
//                 </div>
//                 <div className="bg-red-50 p-4 rounded-lg">
//                   <div className="text-2xl font-bold text-red-600">
//                     {tasks.filter((t) => t.status === "blocked").length}
//                   </div>
//                   <div className="text-sm text-gray-600">Blocked</div>
//                 </div>
//               </div>

//               {/* Tasks List */}
//               <div className="space-y-4">
//                 {tasks.length === 0 ? (
//                   <div className="text-center py-8 text-gray-500">
//                     No tasks in this project yet.
//                   </div>
//                 ) : (
//                   tasks.map((task) => (
//                     <div
//                       key={task.id}
//                       className="bg-white border rounded-lg p-6 shadow-sm"
//                     >
//                       <div className="flex items-start justify-between mb-3">
//                         <div className="flex-1">
//                           <h3 className="text-lg font-semibold text-gray-900 mb-1">
//                             {task.title}
//                           </h3>
//                           <p className="text-gray-600 mb-3">
//                             {task.description}
//                           </p>
//                           <div className="flex items-center space-x-4 text-sm text-gray-500">
//                             {task.assignee && (
//                               <span className="flex items-center">
//                                 <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs mr-2">
//                                   {task.assignee.name.charAt(0).toUpperCase()}
//                                 </div>
//                                 {task.assignee.name}
//                               </span>
//                             )}
//                             {task.dueDate && (
//                               <span>
//                                 Due:{" "}
//                                 {new Date(task.dueDate).toLocaleDateString()}
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                         <div className="flex items-center space-x-2 ml-4">
//                           <span
//                             className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
//                               task.priority
//                             )}`}
//                           >
//                             {task.priority}
//                           </span>
//                           <span
//                             className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                               task.status
//                             )}`}
//                           >
//                             {task.status.replace("_", " ")}
//                           </span>
//                         </div>
//                       </div>

//                       {/* TASK ACTION BUTTONS */}
//                       {canUpdateTask(task) && (
//                         <div className="flex space-x-3 pt-3 border-t">
//                           <button
//                             onClick={() => {
//                               setSelectedTaskForTimer(task);
//                               setShowTimeTracker(true);
//                             }}
//                             className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm font-medium"
//                           >
//                             ⏱️ Track Time
//                           </button>
//                           <button
//                             onClick={() => {
//                               setSelectedTask(task);
//                               setShowProgressUpdate(true);
//                             }}
//                             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium"
//                           >
//                             📈 Update Progress
//                           </button>
//                           <button
//                             onClick={() => {
//                               setSelectedTask(task);
//                               setShowProgressHistory(true);
//                             }}
//                             className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm font-medium"
//                           >
//                             📊 View History
//                           </button>
//                         </div>
//                       )}

//                       {currentUser?.role === "manager" && (
//                         <div className="flex space-x-2 pt-3 border-t">
//                           <button
//                             onClick={() => {
//                               setSelectedTaskForManagement(task);
//                               setShowTaskManagement(true);
//                             }}
//                             className="bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 text-sm"
//                           >
//                             Manage Task
//                           </button>
//                           {!canUpdateTask(task) && task.assignee && (
//                             <button
//                               onClick={() => {
//                                 setSelectedTask(task);
//                                 setShowProgressHistory(true);
//                               }}
//                               className="bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 text-sm"
//                             >
//                               View Progress
//                             </button>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//           )}

//           {activeTab === "files" && (
//             <div>
//               <FileManager type="project" id={project.id} title="Project" />
//             </div>
//           )}

//           {activeTab === "members" && (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {members.map((member) => (
//                 <div
//                   key={member.id}
//                   className="bg-white border rounded-lg p-4 shadow-sm"
//                 >
//                   <div className="flex items-center space-x-3">
//                     <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
//                       {member.user.name.charAt(0).toUpperCase()}
//                     </div>
//                     <div className="flex-1">
//                       <p className="font-semibold text-gray-900">
//                         {member.user.name}
//                       </p>
//                       <p className="text-sm text-gray-600">
//                         {member.user.email}
//                       </p>
//                       <span
//                         className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
//                           member.role === "manager"
//                             ? "bg-purple-100 text-purple-800"
//                             : "bg-blue-100 text-blue-800"
//                         }`}
//                       >
//                         {member.role}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="mt-3 text-sm text-gray-500">
//                     Tasks assigned:{" "}
//                     {
//                       tasks.filter((t) => t.assignee?.id === member.user.id)
//                         .length
//                     }
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ALL MODALS */}
//       {showTaskAssignment && (
//         <TaskAssignment
//           project={project}
//           onClose={() => setShowTaskAssignment(false)}
//           onTaskCreated={() => {
//             loadTasks();
//             setShowTaskAssignment(false);
//           }}
//         />
//       )}

//       {showTaskManagement && selectedTaskForManagement && (
//         <TaskManagement
//           task={selectedTaskForManagement}
//           members={members}
//           onClose={() => setShowTaskManagement(false)}
//           onTaskUpdated={() => {
//             loadTasks();
//             setShowTaskManagement(false);
//           }}
//         />
//       )}

//       {showProgressUpdate && selectedTask && (
//         <ProgressUpdate
//           task={selectedTask}
//           onClose={() => setShowProgressUpdate(false)}
//           onProgressUpdated={() => {
//             loadTasks();
//             setShowProgressUpdate(false);
//           }}
//         />
//       )}

//       {showProgressHistory && selectedTask && (
//         <ProgressHistory
//           task={selectedTask}
//           onClose={() => setShowProgressHistory(false)}
//         />
//       )}

//       {showAnalytics && (
//         <AnalyticsDashboard
//           project={project}
//           onClose={() => setShowAnalytics(false)}
//         />
//       )}

//       {showTimeTracker && (
//         <TimeTracker
//           project={project}
//           task={selectedTaskForTimer}
//           onClose={() => setShowTimeTracker(false)}
//         />
//       )}

//       {showTimesheet && <Timesheet onClose={() => setShowTimesheet(false)} />}

//       {showChat && (
//         <ProjectChat
//           project={project}
//           currentUser={currentUser}
//           onClose={() => setShowChat(false)}
//         />
//       )}
//     </div>
//   );
// }

// export default ProjectDetailModal;

// // import { useState, useEffect } from "react";
// // import axios from "axios";
// // import ProgressUpdate from "../progress/ProgressUpdate";
// // import ProgressHistory from "../progress/ProgressHistory";
// // import AnalyticsDashboard from "../analytics/AnalyticsDashboard";
// // import FileManager from "../files/FileManager";

// // function ProjectDetailModal({ project, onClose }) {
// //   const [tasks, setTasks] = useState([]);
// //   const [members, setMembers] = useState([]);
// //   const [currentUser, setCurrentUser] = useState(null);
// //   const [selectedTask, setSelectedTask] = useState(null);
// //   const [showProgressUpdate, setShowProgressUpdate] = useState(false);
// //   const [showProgressHistory, setShowProgressHistory] = useState(false);
// //   const [activeTab, setActiveTab] = useState("tasks");
// //   const [showAnalytics, setShowAnalytics] = useState(false);

// //   useEffect(() => {
// //     const userData = localStorage.getItem("user");
// //     if (userData) {
// //       setCurrentUser(JSON.parse(userData));
// //     }
// //     loadTasks();
// //     loadMembers();
// //   }, [project.id]);

// //   const loadTasks = async () => {
// //     try {
// //       const token = localStorage.getItem("token");
// //       const response = await axios.get(
// //         `http://localhost:3001/api/tasks/project/${project.id}`,
// //         {
// //           headers: { Authorization: `Bearer ${token}` },
// //         }
// //       );
// //       setTasks(response.data.tasks);
// //     } catch (error) {
// //       console.error("Error loading tasks:", error);
// //     }
// //   };

// //   const loadMembers = async () => {
// //     try {
// //       const token = localStorage.getItem("token");
// //       const response = await axios.get(
// //         `http://localhost:3001/api/projects/${project.id}/members`,
// //         {
// //           headers: { Authorization: `Bearer ${token}` },
// //         }
// //       );
// //       setMembers(response.data.members);
// //     } catch (error) {
// //       console.error("Error loading members:", error);
// //     }
// //   };

// //   const canUpdateTask = (task) => {
// //     return task.assignee && task.assignee.id === currentUser?.id;
// //   };

// //   const getStatusColor = (status) => {
// //     switch (status) {
// //       case "completed":
// //         return "bg-green-100 text-green-800";
// //       case "in_progress":
// //         return "bg-yellow-100 text-yellow-800";
// //       case "blocked":
// //         return "bg-red-100 text-red-800";
// //       default:
// //         return "bg-gray-100 text-gray-800";
// //     }
// //   };

// //   const getPriorityColor = (priority) => {
// //     switch (priority) {
// //       case "urgent":
// //         return "bg-red-500 text-white";
// //       case "high":
// //         return "bg-orange-500 text-white";
// //       case "medium":
// //         return "bg-yellow-500 text-white";
// //       default:
// //         return "bg-blue-500 text-white";
// //     }
// //   };

// //   return (
// //     <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
// //       <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl h-5/6 flex flex-col mx-4">
// //         {/* Header */}
// //         <div className="p-6 border-b">
// //           <div className="flex justify-between items-center">
// //             <div className="flex items-center space-x-3">
// //               <div
// //                 className="w-4 h-4 rounded-full"
// //                 style={{ backgroundColor: project.color }}
// //               ></div>
// //               <div>
// //                 <h1 className="text-2xl font-bold text-gray-900">
// //                   {project.name}
// //                 </h1>
// //                 <p className="text-gray-600">{project.description}</p>
// //               </div>
// //             </div>
// //             <button
// //               onClick={onClose}
// //               className="text-gray-500 hover:text-gray-700"
// //             >
// //               <svg
// //                 className="w-6 h-6"
// //                 fill="none"
// //                 stroke="currentColor"
// //                 viewBox="0 0 24 24"
// //               >
// //                 <path
// //                   strokeLinecap="round"
// //                   strokeLinejoin="round"
// //                   strokeWidth={2}
// //                   d="M6 18L18 6M6 6l12 12"
// //                 />
// //               </svg>
// //             </button>
// //             <div className="flex items-center space-x-3">
// //               <div className="flex items-center space-x-2">
// //                 {currentUser?.role === "manager" && (
// //                   <button
// //                     onClick={() => setShowAnalytics(true)}
// //                     className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium"
// //                   >
// //                     📊 Analytics
// //                   </button>
// //                 )}
// //                 <button
// //                   onClick={() => setShowChat(true)}
// //                   className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
// //                 >
// //                   Team Chat
// //                 </button>
// //               </div>
// //               <button
// //                 onClick={onClose}
// //                 className="text-gray-500 hover:text-gray-700"
// //               >
// //                 <svg
// //                   className="w-6 h-6"
// //                   fill="none"
// //                   stroke="currentColor"
// //                   viewBox="0 0 24 24"
// //                 >
// //                   <path
// //                     strokeLinecap="round"
// //                     strokeLinejoin="round"
// //                     strokeWidth={2}
// //                     d="M6 18L18 6M6 6l12 12"
// //                   />
// //                 </svg>
// //               </button>
// //             </div>
// //           </div>

// //           {/* Tabs */}
// //           <div className="mt-4 border-b">
// //             <nav className="-mb-px flex space-x-8">
// //               <button
// //                 onClick={() => setActiveTab("tasks")}
// //                 className={`py-2 px-1 border-b-2 font-medium text-sm ${
// //                   activeTab === "tasks"
// //                     ? "border-blue-500 text-blue-600"
// //                     : "border-transparent text-gray-500 hover:text-gray-700"
// //                 }`}
// //               >
// //                 Tasks & Progress
// //               </button>
// //               <button
// //                 onClick={() => setActiveTab("members")}
// //                 className={`py-2 px-1 border-b-2 font-medium text-sm ${
// //                   activeTab === "members"
// //                     ? "border-blue-500 text-blue-600"
// //                     : "border-transparent text-gray-500 hover:text-gray-700"
// //                 }`}
// //               >
// //                 Team Members ({members.length})
// //               </button>
// //             </nav>
// //             <button
// //               onClick={() => setActiveTab("files")}
// //               className={`py-2 px-1 border-b-2 font-medium text-sm ${
// //                 activeTab === "files"
// //                   ? "border-blue-500 text-blue-600"
// //                   : "border-transparent text-gray-500 hover:text-gray-700"
// //               }`}
// //             >
// //               📂 Project Files
// //             </button>
// //           </div>
// //         </div>

// //         {activeTab === "files" && (
// //           <div>
// //             <FileManager type="project" id={project.id} title="Project" />
// //           </div>
// //         )}

// //         {/* Content */}
// //         <div className="flex-1 overflow-y-auto p-6">
// //           {activeTab === "tasks" && (
// //             <div className="space-y-6">
// //               {/* Stats Cards */}
// //               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
// //                 <div className="bg-blue-50 p-4 rounded-lg">
// //                   <div className="text-2xl font-bold text-blue-600">
// //                     {tasks.length}
// //                   </div>
// //                   <div className="text-sm text-gray-600">Total Tasks</div>
// //                 </div>
// //                 <div className="bg-green-50 p-4 rounded-lg">
// //                   <div className="text-2xl font-bold text-green-600">
// //                     {tasks.filter((t) => t.status === "completed").length}
// //                   </div>
// //                   <div className="text-sm text-gray-600">Completed</div>
// //                 </div>
// //                 <div className="bg-yellow-50 p-4 rounded-lg">
// //                   <div className="text-2xl font-bold text-yellow-600">
// //                     {tasks.filter((t) => t.status === "in_progress").length}
// //                   </div>
// //                   <div className="text-sm text-gray-600">In Progress</div>
// //                 </div>
// //                 <div className="bg-red-50 p-4 rounded-lg">
// //                   <div className="text-2xl font-bold text-red-600">
// //                     {tasks.filter((t) => t.status === "blocked").length}
// //                   </div>
// //                   <div className="text-sm text-gray-600">Blocked</div>
// //                 </div>
// //               </div>

// //               {/* Tasks List */}
// //               <div className="space-y-4">
// //                 {tasks.length === 0 ? (
// //                   <div className="text-center py-8 text-gray-500">
// //                     No tasks in this project yet.
// //                   </div>
// //                 ) : (
// //                   tasks.map((task) => (
// //                     <div
// //                       key={task.id}
// //                       className="bg-white border rounded-lg p-6 shadow-sm"
// //                     >
// //                       <div className="flex items-start justify-between mb-3">
// //                         <div className="flex-1">
// //                           <h3 className="text-lg font-semibold text-gray-900 mb-1">
// //                             {task.title}
// //                           </h3>
// //                           <p className="text-gray-600 mb-3">
// //                             {task.description}
// //                           </p>
// //                           <div className="flex items-center space-x-4 text-sm text-gray-500">
// //                             {task.assignee && (
// //                               <span className="flex items-center">
// //                                 <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs mr-2">
// //                                   {task.assignee.name.charAt(0).toUpperCase()}
// //                                 </div>
// //                                 {task.assignee.name}
// //                               </span>
// //                             )}
// //                             {task.dueDate && (
// //                               <span>
// //                                 Due:{" "}
// //                                 {new Date(task.dueDate).toLocaleDateString()}
// //                               </span>
// //                             )}
// //                           </div>
// //                         </div>
// //                         <div className="flex items-center space-x-2 ml-4">
// //                           <span
// //                             className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
// //                               task.priority
// //                             )}`}
// //                           >
// //                             {task.priority}
// //                           </span>
// //                           <span
// //                             className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
// //                               task.status
// //                             )}`}
// //                           >
// //                             {task.status.replace("_", " ")}
// //                           </span>
// //                         </div>
// //                       </div>

// //                       {canUpdateTask(task) && (
// //                         <div className="flex space-x-3 pt-3 border-t">
// //                           <button
// //                             onClick={() => {
// //                               setSelectedTask(task);
// //                               setShowProgressUpdate(true);
// //                             }}
// //                             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium"
// //                           >
// //                             📈 Update Progress
// //                           </button>
// //                           <button
// //                             onClick={() => {
// //                               setSelectedTask(task);
// //                               setShowProgressHistory(true);
// //                             }}
// //                             className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm font-medium"
// //                           >
// //                             📊 View History
// //                           </button>
// //                         </div>
// //                       )}

// //                       {!canUpdateTask(task) && task.assignee && (
// //                         <div className="pt-3 border-t">
// //                           <button
// //                             onClick={() => {
// //                               setSelectedTask(task);
// //                               setShowProgressHistory(true);
// //                             }}
// //                             className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 text-sm"
// //                           >
// //                             📊 View Progress History
// //                           </button>
// //                         </div>
// //                       )}
// //                     </div>
// //                   ))
// //                 )}
// //               </div>
// //             </div>
// //           )}

// //           {activeTab === "members" && (
// //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
// //               {members.map((member) => (
// //                 <div
// //                   key={member.id}
// //                   className="bg-white border rounded-lg p-4 shadow-sm"
// //                 >
// //                   <div className="flex items-center space-x-3">
// //                     <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
// //                       {member.user.name.charAt(0).toUpperCase()}
// //                     </div>
// //                     <div className="flex-1">
// //                       <p className="font-semibold text-gray-900">
// //                         {member.user.name}
// //                       </p>
// //                       <p className="text-sm text-gray-600">
// //                         {member.user.email}
// //                       </p>
// //                       <span
// //                         className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
// //                           member.role === "manager"
// //                             ? "bg-purple-100 text-purple-800"
// //                             : "bg-blue-100 text-blue-800"
// //                         }`}
// //                       >
// //                         {member.role}
// //                       </span>
// //                     </div>
// //                   </div>
// //                   <div className="mt-3 text-sm text-gray-500">
// //                     Tasks assigned:{" "}
// //                     {
// //                       tasks.filter((t) => t.assignee?.id === member.user.id)
// //                         .length
// //                     }
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           )}
// //         </div>
// //       </div>

// //       {/* Progress Modals */}
// //       {showProgressUpdate && selectedTask && (
// //         <ProgressUpdate
// //           task={selectedTask}
// //           onClose={() => setShowProgressUpdate(false)}
// //           onProgressUpdated={() => {
// //             loadTasks();
// //             setShowProgressUpdate(false);
// //           }}
// //         />
// //       )}

// //       {/* Analytics Dashboard */}
// //       {showAnalytics && (
// //         <AnalyticsDashboard
// //           project={project}
// //           onClose={() => setShowAnalytics(false)}
// //         />
// //       )}

// //       {showProgressHistory && selectedTask && (
// //         <ProgressHistory
// //           task={selectedTask}
// //           onClose={() => setShowProgressHistory(false)}
// //         />
// //       )}
// //     </div>
// //   );
// // }

// // export default ProjectDetailModal;
