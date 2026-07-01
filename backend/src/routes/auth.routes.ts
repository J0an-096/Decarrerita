import { Router } from 'express';
import { registrarUsuario, loginUsuario } from '../controllers/auth.controller';

const router = Router();

// Endpoints públicos (No requieren token para entrar)
router.post('/registro', registrarUsuario);
router.post('/login', loginUsuario);

export default router;