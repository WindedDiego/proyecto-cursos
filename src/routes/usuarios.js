const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.use(authMiddleware, roleMiddleware('administrador'), adminMiddleware);

router.post('/', AdminController.crearUsuario);
router.post('/cursos/:cursoId/profesor', AdminController.asignarProfesor);
router.post('/:id/eliminar', AdminController.eliminarUsuario);
router.post('/:id', AdminController.actualizarUsuario);

module.exports = router;