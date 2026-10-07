const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Carpeta raíz de archivos subidos: <raíz del proyecto>/uploads
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Solo se admiten formatos "pasivos": nunca HTML, SVG, JS ni otros formatos que el navegador
// pueda ejecutar desde el propio dominio de la aplicación.
const EXTENSIONES_PERMITIDAS = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.odt', '.ods', '.odp',
    '.txt', '.md', '.csv', '.zip', '.rar', '.7z',
    '.png', '.jpg', '.jpeg', '.gif', '.webp',
    '.mp4', '.webm', '.mp3'
];

// Límite (MB) por tipo de subida
const LIMITES_MB = { entregas: 10, contenidos: 50, tareas: 10 };

const crearSubida = (subcarpeta, maxMB) => {
    const destino = path.join(UPLOADS_DIR, subcarpeta);
    fs.mkdirSync(destino, { recursive: true });

    const upload = multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => cb(null, destino),
            filename: (req, file, cb) => {
                // Nombre aleatorio: evita colisiones y que el nombre original manipule la ruta
                const ext = path.extname(file.originalname).toLowerCase();
                cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
            }
        }),
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
        upload(req, res, (err) => {
            if (err) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    req.errorSubida = `El archivo supera el tamaño máximo de ${maxMB} MB.`;
                } else if (err.code === 'TIPO_NO_PERMITIDO') {
                    req.errorSubida = `Tipo de archivo no permitido. Formatos admitidos: ${EXTENSIONES_PERMITIDAS.join(', ')}.`;
                } else {
                    console.error('Error al subir archivo:', err);
                    req.errorSubida = 'No se pudo subir el archivo. Inténtalo de nuevo.';
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
