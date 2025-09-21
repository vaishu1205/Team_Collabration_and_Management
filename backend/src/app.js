require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const { syncDatabase } = require("./models");
const { router: emailRouter } = require("./routes/email");

const usersRouter = require("./routes/users");
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/projects", require("./routes/Projects"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/progress", require("./routes/progress"));
// Add this line with your other routes
app.use("/api/analytics", require("./routes/analytics"));
// Add this line with your other routes
app.use("/api/files", require("./routes/files"));

// Also add static file serving for uploads
app.use("/uploads", express.static("uploads"));
// Add this line with your other routes
app.use("/api/time", require("./routes/timeTracking"));
app.use("/api/calendar", require("./routes/calendar"));
app.use("/api/email", emailRouter);

app.use("/api/users", usersRouter);

app.get("/", (req, res) => {
  res.json({
    message: "Team Collaboration API is running!",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      projects: "/api/projects",
      tasks: "/api/tasks",
    },
  });
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-project", (projectId) => {
    socket.join(`project-${projectId}`);
    console.log(`User joined project-${projectId}`);
  });

  // socket.on("join-project", (projectId) => {
  //   socket.join(`project-${projectId}`);
  // });
  socket.on("send-message", (data) => {
    // Broadcast to everyone in the project EXCEPT the sender
    socket.to(`project-${data.projectId}`).emit("new-message", data.message);
  });

  socket.on("task-created", (data) => {
    socket.to(`project-${data.projectId}`).emit("new-task", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Initialize database
syncDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port http://localhost:${PORT}`);
  });
});
