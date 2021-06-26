'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Guild extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Guild.hasMany(models.Playlist, { onDelete: "cascade" });
      models.Guild.hasMany(models.UserAction, { onDelete: "cascade" });
      models.Guild.hasMany(models.Queue, { onDelete: "cascade" });
      models.Guild.hasOne(models.State, { onDelete: "cascade" });
    }
  };
  Guild.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    icon: DataTypes.STRING,
    ownerID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    prefix: DataTypes.STRING,
    auditChannel: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Guild',
  });
  return Guild;
};
