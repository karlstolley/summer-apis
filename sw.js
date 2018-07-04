const version = '0.0.1'
const static_cache = 'static_files-' + version;

// Detect the service worker's location to set a scope for absolute paths
const detected_scope = '/'+location.href.split('/')[3]+'/';

// Simplified asset manifest, with call to .map() to prepend the absolute,
// detected scope onto each asset listed
const local_asset_manifest = [
  'screen.css',
  'site.js',
  'offline.html'
].map(asset => detected_scope + asset);

addEventListener('install', e => {
  console.log('The service worker is waiting to install...');
  e.waitUntil(
    caches.open(static_cache)
    .then(cache => {
      return cache.addAll(local_asset_manifest);
    })
  );
});

addEventListener('activate', e => {
  console.log('The service worker is activated.');
  e.waitUntil(
    caches.keys()
    .then(cache_names => {
      return Promise.all(
        cache_names.map(cache_name => {
          if (cache_name !== static_cache) {
            return caches.delete(cache_name);
          }
        })
      );
    })
    .then( () => {
      return clients.claim();
    })
  );
});

addEventListener('fetch', e => {
  const request = e.request;
  e.respondWith(
    caches.match(request)
    .then(cachedResponse => {
      if(cachedResponse) {
        return cachedResponse;
      }
      return fetch(request)
      .catch(error => {
        return caches.match(detected_scope+'offline.html');
      });
    })
  );
});
