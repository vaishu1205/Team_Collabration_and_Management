import { useState, useEffect } from "react";
import axios from "axios";

function UpcomingDeadlines({ onClose }) {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    loadDeadlines();
  }, [days]);

  const loadDeadlines = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:3001/api/calendar/deadlines",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { days },
        }
      );
      setDeadlines(response.data.deadlines);
    } catch (error) {
      console.error("Error loading deadlines:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (endDate) => {
    const now = new Date();
    const deadline = new Date(endDate);
    const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return "bg-red-100 border-red-300 text-red-800";
    if (daysLeft === 0)
      return "bg-orange-100 border-orange-300 text-orange-800";
    if (daysLeft <= 2) return "bg-yellow-100 border-yellow-300 text-yellow-800";
    return "bg-blue-100 border-blue-300 text-blue-800";
  };

  const getTimeLeft = (endDate) => {
    const now = new Date();
    const deadline = new Date(endDate);
    const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return `${Math.abs(daysLeft)} days overdue`;
    if (daysLeft === 0) return "Due today";
    if (daysLeft === 1) return "Due tomorrow";
    return `${daysLeft} days left`;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              ⏰ Upcoming Deadlines
            </h2>
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

          {/* Time Range Selector */}
          <div className="mb-6">
            <div className="flex space-x-2">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    days === d
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Next {d} days
                </button>
              ))}
            </div>
          </div>

          {/* Deadlines List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading deadlines...</p>
            </div>
          ) : deadlines.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-gray-500 text-lg">No upcoming deadlines!</p>
              <p className="text-gray-400 text-sm mt-2">
                You're all caught up for the next {days} days
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {deadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className={`p-4 rounded-lg border-2 ${getUrgencyColor(
                    deadline.endDate
                  )}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">
                          {deadline.eventType === "task" && "📋"}
                          {deadline.eventType === "deadline" && "⏰"}
                          {deadline.eventType === "meeting" && "👥"}
                          {deadline.eventType === "milestone" && "🎯"}
                        </span>
                        <h3 className="font-semibold">{deadline.title}</h3>
                      </div>

                      {deadline.description && (
                        <p className="text-sm opacity-80 mb-2">
                          {deadline.description}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 text-sm">
                        {deadline.project && (
                          <span className="font-medium">
                            📁 {deadline.project.name}
                          </span>
                        )}
                        {deadline.task && (
                          <span>
                            Status: {deadline.task.status.replace("_", " ")}
                          </span>
                        )}
                        <span>👤 {deadline.user.name}</span>
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <div className="font-bold text-lg">
                        {getTimeLeft(deadline.endDate)}
                      </div>
                      <div className="text-sm opacity-80">
                        {new Date(deadline.endDate).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">
              📊 Deadline Summary
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {
                    deadlines.filter((d) => new Date(d.endDate) < new Date())
                      .length
                  }
                </div>
                <div className="text-sm text-gray-600">Overdue</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {
                    deadlines.filter((d) => {
                      const daysLeft = Math.ceil(
                        (new Date(d.endDate) - new Date()) /
                          (1000 * 60 * 60 * 24)
                      );
                      return daysLeft === 0;
                    }).length
                  }
                </div>
                <div className="text-sm text-gray-600">Due Today</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {
                    deadlines.filter((d) => {
                      const daysLeft = Math.ceil(
                        (new Date(d.endDate) - new Date()) /
                          (1000 * 60 * 60 * 24)
                      );
                      return daysLeft > 0;
                    }).length
                  }
                </div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpcomingDeadlines;
