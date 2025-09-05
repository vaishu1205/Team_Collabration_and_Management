import { useState, useEffect, useRef } from "react";
import axios from "axios";

function GlobalSearch({ isOpen, onClose, onItemSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({
    projects: [],
    tasks: [],
    files: [],
    messages: [],
    users: [],
  });
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery("");
      setResults({
        projects: [],
        tasks: [],
        files: [],
        messages: [],
        users: [],
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, getTotalResults() - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selectedItem = getSelectedItem();
        if (selectedItem && onItemSelect) {
          onItemSelect(selectedItem);
        }
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, results]);

  useEffect(() => {
    if (query.length >= 2) {
      const debounceTimer = setTimeout(() => {
        performSearch();
        getSuggestions();
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setResults({
        projects: [],
        tasks: [],
        files: [],
        messages: [],
        users: [],
      });
      setSuggestions([]);
    }
  }, [query, activeTab]);

  const performSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3001/api/search", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          q: query,
          type: activeTab,
          limit: 15,
        },
      });
      setResults(response.data.results);
      setSelectedIndex(0);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:3001/api/search/suggestions",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { q: query },
        }
      );
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error("Suggestions error:", error);
    }
  };

  const getTotalResults = () => {
    return Object.values(results).reduce((total, arr) => total + arr.length, 0);
  };

  const getSelectedItem = () => {
    let index = 0;
    for (const [type, items] of Object.entries(results)) {
      if (selectedIndex < index + items.length) {
        return { ...items[selectedIndex - index], type };
      }
      index += items.length;
    }
    return null;
  };

  const getItemIcon = (type) => {
    switch (type) {
      case "project":
        return "📁";
      case "task":
        return "📋";
      case "file":
        return "📎";
      case "message":
        return "💬";
      case "user":
        return "👤";
      default:
        return "📄";
    }
  };

  const getItemColor = (type) => {
    switch (type) {
      case "project":
        return "text-blue-600";
      case "task":
        return "text-green-600";
      case "file":
        return "text-purple-600";
      case "message":
        return "text-orange-600";
      case "user":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const handleItemClick = (item, type) => {
    if (onItemSelect) {
      onItemSelect({ ...item, type });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-96 flex flex-col">
        {/* Search Header */}
        <div className="p-4 border-b">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search projects, tasks, files, messages..."
            />
            {loading && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {/* Search Tabs */}
          <div className="flex space-x-4 mt-3">
            {["all", "projects", "tasks", "files", "users"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activeTab === tab
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {!query ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg">Start typing to search...</p>
              <p className="text-gray-400 text-sm mt-2">
                Use ↑↓ to navigate, Enter to select, Esc to close
              </p>
            </div>
          ) : loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Searching...</p>
            </div>
          ) : getTotalResults() === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-gray-500 text-lg">
                No results found for "{query}"
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Try different keywords or check spelling
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(results).map(([type, items]) => {
                if (items.length === 0) return null;

                let itemIndex = 0;
                for (const [prevType, prevItems] of Object.entries(results)) {
                  if (prevType === type) break;
                  itemIndex += prevItems.length;
                }

                return (
                  <div key={type}>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 capitalize">
                      {type} ({items.length})
                    </h3>
                    <div className="space-y-1">
                      {items.map((item, index) => {
                        const isSelected = itemIndex + index === selectedIndex;

                        return (
                          <div
                            key={`${type}-${item.id}`}
                            onClick={() => handleItemClick(item, type)}
                            className={`flex items-start p-3 cursor-pointer rounded-md group transition-colors ${
                              isSelected
                                ? "bg-blue-50 border-l-2 border-blue-500"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <span
                              className={`text-lg mr-3 ${getItemColor(
                                type
                              )} mt-0.5`}
                            >
                              {getItemIcon(type)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.title ||
                                  item.name ||
                                  item.originalName ||
                                  item.content?.substring(0, 50) + "..."}
                              </p>
                              <div className="flex items-center space-x-4 mt-1">
                                {item.project && (
                                  <span className="text-xs text-gray-500">
                                    📁 {item.project.name}
                                  </span>
                                )}
                                {item.assignee && (
                                  <span className="text-xs text-gray-500">
                                    👤 {item.assignee.name}
                                  </span>
                                )}
                                {item.status && (
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full ${
                                      item.status === "completed"
                                        ? "bg-green-100 text-green-700"
                                        : item.status === "in_progress"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {item.status.replace("_", " ")}
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-xs text-gray-600 mt-1 truncate">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                              {type}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t text-center">
          <p className="text-xs text-gray-500">
            Press{" "}
            <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">↑↓</kbd> to
            navigate •
            <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs ml-1">
              Enter
            </kbd>{" "}
            to select •
            <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs ml-1">
              Esc
            </kbd>{" "}
            to close
          </p>
        </div>
      </div>
    </div>
  );
}

export default GlobalSearch;
