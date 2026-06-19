'use client'
import { useState } from 'react'

interface Notif { id: string; icon: string; titre: string; message: string; time: string; read: boolean }

const NOTIFS_DEMO: Notif[] = [
  { id: 'n1', icon: '🛵', titre: 'Commande livrée !', message: 'Votre commande #1038 de Maison Dupont est arrivée. Bon appétit !', time: 'Il y a 2h', read: false },
  { id: 'n2', icon: '🏷️', titre: 'Promo du jour', message: 'Bœuf & Tradition : -15% sur le Wagyu A5 aujourd\'hui seulement.', time: 'Il y a 5h', read: false },
  { id: 'n3', icon: '⭐', titre: 'Nouveau partenaire', message: 'Ferme & Boucherie Morel vient de rejoindre Côte à Côte dans votre quartier !', time: 'Hier', read: true },
]

export default function NotifPanel({ onClose }: { onClose: () => void }) {
  const [notifs, setNotifs] = useState(NOTIFS_DEMO)

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed top-[70px] right-4 w-80 z-50 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gris-bd">
          <span className="font-serif font-bold text-brun text-base">🔔 Notifications</span>
          <button className="text-xs text-rouge-vif bg-none border-none cursor-pointer"
            onClick={() => setNotifs(n => n.map(x => ({ ...x, read: true })))}>
            Tout marquer lu
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifs.map(n => (
            <div key={n.id}
              className={`flex gap-3 px-4 py-3 border-b border-gris-bd cursor-pointer hover:bg-creme transition-colors ${n.read ? '' : 'bg-or-pale'}`}
              onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}>
              <span className="text-2xl mt-0.5">{n.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-brun">{n.titre}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{n.message}</p>
                <p className="text-[10px] text-gray-300 mt-1">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
