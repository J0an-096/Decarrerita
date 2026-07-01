import { Router } from 'express';
import { procesarRecarga } from '../controllers/recarga.controller';

const router = Router();

// Endpoint: POST /api/recargas
router.post('/', procesarRecarga);

export default router;