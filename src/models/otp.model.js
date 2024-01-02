const otpModel = (sequelize, DataTypes) => {
  return sequelize.define(
    "Otp",
    {
      otpCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expiredAt: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );
};

module.exports = {
  otpModel,
};
