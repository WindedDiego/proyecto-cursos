const express = require('express');
const router = express.Router({ mergeParams: true }); // Mantiene el :id_curso en la ruta
const tareaController = require('../controllers/TareaController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const courseAccessMiddleware = require('../middlewares/courseAccessMiddleware');

router.use(authMiddleware, courseAccessMiddleware);

// Listar tareas del curso
router.get('/', tareaController.listarPorCurso);

// Formulario para crear/subir tarea
router.get('/crear', roleMiddleware('alumno'), tareaController.crearForm);

// Guardar tarea
router.post('/', roleMiddleware('alumno'), tareaController.crear);

module.exports = router;