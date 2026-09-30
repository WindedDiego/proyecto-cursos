const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },

  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },

  contraseña: {
    type: DataTypes.STRING,
    allowNull: false
  },

  rol: {
    type: DataTypes.ENUM('alumno', 'profesor', 'observador'),
    allowNull: false,
    defaultValue: 'alumno'
  },

  fecha_registro: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Usuarios',
  timestamps: false
});

module.exports = Usuario;
