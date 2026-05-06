const { Medico, Horario } = require('../models');
const { sequelize } = require('../config/database');

// GET /api/medicos — listar todos con filtro opcional por especialidad
exports.listarMedicos = async (req, res) => {
  try {
    const filtro = { activo: true };

    if (req.query.especialidad) {
      filtro.especialidad = req.query.especialidad;
    }

    const medicos = await Medico.findAll({
      where: filtro,
      include: [
        {
          model: Horario,
          as: 'horarios',
        },
      ],
      order: [['id', 'ASC']],
    });

    res.status(200).json({
      ok: true,
      total: medicos.length,
      medicos,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener médicos.',
      error: error.message,
    });
  }
};

// GET /api/medicos/:id
exports.obtenerMedico = async (req, res) => {
  try {
    const medico = await Medico.findByPk(req.params.id, {
      include: [
        {
          model: Horario,
          as: 'horarios',
        },
      ],
    });

    if (!medico) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Médico no encontrado.',
      });
    }

    res.status(200).json({
      ok: true,
      medico,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener médico.',
      error: error.message,
    });
  }
};

// POST /api/medicos — solo admin
exports.crearMedico = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      nombre,
      apellido,
      especialidad,
      cedula,
      email,
      telefono,
      bio,
      foto,
      horarios,
    } = req.body;

    const medico = await Medico.create(
      {
        nombre,
        apellido,
        especialidad,
        cedula,
        email,
        telefono,
        bio,
        foto,
      },
      { transaction }
    );

    if (Array.isArray(horarios) && horarios.length > 0) {
      const horariosCrear = horarios.map((horario) => ({
        medicoId: medico.id,
        dia: horario.dia,
        horaInicio: horario.horaInicio,
        horaFin: horario.horaFin,
      }));

      await Horario.bulkCreate(horariosCrear, { transaction });
    }

    await transaction.commit();

    const medicoCompleto = await Medico.findByPk(medico.id, {
      include: [
        {
          model: Horario,
          as: 'horarios',
        },
      ],
    });

    res.status(201).json({
      ok: true,
      mensaje: 'Médico creado correctamente.',
      medico: medicoCompleto,
    });
  } catch (error) {
    await transaction.rollback();

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        ok: false,
        mensaje: 'La cédula o email ya están registrados.',
      });
    }

    res.status(500).json({
      ok: false,
      mensaje: 'Error al crear médico.',
      error: error.message,
    });
  }
};

// PUT /api/medicos/:id — solo admin
exports.actualizarMedico = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const medico = await Medico.findByPk(req.params.id);

    if (!medico) {
      await transaction.rollback();

      return res.status(404).json({
        ok: false,
        mensaje: 'Médico no encontrado.',
      });
    }

    const {
      nombre,
      apellido,
      especialidad,
      cedula,
      email,
      telefono,
      bio,
      foto,
      activo,
      horarios,
    } = req.body;

    await medico.update(
      {
        nombre,
        apellido,
        especialidad,
        cedula,
        email,
        telefono,
        bio,
        foto,
        activo,
      },
      { transaction }
    );

    if (Array.isArray(horarios)) {
      await Horario.destroy({
        where: { medicoId: medico.id },
        transaction,
      });

      if (horarios.length > 0) {
        const horariosCrear = horarios.map((horario) => ({
          medicoId: medico.id,
          dia: horario.dia,
          horaInicio: horario.horaInicio,
          horaFin: horario.horaFin,
        }));

        await Horario.bulkCreate(horariosCrear, { transaction });
      }
    }

    await transaction.commit();

    const medicoActualizado = await Medico.findByPk(medico.id, {
      include: [
        {
          model: Horario,
          as: 'horarios',
        },
      ],
    });

    res.status(200).json({
      ok: true,
      mensaje: 'Médico actualizado.',
      medico: medicoActualizado,
    });
  } catch (error) {
    await transaction.rollback();

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        ok: false,
        mensaje: 'La cédula o email ya están registrados.',
      });
    }

    res.status(500).json({
      ok: false,
      mensaje: 'Error al actualizar médico.',
      error: error.message,
    });
  }
};

// DELETE /api/medicos/:id — soft delete, solo admin
exports.desactivarMedico = async (req, res) => {
  try {
    const medico = await Medico.findByPk(req.params.id);

    if (!medico) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Médico no encontrado.',
      });
    }

    await medico.update({ activo: false });

    res.status(200).json({
      ok: true,
      mensaje: 'Médico desactivado correctamente.',
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al desactivar médico.',
      error: error.message,
    });
  }
};

// GET /api/medicos/especialidades
// GET /api/medicos/especialidades
exports.listarEspecialidades = async (req, res) => {
  try {
    const { Especialidad } = require('../models');

    const especialidades = await Especialidad.findAll({
      attributes: ['id', 'nombre'],
      order: [['nombre', 'ASC']],
    });

    res.status(200).json({
      ok: true,
      especialidades: especialidades.map((e) => e.nombre),
      data: especialidades,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener especialidades.',
      error: error.message,
    });
  }
};