/*
* routes.js
*
* Rutas de la aplicación definidas
* 
* Autor: Alberto Gallegos H.
* Última modificación: 2026-01-26
*/

// Importar dependencias necesarias
import { Router } from 'express';                    // Router de Express
import * as TestController from './controllers.js';  // Controladores

// Inicializar el router
const router = Router();

// Definición de rutas
// 01. Ruta GET / - Página de inicio
router.get('/', TestController.getHome);

// 02. Ruta POST /test - Endpoint de prueba
// Regresa el número incrementado en 1
router.post('/test', TestController.postTest);

// 03. Ruta GET /prueba - Endpoint de prueba
// Regresa el número 10
router.get('/prueba', TestController.getPrueba);

// Exportar el router
export default router;
