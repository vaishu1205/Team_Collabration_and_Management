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

  //   const sendMessage = async (e) => {
  //     e.preventDefault();
  //     if (!newMessage.trim() || sending) return;

  //     setSending(true);
  //     try {
  //       const token = localStorage.getItem("token");
  //       const response = await axios.post(
  //         `http://localhost:3001/api/chat/project/${project.id}`,
  //         { content: newMessage },
  //         { headers: { Authorization: `Bearer ${token}` } }
  //       );

  //       // Add message locally and emit to other users
  //       const message = response.data.data;
  //       newSocket.on("new-message", (message) => {
  //         setMessages((prev) => [...prev, message]);
  //       });
  //      // setMessages((prev) => [...prev, message]);

  //       if (socket) {
  //         socket.emit("send-message", {
  //           projectId: project.id,
  //           message: message,
  //         });
  //       }

  //       setNewMessage("");
  //     } catch (error) {
  //       console.error("Error sending message:", error);
  //       alert("Failed to send message");
  //     } finally {
  //       setSending(false);
  //     }
  //   };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl h-96 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: project.color }}
            ></div>
            <h3 className="font-medium">{project.name} - Team Chat</h3>
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

        {/* Messages */}
        {/* <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender.id === currentUser.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender.id === currentUser.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {message.sender.id !== currentUser.id && (
                    <p className="text-xs font-medium mb-1 opacity-75">
                      {message.sender.name}
                    </p>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender.id === currentUser.id
                        ? "text-blue-100"
                        : "text-gray-500"
                    }`}
                  >
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div> */}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No messages yet. Start the conversation!
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
                    className={`max-w-xs lg:max-w-md ${
                      isMyMessage
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-900"
                    } rounded-lg px-3 py-2`}
                  >
                    {/* Sender name (only for others) */}
                    {!isMyMessage && showSender && (
                      <div className="text-xs font-semibold text-blue-600 mb-1">
                        {message.sender.name}
                      </div>
                    )}

                    {/* Message content */}
                    <div className="text-sm">{message.content}</div>

                    {/* Time */}
                    <div
                      className={`text-xs mt-1 ${
                        isMyMessage ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={sendMessage} className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectChat;
