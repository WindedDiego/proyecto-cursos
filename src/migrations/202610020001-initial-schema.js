const { schema, validateExistingBaseline } = require('./schema');

module.exports = {
    up: async ({ context: queryInterface }) => {
        const baselineExists = await validateExistingBaseline(queryInterface);
        if (baselineExists) return;

        for (const [tableName, definition] of Object.entries(schema)) {
            await queryInterface.createTable(tableName, definition);
        }
    },

    down: async () => {
        throw new Error('La migración baseline no se revierte automáticamente para proteger datos existentes.');
    }
};