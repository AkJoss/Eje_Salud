const { Op } = require('sequelize');
const { Cita, Medico, User } = require('../models');

// GET /api/citas — admin ve todas; paciente ve las suyas; médico ve las suyas
exports.listarCitas = async (req, res) => {
  try {
    let filtro = {};

    if (req.usuario.rol === 'paciente') {
      filtro = { pacienteId: req.usuario.id };
    } else if (req.usuario.rol === 'medico') {
      // Buscar el médico vinculado por email
      const medicoDoc = await Medico.findOne({
        where: { email: req.usuario.email },
      });

      if (!medicoDoc) {
        return res.status(200).json({
          ok: true,
          total: 0,
          citas: [],
        });
      }

      filtro = { medicoId: medicoDoc.id };
    }

    // admin → filtro = {} y ve todas
    const citas = await Cita.findAll({
      where: filtro,
      include: [
        {
          model: User,
          as: 'paciente',
          attributes: ['id', 'nombre', 'apellido', 'email', 'telefono'],
        },
        {
          model: Medico,
          as: 'medico',
          attributes: ['id', 'nombre', 'apellido', 'especialidad'],
        },
      ],
      order: [['fecha', 'ASC'], ['hora', 'ASC']],
    });

    res.status(200).json({
      ok: true,
      total: citas.length,
      citas,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener citas.',
      error: error.message,
    });
  }
};

// GET /api/citas/:id
exports.obtenerCita = async (req, res) => {
  try {
    const cita = await Cita.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'paciente',
          attributes: ['id', 'nombre', 'apellido', 'email', 'telefono'],
        },
        {
          model: Medico,
          as: 'medico',
          attributes: ['id', 'nombre', 'apellido', 'especialidad'],
        },
      ],
    });

    if (!cita) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Cita no encontrada.',
      });
    }

    // Paciente solo puede ver sus propias citas
    if (
      req.usuario.rol === 'paciente' &&
      cita.pacienteId !== req.usuario.id
    ) {
      return res.status(403).json({
        ok: false,
        mensaje: 'No tienes acceso a esta cita.',
      });
    }

    // Médico solo puede ver sus propias citas
    if (req.usuario.rol === 'medico') {
      const medicoDoc = await Medico.findOne({
        where: { email: req.usuario.email },
      });

      if (!medicoDoc || cita.medicoId !== medicoDoc.id) {
        return res.status(403).json({
          ok: false,
          mensaje: 'No tienes acceso a esta cita.',
        });
      }
    }

    res.status(200).json({
      ok: true,
      cita,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener cita.',
      error: error.message,
    });
  }
};

// POST /api/citas — paciente agenda una cita
exports.crearCita = async (req, res) => {
  try {
    const { medico, medicoId, especialidad, fecha, hora, motivo } = req.body;

    // Acepta medico o medicoId para no romper el frontend
    const idMedico = medicoId || medico;

    if (!idMedico) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El médico es requerido.',
      });
    }

    // Verificar que el médico existe y está activo
    const medicoDoc = await Medico.findByPk(idMedico);

    if (!medicoDoc || !medicoDoc.activo) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Médico no encontrado o inactivo.',
      });
    }

    // Verificar que la especialidad coincide con el médico
    if (medicoDoc.especialidad !== especialidad) {
      return res.status(400).json({
        ok: false,
        mensaje: `Este médico pertenece a ${medicoDoc.especialidad}, no a ${especialidad}.`,
      });
    }

    // Verificar disponibilidad sin duplicar médico/fecha/hora
    const citaExistente = await Cita.findOne({
      where: {
        medicoId: idMedico,
        fecha,
        hora,
        estado: {
          [Op.ne]: 'cancelada',
        },
      },
    });

    if (citaExistente) {
      return res.status(409).json({
        ok: false,
        mensaje: 'El médico ya tiene una cita en ese horario. Elige otra hora.',
      });
    }

    const cita = await Cita.create({
      pacienteId: req.usuario.id,
      medicoId: idMedico,
      especialidad,
      fecha,
      hora,
      motivo,
    });

    const citaCompleta = await Cita.findByPk(cita.id, {
      include: [
        {
          model: User,
          as: 'paciente',
          attributes: ['id', 'nombre', 'apellido', 'email', 'telefono'],
        },
        {
          model: Medico,
          as: 'medico',
          attributes: ['id', 'nombre', 'apellido', 'especialidad'],
        },
      ],
    });

    res.status(201).json({
      ok: true,
      mensaje: 'Cita agendada exitosamente.',
      cita: citaCompleta,
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        ok: false,
        mensaje: 'El médico ya tiene una cita en ese horario. Elige otra hora.',
      });
    }

    res.status(500).json({
      ok: false,
      mensaje: 'Error al crear cita.',
      error: error.message,
    });
  }
};

// PUT /api/citas/:id/estado — admin cambia estado
exports.actualizarEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    const estadosValidos = ['pendiente', 'confirmada', 'cancelada', 'completada'];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Estado no válido.',
      });
    }

    const cita = await Cita.findByPk(req.params.id);

    if (!cita) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Cita no encontrada.',
      });
    }

    await cita.update({ estado });

    const citaActualizada = await Cita.findByPk(cita.id, {
      include: [
        {
          model: User,
          as: 'paciente',
          attributes: ['id', 'nombre', 'apellido', 'email'],
        },
        {
          model: Medico,
          as: 'medico',
          attributes: ['id', 'nombre', 'apellido', 'especialidad'],
        },
      ],
    });

    res.status(200).json({
      ok: true,
      mensaje: `Cita marcada como ${estado}.`,
      cita: citaActualizada,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al actualizar estado.',
      error: error.message,
    });
  }
};

// DELETE /api/citas/:id — paciente cancela su propia cita
exports.cancelarCita = async (req, res) => {
  try {
    const cita = await Cita.findByPk(req.params.id);

    if (!cita) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Cita no encontrada.',
      });
    }

    // Solo el paciente dueño o un admin pueden cancelar
    if (
      req.usuario.rol !== 'admin' &&
      cita.pacienteId !== req.usuario.id
    ) {
      return res.status(403).json({
        ok: false,
        mensaje: 'No puedes cancelar esta cita.',
      });
    }

    await cita.update({ estado: 'cancelada' });

    res.status(200).json({
      ok: true,
      mensaje: 'Cita cancelada correctamente.',
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al cancelar cita.',
      error: error.message,
    });
  }
};

// GET /api/citas/disponibilidad — ver horas disponibles de un médico en una fecha
exports.disponibilidad = async (req, res) => {
  try {
    const { medicoId, fecha } = req.query;

    if (!medicoId || !fecha) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Se requiere medicoId y fecha.',
      });
    }

    const citasOcupadas = await Cita.findAll({
      where: {
        medicoId,
        fecha,
        estado: {
          [Op.ne]: 'cancelada',
        },
      },
      attributes: ['hora'],
    });

    const horasOcupadas = citasOcupadas.map((c) => {
      // MySQL puede devolver TIME como "10:30:00"; lo convertimos a "10:30"
      return String(c.hora).slice(0, 5);
    });

    // Horario general de la clínica: 8am - 6pm, cada 30 min
    const horariosClinica = [];

    for (let h = 8; h < 18; h++) {
      horariosClinica.push(`${String(h).padStart(2, '0')}:00`);
      horariosClinica.push(`${String(h).padStart(2, '0')}:30`);
    }

    const disponibles = horariosClinica.filter(
      (h) => !horasOcupadas.includes(h)
    );

    res.status(200).json({
      ok: true,
      fecha,
      horasDisponibles: disponibles,
      horasOcupadas,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al consultar disponibilidad.',
      error: error.message,
    });
  }
};
