const mongoose = require('mongoose');

const horarioSchema = new mongoose.Schema({
  dia: {
    type: String,
    enum: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    required: true,
  },
  horaInicio: { type: String, required: true }, // "09:00"
  horaFin:    { type: String, required: true }, // "17:00"
});

const medicoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del médico es requerido'],
      trim: true,
    },
    apellido: {
      type: String,
      required: [true, 'El apellido del médico es requerido'],
      trim: true,
    },
    especialidad: {
      type: String,
      required: [true, 'La especialidad es requerida'],
      enum: [
        'Médico General',
        'Medicina Interna',
        'Psicología',
        'Podología',
        'Radiología',
      ],
    },
    cedula: {
      type: String,
      required: [true, 'La cédula profesional es requerida'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    telefono: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    foto: {
      type: String,
      default: '',
    },
    horarios: [horarioSchema],
    activo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medico', medicoSchema);
