const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Cita = sequelize.define(
  'Cita',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    pacienteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'paciente_id',
    },
    medicoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'medico_id',
    },
    especialidad: {
      type: DataTypes.ENUM(
        'Médico General',
        'Medicina Interna',
        'Psicología',
        'Podología',
        'Radiología'
      ),
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    hora: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    motivo: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'confirmada', 'cancelada', 'completada'),
      defaultValue: 'pendiente',
    },
    notas: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
  },
  {
    tableName: 'citas',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['medico_id', 'fecha', 'hora'],
      },
    ],
  }
);

module.exports = Cita;