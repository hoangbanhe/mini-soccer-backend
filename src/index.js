const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { sequelize } = require("./database/sequelize");
const { userRouter } = require("./routers/user.route");
const { sportFieldRouter } = require("./routers/sportField.route");
const { paymentRouter } = require("./routers/payment.route");
const { bookingRouter } = require("./routers/booking.route");
const {
  loggerErrorMiddleware,
  errorResponseMiddleware,
} = require("./middlewares/handle-error.middleware");

const app = express();
const port = 3000;

const corOptions = {
  origin: ["http://localhost:3001", "http://localhost:3002"],
  // origin: "http://localhost:3002",
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors(corOptions));

app.use("/user", userRouter);
app.use("/admin", sportFieldRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/booking", bookingRouter);

app.use(loggerErrorMiddleware);
app.use(errorResponseMiddleware);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been establinshed successfully");
  })
  .catch((err) => {
    console.error("unable to connect to the database");
  });

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
