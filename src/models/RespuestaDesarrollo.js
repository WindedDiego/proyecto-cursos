const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Usuario = require('./Usuario');
const Pregunta = require('./Pregunta');
const Examen = require('./Examen');

const RespuestaDesarrollo = sequelize.define('RespuestaDesarrollo', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    examen_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    pregunta_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    alumno_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    respuesta_texto: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    calificacion: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    feedback: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Respuestas_Desarrollo',
    timestamps: false
});

Usuario.hasMany(RespuestaDesarrollo, { foreignKey: 'alumno_id', as: 'respuestasDesarrollo' });
RespuestaDesarrollo.belongsTo(Usuario, { foreignKey: 'alumno_id', as: 'alumno' });

Pregunta.hasMany(RespuestaDesarrollo, { foreignKey: 'pregunta_id', as: 'respuestasDesarrollo' });
RespuestaDesarrollo.belongsTo(Pregunta, { foreignKey: 'pregunta_id', as: 'pregunta' });

Examen.hasMany(RespuestaDesarrollo, { foreignKey: 'examen_id', as: 'respuestasDesarrollo' });
RespuestaDesarrollo.belongsTo(Examen, { foreignKey: 'examen_id', as: 'examen' });

module.exports = RespuestaDesarrollo;