require('dotenv').config();const sequelize = require('./database');
const express = require('express');
const app = express();


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
