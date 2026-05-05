/**
 * Seed de médicos para EjeSalud
 * Uso: node src/seedMedicos.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Medico   = require('./models/Medico');

const MEDICOS = [
  {
    nombre: 'Carlos',
    apellido: 'Medina',
    especialidad: 'Médico General',
    cedula: '1234567',
    email: 'c.medina@ejsalud.mx',
    telefono: '5550001001',
    bio: 'Médico general con 10 años de experiencia en atención primaria.',
    horarios: [
      { dia: 'lunes',     horaInicio: '09:00', horaFin: '17:00' },
      { dia: 'martes',    horaInicio: '09:00', horaFin: '17:00' },
      { dia: 'miércoles', horaInicio: '09:00', horaFin: '17:00' },
      { dia: 'jueves',    horaInicio: '09:00', horaFin: '17:00' },
      { dia: 'viernes',   horaInicio: '09:00', horaFin: '15:00' },
    ],
  },
  {
    nombre: 'Laura',
    apellido: 'Torres',
    especialidad: 'Medicina Interna',
    cedula: '2345678',
    email: 'l.torres@ejsalud.mx',
    telefono: '5550001002',
    bio: 'Especialista en medicina interna y enfermedades crónicas.',
    horarios: [
      { dia: 'lunes',     horaInicio: '08:00', horaFin: '16:00' },
      { dia: 'miércoles', horaInicio: '08:00', horaFin: '16:00' },
      { dia: 'viernes',   horaInicio: '08:00', horaFin: '14:00' },
    ],
  },
  {
    nombre: 'Ana',
    apellido: 'Reyes',
    especialidad: 'Psicología',
    cedula: '3456789',
    email: 'a.reyes@ejsalud.mx',
    telefono: '5550001003',
    bio: 'Psicóloga clínica con enfoque cognitivo-conductual.',
    horarios: [
      { dia: 'martes',    horaInicio: '10:00', horaFin: '18:00' },
      { dia: 'jueves',    horaInicio: '10:00', horaFin: '18:00' },
      { dia: 'sábado',    horaInicio: '09:00', horaFin: '13:00' },
    ],
  },
  {
    nombre: 'Roberto',
    apellido: 'Sánchez',
    especialidad: 'Radiología',
    cedula: '4567890',
    email: 'r.sanchez@ejsalud.mx',
    telefono: '5550001004',
    bio: 'Radiólogo con especialidad en diagnóstico por imagen.',
    horarios: [
      { dia: 'lunes',     horaInicio: '08:00', horaFin: '14:00' },
      { dia: 'miércoles', horaInicio: '08:00', horaFin: '14:00' },
      { dia: 'viernes',   horaInicio: '08:00', horaFin: '14:00' },
    ],
  },
  {
    nombre: 'María',
    apellido: 'López',
    especialidad: 'Podología',
    cedula: '5678901',
    email: 'm.lopez@ejsalud.mx',
    telefono: '5550001005',
    bio: 'Podóloga especializada en patologías del pie y tobillo.',
    horarios: [
      { dia: 'martes',    horaInicio: '09:00', horaFin: '17:00' },
      { dia: 'jueves',    horaInicio: '09:00', horaFin: '17:00' },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eje-salud');
    console.log('✅ MongoDB conectado');

    // Borrar médicos existentes para evitar duplicados
    await Medico.deleteMany({});
    console.log('🗑️  Médicos anteriores eliminados');

    const insertados = await Medico.insertMany(MEDICOS);
    console.log(`✅ ${insertados.length} médicos insertados:`);
    insertados.forEach(m => console.log(`   - Dr(a). ${m.nombre} ${m.apellido} | ${m.especialidad}`));

  } catch (err) {
    console.error('❌ Error en seed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado');
  }
}

seed();
