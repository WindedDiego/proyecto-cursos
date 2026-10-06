const Tarea = require('../models/Tarea');
const Curso = require('../models/Curso');
const Usuario = require('../models/Usuario');
const Entrega = require('../models/Entrega');

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
                            { model: Usuario, as: 'alumno' }
                        ]
                    });
                } else {
                    // El alumno solo ve sus propias entregas vinculadas a los ejercicios de este curso
                    entregas = await Entrega.findAll({
                        where: { 
                            alumno_id: req.usuario.id,
                            tarea_id: ejercicios.map(e => e.id)
                        },
                        include: [{ model: Tarea, as: 'tarea' }]
                    });
                }
                console.log(`[DEBUG] Entregas encontradas: ${entregas.length}`);
            }

            res.render('tareas/index', {
                curso,
                ejercicios,
                entregas,
                puedeGestionar: ['profesor', 'administrador'].includes(req.usuario.rol)
            });
        } catch (error) {
            console.error(`[ERROR CRÍTICO] en listarPorCurso:`, error);
            res.status(500).send(`Error interno del servidor: ${error.message}`);
        }
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

            res.render('tareas/crear_ejercicio', { curso, id_curso });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al cargar el formulario de creación');
        }
    },

    // Acción para que el profesor cree un ejercicio
    crearEjercicio: async (req, res) => {
        try {
            const id_curso = req.params.id_curso;
            const { titulo, descripcion, fecha_limite } = req.body;
            
            await Tarea.create({
                curso_id: id_curso,
                titulo,
                descripcion,
                fecha_limite: fecha_limite || null
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
            const id_ejercicio = req.params.id_ejercicio;
            const curso = await Curso.findByPk(req.params.id_curso);
            
            if (!curso) {
                return res.status(404).send('El curso seleccionado no existe.');
            }

            res.render('tareas/enviar_entrega', { curso, id_ejercicio });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al cargar el formulario de entrega');
        }
    },

    // Acción para que el alumno envíe la entrega
    enviarEntrega: async (req, res) => {
        try {
            const { id_ejercicio, id_curso } = req.params;
            const { url_archivo } = req.body;
            
            if (!id_ejercicio || !id_curso) {
                return res.status(400).send('Faltan parámetros requeridos (id_ejercicio o id_curso).');
            }

            await Entrega.create({
                tarea_id: id_ejercicio,
                alumno_id: req.usuario.id,
                url_archivo: url_archivo || null
            });
            
            res.redirect(`/cursos/${id_curso}/tareas`);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al enviar la entrega');
        }
    },

    // Vista para que el profesor vea las entregas de un ejercicio específico
    gestionarEntregas: async (req, res) => {
        try {
            const id_ejercicio = req.params.id_ejercicio;
            const curso = await Curso.findByPk(req.params.id_curso);

            if (!curso) {
                return res.status(404).send('El curso seleccionado no existe.');
            }

            const ejercicio = await Tarea.findByPk(id_ejercicio);
            const entregas = await Entrega.findAll({
                where: { tarea_id: id_ejercicio },
                include: [Usuario]
            });
            
            res.render('tareas/gestionar_entregas', {
                curso,
                ejercicio,
                entregas
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al cargar las entregas');
        }
    },

    // Acción para que el profesor califique una entrega
    calificarEntrega: async (req, res) => {
        try {
            const { id_entrega } = req.params;
            const { nota, comentario_profesor } = req.body;

            await Entrega.update({
                nota: nota || null,
                comentario_profesor: comentario_profesor || null
            }, { where: { id: id_entrega } });

            return res.redirect(`/cursos/${req.params.id_curso}/tareas/gestionar_entregas?id_ejercicio=${req.params.id_ejercicio}`);
        } catch (error) {
            console.error(error);
            return res.status(500).send('Error al calificar la entrega');
        }
    }
};