import { useState } from "react";
import axios from "axios";

function ProjectSummary({ project, onClose }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateSummary = async () => {
    setLoading(true);
    setError("");
    setSummary("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:3001/api/ai/project-summary/${project.id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSummary(response.data.summary);
    } catch (error) {
      console.error("Error generating summary:", error);
      setError("Failed to generate project summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
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
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold flex items-center">
                  AI Project Summary
                </h2>
                <p className="text-purple-100 mt-1">
                  Get AI-powered insights for "{project.name}"
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200"
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

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {!summary && !loading && !error && (
            <div className="text-center py-12">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Ready to analyze your project
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Get AI-powered insights including progress analysis, risk
                assessment, and recommendations for your project.
              </p>
              <button
                onClick={generateSummary}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Generate AI Summary
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI is analyzing your project...
              </h3>
              <p className="text-gray-600">This may take a few seconds</p>
              <div className="mt-4 bg-purple-50 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-purple-700">
                  Analyzing project data, tasks, and team performance
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <svg
                  className="w-6 h-6 text-red-500 mr-3 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.314 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">
                    Error generating summary
                  </h3>
                  <p className="text-red-800 mb-4">{error}</p>
                  <button
                    onClick={generateSummary}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium transition-colors duration-200"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {summary && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-green-600"
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
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-green-900 mb-4 flex items-center">
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    AI Project Analysis
                  </h3>
                  <div className="bg-white rounded-lg p-6 border border-green-200 mb-4">
                    <div className="text-gray-800 whitespace-pre-line leading-relaxed text-sm">
                      {summary}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-green-200">
                    <div className="flex space-x-3">
                      <button
                        onClick={generateSummary}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium transition-colors duration-200"
                      >
                        Regenerate Summary
                      </button>
                    </div>
                    <div className="flex items-center text-xs text-green-600">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Generated using AI - results may vary
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectSummary;
