import { useState, useEffect } from "react";
import axios from "axios";
import ManualTimeEntry from "./ManualTimeEntry";

function Timesheet({ onClose }) {
  const [timesheet, setTimesheet] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);

  useEffect(() => {
    // Set default dates to current week
    const today = new Date();
    const monday = new Date(
      today.setDate(today.getDate() - today.getDay() + 1)
    );
    const sunday = new Date(
      today.setDate(today.getDate() - today.getDay() + 7)
    );

    setStartDate(monday.toISOString().split("T")[0]);
    setEndDate(sunday.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      loadTimesheet();
    }
  }, [startDate, endDate]);

  const loadTimesheet = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:3001/api/time/timesheet",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { startDate, endDate },
        }
      );
      setTimesheet(response.data.timesheet);
    } catch (error) {
      console.error("Error loading timesheet:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTimeEntry = async (entryId) => {
    if (!confirm("Are you sure you want to delete this time entry?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3001/api/time/${entryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadTimesheet(); // Refresh
    } catch (error) {
      alert("Failed to delete time entry");
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl mx-4 max-h-screen overflow-hidden flex flex-col">
        <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">📋 My Timesheet</h1>
              <p className="text-blue-100 mt-1">
                Track and manage your work hours
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

          {/* Date Range Selector */}
          <div className="mt-4 flex items-center space-x-4">
            <div>
              <label className="block text-sm text-blue-100">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1 rounded text-gray-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-blue-100">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1 rounded text-gray-900 text-sm"
              />
            </div>
            <button
              onClick={() => setShowManualEntry(true)}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 font-medium mt-5"
            >
              + Add Time Entry
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading timesheet...</p>
            </div>
          ) : timesheet ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg">
                  <div className="text-2xl font-bold">
                    {timesheet.summary.totalHours}h
                  </div>
                  <div className="text-blue-100">Total Hours</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg">
                  <div className="text-2xl font-bold">
                    {timesheet.summary.totalBillableHours}h
                  </div>
                  <div className="text-green-100">Billable Hours</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg">
                  <div className="text-2xl font-bold">
                    {timesheet.summary.totalEntries}
                  </div>
                  <div className="text-purple-100">Time Entries</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg">
                  <div className="text-2xl font-bold">
                    {timesheet.summary.averageHoursPerDay}h
                  </div>
                  <div className="text-orange-100">Avg/Day</div>
                </div>
              </div>

              {/* Time Entries by Date */}
              <div className="space-y-4">
                {Object.keys(timesheet.entriesByDate).length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">⏰</div>
                    <p className="text-gray-500 text-lg">
                      No time entries for this period
                    </p>
                    <button
                      onClick={() => setShowManualEntry(true)}
                      className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Add Your First Entry
                    </button>
                  </div>
                ) : (
                  Object.entries(timesheet.entriesByDate).map(
                    ([date, entries]) => {
                      const dayTotal = entries.reduce(
                        (sum, entry) => sum + (entry.duration || 0),
                        0
                      );
                      return (
                        <div key={date} className="bg-white border rounded-lg">
                          <div className="p-4 border-b bg-gray-50">
                            <div className="flex justify-between items-center">
                              <h3 className="font-semibold text-gray-900">
                                {formatDate(date)}
                              </h3>
                              <span className="font-medium text-blue-600">
                                {formatTime(dayTotal)}
                              </span>
                            </div>
                          </div>
                          <div className="divide-y">
                            {entries.map((entry) => (
                              <div key={entry.id} className="p-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                      <div
                                        className="w-3 h-3 rounded-full"
                                        style={{
                                          backgroundColor: entry.project.color,
                                        }}
                                      ></div>
                                      <span className="font-medium text-gray-900">
                                        {entry.project.name}
                                      </span>
                                      {entry.task && (
                                        <span className="text-sm text-gray-500">
                                          • {entry.task.title}
                                        </span>
                                      )}
                                      <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          entry.entryType === "timer"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-blue-100 text-blue-800"
                                        }`}
                                      >
                                        {entry.entryType === "timer"
                                          ? "⏱️ Timer"
                                          : "✏️ Manual"}
                                      </span>
                                      {entry.isBillable && (
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                          💰 Billable
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-gray-600 text-sm mb-2">
                                      {entry.description}
                                    </p>
                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                      <span>
                                        {new Date(
                                          entry.startTime
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                        {entry.endTime &&
                                          ` - ${new Date(
                                            entry.endTime
                                          ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}`}
                                      </span>
                                      <span>
                                        {formatTime(entry.duration || 0)}
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => deleteTimeEntry(entry.id)}
                                    className="text-red-500 hover:text-red-700 ml-4"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                Select a date range to view your timesheet
              </p>
            </div>
          )}
        </div>

        {showManualEntry && (
          <ManualTimeEntry
            onClose={() => setShowManualEntry(false)}
            onEntryAdded={() => {
              loadTimesheet();
              setShowManualEntry(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default Timesheet;
