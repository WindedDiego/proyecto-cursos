const express = require('express');
const router = express.Router({ mergeParams: true });
const ExamenController = require('../controllers/examenController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.get('/', authMiddleware, ExamenController.listar);

router.get('/crear', authMiddleware, roleMiddleware('profesor'), ExamenController.crearForm);
router.post('/crear', authMiddleware, roleMiddleware('profesor'), ExamenController.crear);

router.get('/:id', authMiddleware, ExamenController.detalle);

router.get('/:id/preguntas', authMiddleware, roleMiddleware('profesor'), ExamenController.agregarPreguntasForm);
router.post('/:id/preguntas', authMiddleware, roleMiddleware('profesor'), ExamenController.agregarPreguntas);

router.get('/:id/preguntas/:preguntaId/editar', authMiddleware, roleMiddleware('profesor'), ExamenController.editarPreguntaForm);
router.post('/:id/preguntas/:preguntaId/editar', authMiddleware, roleMiddleware('profesor'), ExamenController.editarPregunta);

router.get('/:id/resolver', authMiddleware, roleMiddleware('alumno'), ExamenController.resolverForm);
router.post('/:id/resolver', authMiddleware, roleMiddleware('alumno'), ExamenController.resolver);

module.exports = router;