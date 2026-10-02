require('dotenv').config();
const path = require('path');
const { Umzug, SequelizeStorage } = require('umzug');
const sequelize = require('./database');

const migrationGlob = path.join(__dirname, 'migrations', '20*.js').replace(/\\/g, '/');
const umzug = new Umzug({
    migrations: { glob: migrationGlob },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console
});

async function migrate() {
    try {
        await sequelize.authenticate();
        const applied = await umzug.up();
        if (applied.length === 0) {
            console.log('La base de datos ya está al día.');
        }
    } finally {
        await sequelize.close();
    }
}

migrate().catch(error => {
    console.error('Error al ejecutar migraciones:', error.message);
    process.exitCode = 1;
});