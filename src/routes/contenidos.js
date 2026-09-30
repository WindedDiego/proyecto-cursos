const express = require('express');
const router = express.Router({ mergeParams: true });
const ContenidoController = require('../controllers/ContenidoController');

router.get('/', ContenidoController.listarPorCurso);
router.get('/crear', ContenidoController.crearForm);
router.post('/crear', ContenidoController.crear);

module.exports = router;