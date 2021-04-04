'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserAction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  UserAction.init({
    id: DataTypes.UUID,
    action: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'UserAction',
  });
  return UserAction;
};