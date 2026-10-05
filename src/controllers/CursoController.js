const Curso = require('../models/Curso');
const Usuario = require('../models/Usuario');
const Matricula = require('../models/Matricula');
const ResultadoExamen = require('../models/ResultadoExamen');
const Examen = require('../models/Examen');

module.exports = {
    listar: async (req, res) => {
        let cursos;
        if (req.usuario.rol === 'profesor') {
            cursos = await Curso.findAll({ where: { profesor_id: req.usuario.id } });
        } else if (req.usuario.rol === 'alumno') {
            const matriculas = await Matricula.findAll({
                where: { alumno_id: req.usuario.id },
                attributes: ['curso_id']
            });
            cursos = await Curso.findAll({ where: { id: matriculas.map(matricula => matricula.curso_id) } });
        } else {
            cursos = await Curso.findAll();
        }
        
        // Definir permisos de gestión
        const puedeGestionar = req.usuario.rol === 'administrador' || req.usuario.rol === 'profesor';

        res.render('cursos/index', { cursos, puedeGestionar });
    },

    detalle: async (req, res) => {
        const curso = await Curso.findByPk(req.params.id);
        res.render('cursos/detalle', { curso });
    },

    crearForm: async (req, res) => {
        const profesores = await Usuario.findAll({
            where: { rol: 'profesor' },
            attributes: ['id', 'nombre', 'email'],
            order: [['nombre', 'ASC']]
        });
        res.render('cursos/crear', { usuario: req.usuario, profesores });
    },

    crear: async (req, res) => {
        try {
            const profesorId = req.usuario.rol === 'administrador'
                ? Number(req.body.profesor_id)
                : req.usuario.id;
            const profesor = await Usuario.findOne({ where: { id: profesorId, rol: 'profesor' } });
            if (!profesor) {
                return res.status(400).send('Selecciona un profesor válido para el curso');
            }

            await Curso.create({
                titulo: req.body.titulo,
                descripcion: req.body.descripcion,
                profesor_id: profesor.id
            });
            res.redirect('/cursos');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al crear el curso');
        }
    },

    editarForm: async (req, res) => {
        const [curso, profesores] = await Promise.all([
            Curso.findByPk(req.params.id),
            Usuario.findAll({ where: { rol: 'profesor' }, attributes: ['id', 'nombre', 'email'], order: [['nombre', 'ASC']] })
        ]);
        if (!curso) return res.status(404).send('Curso no encontrado');
        res.render('cursos/editar', { curso, usuario: req.usuario, profesores });
    },

    editar: async (req, res) => {
        try {
            const curso = await Curso.findByPk(req.params.id);
            if (!curso) return res.status(404).send('Curso no encontrado');

            const cambios = {
                titulo: String(req.body.titulo || '').trim(),
                descripcion: req.body.descripcion
            };
            if (!cambios.titulo || cambios.titulo.length > 150) {
                return res.status(400).send('El título es obligatorio y admite hasta 150 caracteres');
            }

            if (req.usuario.rol === 'administrador') {
                const profesorId = Number(req.body.profesor_id);
                const profesor = await Usuario.findOne({ where: { id: profesorId, rol: 'profesor' } });
                if (!profesor) return res.status(400).send('Selecciona un profesor válido para el curso');
                cambios.profesor_id = profesor.id;
            }

            await curso.update(cambios);
            return res.redirect('/cursos');
        } catch (error) {
            console.error(error);
            return res.status(500).send('Error al actualizar el curso');
        }
    },

    eliminar: async (req, res) => {
        await Curso.destroy({ where: { id: req.params.id } });
        res.redirect('/cursos');
    },

    resultados: async (req, res) => {
        try {
            const cursoId = req.params.id;

            const curso = await Curso.findByPk(cursoId);
            if (!curso) return res.status(404).send('Curso no encontrado');

            const examenes = await Examen.findAll({
                where: { curso_id: cursoId }
            });

            const examenIds = examenes.map(e => e.id);

            const resultados = await ResultadoExamen.findAll({
                where: { examen_id: examenIds },
                attributes: ['id', 'examen_id', 'alumno_id', 'aciertos', 'total', 'fecha'],
                include: [
                    {
                        model: Usuario,
                        attributes: ['nombre'],
                        required: true
                    },
                    {
                        model: Examen,
                        attributes: ['tipo'],
                        required: true
                    }
                ],
                order: [['fecha', 'DESC']]
            });

            const resultadosFinales = resultados.map(r => {
                return {
                    id: r.id,
                    fecha: r.fecha,
                    aciertos: r.aciertos,
                    total: r.total,
                    nombreAlumno: r.alumno ? r.alumno.nombre : 'N/A',
                    tipoExamen: r.examen ? r.examen.tipo : 'N/A'
                };
            });

            res.render('cursos/resultados', { 
                curso,      
                cursoId, 
                resultados: resultadosFinales, 
                examenes 
            });

        } catch (error) {
            console.error(error);
            res.status(500).send('Error al obtener los resultados');
        }
    }

};