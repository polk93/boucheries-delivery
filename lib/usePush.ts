'use client'
import { useEffect, useState, useCallback } from 'react'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i)
  return output
}

export function usePushNotifications(email: string | null, role: 'client' | 'boucher' = 'client') {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  // Enregistrer le service worker
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    navigator.serviceWorker.register('/sw.js').catch(console.error)
    setPermission(Notification.permission)
  }, [])

  // S'abonner aux notifications
  const subscribe = useCallback(async () => {
    if (!email || !VAPID_PUBLIC_KEY) return
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      setPermission(permission)
      if (permission !== 'granted') return

      const sw = await navigator.serviceWorker.ready
      const subscription = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      // Sauvegarder la subscription sur le serveur
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, subscription: subscription.toJSON() }),
      })

      setSubscribed(true)
    } catch (err) {
      console.error('Push subscription error:', err)
    } finally {
      setLoading(false)
    }
  }, [email, role])

  // Se désabonner
  const unsubscribe = useCallback(async () => {
    try {
      const sw = await navigator.serviceWorker.ready
      const sub = await sw.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setSubscribed(false)
    } catch (err) {
      console.error('Unsubscribe error:', err)
    }
  }, [])

  // Vérifier si déjà abonné
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.ready.then(sw => {
      sw.pushManager.getSubscription().then(sub => setSubscribed(!!sub))
    }).catch(console.error)
  }, [])

  return { permission, subscribed, loading, subscribe, unsubscribe }
}

// Helper : envoyer une notification depuis le client (via API)
export async function sendPush(params: {
  email?: string
  emails?: string[]
  role?: string
  title: string
  body: string
  url?: string
}) {
  return fetch('/api/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  }).then(r => r.json()).catch(console.error)
}
