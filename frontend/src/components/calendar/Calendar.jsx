import { useState, useEffect } from "react";
import axios from "axios";

function Calendar({ project, onClose }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [view, setView] = useState("month");
  const [loading, setLoading] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    loadCalendarEvents();
  }, [currentDate, view, project?.id]);

  const loadCalendarEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      const response = await axios.get(
        "http://localhost:3001/api/calendar/events",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            startDate: startOfMonth.toISOString().split("T")[0],
            endDate: endOfMonth.toISOString().split("T")[0],
            projectId: project?.id,
            view,
          },
        }
      );
      setEvents(response.data.events);
    } catch (error) {
      console.error("Error loading calendar events:", error);
    } finally {
      setLoading(false);
    }
  };

  const syncTasksToCalendar = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3001/api/calendar/sync-tasks",
        {
          projectId: project?.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      loadCalendarEvents();
      alert("Tasks synced to calendar successfully!");
    } catch (error) {
      console.error("Error syncing tasks:", error);
      alert("Failed to sync tasks to calendar");
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter((event) => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getEventColor = (eventType) => {
    switch (eventType) {
      case "task":
        return "bg-blue-500";
      case "deadline":
        return "bg-red-500";
      case "meeting":
        return "bg-green-500";
      case "milestone":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl h-5/6 mx-4 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">📅 Project Calendar</h1>
              {project && (
                <p className="text-indigo-100 mt-1">
                  {project.name} - Schedule & Timeline
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={syncTasksToCalendar}
                className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 font-medium"
              >
                🔄 Sync Tasks
              </button>
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

          {/* Calendar Navigation */}
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="text-white hover:text-indigo-200 p-2 rounded"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h2 className="text-xl font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={() => navigateMonth(1)}
                className="text-white hover:text-indigo-200 p-2 rounded"
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="text-indigo-100 hover:text-white px-3 py-1 rounded"
            >
              Today
            </button>
          </div>
        </div>

        {/* Calendar Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p>Loading calendar...</p>
            </div>
          ) : (
            <div>
              {/* Calendar Grid */}
              <div className="bg-white rounded-lg shadow-sm border">
                {/* Day Headers */}
                <div className="grid grid-cols-7 border-b bg-gray-50">
                  {dayNames.map((day) => (
                    <div
                      key={day}
                      className="p-4 text-center font-semibold text-gray-700 border-r last:border-r-0"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7">
                  {getDaysInMonth().map((date, index) => {
                    const dayEvents = getEventsForDate(date);
                    const isToday =
                      date && date.toDateString() === new Date().toDateString();
                    const isCurrentMonth =
                      date && date.getMonth() === currentDate.getMonth();

                    return (
                      <div
                        key={index}
                        className={`min-h-24 p-2 border-r border-b last:border-r-0 ${
                          !isCurrentMonth
                            ? "bg-gray-50"
                            : "bg-white hover:bg-gray-50"
                        } ${
                          isToday ? "bg-blue-50 border-blue-200" : ""
                        } cursor-pointer`}
                        onClick={() => date && setSelectedDate(date)}
                      >
                        {date && (
                          <>
                            <div
                              className={`text-sm mb-1 ${
                                isToday
                                  ? "font-bold text-blue-600"
                                  : !isCurrentMonth
                                  ? "text-gray-400"
                                  : "text-gray-900"
                              }`}
                            >
                              {date.getDate()}
                            </div>

                            {/* Events */}
                            <div className="space-y-1">
                              {dayEvents.slice(0, 3).map((event) => (
                                <div
                                  key={event.id}
                                  className={`text-xs px-2 py-1 rounded text-white truncate ${getEventColor(
                                    event.eventType
                                  )}`}
                                  title={event.title}
                                >
                                  {event.eventType === "task" && "📋"}
                                  {event.eventType === "deadline" && "⏰"}
                                  {event.eventType === "meeting" && "👥"}
                                  {event.eventType === "milestone" && "🎯"}
                                  {event.title}
                                </div>
                              ))}
                              {dayEvents.length > 3 && (
                                <div className="text-xs text-gray-500 px-2">
                                  +{dayEvents.length - 3} more
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-6 flex justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-blue-500"></div>
                  <span className="text-sm text-gray-600">📋 Tasks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-red-500"></div>
                  <span className="text-sm text-gray-600">⏰ Deadlines</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <span className="text-sm text-gray-600">👥 Meetings</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-purple-500"></div>
                  <span className="text-sm text-gray-600">🎯 Milestones</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Calendar;
