# proyecto-cursos
Plataforma de cursos, exámenes, tareas y foros.

## Base de datos

Configura las variables `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_HOST`, `DB_PORT` y `JWT_SECRET` en `.env`.

Ejecuta las migraciones antes de iniciar la aplicación:

```sh
npm run db:migrate
npm start
```

La migración inicial crea el esquema administrado por la aplicación cuando la base está vacía. Si detecta un esquema existente completo, valida tablas, columnas, tipos, nulabilidad y claves foráneas y lo registra sin recrear ni modificar esas tablas. Si detecta un esquema parcial o incompatible, se detiene para evitar cambios automáticos. Las tablas ajenas al modelo actual, como `Opciones`, no se eliminan ni modifican.

Haz un respaldo antes de migrar una base compartida o de producción. Cada cambio futuro del esquema debe añadirse como una nueva migración; la aplicación no sincroniza ni altera tablas durante el arranque.
