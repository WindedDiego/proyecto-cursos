const express = require('express');
const router = express.Router({ mergeParams: true }); // Mantiene el :id_curso en la ruta
const tareaController = require('../controllers/TareaController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Listar tareas del curso
router.get('/', authMiddleware, tareaController.listarPorCurso);

// Formulario para crear/subir tarea
router.get('/crear', authMiddleware, roleMiddleware('alumno'), tareaController.crearForm);

// Guardar tarea
router.post('/', authMiddleware, roleMiddleware('alumno'), tareaController.crear);

module.exports = router;