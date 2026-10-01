const Examen = require('../models/Examen');
const Pregunta = require('../models/Pregunta');
const Respuesta = require('../models/Respuesta');

module.exports = {

    listar: async (req, res) => {
        const examenes = await Examen.findAll();
        res.render('examenes/index', { examenes });
    },

    crearForm: (req, res) => {
        res.render('examenes/crear');
    },

    crear: async (req, res) => {
        await Examen.create({
            curso_id: req.body.curso_id || req.body.cursoId,
            tipo: req.body.tipo || req.body.titulo
        });
        res.redirect('/examenes');
    },

    detalle: async (req, res) => {
        const examen = await Examen.findByPk(req.params.id, {
            include: { model: Pregunta, include: Respuesta }
        });
        res.render('examenes/detalle', { examen });
    },

    agregarPreguntasForm: async (req, res) => {
        const examen = await Examen.findByPk(req.params.id);
        res.render('examenes/agregarPreguntas', { examen });
    },

    agregarPreguntas: async (req, res) => {
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

        res.redirect(`/examenes/${req.params.id}`);
    },

    resolverForm: async (req, res) => {
        const examen = await Examen.findByPk(req.params.id, {
            include: { model: Pregunta, include: Respuesta }
        });
        res.render('examenes/resolver', { examen });
    },

    resolver: async (req, res) => {
        const respuestasUsuario = req.body;
        let aciertos = 0;

        for (const preguntaId in respuestasUsuario) {
            const respuestaId = respuestasUsuario[preguntaId];
            const respuesta = await Respuesta.findByPk(respuestaId);
            if (respuesta.correcta) aciertos++;
        }

        res.send(`Has acertado ${aciertos} preguntas`);
    }
};
