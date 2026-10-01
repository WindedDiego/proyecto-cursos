const Examen = require('../models/Examen');
const Pregunta = require('../models/Pregunta');
const Respuesta = require('../models/Respuesta');
const Curso = require('../models/Curso');

const examenController = {
    listar: async (req, res) => {
        try {
            const id_curso = req.params.id_curso;
            const curso = await Curso.findByPk(id_curso);
            if (!curso) {
                return res.status(404).send('El curso seleccionado no existe.');
            }
            const examenes = await Examen.findAll({ where: { curso_id: id_curso } });
            res.render('examenes/index', { curso, examenes });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al cargar los exámenes');
        }
    },

    listarPorCurso: async (req, res) => {
        return examenController.listar(req, res);
    },

    crearForm: async (req, res) => {
        try {
            const id_curso = req.params.id_curso;
            const curso = await Curso.findByPk(id_curso);
            if (!curso) {
                return res.status(404).send('El curso seleccionado no existe.');
            }
            res.render('examenes/crear', { curso });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al cargar el formulario de examen');
        }
    },

    crear: async (req, res) => {
        try {
            const id_curso = req.params.id_curso;
            const { tipo } = req.body;

            const tipoExamen = String(tipo || '').trim();
            if (!tipoExamen) {
                return res.status(400).send('El tipo de examen es obligatorio');
            }

            const curso = await Curso.findByPk(id_curso);
            if (!curso) {
                return res.status(400).send('El curso seleccionado no existe');
            }

            await Examen.create({
                curso_id: id_curso,
                tipo: tipoExamen
            });

            res.redirect(`/cursos/${id_curso}/examenes`);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al crear el examen');
        }
    },

    detalle: async (req, res) => {
        try {
            const id_curso = req.params.id_curso;
            const examen = await Examen.findOne({
                where: { id: req.params.id, curso_id: id_curso },
                include: { model: Pregunta, include: Respuesta }
            });
            if (!examen) {
                return res.status(404).send('Examen no encontrado');
            }
            res.render('examenes/detalle', { examen, cursoId: id_curso });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al cargar el detalle del examen');
        }
    },

    agregarPreguntasForm: async (req, res) => {
        try {
            const id_curso = req.params.id_curso;
            const examen = await Examen.findOne({ where: { id: req.params.id, curso_id: id_curso } });
            if (!examen) {
                return res.status(404).send('Examen no encontrado');
            }
            res.render('examenes/agregarPreguntas', { examen, cursoId: id_curso });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al cargar formulario de preguntas');
        }
    },

    agregarPreguntas: async (req, res) => {
        try {
            const id_curso = req.params.id_curso;
            const pregunta = await Pregunta.create({
                enunciado: req.body.enunciado || req.body.texto,
                examen_id: req.params.id,
                tipo: req.body.tipo || 'multiple'
            });

            await Respuesta.bulkCreate([
                { texto: req.body.r1, correcta: req.body.correcta === '1', pregunta_id: pregunta.id },
                { texto: req.body.r2, correcta: req.body.correcta === '2', pregunta_id: pregunta.id },
                { texto: req.body.r3, correcta: req.body.correcta === '3', pregunta_id: pregunta.id },
                { texto: req.body.r4, correcta: req.body.correcta === '4', pregunta_id: pregunta.id }
            ]);

            res.redirect(`/cursos/${id_curso}/examenes/${req.params.id}`);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al guardar la pregunta');
        }
    },

    resolverForm: async (req, res) => {
        try {
            const id_curso = req.params.id_curso;
            const examen = await Examen.findOne({
                where: { id: req.params.id, curso_id: id_curso },
                include: { model: Pregunta, include: Respuesta }
            });
            if (!examen) {
                return res.status(404).send('Examen no encontrado');
            }
            res.render('examenes/resolver', { examen, cursoId: id_curso });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al cargar la vista de resolución');
        }
    },

    resolver: async (req, res) => {
        try {
            const respuestasUsuario = req.body;
            let aciertos = 0;

            for (const preguntaId in respuestasUsuario) {
                const respuestaId = respuestasUsuario[preguntaId];
                const respuesta = await Respuesta.findByPk(respuestaId);
                if (respuesta && respuesta.correcta) aciertos++;
            }

            res.send(`Has acertado ${aciertos} preguntas`);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al corregir el examen');
        }
    }
};

module.exports = examenController;