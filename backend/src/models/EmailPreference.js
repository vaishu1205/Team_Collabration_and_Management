const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const EmailPreference = sequelize.define("EmailPreference", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Users", key: "id" },
    unique: true,
  },
  taskAssignments: {
    type: DataTypes.ENUM("instant", "daily", "weekly", "off"),
    defaultValue: "instant",
  },
  deadlineReminders: {
    type: DataTypes.ENUM("instant", "daily", "weekly", "off"),
    defaultValue: "daily",
  },
  progressUpdates: {
    type: DataTypes.ENUM("instant", "daily", "weekly", "off"),
    defaultValue: "daily",
  },
  weeklyDigest: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  projectUpdates: {
    type: DataTypes.ENUM("instant", "daily", "weekly", "off"),
    defaultValue: "daily",
  },
  emailEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = EmailPreference;
