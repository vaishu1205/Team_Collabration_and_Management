const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CalendarEvent = sequelize.define("CalendarEvent", {
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
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  eventType: {
    type: DataTypes.ENUM("task", "deadline", "meeting", "milestone"),
    defaultValue: "task",
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Users", key: "id" },
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: "Projects", key: "id" },
  },
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: "Tasks", key: "id" },
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: "#3B82F6",
  },
  isAllDay: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  reminder: {
    type: DataTypes.INTEGER, // Minutes before event
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("scheduled", "completed", "cancelled", "overdue"),
    defaultValue: "scheduled",
  },
});

module.exports = CalendarEvent;
