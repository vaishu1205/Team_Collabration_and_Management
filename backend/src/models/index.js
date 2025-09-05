const sequelize = require("../config/database");
const User = require("./User");
const Project = require("./Project");
const Task = require("./Task");
const ProjectMember = require("./ProjectMember");
const Notification = require("./Notification");
const Message = require("./Message");
const DirectMessage = require("./DirectMessage");
const TaskProgress = require("./TaskProgress");
const File = require("./File");
const TimeEntry = require("./TimeEntry");
const CalendarEvent = require("./Calendar");
const EmailPreference = require("./EmailPreference");

// User-Project relationships (manager)
User.hasMany(Project, {
  foreignKey: "managerId",
  as: "managedProjects",
});
Project.belongsTo(User, {
  foreignKey: "managerId",
  as: "manager",
});

// Add EmailPreference relationships
EmailPreference.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});
User.hasOne(EmailPreference, {
  foreignKey: "userId",
  as: "emailPreference",
});

// Message relationships
Project.hasMany(Message, {
  foreignKey: "projectId",
  as: "messages",
});
Message.belongsTo(Project, {
  foreignKey: "projectId",
  as: "project",
});

User.hasMany(Message, {
  foreignKey: "senderId",
  as: "sentMessages",
});
Message.belongsTo(User, {
  foreignKey: "senderId",
  as: "sender",
});

// Project-ProjectMember relationships
Project.hasMany(ProjectMember, {
  foreignKey: "projectId",
  as: "members",
});
ProjectMember.belongsTo(Project, {
  foreignKey: "projectId",
  as: "project",
});

TimeEntry.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});
User.hasMany(TimeEntry, {
  foreignKey: "userId",
  as: "timeEntries",
});

TimeEntry.belongsTo(Project, {
  foreignKey: "projectId",
  as: "project",
});
Project.hasMany(TimeEntry, {
  foreignKey: "projectId",
  as: "timeEntries",
});

TimeEntry.belongsTo(Task, {
  foreignKey: "taskId",
  as: "task",
});
Task.hasMany(TimeEntry, {
  foreignKey: "taskId",
  as: "timeEntries",
});

// User-ProjectMember relationships
User.hasMany(ProjectMember, {
  foreignKey: "userId",
  as: "projectMemberships",
});
ProjectMember.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// Project-Task relationships
Project.hasMany(Task, {
  foreignKey: "projectId",
  as: "tasks",
});
Task.belongsTo(Project, {
  foreignKey: "projectId",
  as: "project",
});

// User-Task relationships (assignee)
User.hasMany(Task, {
  foreignKey: "assigneeId",
  as: "assignedTasks",
});
Task.belongsTo(User, {
  foreignKey: "assigneeId",
  as: "assignee",
});

// User-Notification relationships
User.hasMany(Notification, {
  foreignKey: "userId",
  as: "notifications",
});
Notification.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// Add CalendarEvent relationships after existing ones:
CalendarEvent.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});
User.hasMany(CalendarEvent, {
  foreignKey: "userId",
  as: "calendarEvents",
});

CalendarEvent.belongsTo(Project, {
  foreignKey: "projectId",
  as: "project",
});
Project.hasMany(CalendarEvent, {
  foreignKey: "projectId",
  as: "calendarEvents",
});

CalendarEvent.belongsTo(Task, {
  foreignKey: "taskId",
  as: "task",
});
Task.hasOne(CalendarEvent, {
  foreignKey: "taskId",
  as: "calendarEvent",
});

// DirectMessage relationships
User.hasMany(DirectMessage, {
  foreignKey: "senderId",
  as: "sentDirectMessages",
});
User.hasMany(DirectMessage, {
  foreignKey: "receiverId",
  as: "receivedDirectMessages",
});

DirectMessage.belongsTo(User, {
  foreignKey: "senderId",
  as: "sender",
});
DirectMessage.belongsTo(User, {
  foreignKey: "receiverId",
  as: "receiver",
});

// File relationships
File.belongsTo(User, {
  foreignKey: "uploadedById",
  as: "uploader",
});
User.hasMany(File, {
  foreignKey: "uploadedById",
  as: "uploadedFiles",
});

File.belongsTo(Project, {
  foreignKey: "projectId",
  as: "project",
});
Project.hasMany(File, {
  foreignKey: "projectId",
  as: "files",
});

File.belongsTo(Task, {
  foreignKey: "taskId",
  as: "task",
});
Task.hasMany(File, {
  foreignKey: "taskId",
  as: "files",
});

// TaskProgress relationships
Task.hasMany(TaskProgress, {
  foreignKey: "taskId",
  as: "progressUpdates",
});
TaskProgress.belongsTo(Task, {
  foreignKey: "taskId",
  as: "task",
});

User.hasMany(TaskProgress, {
  foreignKey: "userId",
  as: "progressReports",
});
TaskProgress.belongsTo(User, {
  foreignKey: "userId",
  as: "reporter",
});

// User-Task relationships (creator)
User.hasMany(Task, {
  foreignKey: "createdById",
  as: "createdTasks",
});
Task.belongsTo(User, {
  foreignKey: "createdById",
  as: "creator",
});

console.log("✅ All model relationships defined successfully");

const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log("✅ Database tables created successfully");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
  }
};
// console.log("✅ All model relationships defined successfully");

// const syncDatabase = async () => {
//   try {
//     await sequelize.sync({ force: false });
//     console.log("✅ Database tables created successfully");
//   } catch (error) {
//     console.error("❌ Error creating tables:", error);
//   }
// };

module.exports = {
  User,
  Project,
  Task,
  ProjectMember,
  Notification,
  Message,
  DirectMessage,
  TaskProgress,
  File,
  TimeEntry,
  CalendarEvent,
  EmailPreference,
  syncDatabase,
};

// const sequelize = require("../config/database");
// const User = require("./User");
// const Project = require("./Project");

// // Define relationships
// User.hasMany(Project, {
//   foreignKey: "managerId",
//   as: "managedProjects",
// });

// Project.belongsTo(User, {
//   foreignKey: "managerId",
//   as: "manager",
// });

// // Sync database (create tables)
// const syncDatabase = async () => {
//   try {
//     await sequelize.sync({ force: false });
//     console.log("✅ Database tables created successfully");
//   } catch (error) {
//     console.error("❌ Error creating tables:", error);
//   }
// };

// module.exports = {
//   User,
//   Project,
//   syncDatabase,
// };
