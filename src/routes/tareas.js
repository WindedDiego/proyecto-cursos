const express = require('express');
const router = express.Router({ mergeParams: true }); // Mantiene el :id_curso en la ruta
const tareaController = require('../controllers/TareaController');

// Listar tareas del curso
router.get('/', tareaController.listarPorCurso);

// Formulario para crear/subir tarea
router.get('/crear', tareaController.crearForm);

// Guardar tarea
router.post('/', tareaController.crear);

module.exports = router;