import { useState, useEffect } from "react";
import axios from "axios";

function TimeTracker({ project, task, onClose }) {
  const [activeTimer, setActiveTimer] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadActiveTimer();
    const interval = setInterval(updateElapsedTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadActiveTimer = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:3001/api/time/active",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.activeTimer) {
        setActiveTimer(response.data.activeTimer);
        setDescription(response.data.activeTimer.description);
      }
    } catch (error) {
      console.error("Error loading active timer:", error);
    }
  };

  const updateElapsedTime = () => {
    if (activeTimer) {
      const startTime = new Date(activeTimer.startTime);
      const now = new Date();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedTime(elapsed);
    }
  };

  // const startTimer = async () => {
  //   if (!description.trim()) {
  //     alert("Please enter a description for your work");
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     const token = localStorage.getItem("token");
  //     const response = await axios.post(
  //       "http://localhost:3001/api/time/start",
  //       {
  //         projectId: project.id,
  //         taskId: task?.id,
  //         description,
  //       },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     setActiveTimer(response.data.timeEntry);
  //     setElapsedTime(0);
  //   } catch (error) {
  //     alert(
  //       "Failed to start timer: " +
  //         (error.response?.data?.message || "Unknown error")
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const startTimer = async () => {
    if (!description.trim()) {
      alert("Please enter a description for your work");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      console.log("Starting timer with data:", {
        projectId: project.id,
        taskId: task?.id,
        description,
      });

      const response = await axios.post(
        "http://localhost:3001/api/time/start",
        {
          projectId: project.id,
          taskId: task?.id,
          description,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000, // 10 second timeout
        }
      );

      console.log("Timer start response:", response.data);
      setActiveTimer(response.data.timeEntry);
      setElapsedTime(0);
      alert("Timer started successfully!");
    } catch (error) {
      console.error("Timer start error:", error);
      console.error("Error response:", error.response?.data);

      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      alert("Failed to start timer: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const stopTimer = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3001/api/time/stop",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setActiveTimer(null);
      setElapsedTime(0);
      alert("Time tracked successfully!");
    } catch (error) {
      alert(
        "Failed to stop timer: " +
          (error.response?.data?.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">⏱️ Time Tracker</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
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
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: project.color }}
              ></div>
              <span className="font-medium text-blue-900">{project.name}</span>
            </div>
            {task && (
              <p className="text-sm text-blue-700">Task: {task.title}</p>
            )}
          </div>

          {/* Timer Display */}
          <div className="text-center mb-6">
            <div
              className={`text-6xl font-mono font-bold mb-4 ${
                activeTimer ? "text-green-600" : "text-gray-400"
              }`}
            >
              {formatTime(elapsedTime)}
            </div>

            {activeTimer && (
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 font-medium">
                  Timer Running
                </span>
              </div>
            )}
          </div>

          {/* Description Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What are you working on?
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your current task..."
              disabled={activeTimer !== null}
            />
          </div>

          {/* Timer Controls */}
          <div className="space-y-3">
            {!activeTimer ? (
              <button
                onClick={startTimer}
                disabled={loading || !description.trim()}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                {loading ? "Starting..." : "▶️ Start Timer"}
              </button>
            ) : (
              <button
                onClick={stopTimer}
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
              >
                {loading ? "Stopping..." : "⏹️ Stop Timer"}
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              Close
            </button>
          </div>

          {activeTimer && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Current Task:</strong> {activeTimer.description}
              </p>
              <p className="text-yellow-600 text-xs mt-1">
                Started at{" "}
                {new Date(activeTimer.startTime).toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TimeTracker;
