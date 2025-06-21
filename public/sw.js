// Service Worker for East African Internet Optimization
const CACHE_NAME = 'vocaform-v1.2.0'
const STATIC_CACHE = 'vocaform-static-v1.2.0'
const DYNAMIC_CACHE = 'vocaform-dynamic-v1.2.0'
const TEMPLATE_CACHE = 'vocaform-templates-v1.2.0'

// Critical resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  // Core CSS and JS will be added by Vite build
]

// Template data for offline access
const FORM_TEMPLATES = [
  '/api/templates/ntsa-license',
  '/api/templates/nhif-registration',
  '/api/templates/nssf-contribution',
  '/api/templates/contact-form'
]

// Network-first strategy for dynamic content
const NETWORK_FIRST = [
  '/api/auth/',
  '/api/user/',
  '/api/analytics/'
]

// Cache-first strategy for static assets
const CACHE_FIRST = [
  '/assets/',
  '/images/',
  '/fonts/',
  '.woff2',
  '.woff',
  '.ttf'
]

// Stale-while-revalidate for templates
const STALE_WHILE_REVALIDATE = [
  '/api/templates/',
  '/api/forms/'
]

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_ASSETS)
      }),
      // Cache form templates for offline use
      caches.open(TEMPLATE_CACHE).then((cache) => {
        return Promise.allSettled(
          FORM_TEMPLATES.map(url => 
            fetch(url)
              .then(response => response.ok ? cache.put(url, response) : null)
              .catch(() => null) // Fail silently for templates
          )
        )
      })
    ]).then(() => {
      console.log('Service Worker installed successfully')
      self.skipWaiting()
    })
  )
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== TEMPLATE_CACHE) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('Service Worker activated')
      return self.clients.claim()
    })
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return
  }

  event.respondWith(handleRequest(request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const pathname = url.pathname

  try {
    // Network-first strategy for dynamic content
    if (NETWORK_FIRST.some(pattern => pathname.startsWith(pattern))) {
      return await networkFirst(request)
    }

    // Cache-first strategy for static assets
    if (CACHE_FIRST.some(pattern => pathname.includes(pattern))) {
      return await cacheFirst(request)
    }

    // Stale-while-revalidate for templates
    if (STALE_WHILE_REVALIDATE.some(pattern => pathname.startsWith(pattern))) {
      return await staleWhileRevalidate(request)
    }

    // Default: Network with cache fallback
    return await networkWithCacheFallback(request)

  } catch (error) {
    console.error('Service Worker fetch error:', error)
    return await handleOffline(request)
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    return cachedResponse || new Response('Offline', { status: 503 })
  }
}

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    return new Response('Asset not available offline', { status: 503 })
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(TEMPLATE_CACHE)
  const cachedResponse = await cache.match(request)

  // Return cached version immediately if available
  const responsePromise = cachedResponse || fetch(request)

  // Update cache in background
  fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
  }).catch(() => {
    // Fail silently for background updates
  })

  return responsePromise
}

async function networkWithCacheFallback(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    return cachedResponse || await handleOffline(request)
  }
}

async function handleOffline(request) {
  const url = new URL(request.url)
  
  // Return offline page for navigation requests
  if (request.mode === 'navigate') {
    const offlinePage = await caches.match('/offline.html')
    return offlinePage || new Response('Offline', { 
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    })
  }

  // Return cached version or error for other requests
  const cachedResponse = await caches.match(request)
  return cachedResponse || new Response('Resource not available offline', { 
    status: 503 
  })
}

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'form-sync') {
    event.waitUntil(syncFormSubmissions())
  }
})

async function syncFormSubmissions() {
  try {
    const db = await openIndexedDB()
    const transaction = db.transaction(['pendingSubmissions'], 'readonly')
    const store = transaction.objectStore('pendingSubmissions')
    const submissions = await store.getAll()

    for (const submission of submissions) {
      try {
        const response = await fetch('/api/forms/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submission.data)
        })

        if (response.ok) {
          // Remove from pending submissions
          const deleteTransaction = db.transaction(['pendingSubmissions'], 'readwrite')
          const deleteStore = deleteTransaction.objectStore('pendingSubmissions')
          await deleteStore.delete(submission.id)
        }
      } catch (error) {
        console.error('Failed to sync submission:', error)
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('VocaFormSync', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('pendingSubmissions')) {
        db.createObjectStore('pendingSubmissions', { keyPath: 'id' })
      }
    }
  })
}

// Push notifications for sync status
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      vibrate: [200, 100, 200],
      data: data.data,
      actions: data.actions || []
    }

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'open_form') {
    event.waitUntil(
      clients.openWindow('/templates')
    )
  } else {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})