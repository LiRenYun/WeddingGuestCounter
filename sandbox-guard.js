/*
 * 驗證用沙盒保護：網址加上 ?sandbox=1 時，攔截所有寫入線上 Google Apps Script 的請求（POST），
 * 讀取（GET）仍可用，但不會改動線上試算表。未加參數時完全不作用。
 */
(function () {
  if (new URLSearchParams(location.search).get('sandbox') !== '1') return;

  const LIVE_API_MARK = 'script.google.com/macros/s/';
  const realFetch = window.fetch.bind(window);

  window.fetch = function (input, init = {}) {
    const url = typeof input === 'string' ? input : input.url;
    const method = String(init.method || (input && input.method) || 'GET').toUpperCase();
    if (url.includes(LIVE_API_MARK) && method !== 'GET') {
      console.warn('[sandbox] 已攔截寫入請求:', method, init.body);
      return Promise.resolve(new Response(JSON.stringify({ status: 'success', sandbox: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
    return realFetch(input, init);
  };

  document.addEventListener('DOMContentLoaded', function () {
    const badge = document.createElement('div');
    badge.textContent = 'SANDBOX · 寫入已攔截（不會改動線上資料）';
    badge.style.cssText = 'position:fixed;left:50%;bottom:8px;transform:translateX(-50%);z-index:99999;' +
      'background:#7c2d12;color:#fff;padding:4px 12px;border-radius:999px;font:600 12px sans-serif;pointer-events:none;';
    document.body.appendChild(badge);
  });
})();
