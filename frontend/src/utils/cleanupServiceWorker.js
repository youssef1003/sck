/**
 * Cleanup Service Worker and Caches
 * This runs on every app load to ensure old service workers are removed
 * and stale caches are cleared
 */

export async function cleanupServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return
  }

  try {
    // 1. Unregister ALL service workers
    const registrations = await navigator.serviceWorker.getRegistrations()
    
    for (const registration of registrations) {
      console.log('🧹 Unregistering old service worker...')
      await registration.unregister()
    }

    // 2. Delete ALL caches
    const cacheNames = await caches.keys()
    
    for (const cacheName of cacheNames) {
      console.log(`🗑️ Deleting cache: ${cacheName}`)
      await caches.delete(cacheName)
    }

    console.log('✅ Service worker cleanup completed')
  } catch (error) {
    console.error('❌ Error during service worker cleanup:', error)
  }
}

// Auto-run cleanup on module load
cleanupServiceWorker()
