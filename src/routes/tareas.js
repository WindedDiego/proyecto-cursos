const express = require('express');
const router = express.Router({ mergeParams: true });
const tareaController = require('../controllers/TareaController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const courseAccessMiddleware = require('../middlewares/courseAccessMiddleware');
const { subirEntrega, subirAdjuntoTarea } = require('../middlewares/uploadMiddleware');

// Aplicar middlewares globales a todas las rutas de este archivo
router.use(authMiddleware, courseAccessMiddleware);

// 1. Listar ejercicios (Vista común para alumno y profesor)
router.get('/', tareaController.listarPorCurso);

// 2. Rutas para el ALUMNO
// Formulario para subir entrega
router.get('/enviar_entrega/:id_ejercicio', roleMiddleware('alumno'), tareaController.enviarEntregaForm);
// Acción para procesar la subida
router.post('/enviar_entrega/:id_ejercicio', roleMiddleware('alumno'), subirEntrega, tareaController.enviarEntrega);

// 3. Rutas para el PROFESOR
// Formulario para crear un nuevo ejercicio
router.get('/crear', roleMiddleware('profesor', 'administrador'), tareaController.crearEjercicioForm);
// Acción para guardar el ejercicio
router.post('/crear', roleMiddleware('profesor', 'administrador'), subirAdjuntoTarea, tareaController.crearEjercicio);

// Gestión de entregas (Ver lista de alumnos y calificar)
router.get('/gestionar_entregas/:id_ejercicio', roleMiddleware('profesor'), tareaController.gestionarEntregas);
// Acción de calificación (nota + comentario) de una entrega concreta
router.post('/gestionar_entregas/:id_ejercicio/:id_entrega', roleMiddleware('profesor'), tareaController.calificarEntrega);

module.exports = router;