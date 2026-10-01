const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const RegistroActividad = sequelize.define('RegistroActividad', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    curso_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    recurso_tipo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'general'
    },
    recurso_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    hora_entrada: {
        type: DataTypes.DATE,
        allowNull: false
    },
    hora_salida: {
        type: DataTypes.DATE,
        allowNull: true
    },
    recurso: {
        type: DataTypes.STRING(150),
        allowNull: false
    }
}, {
    tableName: 'Registro_Actividad',
    timestamps: false,
    indexes: [] // Evita que cree restricciones automáticas conflictivas
});

module.exports = RegistroActividad;