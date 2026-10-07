const { DataTypes } = require('sequelize');

// Añade Tareas.url_adjunto (URL o ruta del archivo que el profesor adjunta al ejercicio).
// Idempotente: solo actúa si la tabla existe y la columna falta.
module.exports = {
    up: async ({ context: queryInterface }) => {
        const tables = await queryInterface.showAllTables();
        const existe = tables.some(t => {
            const name = typeof t === 'string' ? t : t.tableName || t.table_name;
            return String(name).toLowerCase() === 'tareas';
        });
        if (!existe) return;

        const columnas = await queryInterface.describeTable('Tareas');
        if (!columnas.url_adjunto) {
            await queryInterface.addColumn('Tareas', 'url_adjunto', { type: DataTypes.STRING(255), allowNull: true });
        }
    },

    down: async () => {
        throw new Error('Esta migración no se revierte automáticamente para proteger datos existentes.');
    }
};
