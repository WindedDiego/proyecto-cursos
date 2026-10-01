require('dotenv').config();
const sequelize = require('./database');
const cors = require('cors');
const express = require('express');
const app = express();
const path = require('path');
require('./associations');

// 👉 Importar middleware de registro de actividad
const activityMiddleware = require('./middlewares/activityMiddleware');

// 👉 Activar EJS y carpeta de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares necesarios para leer JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

// ⭐👉 Middleware global: Registra la hora de entrada y salida de CADA RECURSO automáticamente
app.use(activityMiddleware);

// 👉 Importar rutas de autenticación
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// ⭐👉 Importar rutas de cursos
const cursosRoutes = require('./routes/cursos');

// ⭐👉 Importar rutas de contenidos
const contenidosRoutes = require('./routes/contenidos');

// ⭐👉 Importar rutas de exámenes
const examenesRoutes = require('./routes/examenes');

// ⭐👉 Importar rutas de tareas
const tareasRoutes = require('./routes/tareas');

// ⭐👉 Importar rutas de foros
const forosRoutes = require('./routes/foros');

// ⭐👉 Importar rutas de paneles
const panelesRoutes = require('./routes/paneles');

// ⭐👉 Conectar rutas de cursos
app.use('/cursos', cursosRoutes);

// ⭐👉 Conectar rutas de exámenes
app.use('/cursos/:id_curso/examenes', examenesRoutes);

// ⭐👉 Conectar rutas de tareas
app.use('/cursos/:id_curso/tareas', tareasRoutes);

// ⭐👉 Conectar rutas de foros
app.use('/cursos/:id_curso/foros', forosRoutes);

// ⭐👉 Conectar rutas de paneles
app.use('/paneles', panelesRoutes);

// Hacemos que los contenidos dependan (cuelguen) de un curso específico
app.use('/cursos/:id_curso/contenidos', contenidosRoutes);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Curso online funcionando 🚀');
});

sequelize.authenticate()
  .then(() => {
    console.log('Conexión a la base de datos establecida ✔');
    return sequelize.sync({ alter: true });
  })
  .then(() => console.log('Tablas sincronizadas ✔'))
  .catch(err => console.error('Error al conectar a la base de datos ❌', err));

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});