/*
 * controllers.js
 *
 * Controladores de la aplicación para las rutas definidas.
 *
 * Autor: Alberto Gallegos H.
 * Última modificación: 2026-03-23
 */

import { z } from 'zod';
import path from 'path';
import fs from 'fs';
import QRCode from 'qrcode';
import { photos, UPLOADS_DIR } from './upload.js';

// ─── Controladores existentes ────────────────────────────────────────────────

const testSchema = z.object({
  number: z.number({
    invalid_type_error: "El campo 'number' debe ser un número válido.",
  }),
});

export const getHome = (req, res) => {
  res.json({
    status: 'success',
    message: 'Servidor de ProjectArSnap funcionando',
    version: '1.0.0',
  });
};

export const postTest = (req, res) => {
  const result = testSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ status: 'error', errors: result.error.format() });
  }
  const { number } = result.data;
  res.json({ status: 'success', data: { original: number, incremented: number + 1 } });
};

export const getPrueba = (req, res) => {
  res.json({ status: 'success', data: { number: 10 } });
};

// ─── Photobooth ──────────────────────────────────────────────────────────────

/**
 * POST /api/photo
 * Recibe la foto capturada, la guarda en disco, genera QR y responde con los URLs.
 */
export const postPhoto = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No se recibió ninguna imagen' });
  }

  const HOST = process.env.HOST || `http://localhost:${process.env.PORT || 3000}`;
  const id = path.parse(req.file.filename).name;
  const photoUrl = `${HOST}/photo/${id}`;
  const qrUrl = `${HOST}/photo/${id}/qr`;

  const qrDataUrl = await QRCode.toDataURL(photoUrl, {
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
    errorCorrectionLevel: 'M',
  });

  const record = {
    id,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    url: photoUrl,
    qrUrl,
    createdAt: new Date().toISOString(),
  };

  photos.set(id, record);

  res.json({ id, url: photoUrl, qrUrl, qrDataUrl, createdAt: record.createdAt });
};

/**
 * GET /photo/:id
 * Sirve la página HTML de descarga (mobile-first).
 */
export const getPhotoPage = (req, res) => {
  const record = photos.get(req.params.id);
  if (!record) return res.status(404).send(page404());

  const filePath = path.join(UPLOADS_DIR, record.filename);
  if (!fs.existsSync(filePath)) {
    photos.delete(req.params.id);
    return res.status(404).send(page404());
  }

  res.send(downloadPage(record));
};

/**
 * GET /photo/:id/raw
 * Sirve la imagen directamente (inline para <img src>).
 */
export const getPhotoRaw = (req, res) => {
  const record = photos.get(req.params.id);
  if (!record) return res.status(404).json({ status: 'error', message: 'Foto no encontrada' });

  const filePath = path.join(UPLOADS_DIR, record.filename);
  if (!fs.existsSync(filePath)) {
    photos.delete(req.params.id);
    return res.status(404).json({ status: 'error', message: 'Archivo no encontrado' });
  }

  res.setHeader('Content-Type', record.mimetype);
  res.setHeader('Content-Disposition', `inline; filename="ar-photobooth-${record.id}.png"`);
  res.sendFile(filePath);
};

/**
 * GET /photo/:id/qr
 * Sirve el QR como imagen PNG binaria (400×400, cacheada 1h).
 */
export const getPhotoQr = async (req, res) => {
  const record = photos.get(req.params.id);
  if (!record) return res.status(404).json({ status: 'error', message: 'Foto no encontrada' });

  const qrBuffer = await QRCode.toBuffer(record.url, {
    width: 400,
    margin: 2,
    errorCorrectionLevel: 'M',
  });

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(qrBuffer);
};

/**
 * GET /api/health
 * Status del servidor para monitoreo.
 */
export const getHealth = (req, res) => {
  res.json({ status: 'ok', photos: photos.size, uptime: Math.floor(process.uptime()) });
};

// ─── HTML helpers ────────────────────────────────────────────────────────────

function downloadPage(record) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Tu foto AR · ProjectARSnap</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{min-height:100vh;display:flex;flex-direction:column;align-items:center;
         justify-content:center;background:#050d1a;color:#fff;
         font-family:system-ui,sans-serif;padding:1.5rem;gap:1.5rem;text-align:center}
    h1{font-size:1.4rem;font-weight:700;letter-spacing:-.02em}
    .photo{max-width:100%;max-height:60vh;border-radius:12px;
           box-shadow:0 8px 32px rgba(0,0,0,.6)}
    .btn{display:inline-block;padding:.85rem 2rem;background:#fff;color:#000;
         border-radius:999px;font-weight:700;text-decoration:none;font-size:1rem}
    .note{font-size:.75rem;color:#555}
  </style>
</head>
<body>
  <h1>Tu foto AR</h1>
  <img class="photo" src="/photo/${record.id}/raw" alt="Tu foto AR"/>
  <a class="btn" href="/photo/${record.id}/raw" download="ar-photobooth-${record.id}.png">
    Descargar foto
  </a>
  <p class="note">Esta foto expira automáticamente</p>
</body>
</html>`;
}

function page404() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>No encontrada · ProjectARSnap</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{min-height:100vh;display:flex;flex-direction:column;align-items:center;
         justify-content:center;background:#050d1a;color:#fff;
         font-family:system-ui,sans-serif;text-align:center;gap:.75rem}
  </style>
</head>
<body>
  <h1>404</h1>
  <p>Foto no encontrada o expirada</p>
</body>
</html>`;
}
