const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const AdminController = require('../controllers/AdminController');

// Mostrar vistas
router.get('/login', (req, res) => {
  res.render('auth/login');
});

router.get('/register', (req, res) => {
  res.render('auth/register');
});

router.get('/admin_login', AdminController.adminSetupForm);

// Procesar formularios
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/admin_login', AdminController.createFirstAdmin);

module.exports = router;
