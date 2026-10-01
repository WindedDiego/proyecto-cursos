const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {

  // Registro de usuario
  register: async (req, res) => {
    try {
      const nombre = req.body.nombre;
      const email = req.body.email;
      const passwordPlain = req.body.contraseña || req.body.contrasena;
      const rol = req.body.rol;

      if (!passwordPlain) {
        return res.status(400).send('La contraseña es obligatoria');
      }

      // Verificar si el usuario ya existe
      const usuarioExistente = await Usuario.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).send('El email ya está registrado');
      }

      // Encriptar contraseña
      const hash = await bcrypt.hash(passwordPlain, 10);

      // Crear usuario
      await Usuario.create({
        nombre,
        email,
        contrasena: hash,
        rol
      });

      return res.redirect('/auth/login');

    } catch (error) {
      console.error(error);
      return res.status(500).send('Error en el registro');
    }
  },

  // Login de usuario
  login: async (req, res) => {
    try {
      const email = req.body.email;
      const passwordPlain = req.body.contraseña || req.body.contrasena;

      // Buscar usuario
      const usuario = await Usuario.findOne({ where: { email } });
      if (!usuario) {
        return res.status(404).send('Usuario no encontrado');
      }

      // Comparar contraseña
      const coincide = await bcrypt.compare(passwordPlain, usuario.contrasena);
      if (!coincide) {
        return res.status(401).send('Contraseña incorrecta');
      }

      // Redirigir al inicio de la aplicación web (listado de cursos)
      return res.redirect('/cursos');

    } catch (error) {
      console.error(error);
      return res.status(500).send('Error en el login');
    }
  }
};