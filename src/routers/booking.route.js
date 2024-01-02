const express = require("express");
const {
  getAllBookingPagination,
  check,
  searchBooking,
  createBooking,
} = require("../controllers/booking.controller");
const {
  checkLoginMiddleware,
} = require("../middlewares/check-login.middleware");

const bookingRouter = express.Router();

bookingRouter
  .route("/create-booking")
  .post([checkLoginMiddleware], createBooking);
bookingRouter.route("/get-all-booking").get(getAllBookingPagination);
bookingRouter.route("/check").post([checkLoginMiddleware], check);
bookingRouter.route("/search").get(searchBooking);

module.exports = {
  bookingRouter,
};
