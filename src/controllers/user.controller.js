const bcrypt = require("bcrypt");
const { faker, ne } = require("@faker-js/faker");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const { transport } = require("../mail/mail.config");
const { User, Otp, sportField, Booking } = require("../database/sequelize");
require("dotenv").config();
const nodemailer = require("nodemailer");
const { getUserFromToken } = require("../middlewares/check-login.middleware");

const signUpAccService = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    const newUser = await User.create({
      fullName,
      email,
      password: hash,
    });
    const { password: anotherPassword, ...result } = newUser.get({
      plain: true,
    });
    return res.json({
      data: {
        result,
      },
      message: "Create user success",
    });
  } catch (error) {
    return next(error);
  }
};

const signInService = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const currUser = await User.findOne({
      where: {
        email: email,
      },
      raw: true,
    });

    if (!currUser) {
      throw Error("User with email not exist");
    }

    const isValidPassword = bcrypt.compareSync(password, currUser.password);

    if (!isValidPassword) {
      throw Error("Password is not match");
    }

    const accessToken = jwt.sign(
      {
        id: currUser.id,
        email: currUser.email,
      },
      "secret_key",
      { expiresIn: "30m" }
    );
    return res.json({
      accessToken,
      avatar: currUser.avatar,
      message: "Login Successfully",
    });
  } catch (error) {
    return next(error);
  }
};

const signInAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const currUser = await User.findOne({
      where: {
        email: email,
        role: "admin",
      },
      raw: true,
    });

    if (!currUser) {
      throw Error("User with email not exist");
    }

    const isValidPassword = bcrypt.compareSync(password, currUser.password);

    if (!isValidPassword) {
      throw Error("Password is not match");
    }

    const accessToken = jwt.sign(
      {
        id: currUser.id,
        email: currUser.email,
      },
      "secret_key",
      { expiresIn: "30m" }
    );
    return res.json({
      accessToken,
      avatar: currUser.avatar,
      message: "Login Successfully",
    });
  } catch (error) {
    return next(error);
  }
};

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const forgotPasswordService = async (req, res, next) => {
  try {
    const { email } = req.body;
    const forgotPasswordUser = await User.findOne({
      where: {
        email,
      },
      raw: true,
    });

    if (!forgotPasswordUser) {
      throw Error("This email is not existed on system");
    }

    const currentOTP = await Otp.findOne({
      where: {
        userId: forgotPasswordUser.id,
      },
      raw: true,
    });

    if (currentOTP) {
      await Otp.destroy({
        where: {
          id: currentOTP.id,
        },
      });
    }

    const otp = getRndInteger(1000, 9999);
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(otp.toString(), salt);

    const expiredAt = Date.now() + 120000;

    const newOtp = await Otp.create({
      otpCode: hash,
      expiredAt,
      UserId: forgotPasswordUser.id,
    });

    const info = await transport.sendMail({
      from: process.env.EMAIL_ADDRESS,
      to: email,
      subject: "OTP Code",
      html: `${otp}`,
    });
    return res.json({
      message: "Otp code is create successfully",
      EMAIL_URL: nodemailer.getTestMessageUrl(info),
    });
  } catch (error) {
    next(error);
  }
};

const resetPasswordService = async (req, res, next) => {
  try {
    const { otp, email } = req.body;

    const currUser = await User.findOne({
      where: {
        email,
      },
      raw: true,
    });

    if (!currUser) {
      throw Error("Account is not found with this email");
    }

    const currOtp = await Otp.findOne({
      where: {
        UserId: currUser.id,
      },
    });
    if (!currOtp) {
      throw Error("Something went wrong with OTP");
    }
    const { otpCode, expiredAt } = currOtp;
    if (expiredAt < Date.now()) {
      throw Error("Otp is expired");
    }
    const isValidOTP = bcrypt.compareSync(otp, otpCode);
    if (!isValidOTP) {
      throw Error("Otp is not valid");
    }
    await Otp.destroy({
      where: {
        id: currOtp.id,
      },
    });
    const { updatedPassword } = req.body;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(updatedPassword, salt);

    await User.update(
      {
        password: hash,
      },
      {
        where: {
          id: currUser.id,
        },
      }
    );

    return res.json({
      message: "Update password success",
    });
  } catch (error) {
    return next(error);
  }
};

const createRandomUser = () => {
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync("123123", salt);
  return {
    avatar: faker.image.avatar(),
    fullName: faker.person.firstName(),
    email: `${faker.finance.pin()}${faker.internet.email()}`,
    password: hash,
    role: "user",
    isVerified: 0,
  };
};

const fakeDataUser = async (req, res, next) => {
  try {
    for (let index = 0; index < 50; index++) {
      await User.create({
        ...createRandomUser(),
      });
    }
    return res.json({
      message: "fake user success",
    });
  } catch (error) {
    return next(error);
  }
};

const getUserProfileAPI = async (req, res, next) => {
  try {
    const isLoginUser = await getUserFromToken(req, res, next);
    if (!isLoginUser) {
      throw new Error("user not found");
    }
    const currUser = await User.findOne({
      where: {
        email: isLoginUser.email,
      },
      include: [
        {
          model: Booking,
        },
      ],
    });
    return res.json({
      data: {
        currUser,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getUserListAPI = async (req, res, next) => {
  try {
    const allUsers = await User.findAll({
      order: [["createdAt", "DESC"]],
      where: {
        role: "user",
      },
    });
    return res.json({
      data: {
        allUsers,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const pagination = async (req, res, next) => {
  try {
    const { page, perPage } = req.query;
    const offset = (Number(page) - 1) * Number(perPage);
    const limit = +perPage;
    const allUsers = await User.findAndCountAll({
      where: { role: "user" },
      offset,
      limit,
    });
    const { count } = allUsers;
    const totalPage = Math.ceil(count / perPage);
    return res.json({
      data: {
        totalPage,
        page,
        perPage,
        total: count,
        allUsers: allUsers.rows,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const deleteOneUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleteUser = await User.destroy({
      where: {
        id,
      },
    });
    return res.json({
      data: {
        deleteUser,
      },
      message: "Delete one user is success",
    });
  } catch (error) {
    return next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { fullName, email } = req.body;
    const { id } = req.params;
    const updatedUser = await User.update(
      {
        fullName,
        email,
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
        updatedUser,
      },
      message: "Update user success",
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  signUpAccService,
  signInService,
  signInAdmin,
  forgotPasswordService,
  resetPasswordService,
  fakeDataUser,
  getUserProfileAPI,
  getUserListAPI,
  pagination,
  deleteOneUser,
  updateUser,
};
