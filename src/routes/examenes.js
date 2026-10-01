const express = require('express');
const router = express.Router();
const ExamenController = require('../controllers/examenController');

router.get('/', ExamenController.listar);
router.get('/crear', ExamenController.crearForm);
router.post('/crear', ExamenController.crear);

router.get('/:id', ExamenController.detalle);

router.get('/:id/preguntas', ExamenController.agregarPreguntasForm);
router.post('/:id/preguntas', ExamenController.agregarPreguntas);

router.get('/:id/resolver', ExamenController.resolverForm);
router.post('/:id/resolver', ExamenController.resolver);

module.exports = router;
