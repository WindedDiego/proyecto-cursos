const express = require('express');
const router = express.Router({ mergeParams: true });
const foroController = require('../controllers/foroController');
const authMiddleware = require('../middlewares/authMiddleware');
const courseAccessMiddleware = require('../middlewares/courseAccessMiddleware');

router.use(authMiddleware, courseAccessMiddleware);

router.get('/', foroController.listar);
router.get('/crear', foroController.crearForm);
router.post('/', foroController.crear);
router.get('/:foroId', foroController.detalle);
router.post('/:foroId/mensajes', foroController.enviarMensaje);

module.exports = router;