require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { sequelize, connectDB } = require('./config/database');

// Cargar modelos y relaciones
require('./models');

// Rutas
const authRoutes = require('./routes/auth');
const medicoRoutes = require('./routes/medicos');
const citaRoutes = require('./routes/citas');

const app = express();

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
  res.status(404).json({
    ok: false,
    mensaje: `Ruta ${req.originalUrl} no encontrada.`,
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    ok: false,
    mensaje: 'Error interno del servidor.',
  });
});

const PORT = process.env.PORT || 5000;

const iniciarServidor = async () => {
  try {
    await connectDB();

    await sequelize.sync({ alter: true });
    console.log('Tablas sincronizadas correctamente');

    app.listen(PORT, () => {
      console.log(`Servidor Eje Salud corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

iniciarServidor();

module.exports = app;