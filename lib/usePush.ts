@'
'use client'
import { useEffect } from 'react'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i)
  return output.buffer
}

export function useAutoPushSubscription(email: string | null, role: 'client' | 'boucher' = 'client') {
  useEffect(() => {
    if (!email || !VAPID_PUBLIC_KEY) return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    async function autoSubscribe() {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js')
        await navigator.serviceWorker.ready
        const existing = await reg.pushManager.getSubscription()
        if (existing) {
          await fetch('/api/push/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, role, subscription: existing.toJSON() }) })
          return
        }
        if (Notification.permission === 'denied') return
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return
        const subscription = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) })
        await fetch('/api/push/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, role, subscription: subscription.toJSON() }) })
      } catch (err) { console.error('Push error:', err) }
    }
    autoSubscribe()
  }, [email, role])
}

export async function sendPush(params: { email?: string; emails?: string[]; role?: string; title: string; body: string; url?: string }) {
  return fetch('/api/push/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params) }).then(r => r.json()).catch(console.error)
}

export function usePushNotifications(email: string | null, role: 'client' | 'boucher' = 'client') {
  useAutoPushSubscription(email, role)
  return { permission: 'default' as NotificationPermission, subscribed: true, loading: false }
}
'@ | Set-Content -Path "E:\app boucherie\boucherie-delivery\lib\usePush.ts" -Encoding UTF8