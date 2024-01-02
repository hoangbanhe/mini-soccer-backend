const { Booking, User } = require("../database/sequelize");
const { getUserFromToken } = require("../middlewares/check-login.middleware");
const moment = require("moment");
const { Sequelize } = require("sequelize");
const { Op } = require("sequelize");

const check = async (req, res, next) => {
  try {
    const { bookDay, startTime, endTime, total_Price, sportFieldId } = req.body;
    // Kiểm tra đã có booking nào có start_time hoặc end_time giống trongDB không
    // nếu có thì tức là trong thời gian start_time hoặc end_time
    // đã có đơn đặt sân rồi

    // vì start_time và end_time mình lưu chuỗi nên so sánh như thế này
    const checkBookings = await Booking.findOne({
      where: {
        [Sequelize.Op.or]: [{ start_time: startTime }, { end_time: endTime }],
      },
    });
    if (checkBookings) {
      return res.json({
        code: 123,
        message: "Can not booking on this time",
        data: {
          checkBookings,
        },
      });
    }

    return res.json({
      message: "Booking time is ok",
    });
  } catch (error) {
    next(error);
  }
};
const createBooking = async (req, res, next) => {
  try {
    const { bookDay, startTime, endTime, total_Price, sportFieldId } = req.body;

    const currUser = await getUserFromToken(req, res, next);
    const newBooking = await Booking.create({
      bookDay,
      start_time: startTime,
      end_time: endTime,
      total_Price,
      UserId: currUser.id,
      sportFieldId,
      status: "paid",
    });
    return res.json({
      data: {
        newBooking,
      },
      message: "Create booking is success",
    });
  } catch (error) {
    next(error);
  }
};

const getAllBookingPagination = async (req, res, next) => {
  try {
    const { page, perPage } = req.query;
    const offset = (Number(page) - 1) * Number(perPage);
    const limit = +perPage;
    const allBookings = await Booking.findAndCountAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
        },
      ],
      offset,
      limit,
    });
    const { count } = allBookings;
    const totalPage = Math.ceil(count / perPage);
    res.json({
      data: {
        totalPage,
        page,
        perPage,
        total: count,
        allBookings: allBookings.rows,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const searchBooking = async (req, res, next) => {
  try {
    const search = req.query.search;
    console.log(
      "🚀 ~ file: booking.controller.js:96 ~ searchBooking ~ search:",
      search
    );
    const allBookings = await Booking.findAll({
      include: [
        {
          model: User,
          where: {
            fullName: {
              [Op.like]: `%${search}%`,
            },
            email: {
              [Op.like]: `%${search}%`,
            },
          },
        },
      ],
    });
    return res.json({
      data: {
        allBookings,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createBooking,
  getAllBookingPagination,
  check,
  searchBooking,
};
