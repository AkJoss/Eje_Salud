const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verificar token JWT
exports.proteger = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        ok: false,
        mensaje: 'No tienes acceso. Por favor inicia sesión.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await User.findByPk(decoded.id);

    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        ok: false,
        mensaje: 'El usuario ya no existe o fue desactivado.',
      });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      mensaje: 'Token inválido.',
    });
  }
};

// Restringir a roles específicos
exports.restringirA = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        ok: false,
        mensaje: 'No tienes permiso para realizar esta acción.',
      });
    }

    next();
  };
};
