const CACHE_NAME = 'plaigiarized-mobile-v1';
const OFFLINE_URL = '/offline.html';

// Resources to cache
const CACHED_RESOURCES = [
    '/',
    '/static/mobile.css',
    '/static/mobile.js',
    '/static/dashboard.js',
    '/static/scanner.js',
    '/static/icons/favicon.ico',
    '/static/icons/app-icon-192.png',
    '/static/icons/app-icon-512.png',
    OFFLINE_URL
];

// Install service worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(CACHED_RESOURCES);
            })
    );
});

// Activate and clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Handle fetch requests
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }

                return fetch(event.request)
                    .then((response) => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Return offline page if fetch fails
                        if (event.request.mode === 'navigate') {
                            return caches.match(OFFLINE_URL);
                        }
                    });
            })
    );
});

// Handle background sync
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-scans') {
        event.waitUntil(syncScans());
    } else if (event.tag === 'sync-grades') {
        event.waitUntil(syncGrades());
    }
});

// Sync queued scans
async function syncScans() {
    const db = await openDB();
    const scans = await db.getAll('scansQueue');
    
    for (const scan of scans) {
        try {
            const response = await fetch('/api/scan', {
                method: 'POST',
                body: JSON.stringify(scan),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                await db.delete('scansQueue', scan.id);
            }
        } catch (error) {
            console.error('Error syncing scan:', error);
        }
    }
}

// Sync queued grades
async function syncGrades() {
    const db = await openDB();
    const grades = await db.getAll('gradesQueue');
    
    for (const grade of grades) {
        try {
            const response = await fetch('/api/grades', {
                method: 'POST',
                body: JSON.stringify(grade),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                await db.delete('gradesQueue', grade.id);
            }
        } catch (error) {
            console.error('Error syncing grade:', error);
        }
    }
}

// Open IndexedDB
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('plAIgiarizedMobile', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create stores for offline data
            db.createObjectStore('scansQueue', { keyPath: 'id' });
            db.createObjectStore('gradesQueue', { keyPath: 'id' });
            db.createObjectStore('cache', { keyPath: 'key' });
        };
    });
}

// Handle push notifications
self.addEventListener('push', (event) => {
    const data = event.data.json();
    
    const options = {
        body: data.body,
        icon: '/static/icons/app-icon-192.png',
        badge: '/static/icons/badge.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url
        }
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
}); 