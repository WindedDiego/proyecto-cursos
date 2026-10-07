const fs = require('fs');

// Solo http/https: evita enlaces tipo "javascript:..." guardados en la base de datos
const esUrlHttp = (valor) => {
    try {
        const url = new URL(String(valor).trim());
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (error) {
        return false;
    }
};

// Borra del disco el archivo recién subido (por ejemplo, si la validación falla después)
const descartarArchivo = (req) => {
    if (req.file && req.file.path) {
        fs.unlink(req.file.path, () => {});
    }
};

/**
 * Decide qué se guarda en la base de datos (una URL o la ruta de un archivo subido).
 * Formulario esperado: radio "tipo_origen" (url | archivo | ninguno), texto "url", fichero "archivo".
 * Devuelve { valor, error }. Si hay error, el archivo subido ya se ha borrado del disco.
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
        return { valor: `/uploads/${subcarpeta}/${req.file.filename}`, error: null };
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
