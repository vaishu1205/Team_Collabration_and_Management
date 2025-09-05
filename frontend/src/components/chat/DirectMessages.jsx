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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl h-96 flex">
        {/* Conversations List */}
        <div className="w-1/3 border-r">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-medium">Messages</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowNewChat(!showNewChat)}
                className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700"
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

          <div className="overflow-y-auto h-80">
            {/* New Chat Section */}
            {showNewChat && (
              <div className="border-b bg-gray-50">
                <div className="p-2 text-xs font-medium text-gray-600">
                  START NEW CHAT
                </div>
                {teamMembers.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500">
                    No team members found
                  </div>
                ) : (
                  teamMembers.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => startNewChat(member)}
                      className="p-3 cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-medium">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {member.name}
                          </p>
                          <p className="text-xs text-gray-500">
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
              <div className="p-4 text-center text-gray-500">
                <p className="mb-2">No conversations yet</p>
                <button
                  onClick={() => setShowNewChat(true)}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Start your first chat
                </button>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.partner.id}
                  onClick={() => setSelectedUser(conv.partner)}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedUser?.id === conv.partner.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                      {conv.partner.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {conv.partner.name}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {conv.lastMessage.content}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area - Rest of the component stays the same */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              <div className="p-4 border-b">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <h4 className="font-medium">{selectedUser.name}</h4>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>Start a conversation with {selectedUser.name}</p>
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
                          className={`max-w-xs px-3 py-2 rounded-lg ${
                            isMyMessage
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isMyMessage ? "text-blue-100" : "text-gray-500"
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

              <form onSubmit={sendMessage} className="p-4 border-t">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="mb-2">
                  Select a conversation or start a new chat
                </p>
                <button
                  onClick={() => setShowNewChat(true)}
                  className="text-blue-600 hover:underline"
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
