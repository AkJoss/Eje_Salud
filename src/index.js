require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/database');

// Rutas
const authRoutes = require('./routes/auth');
const medicoRoutes = require('./routes/medicos');
const citaRoutes = require('./routes/citas');

const app = express();

// Conectar a base de datos
connectDB();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '../public')));

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/medicos', medicoRoutes);
app.use('/api/citas', citaRoutes);

// Ruta raíz — verificar que el servidor corre
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ ok: false, mensaje: `Ruta ${req.originalUrl} no encontrada.` });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ ok: false, mensaje: 'Error interno del servidor.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Eje Salud corriendo en http://localhost:${PORT}`);
});

module.exports = app;