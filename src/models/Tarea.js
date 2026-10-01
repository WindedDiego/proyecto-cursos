const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Curso = require('./Curso');
const Usuario = require('./Usuario');

const Tarea = sequelize.define('Tarea', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    curso_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    alumno_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    url_archivo: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    fecha_envio: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Tareas',
    timestamps: false
});

// Definir relaciones opcionales para los includes del controlador
Curso.hasMany(Tarea, { foreignKey: 'curso_id', as: 'tareas' });
Tarea.belongsTo(Curso, { foreignKey: 'curso_id', as: 'curso' });

Usuario.hasMany(Tarea, { foreignKey: 'alumno_id', as: 'tareasEntregadas' });
Tarea.belongsTo(Usuario, { foreignKey: 'alumno_id', as: 'alumno' });

module.exports = Tarea;