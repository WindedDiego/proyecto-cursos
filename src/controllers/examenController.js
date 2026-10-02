const Examen = require('../models/Examen');
const Pregunta = require('../models/Pregunta');
const Respuesta = require('../models/Respuesta');
const Curso = require('../models/Curso');
const ResultadoExamen = require('../models/ResultadoExamen');

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
                include: [{
                    model: Pregunta,
                    as: 'Preguntas',
                    include: [{
                        model: Respuesta,
                        as: 'Respuestas'
                    }]
                }]
            });
            if (!examen) {
                return res.status(404).send('Examen no encontrado');
            }
            res.render('examenes/detalle', {
                examen,
                cursoId: id_curso,
                puedeVerCorrectas: req.usuario.rol !== 'alumno'
            });
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
            const { enunciado, tipo, r1, r2, r3, r4, correcta } = req.body;

            const pregunta = await Pregunta.create({
                enunciado: enunciado || req.body.texto,
                examen_id: req.params.id,
                tipo: tipo || 'multiple'
            });

            await Respuesta.bulkCreate([
                { texto: r1, correcta: String(correcta) === '1', pregunta_id: pregunta.id },
                { texto: r2, correcta: String(correcta) === '2', pregunta_id: pregunta.id },
                { texto: r3, correcta: String(correcta) === '3', pregunta_id: pregunta.id },
                { texto: r4, correcta: String(correcta) === '4', pregunta_id: pregunta.id }
            ]);

            res.redirect(`/cursos/${id_curso}/examenes/${req.params.id}`);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al guardar la pregunta');
        }
    },

    editarPreguntaForm: async (req, res) => {
        try {
            const id_curso = req.params.id_curso;
            const preguntaId = req.params.preguntaId;
            const pregunta = await Pregunta.findByPk(preguntaId, {
                include: [{ model: Respuesta, as: 'Respuestas' }]
            });
            
            if (!pregunta) {
                return res.status(404).send('Pregunta no encontrada');
            }

            res.render('examenes/editarPregunta', { pregunta, cursoId: id_curso, examenId: req.params.id });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al cargar el formulario de edición');
        }
    },

    editarPregunta: async (req, res) => {
        try {
            const id_curso = req.params.id_curso;
            const examenId = req.params.id;
            const preguntaId = req.params.preguntaId;
            const { enunciado, r1, r2, r3, r4, correcta } = req.body;

            await Pregunta.update({ enunciado }, { where: { id: preguntaId } });

            const respuestas = await Respuesta.findAll({ where: { pregunta_id: preguntaId } });
            const textos = [r1, r2, r3, r4];

            for (let i = 0; i < respuestas.length; i++) {
                if (respuestas[i]) {
                    respuestas[i].texto = textos[i];
                    respuestas[i].correcta = (String(correcta) === String(i + 1));
                    await respuestas[i].save();
                }
            }

            res.redirect(`/cursos/${id_curso}/examenes/${examenId}`);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al actualizar la pregunta');
        }
    },

    resolverForm: async (req, res) => {
        try {
            const id_curso = req.params.id_curso;
            const examen = await Examen.findOne({
                where: { id: req.params.id, curso_id: id_curso },
                include: [{
                    model: Pregunta,
                    as: 'Preguntas',
                    include: [{ model: Respuesta, as: 'Respuestas' }]
                }]
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

            const id_curso = req.params.id_curso;
            const examenId = req.params.id;

            const examen = await Examen.findOne({
                where: { id: examenId, curso_id: id_curso },
                include: [{
                    model: Pregunta,
                    as: 'Preguntas',
                    include: [{ model: Respuesta, as: 'Respuestas' }]
                }]
            });

            if (!examen) {
                return res.status(404).send('Examen no encontrado');
            }

            const preguntas = examen.Preguntas || [];
            if (preguntas.length === 0) {
                return res.status(400).send('El examen todavía no tiene preguntas');
            }

            preguntas.forEach(pregunta => {
                const respuestaElegidaId = respuestasUsuario[`pregunta_${pregunta.id}`];
                const encontrada = pregunta.Respuestas.find(
                    respuesta => String(respuesta.id) === String(respuestaElegidaId)
                );
                if (encontrada && encontrada.correcta) {
                    aciertos++;
                }
            });

            const total = preguntas.length;
            await ResultadoExamen.create({
                examen_id: examen.id,
                alumno_id: req.usuario.id,
                aciertos,
                total
            });

            res.send(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>Resultado del Examen</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                </head>
                <body class="container mt-5" style="max-width: 600px;">
                    <div class="card shadow p-4 text-center">
                        <h2>Resultado de la Corrección</h2>
                        <p class="fs-4 mt-3">Has acertado <strong>${aciertos}</strong> de <strong>${total}</strong> preguntas.</p>
                        <a href="/cursos/${id_curso}/examenes" class="btn btn-primary mt-3">Volver a los exámenes</a>
                    </div>
                </body>
                </html>
            `);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al corregir el examen');
        }
    }
};

module.exports = examenController;