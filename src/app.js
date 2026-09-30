require('dotenv').config();
const sequelize = require('./database');
const cors = require('cors');
const express = require('express');
const app = express();
const path = require('path');

// 👉 Activar EJS y carpeta de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares necesarios para leer JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

// 👉 Importar rutas de autenticación
const authRoutes = require('./routes/auth');

// 👉 Conectar rutas
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Curso online funcionando 🚀');
});

sequelize.authenticate()
  .then(() => console.log('Conexión a la base de datos establecida ✔'))
  .catch(err => console.error('Error al conectar a la base de datos ❌', err));

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
