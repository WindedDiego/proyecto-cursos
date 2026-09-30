const Curso = require('../models/Curso');

module.exports = {
    listar: async (req, res) => {
        const cursos = await Curso.findAll();
        res.render('cursos/index', { cursos });
    },

    detalle: async (req, res) => {
        const curso = await Curso.findByPk(req.params.id);
        res.render('cursos/detalle', { curso });
    },

    crearForm: (req, res) => {
        res.render('cursos/crear');
    },

    crear: async (req, res) => {
        try {
            // Añadimos profesor_id por defecto (ej. ID 1) para evitar el error de campo nulo
            await Curso.create({
                titulo: req.body.titulo,
                descripcion: req.body.descripcion,
                profesor_id: 1 
            });
            res.redirect('/cursos');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al crear el curso');
        }
    },

    editarForm: async (req, res) => {
        const curso = await Curso.findByPk(req.params.id);
        res.render('cursos/editar', { curso });
    },

    editar: async (req, res) => {
        await Curso.update(req.body, { where: { id: req.params.id } });
        res.redirect('/cursos');
    },

    eliminar: async (req, res) => {
        await Curso.destroy({ where: { id: req.params.id } });
        res.redirect('/cursos');
    }
};