const version = '0.0.3'
// Detect the service worker's location to set a scope for absolute paths
const detected_scope = '/'+location.href.split('/')[3]+'/';

const cache_of = {
  assets: 'assets-' + version,
  requests: 'requests',
  pages: 'pages'
};

const preloaded_manifests = {
  essential: [
    'screen.css',
    'site.js',
    'offline.html'
  ].map(asset => detected_scope + asset),
  supporting: [
    '//fast.fonts.net/cssapi/d645cd83-c955-4277-a114-11f6324025d4.css',
    'https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js'
  ]
};

const cache_list = [];
// Programmatically update the cache_list array from the cache_of object
for (let what in cache_of) {
  cache_list.push(cache_of[what]);
}

addEventListener('install', e => {
  console.log('The service worker is waiting to install...');
  console.log(cache_list);
  e.waitUntil(
    caches.open(cache_of.assets)
    .then(this_cache => {
      // Nice-to-have assets
      this_cache.addAll(preloaded_manifests.supporting);
      // Must-have assets
      return this_cache.addAll(preloaded_manifests.essential);
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
          if (!cache_list.includes(cache_name)) {
            return caches.delete(cache_name);
          }
        })
      );
    })
    .then(() => {
      return clients.claim();
    })
  );
});
