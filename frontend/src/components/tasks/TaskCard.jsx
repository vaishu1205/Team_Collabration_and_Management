import { useState } from "react";
import axios from "axios";

function TaskCard({
  task,
  onTaskUpdated,
  currentUser,
  onShowProgressUpdate,
  onShowProgressHistory,
}) {
  const [updating, setUpdating] = useState(false);

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3001/api/tasks/${task.id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onTaskUpdated({ ...task, status: newStatus });
      alert(`Task status updated to ${newStatus.replace("_", " ")}`);
    } catch (error) {
      alert("Error updating task status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "todo":
        return "bg-gray-100 text-gray-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "blocked":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "low":
        return "bg-blue-100 text-blue-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const canUpdateStatus = task.assignee && task.assignee.id === currentUser.id;

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>

            {/* Project and Assignee Info */}
            <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
              {task.project && (
                <span className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-1"
                    style={{ backgroundColor: task.project.color }}
                  ></div>
                  {task.project.name}
                </span>
              )}
              {task.assignee && <span>Assigned to: {task.assignee.name}</span>}
              {task.dueDate && (
                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>

        {/* Status and Priority Badges */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                task.status
              )}`}
            >
              {task.status.replace("_", " ")}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                task.priority
              )}`}
            >
              {task.priority}
            </span>
          </div>

          {/* Status Update Buttons (only for assigned member) */}
          {canUpdateStatus && (
            <div className="flex space-x-1">
              {task.status !== "todo" && (
                <button
                  onClick={() => updateStatus("todo")}
                  disabled={updating}
                  className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                >
                  Todo
                </button>
              )}
              {task.status !== "in_progress" && (
                <button
                  onClick={() => updateStatus("in_progress")}
                  disabled={updating}
                  className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
                >
                  In Progress
                </button>
              )}
              {task.status !== "completed" && (
                <button
                  onClick={() => updateStatus("completed")}
                  disabled={updating}
                  className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                  Complete
                </button>
              )}
              {task.status !== "blocked" && (
                <button
                  onClick={() => updateStatus("blocked")}
                  disabled={updating}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  Blocked
                </button>
              )}
            </div>
          )}
          {/* Progress tracking buttons */}
          {canUpdateStatus && (
            <div className="flex space-x-1 mt-2">
              <button
                onClick={() => onShowProgressUpdate(task)}
                className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Update Progress
              </button>
              <button
                onClick={() => onShowProgressHistory(task)}
                className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                View History
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default TaskCard;
