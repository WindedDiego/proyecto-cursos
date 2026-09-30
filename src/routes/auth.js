const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

// Mostrar vistas
router.get('/login', (req, res) => {
  res.render('auth/login');
});

router.get('/register', (req, res) => {
  res.render('auth/register');
});

// Procesar formularios
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

module.exports = router;
