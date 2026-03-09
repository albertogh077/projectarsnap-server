/*
* index.js
*
* Servidor backend de la aplicación
* 
* Autor: Alberto Gallegos H.
* Última modificación: 2026-01-26
*/

import express from 'express';       // Framework web express
import helmet from 'helmet';         // Seguridad HTTP
import dotenv from 'dotenv';         // Cargar variables de entorno
import path from 'path';             // Utilidades de rutas
import { fileURLToPath } from 'url'; // Obtener __dirname en ES modules
import router from './routes.js';    // Rutas definidas
import cors from 'cors';             // CORS en ES modules

// Configuración para leer el .env.local que está en la raíz
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

// Inicialización del servidor
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());         // habilita CORS para todos los orígenes
app.use(helmet());       // Seguridad
app.use(express.json()); // Parseo de JSON

// Uso de rutas
app.use('/', router);

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor backend listo en http://localhost:${PORT}`);
});
