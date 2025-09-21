import { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";

function ProjectChat({ project, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();

    // Setup socket for real-time messages
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    newSocket.emit("join-project", project.id);

    newSocket.on("new-message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      newSocket.close();
    };
  }, [project.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3001/api/chat/project/${project.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(response.data.messages);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:3001/api/chat/project/${project.id}`,
        { content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add message locally (UNCOMMENT THIS!)
      const message = response.data.data;
      setMessages((prev) => [...prev, message]);

      // Emit to other users via socket
      if (socket) {
        socket.emit("send-message", {
          projectId: project.id,
          message: message,
        });
      }

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-violet-900/50 to-indigo-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 w-full max-w-3xl h-[600px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-violet-500 to-indigo-600">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                style={{ backgroundColor: project.color }}
              ></div>
              <div>
                <h3 className="font-bold text-white text-lg">{project.name}</h3>
                <p className="text-violet-100 text-sm">Team Chat</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
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

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50/30 to-white/30">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gradient-to-r from-violet-200 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-violet-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">No messages yet</p>
              <p className="text-gray-500 text-sm mt-1">
                Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isMyMessage = message.sender.id === currentUser.id;
              const showSender =
                index === 0 ||
                messages[index - 1].sender.id !== message.sender.id;

              return (
                <div
                  key={message.id}
                  className={`flex w-full ${
                    isMyMessage ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex ${
                      isMyMessage ? "flex-row-reverse" : "flex-row"
                    } items-end space-x-2 max-w-lg`}
                  >
                    {/* Avatar for others */}
                    {!isMyMessage && showSender && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-lg mb-1">
                        {message.sender.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {!isMyMessage && !showSender && (
                      <div className="w-8 h-8"></div>
                    )}

                    <div
                      className={`rounded-2xl px-4 py-3 shadow-lg ${
                        isMyMessage
                          ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white"
                          : "bg-white border border-gray-200 text-gray-800"
                      } ${isMyMessage ? "ml-2" : "mr-2"}`}
                    >
                      {/* Sender name (only for others and first message in sequence) */}
                      {!isMyMessage && showSender && (
                        <div className="text-xs font-bold text-violet-600 mb-1">
                          {message.sender.name}
                        </div>
                      )}

                      {/* Message content */}
                      <div className="text-sm font-medium">
                        {message.content}
                      </div>

                      {/* Time */}
                      <div
                        className={`text-xs mt-1 ${
                          isMyMessage ? "text-violet-100" : "text-gray-500"
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form
          onSubmit={sendMessage}
          className="p-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm"
        >
          <div className="flex space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all duration-200"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-violet-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              {sending ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  <span>Send</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectChat;
