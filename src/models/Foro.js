const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Foro = sequelize.define('Foro', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    curso_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    titulo: {
        type: DataTypes.STRING(150),
        allowNull: false
    }
}, {
    tableName: 'Foros',
    timestamps: false
});

module.exports = Foro;