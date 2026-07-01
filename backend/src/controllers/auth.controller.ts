import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';

// Lee el secreto del archivo .env
const JWT_SECRET = process.env.JWT_SECRET || 'secreto_por_defecto';

export const registrarUsuario = async (req: Request, res: Response): Promise<void> => {
    const { cedula, nombreCompleto, telefono, correo, password, rol } = req.body;

    try {
        // 1. Mapeo de Sanitización (Adaptado a tu BD exacta)
        let rolExacto = '';
        const rolNormalizado = rol.toUpperCase(); // Normalizamos la entrada

        if (rolNormalizado === 'CLIENTE') rolExacto = 'Cliente';
        else if (rolNormalizado === 'CHOFER') rolExacto = 'Chofer';
        else if (rolNormalizado === 'ADMIN') rolExacto = 'Admin';
        else if (rolNormalizado === 'EMPLEADO_ADMINISTRATIVO' || rolNormalizado === 'EMPLEADO') rolExacto = 'Empleado_Administrativo';
        else {
            res.status(400).json({ error: 'El rol proporcionado no es válido en el sistema.' });
            return;
        }

        // 2. Encriptación de nivel industrial (10 rondas de salting)
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 3. Transacción para crear al Usuario y su Perfil Específico
        const nuevoUsuario = await prisma.$transaction(async (tx) => {
            const usuarioBase = await tx.usuario.create({
                data: {
                    cedula,
                    nombre_completo: nombreCompleto,
                    telefono,
                    correo,
                    password_hash: passwordHash,
                    rol: rolExacto // Pasamos el string perfecto que exige PostgreSQL
                }
            });

            // Lógica de herencia: Crear el registro en la tabla hija
            if (usuarioBase.rol === 'Cliente') {
                await tx.cliente.create({ data: { id_usuario: usuarioBase.id_usuario } });
            } else if (usuarioBase.rol === 'Chofer') {
                await tx.chofer.create({ data: { id_usuario: usuarioBase.id_usuario } });
            } else if (usuarioBase.rol === 'Admin' || usuarioBase.rol === 'Empleado_Administrativo') {
                await tx.empleado_administrativo.create({ data: { id_usuario_admin: usuarioBase.id_usuario } });
            }

            return usuarioBase;
        });

        res.status(201).json({
            mensaje: 'Usuario registrado y encriptado con éxito',
            id: nuevoUsuario.id_usuario,
            rol: nuevoUsuario.rol
        });

    } catch (error: any) {
        console.error("ERROR EN REGISTRO:", error);
        if (error.code === 'P2002') {
            res.status(409).json({ error: 'Fallo de seguridad: La cédula o el correo ya existen en el sistema' });
            return;
        }
        res.status(500).json({ error: 'Error interno al registrar el usuario' });
    }
};

export const loginUsuario = async (req: Request, res: Response): Promise<void> => {
    const { correo, password } = req.body;

    try {
        // 1. Buscar al usuario
        const usuario = await prisma.usuario.findUnique({
            where: { correo }
        });

        if (!usuario) {
            res.status(401).json({ error: 'Credenciales inválidas' });
            return; 
        }

        // 2. Comparar Hash
        const passwordValida = await bcrypt.compare(password, usuario.password_hash);

        if (!passwordValida) {
            res.status(401).json({ error: 'Credenciales inválidas' });
            return;
        }

        // 3. Generar el Pasaporte (JWT)
        const token = jwt.sign(
            { idUsuario: usuario.id_usuario, rol: usuario.rol },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(200).json({
            mensaje: 'Autenticación exitosa',
            token: token,
            rol: usuario.rol
        });

    } catch (error: any) {
        console.error("ERROR EN LOGIN:", error);
        res.status(500).json({ error: 'Error interno durante la autenticación' });
    }
};