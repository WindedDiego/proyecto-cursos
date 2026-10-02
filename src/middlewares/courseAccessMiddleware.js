const Curso = require('../models/Curso');
const Matricula = require('../models/Matricula');
const Usuario = require('../models/Usuario');

module.exports = async (req, res, next) => {
    const user = req.usuario;
    const courseId = Number(req.params.id_curso || req.params.id);

    if (!Number.isInteger(courseId) || courseId < 1) {
        return res.status(400).send('ID de curso inválido');
    }

    try {
        const usuarioActual = await Usuario.findByPk(user.id, { attributes: ['id', 'rol'] });
        if (!usuarioActual) return res.status(401).send('La cuenta ya no existe');
        user.rol = usuarioActual.rol;

    if (['administrador', 'observador'].includes(user.rol)) return next();

        const curso = await Curso.findByPk(courseId, { attributes: ['id', 'profesor_id'] });
        if (!curso) return res.status(404).send('Curso no encontrado');

        if (user.rol === 'profesor' && Number(curso.profesor_id) === Number(user.id)) return next();
        if (user.rol === 'alumno') {
            const matricula = await Matricula.findOne({ where: { curso_id: courseId, alumno_id: user.id } });
            if (matricula) return next();
        }

        return res.status(403).send('No tienes acceso a este curso');
    } catch (error) {
        console.error(error);
        return res.status(500).send('No se pudo verificar el acceso al curso');
    }
};