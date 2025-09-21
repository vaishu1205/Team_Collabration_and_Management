import { useState, useEffect, useRef } from "react";
import axios from "axios";

function DirectMessages({ onClose }) {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    loadConversations();
    loadTeamMembers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser.id);
      setShowNewChat(false);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:3001/api/chat/conversations",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setConversations(response.data.conversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const token = localStorage.getItem("token");

      // Get all projects user is part of
      const projectsResponse = await axios.get(
        "http://localhost:3001/api/projects",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Get members from all projects
      const allMembers = new Set();
      for (const project of projectsResponse.data.projects) {
        const membersResponse = await axios.get(
          `http://localhost:3001/api/projects/${project.id}/members`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        membersResponse.data.members.forEach((member) => {
          if (member.user.id !== currentUser?.id) {
            // Don't include self
            allMembers.add(JSON.stringify(member.user));
          }
        });
      }

      setTeamMembers(
        Array.from(allMembers).map((member) => JSON.parse(member))
      );
    } catch (error) {
      console.error("Error loading team members:", error);
    }
  };

  const loadMessages = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3001/api/chat/direct/${userId}`,
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
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:3001/api/chat/direct/${selectedUser.id}`,
        { content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const message = response.data.data;
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
      loadConversations();
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    }
  };

  const startNewChat = (member) => {
    setSelectedUser(member);
    setMessages([]); // Start with empty messages
    setShowNewChat(false);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-violet-900/50 to-indigo-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 w-full max-w-5xl h-[600px] flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-1/3 bg-gradient-to-b from-gray-50/80 to-white/80 backdrop-blur-sm border-r border-gray-200">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-violet-500 to-indigo-600">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
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
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-white">Messages</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowNewChat(!showNewChat)}
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all duration-200"
                  title="Start new chat"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
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
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto h-[500px]">
            {/* New Chat Section */}
            {showNewChat && (
              <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                <div className="p-3 text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Start New Chat
                </div>
                {teamMembers.length === 0 ? (
                  <div className="p-4 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg
                        className="w-6 h-6 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">
                      No team members found
                    </p>
                  </div>
                ) : (
                  teamMembers.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => startNewChat(member)}
                      className="p-3 cursor-pointer hover:bg-white/60 transition-all duration-200 border-b border-gray-100"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">
                            {member.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Existing Conversations */}
            {conversations.length === 0 && !showNewChat ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-500"
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
                <p className="text-gray-600 font-medium mb-2">
                  No conversations yet
                </p>
                <button
                  onClick={() => setShowNewChat(true)}
                  className="text-violet-600 text-sm hover:text-violet-700 font-medium hover:underline"
                >
                  Start your first chat
                </button>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.partner.id}
                  onClick={() => setSelectedUser(conv.partner)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-white/60 transition-all duration-200 ${
                    selectedUser?.id === conv.partner.id
                      ? "bg-gradient-to-r from-violet-100 to-indigo-100 border-violet-200"
                      : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg">
                      {conv.partner.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">
                        {conv.partner.name}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {conv.lastMessage.content}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full px-2 py-1 font-medium shadow-lg">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-white/80 to-gray-50/80 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">
                      {selectedUser.name}
                    </h4>
                    <p className="text-sm text-gray-600">Online</p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50/30 to-white/30">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-gray-500"
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
                    <p className="text-gray-600 font-medium">
                      Start a conversation with {selectedUser.name}
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMyMessage = message.senderId === currentUser.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isMyMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-sm px-4 py-3 rounded-2xl shadow-lg ${
                            isMyMessage
                              ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white"
                              : "bg-white border border-gray-200 text-gray-800"
                          }`}
                        >
                          <p className="text-sm font-medium">
                            {message.content}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              isMyMessage ? "text-violet-100" : "text-gray-500"
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
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
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-violet-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
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
                        strokeWidth="2"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-50/30 to-white/30">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-violet-200 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-violet-600"
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
                <p className="text-gray-700 font-medium mb-2">
                  Select a conversation or start a new chat
                </p>
                <button
                  onClick={() => setShowNewChat(true)}
                  className="text-violet-600 hover:text-violet-700 font-medium hover:underline"
                >
                  Browse team members
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DirectMessages;
