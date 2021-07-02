/* eslint-disable no-console */
import { ref } from 'vue'

export const useServiceWorker = (forceUpdate = false) => {
  let wb = null
  const updateExists = ref(false)
  const refreshing = ref(false)

  const reloadApp = () => {
    if (refreshing.value) {
      console.log('useServiceWorker: Service Worker already refreshing')
      return
    }

    refreshing.value = true
    updateExists.value = false
    window.location.reload()
  }

  const refreshApp = () => {
    console.log('useServiceWorker: refreshApp called.')
    wb.addEventListener('controlling', (event) => {
      reloadApp()
    })

    wb.messageSkipWaiting()
  }

  const updateAvailable = (event) => {
    console.log('useServiceWorker: Service worker update available.')
    if (event && event.detail) {
      wb = event.detail
      updateExists.value = true

      // forceUpdate is used by the app-auto-update component to force the app to activate.
      // Recommend only using this on the initial landing page or login page of an application.
      if (forceUpdate) {
        console.log('useServiceWorker: Forcing service worker update.')
        refreshApp()
      }
    }
  }

  // listen for service worker updates.
  document.addEventListener('swUpdated', updateAvailable, { once: true })

  return {
    refreshApp,
    updateExists
  }
}
