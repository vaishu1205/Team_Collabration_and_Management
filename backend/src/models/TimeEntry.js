const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TimeEntry = sequelize.define("TimeEntry", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Users", key: "id" },
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Projects", key: "id" },
  },
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: "Tasks", key: "id" },
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  duration: {
    type: DataTypes.INTEGER, // Duration in minutes
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  entryType: {
    type: DataTypes.ENUM("timer", "manual"),
    defaultValue: "manual",
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // For active timers
  },
  hourlyRate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  billableAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  isBillable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  entryDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
});

module.exports = TimeEntry;
