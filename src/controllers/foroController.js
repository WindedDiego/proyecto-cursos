const Curso = require('../models/Curso');
const Foro = require('../models/Foro');
const MensajeForo = require('../models/MensajeForo');
const Usuario = require('../models/Usuario');

module.exports = {
    listar: async (req, res) => {
        try {
            const curso = await Curso.findByPk(req.params.id_curso);
            if (!curso) {
                return res.status(404).send('El curso no existe');
            }

            const foros = await Foro.findAll({
                where: { curso_id: curso.id },
                order: [['id', 'DESC']]
            });

            res.render('foros/index', { curso, foros });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al cargar los foros');
        }
    },

    crearForm: async (req, res) => {
        try {
            const curso = await Curso.findByPk(req.params.id_curso);
            if (!curso) {
                return res.status(404).send('El curso no existe');
            }

            res.render('foros/crear', { curso });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al cargar el formulario del foro');
        }
    },

    crear: async (req, res) => {
        try {
            const curso = await Curso.findByPk(req.params.id_curso);
            if (!curso) {
                return res.status(404).json({ mensaje: 'El curso no existe' });
            }

            const titulo = String(req.body.titulo || '').trim();
            if (!titulo || titulo.length > 150) {
                return res.status(400).json({ mensaje: 'El título es obligatorio y admite hasta 150 caracteres' });
            }

            const foro = await Foro.create({ curso_id: curso.id, titulo });
            res.status(201).json({ redirect: `/cursos/${curso.id}/foros/${foro.id}` });
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al crear el foro' });
        }
    },

    detalle: async (req, res) => {
        try {
            const foro = await Foro.findOne({
                where: {
                    id: req.params.foroId,
                    curso_id: req.params.id_curso
                },
                include: [{
                    model: MensajeForo,
                    as: 'mensajes',
                    separate: true,
                    order: [['fecha', 'ASC'], ['id', 'ASC']],
                    include: [{
                        model: Usuario,
                        as: 'autor',
                        attributes: ['id', 'nombre']
                    }]
                }]
            });

            if (!foro) {
                return res.status(404).send('El foro no existe');
            }

            res.render('foros/detalle', { foro, cursoId: req.params.id_curso });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al cargar el foro');
        }
    },

    enviarMensaje: async (req, res) => {
        try {
            const foro = await Foro.findOne({
                where: {
                    id: req.params.foroId,
                    curso_id: req.params.id_curso
                }
            });
            if (!foro) {
                return res.status(404).json({ mensaje: 'El foro no existe' });
            }

            const usuario = await Usuario.findByPk(req.usuario.id);
            if (!usuario) {
                return res.status(401).json({ mensaje: 'El usuario del token ya no existe' });
            }

            const contenido = String(req.body.contenido || '').trim();
            if (!contenido) {
                return res.status(400).json({ mensaje: 'El mensaje no puede estar vacío' });
            }

            await MensajeForo.create({
                foro_id: foro.id,
                usuario_id: usuario.id,
                contenido,
                fecha: new Date()
            });

            res.status(201).json({
                redirect: `/cursos/${req.params.id_curso}/foros/${foro.id}`
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al publicar el mensaje' });
        }
    }
};