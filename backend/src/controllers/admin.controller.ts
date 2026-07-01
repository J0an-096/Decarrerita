import { Request, Response } from 'express';
import prisma from '../config/db';

export const registrarEvaluacionPsicologica = async (req: Request, res: Response): Promise<void> => {
    // 1. Extraemos los datos enviados por el cliente
    const { idChofer, nota, fechaObtencion, estatus } = req.body;
    
    // 2. Extraemos la identidad del usuario desde el Token (Inyectado por el middleware)
    const usuarioAutenticado = (req as any).usuario;

    try {
        // Regla de Negocio: Solo administradores pueden registrar evaluaciones
        if (usuarioAutenticado.rol !== 'Admin' && usuarioAutenticado.rol !== 'Empleado_Administrativo') {
            res.status(403).json({ error: 'Acceso denegado. Se requieren privilegios administrativos.' });
            return;
        }

        // 3. Registrar la evaluación en la base de datos
        const nuevaEvaluacion = await prisma.evaluacion_psicologica.create({
            data: {
                id_chofer: idChofer,
                // El ID del admin lo tomamos del token, evitando que se falsifique en el body
                id_usuario_admin: usuarioAutenticado.idUsuario, 
                nota: nota,
                fecha_obtencion: new Date(fechaObtencion),
                estatus: estatus 
            }
        });

        res.status(201).json({
            mensaje: 'Evaluación psicológica registrada y vinculada al administrador exitosamente',
            datos: nuevaEvaluacion
        });

    } catch (error: any) {
        console.error("ERROR EN EVALUACIÓN PSICOLÓGICA:", error);
        
        if (error.code === 'P2003') {
            res.status(404).json({ error: 'Fallo de integridad: El chofer especificado no existe.' });
            return;
        }

        res.status(500).json({ error: 'Error interno al registrar la evaluación psicológica' });
    }
};

export const registrarRevisionVehicular = async (req: Request, res: Response): Promise<void> => {
    // 1. Extraemos los datos (Nota: tu esquema usa "calificacion" en vez de "nota" para vehículos)
    const { placaVehiculo, calificacion, fechaObtencion, estatus } = req.body;
    
    // 2. Extraemos la identidad del usuario desde el Token
    const usuarioAutenticado = (req as any).usuario;

    try {
        // Regla de Negocio: Solo administradores
        if (usuarioAutenticado.rol !== 'Admin' && usuarioAutenticado.rol !== 'Empleado_Administrativo') {
            res.status(403).json({ error: 'Acceso denegado. Se requieren privilegios administrativos.' });
            return;
        }

        // 3. Registrar la revisión en la base de datos
        const nuevaRevision = await prisma.revision_vehicular.create({
            data: {
                placa_vehiculo: placaVehiculo,
                id_usuario_admin: usuarioAutenticado.idUsuario, 
                calificacion: calificacion,
                fecha_obtencion: new Date(fechaObtencion),
                estatus: estatus 
            }
        });

        res.status(201).json({
            mensaje: 'Revisión vehicular registrada exitosamente',
            datos: nuevaRevision
        });

    } catch (error: any) {
        console.error("ERROR EN REVISIÓN VEHICULAR:", error);
        
        // P2003 = Violación de clave foránea (La placa no existe en la tabla vehiculo)
        if (error.code === 'P2003') {
            res.status(404).json({ error: 'Fallo de integridad: El vehículo especificado no existe.' });
            return;
        }

        res.status(500).json({ error: 'Error interno al registrar la revisión vehicular' });
    }
};

export const obtenerReporteGanancias = async (req: Request, res: Response): Promise<void> => {
    // 1. Extraemos la identidad del usuario desde el Token
    const usuarioAutenticado = (req as any).usuario;

    try {
        // Regla de Negocio: Los reportes financieros son clasificados. Solo Admins.
        if (usuarioAutenticado.rol !== 'Admin' && usuarioAutenticado.rol !== 'Empleado_Administrativo') {
            res.status(403).json({ error: 'Acceso denegado. Nivel de autorización insuficiente para ver finanzas.' });
            return;
        }

        // 2. Ejecutar la consulta DQL (Data Query Language) con Prisma
        const metricas = await prisma.traslado.aggregate({
            _sum: {
                costo_total: true,
                ganancia_empresa: true,
                ganancia_chofer: true
            },
            _count: {
                id_traslado: true // Contamos cuántos viajes exitosos hay
            },
            where: {
                estatus: 'Finalizado' // Excluimos viajes cancelados o en proceso
            }
        });

        // 3. Formatear la respuesta
        // Prisma devuelve 'null' si no hay viajes, así que usamos "|| 0" como respaldo
        res.status(200).json({
            mensaje: 'Reporte de ganancias generado exitosamente',
            datos: {
                viajesCompletados: metricas._count.id_traslado,
                facturacionBruta: metricas._sum.costo_total || 0,
                gananciaNetaEmpresa: metricas._sum.ganancia_empresa || 0,
                dineroChoferes: metricas._sum.ganancia_chofer || 0
            }
        });

    } catch (error: any) {
        console.error("ERROR EN REPORTE DE GANANCIAS:", error);
        res.status(500).json({ error: 'Error interno al calcular el reporte financiero' });
    }
};