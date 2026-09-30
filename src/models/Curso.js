const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Curso = sequelize.define('Curso', {
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    profesorId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Curso;
