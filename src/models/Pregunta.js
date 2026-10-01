const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Pregunta = sequelize.define('Pregunta', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    examen_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    enunciado: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    tipo: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'Preguntas',
    freezeTableName: true,
    timestamps: false
});

module.exports = Pregunta;
