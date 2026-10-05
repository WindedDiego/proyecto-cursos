const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Examen = sequelize.define('Examen', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    curso_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tipo: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'Examenes',
    freezeTableName: true,
    timestamps: false
});

module.exports = Examen;