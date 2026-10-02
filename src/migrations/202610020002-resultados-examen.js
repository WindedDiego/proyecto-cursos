const { resultsTable, getExistingTableNames, validateTable } = require('./schema');

module.exports = {
    up: async ({ context: queryInterface }) => {
        const existingTables = await getExistingTableNames(queryInterface);
        const existingName = existingTables.get('resultados_examen');

        if (existingName) {
            await validateTable(queryInterface, existingName, resultsTable);
            return;
        }

        await queryInterface.createTable('Resultados_Examen', resultsTable);
    },

    down: async () => {
        throw new Error('La migración de resultados no se revierte automáticamente para proteger calificaciones.');
    }
};