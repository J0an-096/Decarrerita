import { Request, Response } from 'express';
import prisma from '../config/db';
import { Prisma } from '@prisma/client';

export const registrarTraslado = async (req: Request, res: Response): Promise<void> => {
    // 1. El frontend solo envía los datos físicos del viaje
    const { idCliente, idChofer, placaVehiculo, origen, destino, distanciaKm } = req.body;

    // Regla de Negocio Centralizada: Tarifa Fija por Kilómetro
    // Puedes cambiar este valor según la moneda que manejes
    const TARIFA_POR_KM = 1.50; 

    try {
        if (distanciaKm <= 0) {
            res.status(400).json({ error: 'La distancia debe ser mayor a 0' });
            return;
        }

        // 2. El motor financiero hace los cálculos estrictos
        const costoTotal = distanciaKm * TARIFA_POR_KM;
        const gananciaEmpresa = costoTotal * 0.30;
        const gananciaChofer = costoTotal * 0.70;

        // 3. Ejecutar Transacción ACID
        const resultado = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            
            // Acción A: Verificar saldo del cliente
            const cliente = await tx.cliente.findUnique({
                where: { id_usuario: idCliente }
            });

            if (!cliente) throw new Error('CLIENTE_NOT_FOUND');
            
            // Prisma devuelve el saldo como un objeto Decimal, lo convertimos a Número para comparar
            if (Number(cliente.saldo_disponible) < costoTotal) {
                throw new Error('FONDOS_INSUFICIENTES');
            }

            // Acción B: Cobrar al cliente (Descontar el costo total de su billetera)
            const clienteActualizado = await tx.cliente.update({
                where: { id_usuario: idCliente },
                data: {
                    saldo_disponible: {
                        decrement: costoTotal
                    }
                }
            });

            // Acción C: Registrar el viaje históricamente y generar la deuda con el chofer
            const nuevoTraslado = await tx.traslado.create({
                data: {
                    id_cliente: idCliente,
                    id_chofer: idChofer,
                    placa_vehiculo: placaVehiculo,
                    origen_puntoa: origen,
                    destino_puntob: destino,
                    distancia_km: distanciaKm,
                    estatus: 'Finalizado',
                    costo_total: costoTotal,
                    ganancia_empresa: gananciaEmpresa,
                    ganancia_chofer: gananciaChofer,
                    estado_pago_chofer: 'Pendiente' // Queda pendiente para el módulo de pagos
                }
            });

            return { 
                viaje: nuevoTraslado, 
                saldoRestanteCliente: clienteActualizado.saldo_disponible 
            };
        });

        res.status(200).json({
            mensaje: 'Traslado registrado y cobrado exitosamente',
            datos: resultado
        });

    } catch (error: any) {
        console.error("ERROR EN TRASLADO:", error);

        if (error.message === 'CLIENTE_NOT_FOUND') {
            res.status(404).json({ error: 'El cliente especificado no existe' });
            return;
        }
        if (error.message === 'FONDOS_INSUFICIENTES') {
            res.status(400).json({ error: 'El cliente no tiene saldo suficiente para pagar este viaje' });
            return;
        }
        if (error.code === 'P2003') {
            res.status(404).json({ error: 'Fallo de integridad: El chofer o el vehículo especificado no existen' });
            return;
        }

        res.status(500).json({ error: 'Error interno al procesar el traslado' });
    }
};