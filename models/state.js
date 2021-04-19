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
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    volume: {
      type: DataTypes.FLOAT,
      defaultValue: 1
    },
    playing: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    lastNotQueue: DataTypes.UUID,
    shuffle: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    repeat: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'State',
  });
  return State;
};
