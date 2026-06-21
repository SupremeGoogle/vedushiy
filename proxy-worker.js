/**
 * Cloudflare Worker: Reverse Proxy for Telegram Bot API
 * 
 * Этот воркер пересылает любые запросы на api.telegram.org.
 * Разверните его в Cloudflare и укажите полученный URL в настройках Vercel (TELEGRAM_API_PROXY_URL).
 * 
 * Пример: TELEGRAM_API_PROXY_URL=https://telegram-api-proxy.myname.workers.dev
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Подменяем хост на официальный Telegram API
    const targetUrl = new URL(url.pathname + url.search, 'https://api.telegram.org');
    
    // Копируем заголовки, чтобы избежать проблем
    const newHeaders = new Headers(request.headers);
    newHeaders.set('Host', 'api.telegram.org');
    
    // Создаем новый запрос с измененным URL и заголовками
    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: newHeaders,
      body: request.body,
      redirect: 'follow'
    });
    
    try {
      const response = await fetch(proxyRequest);
      
      // Добавляем заголовки CORS, чтобы можно было обращаться напрямую из браузера
      const newResponseHeaders = new Headers(response.headers);
      newResponseHeaders.set('Access-Control-Allow-Origin', '*');
      newResponseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      newResponseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newResponseHeaders
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};
