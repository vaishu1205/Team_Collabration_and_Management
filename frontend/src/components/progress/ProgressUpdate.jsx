import { useState, useRef } from "react";
import axios from "axios";

function ProgressUpdate({ task, onClose, onProgressUpdated }) {
  const [formData, setFormData] = useState({
    progressPercent: 0,
    hoursWorked: "",
    workCompleted: "",
    blockers: "",
    nextSteps: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3001/api/progress/task/${task.id}`,
        {
          ...formData,
          progressPercent: parseInt(formData.progressPercent),
          hoursWorked: parseFloat(formData.hoursWorked),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Upload attachments if any
      if (attachments.length > 0) {
        const fileFormData = new FormData();
        attachments.forEach((file) => fileFormData.append("files", file));
        fileFormData.append(
          "description",
          `Progress update attachments - ${formData.workCompleted.substring(
            0,
            50
          )}...`
        );

        await axios.post(
          `http://localhost:3001/api/files/upload/task/${task.id}`,
          fileFormData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      alert("Progress updated successfully!");
      onProgressUpdated();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update progress");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <svg
                  className="w-7 h-7 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Update Task Progress
              </h2>
              <p className="text-blue-100 mt-1">
                Track your work completion and next steps
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200"
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

        <div className="p-8 overflow-y-auto max-h-[calc(95vh-140px)]">
          {/* Task Info Card */}
          <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {task.title}
                </h3>
                <p className="text-gray-600 mt-1">{task.description}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Progress and Hours Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Progress Percentage */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Progress Percentage
                </label>
                <input
                  type="range"
                  name="progressPercent"
                  min="0"
                  max="100"
                  value={formData.progressPercent}
                  onChange={handleChange}
                  className="w-full h-3 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-center mt-4">
                  <span className="bg-green-500 text-white px-4 py-2 rounded-full text-xl font-bold shadow-md">
                    {formData.progressPercent}%
                  </span>
                </div>
              </div>

              {/* Hours Worked */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Hours Worked Today
                </label>
                <input
                  type="number"
                  name="hoursWorked"
                  step="0.5"
                  min="0"
                  max="24"
                  value={formData.hoursWorked}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                  placeholder="e.g., 4.5"
                  required
                />
              </div>
            </div>

            {/* Work Completed */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Work Completed
              </label>
              <textarea
                name="workCompleted"
                value={formData.workCompleted}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Describe what you accomplished today in detail..."
                required
              />
            </div>

            {/* Blockers and Next Steps Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Current Blockers */}
              <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl border border-red-200">
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  Current Blockers
                </label>
                <textarea
                  name="blockers"
                  value={formData.blockers}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  placeholder="Any issues preventing progress? (optional)"
                />
              </div>

              {/* Next Steps */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Next Steps
                </label>
                <textarea
                  name="nextSteps"
                  value={formData.nextSteps}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-yellow-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                  placeholder="What will you work on next? (optional)"
                />
              </div>
            </div>

            {/* File Attachments */}
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200">
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
                Attach Work Files (optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-gray-400 transition-colors duration-200">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => setAttachments(Array.from(e.target.files))}
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.mp4,.mov"
                />
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                    Choose Files
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    Upload screenshots, documents, or other work files
                  </p>
                </div>

                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm"
                      >
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-5 h-5 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span className="text-sm text-gray-700 font-medium">
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setAttachments((prev) =>
                              prev.filter((_, i) => i !== index)
                            )
                          }
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-full transition-colors duration-200"
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating...
                  </div>
                ) : (
                  "Update Progress"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProgressUpdate;
