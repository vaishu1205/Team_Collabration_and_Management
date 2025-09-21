import { useEffect, useState } from "react";
import CreateProject from "../projects/CreateProject";
import CreateTask from "../projects/CreateTask";
import axios from "axios";
import io from "socket.io-client";
import AddMember from "../projects/AddMember";
import NotificationBell from "../notifications/NotificationBell";
import TaskCard from "../tasks/TaskCard";
import ProjectChat from "../chat/ProjectChat";
import ProjectSummary from "../ai/ProjectSummary";
import DirectMessages from "../chat/DirectMessages";
import ProjectDetailModal from "../projects/ProjectDetailModal";
import GlobalSearch from "../search/GlobalSearch";
import { useGlobalSearch } from "../../hooks/useGlobalSearch";
import ProgressUpdate from "../progress/ProgressUpdate";
import ProgressHistory from "../progress/ProgressHistory";

function Dashboard() {
  // All state declarations at the top
  const [user, setUser] = useState(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [projects, setProjects] = useState([]);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedProjectForMember, setSelectedProjectForMember] =
    useState(null);
  const [projectMembers, setProjectMembers] = useState({});
  const [myTasks, setMyTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [selectedProjectForChat, setSelectedProjectForChat] = useState(null);
  const [showAISummary, setShowAISummary] = useState(false);
  const [selectedProjectForAI, setSelectedProjectForAI] = useState(null);
  const [showDirectMessages, setShowDirectMessages] = useState(false);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [selectedProjectForDetail, setSelectedProjectForDetail] =
    useState(null);

  // Progress modal states
  const [showProgressUpdate, setShowProgressUpdate] = useState(false);
  const [showProgressHistory, setShowProgressHistory] = useState(false);
  const [selectedTaskForProgress, setSelectedTaskForProgress] = useState(null);

  // Use the global search hook
  const { isSearchOpen, openSearch, closeSearch } = useGlobalSearch();

  // All functions at component level
  const loadProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3001/api/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProjects(response.data.projects);
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  const loadMyTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:3001/api/tasks/my-tasks",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMyTasks(response.data.tasks);
    } catch (error) {
      console.error("Error loading my tasks:", error);
    }
  };

  const loadTasks = async () => {
    if (projects.length > 0) {
      try {
        const token = localStorage.getItem("token");
        const allTasks = [];

        for (const project of projects) {
          const response = await axios.get(
            `http://localhost:3001/api/tasks/project/${project.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          allTasks.push(...response.data.tasks);
        }

        setTasks(allTasks);
      } catch (error) {
        console.error("Error loading tasks:", error);
      }
    }
  };

  const loadProjectMembers = async (projectId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3001/api/projects/${projectId}/members`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProjectMembers((prev) => ({
        ...prev,
        [projectId]: response.data.members,
      }));
    } catch (error) {
      console.error("Error loading members:", error);
    }
  };

  const handleMemberAdded = (newMember) => {
    const projectId = selectedProjectForMember;
    setProjectMembers((prev) => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), newMember],
    }));
  };

  const handleTaskCreated = (newTask) => {
    setTasks([newTask, ...tasks]);
    loadMyTasks();
  };

  const handleProjectCreated = (newProject) => {
    setProjects([newProject, ...projects]);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  const handleSearchItemSelect = (item) => {
    console.log("Selected item:", item);
    closeSearch();
  };

  // Progress modal handlers
  const handleShowProgressUpdate = (task) => {
    setSelectedTaskForProgress(task);
    setShowProgressUpdate(true);
  };

  const handleShowProgressHistory = (task) => {
    setSelectedTaskForProgress(task);
    setShowProgressHistory(true);
  };

  const handleCloseProgressUpdate = () => {
    setShowProgressUpdate(false);
    setSelectedTaskForProgress(null);
  };

  const handleCloseProgressHistory = () => {
    setShowProgressHistory(false);
    setSelectedTaskForProgress(null);
  };

  // Single useEffect for initial data loading
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadProjects();
    loadMyTasks();
  }, []);

  // useEffect for loading tasks when projects change
  useEffect(() => {
    if (projects.length > 0) {
      loadTasks();
    }
  }, [projects]);

  // Socket useEffect
  useEffect(() => {
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);
    window.socket = newSocket;

    newSocket.on("new-task", (task) => {
      setNotifications((prev) => [...prev, `New task created: ${task.title}`]);
      setTimeout(() => {
        setNotifications((prev) => prev.slice(1));
      }, 5000);
    });

    return () => newSocket.close();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-lg font-medium text-slate-700">
              Loading your workspace...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Global Search Component */}
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={closeSearch}
        onItemSelect={handleSearchItemSelect}
      />

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 shadow-sm fixed h-full z-30">
        <div className="p-6">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">TeamFlow</h2>
              <p className="text-sm text-slate-600">Project Management</p>
            </div>
          </div>

          {/* User Profile */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{user.name}</h3>
                <p className="text-sm text-slate-600 capitalize">{user.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
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
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 5v4"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 5v4"
                    />
                  </svg>
                </div>
                <span className="font-medium text-slate-900">Dashboard</span>
              </div>
            </div>

            <button
              onClick={openSearch}
              className="w-full bg-white hover:bg-slate-50 rounded-xl p-3 flex items-center space-x-3 transition-all duration-200 border border-slate-200"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <span className="font-medium text-slate-700">Search</span>
              <kbd className="ml-auto px-2 py-1 text-xs text-slate-500 bg-slate-200 rounded">
                ⌘K
              </kbd>
            </button>

            <button
              onClick={() => setShowDirectMessages(true)}
              className="w-full bg-white hover:bg-slate-50 rounded-xl p-3 flex items-center space-x-3 transition-all duration-200 border border-slate-200"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
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
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <span className="font-medium text-slate-700">Messages</span>
            </button>
          </nav>

          {/* Quick Actions */}
          <div className="mt-8 space-y-3">
            <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Quick Actions
            </h4>

            {user.role === "manager" && (
              <button
                onClick={() => setShowCreateProject(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-3 hover:from-blue-700 hover:to-indigo-700 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>New Project</span>
              </button>
            )}

            {projects.length > 0 && (
              <button
                onClick={() => {
                  setSelectedProjectId(projects[0].id);
                  setShowCreateTask(true);
                }}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl p-3 hover:from-emerald-700 hover:to-green-700 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>New Task</span>
              </button>
            )}
          </div>
        </div>

        {/* Logout Button at Bottom */}
        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl p-3 hover:from-red-600 hover:to-red-700 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 h-screen overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-20">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-600 mt-1">
                  Welcome back, {user.name}! Here's what's happening today.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <NotificationBell />
              </div>
            </div>
          </div>
        </header>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="px-8 pt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-3">
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
                      d="M15 17h5l-5 5v-5zm-8-3.5a5.5 5.5 0 1111 0c0 7.142-7.153 11.25-7.153 11.25S4.5 20.642 4.5 13.5z"
                    />
                  </svg>
                </div>
                <span className="text-blue-800 font-medium">
                  {notifications[0]}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
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
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    My Projects
                  </h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {projects.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
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
                  <h3 className="text-lg font-semibold text-slate-900">
                    My Tasks
                  </h3>
                  <p className="text-3xl font-bold text-emerald-600">
                    {myTasks.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
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
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Completed
                  </h3>
                  <p className="text-3xl font-bold text-amber-600">
                    {
                      myTasks.filter((task) => task.status === "completed")
                        .length
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Projects List */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">My Projects</h2>
            </div>

            <div className="p-6">
              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <p className="text-slate-600 text-lg font-medium">
                    No projects yet
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    Create your first project to get started!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all duration-300 hover:bg-white"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div
                            className="w-5 h-5 rounded-full shadow-sm border-2 border-white"
                            style={{ backgroundColor: project.color }}
                          ></div>
                          <div>
                            <button
                              onClick={() => {
                                setSelectedProjectForDetail(project);
                                setShowProjectDetail(true);
                              }}
                              className="font-semibold text-slate-900 hover:text-blue-600 text-left hover:underline transition-colors duration-200 text-lg bg-transparent border-none"
                            >
                              {project.name} →
                            </button>
                            <p className="text-slate-600 mt-1">
                              {project.description}
                            </p>
                          </div>
                        </div>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {project.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-slate-600 bg-slate-200 px-3 py-1 rounded-full">
                            {projectMembers[project.id]?.length || 0} Members
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              setSelectedProjectForAI(project);
                              setShowAISummary(true);
                            }}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-medium"
                          >
                            AI Summary
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProjectForChat(project);
                              setShowChat(true);
                            }}
                            className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:from-emerald-700 hover:to-green-700 transition-all duration-200 font-medium"
                          >
                            Chat
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProjectForMember(project.id);
                              setShowAddMember(true);
                              if (!projectMembers[project.id]) {
                                loadProjectMembers(project.id);
                              }
                            }}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
                          >
                            Add Member
                          </button>
                          <button
                            onClick={() => loadProjectMembers(project.id)}
                            className="bg-gradient-to-r from-slate-500 to-slate-600 text-white px-3 py-1.5 rounded-lg text-sm hover:from-slate-600 hover:to-slate-700 transition-all duration-200 font-medium"
                          >
                            View Members
                          </button>
                        </div>
                      </div>

                      {projectMembers[project.id] && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <p className="text-sm font-semibold text-slate-700 mb-3">
                            Team Members:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {projectMembers[project.id].map((member) => (
                              <span
                                key={member.id}
                                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                              >
                                {member.user.name} ({member.role})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* My Tasks Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">
                {user.role === "manager" ? "Recent Tasks" : "My Assigned Tasks"}
              </h2>
            </div>

            <div className="p-6">
              {(user.role === "manager" ? tasks : myTasks).length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-slate-400"
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
                  <p className="text-slate-600 text-lg font-medium">
                    No tasks yet
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    Tasks will appear here when created
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(user.role === "manager" ? tasks.slice(0, 5) : myTasks).map(
                    (task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        currentUser={user}
                        onTaskUpdated={(updatedTask) => {
                          if (user.role === "manager") {
                            setTasks((prev) =>
                              prev.map((t) =>
                                t.id === updatedTask.id ? updatedTask : t
                              )
                            );
                          } else {
                            setMyTasks((prev) =>
                              prev.map((t) =>
                                t.id === updatedTask.id ? updatedTask : t
                              )
                            );
                          }
                        }}
                        onShowProgressUpdate={handleShowProgressUpdate}
                        onShowProgressHistory={handleShowProgressHistory}
                      />
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Progress Modals - Rendered at Dashboard level outside scrolling container */}
      {showProgressUpdate && selectedTaskForProgress && (
        <ProgressUpdate
          task={selectedTaskForProgress}
          onClose={handleCloseProgressUpdate}
          onProgressUpdated={() => {
            // Refresh task data if needed
            loadMyTasks();
            loadTasks();
          }}
        />
      )}

      {showProgressHistory && selectedTaskForProgress && (
        <ProgressHistory
          key={`progress-history-${selectedTaskForProgress.id}-${Date.now()}`} // Force remount each time
          task={selectedTaskForProgress}
          onClose={handleCloseProgressHistory}
        />
      )}

      {/* Other Modals */}
      {showCreateProject && (
        <CreateProject
          onProjectCreated={handleProjectCreated}
          onClose={() => setShowCreateProject(false)}
        />
      )}

      {showChat && selectedProjectForChat && (
        <ProjectChat
          project={selectedProjectForChat}
          currentUser={user}
          onClose={() => setShowChat(false)}
        />
      )}

      {showCreateTask && (
        <CreateTask
          projectId={selectedProjectId}
          onTaskCreated={handleTaskCreated}
          onClose={() => setShowCreateTask(false)}
        />
      )}

      {showAISummary && selectedProjectForAI && (
        <ProjectSummary
          project={selectedProjectForAI}
          onClose={() => setShowAISummary(false)}
        />
      )}

      {showProjectDetail && selectedProjectForDetail && (
        <ProjectDetailModal
          project={selectedProjectForDetail}
          onClose={() => setShowProjectDetail(false)}
        />
      )}

      {showDirectMessages && (
        <DirectMessages onClose={() => setShowDirectMessages(false)} />
      )}

      {showAddMember && (
        <AddMember
          projectId={selectedProjectForMember}
          onMemberAdded={handleMemberAdded}
          onClose={() => setShowAddMember(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;
