const { DataTypes } = require('sequelize');

const rolesBase = ['profesor', 'alumno', 'observador'];
const rolAdministrador = 'administrador';

function leerRoles(type) {
    const match = String(type).match(/^ENUM\((.*)\)$/i);
    if (!match) return null;

    return [...match[1].matchAll(/'((?:''|[^'])*)'/g)].map(([, value]) => value.replace(/''/g, "'"));
}

module.exports = {
    up: async ({ context: queryInterface }) => {
        const tables = await queryInterface.showAllTables();
        const usuariosTable = tables.find(table => {
            const name = typeof table === 'string' ? table : table.tableName || table.table_name;
            return String(name).toLowerCase() === 'usuarios';
        });

        if (!usuariosTable) {
            throw new Error('No existe la tabla Usuarios; no se modificó el esquema.');
        }

        const tableName = typeof usuariosTable === 'string'
            ? usuariosTable
            : usuariosTable.tableName || usuariosTable.table_name;
        const columns = await queryInterface.describeTable(tableName);
        const currentRoles = columns.rol && leerRoles(columns.rol.type);

        if (!currentRoles || rolesBase.some(role => !currentRoles.includes(role))) {
            throw new Error('El ENUM Usuarios.rol no coincide con los roles esperados; no se modificó.');
        }

        if (currentRoles.includes(rolAdministrador)) return;

        await queryInterface.changeColumn(tableName, 'rol', {
            type: DataTypes.ENUM(...rolesBase, rolAdministrador),
            allowNull: false
        });
    },

    down: async () => {
        throw new Error('No se elimina el rol administrador automáticamente para evitar dejar cuentas inválidas.');
    }
};