// BreadBrawl Service Worker
const CACHE = 'breadbrawl-v3';

// 先読みするアセット（CDN は除外 → fetch時に自動キャッシュ）
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/js/game.js',
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

// インストール：URLごとに個別キャッシュ（1つ失敗しても続行）
// skipWaiting は呼ばない → iOS でのリロードループを防止
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.all(
        PRECACHE_URLS.map(url =>
          cache.add(url).catch(err => {
            console.warn('[SW] precache skip:', url, err.message);
          })
        )
      )
    )
  );
});

// アクティベート：古いキャッシュを削除
// clients.claim は呼ばない → コントローラー変更によるリロードを防止
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      )
    )
  );
});

// フェッチ：キャッシュ優先（なければネットワーク取得＆キャッシュ保存）
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(event.request).then(cached => {
        if (cached) return cached;

        return fetch(event.request).then(response => {
          if (response && response.ok) {
            cache.put(event.request, response.clone());
          }
          return response;
        }).catch(() => cached);
      })
    )
  );
});
