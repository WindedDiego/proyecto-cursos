const express = require('express');
const router = express.Router({ mergeParams: true });
const ExamenController = require('../controllers/examenController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const courseAccessMiddleware = require('../middlewares/courseAccessMiddleware');

router.use(authMiddleware, courseAccessMiddleware);

router.get('/', ExamenController.listar);

router.get('/crear', roleMiddleware(['profesor', 'administrador']), ExamenController.crearForm);
router.post('/crear', roleMiddleware(['profesor', 'administrador']), ExamenController.crear);

router.get('/:id', ExamenController.detalle);

router.get('/:id/preguntas', roleMiddleware(['profesor', 'administrador']), ExamenController.agregarPreguntasForm);
router.post('/:id/preguntas', roleMiddleware(['profesor', 'administrador']), ExamenController.agregarPreguntas);

router.get('/:id/preguntas/:preguntaId/editar', roleMiddleware(['profesor', 'administrador']), ExamenController.editarPreguntaForm);
router.post('/:id/preguntas/:preguntaId/editar', roleMiddleware(['profesor', 'administrador']), ExamenController.editarPregunta);

router.get('/:id/resolver', roleMiddleware('alumno'), ExamenController.resolverForm);
router.post('/:id/resolver', roleMiddleware('alumno'), ExamenController.resolver);

module.exports = router;