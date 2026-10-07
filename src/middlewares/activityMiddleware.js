const RegistroActividad = require('../models/RegistroActividad');

module.exports = async (req, res, next) => {
    const horaEntrada = new Date();
    const pathname = req.originalUrl.split('?')[0];
    const recursoNombre = `${req.method} ${pathname}`.slice(0, 150);
    let registro = null;

    try {
        const usuarioId = req.usuario ? req.usuario.id : null;
        const cursoMatch = pathname.match(/^\/cursos\/(\d+)(?:\/|$)/);
        const cursoId = cursoMatch ? Number(cursoMatch[1]) : null;
        const recursoTipo = pathname.split('/').filter(Boolean)[0] || 'general';

        registro = await RegistroActividad.create({
            usuario_id: usuarioId,
            curso_id: cursoId,
            recurso_tipo: recursoTipo,
            recurso_id: cursoId || 0,
            hora_entrada: horaEntrada,
            hora_salida: null,
            recurso: recursoNombre
        });
    } catch (error) {
        console.error('Error al registrar la hora de entrada en la actividad:', error);
    }

    // Permite que los controladores (p. ej. el login) ajusten el registro de esta petición
    req.registroActividad = registro;

    // Registrar la hora de salida cuando el servidor finalice la respuesta
    res.on('finish', async () => {
        if (registro) {
            try {
                registro.hora_salida = new Date();
                await registro.save();
            } catch (error) {
                console.error('Error al registrar la hora de salida:', error);
            }
        }
    });

    next();
};