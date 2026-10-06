const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/UsuarioController'); // O donde pongas la lógica
const authMiddleware = require('../middlewares/authMiddleware');

// Estas rutas SÍ permiten acceso a cualquier usuario logueado (alumno, profesor, etc.)
router.get('/perfil', authMiddleware, usuarioController.formPerfil);
router.post('/perfil', authMiddleware, usuarioController.actualizarPerfil);

module.exports = router;