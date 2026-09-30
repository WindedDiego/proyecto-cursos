const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {

  // Registro de usuario
  register: async (req, res) => {
    try {
      // Recogemos la contraseña tal como viene del formulario (con o sin ñ)
      const nombre = req.body.nombre;
      const email = req.body.email;
      const passwordPlain = req.body.contraseña || req.body.contrasena;
      const rol = req.body.rol;

      if (!passwordPlain) {
        return res.status(400).json({ mensaje: 'La contraseña es obligatoria' });
      }

      // Verificar si el usuario ya existe
      const usuarioExistente = await Usuario.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).json({ mensaje: 'El email ya está registrado' });
      }

      // Encriptar contraseña
      const hash = await bcrypt.hash(passwordPlain, 10);

      // Crear usuario (guardando en la columna 'contrasena' de la BD)
      const nuevoUsuario = await Usuario.create({
        nombre,
        email,
        contrasena: hash,
        rol
      });

      return res.status(201).json({
        mensaje: 'Usuario registrado correctamente',
        usuario: {
          id: nuevoUsuario.id,
          nombre: nuevoUsuario.nombre,
          email: nuevoUsuario.email,
          rol: nuevoUsuario.rol
        }
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ mensaje: 'Error en el registro' });
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
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }

      // Comparar contraseña
      const coincide = await bcrypt.compare(passwordPlain, usuario.contrasena);
      if (!coincide) {
        return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
      }

      // Crear token JWT
      const token = jwt.sign(
        {
          id: usuario.id,
          rol: usuario.rol,
          email: usuario.email
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        mensaje: 'Login correcto',
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol
        }
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ mensaje: 'Error en el login' });
    }
  }
};