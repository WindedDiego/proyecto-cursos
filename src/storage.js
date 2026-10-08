const path = require('path');
const crypto = require('crypto');
const { v2: cloudinary } = require('cloudinary');

// STORAGE_DRIVER=local       -> los archivos se guardan en la carpeta uploads/ (comportamiento original)
// STORAGE_DRIVER=cloudinary  -> los archivos se suben a Cloudinary y en la BBDD se guarda su URL https
const DRIVER = String(process.env.STORAGE_DRIVER || 'local').trim().toLowerCase();

if (!['local', 'cloudinary'].includes(DRIVER)) {
    throw new Error(`STORAGE_DRIVER="${DRIVER}" no es válido. Usa "local" o "cloudinary".`);
}

const USA_CLOUDINARY = DRIVER === 'cloudinary';

// Carpeta dentro de Cloudinary donde se agrupan todos los archivos de la aplicación
const CARPETA_RAIZ = String(process.env.CLOUDINARY_FOLDER || 'proyectoCursos').trim().replace(/^\/+|\/+$/g, '');

// El plan gratuito de Cloudinary admite como máximo 10 MB por archivo
const MAX_MB_CLOUDINARY = Number(process.env.CLOUDINARY_MAX_MB) || 10;

if (USA_CLOUDINARY) {
    const { CLOUDINARY_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

    if (CLOUDINARY_URL) {
        // La librería lee CLOUDINARY_URL (cloudinary://API_KEY:API_SECRET@CLOUD_NAME) por sí sola
        cloudinary.config({ secure: true });
    } else if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
        cloudinary.config({
            cloud_name: CLOUDINARY_CLOUD_NAME,
            api_key: CLOUDINARY_API_KEY,
            api_secret: CLOUDINARY_API_SECRET,
            secure: true
        });
    } else {
        throw new Error(
            'STORAGE_DRIVER=cloudinary pero faltan credenciales. Define CLOUDINARY_CLOUD_NAME, ' +
            'CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET (o CLOUDINARY_URL) en el .env / variables de Railway.'
        );
    }
}

const IMAGENES = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
const VIDEO_AUDIO = ['.mp4', '.webm', '.mp3']; // Cloudinary trata el audio como "video"

// Cloudinary clasifica los archivos en image / video / raw (todo lo demás: pdf, docx, zip...)
const tipoRecurso = (ext) => {
    if (IMAGENES.includes(ext)) return 'image';
    if (VIDEO_AUDIO.includes(ext)) return 'video';
    return 'raw';
};

/**
 * Sube un archivo en memoria a Cloudinary.
 * Devuelve { url, public_id, resource_type }.
 * La carpeta va dentro del public_id (válido tanto en cuentas de carpetas fijas como dinámicas).
 */
const subirBuffer = (buffer, { subcarpeta, originalname }) => new Promise((resolve, reject) => {
    const ext = path.extname(originalname || '').toLowerCase();
    const resource_type = tipoRecurso(ext);
    const nombre = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    // En los recursos "raw" la extensión forma parte del public_id; en image/video la añade Cloudinary
    const public_id = `${CARPETA_RAIZ}/${subcarpeta}/${nombre}${resource_type === 'raw' ? ext : ''}`;

    const stream = cloudinary.uploader.upload_stream(
        { public_id, resource_type, overwrite: false, unique_filename: false, use_filename: false },
        (error, result) => {
            if (error) return reject(error);
            resolve({
                url: result.secure_url,
                public_id: result.public_id,
                resource_type: result.resource_type
            });
        }
    );
    stream.end(buffer);
});

// Borra un archivo de Cloudinary. Nunca lanza error (se usa "sin esperar" para limpiar subidas descartadas)
const borrarRemoto = async ({ public_id, resource_type }) => {
    try {
        await cloudinary.uploader.destroy(public_id, { resource_type, invalidate: true });
    } catch (error) {
        console.error('No se pudo borrar el archivo remoto:', public_id, error.message || error);
    }
};

module.exports = {
    DRIVER,
    USA_CLOUDINARY,
    MAX_MB_CLOUDINARY,
    subirBuffer,
    borrarRemoto
};
