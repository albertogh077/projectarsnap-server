/*
* routes.js
*
* Rutas de la aplicación definidas
* 
* Autor: Alberto Gallegos H.
* Última modificación: 2026-01-26
*/

// Importar dependencias necesarias
import { Router } from 'express';
import * as Controller from './controllers.js';
import { upload } from './upload.js';

// Inicializar el router
const router = Router();

// ─── Rutas existentes ────────────────────────────────────────────────────────
router.get('/', Controller.getHome);
router.post('/test', Controller.postTest);
router.get('/prueba', Controller.getPrueba);

// ─── Photobooth ──────────────────────────────────────────────────────────────
// El campo del FormData DEBE llamarse "photo" para coincidir con upload.single('photo')
router.post('/api/photo', upload.single('photo'), Controller.postPhoto);
router.get('/photo/:id', Controller.getPhotoPage);
router.get('/photo/:id/raw', Controller.getPhotoRaw);
router.get('/photo/:id/qr', Controller.getPhotoQr);
router.get('/api/health', Controller.getHealth);

// Exportar el router
export default router;
