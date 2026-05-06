const User = require('./User');
const Medico = require('./Medico');
const Cita = require('./Cita');
const Horario = require('./Horario');
const Especialidad = require('./Especialidad');

User.hasMany(Cita, {
  foreignKey: 'pacienteId',
  as: 'citas',
});

Cita.belongsTo(User, {
  foreignKey: 'pacienteId',
  as: 'paciente',
});

Medico.hasMany(Cita, {
  foreignKey: 'medicoId',
  as: 'citas',
});

Cita.belongsTo(Medico, {
  foreignKey: 'medicoId',
  as: 'medico',
});

Medico.hasMany(Horario, {
  foreignKey: 'medicoId',
  as: 'horarios',
});

Horario.belongsTo(Medico, {
  foreignKey: 'medicoId',
  as: 'medico',
});

module.exports = {
  User,
  Medico,
  Cita,
  Horario,
  Especialidad,
};