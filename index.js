/*
* index.js
*
* Servidor backend de la aplicación
* 
* Autor: Alberto Gallegos H.
* Última modificación: 2026-01-26
*/

import express from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './routes.js';
import cors from 'cors';
import { cleanupExpired } from './upload.js';

// Configuración para leer el .env.local que está en la raíz
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Inicialización del servidor
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin })); // CORS restringido al origen permitido
app.use(helmet());       // Seguridad
app.use(express.json()); // Parseo de JSON

// Uso de rutas
app.use('/', router);

// Manejo de errores global
app.use((err, req, res, next) => {
  // Errores de Multer
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ status: 'error', message: 'Archivo demasiado grande (máx 10 MB)' });
  }
  const status = err.status ?? err.statusCode ?? 500;
  const message = status < 500 ? err.message : 'Error interno del servidor';
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${status}: ${err.message}`);
  res.status(status).json({ status: 'error', message });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor backend listo en http://localhost:${PORT}`);
  // Limpieza de fotos expiradas cada 10 minutos
  setInterval(cleanupExpired, 10 * 60 * 1000);
});
