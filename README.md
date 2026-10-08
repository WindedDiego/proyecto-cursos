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

La migración `202610020004-matriculas-alumnos` crea la relación alumno-curso y matricula a los alumnos existentes en los cursos actuales para conservar su acceso anterior. Después, el administrador puede ajustar las matrículas desde el panel.

Haz un respaldo antes de migrar una base compartida o de producción. Cada cambio futuro del esquema debe añadirse como una nueva migración; la aplicación no sincroniza ni altera tablas durante el arranque.

## Administrador inicial

Después de aplicar las migraciones, visita `/`. Si todavía no existe un administrador, la aplicación redirige a `/auth/admin_login` para crear el primero. Después de crearlo, la ruta raíz redirige a `/auth/login` y el formulario de creación inicial queda cerrado. La contraseña se guarda con bcrypt y debe tener al menos 12 caracteres.

El registro público crea únicamente alumnos. Un administrador autenticado puede crear y editar cuentas de profesor, alumno, observador u otros administradores, matricular alumnos y asignar profesores a cursos desde `/paneles/administrador`. También puede gestionar cursos, contenidos y exámenes, y consultar el panel de actividad.

## Archivos subidos

Los alumnos (entregas), los profesores (contenidos) y los profesores al crear ejercicios (adjunto opcional) pueden indicar una URL o subir un archivo. Dónde se guarda el archivo depende de la variable `STORAGE_DRIVER` del `.env`:

- `STORAGE_DRIVER=local` (por defecto): en disco, en `uploads/entregas/`, `uploads/contenidos/` y `uploads/tareas/`. En la base de datos se guarda la ruta `/uploads/<carpeta>/<nombre>` y `/uploads` solo es accesible con sesión iniciada. `uploads/` no está en git. **En Railway este disco es efímero: los archivos se pierden en cada despliegue.**
- `STORAGE_DRIVER=cloudinary`: en Cloudinary (plan gratuito). Hay que definir `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` (o `CLOUDINARY_URL`). En la base de datos se guarda la URL https completa del archivo. El plan gratuito limita cada archivo a 10 MB, así que los límites por tipo se reducen a ese valor (`CLOUDINARY_MAX_MB`). En cuentas gratuitas hay que activar *Allow delivery of PDF and ZIP files* en Cloudinary (Settings > Security) para poder abrir PDF y archivos comprimidos.

Los nombres se generan aleatoriamente en ambos modos. Los archivos ya guardados en local no se migran solos a Cloudinary.
