const Usuario = require('../models/Usuario');

module.exports = async (req, res, next) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id, {
            attributes: ['id', 'rol']
        });
        if (!usuario || usuario.rol !== 'administrador') {
            return res.status(403).json({ mensaje: 'Se requieren permisos de administrador vigentes' });
        }

        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'No se pudieron verificar los permisos de administrador' });
    }
};