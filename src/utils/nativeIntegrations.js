import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

const isNative = Capacitor.isNativePlatform()
let cameraRequested = false

export async function ensureCameraPermission() {
  if (cameraRequested) return true
  cameraRequested = true
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return true
  try {
    await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    return true
  } catch (err) {
    cameraRequested = false
    console.warn('Camera permission blocked or unavailable', err)
    return false
  }
}

export async function ensureNotificationPermission() {
  if (!isNative) return true
  try {
    const current = await LocalNotifications.checkPermissions()
    if (current.display === 'granted') return true
    const next = await LocalNotifications.requestPermissions()
    return next.display === 'granted'
  } catch (err) {
    console.warn('Notification permission failed', err)
    return false
  }
}

export async function sendLocalNotification({ title, body }) {
  if (!isNative) return
  const granted = await ensureNotificationPermission()
  if (!granted) return
  try {
    await LocalNotifications.schedule({
      notifications: [{
        id: Date.now(),
        title,
        body,
      }],
    })
  } catch (err) {
    console.warn('Local notification failed', err)
  }
}
