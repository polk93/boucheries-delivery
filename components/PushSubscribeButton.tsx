'use client'
import { usePushNotifications } from '@/lib/usePush'

interface PushSubscribeButtonProps {
  email: string | null
  role?: 'client' | 'boucher'
}

export default function PushSubscribeButton({ email, role = 'client' }: PushSubscribeButtonProps) {
  const { permission, subscribed, loading, subscribe, unsubscribe } = usePushNotifications(email, role)

  // Pas de support push
  if (typeof window !== 'undefined' && !('PushManager' in window)) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
        <p className="text-xs text-gray-400">Notifications push non supportées sur cet appareil</p>
      </div>
    )
  }

  if (permission === 'denied') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
        <p className="text-xs text-red-500 font-semibold">🔕 Notifications bloquées</p>
        <p className="text-xs text-gray-400 mt-1">Autorisez les notifications dans les paramètres de votre navigateur</p>
      </div>
    )
  }

  if (subscribed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-green-700">🔔 Notifications activées</p>
          <p className="text-xs text-green-600">Vous recevrez les alertes sur cet appareil</p>
        </div>
        <button
          className="text-xs text-gray-400 font-semibold font-sans px-2 py-1 rounded-lg bg-white border border-gray-200"
          onClick={unsubscribe}>
          Désactiver
        </button>
      </div>
    )
  }

  return (
    <button
      className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm font-sans disabled:bg-gray-300 flex items-center justify-center gap-2"
      onClick={subscribe}
      disabled={loading || !email}>
      {loading ? '⏳ Activation…' : '🔔 Activer les notifications push'}
    </button>
  )
}
