const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Tarea = require('./Tarea');
const Usuario = require('./Usuario');

const Entrega = sequelize.define('Entrega', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    tarea_id: {
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
    nota: {
        type: DataTypes.DECIMAL(5,2),
        allowNull: true
    },
    comentario_profesor: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    fecha_envio: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Entregas',
    timestamps: false
});

// Relaciones
Tarea.hasMany(Entrega, { foreignKey: 'tarea_id', as: 'entregas' });
Entrega.belongsTo(Tarea, { foreignKey: 'tarea_id', as: 'tarea' });

Usuario.hasMany(Entrega, { foreignKey: 'alumno_id', as: 'entregasRealizadas' });
Entrega.belongsTo(Usuario, { foreignKey: 'alumno_id', as: 'alumno' });

module.exports = Entrega;