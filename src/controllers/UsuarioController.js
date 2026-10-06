const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');

module.exports = {
  // Mostrar formulario de perfil
  formPerfil: async (req, res) => {
    try {
      const usuario = await Usuario.findByPk(req.usuario.id);
      res.render('usuarios/perfil', { usuario, error: null, exito: null });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al cargar el perfil');
    }
  },

  // Actualizar los datos del perfil
  actualizarPerfil: async (req, res) => {
    try {
      const { nombre, email, contrasena } = req.body;
      const usuario = await Usuario.findByPk(req.usuario.id);

      if (!usuario) {
        return res.status(404).send('Usuario no encontrado');
      }

      usuario.nombre = nombre;
      usuario.email = email;

      // Si el usuario rellenó el campo de contraseña, la hasheamos y la actualizamos
      if (contrasena && contrasena.trim() !== '') {
        const salt = await bcrypt.genSalt(10);
        usuario.contrasena = await bcrypt.hash(contrasena, salt);
      }

      await usuario.save();

      // Actualizamos también los datos en la sesión si usas req.usuario
      req.usuario.nombre = usuario.nombre;
      req.usuario.email = usuario.email;

      res.render('usuarios/perfil', { 
        usuario, 
        error: null, 
        exito: 'Perfil actualizado correctamente' 
      });
    } catch (error) {
      console.error(error);
      const usuario = await Usuario.findByPk(req.usuario.id);
      res.render('usuarios/perfil', { 
        usuario, 
        error: 'Hubo un error al actualizar el perfil (¿el email ya está en uso?)', 
        exito: null 
      });
    }
  }
};