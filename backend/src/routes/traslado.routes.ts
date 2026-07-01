import { Router } from 'express';
import { registrarTraslado } from '../controllers/traslado.controller';

const router = Router();

// Endpoint: POST /api/traslados
router.post('/', registrarTraslado);

export default router;