import { getFile } from './_git-helper.js';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8006677315:AAF8nIWmSuQwH0qbvHIi0THplgbVGp91qZY';
  
  try {
    const { content } = await getFile('admins.json');
    const admins = JSON.parse(content || '[]');
    
    return res.status(200).json({
      hasToken: !!BOT_TOKEN,
      proxyUsed: !!process.env.TELEGRAM_API_PROXY_URL,
      adminsCount: admins.length,
      adminsList: admins.map(a => a.username ? `@${a.username}` : (a.firstName || a.chatId))
    });
  } catch (error) {
    console.error('Ошибка при получении статуса бота:', error.message);
    return res.status(500).json({ 
      error: 'Ошибка при получении статуса бота', 
      details: error.message 
    });
  }
}
