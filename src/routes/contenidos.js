const express = require('express');
const router = express.Router({ mergeParams: true });
const ContenidoController = require('../controllers/ContenidoController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.get('/', authMiddleware, ContenidoController.listarPorCurso);
router.get('/crear', authMiddleware, roleMiddleware('profesor'), ContenidoController.crearForm);
router.post('/crear', authMiddleware, roleMiddleware('profesor'), ContenidoController.crear);

module.exports = router;