const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generar JWT
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// POST /api/auth/registro
exports.registro = async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, fechaNacimiento, password } = req.body;

    const existeUsuario = await User.findOne({ email });
    if (existeUsuario) {
      return res.status(400).json({ ok: false, mensaje: 'Este email ya está registrado.' });
    }

    const usuario = await User.create({
      nombre,
      apellido,
      email,
      telefono,
      fechaNacimiento,
      password,
    });

    const token = generarToken(usuario._id);

    res.status(201).json({
      ok: true,
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al registrar usuario.', error: error.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, mensaje: 'Email y contraseña son requeridos.' });
    }

    const usuario = await User.findOne({ email }).select('+password');
    if (!usuario || !(await usuario.compararPassword(password))) {
      return res.status(401).json({ ok: false, mensaje: 'Email o contraseña incorrectos.' });
    }

    if (!usuario.activo) {
      return res.status(401).json({ ok: false, mensaje: 'Tu cuenta ha sido desactivada.' });
    }

    const token = generarToken(usuario._id);

    res.status(200).json({
      ok: true,
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al iniciar sesión.', error: error.message });
  }
};

// GET /api/auth/perfil
exports.perfil = async (req, res) => {
  res.status(200).json({
    ok: true,
    usuario: {
      id: req.usuario._id,
      nombre: req.usuario.nombre,
      apellido: req.usuario.apellido,
      email: req.usuario.email,
      telefono: req.usuario.telefono,
      rol: req.usuario.rol,
    },
  });
};
