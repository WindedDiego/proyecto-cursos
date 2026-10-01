const express = require('express');
const router = express.Router();
const panelController = require('../controllers/PanelController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Panel de Profesor (Solo accesible por rol 'profesor')
router.get('/profesor', authMiddleware, roleMiddleware('profesor'), panelController.panelProfesor);

// Panel de Observador / Informes (Solo accesible por rol 'observador' o 'profesor')
router.get('/observador', authMiddleware, roleMiddleware(['observador', 'profesor']), panelController.panelObservador);

// Panel de Alumno (Solo accesible por rol 'alumno')
router.get('/alumno', authMiddleware, roleMiddleware('alumno'), panelController.panelAlumno);

module.exports = router;