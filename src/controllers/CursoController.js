const Curso = require('../models/Curso');
const Usuario = require('../models/Usuario');
const Matricula = require('../models/Matricula');

module.exports = {
    listar: async (req, res) => {
        let cursos;
        if (req.usuario.rol === 'profesor') {
            cursos = await Curso.findAll({ where: { profesor_id: req.usuario.id } });
        } else if (req.usuario.rol === 'alumno') {
            const matriculas = await Matricula.findAll({
                where: { alumno_id: req.usuario.id },
                attributes: ['curso_id']
            });
            cursos = await Curso.findAll({ where: { id: matriculas.map(matricula => matricula.curso_id) } });
        } else {
            cursos = await Curso.findAll();
        }
        res.render('cursos/index', { cursos });
    },

    detalle: async (req, res) => {
        const curso = await Curso.findByPk(req.params.id);
        res.render('cursos/detalle', { curso });
    },

    crearForm: async (req, res) => {
        const profesores = await Usuario.findAll({
            where: { rol: 'profesor' },
            attributes: ['id', 'nombre', 'email'],
            order: [['nombre', 'ASC']]
        });
        res.render('cursos/crear', { usuario: req.usuario, profesores });
    },

    crear: async (req, res) => {
        try {
            const profesorId = req.usuario.rol === 'administrador'
                ? Number(req.body.profesor_id)
                : req.usuario.id;
            const profesor = await Usuario.findOne({ where: { id: profesorId, rol: 'profesor' } });
            if (!profesor) {
                return res.status(400).send('Selecciona un profesor válido para el curso');
            }

            await Curso.create({
                titulo: req.body.titulo,
                descripcion: req.body.descripcion,
                profesor_id: profesor.id
            });
            res.redirect('/cursos');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al crear el curso');
        }
    },

    editarForm: async (req, res) => {
        const [curso, profesores] = await Promise.all([
            Curso.findByPk(req.params.id),
            Usuario.findAll({ where: { rol: 'profesor' }, attributes: ['id', 'nombre', 'email'], order: [['nombre', 'ASC']] })
        ]);
        if (!curso) return res.status(404).send('Curso no encontrado');
        res.render('cursos/editar', { curso, usuario: req.usuario, profesores });
    },

    editar: async (req, res) => {
        try {
            const curso = await Curso.findByPk(req.params.id);
            if (!curso) return res.status(404).send('Curso no encontrado');

            const cambios = {
                titulo: String(req.body.titulo || '').trim(),
                descripcion: req.body.descripcion
            };
            if (!cambios.titulo || cambios.titulo.length > 150) {
                return res.status(400).send('El título es obligatorio y admite hasta 150 caracteres');
            }

            if (req.usuario.rol === 'administrador') {
                const profesorId = Number(req.body.profesor_id);
                const profesor = await Usuario.findOne({ where: { id: profesorId, rol: 'profesor' } });
                if (!profesor) return res.status(400).send('Selecciona un profesor válido para el curso');
                cambios.profesor_id = profesor.id;
            }

            await curso.update(cambios);
            return res.redirect('/cursos');
        } catch (error) {
            console.error(error);
            return res.status(500).send('Error al actualizar el curso');
        }
    },

    eliminar: async (req, res) => {
        await Curso.destroy({ where: { id: req.params.id } });
        res.redirect('/cursos');
    }
};