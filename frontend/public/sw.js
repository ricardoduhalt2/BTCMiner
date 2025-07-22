const CACHE_NAME = 'btcminer-v1.0.0';
const STATIC_CACHE_NAME = 'btcminer-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'btcminer-dynamic-v1.0.0';
const MOBILE_CACHE_NAME = 'btcminer-mobile-v1.0.0';

// Mobile-specific configuration
const MOBILE_CONFIG = {
  maxCacheSize: 50 * 1024 * 1024, // 50MB for mobile
  maxCacheAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  compressionLevel: 'high',
  prefetchLimit: 5, // Limit prefetch on mobile
};

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logoBTCMINER.png',
  '/static/js/main.js',
  '/static/css/main.css',
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/portfolio/,
  /\/api\/prices/,
  /\/api\/transactions/,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigation responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Serve cached page or fallback
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Fallback to index.html for SPA routing
              return caches.match('/index.html');
            });
        })
    );
    return;
  }

  // Handle API requests
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Serve cached API response if available
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                // Add offline indicator to cached responses
                const headers = new Headers(cachedResponse.headers);
                headers.set('X-Served-By', 'ServiceWorker');
                headers.set('X-Cache-Status', 'offline');
                
                return new Response(cachedResponse.body, {
                  status: cachedResponse.status,
                  statusText: cachedResponse.statusText,
                  headers: headers
                });
              }
              
              // Return offline response for API calls
              return new Response(
                JSON.stringify({
                  error: 'Offline',
                  message: 'This data is not available offline',
                  cached: false
                }),
                {
                  status: 503,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
        })
    );
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request)
          .then((response) => {
            // Cache successful responses
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE_NAME)
                .then((cache) => cache.put(request, responseClone));
            }
            return response;
          });
      })
      .catch(() => {
        // Fallback for offline static assets
        if (request.destination === 'image') {
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#9ca3af">Image unavailable offline</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
        
        return new Response('Resource not available offline', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sync pending transactions or data
      syncPendingData()
    );
  }
});

// Message handling for mobile optimizations
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'OPTIMIZE_PERFORMANCE':
      handlePerformanceOptimization(data.level);
      break;
    case 'BATTERY_OPTIMIZATION':
      handleBatteryOptimization(data.enabled);
      break;
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CACHE_CLEANUP':
      cleanupMobileCache();
      break;
    default:
      console.log('Service Worker: Unknown message type', type);
  }
});

// Mobile performance optimization handler
function handlePerformanceOptimization(level) {
  console.log('Service Worker: Optimizing for performance level', level);
  
  if (level === 'low-end') {
    // Reduce cache size for low-end devices
    cleanupOldCache();
    
    // Disable background sync for non-critical data
    self.registration.sync.getTags().then(tags => {
      tags.forEach(tag => {
        if (tag !== 'critical-sync') {
          // Skip non-critical background syncs
        }
      });
    });
  }
}

// Battery optimization handler
function handleBatteryOptimization(enabled) {
  console.log('Service Worker: Battery optimization', enabled ? 'enabled' : 'disabled');
  
  if (enabled) {
    // Reduce background activity
    // Increase cache TTL to reduce network requests
    // Disable non-essential push notifications
  }
}

// Mobile cache cleanup
async function cleanupMobileCache() {
  try {
    const cache = await caches.open(MOBILE_CACHE_NAME);
    const requests = await cache.keys();
    const now = Date.now();
    
    // Remove old entries
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const cachedTime = response.headers.get('sw-cache-time');
        if (cachedTime && (now - parseInt(cachedTime)) > MOBILE_CONFIG.maxCacheAge) {
          await cache.delete(request);
          console.log('Service Worker: Removed old cache entry', request.url);
        }
      }
    }
    
    // Check cache size and remove oldest entries if needed
    const cacheSize = await getCacheSize(MOBILE_CACHE_NAME);
    if (cacheSize > MOBILE_CONFIG.maxCacheSize) {
      await trimCache(MOBILE_CACHE_NAME, MOBILE_CONFIG.maxCacheSize * 0.8);
    }
  } catch (error) {
    console.error('Service Worker: Cache cleanup failed', error);
  }
}

// Get cache size
async function getCacheSize(cacheName) {
  const cache = await caches.open(cacheName);
  const requests = await cache.keys();
  let totalSize = 0;
  
  for (const request of requests) {
    const response = await cache.match(request);
    if (response && response.headers.get('content-length')) {
      totalSize += parseInt(response.headers.get('content-length'));
    }
  }
  
  return totalSize;
}

// Trim cache to target size
async function trimCache(cacheName, targetSize) {
  const cache = await caches.open(cacheName);
  const requests = await cache.keys();
  
  // Sort by last accessed time (if available) or creation time
  const sortedRequests = requests.sort((a, b) => {
    // Implement sorting logic based on cache metadata
    return 0; // Placeholder
  });
  
  let currentSize = await getCacheSize(cacheName);
  let index = 0;
  
  while (currentSize > targetSize && index < sortedRequests.length) {
    const request = sortedRequests[index];
    const response = await cache.match(request);
    
    if (response && response.headers.get('content-length')) {
      currentSize -= parseInt(response.headers.get('content-length'));
    }
    
    await cache.delete(request);
    index++;
  }
  
  console.log(`Service Worker: Trimmed cache from ${currentSize} to target ${targetSize}`);
}

// Clean up old cache entries
async function cleanupOldCache() {
  const cacheNames = await caches.keys();
  
  for (const cacheName of cacheNames) {
    if (cacheName.includes('old') || cacheName.includes('temp')) {
      await caches.delete(cacheName);
      console.log('Service Worker: Deleted old cache', cacheName);
    }
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from BTCMiner',
    icon: '/logoBTCMINER.png',
    badge: '/logoBTCMINER.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/logoBTCMINER.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/logoBTCMINER.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('BTCMiner', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper function to sync pending data
async function syncPendingData() {
  try {
    // Get pending transactions from IndexedDB
    const pendingData = await getPendingData();
    
    if (pendingData.length > 0) {
      console.log('Service Worker: Syncing pending data', pendingData.length);
      
      // Attempt to sync each pending item
      for (const item of pendingData) {
        try {
          await fetch(item.url, {
            method: item.method,
            headers: item.headers,
            body: item.body
          });
          
          // Remove from pending queue on success
          await removePendingData(item.id);
        } catch (error) {
          console.error('Service Worker: Failed to sync item', item.id, error);
        }
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

// Helper functions for IndexedDB operations
async function getPendingData() {
  // Implementation would depend on your IndexedDB setup
  return [];
}

async function removePendingData(id) {
  // Implementation would depend on your IndexedDB setup
  console.log('Removing pending data item', id);
}