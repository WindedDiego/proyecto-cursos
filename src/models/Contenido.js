const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Curso = require('./Curso');

const Contenido = sequelize.define('Contenido', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    curso_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tipo: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    url_archivo: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'Contenidos',
    timestamps: false
});

// Relación: Un curso tiene muchos contenidos[cite: 7]
Curso.hasMany(Contenido, { foreignKey: 'curso_id', as: 'contenidos' });
Contenido.belongsTo(Curso, { foreignKey: 'curso_id', as: 'curso' });

module.exports = Contenido;