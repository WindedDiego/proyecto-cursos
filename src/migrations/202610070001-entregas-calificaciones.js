const { DataTypes } = require('sequelize');

// Añade nota y comentario_profesor a Entregas solo si faltan (idempotente).
// Si la tabla no existe no hace nada: este cambio no crea tablas.
module.exports = {
    up: async ({ context: queryInterface }) => {
        const tables = await queryInterface.showAllTables();
        const existe = tables.some(t => {
            const name = typeof t === 'string' ? t : t.tableName || t.table_name;
            return String(name).toLowerCase() === 'entregas';
        });
        if (!existe) return;

        const columnas = await queryInterface.describeTable('Entregas');
        if (!columnas.nota) {
            await queryInterface.addColumn('Entregas', 'nota', { type: DataTypes.DECIMAL(5, 2), allowNull: true });
        }
        if (!columnas.comentario_profesor) {
            await queryInterface.addColumn('Entregas', 'comentario_profesor', { type: DataTypes.TEXT, allowNull: true });
        }
    },

    down: async () => {
        throw new Error('Esta migración no se revierte automáticamente para proteger datos existentes.');
    }
};
