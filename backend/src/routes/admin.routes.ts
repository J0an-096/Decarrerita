import { Router } from 'express';
import { registrarEvaluacionPsicologica, registrarRevisionVehicular, obtenerReporteGanancias } from '../controllers/admin.controller';

const router = Router();

// Endpoints: POST (Operaciones de registro)
router.post('/evaluacion-psicologica', registrarEvaluacionPsicologica);
router.post('/revision-vehicular', registrarRevisionVehicular);

// Endpoints: GET (Consultas y Reportes)
router.get('/reportes/ganancias', obtenerReporteGanancias);

export default router;