const { DataTypes } = require('sequelize');

module.exports = {
    up: async ({ context: queryInterface }) => {
        const tables = await queryInterface.showAllTables();
        const existing = tables.find(t => {
            const name = typeof t === 'string' ? t : t.tableName || t.table_name;
            return String(name).toLowerCase() === 'respuestas_desarrollo'.toLowerCase();
        });

        if (!existing) {
            await queryInterface.createTable('Respuestas_Desarrollo', {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                    allowNull: false
                },
                examen_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: { model: 'Examenes', key: 'id' }
                },
                pregunta_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: { model: 'Preguntas', key: 'id' }
                },
                alumno_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: { model: 'Usuarios', key: 'id' }
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
                    allowNull: false,
                    defaultValue: DataTypes.NOW
                }
            });
        }
    },

    down: async () => {
        throw new Error('No se revierte automáticamente.');
    }
};