import { commitFiles } from './_git-helper.js';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не поддерживается' });
  }

  const { password, data, files } = req.body;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ved123';

  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Неверный пароль администратора' });
  }

  if (!data) {
    return res.status(400).json({ success: false, error: 'Отсутствуют данные для сохранения' });
  }

  try {
    // Файлы уже загружены через /api/upload по одному; здесь только фиксируем их
    // вместе с data.json одним коммитом (= один передеплой сайта)
    const uploaded = (Array.isArray(files) ? files : [])
      .filter(f => f && f.sha && /^public\/(images|audio)\//.test(f.path) && !f.path.includes('..'))
      .map(f => ({ path: f.path, sha: f.sha }));

    await commitFiles(
      [...uploaded, { path: 'public/data.json', content: JSON.stringify(data, null, 2) }],
      uploaded.length
        ? `Update website content via Admin Panel (+${uploaded.length} files)`
        : 'Update website content via Admin Panel'
    );

    console.log('Сайт успешно обновлен!');
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Ошибка при сохранении:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Ошибка при сохранении изменений',
      details: error.message
    });
  }
}
