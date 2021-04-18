'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class State extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.State.belongsTo(models.Guild);
      models.State.belongsTo(models.Song);
    }
  };
  State.init({
    volume: DataTypes.FLOAT,
    playing: DataTypes.BOOLEAN,
    shuffle: DataTypes.BOOLEAN,
    repeat: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'State',
  });
  return State;
};
