const fs = require('fs');
const { borrarRemoto } = require('../storage');

// Solo http/https: evita enlaces tipo "javascript:..." guardados en la base de datos
const esUrlHttp = (valor) => {
    try {
        const url = new URL(String(valor).trim());
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (error) {
        return false;
    }
};

// Borra el archivo recién subido (por ejemplo, si la validación falla después):
// del disco con STORAGE_DRIVER=local, o de Cloudinary con STORAGE_DRIVER=cloudinary.
const descartarArchivo = (req) => {
    if (!req.file) return;
    if (req.file.path) {
        fs.unlink(req.file.path, () => {});
    }
    if (req.file.remoto) {
        borrarRemoto(req.file.remoto); // sin esperar: no bloquea la respuesta y nunca lanza error
    }
};

/**
 * Decide qué se guarda en la base de datos (una URL o la ruta de un archivo subido).
 * Formulario esperado: radio "tipo_origen" (url | archivo | ninguno), texto "url", fichero "archivo".
 * Devuelve { valor, error }. Si hay error, el archivo subido ya se ha borrado (disco o Cloudinary).
 */
const resolverOrigen = (req, subcarpeta, { obligatorio }) => {
    const fallar = (error) => {
        descartarArchivo(req);
        return { valor: null, error };
    };

    if (req.errorSubida) return fallar(req.errorSubida);

    const tipo = String((req.body && req.body.tipo_origen) || (obligatorio ? '' : 'ninguno')).trim();

    if (tipo === 'archivo') {
        if (!req.file) return fallar('Selecciona un archivo para subir.');
        // Cloudinary: URL https completa. Local: ruta /uploads/<carpeta>/<nombre> (como siempre)
        const valor = req.file.urlPublica || `/uploads/${subcarpeta}/${req.file.filename}`;
        return { valor, error: null };
    }

    // Si no se eligió archivo, cualquier fichero que llegara se descarta
    descartarArchivo(req);

    if (tipo === 'url') {
        const url = String((req.body && req.body.url) || '').trim();
        if (!url) return fallar('Indica la URL.');
        if (!esUrlHttp(url)) return fallar('La URL debe empezar por http:// o https://');
        if (url.length > 255) return fallar('La URL es demasiado larga (máximo 255 caracteres).');
        return { valor: url, error: null };
    }

    if (tipo === 'ninguno' && !obligatorio) return { valor: null, error: null };

    return fallar('Elige si quieres indicar una URL o subir un archivo.');
};

module.exports = { esUrlHttp, descartarArchivo, resolverOrigen };
