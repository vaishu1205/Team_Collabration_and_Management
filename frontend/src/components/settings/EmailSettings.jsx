import { useState, useEffect } from "react";
import axios from "axios";

function EmailSettings({ onClose }) {
  const [preferences, setPreferences] = useState({
    taskAssignments: "instant",
    deadlineReminders: "daily",
    progressUpdates: "daily",
    weeklyDigest: true,
    projectUpdates: "daily",
    emailEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:3001/api/email/preferences",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPreferences(response.data.preferences);
    } catch (error) {
      console.error("Error loading email preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:3001/api/email/preferences",
        preferences,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Email preferences saved successfully!");
    } catch (error) {
      console.error("Error saving preferences:", error);
      alert("Failed to save email preferences");
    } finally {
      setSaving(false);
    }
  };

  const sendTestEmail = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3001/api/email/test",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Test email sent! Check your inbox.");
    } catch (error) {
      alert("Failed to send test email");
    }
  };

  const handleChange = (field, value) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-violet-900/50 to-indigo-900/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">
              Loading email settings...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-violet-900/50 to-indigo-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-500 to-indigo-600 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
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
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Email Notification Settings
                </h2>
                <p className="text-violet-100">
                  Customize how you receive email notifications
                </p>
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
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {/* Master Email Toggle */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900">
                      Email Notifications
                    </h3>
                    <p className="text-sm text-blue-700">
                      Enable or disable all email notifications
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.emailEnabled}
                    onChange={(e) =>
                      handleChange("emailEnabled", e.target.checked)
                    }
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-violet-500 peer-checked:to-indigo-500"></div>
                </label>
              </div>
            </div>

            {/* Notification Categories */}
            <div className="space-y-4">
              {/* Task Assignments */}
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/30 shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
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
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                  </div>
                  <label className="block text-sm font-bold text-gray-800">
                    Task Assignments
                  </label>
                </div>
                <select
                  value={preferences.taskAssignments}
                  onChange={(e) =>
                    handleChange("taskAssignments", e.target.value)
                  }
                  disabled={!preferences.emailEnabled}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all duration-200 disabled:bg-gray-100 disabled:opacity-50"
                >
                  <option value="instant">Instant</option>
                  <option value="daily">Daily Summary</option>
                  <option value="weekly">Weekly Summary</option>
                  <option value="off">Off</option>
                </select>
              </div>

              {/* Deadline Reminders */}
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/30 shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <label className="block text-sm font-bold text-gray-800">
                    Deadline Reminders
                  </label>
                </div>
                <select
                  value={preferences.deadlineReminders}
                  onChange={(e) =>
                    handleChange("deadlineReminders", e.target.value)
                  }
                  disabled={!preferences.emailEnabled}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all duration-200 disabled:bg-gray-100 disabled:opacity-50"
                >
                  <option value="instant">Instant</option>
                  <option value="daily">Daily Summary</option>
                  <option value="weekly">Weekly Summary</option>
                  <option value="off">Off</option>
                </select>
              </div>

              {/* Progress Updates */}
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/30 shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
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
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <label className="block text-sm font-bold text-gray-800">
                    Progress Updates
                  </label>
                </div>
                <select
                  value={preferences.progressUpdates}
                  onChange={(e) =>
                    handleChange("progressUpdates", e.target.value)
                  }
                  disabled={!preferences.emailEnabled}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all duration-200 disabled:bg-gray-100 disabled:opacity-50"
                >
                  <option value="instant">Instant</option>
                  <option value="daily">Daily Summary</option>
                  <option value="weekly">Weekly Summary</option>
                  <option value="off">Off</option>
                </select>
              </div>

              {/* Project Updates */}
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/30 shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
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
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <label className="block text-sm font-bold text-gray-800">
                    Project Updates
                  </label>
                </div>
                <select
                  value={preferences.projectUpdates}
                  onChange={(e) =>
                    handleChange("projectUpdates", e.target.value)
                  }
                  disabled={!preferences.emailEnabled}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all duration-200 disabled:bg-gray-100 disabled:opacity-50"
                >
                  <option value="instant">Instant</option>
                  <option value="daily">Daily Summary</option>
                  <option value="weekly">Weekly Summary</option>
                  <option value="off">Off</option>
                </select>
              </div>

              {/* Weekly Digest */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-slate-500 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Weekly Digest</h4>
                      <p className="text-sm text-gray-600">
                        Get a weekly summary of your activity
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences.weeklyDigest}
                      disabled={!preferences.emailEnabled}
                      onChange={(e) =>
                        handleChange("weeklyDigest", e.target.checked)
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-violet-500 peer-checked:to-indigo-500 disabled:opacity-50"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                onClick={sendTestEmail}
                className="bg-gradient-to-r from-gray-500 to-slate-500 text-white px-6 py-3 rounded-xl hover:from-gray-600 hover:to-slate-600 font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Send Test Email
              </button>
              <div className="space-x-4">
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={savePreferences}
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                >
                  {saving ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    "Save Preferences"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailSettings;

