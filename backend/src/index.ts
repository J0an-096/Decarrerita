import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import recargaRoutes from './routes/recarga.routes';
import pagoChoferRoutes from './routes/pagoChofer.routes';
import trasladoRoutes from './routes/traslado.routes';
import adminRoutes from './routes/admin.routes';
import { verificarToken } from './middlewares/auth.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Inyección de rutas

// 2. RUTA PÚBLICA (No requiere token, cualquiera puede registrarse o iniciar sesión)
app.use('/api/auth', authRoutes); 

// 3. RUTAS PROTEGIDAS (Le ponemos el guardia "verificarToken" por delante)
app.use('/api/recargas', verificarToken, recargaRoutes);
app.use('/api/pagos-choferes', verificarToken, pagoChoferRoutes);
app.use('/api/traslados', verificarToken, trasladoRoutes);
app.use('/api/admin', verificarToken, adminRoutes);

app.get('/api/status', (req, res) => {
    res.json({ mensaje: 'API de Decarrerita Operativa' });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});