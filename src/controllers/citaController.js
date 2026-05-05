const Cita = require('../models/Cita');
const Medico = require('../models/Medico');

// GET /api/citas  — admin ve todas; paciente ve las suyas
exports.listarCitas = async (req, res) => {
  try {
    const filtro =
      req.usuario.rol === 'admin' ? {} : { paciente: req.usuario._id };

    const citas = await Cita.find(filtro)
      .populate('paciente', 'nombre apellido email telefono')
      .populate('medico', 'nombre apellido especialidad')
      .sort({ fecha: 1 })
      .select('-__v');

    res.status(200).json({ ok: true, total: citas.length, citas });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al obtener citas.', error: error.message });
  }
};

// GET /api/citas/:id
exports.obtenerCita = async (req, res) => {
  try {
    const cita = await Cita.findById(req.params.id)
      .populate('paciente', 'nombre apellido email telefono')
      .populate('medico', 'nombre apellido especialidad');

    if (!cita) {
      return res.status(404).json({ ok: false, mensaje: 'Cita no encontrada.' });
    }

    // Paciente solo puede ver sus propias citas
    if (
      req.usuario.rol !== 'admin' &&
      cita.paciente._id.toString() !== req.usuario._id.toString()
    ) {
      return res.status(403).json({ ok: false, mensaje: 'No tienes acceso a esta cita.' });
    }

    res.status(200).json({ ok: true, cita });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al obtener cita.', error: error.message });
  }
};

// POST /api/citas  — paciente agenda una cita
exports.crearCita = async (req, res) => {
  try {
    const { medico, especialidad, fecha, hora, motivo } = req.body;

    // Verificar que el médico existe y está activo
    const medicoDoc = await Medico.findById(medico);
    if (!medicoDoc || !medicoDoc.activo) {
      return res.status(404).json({ ok: false, mensaje: 'Médico no encontrado o inactivo.' });
    }

    // Verificar que la especialidad coincide con el médico
    if (medicoDoc.especialidad !== especialidad) {
      return res.status(400).json({
        ok: false,
        mensaje: `Este médico pertenece a ${medicoDoc.especialidad}, no a ${especialidad}.`,
      });
    }

    // Verificar disponibilidad (sin duplicar hora/médico/fecha)
    const citaExistente = await Cita.findOne({
      medico,
      fecha: new Date(fecha),
      hora,
      estado: { $ne: 'cancelada' },
    });

    if (citaExistente) {
      return res.status(409).json({
        ok: false,
        mensaje: 'El médico ya tiene una cita en ese horario. Elige otra hora.',
      });
    }

    const cita = await Cita.create({
      paciente: req.usuario._id,
      medico,
      especialidad,
      fecha,
      hora,
      motivo,
    });

    await cita.populate('medico', 'nombre apellido especialidad');

    res.status(201).json({ ok: true, mensaje: 'Cita agendada exitosamente.', cita });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al crear cita.', error: error.message });
  }
};

// PUT /api/citas/:id/estado  — admin cambia estado
exports.actualizarEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    const estadosValidos = ['pendiente', 'confirmada', 'cancelada', 'completada'];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ ok: false, mensaje: 'Estado no válido.' });
    }

    const cita = await Cita.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    ).populate('paciente', 'nombre apellido email');

    if (!cita) {
      return res.status(404).json({ ok: false, mensaje: 'Cita no encontrada.' });
    }

    res.status(200).json({ ok: true, mensaje: `Cita marcada como ${estado}.`, cita });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al actualizar estado.', error: error.message });
  }
};

// DELETE /api/citas/:id  — paciente cancela su propia cita
exports.cancelarCita = async (req, res) => {
  try {
    const cita = await Cita.findById(req.params.id);

    if (!cita) {
      return res.status(404).json({ ok: false, mensaje: 'Cita no encontrada.' });
    }

    // Solo el paciente dueño o un admin pueden cancelar
    if (
      req.usuario.rol !== 'admin' &&
      cita.paciente.toString() !== req.usuario._id.toString()
    ) {
      return res.status(403).json({ ok: false, mensaje: 'No puedes cancelar esta cita.' });
    }

    cita.estado = 'cancelada';
    await cita.save();

    res.status(200).json({ ok: true, mensaje: 'Cita cancelada correctamente.' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al cancelar cita.', error: error.message });
  }
};

// GET /api/citas/disponibilidad  — ver horas disponibles de un médico en una fecha
exports.disponibilidad = async (req, res) => {
  try {
    const { medicoId, fecha } = req.query;

    if (!medicoId || !fecha) {
      return res.status(400).json({ ok: false, mensaje: 'Se requiere medicoId y fecha.' });
    }

    const citasOcupadas = await Cita.find({
      medico: medicoId,
      fecha: new Date(fecha),
      estado: { $ne: 'cancelada' },
    }).select('hora');

    const horasOcupadas = citasOcupadas.map((c) => c.hora);

    // Horario general de la clínica: 8am - 6pm, cada 30 min
    const horariosClínica = [];
    for (let h = 8; h < 18; h++) {
      horariosClínica.push(`${String(h).padStart(2, '0')}:00`);
      horariosClínica.push(`${String(h).padStart(2, '0')}:30`);
    }

    const disponibles = horariosClínica.filter((h) => !horasOcupadas.includes(h));

    res.status(200).json({ ok: true, fecha, horasDisponibles: disponibles, horasOcupadas });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al consultar disponibilidad.', error: error.message });
  }
};
