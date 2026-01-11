/**
 * Service Worker for EcomTrendAI PWA
 * オフライン対応・キャッシュ戦略
 */

const CACHE_NAME = 'ecomtrendai-v1';
const OFFLINE_URL = '/offline.html';

// キャッシュするリソース
const STATIC_CACHE = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// インストール時にキャッシュを作成
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_CACHE);
    })
  );
  self.skipWaiting();
});

// アクティベート時に古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  self.clients.claim();
});

// フェッチ時のキャッシュ戦略
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // APIリクエストはネットワーク優先
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 静的リソースはキャッシュ優先
  if (
    request.destination === 'image' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTMLはネットワーク優先、失敗時はキャッシュまたはオフラインページ
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  // その他はネットワーク優先
  event.respondWith(networkFirst(request));
});

// キャッシュ優先戦略
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Cache first failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// ネットワーク優先戦略
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// プッシュ通知（将来の機能）
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'EcomTrendAIからの通知です',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
    actions: [
      { action: 'open', title: '開く' },
      { action: 'close', title: '閉じる' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'EcomTrendAI', options)
  );
});

// 通知クリック時の処理
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // 既存のウィンドウがあればフォーカス
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // なければ新しいウィンドウを開く
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
