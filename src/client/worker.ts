declare const self: ServiceWorkerGlobalScope;
export {};

const CACHE = 'tinyRoomsCache';

const preCacheResources = [
  '/',
  '/favicon.svg',
  '/index.js',
  '/index.css',
  '/inter.woff2',
  '/_shapes/index.css',
];

self.addEventListener('install', (event) =>
  event.waitUntil(
    (async () => await (await caches.open(CACHE)).addAll(preCacheResources))(),
  ),
);

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) =>
  event.respondWith(
    (async () => {
      const {request} = event;
      const pathname = new URL(request.url).pathname;

      // For login details, try network (updating cache) and fallback to cache
      if (pathname == '/parties/username') {
        return await tryResponse(request, fetchNetworkAndCache, fetchCache);
      }

      // For logout, if offline, nullify the login details in the cache
      if (pathname == '/parties/logout') {
        return await tryResponse(request, fetchNetwork, async (request) => {
          await (
            await caches.open(CACHE)
          ).put(
            request.url.replace('/logout', '/username'),
            newResponse(200, 'null'),
          );
          return newResponse(200);
        });
      }

      // Otherwise try cache and fallback to network (without updating cache)
      return await tryResponse(request, fetchCache, fetchNetwork);
    })(),
  ),
);

const tryResponse = async (
  request: Request,
  fetch1: (request: Request) => Promise<Response>,
  fetch2: (request: Request) => Promise<Response>,
) => {
  try {
    return await fetch1(request);
  } catch {
    try {
      return await fetch2(request);
    } catch {}
  }
  return newResponse(404);
};

const fetchCache = async (request: Request): Promise<Response> => {
  const response = await (await caches.open(CACHE)).match(request.url);
  if (response) {
    return response;
  }
  throw new Error();
};

const fetchNetwork = async (request: Request): Promise<Response> => {
  return await fetch(request);
};

const fetchNetworkAndCache = async (request: Request): Promise<Response> => {
  const response = await fetchNetwork(request);
  (await caches.open(CACHE)).put(request, response.clone());
  return response;
};

const newResponse = (status: number, body: string | null = null) =>
  new Response(body, {status});
