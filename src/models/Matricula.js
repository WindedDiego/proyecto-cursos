const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Matricula = sequelize.define('Matricula', {
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
    fecha_matricula: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Matriculas',
    freezeTableName: true,
    timestamps: false,
    indexes: [{ unique: true, fields: ['curso_id', 'alumno_id'] }]
});

module.exports = Matricula;