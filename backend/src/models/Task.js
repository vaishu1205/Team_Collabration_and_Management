const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Task = sequelize.define("Task", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Projects", key: "id" },
  },
  assigneeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: "Users", key: "id" },
  },
  createdById: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Users", key: "id" },
  },
  status: {
    type: DataTypes.ENUM("todo", "in_progress", "completed", "blocked"),
    defaultValue: "todo",
  },
  priority: {
    type: DataTypes.ENUM("low", "medium", "high", "urgent"),
    defaultValue: "medium",
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  estimatedHours: {
    type: DataTypes.DECIMAL(5, 2), // FIXED: Changed from INTEGER to DECIMAL(5,2)
    allowNull: true,
  },
});

module.exports = Task;

// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/database");

// const Task = sequelize.define("Task", {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true,
//   },
//   title: {
//     type: DataTypes.STRING(300),
//     allowNull: false,
//   },
//   description: {
//     type: DataTypes.TEXT,
//     allowNull: true,
//   },
//   projectId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: "Projects",
//       key: "id",
//     },
//   },
//   assigneeId: {
//     type: DataTypes.INTEGER,
//     allowNull: true,
//     references: {
//       model: "Users",
//       key: "id",
//     },
//   },
//   createdById: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: "Users",
//       key: "id",
//     },
//   },
//   status: {
//     type: DataTypes.ENUM("todo", "in_progress", "completed", "blocked"),
//     defaultValue: "todo",
//   },
//   priority: {
//     type: DataTypes.ENUM("low", "medium", "high", "urgent"),
//     defaultValue: "medium",
//   },
//   dueDate: {
//     type: DataTypes.DATE,
//     allowNull: true,
//   },
//   estimatedHours: {
//     type: DataTypes.INTEGER,
//     allowNull: true,
//   },
// });

// module.exports = Task;
