/*
* controllers.js
*
* Controladores de la aplicación para las rutas definidas
* 
* Autor: Alberto Gallegos H.
* Última modificación: 2026-01-26
*/

// Importar dependencias necesarias
import { z } from 'zod';  // Usamos Zod para validación de datos

// Esquema de validación para el endpoint /test
const testSchema = z.object({ 
  number: z.number({ 
    invalid_type_error: "El campo 'number' debe ser un número válido." 
  })
});

// Controlador para la ruta GET /
export const getHome = (req, res) => { // Página de inicio
  res.json({ 
    status: 'success',
    message: 'Servidor de ProjectArSnap funcionando',
    version: '1.0.0'
  });
};

// Controlador para la ruta POST /test
export const postTest = (req, res) => { // Endpoint de prueba
  // Validamos el body con Zod
  const result = testSchema.safeParse(req.body);

  // Si la validación falla, regresamos un error 400 con detalles
  if (!result.success) {
    return res.status(400).json({ 
      status: 'error',
      errors: result.error.format() 
    });
  }

  // Si la validación es exitosa, incrementamos el número y lo regresamos con éxito en json
  const { number } = result.data;
  res.json({ 
    status: 'success',
    data: { original: number, incremented: number + 1 } 
  });
};

// Controlador para la ruta GET /prueba
export const getPrueba = (req, res) => { // Endpoint de prueba que devuelve 10
  res.json({ 
    status: 'success',
    data: { number: 10 } 
  });
};
