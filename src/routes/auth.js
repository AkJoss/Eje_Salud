const express = require('express');
const router = express.Router();
const { registro, login, perfil } = require('../controllers/authController');
const { proteger } = require('../middlewares/auth');

router.post('/registro', registro);
router.post('/login', login);
router.get('/perfil', proteger, perfil);

module.exports = router;
