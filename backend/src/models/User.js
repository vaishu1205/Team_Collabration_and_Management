const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("member", "manager"),
    defaultValue: "member",
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = User;

// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/database");

// const User = sequelize.define("User", {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true,
//   },
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   email: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     unique: true,
//   },
//   password: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   role: {
//     type: DataTypes.ENUM("member", "manager"),
//     defaultValue: "member",
//   },
//   bio: {
//     type: DataTypes.TEXT,
//     allowNull: true,
//   },
//   jobTitle: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },
//   department: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },
//   location: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },
//   phone: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },
// });

// module.exports = User;

// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/database");

// const User = sequelize.define("User", {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true,
//   },
//   name: {
//     type: DataTypes.STRING(100),
//     allowNull: false,
//   },
//   email: {
//     type: DataTypes.STRING(255),
//     allowNull: false,
//     unique: true,
//     validate: {
//       isEmail: true,
//     },
//   },
//   password: {
//     type: DataTypes.STRING(255),
//     allowNull: false,
//   },
//   role: {
//     type: DataTypes.ENUM("manager", "member"),
//     defaultValue: "member",
//   },
//   isActive: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: true,
//   },
// });

// module.exports = User;
