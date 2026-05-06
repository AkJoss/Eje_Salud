const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Especialidad = sequelize.define(
  'Especialidad',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: 'especialidades',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Especialidad;