const express = require('express');
const router = express.Router();
const CursoController = require('../controllers/CursoController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.use(authMiddleware);
router.get('/', CursoController.listar);
router.get('/crear', roleMiddleware('profesor'), CursoController.crearForm);
router.post('/crear', roleMiddleware('profesor'), CursoController.crear);
router.get('/:id', CursoController.detalle);
router.get('/:id/editar', roleMiddleware('profesor'), CursoController.editarForm);
router.post('/:id/editar', roleMiddleware('profesor'), CursoController.editar);
router.post('/:id/eliminar', roleMiddleware('profesor'), CursoController.eliminar);

module.exports = router;
