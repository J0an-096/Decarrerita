import { Request, Response } from 'express';
import prisma from '../config/db';
import { Prisma } from '@prisma/client';

export const procesarPagoChofer = async (req: Request, res: Response): Promise<void> => {
    // 1. Extraemos los datos, incluyendo el idAdmin requerido por tu base de datos
    const { idChofer, idAdmin, numeroReferencia, monto } = req.body;

    try {
        if (monto <= 0) {
            res.status(400).json({ error: 'El monto del pago debe ser mayor a 0' });
            return;
        }

        // 2. Ejecutar Transacción ACID
        const resultado = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            
            // Acción A: Registrar el comprobante en la tabla pago_chofer
            const nuevoPago = await tx.pago_chofer.create({
                data: {
                    id_chofer: idChofer,
                    id_usuario_admin: idAdmin,
                    numero_referencia: numeroReferencia,
                    monto_pagado: monto
                }
            });

            // Acción B: Buscar los traslados del chofer y marcarlos como pagados
            const trasladosActualizados = await tx.traslado.updateMany({
                where: {
                    id_chofer: idChofer,
                    estado_pago_chofer: 'Pendiente'
                },
                data: {
                    estado_pago_chofer: 'Pagado'
                }
            });

            return { 
                nuevoPago, 
                viajesLiquidados: trasladosActualizados.count 
            };
        });

        res.status(200).json({
            mensaje: 'Pago registrado y viajes liquidados exitosamente',
            datos: resultado
        });

    } catch (error: any) {
        console.error("ERROR EN PAGO A CHOFER:", error);

        // Validaciones de Claves Foráneas y Únicas basadas en tu esquema
        if (error.code === 'P2002') {
            res.status(409).json({ error: 'Este número de referencia de pago ya fue registrado' });
            return;
        }
        if (error.code === 'P2003') {
            res.status(404).json({ error: 'Fallo de integridad: El chofer o el administrador no existen en la base de datos' });
            return;
        }

        res.status(500).json({ error: 'Error interno al procesar el pago del chofer' });
    }
};