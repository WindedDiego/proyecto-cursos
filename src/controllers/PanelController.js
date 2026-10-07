const RegistroActividad = require('../models/RegistroActividad');
const Usuario = require('../models/Usuario');
const Curso = require('../models/Curso');
const Matricula = require('../models/Matricula');

module.exports = {
    // Panel para el Profesor (el administrador también puede entrar y ve todos los cursos)
    panelProfesor: async (req, res) => {
        try {
            const usuario = await Usuario.findByPk(req.usuario.id, {
                attributes: ['id', 'nombre', 'email', 'rol']
            });
            if (!usuario) {
                return res.status(404).send('No se encontró el usuario');
            }

            const cursos = await Curso.findAll(
                usuario.rol === 'administrador' ? {} : { where: { profesor_id: usuario.id } }
            );

            res.render('paneles/profesor', { usuario, cursos });
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

    // Panel para el Alumno (accesos rápidos a sus cursos matriculados)
    panelAlumno: async (req, res) => {
        try {
            const usuario = await Usuario.findByPk(req.usuario.id);
            if (!usuario) {
                return res.status(404).send('No se encontró el usuario del alumno');
            }

            const matriculas = await Matricula.findAll({
                where: { alumno_id: usuario.id },
                attributes: ['curso_id']
            });
            const cursos = matriculas.length
                ? await Curso.findAll({ where: { id: matriculas.map(m => m.curso_id) } })
                : [];

            res.render('paneles/alumno', { usuario, cursos });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al cargar el panel de alumno');
        }
    }
};