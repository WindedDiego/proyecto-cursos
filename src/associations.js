// Asociaciones entre modelos (Módulo de exámenes)

const Examen = require('./models/Examen');
const Pregunta = require('./models/Pregunta');
const Respuesta = require('./models/Respuesta');

Examen.hasMany(Pregunta, { foreignKey: 'examen_id', sourceKey: 'id' });
Pregunta.belongsTo(Examen, { foreignKey: 'examen_id', targetKey: 'id' });

Pregunta.hasMany(Respuesta, { foreignKey: 'pregunta_id', sourceKey: 'id' });
Respuesta.belongsTo(Pregunta, { foreignKey: 'pregunta_id', targetKey: 'id' });
