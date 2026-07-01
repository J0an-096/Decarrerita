import { Router } from 'express';
import { procesarPagoChofer } from '../controllers/pagoChofer.controller';

const router = Router();

// Endpoint: POST /api/pagos-choferes
router.post('/', procesarPagoChofer);

export default router;