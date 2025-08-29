// WellSwap Service Worker - Safe Cache Patch
// 개발 환경에서는 비활성화
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  console.log('Service Worker disabled in development mode');
  // Service Worker에서는 return 대신 빈 함수로 처리
  self.addEventListener('fetch', () => {});
  self.addEventListener('install', () => {});
  self.addEventListener('activate', () => {});
} else {

const CACHE_NAME = 'wellswap-v3'; // 캐시 이름 올려서 충돌 제거

// 안전한 캐시 가능 여부 체크 함수
const isHttp = (url) => url.protocol === 'http:' || url.protocol === 'https:';
const isCacheable = (req, res) =>
  req.method === 'GET' &&
  isHttp(new URL(req.url)) &&
  res && res.ok && res.type !== 'opaque'; // opaque 응답 put 금지

// 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 메인 fetch 이벤트 핸들러
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1) chrome-extension:, data:, blob: 등은 아예 건드리지 않음
  if (!isHttp(url)) return;

  // 2) 비-GET은 캐시 시도 없이 네트워크 패스스루 (기능유지)
  if (req.method !== 'GET') {
    event.respondWith(fetch(req));
    return;
  }

  // 3) GET만 캐시 전략 (stale-while-revalidate)
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    const fresh = fetch(req).then((res) => {
      if (isCacheable(req, res)) {
        cache.put(req, res.clone()).catch(() => {});
      }
      return res;
    }).catch(() => cached || new Response('Network error', { status: 502 }));
    return cached || fresh;
  })());
});

// API 요청 핸들러 (안전 패치)
async function handleApiRequest(event) {
  const req = event.request;
  if (req.method !== 'GET') return fetch(req); // 비-GET은 패스스루

  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);
  const res = await fetch(req);
  if (isCacheable(req, res)) {
    try { await cache.put(req, res.clone()); } catch (_) {}
  }
  return cached || res;
}

// 정적 파일 핸들러 (안전 패치)
async function handleStaticFile(event) {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || !isHttp(url)) return fetch(req); // 스킴/메서드 가드

  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);
  if (cached) return cached;

  const res = await fetch(req);
  if (isCacheable(req, res)) {
    try { await cache.put(req, res.clone()); } catch (_) {}
  }
  return res;
}

// 기타 요청 핸들러 (안전 패치)
async function handleOtherRequest(event) {
  const req = event.request;
  if (req.method !== 'GET') return fetch(req); // POST도 여기서 안전 처리
  return handleApiRequest(event);
}

console.log('WellSwap Service Worker loaded with safe cache patch');
}
