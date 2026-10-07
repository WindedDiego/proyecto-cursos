const express = require('express');
const router = express.Router();
const panelController = require('../controllers/PanelController');
const AdminController = require('../controllers/AdminController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Panel de Profesor (Solo accesible por rol 'profesor')
router.get('/profesor', authMiddleware, roleMiddleware(['profesor', 'administrador']), panelController.panelProfesor);

// Panel de Observador / Informes (Solo accesible por rol 'observador' o 'profesor')
router.get('/observador', authMiddleware, roleMiddleware(['observador', 'profesor', 'administrador']), panelController.panelObservador);

// Panel de Alumno (Solo accesible por rol 'alumno')
router.get('/alumno', authMiddleware, roleMiddleware('alumno'), panelController.panelAlumno);

router.get('/administrador', authMiddleware, roleMiddleware('administrador'), adminMiddleware, AdminController.panel);

module.exports = router;