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
    titulo: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    fecha_limite: {
        type: DataTypes.DATE,
        allowNull: true
    },
    url_adjunto: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'Tareas',
    timestamps: false
});

// Relaciones
Curso.hasMany(Tarea, { foreignKey: 'curso_id', as: 'tareas' });
Tarea.belongsTo(Curso, { foreignKey: 'curso_id', as: 'curso' });

module.exports = Tarea;