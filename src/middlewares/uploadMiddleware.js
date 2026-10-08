const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { USA_CLOUDINARY, MAX_MB_CLOUDINARY, subirBuffer } = require('../storage');

// Carpeta raíz de archivos subidos (solo se usa con STORAGE_DRIVER=local): <raíz del proyecto>/uploads
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Solo se admiten formatos "pasivos": nunca HTML, SVG, JS ni otros formatos que el navegador
// pueda ejecutar desde el propio dominio de la aplicación.
const EXTENSIONES_PERMITIDAS = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.odt', '.ods', '.odp',
    '.txt', '.md', '.csv', '.zip', '.rar', '.7z',
    '.png', '.jpg', '.jpeg', '.gif', '.webp',
    '.mp4', '.webm', '.mp3'
];

// Límite (MB) por tipo de subida. Con Cloudinary (plan gratuito) ningún archivo puede pasar de 10 MB.
const LIMITES_BASE_MB = { entregas: 10, contenidos: 50, tareas: 10 };
const LIMITES_MB = USA_CLOUDINARY
    ? Object.fromEntries(Object.entries(LIMITES_BASE_MB).map(([clave, mb]) => [clave, Math.min(mb, MAX_MB_CLOUDINARY)]))
    : LIMITES_BASE_MB;

const crearSubida = (subcarpeta, maxMB) => {
    let storage;

    if (USA_CLOUDINARY) {
        // El archivo se recibe en memoria y se envía a Cloudinary (no se escribe nada en disco)
        storage = multer.memoryStorage();
    } else {
        const destino = path.join(UPLOADS_DIR, subcarpeta);
        fs.mkdirSync(destino, { recursive: true });
        storage = multer.diskStorage({
            destination: (req, file, cb) => cb(null, destino),
            filename: (req, file, cb) => {
                // Nombre aleatorio: evita colisiones y que el nombre original manipule la ruta
                const ext = path.extname(file.originalname).toLowerCase();
                cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
            }
        });
    }

    const upload = multer({
        storage,
        limits: { fileSize: maxMB * 1024 * 1024, files: 1 },
        fileFilter: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            if (!EXTENSIONES_PERMITIDAS.includes(ext)) {
                const error = new Error('TIPO_NO_PERMITIDO');
                error.code = 'TIPO_NO_PERMITIDO';
                return cb(error);
            }
            cb(null, true);
        }
    }).single('archivo');

    // No lanza errores: deja el mensaje en req.errorSubida para que el controlador
    // vuelva a mostrar el formulario con el aviso en lugar de una página de error.
    return (req, res, next) => {
        upload(req, res, async (err) => {
            if (err) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    req.errorSubida = `El archivo supera el tamaño máximo de ${maxMB} MB.`;
                } else if (err.code === 'TIPO_NO_PERMITIDO') {
                    req.errorSubida = `Tipo de archivo no permitido. Formatos admitidos: ${EXTENSIONES_PERMITIDAS.join(', ')}.`;
                } else {
                    console.error('Error al subir archivo:', err);
                    req.errorSubida = 'No se pudo subir el archivo. Inténtalo de nuevo.';
                }
                return next();
            }

            // Con Cloudinary solo se sube el archivo si el usuario eligió "Subir un archivo"
            // (así no quedan archivos huérfanos cuando eligió URL o ninguno).
            if (USA_CLOUDINARY && req.file) {
                const tipo = String((req.body && req.body.tipo_origen) || '').trim();
                if (tipo !== 'archivo') {
                    req.file = undefined;
                    return next();
                }

                try {
                    const subido = await subirBuffer(req.file.buffer, {
                        subcarpeta,
                        originalname: req.file.originalname
                    });
                    req.file.buffer = undefined; // libera la memoria
                    req.file.urlPublica = subido.url;
                    req.file.remoto = { public_id: subido.public_id, resource_type: subido.resource_type };
                } catch (error) {
                    console.error('Error al subir archivo a Cloudinary:', error);
                    req.file = undefined;
                    req.errorSubida = 'No se pudo subir el archivo al almacenamiento remoto. Inténtalo de nuevo.';
                }
            }

            next();
        });
    };
};

module.exports = {
    UPLOADS_DIR,
    EXTENSIONES_PERMITIDAS,
    LIMITES_MB,
    subirEntrega: crearSubida('entregas', LIMITES_MB.entregas),
    subirContenido: crearSubida('contenidos', LIMITES_MB.contenidos),
    subirAdjuntoTarea: crearSubida('tareas', LIMITES_MB.tareas)
};
