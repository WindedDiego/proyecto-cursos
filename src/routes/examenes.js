const express = require('express');
const router = express.Router({ mergeParams: true }); // Mantiene el :id_curso
const ExamenController = require('../controllers/examenController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Listar exámenes del curso (todos pueden verlos)
router.get('/', authMiddleware, ExamenController.listar);

// Crear exámenes (SOLO PROFESOR)
router.get('/crear', authMiddleware, roleMiddleware('profesor'), ExamenController.crearForm);
router.post('/crear', authMiddleware, roleMiddleware('profesor'), ExamenController.crear);

// Ver detalle del examen
router.get('/:id', authMiddleware, ExamenController.detalle);

// Agregar preguntas (SOLO PROFESOR)
router.get('/:id/preguntas', authMiddleware, roleMiddleware('profesor'), ExamenController.agregarPreguntasForm);
router.post('/:id/preguntas', authMiddleware, roleMiddleware('profesor'), ExamenController.agregarPreguntas);

// Resolver examen
router.get('/:id/resolver', authMiddleware, ExamenController.resolverForm);
router.post('/:id/resolver', authMiddleware, ExamenController.resolver);

module.exports = router;