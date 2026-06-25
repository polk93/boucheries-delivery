'use client'
import { useAuth } from '@/store/auth'
import { useRouter } from 'next/navigation'

export default function ResetCookieButton() {
  const { user } = useAuth()
  const router = useRouter()

  async function reset() {
    if (!user?.email || user.isDemo) return

    await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        cookie_consent: null,
        cookie_consent_date: null,
      }),
    })

    router.refresh()
  }

  if (!user?.email || user.isDemo) return null

  return (
    <button
      onClick={reset}
      className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm"
    >
      🍪 Modifier mes préférences de cookies
    </button>
  )
}
