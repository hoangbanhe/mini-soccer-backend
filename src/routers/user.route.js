const express = require("express");
const {
  fakeDataUser,
  signInService,
  signUpAccService,
  forgotPasswordService,
  resetPasswordService,
  getUserProfileAPI,
  signInAdmin,
  getUserListAPI,
  pagination,
  deleteOneUser,
  updateUser,
} = require("../controllers/user.controller");
const {
  checkLoginMiddleware,
} = require("../middlewares/check-login.middleware");

const userRouter = express.Router();

userRouter.route("/sign-up").post(signUpAccService);
userRouter.route("/sign-in").post(signInService);
userRouter.route("/sign-in-admin").post(signInAdmin);
userRouter.route("/forgot-password").post(forgotPasswordService);
userRouter.route("/reset-password").post(resetPasswordService);
userRouter.route("/fake-data-user").get(fakeDataUser);
userRouter.route("/get-profile").get([checkLoginMiddleware], getUserProfileAPI);
userRouter.route("/users-list").get(getUserListAPI);
userRouter.route("/pagination").get([checkLoginMiddleware], pagination);
userRouter.route("/:id").delete(deleteOneUser);
userRouter.route("/:id").put(updateUser);

module.exports = {
  userRouter,
};
