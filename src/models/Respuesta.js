const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Respuesta = sequelize.define('Respuesta', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    pregunta_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    texto: {
        type: DataTypes.STRING,
        allowNull: false
    },
    correcta: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'Respuestas',
    freezeTableName: true,
    timestamps: false
});

module.exports = Respuesta;
