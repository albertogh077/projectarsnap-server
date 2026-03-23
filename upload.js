/*
 * upload.js
 *
 * Configuración de Multer, registro de fotos en memoria y limpieza automática.
 *
 * Autor: Alberto Gallegos H.
 */

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { nanoid } from 'nanoid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Crea el directorio de uploads si no existe
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Registro en memoria de fotos subidas: id → record
export const photos = new Map();

// Configuración de almacenamiento en disco
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `${nanoid(10)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/png', 'image/jpeg', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(Object.assign(new Error(`Tipo no soportado: ${file.mimetype}`), { status: 400 }), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// Limpieza de fotos expiradas — TTL configurable vía PHOTO_TTL_HOURS (default: 2h)
export function cleanupExpired() {
  const ttlMs = parseFloat(process.env.PHOTO_TTL_HOURS || '2') * 60 * 60 * 1000;
  const now = Date.now();
  let cleaned = 0;

  for (const [id, record] of photos) {
    const age = now - new Date(record.createdAt).getTime();
    if (age > ttlMs) {
      const filePath = path.join(UPLOADS_DIR, record.filename);
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) {
        console.error(`Error deleting ${filePath}:`, e.message);
      }
      photos.delete(id);
      cleaned++;
    }
  }

  if (cleaned > 0) console.log(`[cleanup] ${cleaned} foto(s) expirada(s) eliminada(s)`);
}
