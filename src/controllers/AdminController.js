const bcrypt = require('bcrypt');
const sequelize = require('../database');
const { QueryTypes } = require('sequelize');
const Usuario = require('../models/Usuario');
const Curso = require('../models/Curso');
const Matricula = require('../models/Matricula');
const Tarea = require('../models/Tarea');
const MensajeForo = require('../models/MensajeForo');
const RegistroActividad = require('../models/RegistroActividad');
const ResultadoExamen = require('../models/ResultadoExamen');

const rolesAsignables = ['alumno', 'profesor', 'observador', 'administrador'];
const bootstrapLockName = 'proyecto_cursos_admin_bootstrap';

function normalizarIdsCurso(value) {
    const values = value === undefined ? [] : Array.isArray(value) ? value : [value];
    const ids = values.map(Number);
    if (ids.some(id => !Number.isInteger(id) || id < 1)) return null;
    return [...new Set(ids)];
}

async function validarCursos(ids, transaction) {
    const cursos = ids.length
        ? await Curso.findAll({ where: { id: ids }, attributes: ['id'], transaction })
        : [];
    return cursos.length === ids.length;
}

function renderBootstrapError(res, mensaje, status = 400) {
    return res.status(status).render('auth/admin_login', { mensaje });
}

module.exports = {
    home: async (req, res) => {
        try {
            const administrador = await Usuario.findOne({ where: { rol: 'administrador' }, attributes: ['id'] });
            return res.redirect(administrador ? '/auth/login' : '/auth/admin_login');
        } catch (error) {
            console.error(error);
            return res.status(503).send('No se pudo comprobar el estado de la base de datos');
        }
    },

    adminSetupForm: async (req, res) => {
        try {
            const administrador = await Usuario.findOne({ where: { rol: 'administrador' }, attributes: ['id'] });
            if (administrador) return res.redirect('/auth/login');
            return res.render('auth/admin_login', { mensaje: null });
        } catch (error) {
            console.error(error);
            return res.status(503).send('No se pudo comprobar el estado de la base de datos');
        }
    },

    createFirstAdmin: async (req, res) => {
        const nombre = String(req.body.nombre || '').trim();
        const email = String(req.body.email || '').trim().toLowerCase();
        const password = String(req.body.contrasena || '');

        if (!nombre || nombre.length > 100) {
            return renderBootstrapError(res, 'El nombre es obligatorio y admite hasta 100 caracteres');
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 100) {
            return renderBootstrapError(res, 'Introduce un correo electrónico válido');
        }
        if (password.length < 12) {
            return renderBootstrapError(res, 'La contraseña debe tener al menos 12 caracteres');
        }

        let transaction;
        let lockAcquired = false;
        try {
            transaction = await sequelize.transaction();
            const lockResult = await sequelize.query(
                'SELECT GET_LOCK(:lockName, 10) AS acquired',
                {
                    replacements: { lockName: bootstrapLockName },
                    transaction,
                    type: QueryTypes.SELECT
                }
            );

            lockAcquired = Number(lockResult[0] && lockResult[0].acquired) === 1;
            if (!lockAcquired) {
                await transaction.rollback();
                transaction = null;
                return renderBootstrapError(res, 'No se pudo reservar la creación inicial. Inténtalo de nuevo.', 503);
            }

            const administrador = await Usuario.findOne({
                where: { rol: 'administrador' },
                transaction,
                lock: transaction.LOCK.UPDATE
            });
            if (administrador) {
                await sequelize.query('SELECT RELEASE_LOCK(:lockName)', {
                    replacements: { lockName: bootstrapLockName },
                    transaction,
                    type: QueryTypes.SELECT
                });
                lockAcquired = false;
                await transaction.commit();
                transaction = null;
                return res.redirect('/auth/login');
            }

            const existente = await Usuario.findOne({ where: { email }, transaction });
            if (existente) {
                await sequelize.query('SELECT RELEASE_LOCK(:lockName)', {
                    replacements: { lockName: bootstrapLockName },
                    transaction,
                    type: QueryTypes.SELECT
                });
                lockAcquired = false;
                await transaction.commit();
                transaction = null;
                return renderBootstrapError(res, 'Ese correo ya está registrado. Usa otro correo.');
            }

            const contrasena = await bcrypt.hash(password, 12);
            await Usuario.create({ nombre, email, contrasena, rol: 'administrador' }, { transaction });

            await sequelize.query('SELECT RELEASE_LOCK(:lockName)', {
                replacements: { lockName: bootstrapLockName },
                transaction,
                type: QueryTypes.SELECT
            });
            lockAcquired = false;
            await transaction.commit();
            transaction = null;

            return res.redirect('/auth/login');
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return renderBootstrapError(res, 'Ese correo ya está registrado. Usa otro correo.', 409);
            }
            console.error(error);
            return renderBootstrapError(res, 'No se pudo crear el administrador inicial', 500);
        } finally {
            if (transaction && !transaction.finished) {
                if (lockAcquired) {
                    try {
                        await sequelize.query('SELECT RELEASE_LOCK(:lockName)', {
                            replacements: { lockName: bootstrapLockName },
                            transaction,
                            type: QueryTypes.SELECT
                        });
                    } catch (error) {
                        console.error('No se pudo liberar el bloqueo de creación inicial:', error);
                    }
                }
                await transaction.rollback();
            }
        }
    },

    panel: async (req, res) => {
        try {
            const usuario = await Usuario.findByPk(req.usuario.id, {
                attributes: ['id', 'nombre', 'email', 'rol']
            });
            if (!usuario || usuario.rol !== 'administrador') {
                return res.status(403).send('Acceso no autorizado');
            }

            const [usuarios, cursos, profesores, totalAdministradores] = await Promise.all([
                Usuario.findAll({
                    attributes: ['id', 'nombre', 'email', 'rol'],
                    include: [{
                        model: Curso,
                        as: 'cursosMatriculados',
                        attributes: ['id', 'titulo'],
                        through: { attributes: [] }
                    }],
                    order: [['id', 'ASC']]
                }),
                Curso.findAll({
                    attributes: ['id', 'titulo', 'profesor_id'],
                    include: [{ model: Usuario, as: 'profesor', attributes: ['id', 'nombre'] }],
                    order: [['id', 'ASC']]
                }),
                Usuario.findAll({
                    where: { rol: 'profesor' },
                    attributes: ['id', 'nombre', 'email'],
                    order: [['nombre', 'ASC']]
                }),
                Usuario.count({ where: { rol: 'administrador' } })
            ]);

            return res.render('paneles/administrador', { usuario, usuarios, cursos, profesores, totalAdministradores });
        } catch (error) {
            console.error(error);
            return res.status(500).send('Error al cargar la administración de usuarios');
        }
    },

    // 🚀 Nueva función añadida para ver el registro de actividad
    verActividadAlumnos: async (req, res) => {
        try {
            const actividades = await RegistroActividad.findAll({
                include: [{ model: Usuario, attributes: ['nombre', 'email', 'rol'] }],
                order: [['createdAt', 'DESC']],
                limit: 50
            });

            return res.render('paneles/admin-actividad', { usuario: req.usuario, actividades });
        } catch (error) {
            console.error(error);
            return res.status(500).send('Error al cargar el registro de actividad');
        }
    },

    crearUsuario: async (req, res) => {
        let transaction;
        try {
            const nombre = String(req.body.nombre || '').trim();
            const email = String(req.body.email || '').trim().toLowerCase();
            const password = String(req.body.contrasena || '');
            const rol = String(req.body.rol || '');
            const cursoIds = normalizarIdsCurso(req.body.curso_ids);

            if (!nombre || nombre.length > 100) {
                return res.status(400).json({ mensaje: 'El nombre es obligatorio y admite hasta 100 caracteres' });
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 100) {
                return res.status(400).json({ mensaje: 'Introduce un correo electrónico válido' });
            }
            if (password.length < 12) {
                return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 12 caracteres' });
            }
            if (!rolesAsignables.includes(rol)) {
                return res.status(400).json({ mensaje: 'El rol seleccionado no se puede asignar' });
            }
            if (cursoIds === null || (cursoIds.length && rol !== 'alumno')) {
                return res.status(400).json({ mensaje: 'Solo se pueden matricular alumnos en cursos desde este formulario' });
            }

            const contrasena = await bcrypt.hash(password, 12);
            transaction = await sequelize.transaction();
            if (!(await validarCursos(cursoIds, transaction))) {
                await transaction.rollback();
                transaction = null;
                return res.status(400).json({ mensaje: 'Uno o más cursos seleccionados no existen' });
            }
            const existente = await Usuario.findOne({ where: { email }, transaction });
            if (existente) {
                await transaction.rollback();
                transaction = null;
                return res.status(409).json({ mensaje: 'El correo ya está registrado' });
            }

            const usuario = await Usuario.create({ nombre, email, contrasena, rol }, { transaction });
            if (rol === 'alumno' && cursoIds.length) {
                await Matricula.bulkCreate(cursoIds.map(curso_id => ({ curso_id, alumno_id: usuario.id })), { transaction });
            }
            await transaction.commit();
            transaction = null;

            return res.status(201).json({
                mensaje: 'Usuario creado correctamente',
                usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
            });
        } catch (error) {
            if (transaction && !transaction.finished) await transaction.rollback();
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({ mensaje: 'El correo ya está registrado' });
            }
            console.error(error);
            return res.status(500).json({ mensaje: 'Error al crear el usuario' });
        }
    },

    actualizarUsuario: async (req, res) => {
        let transaction;
        try {
            const id = Number(req.params.id);
            const nombre = String(req.body.nombre || '').trim();
            const email = String(req.body.email || '').trim().toLowerCase();
            const password = String(req.body.contrasena || '');
            const rol = String(req.body.rol || '');
            const cursoIds = normalizarIdsCurso(req.body.curso_ids);

            if (!Number.isInteger(id) || id < 1) return res.status(400).json({ mensaje: 'ID de usuario inválido' });
            if (!nombre || nombre.length > 100) return res.status(400).json({ mensaje: 'Nombre inválido' });
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 100) {
                return res.status(400).json({ mensaje: 'Introduce un correo electrónico válido' });
            }
            if (password && password.length < 12) {
                return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 12 caracteres' });
            }
            if (!rolesAsignables.includes(rol) || cursoIds === null || (cursoIds.length && rol !== 'alumno')) {
                return res.status(400).json({ mensaje: 'Rol o cursos seleccionados no válidos' });
            }

            transaction = await sequelize.transaction();
            const usuario = await Usuario.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
            if (!usuario) {
                await transaction.rollback();
                transaction = null;
                return res.status(404).json({ mensaje: 'Usuario no encontrado' });
            }
            if (usuario.rol === 'profesor' && rol !== 'profesor') {
                const cursosImpartidos = await Curso.count({ where: { profesor_id: id }, transaction });
                if (cursosImpartidos) {
                    await transaction.rollback();
                    transaction = null;
                    return res.status(409).json({ mensaje: 'Reasigna sus cursos a otro profesor antes de cambiar su rol' });
                }
            }
            if (usuario.rol === 'administrador' && rol !== 'administrador') {
                const administradores = await Usuario.count({ where: { rol: 'administrador' }, transaction });
                if (administradores <= 1) {
                    await transaction.rollback();
                    transaction = null;
                    return res.status(409).json({ mensaje: 'Debe permanecer al menos un administrador' });
                }
            }
            if (!(await validarCursos(cursoIds, transaction))) {
                await transaction.rollback();
                transaction = null;
                return res.status(400).json({ mensaje: 'Uno o más cursos seleccionados no existen' });
            }

            const correoExistente = await Usuario.findOne({ where: { email }, transaction });
            if (correoExistente && correoExistente.id !== usuario.id) {
                await transaction.rollback();
                transaction = null;
                return res.status(409).json({ mensaje: 'El correo ya está registrado' });
            }

            usuario.nombre = nombre;
            usuario.email = email;
            usuario.rol = rol;
            if (password) usuario.contrasena = await bcrypt.hash(password, 12);
            await usuario.save({ transaction });

            await Matricula.destroy({ where: { alumno_id: usuario.id }, transaction });
            if (rol === 'alumno' && cursoIds.length) {
                await Matricula.bulkCreate(cursoIds.map(curso_id => ({ curso_id, alumno_id: usuario.id })), { transaction });
            }

            await transaction.commit();
            transaction = null;
            return res.json({ mensaje: 'Usuario actualizado correctamente' });
        } catch (error) {
            if (transaction && !transaction.finished) await transaction.rollback();
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({ mensaje: 'El correo ya está registrado' });
            }
            console.error(error);
            return res.status(500).json({ mensaje: 'Error al actualizar el usuario' });
        }
    },

    asignarProfesor: async (req, res) => {
        try {
            const cursoId = Number(req.params.cursoId);
            const profesorId = Number(req.body.profesor_id);
            if (!Number.isInteger(cursoId) || cursoId < 1 || !Number.isInteger(profesorId) || profesorId < 1) {
                return res.status(400).json({ mensaje: 'Curso o profesor inválido' });
            }

            const [curso, profesor] = await Promise.all([
                Curso.findByPk(cursoId),
                Usuario.findOne({ where: { id: profesorId, rol: 'profesor' } })
            ]);
            if (!curso) return res.status(404).json({ mensaje: 'Curso no encontrado' });
            if (!profesor) return res.status(400).json({ mensaje: 'Selecciona una cuenta con rol profesor' });

            await curso.update({ profesor_id: profesor.id });
            return res.json({ mensaje: 'Profesor asignado al curso' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ mensaje: 'Error al asignar el profesor' });
        }
    },

    eliminarUsuario: async (req, res) => {
        let transaction;
        try {
            const usuarioId = Number(req.params.id);
            const contrasena = String(req.body.contrasena || '');
            if (!Number.isInteger(usuarioId) || usuarioId < 1) {
                return res.status(400).json({ mensaje: 'ID de usuario inválido' });
            }
            if (!contrasena) {
                return res.status(400).json({ mensaje: 'Escribe tu contraseña de administrador para continuar' });
            }

            transaction = await sequelize.transaction();
            const administrador = await Usuario.findByPk(req.usuario.id, {
                transaction,
                lock: transaction.LOCK.UPDATE
            });
            if (!administrador || administrador.rol !== 'administrador' ||
                !(await bcrypt.compare(contrasena, administrador.contrasena))) {
                await transaction.rollback();
                transaction = null;
                return res.status(401).json({ mensaje: 'La contraseña de administrador no es correcta' });
            }

            if (Number(administrador.id) === usuarioId) {
                await transaction.rollback();
                transaction = null;
                return res.status(409).json({ mensaje: 'No puedes eliminar tu propia cuenta' });
            }

            const usuario = await Usuario.findByPk(usuarioId, { transaction, lock: transaction.LOCK.UPDATE });
            if (!usuario) {
                await transaction.rollback();
                transaction = null;
                return res.status(404).json({ mensaje: 'Usuario no encontrado' });
            }

            if (usuario.rol === 'administrador') {
                const administradores = await Usuario.count({
                    where: { rol: 'administrador' },
                    transaction,
                    lock: transaction.LOCK.UPDATE
                });
                if (administradores <= 1) {
                    await transaction.rollback();
                    transaction = null;
                    return res.status(409).json({ mensaje: 'No se puede eliminar al último administrador' });
                }
            }

            const cursosImpartidos = await Curso.count({ where: { profesor_id: usuarioId }, transaction });
            if (cursosImpartidos) {
                await transaction.rollback();
                transaction = null;
                return res.status(409).json({ mensaje: 'Reasigna sus cursos a otro profesor antes de eliminarlo' });
            }

            await Matricula.destroy({ where: { alumno_id: usuarioId }, transaction });
            await Tarea.destroy({ where: { alumno_id: usuarioId }, transaction });
            await MensajeForo.destroy({ where: { usuario_id: usuarioId }, transaction });
            await ResultadoExamen.destroy({ where: { alumno_id: usuarioId }, transaction });
            await RegistroActividad.update(
                { usuario_id: null },
                { where: { usuario_id: usuarioId }, transaction }
            );
            await usuario.destroy({ transaction });

            await transaction.commit();
            transaction = null;
            return res.json({ mensaje: 'Usuario eliminado; su actividad quedó anonimizada' });
        } catch (error) {
            if (transaction && !transaction.finished) await transaction.rollback();
            console.error(error);
            return res.status(500).json({ mensaje: 'No se pudo eliminar el usuario' });
        }
    }
};