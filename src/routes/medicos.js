const express = require('express');
const router = express.Router();
const {
  listarMedicos,
  obtenerMedico,
  crearMedico,
  actualizarMedico,
  desactivarMedico,
  listarEspecialidades,
} = require('../controllers/medicoController');
const { proteger, restringirA } = require('../middlewares/auth');

// Públicas
router.get('/especialidades', listarEspecialidades);
router.get('/', listarMedicos);
router.get('/:id', obtenerMedico);

// Solo admin
router.post('/', proteger, restringirA('admin'), crearMedico);
router.put('/:id', proteger, restringirA('admin'), actualizarMedico);
router.delete('/:id', proteger, restringirA('admin'), desactivarMedico);

module.exports = router;
