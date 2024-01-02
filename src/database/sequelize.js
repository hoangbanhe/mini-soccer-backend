const { Sequelize, DataTypes } = require("sequelize");
const mysql = require("mysql2");
const { userModel } = require("../models/user.model");
const { otpModel } = require("../models/otp.model");
const { sportFieldModel } = require("../models/sportField.model");
const { bookingModel } = require("../models/booking.model");

const host = "localhost";
const port = 3306;
const user = "root";
const password = "123123";
const databaseName = "pitchDB";

const pool = mysql.createPool({ host, port, user, password });
pool.query(`CREATE DATABASE IF NOT EXITS ${databaseName}`);
const sequelize = new Sequelize(databaseName, user, password, {
  host,
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    raw: true,
  },
});
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully");
  })
  .catch((err) => {
    console.error("Unable to connect to the database");
  });

const User = userModel(sequelize, DataTypes);
const Otp = otpModel(sequelize, DataTypes);
const sportField = sportFieldModel(sequelize, DataTypes);
const Booking = bookingModel(sequelize, DataTypes);

User.hasOne(Otp);
User.hasMany(Booking);
Booking.belongsTo(User);
sportField.hasMany(Booking);
Booking.belongsTo(sportField);

sequelize.sync({
  // force: true,
});
module.exports = {
  sequelize,
  User,
  Otp,
  sportField,
  Booking,
};
