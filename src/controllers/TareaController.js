const Tarea = require('../models/Tarea');
const Curso = require('../models/Curso');
const Usuario = require('../models/Usuario');

module.exports = {
    // Listar las tareas enviadas de un curso específico
    listarPorCurso: async (req, res) => {
        try {
            const id_curso = req.params.id_curso;
            const curso = await Curso.findByPk(id_curso);
            
            if (!curso) {
                return res.status(404).send('El curso seleccionado no existe.');
            }

            const tareas = await Tarea.findAll({ 
                where: req.usuario.rol === 'alumno'
                    ? { curso_id: id_curso, alumno_id: req.usuario.id }
                    : { curso_id: id_curso },
                include: [{ model: Usuario, as: 'alumno' }] // Por si quieres mostrar el nombre del alumno
            });
            
            res.render('tareas/index', { curso, tareas });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al cargar las tareas');
        }
    },

    // Formulario para subir/crear una tarea
    crearForm: async (req, res) => {
        try {
            const id_curso = req.params.id_curso;
            const curso = await Curso.findByPk(id_curso);
            
            if (!curso) {
                return res.status(404).send('El curso seleccionado no existe.');
            }
            
            res.render('tareas/crear', { curso });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al cargar el formulario de tareas');
        }
    },

    // Guardar la tarea en la base de datos
    crear: async (req, res) => {
        try {
            const id_curso = req.params.id_curso;
            const { url_archivo } = req.body;
            
            await Tarea.create({
                curso_id: id_curso,
                alumno_id: req.usuario.id,
                url_archivo: url_archivo
            });
            
            res.redirect(`/cursos/${id_curso}/tareas`);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al guardar la tarea');
        }
    }
};