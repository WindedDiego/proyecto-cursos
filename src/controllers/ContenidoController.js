const Contenido = require('../models/Contenido');
const Curso = require('../models/Curso');

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
            
            res.render('contenidos/index', { curso, contenidos });
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
            
            res.render('contenidos/crear', { curso });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al cargar el formulario');
        }
    },

    crear: async (req, res) => {
        try {
            const id_curso = req.params.id_curso;
            const { tipo, url_archivo } = req.body;
            
            await Contenido.create({
                curso_id: id_curso,
                tipo: tipo,
                url_archivo: url_archivo || null
            });
            
            res.redirect(`/cursos/${id_curso}/contenidos`);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al guardar el contenido');
        }
    }
};