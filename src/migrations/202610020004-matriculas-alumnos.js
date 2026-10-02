const { DataTypes } = require('sequelize');

const tableName = 'Matriculas';
const definition = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    curso_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Cursos', key: 'id' }
    },
    alumno_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Usuarios', key: 'id' }
    },
    fecha_matricula: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
};

async function ensureUniquePair(queryInterface) {
    const indexes = await queryInterface.showIndex(tableName);
    const uniquePairExists = indexes.some(index =>
        index.unique && index.fields.length === 2 &&
        index.fields.some(field => String(field.attribute || field.name).toLowerCase() === 'curso_id') &&
        index.fields.some(field => String(field.attribute || field.name).toLowerCase() === 'alumno_id')
    );

    if (!uniquePairExists) {
        await queryInterface.addConstraint(tableName, {
            fields: ['curso_id', 'alumno_id'],
            type: 'unique',
            name: 'uniq_matricula_curso_alumno'
        });
    }
}

module.exports = {
    up: async ({ context: queryInterface }) => {
        const tables = await queryInterface.showAllTables();
        const existingName = tables.find(table => {
            const name = typeof table === 'string' ? table : table.tableName || table.table_name;
            return String(name).toLowerCase() === tableName.toLowerCase();
        });

        if (existingName) {
            const actualName = typeof existingName === 'string'
                ? existingName
                : existingName.tableName || existingName.table_name;
            const actualColumns = await queryInterface.describeTable(actualName);
            const missingColumns = Object.keys(definition).filter(column => !actualColumns[column]);
            if (missingColumns.length) {
                throw new Error(`La tabla Matriculas existe pero le faltan columnas: ${missingColumns.join(', ')}.`);
            }
            await ensureUniquePair(queryInterface);
            await queryInterface.sequelize.query(
                'INSERT IGNORE INTO `Matriculas` (`curso_id`, `alumno_id`, `fecha_matricula`) ' +
                'SELECT cursos.id, usuarios.id, NOW() FROM `Cursos` AS cursos ' +
                'INNER JOIN `Usuarios` AS usuarios ON usuarios.rol = :rol',
                { replacements: { rol: 'alumno' } }
            );
            return;
        }

        await queryInterface.createTable(tableName, definition);
        await ensureUniquePair(queryInterface);
        await queryInterface.sequelize.query(
            'INSERT IGNORE INTO `Matriculas` (`curso_id`, `alumno_id`, `fecha_matricula`) ' +
            'SELECT cursos.id, usuarios.id, NOW() FROM `Cursos` AS cursos ' +
            'INNER JOIN `Usuarios` AS usuarios ON usuarios.rol = :rol',
            { replacements: { rol: 'alumno' } }
        );
    },

    down: async () => {
        throw new Error('No se borran matrículas automáticamente para proteger las inscripciones existentes.');
    }
};