// BreadBrawl Service Worker
const CACHE = 'breadbrawl-v4';

// インストール：即完了（プリキャッシュなし）
// → インストールを軽くしてiOSのリロードループを防止
self.addEventListener('install', event => {
  self.skipWaiting();
});

// アクティベート：古いキャッシュを削除してすぐに制御を取得
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// フェッチ：キャッシュ優先（初回アクセス時にネットワーク取得＆キャッシュ保存）
// → 初回は全ファイルをネットワークから取得（1回の読み込みで完結）
// → 2回目以降はキャッシュから高速起動
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // CDN（jsdelivr等）はキャッシュしない（opaque responseの問題を回避）
  const url = new URL(event.request.url);
  if (url.hostname !== self.location.hostname) return;

  event.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(event.request).then(cached => {
        if (cached) return cached;

        return fetch(event.request).then(response => {
          if (response && response.ok) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    )
  );
});
