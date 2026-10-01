const RegistroActividad = require('../models/RegistroActividad');

module.exports = async (req, res, next) => {
    const horaEntrada = new Date();
    const recursoNombre = `${req.method} ${req.baseUrl}${req.path}`;
    let registro = null;

    try {
        const usuarioId = (req.usuario && req.usuario.id) ? req.usuario.id : null;
        // Extraer el id_curso de los parámetros de la ruta si existe (ej. /cursos/1/tareas)
        const cursoId = (req.params && req.params.id_curso) ? Number(req.params.id_curso) : ((req.params && req.params.id) ? Number(req.params.id) : null);

        registro = await RegistroActividad.create({
            usuario_id: usuarioId || 1, // Si no hay usuario logueado, usa un ID por defecto para evitar error de clave ajena si aplica
            curso_id: cursoId || 1,     // Si no hay curso en la URL, asigna 1 temporalmente según tus restricciones FK
            recurso_tipo: req.baseUrl ? req.baseUrl.replace('/', '') : 'general',
            recurso_id: cursoId || 0,
            hora_entrada: horaEntrada,
            hora_salida: null,
            recurso: recursoNombre
        });
    } catch (error) {
        console.error('Error al registrar la hora de entrada en la actividad:', error);
    }

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