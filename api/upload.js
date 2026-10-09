import { uploadBlob } from './_git-helper.js';

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

// Читаем тело запроса как есть (бинарный файл), без base64-раздувания на 33%
function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size <= MAX_UPLOAD_BYTES) chunks.push(chunk);
    });
    req.on('end', () => size > MAX_UPLOAD_BYTES
      ? reject(Object.assign(new Error('Файл слишком большой'), { status: 413 }))
      : resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Password, X-File-Path');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Метод не поддерживается' });
  }

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ved123';
  const password = decodeURIComponent(req.headers['x-admin-password'] || '');
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Неверный пароль администратора' });
  }

  // Разрешаем писать только в public/images/ и public/audio/
  const filePath = decodeURIComponent(req.headers['x-file-path'] || '');
  if (!/^public\/(images|audio)\/[A-Za-z0-9._\-\/]+$/.test(filePath) || filePath.includes('..')) {
    return res.status(400).json({ success: false, error: 'Недопустимое имя файла' });
  }

  if (Number(req.headers['content-length']) > MAX_UPLOAD_BYTES) {
    return res.status(413).json({ success: false, error: 'Файл слишком большой (максимум 15 МБ)' });
  }

  try {
    const buffer = await readRawBody(req);
    if (!buffer.length) {
      return res.status(400).json({ success: false, error: 'Пустой файл' });
    }
    const result = await uploadBlob(filePath, buffer);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Ошибка загрузки файла:', error.message);
    return res.status(error.status === 413 ? 413 : 500).json({
      success: false,
      error: error.status === 413 ? 'Файл слишком большой (максимум 15 МБ)' : 'Ошибка загрузки файла',
      details: error.message
    });
  }
}

// Vercel: не разбирать тело автоматически, читаем поток сами
export const config = { api: { bodyParser: false } };
