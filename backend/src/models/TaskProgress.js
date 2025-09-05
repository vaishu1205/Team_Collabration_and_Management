const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TaskProgress = sequelize.define("TaskProgress", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Tasks", key: "id" },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Users", key: "id" },
  },
  progressPercent: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0, max: 100 },
  },
  hoursWorked: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
  },
  workCompleted: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  blockers: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  nextSteps: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true,
  },
});

module.exports = TaskProgress;
