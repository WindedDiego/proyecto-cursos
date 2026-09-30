const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {

  // Registro de usuario
  register: async (req, res) => {
    try {
      const { nombre, email, contraseña, rol } = req.body;

      // Verificar si el usuario ya existe
      const usuarioExistente = await Usuario.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).json({ mensaje: 'El email ya está registrado' });
      }

      // Encriptar contraseña
      const hash = await bcrypt.hash(contraseña, 10);

      // Crear usuario
      const nuevoUsuario = await Usuario.create({
        nombre,
        email,
        contraseña: hash,
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
      const { email, contraseña } = req.body;

      // Buscar usuario
      const usuario = await Usuario.findOne({ where: { email } });
      if (!usuario) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }

      // Comparar contraseña
      const coincide = await bcrypt.compare(contraseña, usuario.contraseña);
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
