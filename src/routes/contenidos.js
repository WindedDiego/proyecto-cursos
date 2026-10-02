const express = require('express');
const router = express.Router({ mergeParams: true });
const ContenidoController = require('../controllers/ContenidoController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const courseAccessMiddleware = require('../middlewares/courseAccessMiddleware');

router.use(authMiddleware, courseAccessMiddleware);
router.get('/', ContenidoController.listarPorCurso);
router.get('/crear', roleMiddleware(['profesor', 'administrador']), ContenidoController.crearForm);
router.post('/crear', roleMiddleware(['profesor', 'administrador']), ContenidoController.crear);
router.post('/:contenidoId/editar', roleMiddleware(['profesor', 'administrador']), ContenidoController.editar);

module.exports = router;