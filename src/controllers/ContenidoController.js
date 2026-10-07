const Contenido = require('../models/Contenido');
const Curso = require('../models/Curso');
const { resolverOrigen, descartarArchivo } = require('../utils/archivos');

module.exports = {
    listarPorCurso: async (req, res) => {
        try {
            const id_curso = req.params.id_curso;
            const curso = await Curso.findByPk(id_curso);
            
            // Si el curso no existe, devolvemos un error 404 o un mensaje amigable
            if (!curso) {
                return res.status(404).send('El curso seleccionado no existe.');
            }

            const contenidos = await Contenido.findAll({ where: { curso_id: id_curso } });
            
            res.render('contenidos/index', {
                curso,
                contenidos,
                puedeGestionar: ['profesor', 'administrador'].includes(req.usuario.rol)
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al cargar los contenidos');
        }
    },

    crearForm: async (req, res) => {
        try {
            const id_curso = req.params.id_curso;
            const curso = await Curso.findByPk(id_curso);
            
            if (!curso) {
                return res.status(404).send('El curso seleccionado no existe.');
            }
            
            res.render('contenidos/crear', { curso, error: null, valores: {} });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al cargar el formulario');
        }
    },

    crear: async (req, res) => {
        try {
            const id_curso = req.params.id_curso;
            const tipo = String(req.body.tipo || '').trim();
            const descripcion = String(req.body.descripcion || '').trim();

            const { valor: url_archivo, error } = resolverOrigen(req, 'contenidos', { obligatorio: true });
            const errorFinal = error || (!['video', 'pdf', 'texto'].includes(tipo) ? 'Elige un tipo de material válido.' : null);

            if (errorFinal) {
                if (!error) descartarArchivo(req);
                const curso = await Curso.findByPk(id_curso);
                return res.status(400).render('contenidos/crear', {
                    curso,
                    error: errorFinal,
                    valores: { tipo, descripcion }
                });
            }

            await Contenido.create({
                curso_id: id_curso,
                tipo,
                url_archivo,
                descripcion: descripcion || null
            });

            res.redirect(`/cursos/${id_curso}/contenidos`);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al guardar el contenido');
        }
    },

    editar: async (req, res) => {
        try {
            const id_curso = req.params.id_curso;
            const tipo = String(req.body.tipo || '').trim();
            const url_archivo = String(req.body.url_archivo || '').trim();
            const descripcion = String(req.body.descripcion || '').trim();
            
            if (!tipo || tipo.length > 50) {
                return res.status(400).send('El tipo de contenido es obligatorio y admite hasta 50 caracteres');
            }

            const contenido = await Contenido.findOne({
                where: { id: req.params.contenidoId, curso_id: id_curso }
            });
            if (!contenido) return res.status(404).send('Contenido no encontrado');

            await contenido.update({ tipo, url_archivo: url_archivo || null, descripcion: descripcion || null });
            return res.redirect(`/cursos/${id_curso}/contenidos`);
        } catch (error) {
            console.error(error);
            return res.status(500).send('Error al actualizar el contenido');
        }
    }
};