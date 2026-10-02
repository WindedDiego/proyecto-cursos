const { DataTypes } = require('sequelize');

const id = {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
};

const schema = {
    Usuarios: {
        id,
        nombre: { type: DataTypes.STRING(100), allowNull: false },
        email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
        contrasena: { type: DataTypes.STRING(255), allowNull: false },
        rol: { type: DataTypes.ENUM('profesor', 'alumno', 'observador'), allowNull: false }
    },
    Cursos: {
        id,
        titulo: { type: DataTypes.STRING(150), allowNull: false },
        descripcion: { type: DataTypes.TEXT, allowNull: true },
        profesor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Usuarios', key: 'id' }
        }
    },
    Contenidos: {
        id,
        curso_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Cursos', key: 'id' }
        },
        tipo: { type: DataTypes.STRING(50), allowNull: false },
        url_archivo: { type: DataTypes.STRING(255), allowNull: true }
    },
    Examenes: {
        id,
        curso_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Cursos', key: 'id' }
        },
        tipo: { type: DataTypes.STRING(255), allowNull: false }
    },
    Preguntas: {
        id,
        examen_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Examenes', key: 'id' }
        },
        enunciado: { type: DataTypes.TEXT, allowNull: false },
        tipo: { type: DataTypes.STRING(255), allowNull: false }
    },
    Respuestas: {
        id,
        pregunta_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Preguntas', key: 'id' }
        },
        texto: { type: DataTypes.STRING(255), allowNull: false },
        correcta: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false }
    },
    Foros: {
        id,
        curso_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Cursos', key: 'id' }
        },
        titulo: { type: DataTypes.STRING(150), allowNull: false }
    },
    Mensajes_Foro: {
        id,
        foro_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Foros', key: 'id' }
        },
        usuario_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Usuarios', key: 'id' }
        },
        contenido: { type: DataTypes.TEXT, allowNull: false },
        fecha: { type: DataTypes.DATE, allowNull: true }
    },
    Tareas: {
        id,
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
        url_archivo: { type: DataTypes.STRING(255), allowNull: false },
        fecha_envio: { type: DataTypes.DATE, allowNull: true }
    },
    Registro_Actividad: {
        id,
        usuario_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: 'Usuarios', key: 'id' }
        },
        curso_id: { type: DataTypes.INTEGER, allowNull: true },
        recurso_tipo: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'general' },
        recurso_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        hora_entrada: { type: DataTypes.DATE, allowNull: false },
        hora_salida: { type: DataTypes.DATE, allowNull: true },
        recurso: { type: DataTypes.STRING(150), allowNull: false }
    }
};

const resultsTable = {
    id,
    examen_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Examenes', key: 'id' }
    },
    alumno_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Usuarios', key: 'id' }
    },
    aciertos: { type: DataTypes.INTEGER, allowNull: false },
    total: { type: DataTypes.INTEGER, allowNull: false },
    fecha: { type: DataTypes.DATE, allowNull: false }
};

function normalizeTableName(table) {
    if (typeof table === 'string') return table;
    return table.tableName || table.table_name || Object.values(table)[0];
}

async function getExistingTableNames(queryInterface) {
    const tables = await queryInterface.showAllTables();
    return new Map(tables.map(table => {
        const name = normalizeTableName(table);
        return [String(name).toLowerCase(), name];
    }));
}

function normalizeType(type) {
    if (type && type.key === 'ENUM') {
        return `ENUM(${type.values.map(value => `'${value}'`).join(',')})`.toUpperCase();
    }

    return String(type)
        .replace(/[\s`]/g, '')
        .toUpperCase()
        .replace(/^INTEGER$/, 'INT')
        .replace(/^DATE$/, 'DATETIME')
        .replace(/^BOOLEAN$/, 'TINYINT(1)');
}

async function validateTable(queryInterface, tableName, definition) {
    const actual = await queryInterface.describeTable(tableName);
    const missingColumns = Object.keys(definition).filter(column => !actual[column]);
    const mismatchedTypes = Object.entries(definition).filter(([column, expected]) =>
        actual[column] && normalizeType(actual[column].type) !== normalizeType(expected.type)
    ).map(([column]) => column);
    const mismatchedNullability = Object.entries(definition).filter(([column, expected]) =>
        actual[column] && typeof expected.allowNull === 'boolean' &&
        Boolean(actual[column].allowNull) !== expected.allowNull
    ).map(([column]) => column);
    const mismatchedPrimaryKeys = Object.entries(definition).filter(([column, expected]) =>
        actual[column] && expected.primaryKey && !actual[column].primaryKey
    ).map(([column]) => column);
    const expectedForeignKeys = Object.entries(definition).filter(([, expected]) => expected.references);
    const actualForeignKeys = expectedForeignKeys.length
        ? await queryInterface.getForeignKeyReferencesForTable(tableName)
        : [];
    const missingForeignKeys = expectedForeignKeys.filter(([column, expected]) =>
        !actualForeignKeys.some(reference =>
            String(reference.columnName).toLowerCase() === column.toLowerCase() &&
            String(reference.referencedTableName).toLowerCase() === String(expected.references.model).toLowerCase() &&
            String(reference.referencedColumnName).toLowerCase() === String(expected.references.key).toLowerCase()
        )
    ).map(([column]) => column);
    const expectedUniqueColumns = Object.entries(definition)
        .filter(([, expected]) => expected.unique)
        .map(([column]) => column);
    const actualIndexes = expectedUniqueColumns.length
        ? await queryInterface.showIndex(tableName)
        : [];
    const missingUniqueIndexes = expectedUniqueColumns.filter(column =>
        !actualIndexes.some(index => index.unique && index.fields.some(field =>
            String(field.attribute || field.name).toLowerCase() === column.toLowerCase()
        ))
    );

    if (missingColumns.length || mismatchedTypes.length || mismatchedNullability.length ||
        mismatchedPrimaryKeys.length || missingForeignKeys.length || missingUniqueIndexes.length) {
        throw new Error(
            `Esquema incompatible en ${tableName}. ` +
            `Columnas ausentes: ${missingColumns.join(', ') || 'ninguna'}. ` +
            `Tipos distintos: ${mismatchedTypes.join(', ') || 'ninguno'}. ` +
            `Nulabilidad distinta: ${mismatchedNullability.join(', ') || 'ninguna'}. ` +
            `Claves primarias distintas: ${mismatchedPrimaryKeys.join(', ') || 'ninguna'}. ` +
            `Claves foráneas ausentes: ${missingForeignKeys.join(', ') || 'ninguna'}. ` +
            `Índices únicos ausentes: ${missingUniqueIndexes.join(', ') || 'ninguno'}.`
        );
    }
}

async function validateExistingBaseline(queryInterface) {
    const existingTables = await getExistingTableNames(queryInterface);
    const tableNames = Object.keys(schema);
    const presentTables = tableNames.filter(table => existingTables.has(table.toLowerCase()));

    if (presentTables.length === 0) return false;

    const missingTables = tableNames.filter(table => !existingTables.has(table.toLowerCase()));
    if (missingTables.length) {
        throw new Error(
            `La base tiene un esquema parcial; no se modificó. Faltan tablas: ${missingTables.join(', ')}.`
        );
    }

    for (const table of tableNames) {
        await validateTable(queryInterface, existingTables.get(table.toLowerCase()), schema[table]);
    }

    return true;
}

module.exports = {
    schema,
    resultsTable,
    getExistingTableNames,
    validateTable,
    validateExistingBaseline
};