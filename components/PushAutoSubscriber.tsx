@"
'use client'
import { useAuth } from '@/store/auth'
import { useAutoPushSubscription } from '@/lib/usePush'

export default function PushAutoSubscriber() {
  const { user } = useAuth()
  useAutoPushSubscription(user?.email || null, user?.role === 'boucher' ? 'boucher' : 'client')
  return null
}
"@ | Out-File -FilePath "E:\app boucherie\boucherie-delivery\app\components\PushAutoSubscriber.tsx" -Encoding UTF8