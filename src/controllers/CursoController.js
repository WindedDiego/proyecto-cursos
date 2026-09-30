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
        await Curso.create(req.body);
        res.redirect('/cursos');
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
