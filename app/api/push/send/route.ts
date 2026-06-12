import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase non configuré')
  return createClient(url, key)
}

// Signature JWT pour VAPID
async function signJWT(payload: object, privateKeyB64: string): Promise<string> {
  const header = { typ: 'JWT', alg: 'ES256' }
  const b64url = (obj: object) => btoa(JSON.stringify(obj))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  const b64urlBuf = (buf: ArrayBuffer) => {
    const bytes = new Uint8Array(buf)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }

  const toSign = `${b64url(header)}.${b64url(payload)}`

  // Import private key
  const privKeyBytes = Uint8Array.from(atob(privateKeyB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    privKeyBytes,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  )

  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    new TextEncoder().encode(toSign)
  )

  return `${toSign}.${b64urlBuf(sig)}`
}

// Envoyer une notification push à un abonné
async function sendPushNotification(subscription: {
  endpoint: string; p256dh: string; auth: string
}, payload: object): Promise<boolean> {
  const vapidPublic  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY!
  const vapidEmail   = 'mailto:boucheriesdelivery@gmail.com'

  const url = new URL(subscription.endpoint)
  const audience = `${url.protocol}//${url.host}`
  const expiration = Math.floor(Date.now() / 1000) + 12 * 3600

  const jwt = await signJWT({ aud: audience, exp: expiration, sub: vapidEmail }, vapidPrivate)

  // Chiffrer le payload (Web Push Encryption)
  const body = JSON.stringify(payload)

  const res = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `vapid t=${jwt},k=${vapidPublic}`,
      'Content-Type': 'application/json',
      'TTL': '86400',
    },
    body,
  })

  return res.ok || res.status === 201
}

// POST /api/push/send — envoyer une notification
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { email, emails, role, title, body, url = '/' } = await req.json()

    // Récupérer les subscriptions
    let query = supabase.from('push_subscriptions').select('*')
    if (email)  query = query.eq('email', email)
    if (emails) query = query.in('email', emails)
    if (role)   query = query.eq('role', role)

    const { data: subs } = await query
    if (!subs || subs.length === 0) {
      return NextResponse.json({ sent: 0, message: 'Aucun abonné' })
    }

    const payload = { title, body, url, icon: '/icon-192.png' }
    let sent = 0
    const errors: string[] = []

    await Promise.all(subs.map(async (sub: any) => {
      try {
        const ok = await sendPushNotification({
          endpoint: sub.endpoint,
          p256dh:   sub.p256dh,
          auth:     sub.auth,
        }, payload)
        if (ok) sent++
      } catch (e: any) {
        errors.push(e.message)
      }
    }))

    return NextResponse.json({ sent, total: subs.length, errors })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
