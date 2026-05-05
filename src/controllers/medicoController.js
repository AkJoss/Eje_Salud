const Medico = require('../models/Medico');

// GET /api/medicos  — listar todos (con filtro opcional por especialidad)
exports.listarMedicos = async (req, res) => {
  try {
    const filtro = { activo: true };
    if (req.query.especialidad) {
      filtro.especialidad = req.query.especialidad;
    }

    const medicos = await Medico.find(filtro).select('-__v');
    res.status(200).json({ ok: true, total: medicos.length, medicos });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al obtener médicos.', error: error.message });
  }
};

// GET /api/medicos/:id
exports.obtenerMedico = async (req, res) => {
  try {
    const medico = await Medico.findById(req.params.id).select('-__v');
    if (!medico) {
      return res.status(404).json({ ok: false, mensaje: 'Médico no encontrado.' });
    }
    res.status(200).json({ ok: true, medico });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al obtener médico.', error: error.message });
  }
};

// POST /api/medicos  — solo admin
exports.crearMedico = async (req, res) => {
  try {
    const medico = await Medico.create(req.body);
    res.status(201).json({ ok: true, mensaje: 'Médico creado correctamente.', medico });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ ok: false, mensaje: 'La cédula o email ya están registrados.' });
    }
    res.status(500).json({ ok: false, mensaje: 'Error al crear médico.', error: error.message });
  }
};

// PUT /api/medicos/:id  — solo admin
exports.actualizarMedico = async (req, res) => {
  try {
    const medico = await Medico.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!medico) {
      return res.status(404).json({ ok: false, mensaje: 'Médico no encontrado.' });
    }
    res.status(200).json({ ok: true, mensaje: 'Médico actualizado.', medico });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al actualizar médico.', error: error.message });
  }
};

// DELETE /api/medicos/:id  — soft delete, solo admin
exports.desactivarMedico = async (req, res) => {
  try {
    const medico = await Medico.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );
    if (!medico) {
      return res.status(404).json({ ok: false, mensaje: 'Médico no encontrado.' });
    }
    res.status(200).json({ ok: true, mensaje: 'Médico desactivado correctamente.' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al desactivar médico.', error: error.message });
  }
};

// GET /api/medicos/especialidades
exports.listarEspecialidades = async (req, res) => {
  const especialidades = [
    'Médico General',
    'Medicina Interna',
    'Psicología',
    'Podología',
    'Radiología',
  ];
  res.status(200).json({ ok: true, especialidades });
};
