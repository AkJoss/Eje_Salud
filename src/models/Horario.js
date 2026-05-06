const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Horario = sequelize.define(
  'Horario',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    medicoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'medico_id',
    },
    dia: {
      type: DataTypes.ENUM('lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'),
      allowNull: false,
    },
    horaInicio: {
      type: DataTypes.TIME,
      allowNull: false,
      field: 'hora_inicio',
    },
    horaFin: {
      type: DataTypes.TIME,
      allowNull: false,
      field: 'hora_fin',
    },
  },
  {
    tableName: 'horarios',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Horario;