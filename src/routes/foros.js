const express = require('express');
const router = express.Router({ mergeParams: true });
const foroController = require('../controllers/foroController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', foroController.listar);
router.get('/crear', foroController.crearForm);
router.post('/', authMiddleware, foroController.crear);
router.get('/:foroId', foroController.detalle);
router.post('/:foroId/mensajes', authMiddleware, foroController.enviarMensaje);

module.exports = router;