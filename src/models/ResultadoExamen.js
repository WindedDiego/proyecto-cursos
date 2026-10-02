const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const ResultadoExamen = sequelize.define('ResultadoExamen', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    examen_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    alumno_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    aciertos: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    total: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Resultados_Examen',
    freezeTableName: true,
    timestamps: false
});

module.exports = ResultadoExamen;