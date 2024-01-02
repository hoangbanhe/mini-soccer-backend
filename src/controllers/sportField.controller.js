const { Op } = require("sequelize");
const { sportField, Booking } = require("../database/sequelize");
const moment = require("moment");

const createSportField = async (req, res, next) => {
  try {
    const {
      name,
      description,
      start_time,
      end_time,
      size,
      price_per_hour,
      spImages,
    } = req.body;
    const newSportField = await sportField.create({
      name,
      description,
      start_time,
      end_time,
      size,
      price_per_hour,
      spImages: spImages.join(";"),
    });
    return res.json({
      data: {
        newSportField,
      },
      message: "Create sport field success",
    });
  } catch (error) {
    return next(error);
  }
};
const getAll = async (req, res, next) => {
  try {
    const { size } = req.query;
    const { price_per_hour } = req.query;
    const whereCondition = size ? { size } : {};
    const orderCondition = price_per_hour
      ? JSON.parse(price_per_hour)
      : ["createdAt", "DESC"];

    const allSportFields = await sportField.findAll({
      where: whereCondition,
      order: [orderCondition],
    });
    res.json({
      data: { allSportFields },
      message: "Get all sportField success",
    });
  } catch (error) {
    return next(error);
  }
};
const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { bokingDay } = req.query;
    const beginOfDay = moment(bokingDay).startOf("day");
    const endOfDay = moment(bokingDay).endOf("day");

    const bookingCondition = bokingDay
      ? {
          bookDay: {
            [Op.lt]: endOfDay,
            [Op.gt]: beginOfDay,
          },
        }
      : {};

    let currSportField = await sportField.findOne({
      where: {
        id: id,
      },
      include: [
        {
          model: Booking,
          where: bookingCondition,
        },
      ],
    });
    if (!currSportField) {
      currSportField = await sportField.findOne({
        where: {
          id: id,
        },
        include: [
          {
            model: Booking,
            // where: bookingCondition,
          },
        ],
      });

      if (!currSportField) {
        throw Error("This sport field is not found");
      }
      return res.json({
        data: {
          currSportField,
          message: bokingDay
            ? `${moment(bokingDay).format(
                "DD/MM/YYYY, h:mm"
              )} không có đơn đặt sân`
            : "",
          status: "NOT_BOOKING",
        },
      });
    }
    return res.json({
      data: {
        currSportField,
      },
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const {
      name,
      description,
      start_time,
      end_time,
      spImages,
      size,
      price_per_hour,
      status,
    } = req.body;
    const { id } = req.params;
    const updateSportField = await sportField.update(
      {
        name,
        description,
        start_time,
        end_time,
        spImages: spImages.join(";"),
        size,
        price_per_hour,
        status,
      },
      {
        where: {
          id: id,
        },
        raw: true,
      }
    );
    return res.json({
      data: {
        updateSportField,
      },
      message: "Update sport field is success",
    });
  } catch (error) {
    return next(error);
  }
};

const search = async (req, res, next) => {
  try {
    const search = req.query.search;
    console.log(
      "🚀 ~ file: sportField.controller.js:114 ~ search ~ search:",
      search
    );
    const allSportFields = await sportField.findAll({
      where: {
        name: { [Op.like]: `%${search}%` },
      },
    });

    return res.json({
      data: {
        allSportFields,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const deleteOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleteSportField = await sportField.destroy({
      where: {
        id,
      },
    });
    return res.json({
      data: {
        deleteSportField,
      },
      message: "Delete one sport field is success",
    });
  } catch (error) {
    return next(error);
  }
};

const getAllPagination = async (req, res, next) => {
  try {
    const { page, perPage } = req.query;
    const offset = (Number(page) - 1) * Number(perPage);
    const limit = +perPage;

    const allSportFields = await sportField.findAndCountAll({
      where: whereCondition,
      order: [orderCondition],
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
        allSportFields: allSportFields.rows,
      },
      message: "Get all sportField success",
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createSportField,
  getAll,
  getOne,
  update,
  deleteOne,
  search,
  getAllPagination,
};
