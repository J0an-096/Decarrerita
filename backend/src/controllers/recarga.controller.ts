import { Request, Response } from 'express';
import prisma from '../config/db';
import { Prisma } from '@prisma/client'; // <-- 1. Importamos los tipos estrictos de Prisma

export const procesarRecarga = async (req: Request, res: Response): Promise<void> => {
    const { idCliente, idBanco, numeroReferencia, monto } = req.body;

    try {
        // Validaciones iniciales
        if (monto <= 0) {
            res.status(400).json({ error: 'El monto debe ser mayor a 0' });
            return;
        }

        // Ejecutar Transacción (ACID) con tipado estricto
        // <-- 2. Le decimos al compilador que 'tx' es exactamente un Prisma.TransactionClient
        const resultado = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            
            // 1. Registrar la recarga
            const nuevaRecarga = await tx.recarga.create({
                data: {
                    id_cliente: idCliente,
                    id_banco: idBanco,
                    numero_referencia: numeroReferencia,
                    monto: monto
                }
            });

            // 2. Actualizar el saldo del cliente
            const clienteActualizado = await tx.cliente.update({
                where: { id_usuario: idCliente },
                data: {
                    saldo_disponible: {
                        increment: monto
                    }
                }
            });

            return { nuevaRecarga, saldoActual: clienteActualizado.saldo_disponible };
        });

        res.status(200).json({
            mensaje: 'Recarga procesada exitosamente',
            datos: resultado
        });

    } catch (error: any) {
        console.error("ERROR DETECTADO POR PRISMA:", error);

        // Prisma arrojará el código P2002 si el número de referencia ya existe
        if (error.code === 'P2002') {
            res.status(409).json({ error: 'El número de referencia ya fue procesado anteriormente' });
            return;
        }
        res.status(500).json({ error: 'Error interno del servidor al procesar la recarga' });
    }
};