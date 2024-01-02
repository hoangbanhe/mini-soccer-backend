const express = require("express");
const {
  createPaymentUrlService,
  getPaymentDetail,
} = require("../controllers/payment.controller");
const paymentRouter = express.Router();

paymentRouter.route("/create-payment-url").post(createPaymentUrlService);
paymentRouter.route("/get-payment-detail").get(getPaymentDetail);

module.exports = {
  paymentRouter,
};
