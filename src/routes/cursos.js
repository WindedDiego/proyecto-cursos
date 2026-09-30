const express = require('express');
const router = express.Router();
const CursoController = require('../controllers/cursoController');

router.get('/', CursoController.listar);
router.get('/crear', CursoController.crearForm);
router.post('/crear', CursoController.crear);
router.get('/:id', CursoController.detalle);
router.get('/:id/editar', CursoController.editarForm);
router.post('/:id/editar', CursoController.editar);
router.post('/:id/eliminar', CursoController.eliminar);

module.exports = router;
