const Tarea = require('../models/Tarea');
const Curso = require('../models/Curso');
const Usuario = require('../models/Usuario');
const Entrega = require('../models/Entrega');
const { resolverOrigen, descartarArchivo } = require('../utils/archivos');

module.exports = {
    // Listar ejercicios de un curso (Vista del alumno y profesor)
    listarPorCurso: async (req, res) => {
        try {
            const id_curso = req.params.id_curso;
            console.log(`[DEBUG] listarPorCurso - ID Curso: ${id_curso}`);
            console.log(`[DEBUG] Usuario actual:`, req.usuario);

            const curso = await Curso.findByPk(id_curso);
            
            if (!curso) {
                console.error(`[ERROR] Curso con ID ${id_curso} no encontrado.`);
                return res.status(404).send('El curso seleccionado no existe.');
            }

            console.log(`[DEBUG] Curso encontrado: ${curso.titulo}`);

            // 1. Obtenemos todos los ejercicios del curso
            const ejercicios = await Tarea.findAll({ 
                where: { curso_id: id_curso },
                include: [{ model: Curso, as: 'curso' }]
            });
            console.log(`[DEBUG] Ejercicios encontrados: ${ejercicios.length}`);

            // 2. Obtenemos las entregas relevantes
            let entregas = [];
            if (req.usuario && req.usuario.id) {
                if (req.usuario.rol === 'profesor' || req.usuario.rol === 'administrador') {
                    // El profesor ve todas las entregas vinculadas a los ejercicios de este curso
                    const tareasIds = ejercicios.map(e => e.id);
                    entregas = await Entrega.findAll({
                        where: { 
                            tarea_id: tareasIds 
                        },
                        include: [
                            { model: Tarea, as: 'tarea' },
                            { model: Usuario, as: 'alumno', attributes: ['id', 'nombre', 'email'] }
                        ]
                    });
                } else {
                    // El alumno solo ve sus propias entregas vinculadas a los ejercicios de este curso
                    entregas = await Entrega.findAll({
                        where: { 
                            alumno_id: req.usuario.id,
                            tarea_id: ejercicios.map(e => e.id)
                        },
                        include: [
                            { model: Tarea, as: 'tarea' },
                            { model: Usuario, as: 'alumno', attributes: ['id', 'nombre', 'email'] }
                        ]
                    });
                }
                console.log(`[DEBUG] Entregas encontradas: ${entregas.length}`);
            }

            res.render('tareas/index', {
                curso,
                ejercicios,
                entregas,
                puedeGestionar: ['profesor', 'administrador'].includes(req.usuario.rol),
                puedeCalificar: req.usuario.rol === 'profesor'
            });
        } catch (error) {
            console.error(`[ERROR CRÍTICO] en listarPorCurso:`, error);
            res.status(500).send(`Error interno del servidor: ${error.message}`);
        }
    },

        // Formulario para que el profesor cree un nuevo ejercicio
    crearEjercicioForm: async (req, res) => {
        try {
            const id_curso = req.params.id_curso;
            const curso = await Curso.findByPk(id_curso);
            
            if (!curso) {
                return res.status(404).send('El curso seleccionado no existe.');
            }

            res.render('tareas/crear_ejercicio', { curso, id_curso, error: null, valores: {} });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al cargar el formulario de creación');
        }
    },

    // Acción para que el profesor cree un ejercicio (con adjunto opcional: URL o archivo)
    crearEjercicio: async (req, res) => {
        try {
            const id_curso = req.params.id_curso;
            const titulo = String(req.body.titulo || '').trim();
            const { descripcion, fecha_limite } = req.body;

            const { valor: url_adjunto, error } = resolverOrigen(req, 'tareas', { obligatorio: false });
            const errorFinal = error || (!titulo ? 'El título es obligatorio.' : null);

            if (errorFinal) {
                if (!error) descartarArchivo(req);
                const curso = await Curso.findByPk(id_curso);
                return res.status(400).render('tareas/crear_ejercicio', {
                    curso,
                    id_curso,
                    error: errorFinal,
                    valores: { titulo, descripcion, fecha_limite }
                });
            }

            await Tarea.create({
                curso_id: id_curso,
                titulo,
                descripcion,
                fecha_limite: fecha_limite || null,
                url_adjunto
            });

            res.redirect(`/cursos/${id_curso}/tareas`);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al crear el ejercicio');
        }
    },

    // Formulario para que el alumno envíe una entrega
    enviarEntregaForm: async (req, res) => {
        try {
            const { id_curso, id_ejercicio } = req.params;

            const curso = await Curso.findByPk(id_curso);
            if (!curso) {
                return res.status(404).send('El curso seleccionado no existe.');
            }

            // El ejercicio debe existir y pertenecer a este curso
            const ejercicio = await Tarea.findOne({ where: { id: id_ejercicio, curso_id: id_curso } });
            if (!ejercicio) {
                return res.status(404).send('El ejercicio no existe en este curso.');
            }

            res.render('tareas/enviar_entrega', { curso, id_ejercicio, ejercicio, error: null });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al cargar el formulario de entrega');
        }
    },

    // Acción para que el alumno envíe la entrega (URL o archivo)
    enviarEntrega: async (req, res) => {
        try {
            // Ambos identificadores vienen de la URL (el body multipart lo gestiona multer)
            const { id_curso, id_ejercicio } = req.params;

            const ejercicio = await Tarea.findOne({ where: { id: id_ejercicio, curso_id: id_curso } });
            if (!ejercicio) {
                descartarArchivo(req);
                return res.status(404).send('El ejercicio no existe en este curso.');
            }

            const { valor: url_final, error } = resolverOrigen(req, 'entregas', { obligatorio: true });
            if (error) {
                const curso = await Curso.findByPk(id_curso);
                return res.status(400).render('tareas/enviar_entrega', { curso, id_ejercicio, ejercicio, error });
            }

            await Entrega.create({
                tarea_id: id_ejercicio,
                alumno_id: req.usuario.id,
                url_archivo: url_final
            });

            res.redirect(`/cursos/${id_curso}/tareas`);
        } catch (error) {
            console.error(error, error.stack);
            res.status(500).send('Error al enviar la entrega');
        }
    },

    // Vista para que el profesor vea las entregas de un ejercicio específico
    gestionarEntregas: async (req, res) => {
        try {
            const { id_curso, id_ejercicio } = req.params;

            const curso = await Curso.findByPk(id_curso);
            if (!curso) {
                return res.status(404).send('El curso seleccionado no existe.');
            }

            const ejercicio = await Tarea.findOne({ where: { id: id_ejercicio, curso_id: id_curso } });
            if (!ejercicio) {
                return res.status(404).send('El ejercicio no existe en este curso.');
            }

            const entregas = await Entrega.findAll({
                where: { tarea_id: id_ejercicio },
                include: [{ model: Usuario, as: 'alumno', attributes: ['id', 'nombre', 'email'] }],
                order: [['fecha_envio', 'DESC']]
            });

            res.render('tareas/gestionar_entregas', {
                curso,
                ejercicio,
                entregas,
                mensaje: req.query.ok ? 'Calificación guardada correctamente.' : null,
                error: req.query.error || null
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al cargar las entregas');
        }
    },

    // Acción para que el profesor califique una entrega (nota + comentario)
    calificarEntrega: async (req, res) => {
        const { id_curso, id_ejercicio, id_entrega } = req.params;
        const volver = (query) => res.redirect(`/cursos/${id_curso}/tareas/gestionar_entregas/${id_ejercicio}?${query}`);

        try {
            // La entrega debe existir y pertenecer a un ejercicio de ESTE curso
            const entrega = await Entrega.findOne({
                where: { id: id_entrega, tarea_id: id_ejercicio },
                include: [{ model: Tarea, as: 'tarea', where: { curso_id: id_curso }, attributes: ['id'] }]
            });
            if (!entrega) {
                return res.status(404).send('La entrega no existe en este ejercicio.');
            }

            // Nota: vacía = sin calificar; si viene, debe estar entre 0 y 10
            const notaTexto = String(req.body.nota ?? '').trim().replace(',', '.');
            let nota = null;
            if (notaTexto !== '') {
                nota = Number(notaTexto);
                if (!Number.isFinite(nota) || nota < 0 || nota > 10) {
                    return volver('error=' + encodeURIComponent('La nota debe ser un número entre 0 y 10.'));
                }
                nota = Math.round(nota * 100) / 100;
            }

            const comentario = String(req.body.comentario_profesor ?? '').trim();

            await entrega.update({
                nota,
                comentario_profesor: comentario || null
            });

            return volver('ok=1');
        } catch (error) {
            console.error(error);
            return res.status(500).send('Error al calificar la entrega');
        }
    }
};
