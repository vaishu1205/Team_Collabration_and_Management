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
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global Search Component */}
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={closeSearch}
        onItemSelect={handleSearchItemSelect}
      />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

            <div className="flex items-center space-x-4">
              <NotificationBell />
              <button
                onClick={() => setShowDirectMessages(true)}
                className="p-2 text-gray-600 hover:text-gray-900 relative"
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
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </button>
              <span className="text-gray-700">Welcome, {user.name}!</span>

              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
          <button
            onClick={openSearch}
            className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
          >
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className="text-gray-600">Search</span>
            <kbd className="hidden sm:inline-block px-2 py-1 text-xs text-gray-500 bg-gray-200 rounded">
              ⌘K
            </kbd>
          </button>
        </div>
      </header>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
          🔔 {notifications[0]}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">My Projects</h3>
            <p className="text-3xl font-bold text-blue-600">
              {projects.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">My Tasks</h3>
            <p className="text-3xl font-bold text-green-600">
              {myTasks.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Completed</h3>
            <p className="text-3xl font-bold text-gray-600">
              {myTasks.filter((task) => task.status === "completed").length}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex space-x-4">
          {/* Create Project Button (only for managers) */}
          {user.role === "manager" && (
            <button
              onClick={() => setShowCreateProject(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              + Create New Project
            </button>
          )}

          {projects.length > 0 && (
            <button
              onClick={() => {
                setSelectedProjectId(projects[0].id);
                setShowCreateTask(true);
              }}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
            >
              + Create Task
            </button>
          )}
        </div>

        {/* Projects List */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">My Projects</h2>
          {projects.length === 0 ? (
            <p className="text-gray-600">
              No projects yet. Create your first project!
            </p>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: project.color }}
                      ></div>
                      <div>
                        <button
                          onClick={() => {
                            setSelectedProjectForDetail(project);
                            setShowProjectDetail(true);
                          }}
                          className="font-medium text-gray-900 hover:text-blue-600 text-left hover:underline"
                        >
                          {project.name} →
                        </button>
                        <p className="text-sm text-gray-600">
                          {project.description}
                        </p>
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      {project.status}
                    </span>
                  </div>

                  {/* Project Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        Members: {projectMembers[project.id]?.length || 0}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedProjectForAI(project);
                          setShowAISummary(true);
                        }}
                        className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                      >
                        🤖 AI Summary
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProjectForChat(project);
                          setShowChat(true);
                        }}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        💬 Chat
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProjectForMember(project.id);
                          setShowAddMember(true);
                          if (!projectMembers[project.id]) {
                            loadProjectMembers(project.id);
                          }
                        }}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        + Add Member
                      </button>
                      <button
                        onClick={() => loadProjectMembers(project.id)}
                        className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                      >
                        View Members
                      </button>
                    </div>
                  </div>

                  {/* Show Members */}
                  {projectMembers[project.id] && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Team Members:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {projectMembers[project.id].map((member) => (
                          <span
                            key={member.id}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
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

        {/* My Tasks Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">
            {user.role === "manager" ? "Recent Tasks" : "My Assigned Tasks"}
          </h2>
          {(user.role === "manager" ? tasks : myTasks).length === 0 ? (
            <p className="text-gray-600">No tasks yet.</p>
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
                  />
                )
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
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

// import { useEffect, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// import CreateProject from "../projects/CreateProject";
// import CreateTask from "../projects/CreateTask";
// import axios from "axios";
// import io from "socket.io-client";
// import AddMember from "../projects/AddMember";
// import NotificationBell from "../notifications/NotificationBell";
// import TaskCard from "../tasks/TaskCard";
// import ProjectChat from "../chat/ProjectChat";
// import ProjectSummary from "../ai/ProjectSummary";
// import DirectMessages from "../chat/DirectMessages";
// import ProjectDetailModal from "../projects/ProjectDetailModal";

// function Dashboard() {
//   const [user, setUser] = useState(null);
//   const [showCreateProject, setShowCreateProject] = useState(false);
//   const [projects, setProjects] = useState([]);
//   const [showCreateTask, setShowCreateTask] = useState(false);
//   const [selectedProjectId, setSelectedProjectId] = useState(null);
//   const [socket, setSocket] = useState(null);
//   const [notifications, setNotifications] = useState([]);
//   const [showAddMember, setShowAddMember] = useState(false);
//   const [selectedProjectForMember, setSelectedProjectForMember] =
//     useState(null);
//   const [projectMembers, setProjectMembers] = useState({});
//   const [myTasks, setMyTasks] = useState([]);
//   const [showChat, setShowChat] = useState(false);
//   const [selectedProjectForChat, setSelectedProjectForChat] = useState(null);
//   const [showAISummary, setShowAISummary] = useState(false);
//   const [selectedProjectForAI, setSelectedProjectForAI] = useState(null);
//   const [showDirectMessages, setShowDirectMessages] = useState(false);
//   const [showProjectDetail, setShowProjectDetail] = useState(false);
//   const [selectedProjectForDetail, setSelectedProjectForDetail] =
//     useState(null);

//   const loadMyTasks = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.get(
//         "http://localhost:3001/api/tasks/my-tasks",
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setMyTasks(response.data.tasks);
//     } catch (error) {
//       console.error("Error loading my tasks:", error);
//     }
//   };

//   // Update useEffect to load my tasks:
//   useEffect(() => {
//     const userData = localStorage.getItem("user");
//     if (userData) {
//       setUser(JSON.parse(userData));
//     }
//     loadProjects();
//     loadMyTasks(); // Add this line
//   }, []);

//   useEffect(() => {
//     // Get user from localStorage
//     const userData = localStorage.getItem("user");
//     if (userData) {
//       setUser(JSON.parse(userData));
//     }

//     // Load user's projects
//     loadProjects();
//   }, []);

//   useEffect(() => {
//     const newSocket = io("http://localhost:3001");
//     setSocket(newSocket);
//     window.socket = newSocket;

//     newSocket.on("new-task", (task) => {
//       setNotifications((prev) => [...prev, `New task created: ${task.title}`]);
//       setTimeout(() => {
//         setNotifications((prev) => prev.slice(1));
//       }, 5000);
//     });

//     return () => newSocket.close();
//   }, []);

//   const loadProjects = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.get("http://localhost:3001/api/projects", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setProjects(response.data.projects);
//     } catch (error) {
//       console.error("Error loading projects:", error);
//     }
//   };
//   const [tasks, setTasks] = useState([]);

//   const loadTasks = async () => {
//     if (projects.length > 0) {
//       try {
//         const token = localStorage.getItem("token");
//         const allTasks = [];

//         for (const project of projects) {
//           const response = await axios.get(
//             `http://localhost:3001/api/tasks/project/${project.id}`,
//             {
//               headers: { Authorization: `Bearer ${token}` },
//             }
//           );
//           allTasks.push(...response.data.tasks);
//         }

//         setTasks(allTasks);
//       } catch (error) {
//         console.error("Error loading tasks:", error);
//       }
//     }
//   };

//   const loadProjectMembers = async (projectId) => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.get(
//         `http://localhost:3001/api/projects/${projectId}/members`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setProjectMembers((prev) => ({
//         ...prev,
//         [projectId]: response.data.members,
//       }));
//     } catch (error) {
//       console.error("Error loading members:", error);
//     }
//   };

//   const handleMemberAdded = (newMember) => {
//     const projectId = selectedProjectForMember;
//     setProjectMembers((prev) => ({
//       ...prev,
//       [projectId]: [...(prev[projectId] || []), newMember],
//     }));
//   };

//   // Update the useEffect:
//   useEffect(() => {
//     const userData = localStorage.getItem("user");
//     if (userData) {
//       setUser(JSON.parse(userData));
//     }
//     loadProjects();
//   }, []);

//   useEffect(() => {
//     if (projects.length > 0) {
//       loadTasks();
//     }
//   }, [projects]);

//   const handleTaskCreated = (newTask) => {
//     setTasks([newTask, ...tasks]);
//   };

//   const handleProjectCreated = (newProject) => {
//     setProjects([newProject, ...projects]);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     window.location.reload();
//   };

//   if (!user) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-4">
//             <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

//             <div className="flex items-center space-x-4">
//               <NotificationBell />
//               <button
//                 onClick={() => setShowDirectMessages(true)}
//                 className="p-2 text-gray-600 hover:text-gray-900 relative"
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
//                     d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
//                   />
//                 </svg>
//               </button>
//               <span className="text-gray-700">Welcome, {user.name}!</span>

//               <button
//                 onClick={handleLogout}
//                 className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
//               >
//                 Logout
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Add after welcome text in header */}
//       {notifications.length > 0 && (
//         <div className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
//           🔔 {notifications[0]}
//         </div>
//       )}

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           {/* Stats Cards */}
//           <div className="bg-white p-6 rounded-lg shadow">
//             <h3 className="text-lg font-medium text-gray-900">My Projects</h3>
//             <p className="text-3xl font-bold text-blue-600">
//               {projects.length}
//             </p>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow">
//             <h3 className="text-lg font-medium text-gray-900">My Tasks</h3>
//             <p className="text-3xl font-bold text-green-600">
//               {myTasks.length}
//             </p>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow">
//             <h3 className="text-lg font-medium text-gray-900">Completed</h3>
//             <p className="text-3xl font-bold text-gray-600">
//               {myTasks.filter((task) => task.status === "completed").length}
//             </p>
//           </div>
//         </div>

//         {/* Create Project Button (only for managers) */}
//         {user.role === "manager" && (
//           <div className="mb-6">
//             <button
//               onClick={() => setShowCreateProject(true)}
//               className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
//             >
//               + Create New Project
//             </button>
//           </div>
//         )}

//         {projects.length > 0 && (
//           <button
//             onClick={() => {
//               setSelectedProjectId(projects[0].id);
//               setShowCreateTask(true);
//             }}
//             className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium ml-4"
//           >
//             + Create Task
//           </button>
//         )}

//         {/* Projects List */}
//         {/* <div className="bg-white p-6 rounded-lg shadow mb-6">
//           <h2 className="text-xl font-bold mb-4">My Projects</h2>
//           {projects.length === 0 ? (
//             <p className="text-gray-600">
//               No projects yet. Create your first project!
//             </p>
//           ) : (
//             <div className="space-y-4">
//               {projects.map((project) => (
//                 <div
//                   key={project.id}
//                   className="border border-gray-200 rounded-lg p-4"
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-3">
//                       <div
//                         className="w-4 h-4 rounded-full"
//                         style={{ backgroundColor: project.color }}
//                       ></div>
//                       <div>
//                         <h3 className="font-medium text-gray-900">
//                           {project.name}
//                         </h3>
//                         <p className="text-sm text-gray-600">
//                           {project.description}
//                         </p>
//                       </div>
//                     </div>
//                     <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
//                       {project.status}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div> */}

//         {/* Projects List */}
//         <div className="bg-white p-6 rounded-lg shadow mb-6">
//           <h2 className="text-xl font-bold mb-4">My Projects</h2>
//           {projects.length === 0 ? (
//             <p className="text-gray-600">
//               No projects yet. Create your first project!
//             </p>
//           ) : (
//             <div className="space-y-4">
//               {projects.map((project) => (
//                 <div
//                   key={project.id}
//                   className="border border-gray-200 rounded-lg p-4"
//                 >
//                   <div className="flex items-center justify-between mb-3">
//                     <div className="flex items-center space-x-3">
//                       <div
//                         className="w-4 h-4 rounded-full"
//                         style={{ backgroundColor: project.color }}
//                       ></div>
//                       <div>
//                         <button
//                           onClick={() => {
//                             setSelectedProjectForDetail(project);
//                             setShowProjectDetail(true);
//                           }}
//                           className="font-medium text-gray-900 hover:text-blue-600 text-left hover:underline"
//                         >
//                           {project.name} →
//                         </button>
//                         <p className="text-sm text-gray-600">
//                           {project.description}
//                         </p>
//                       </div>
//                       {/* <div>
//                         <h3 className="font-medium text-gray-900">
//                           {project.name}
//                         </h3>
//                         <p className="text-sm text-gray-600">
//                           {project.description}
//                         </p>
//                       </div> */}
//                     </div>
//                     <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
//                       {project.status}
//                     </span>
//                   </div>

//                   {/* Project Actions */}
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-2">
//                       <span className="text-sm text-gray-500">
//                         Members: {projectMembers[project.id]?.length || 0}
//                       </span>
//                     </div>
//                     <div className="flex space-x-2">
//                       <button
//                         onClick={() => {
//                           setSelectedProjectForAI(project);
//                           setShowAISummary(true);
//                         }}
//                         className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
//                       >
//                         🤖 AI Summary
//                       </button>
//                       <button
//                         onClick={() => {
//                           setSelectedProjectForChat(project);
//                           setShowChat(true);
//                         }}
//                         className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
//                       >
//                         💬 Chat
//                       </button>
//                       <button
//                         onClick={() => {
//                           setSelectedProjectForMember(project.id);
//                           setShowAddMember(true);
//                           if (!projectMembers[project.id]) {
//                             loadProjectMembers(project.id);
//                           }
//                         }}
//                         className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
//                       >
//                         + Add Member
//                       </button>
//                       <button
//                         onClick={() => loadProjectMembers(project.id)}
//                         className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
//                       >
//                         View Members
//                       </button>
//                     </div>
//                     {/* <div className="flex space-x-2">
//                       <button
//                         onClick={() => {
//                           setSelectedProjectForMember(project.id);
//                           setShowAddMember(true);
//                           if (!projectMembers[project.id]) {
//                             loadProjectMembers(project.id);
//                           }
//                         }}
//                         className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
//                       >
//                         + Add Member
//                       </button>
//                       <button
//                         onClick={() => loadProjectMembers(project.id)}
//                         className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
//                       >
//                         View Members
//                       </button>
//                     </div> */}
//                   </div>

//                   {/* Show Members */}
//                   {projectMembers[project.id] && (
//                     <div className="mt-3 pt-3 border-t border-gray-200">
//                       <p className="text-sm font-medium text-gray-700 mb-2">
//                         Team Members:
//                       </p>
//                       <div className="flex flex-wrap gap-2">
//                         {projectMembers[project.id].map((member) => (
//                           <span
//                             key={member.id}
//                             className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
//                           >
//                             {member.user.name} ({member.role})
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </main>

//       {/* Tasks List */}
//       {/* <div className="bg-white p-6 rounded-lg shadow">
//         <h2 className="text-xl font-bold mb-4">Recent Tasks</h2>
//         {tasks.length === 0 ? (
//           <p className="text-gray-600">No tasks yet. Create your first task!</p>
//         ) : (
//           <div className="space-y-3">
//             {tasks.slice(0, 5).map((task) => (
//               <div key={task.id} className="border border-gray-200 rounded p-3">
//                 <div className="flex justify-between items-center">
//                   <h4 className="font-medium">{task.title}</h4>
//                   <span
//                     className={`px-2 py-1 rounded text-sm ${
//                       task.status === "completed"
//                         ? "bg-green-100 text-green-800"
//                         : task.status === "in_progress"
//                         ? "bg-yellow-100 text-yellow-800"
//                         : "bg-gray-100 text-gray-800"
//                     }`}
//                   >
//                     {task.status.replace("_", " ")}
//                   </span>
//                 </div>
//                 <p className="text-sm text-gray-600 mt-1">{task.description}</p>
//               </div>
//             ))}
//           </div>
//         )}
//       </div> */}
//       {/* My Tasks Section */}
//       <div className="bg-white p-6 rounded-lg shadow">
//         <h2 className="text-xl font-bold mb-4">
//           {user.role === "manager" ? "Recent Tasks" : "My Assigned Tasks"}
//         </h2>
//         {(user.role === "manager" ? tasks : myTasks).length === 0 ? (
//           <p className="text-gray-600">No tasks yet.</p>
//         ) : (
//           <div className="space-y-4">
//             {(user.role === "manager" ? tasks.slice(0, 5) : myTasks).map(
//               (task) => (
//                 <TaskCard
//                   key={task.id}
//                   task={task}
//                   currentUser={user}
//                   onTaskUpdated={(updatedTask) => {
//                     if (user.role === "manager") {
//                       setTasks((prev) =>
//                         prev.map((t) =>
//                           t.id === updatedTask.id ? updatedTask : t
//                         )
//                       );
//                     } else {
//                       setMyTasks((prev) =>
//                         prev.map((t) =>
//                           t.id === updatedTask.id ? updatedTask : t
//                         )
//                       );
//                     }
//                   }}
//                 />
//               )
//             )}
//           </div>
//         )}
//       </div>

//       {/* Create Project Modal */}
//       {showCreateProject && (
//         <CreateProject
//           onProjectCreated={handleProjectCreated}
//           onClose={() => setShowCreateProject(false)}
//         />
//       )}

//       {/* Project Chat Modal */}
//       {showChat && selectedProjectForChat && (
//         <ProjectChat
//           project={selectedProjectForChat}
//           currentUser={user}
//           onClose={() => setShowChat(false)}
//         />
//       )}

//       {showCreateTask && (
//         <CreateTask
//           projectId={selectedProjectId}
//           onTaskCreated={handleTaskCreated}
//           onClose={() => setShowCreateTask(false)}
//         />
//       )}

//       {/* AI Summary Modal */}
//       {showAISummary && selectedProjectForAI && (
//         <ProjectSummary
//           project={selectedProjectForAI}
//           onClose={() => setShowAISummary(false)}
//         />
//       )}

//       {/* Project Detail Modal */}
//       {showProjectDetail && selectedProjectForDetail && (
//         <ProjectDetailModal
//           project={selectedProjectForDetail}
//           onClose={() => setShowProjectDetail(false)}
//         />
//       )}

//       {/* Direct Messages Modal */}
//       {showDirectMessages && (
//         <DirectMessages onClose={() => setShowDirectMessages(false)} />
//       )}

//       {/* Add Member Modal */}
//       {showAddMember && (
//         <AddMember
//           projectId={selectedProjectForMember}
//           onMemberAdded={handleMemberAdded}
//           onClose={() => setShowAddMember(false)}
//         />
//       )}
//     </div>
//   );
// }

// export default Dashboard;
