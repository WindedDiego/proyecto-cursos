const Usuario = require('../models/Usuario');  
const Curso = require('../models/Curso');  
  
module.exports = {  
  // Panel para el Profesor  
  panelProfesor: async (req, res) => {  
    try {  
      const cursos = await Curso.findAll();  
      res.render('paneles/profesor', { usuario: req.usuario, cursos });  
    } catch (error) {  
      console.error(error);  
      res.status(500).send('Error al cargar el panel de profesor');  
    }  
  }, // <--- ¡Importante esta coma!

  // Panel para el Observador
  panelObservador: async (req, res) => {
    try {
      res.render('paneles/observador', { usuario: req.usuario }); 
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al cargar el panel de observador');
    }
  }, // <--- ¡Importante esta coma también!

  // Panel para el Administrador
  panelObservador: async (req, res) => {
    try {
      res.render('paneles/observador', { usuario: req.usuario }); 
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al cargar el panel de observador');
    }
  }, // <--- ¡Importante esta coma también!
  
  // Panel para el Alumno  
  panelAlumno: async (req, res) => {  
    try {  
      const userId = req.usuario.id;  
      const usuario = await Usuario.findByPk(userId);  
      if (!usuario) {  
        return res.status(404).send('No se encontró el usuario del alumno');  
      }  
      const cursos = await Curso.findAll();  
      
      res.render('paneles/alumno', { usuario, cursos });  
    } catch (error) {  
      console.error(error);  
      res.status(500).send('Error al cargar el panel de alumno');  
    }  
  }  
};