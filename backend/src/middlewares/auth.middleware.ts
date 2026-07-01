import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_por_defecto';

export const verificarToken = (req: Request, res: Response, next: NextFunction): void => {
    // 1. Extraer el token de las cabeceras (headers) de la petición HTTP
    const authHeader = req.headers.authorization;

    // 2. Si no hay cabecera o no empieza con "Bearer ", se rechaza la entrada
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Acceso denegado. Token no proporcionado o formato incorrecto.' });
        return;
    }

    // 3. Separar la palabra "Bearer " del token real
    const token = authHeader.split(' ')[1];

    try {
        // 4. Intentar descifrar el token con nuestra llave secreta
        const decodificado = jwt.verify(token, JWT_SECRET);
        
        // 5. Si es válido, guardamos los datos del usuario en la request y lo dejamos pasar
        (req as any).usuario = decodificado;
        next(); // <--- Esta es la instrucción que le dice a Express "déjalo pasar al controlador"

    } catch (error) {
        // Si el token es inventado, fue alterado o ya expiró (pasaron las 8 horas)
        res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};