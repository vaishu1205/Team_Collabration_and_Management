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

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError("");

  //   try {
  //     const token = localStorage.getItem("token");
  //     await axios.post(
  //       `http://localhost:3001/api/progress/task/${task.id}`,
  //       {
  //         ...formData,
  //         progressPercent: parseInt(formData.progressPercent),
  //         hoursWorked: parseFloat(formData.hoursWorked),
  //       },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     alert("Progress updated successfully!");
  //     onProgressUpdated();
  //     onClose();
  //   } catch (error) {
  //     setError(error.response?.data?.message || "Failed to update progress");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Update Task Progress</h2>
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

          <div className="mb-4 p-3 bg-gray-50 rounded">
            <h3 className="font-medium text-gray-900">{task.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progress Percentage
                </label>
                <div className="relative">
                  <input
                    type="range"
                    name="progressPercent"
                    min="0"
                    max="100"
                    value={formData.progressPercent}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="text-center mt-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-lg font-bold">
                      {formData.progressPercent}%
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 4.5"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Completed
              </label>
              <textarea
                name="workCompleted"
                value={formData.workCompleted}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe what you accomplished today..."
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Blockers
              </label>
              <textarea
                name="blockers"
                value={formData.blockers}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any issues preventing progress? (optional)"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Steps
              </label>
              <textarea
                name="nextSteps"
                value={formData.nextSteps}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What will you work on next? (optional)"
              />
            </div>

            {/* File Attachments */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attach Work Files (optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
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
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    📎 Attach Files
                  </button>
                  <p className="text-sm text-gray-500 mt-1">
                    Upload screenshots, documents, or other work files
                  </p>
                </div>

                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                      >
                        <span className="text-sm text-gray-700">
                          📎 {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setAttachments((prev) =>
                              prev.filter((_, i) => i !== index)
                            )
                          }
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Progress"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProgressUpdate;
