const RegistroActividad = require('../models/RegistroActividad');
const Usuario = require('../models/Usuario');
const Curso = require('../models/Curso');

module.exports = {
    // Panel para el Profesor
    panelProfesor: async (req, res) => {
        try {
            // El profesor puede ver la actividad general de los alumnos
            const actividades = await RegistroActividad.findAll({
                include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'email', 'rol'] }],
                order: [['hora_entrada', 'DESC']],
                limit: 50
            });
            const cursos = await Curso.findAll();

            res.render('paneles/profesor', { usuario: req.usuario, actividades, cursos });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al cargar el panel de profesor');
        }
    },

    // Panel para el Observador (Administración - Solo lectura)
    panelObservador: async (req, res) => {
        try {
            // El observador ve todas las horas de actividad y las fichas de alumnos
            const alumnos = await Usuario.findAll({ where: { rol: 'alumno' } });
            const todasLasActividades = await RegistroActividad.findAll({
                include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'email', 'rol'] }],
                order: [['hora_entrada', 'DESC']],
                limit: 100
            });

            res.render('paneles/observador', { usuario: req.usuario, alumnos, todasLasActividades });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al cargar el panel de observador');
        }
    },

    // Panel para el Alumno (Ver su propia actividad)
    panelAlumno: async (req, res) => {
        try {
            const userId = req.usuario.id;
            const usuario = await Usuario.findByPk(userId);
            if (!usuario) {
                return res.status(404).send('No se encontró el usuario del alumno');
            }

            const misActividades = await RegistroActividad.findAll({
                where: { usuario_id: userId },
                order: [['hora_entrada', 'DESC']]
            });

            res.render('paneles/alumno', { usuario, misActividades });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al cargar el panel de alumno');
        }
    }
};