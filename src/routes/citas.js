const express = require('express');
const router = express.Router();
const {
  listarCitas,
  obtenerCita,
  crearCita,
  actualizarEstado,
  cancelarCita,
  disponibilidad,
} = require('../controllers/citaController');
const { proteger, restringirA } = require('../middlewares/auth');

// Todas requieren estar autenticado
router.use(proteger);

router.get('/disponibilidad', disponibilidad);
router.get('/', listarCitas);
router.get('/:id', obtenerCita);
router.post('/', crearCita);
router.put('/:id/estado', restringirA('admin'), actualizarEstado);
router.delete('/:id', cancelarCita);

module.exports = router;
