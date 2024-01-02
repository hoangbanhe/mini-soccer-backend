const express = require("express");
const {
  createSportField,
  getAll,
  getOne,
  update,
  deleteOne,
  search,
  getAllPagination,
} = require("../controllers/sportField.controller");

const sportFieldRouter = express.Router();

sportFieldRouter.route("/create").post(createSportField);
sportFieldRouter.route("/").get(getAll);
sportFieldRouter.route("/sport-field/search").get(search);
sportFieldRouter.route("/:id").get(getOne);
sportFieldRouter.route("/:id").put(update);
sportFieldRouter.route("/:id").delete(deleteOne);
sportFieldRouter.route("/pagination").get(getAllPagination);

module.exports = {
  sportFieldRouter,
};
