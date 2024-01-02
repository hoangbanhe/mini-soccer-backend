const sportFieldModel = (sequelize, DataTypes) => {
  return sequelize.define(
    "sportField",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
      },
      start_time: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      size: {
        type: DataTypes.INTEGER,
        allowNULL: false,
      },
      price_per_hour: {
        type: DataTypes.BIGINT(11),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "open",
      },
      spImages: {
        type: DataTypes.TEXT,
        allowNull: false,
        get() {
          return this.getDataValue("spImages").split(";");
        },
    }
    },
    {
      timestamps: true,
    }
  );
};

module.exports = {
  sportFieldModel,
};
