const Examen = require('./models/Examen');
const Pregunta = require('./models/Pregunta');
const Respuesta = require('./models/Respuesta');
const Curso = require('./models/Curso');
const Usuario = require('./models/Usuario');
const Foro = require('./models/Foro');
const MensajeForo = require('./models/MensajeForo');
const RegistroActividad = require('./models/RegistroActividad');
const ResultadoExamen = require('./models/ResultadoExamen');
const Matricula = require('./models/Matricula');

Examen.hasMany(Pregunta, { foreignKey: 'examen_id', as: 'Preguntas' });
Pregunta.belongsTo(Examen, { foreignKey: 'examen_id', as: 'Examen' });

Pregunta.hasMany(Respuesta, { foreignKey: 'pregunta_id', as: 'Respuestas' });
Respuesta.belongsTo(Pregunta, { foreignKey: 'pregunta_id', as: 'Pregunta' });

Examen.hasMany(ResultadoExamen, { foreignKey: 'examen_id', as: 'resultados' });
ResultadoExamen.belongsTo(Examen, { foreignKey: 'examen_id', as: 'examen' });
Usuario.hasMany(ResultadoExamen, { foreignKey: 'alumno_id', as: 'resultadosExamenes' });
ResultadoExamen.belongsTo(Usuario, { foreignKey: 'alumno_id', as: 'alumno' });

Usuario.belongsToMany(Curso, {
	through: Matricula,
	foreignKey: 'alumno_id',
	otherKey: 'curso_id',
	as: 'cursosMatriculados'
});
Curso.belongsToMany(Usuario, {
	through: Matricula,
	foreignKey: 'curso_id',
	otherKey: 'alumno_id',
	as: 'alumnosMatriculados'
});
Usuario.hasMany(Curso, { foreignKey: 'profesor_id', as: 'cursosImpartidos' });
Curso.belongsTo(Usuario, { foreignKey: 'profesor_id', as: 'profesor' });

Curso.hasMany(Foro, { foreignKey: 'curso_id', as: 'foros' });
Foro.belongsTo(Curso, { foreignKey: 'curso_id', as: 'curso' });

Foro.hasMany(MensajeForo, { foreignKey: 'foro_id', as: 'mensajes' });
MensajeForo.belongsTo(Foro, { foreignKey: 'foro_id', as: 'foro' });

Usuario.hasMany(MensajeForo, { foreignKey: 'usuario_id', as: 'mensajesForo' });
MensajeForo.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'autor' });

Usuario.hasMany(RegistroActividad, { foreignKey: 'usuario_id', as: 'actividades' });
RegistroActividad.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });