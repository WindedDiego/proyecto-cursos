require('dotenv').config();
const sequelize = require('./database');
const cors = require('cors');
const express = require('express');
const app = express();
const path = require('path');
const AdminController = require('./controllers/AdminController');
require('./associations');

// 👉 Importar middleware de registro de actividad
const activityMiddleware = require('./middlewares/activityMiddleware');
const authMiddleware = require('./middlewares/authMiddleware');
const { UPLOADS_DIR, EXTENSIONES_PERMITIDAS, LIMITES_MB } = require('./middlewares/uploadMiddleware');

// Datos de subida disponibles en todas las vistas (formatos y límites de tamaño)
app.locals.subida = { extensiones: EXTENSIONES_PERMITIDAS, limites: LIMITES_MB };

// 👉 Activar EJS y carpeta de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares necesarios para leer JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.get('/', AdminController.home);
app.use(express.static(path.join(__dirname, '../public')));

// Registra el usuario autenticado cuando la solicitud incluye un token válido.
app.use(authMiddleware.optional);

// Archivos subidos (entregas, contenidos y adjuntos de tareas): solo para usuarios con sesión.
// Se sirven con nosniff y, salvo formatos visualizables (PDF, imágenes, audio/vídeo, texto), como descarga.
const VISUALIZABLES = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.mp4', '.webm', '.mp3', '.txt']);
app.use('/uploads', (req, res, next) => {
  if (!req.usuario) return res.status(401).send('Inicia sesión para acceder a este archivo.');
  next();
}, express.static(UPLOADS_DIR, {
  index: false,
  dotfiles: 'deny',
  setHeaders: (res, filePath) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (!VISUALIZABLES.has(path.extname(filePath).toLowerCase())) {
      res.setHeader('Content-Disposition', 'attachment');
    }
  }
}));

// Registra la entrada y salida de cada recurso dinámico.
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

// ⭐👉 Importar rutas de perfiles
const perfilRoutes = require('./routes/perfil');

// ⭐👉 Importar rutas de paneles
const panelesRoutes = require('./routes/paneles');
const usuariosRoutes = require('./routes/usuarios');

// ⭐👉 Conectar rutas de cursos
app.use('/cursos', cursosRoutes);

// ⭐👉 Conectar rutas de exámenes
app.use('/cursos/:id_curso/examenes', examenesRoutes);

// ⭐👉 Conectar rutas de tareas
app.use('/cursos/:id_curso/tareas', tareasRoutes);

// ⭐👉 Conectar rutas de foros
app.use('/cursos/:id_curso/foros', forosRoutes);

// ⭐👉 Conectar rutas de perfiles (Colocado antes de usuarios admin para evitar bloqueos)
app.use('/usuarios', perfilRoutes);

// ⭐👉 Conectar rutas de paneles
app.use('/paneles', panelesRoutes);
app.use('/usuarios', usuariosRoutes);

// Hacemos que los contenidos dependan (cuelguen) de un curso específico
app.use('/cursos/:id_curso/contenidos', contenidosRoutes);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida ✔');
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al conectar a la base de datos ❌', error);
    process.exitCode = 1;
  }
}

start();