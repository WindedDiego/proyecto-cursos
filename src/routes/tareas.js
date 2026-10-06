const express = require('express');
const router = express.Router({ mergeParams: true });
const tareaController = require('../controllers/TareaController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const courseAccessMiddleware = require('../middlewares/courseAccessMiddleware');

// Aplicar middlewares globales a todas las rutas de este archivo
router.use(authMiddleware, courseAccessMiddleware);

// 1. Listar ejercicios (Vista común para alumno y profesor)
router.get('/', tareaController.listarPorCurso);

// 2. Rutas para el ALUMNO
// Formulario para subir entrega
router.get('/enviar_entrega', roleMiddleware('alumno'), tareaController.enviarEntregaForm);
// Acción para procesar la subida
router.post('/enviar_entrega', roleMiddleware('alumno'), tareaController.enviarEntrega);

// 3. Rutas para el PROFESOR
// Formulario para crear un nuevo ejercicio
router.get('/crear', roleMiddleware('profesor'), tareaController.crearEjercicioForm);
// Acción para guardar el ejercicio
router.post('/crear', roleMiddleware('profesor'), tareaController.crearEjercicio);

// Gestión de entregas (Ver lista de alumnos y calificar)
router.get('/gestionar_entregas', roleMiddleware('profesor'), tareaController.gestionarEntregas);
// Acción de calificación
router.post('/gestionar_entregas', roleMiddleware('profesor'), tareaController.calificarEntrega);

module.exports = router;