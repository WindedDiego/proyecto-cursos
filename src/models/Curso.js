const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Curso = sequelize.define('Curso', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    titulo: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    profesor_id: { // IMPORTANTE: Con guion bajo igual que en HeidiSQL
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'Cursos',
    timestamps: false
});

module.exports = Curso;