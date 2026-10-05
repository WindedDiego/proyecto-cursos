const express = require('express');
const router = express.Router({ mergeParams: true });
const ExamenController = require('../controllers/examenController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const courseAccessMiddleware = require('../middlewares/courseAccessMiddleware');

router.use(authMiddleware, courseAccessMiddleware);

// Listar exámenes del curso (la ruta base ya es /cursos/:id_curso/examenes)
router.get('/', ExamenController.listar);

// Crear examen
router.get('/crear', roleMiddleware(['profesor', 'administrador']), ExamenController.crearForm);
router.post('/crear', roleMiddleware(['profesor', 'administrador']), ExamenController.crear);

// Detalle del examen (el ID del examen es el parámetro :id)
router.get('/:id', ExamenController.detalle);

// Preguntas del examen
router.get('/:id/preguntas', roleMiddleware(['profesor', 'administrador']), ExamenController.agregarPreguntasForm);
router.post('/:id/preguntas', roleMiddleware(['profesor', 'administrador']), ExamenController.agregarPreguntas);

// Editar pregunta
router.get('/:id/preguntas/:preguntaId/editar', roleMiddleware(['profesor', 'administrador']), ExamenController.editarPreguntaForm);
router.post('/:id/preguntas/:preguntaId/editar', roleMiddleware(['profesor', 'administrador']), ExamenController.editarPregunta);

// Resolver examen
router.get('/:id/resolver', roleMiddleware('alumno'), ExamenController.resolverForm);
router.post('/:id/resolver', roleMiddleware('alumno'), ExamenController.resolver);

module.exports = router;