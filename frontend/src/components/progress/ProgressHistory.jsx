import { useState, useEffect } from "react";
import axios from "axios";

function ProgressHistory({ task, onClose }) {
  const [progressUpdates, setProgressUpdates] = useState([]);
  const [taskFiles, setTaskFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressHistory();
    loadTaskFiles();
  }, [task.id]);

  const loadProgressHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3001/api/progress/task/${task.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProgressUpdates(response.data.updates);
    } catch (error) {
      console.error("Error loading progress history:", error);
    }
  };

  const loadTaskFiles = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3001/api/files/task/${task.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTaskFiles(response.data.files);
    } catch (error) {
      console.error("Error loading task files:", error);
    } finally {
      setLoading(false);
    }
  };

  // Match files to progress updates by timestamp (within 5 minutes)
  const getFilesForProgress = (progressUpdate) => {
    const progressTime = new Date(progressUpdate.createdAt);
    return taskFiles.filter((file) => {
      const fileTime = new Date(file.createdAt);
      const timeDiff = Math.abs(fileTime - progressTime);
      // If file was uploaded within 5 minutes of progress update
      return (
        timeDiff <= 5 * 60 * 1000 &&
        file.uploadedById === progressUpdate.reporter.id
      );
    });
  };

  const downloadFile = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3001/api/files/download/${fileId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Failed to download file");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getProgressColor = (percent) => {
    if (percent >= 80) return "text-green-600 bg-green-100";
    if (percent >= 50) return "text-yellow-600 bg-yellow-100";
    if (percent >= 20) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("word")) return "📝";
    if (mimeType.includes("excel")) return "📊";
    if (mimeType.includes("powerpoint")) return "📋";
    if (mimeType.includes("zip")) return "🗜️";
    if (mimeType.startsWith("video/")) return "🎥";
    return "📁";
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-screen overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">📊 Progress History & Files</h2>
              <p className="text-gray-600 mt-1">{task.title}</p>
            </div>
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
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading progress history...</p>
            </div>
          ) : progressUpdates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No progress updates yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {progressUpdates.map((update) => {
                const attachedFiles = getFilesForProgress(update);
                return (
                  <div
                    key={update.id}
                    className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {update.reporter.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {update.reporter.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(update.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getProgressColor(
                            update.progressPercent
                          )}`}
                        >
                          {update.progressPercent}% Complete
                        </span>
                        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          ⏱️ {update.hoursWorked}h worked
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          ✅ Work Completed
                        </h4>
                        <p className="text-gray-600 text-sm bg-green-50 p-3 rounded">
                          {update.workCompleted}
                        </p>
                      </div>
                      {update.blockers && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            🚫 Blockers
                          </h4>
                          <p className="text-red-600 text-sm bg-red-50 p-3 rounded">
                            {update.blockers}
                          </p>
                        </div>
                      )}
                      {update.nextSteps && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            🎯 Next Steps
                          </h4>
                          <p className="text-blue-600 text-sm bg-blue-50 p-3 rounded">
                            {update.nextSteps}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* FILES UPLOADED WITH THIS UPDATE */}
                    {attachedFiles.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-3">
                          📎 Files Uploaded with This Update (
                          {attachedFiles.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {attachedFiles.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg"
                            >
                              <span className="text-2xl">
                                {getFileIcon(file.mimeType)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p
                                  className="font-medium text-gray-900 text-sm truncate"
                                  title={file.originalName}
                                >
                                  {file.originalName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(file.createdAt)}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  downloadFile(file.id, file.originalName)
                                }
                                className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                              >
                                ⬇️
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* ALL TASK FILES SECTION */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📂 All Task Files ({taskFiles.length})
                </h3>
                {taskFiles.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No files uploaded for this task yet
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {taskFiles.map((file) => (
                      <div
                        key={file.id}
                        className="border rounded-lg p-3 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xl">
                            {getFileIcon(file.mimeType)}
                          </span>
                          <p
                            className="font-medium text-gray-900 text-sm truncate"
                            title={file.originalName}
                          >
                            {file.originalName}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">
                          By {file.uploader.name} • {formatDate(file.createdAt)}
                        </p>
                        <button
                          onClick={() =>
                            downloadFile(file.id, file.originalName)
                          }
                          className="w-full bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                        >
                          ⬇️ Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProgressHistory;
