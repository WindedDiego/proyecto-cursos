// Asociaciones entre modelos (Módulo de exámenes)

const Examen = require('./models/Examen');
const Pregunta = require('./models/Pregunta');
const Respuesta = require('./models/Respuesta');
const Curso = require('./models/Curso');
const Usuario = require('./models/Usuario');
const Foro = require('./models/Foro');
const MensajeForo = require('./models/MensajeForo');
const RegistroActividad = require('./models/RegistroActividad');

Examen.hasMany(Pregunta, { foreignKey: 'examen_id', sourceKey: 'id' });
Pregunta.belongsTo(Examen, { foreignKey: 'examen_id', targetKey: 'id' });

Pregunta.hasMany(Respuesta, { foreignKey: 'pregunta_id', sourceKey: 'id' });
Respuesta.belongsTo(Pregunta, { foreignKey: 'pregunta_id', targetKey: 'id' });

Curso.hasMany(Foro, { foreignKey: 'curso_id', as: 'foros' });
Foro.belongsTo(Curso, { foreignKey: 'curso_id', as: 'curso' });

Foro.hasMany(MensajeForo, { foreignKey: 'foro_id', as: 'mensajes' });
MensajeForo.belongsTo(Foro, { foreignKey: 'foro_id', as: 'foro' });

Usuario.hasMany(MensajeForo, { foreignKey: 'usuario_id', as: 'mensajesForo' });
MensajeForo.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'autor' });

Usuario.hasMany(RegistroActividad, { foreignKey: 'usuario_id', as: 'actividades' });
RegistroActividad.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
