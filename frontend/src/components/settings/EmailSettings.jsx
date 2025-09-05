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
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading email settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Email Notification Settings
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

          <div className="space-y-6">
            {/* Master Email Toggle */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">
                    Email Notifications
                  </h3>
                  <p className="text-sm text-blue-700">
                    Enable or disable all email notifications
                  </p>
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Notification Categories */}
            <div className="space-y-4">
              <div className="border-b pb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Assignments
                </label>
                <select
                  value={preferences.taskAssignments}
                  onChange={(e) =>
                    handleChange("taskAssignments", e.target.value)
                  }
                  disabled={!preferences.emailEnabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="instant">Instant</option>
                  <option value="daily">Daily Summary</option>
                  <option value="weekly">Weekly Summary</option>
                  <option value="off">Off</option>
                </select>
              </div>

              <div className="border-b pb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline Reminders
                </label>
                <select
                  value={preferences.deadlineReminders}
                  onChange={(e) =>
                    handleChange("deadlineReminders", e.target.value)
                  }
                  disabled={!preferences.emailEnabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="instant">Instant</option>
                  <option value="daily">Daily Summary</option>
                  <option value="weekly">Weekly Summary</option>
                  <option value="off">Off</option>
                </select>
              </div>

              <div className="border-b pb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progress Updates
                </label>
                <select
                  value={preferences.progressUpdates}
                  onChange={(e) =>
                    handleChange("progressUpdates", e.target.value)
                  }
                  disabled={!preferences.emailEnabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="instant">Instant</option>
                  <option value="daily">Daily Summary</option>
                  <option value="weekly">Weekly Summary</option>
                  <option value="off">Off</option>
                </select>
              </div>

              <div className="border-b pb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Updates
                </label>
                <select
                  value={preferences.projectUpdates}
                  onChange={(e) =>
                    handleChange("projectUpdates", e.target.value)
                  }
                  disabled={!preferences.emailEnabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="instant">Instant</option>
                  <option value="daily">Daily Summary</option>
                  <option value="weekly">Weekly Summary</option>
                  <option value="off">Off</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Weekly Digest</h4>
                  <p className="text-sm text-gray-600">
                    Get a weekly summary of your activity
                  </p>
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <button
                onClick={sendTestEmail}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Send Test Email
              </button>
              <div className="space-x-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={savePreferences}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Preferences"}
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
