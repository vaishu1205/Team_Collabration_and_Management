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

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Create New Task</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Task Title
            </label>
            <input
              type="text"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Description
            </label>
            <textarea
              placeholder="Task description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Assign To
            </label>
            <select
              value={formData.assigneeId}
              onChange={(e) =>
                setFormData({ ...formData, assigneeId: e.target.value })
              }
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTask;

// import { useState } from "react";
// import axios from "axios";

// function CreateTask({ projectId, onTaskCreated, onClose }) {
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     priority: "medium",
//     dueDate: "",
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.post(
//         "http://localhost:3001/api/tasks",
//         {
//           ...formData,
//           projectId,
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       alert("Task created successfully!");
//       if (window.socket) {
//         window.socket.emit("task-created", {
//           projectId,
//           title: formData.title,
//         });
//       }
//       onTaskCreated(response.data.task);
//       onClose();
//     } catch (error) {
//       alert("Error creating task");
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
//       <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
//         <h2 className="text-xl font-bold mb-4">Create New Task</h2>
//         <form onSubmit={handleSubmit}>
//           <input
//             type="text"
//             placeholder="Task title"
//             value={formData.title}
//             onChange={(e) =>
//               setFormData({ ...formData, title: e.target.value })
//             }
//             className="w-full p-2 border rounded mb-4"
//             required
//           />
//           <textarea
//             placeholder="Description"
//             value={formData.description}
//             onChange={(e) =>
//               setFormData({ ...formData, description: e.target.value })
//             }
//             className="w-full p-2 border rounded mb-4"
//             rows="3"
//           />
//           <select
//             value={formData.priority}
//             onChange={(e) =>
//               setFormData({ ...formData, priority: e.target.value })
//             }
//             className="w-full p-2 border rounded mb-4"
//           >
//             <option value="low">Low Priority</option>
//             <option value="medium">Medium Priority</option>
//             <option value="high">High Priority</option>
//             <option value="urgent">Urgent</option>
//           </select>
//           <input
//             type="date"
//             value={formData.dueDate}
//             onChange={(e) =>
//               setFormData({ ...formData, dueDate: e.target.value })
//             }
//             className="w-full p-2 border rounded mb-4"
//           />
//           <div className="flex justify-end space-x-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 border rounded"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 bg-blue-600 text-white rounded"
//             >
//               Create Task
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default CreateTask;
