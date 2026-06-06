// BreadBrawl Service Worker
// キャッシュバージョンを変えると古いキャッシュが破棄される
const CACHE = 'breadbrawl-v1';

// 初回インストール時に先読みするクリティカルアセット
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/js/game.js',
  'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js',
  // Stage 1 カード画像
  '/breadpicture_card_final/shokupan.png',
  '/breadpicture_card_final/croissant.png',
  '/breadpicture_card_final/melonpan.png',
  '/breadpicture_card_final/baguette.png',
  '/breadpicture_card_final/mushipan.png',
  '/breadpicture_card_final/anpan.png',
  '/breadpicture_card_final/currypan.png',
  '/breadpicture_card_final/chocorone.png',
  '/breadpicture_card_final/shiopan.png',
  '/breadpicture_card_final/bagel.png',
  // Stage 1 ピクセル画像
  '/breadpicture_dot/shokupan-syachi.png',
  '/breadpicture_dot/croissant-syachi.png',
  '/breadpicture_dot/melon_pan-syachi.png',
  '/breadpicture_dot/baguette-syachi.png',
  '/breadpicture_dot/mushi_pan-syachi.png',
  '/breadpicture_dot/anpan-syachi.png',
  '/breadpicture_dot/curry_pan-syachi.png',
  '/breadpicture_dot/choco_cornet.png',
  '/breadpicture_dot/shio_pan-syachi.png',
  '/breadpicture_dot/bagel-syachi.png',
  // Stage 2 ピクセル画像
  '/breadpicture_dot_2/cinnamon_roll.png',
  '/breadpicture_dot_2/donut.png',
  '/breadpicture_dot_2/pretzel.png',
  '/breadpicture_dot_2/focaccia.png',
  '/breadpicture_dot_2/naan.png',
  '/breadpicture_dot_2/pita.png',
  '/breadpicture_dot_2/rye_bread.png',
  '/breadpicture_dot_2/cream_pan.png',
  '/breadpicture_dot_2/koppe_pan.png',
  '/breadpicture_dot_2/brioche.png',
  '/breadpicture_dot_2/age_pan.png',
  '/breadpicture_dot_2/muffin.png',
  '/breadpicture_dot_2/scone.png',
  '/breadpicture_dot_2/pain_au_chocolat.png',
  '/breadpicture_dot_2/cheese_pan.png',
  '/breadpicture_dot_2/kaiser_roll.png',
  '/breadpicture_dot_2/kokuto_pan.png',
  '/breadpicture_dot_2/chigiri_pan.png',
  '/breadpicture_dot_2/maple_danish.png',
  '/breadpicture_dot_2/epi.png',
  // Stage 2 カード画像
  '/breadpicture_stage2/cinnamon_roll.png',
  '/breadpicture_stage2/donut.png',
  '/breadpicture_stage2/pretzel.png',
  '/breadpicture_stage2/focaccia.png',
  '/breadpicture_stage2/naan.png',
  '/breadpicture_stage2/pita.png',
  '/breadpicture_stage2/rye_bread.png',
  '/breadpicture_stage2/cream_pan.png',
  '/breadpicture_stage2/koppe_pan.png',
  '/breadpicture_stage2/brioche.png',
  '/breadpicture_stage2/age_pan.png',
  '/breadpicture_stage2/muffin.png',
  '/breadpicture_stage2/scone.png',
  '/breadpicture_stage2/pain_au_chocolat.png',
  '/breadpicture_stage2/cheese_pan.png',
  '/breadpicture_stage2/kaiser_roll.png',
  '/breadpicture_stage2/kokuto_pan.png',
  '/breadpicture_stage2/chigiri_pan.png',
  '/breadpicture_stage2/maple_danish.png',
  '/breadpicture_stage2/epi.png',
];

// インストール：クリティカルアセットを先読みキャッシュ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(err => {
        // 一部のファイルが見つからなくてもインストールを続行
        console.warn('[SW] precache partial failure:', err);
        return self.skipWaiting();
      })
  );
});

// アクティベート：古いキャッシュを削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// フェッチ：キャッシュ優先（なければネットワーク取得＆キャッシュ保存）
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(event.request).then(cached => {
        if (cached) return cached; // キャッシュヒット → 即返す

        // キャッシュミス → ネットワーク取得してキャッシュ保存
        return fetch(event.request).then(response => {
          if (response && (response.ok || response.type === 'opaque')) {
            cache.put(event.request, response.clone());
          }
          return response;
        }).catch(() => cached); // オフライン時はキャッシュを返す
      })
    )
  );
});
