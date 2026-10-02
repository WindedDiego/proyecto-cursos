const express = require('express');
const router = express.Router();
const CursoController = require('../controllers/CursoController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const courseAccessMiddleware = require('../middlewares/courseAccessMiddleware');

router.use(authMiddleware);
router.get('/', CursoController.listar);
router.get('/crear', roleMiddleware(['profesor', 'administrador']), CursoController.crearForm);
router.post('/crear', roleMiddleware(['profesor', 'administrador']), CursoController.crear);
router.get('/:id', courseAccessMiddleware, CursoController.detalle);
router.get('/:id/editar', roleMiddleware(['profesor', 'administrador']), courseAccessMiddleware, CursoController.editarForm);
router.post('/:id/editar', roleMiddleware(['profesor', 'administrador']), courseAccessMiddleware, CursoController.editar);
router.post('/:id/eliminar', roleMiddleware(['profesor', 'administrador']), courseAccessMiddleware, CursoController.eliminar);

module.exports = router;
