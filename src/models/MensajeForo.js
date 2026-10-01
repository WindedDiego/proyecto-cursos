const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const MensajeForo = sequelize.define('MensajeForo', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    foro_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    contenido: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    fecha: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'Mensajes_Foro',
    timestamps: false
});

module.exports = MensajeForo;