const mongoose = require('mongoose');

const citaSchema = new mongoose.Schema(
  {
    paciente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El paciente es requerido'],
    },
    medico: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medico',
      required: [true, 'El médico es requerido'],
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
    fecha: {
      type: Date,
      required: [true, 'La fecha es requerida'],
    },
    hora: {
      type: String,
      required: [true, 'La hora es requerida'], // "10:30"
    },
    motivo: {
      type: String,
      required: [true, 'El motivo de consulta es requerido'],
      maxlength: 500,
    },
    estado: {
      type: String,
      enum: ['pendiente', 'confirmada', 'cancelada', 'completada'],
      default: 'pendiente',
    },
    notas: {
      type: String, // Notas del médico post-consulta
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

// Índice para evitar doble cita del mismo médico a la misma hora
citaSchema.index({ medico: 1, fecha: 1, hora: 1 }, { unique: true });

module.exports = mongoose.model('Cita', citaSchema);
