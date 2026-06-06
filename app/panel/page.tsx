'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useSupabaseProduits } from '@/lib/useSupabase'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/store/auth'
import BottomNavBoucher from '@/components/ui/BottomNavBoucher'
import AuthModal from '@/components/ui/AuthModal'
import { BOUCHERIES, type Produit } from '@/lib/data'
import { useBoucherStore } from '@/store/boucherStore'

// ── Types ─────────────────────────────────────────────────────────────────────
interface ProduitEtendu extends Produit {
  boucherieId: number
  boucherieNom: string
  photoUrl: string | null
}

interface ProduitForm {
  id: string
  nom: string
  desc: string
  prix: string
  icon: string
  stock: string
  decoupes: string
  preparation: string
  photoUrl: string | null
  boucherieId: number
  cat: string
  venteType: string
  allergenes: string
  poids: string  // ex: "200-300g", "500g", "1kg"
}

interface LigneCommande {
  produit: string
  icon: string
  qty: number
  prix: number
  decoupe: string
  preparation: string
  note: string
}

interface Commande {
  id: string
  client: string
  tel: string
  adresse: string
  creneau: string
  date: string
  heure: string
  lignes: LigneCommande[]
  frais: number
  status: string
  modePaiement: string
  stripeId: string
}

interface HoraireJour {
  ouvert: boolean
  matin: boolean
  matinDebut: string
  matinFin: string
  am: boolean
  amDebut: string
  amFin: string
}

// ── Vérification automatique ouvert/fermé selon les horaires ─────────────────
function isBoutiqueOuverteNow(horaires: Record<string, HoraireJour>): boolean {
  const now = new Date()
  const jours = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam']
  const jour = jours[now.getDay()]
  const h = horaires[jour]
  if (!h || !h.ouvert) return false

  const heure = now.getHours() * 60 + now.getMinutes()

  function toMin(s: string): number {
    const [hh, mm] = s.split(':').map(Number)
    return hh * 60 + mm
  }

  const matinOk = h.matin && heure >= toMin(h.matinDebut) && heure < toMin(h.matinFin)
  const amOk    = h.am    && heure >= toMin(h.amDebut)    && heure < toMin(h.amFin)
  return matinOk || amOk
}


const ORDERS_INIT: Commande[] = [
  {
    id: '#1042', client: 'Sophie M.', tel: '06 12 34 56 78',
    adresse: '8 rue Léon Frot, 75011 Paris', creneau: 'Dès que possible',
    date: new Date().toLocaleDateString('fr-FR'), heure: '11:42',
    frais: 2.90, status: 'new', modePaiement: 'Carte Visa', stripeId: 'pi_demo001',
    lignes: [
      { produit: 'Entrecôte Charolais', icon: '', qty: 2, prix: 18.90, decoupe: 'Épaisse (2cm)', preparation: 'Marinée herbes', note: '' },
      { produit: 'Merguez Maison', icon: '️', qty: 1, prix: 8.50, decoupe: 'Standard', preparation: 'Extra-épicées', note: 'Pour BBQ' },
    ],
  },
  {
    id: '#1041', client: 'Théo B.', tel: '07 89 01 23 45',
    adresse: '23 avenue Parmentier, 75011 Paris', creneau: "Aujourd'hui 13h–14h",
    date: new Date().toLocaleDateString('fr-FR'), heure: '11:24',
    frais: 2.90, status: 'prep', modePaiement: 'Carte Mastercard', stripeId: 'pi_demo002',
    lignes: [
      { produit: 'Filet de Bœuf', icon: '', qty: 1, prix: 24.50, decoupe: 'En médaillons', preparation: 'Nature', note: 'Cuisson rosée' },
    ],
  },
  {
    id: '#1040', client: 'Marie L.', tel: '06 55 44 33 22',
    adresse: '5 passage Charles Dallery, 75011 Paris', creneau: "Aujourd'hui 12h–13h",
    date: new Date().toLocaleDateString('fr-FR'), heure: '11:06',
    frais: 0, status: 'ready', modePaiement: 'Carte Visa', stripeId: 'pi_demo003',
    lignes: [
      { produit: "Bavette d'Aloyau", icon: '', qty: 3, prix: 12.80, decoupe: 'Fine', preparation: 'Marinée échalotes', note: '' },
    ],
  },
  {
    id: '#1039', client: 'Jules R.', tel: '07 11 22 33 44',
    adresse: '14 rue de la Roquette, 75011 Paris', creneau: 'Dès que possible',
    date: new Date().toLocaleDateString('fr-FR'), heure: '10:48',
    frais: 2.90, status: 'delivery', modePaiement: 'Apple Pay', stripeId: 'pi_demo004',
    lignes: [
      { produit: 'Merguez Maison', icon: '️', qty: 2, prix: 8.50, decoupe: 'Standard', preparation: 'Épicées', note: '' },
    ],
  },
]

const HISTORIQUE_INIT: Commande[] = [
  {
    id: '#1038', client: 'Anna K.', tel: '06 98 76 54 32',
    adresse: '31 rue de la Folie Méricourt, 75011 Paris', creneau: "Aujourd'hui 11h–12h",
    date: new Date().toLocaleDateString('fr-FR'), heure: '10:21',
    frais: 2.90, status: 'done', modePaiement: 'Carte Visa', stripeId: 'pi_demo005',
    lignes: [
      { produit: 'Côtes de Porc', icon: '', qty: 4, prix: 11.20, decoupe: 'Avec os', preparation: 'Nature', note: 'Bien épaisses' },
    ],
  },
  {
    id: '#1037', client: 'Lucas P.', tel: '06 00 11 22 33',
    adresse: '7 rue Keller, 75011 Paris', creneau: 'Dès que possible',
    date: new Date(Date.now() - 86400000).toLocaleDateString('fr-FR'), heure: '18:30',
    frais: 2.90, status: 'done', modePaiement: 'Carte Visa', stripeId: 'pi_histo001',
    lignes: [
      { produit: 'Entrecôte Charolais', icon: '', qty: 1, prix: 18.90, decoupe: 'Standard', preparation: 'Nature', note: '' },
    ],
  },
]

const SL: Record<string, string> = { new: 'Nouvelle', prep: 'En préparation', ready: 'Prête', delivery: 'En livraison', done: 'Livrée' }
const SC: Record<string, string> = {
  new: 'bg-yellow-100 text-yellow-700', prep: 'bg-blue-100 text-blue-600',
  ready: 'bg-green-100 text-green-600', delivery: 'bg-orange-100 text-orange-600', done: 'bg-gray-100 text-gray-500',
}
const SF = ['new', 'prep', 'ready', 'delivery', 'done']
const BL: Record<string, string> = { new: 'Préparer', prep: 'Prête', ready: 'Livrer', delivery: 'Confirmer' }
const ICONS = ['', '', '️', '', '', '', '', '', '', '', '', '⭐']
const JOURS: Array<[string, string]> = [['lun','Lun'],['mar','Mar'],['mer','Mer'],['jeu','Jeu'],['ven','Ven'],['sam','Sam'],['dim','Dim']]

const HORAIRE_DEFAULT: HoraireJour = { ouvert: true, matin: true, matinDebut: '08:00', matinFin: '13:00', am: true, amDebut: '15:00', amFin: '19:30' }
const HORAIRES_DEFAULT: Record<string, HoraireJour> = {
  lun: { ...HORAIRE_DEFAULT },
  mar: { ...HORAIRE_DEFAULT },
  mer: { ...HORAIRE_DEFAULT },
  jeu: { ...HORAIRE_DEFAULT },
  ven: { ...HORAIRE_DEFAULT, amFin: '20:00' },
  sam: { ...HORAIRE_DEFAULT, matinDebut: '07:30', amFin: '19:00' },
  dim: { ouvert: false, matin: false, matinDebut: '09:00', matinFin: '13:00', am: false, amDebut: '15:00', amFin: '18:00' },
}

function emptyForm(boucherieId: number): ProduitForm {
  return { id: '', nom: '', desc: '', prix: '', icon: '', stock: '0', decoupes: '', preparation: '', photoUrl: null, boucherieId, cat: 'Bœuf', venteType: 'pièce', allergenes: '', poids: '' }
}

function makeInitBoutique(bRef: typeof BOUCHERIES[0] | undefined) {
  return {
    nom: bRef ? bRef.nom : '',
    desc: bRef ? bRef.desc : '',
    tel: bRef ? '01 23 45 67 89' : '',
    email: bRef ? 'contact@maboucherie.fr' : '',
    adresse: '12 rue du Marché, 75011 Paris',
    frais: bRef ? String(bRef.frais) : '2.9',
    minCommande: '15',
    rayon: '5',
    promo: false,
    promoTexte: 'Livraison offerte dès 30 €',
    promotions: [] as Promo[],
    horaires: { ...HORAIRES_DEFAULT },
  }
}

interface Promo {
  id: string
  titre: string
  description: string
  type: string
  valeur: string
  dateDebut: string
  dateFin: string
  active: boolean
}

// ══════════════════════════════════════════════════════════════════════════════
export default function PanelPage() {
  const router = useRouter()
  const { user, logout, isBoucher } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [tab, setTab] = useState('commandes')
  const [viewOrder, setViewOrder] = useState<Commande | null>(null)
  const [showHistorique, setShowHistorique] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // ── IDs et store ─────────────────────────────────────────────────────────────
  const myBoucherieId = user?.isDemo
    ? (user?.boucherieId || 1)
    : (user?.boucherieId || (1000 + (user?.email?.charCodeAt(0) || 0) % 9000))
  const myBoucherie   = BOUCHERIES.find(b => b.id === myBoucherieId)
  const bRef          = user?.isDemo ? myBoucherie : undefined
  const boucherStore  = useBoucherStore()
  const bid           = String(myBoucherieId)
  const supabase      = useSupabaseProduits(user?.isDemo ? null : user?.email || null)

  // ── États persistants via boucherStore ───────────────────────────────────────
  const [isOpen, setIsOpen] = useState<boolean>(() =>
    boucherStore.getIsOpen(bid) ?? true
  )

  const [produits, setProduits] = useState<ProduitEtendu[]>(() => {
    const saved = boucherStore.getProduits(myBoucherieId)
    if (saved.length > 0) return saved as unknown as ProduitEtendu[]
    if (user?.isDemo) return BOUCHERIES.flatMap(b =>
      b.produits.map(p => ({ ...p, boucherieId: b.id, boucherieNom: b.nom, photoUrl: p.photo }))
    )
    return []
  })

  const [orders, setOrders] = useState<Commande[]>(() => {
    const saved = boucherStore.getOrders(bid)
    if (saved.length > 0) return saved as Commande[]
    return user?.isDemo ? ORDERS_INIT : []
  })

  const [historique, setHistorique] = useState<Commande[]>(() => {
    const saved = boucherStore.getHistorique(bid)
    if (saved.length > 0) return saved as Commande[]
    return user?.isDemo ? HISTORIQUE_INIT : []
  })

  const [boutique, setBoutique] = useState<ReturnType<typeof makeInitBoutique>>(() => {
    const saved = boucherStore.getBoutique(myBoucherieId)
    return saved ? { ...makeInitBoutique(bRef), ...saved } : makeInitBoutique(bRef)
  })
  const [boutiqueEdited, setBoutiqueEdited] = useState(false)

  const [modalProd, setModalProd] = useState<ProduitForm | null>(null)
  const [isNew, setIsNew] = useState(false)

  const myProduits = produits.filter(p => p.boucherieId === myBoucherieId)

  // Enregistrer le boucher dans Supabase dès la connexion (si pas démo)
  useEffect(() => {
    if (!user || user.isDemo) return
    const profil = boucherStore.getBoucherProfil(user.email)
    fetch('/api/bouchers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email:        user.email,
        nom_boutique: profil?.boutique || user.boucherieNom || user.nom || 'Ma Boucherie',
        nom:          profil?.nom || user.nom || '',
        prenom:       profil?.prenom || '',
        telephone:    profil?.tel || '',
      }),
    }).catch(console.error)
  }, [user?.email])

  // ── Ouverture/fermeture automatique selon les horaires ───────────────────────
  useEffect(() => {
    if (!user || user.isDemo) return

    function checkHoraires() {
      const shouldBeOpen = isBoutiqueOuverteNow(boutique.horaires)
      if (shouldBeOpen !== isOpen) {
        setIsOpenPersist(shouldBeOpen)
        showToast(shouldBeOpen ? '🟢 Boutique ouverte automatiquement' : '🔴 Boutique fermée automatiquement')
      }
    }

    // Vérifier immédiatement
    checkHoraires()

    // Vérifier toutes les minutes
    const interval = setInterval(checkHoraires, 60000)
    return () => clearInterval(interval)
  }, [boutique.horaires, user?.email])

  // Reset sur l'onglet commandes à chaque connexion
  useEffect(() => {
    if (user) setTab('commandes')
  }, [user?.email])

  // Charger les produits depuis Supabase pour les vrais comptes
  useEffect(() => {
    if (!user?.isDemo && supabase.produits.length > 0) {
      // Sync Supabase → état local
      const prods = supabase.produits.map((p: any) => ({
        id: p.id, nom: p.nom, desc: p.description, prix: p.prix,
        icon: p.icon, stock: p.stock, photo: p.photo_url, photoUrl: p.photo_url,
        cat: p.cat, venteType: p.vente_type,
        decoupes: p.decoupes || [], preparation: p.preparation || [],
        allergenes: p.allergenes || '',
        boucherieId: myBoucherieId,
        boucherieNom: user?.boucherieNom || user?.nom || '',
      }))
      setProduits(prods as any)
    }
  }, [supabase.produits])

  // Synchroniser automatiquement quand user change (reconnexion)
  useEffect(() => {
    if (!user) return
    const savedProd = boucherStore.getProduits(myBoucherieId)
    if (savedProd.length > 0) setProduits(savedProd as unknown as ProduitEtendu[])
    const savedBoutique = boucherStore.getBoutique(myBoucherieId)
    if (savedBoutique) setBoutique({ ...makeInitBoutique(bRef), ...savedBoutique })
    const savedOrders = boucherStore.getOrders(bid)
    if (savedOrders.length > 0) setOrders(savedOrders as Commande[])
    const savedHist = boucherStore.getHistorique(bid)
    if (savedHist.length > 0) setHistorique(savedHist as Commande[])
    const savedIsOpen = boucherStore.getIsOpen(bid)
    if (savedIsOpen !== null) setIsOpen(savedIsOpen)
  }, [user?.email])

  function showToast(msg: string) { setToastMsg(msg); setTimeout(() => setToastMsg(null), 2500) }

  // ── Wrappers de mise à jour avec persistence ──────────────────────────────────
  function setOrdersPersist(fn: (prev: Commande[]) => Commande[]) {
    setOrders(prev => { const next = fn(prev); boucherStore.setOrders(bid, next); return next })
  }
  function setHistoriquePersist(fn: (prev: Commande[]) => Commande[]) {
    setHistorique(prev => { const next = fn(prev); boucherStore.setHistorique(bid, next); return next })
  }
  function setIsOpenPersist(val: boolean) {
    setIsOpen(val); boucherStore.setIsOpen(bid, val)
    if (!user?.isDemo && supabase) {
      supabase.updateIsOpen(val).catch(console.error)
    }
  }
  function setBoutiquePersist(updater: ReturnType<typeof makeInitBoutique> | ((prev: ReturnType<typeof makeInitBoutique>) => ReturnType<typeof makeInitBoutique>)) {
    setBoutique(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      boucherStore.setBoutique(myBoucherieId, next)
      return next
    })
  }

  function progress(id: string) {
    const order = orders.find(o => o.id === id)
    if (order?.status === 'new') {
      // Décrémenter stock automatiquement à l'acceptation
      setProduits(prev => {
        const next = prev.map(p => {
          const ligne = order.lignes.find(l => l.produit === p.nom)
          if (!ligne) return p
          return { ...p, stock: Math.max(0, p.stock - ligne.qty) }
        })
        boucherStore.setProduits(myBoucherieId, next)
        return next
      })
    }
    setOrdersPersist(prev => {
      const updated = prev.map(o => {
        if (o.id !== id) return o
        const i = SF.indexOf(o.status)
        return { ...o, status: SF[Math.min(i + 1, SF.length - 1)] }
      })
      const justDone = updated.find(o => o.id === id && o.status === 'done')
      if (justDone) {
        setHistoriquePersist(h => [justDone, ...h])
        showToast('✅ Commande archivée')
        return updated.filter(o => o.id !== id)
      }
      return updated
    })
  }

  function openEdit(p: ProduitEtendu) {
    setModalProd({ id: p.id, nom: p.nom, desc: p.desc, prix: String(p.prix), icon: p.icon, stock: String(p.stock), decoupes: p.decoupes?.join(', ') || '', preparation: p.preparation?.join(', ') || '', photoUrl: p.photoUrl, boucherieId: p.boucherieId, cat: String(p.cat || 'Bœuf'), venteType: String(p.venteType || 'pièce'), allergenes: (p as any).allergenes || '', poids: (p as any).poids || '' })
    setIsNew(false)
  }

  function openNew() {
    setModalProd(emptyForm(myBoucherieId))
    setIsNew(true)
  }

  async function saveProduit() {
    if (!modalProd) return
    if (!modalProd.nom.trim() || !modalProd.prix.trim()) { showToast('⚠️ Nom et prix obligatoires'); return }

    const profil = boucherStore.getBoucherProfil(user?.email || '')
    const boucherieNom = profil?.boutique || user?.boucherieNom || user?.nom || 'Ma Boucherie'

    if (isNew) {
      // Sauvegarder dans Supabase d'abord pour obtenir l'ID réel
      if (!user?.isDemo && user?.email) {
        try {
          const data = await supabase.addProduit({
            ...modalProd,
            boucherieNom,
            email: user.email,
          })
          // Utiliser l'ID Supabase réel
          const newProd: ProduitEtendu = {
            id: data?.id || ('local_' + Date.now()),
            nom: modalProd.nom, desc: modalProd.desc,
            prix: parseFloat(modalProd.prix) || 0,
            icon: modalProd.icon, stock: parseInt(modalProd.stock) || 0,
            photo: modalProd.photoUrl, photoUrl: modalProd.photoUrl,
            decoupes: modalProd.decoupes.split(',').map(s => s.trim()).filter(Boolean),
            preparation: modalProd.preparation.split(',').map(s => s.trim()).filter(Boolean),
            boucherieId: myBoucherieId, boucherieNom,
            cat: modalProd.cat as any, venteType: modalProd.venteType as any,
            poids: modalProd.poids,
          } as any
          setProduits(prev => {
            const next = [...prev, newProd]
            boucherStore.setProduits(myBoucherieId, next)
            boucherStore.registerBoucher(user.email!, myBoucherieId)
            return next
          })
          showToast('✅ Produit créé !')
          setModalProd(null)
          return
        } catch (e) {
          console.error('Erreur Supabase:', e)
          showToast('⚠️ Sauvegarde locale uniquement')
        }
      }

      // Fallback local (démo ou erreur Supabase)
      const newProd: ProduitEtendu = {
        id: 'local_' + Date.now(),
        nom: modalProd.nom, desc: modalProd.desc,
        prix: parseFloat(modalProd.prix) || 0,
        icon: modalProd.icon, stock: parseInt(modalProd.stock) || 0,
        photo: modalProd.photoUrl, photoUrl: modalProd.photoUrl,
        decoupes: modalProd.decoupes.split(',').map(s => s.trim()).filter(Boolean),
        preparation: modalProd.preparation.split(',').map(s => s.trim()).filter(Boolean),
        boucherieId: modalProd.boucherieId, boucherieNom,
        cat: modalProd.cat as any, venteType: modalProd.venteType as any,
      }
      setProduits(prev => {
        const next = [...prev, newProd]
        boucherStore.setProduits(myBoucherieId, next)
        if (user?.email) boucherStore.registerBoucher(user.email, myBoucherieId)
        return next
      })
      showToast('✅ Produit créé !')
    } else {
      setProduits(prev => prev.map(p => {
        if (p.id !== modalProd.id) return p
        return {
          ...p,
          nom: modalProd.nom,
          desc: modalProd.desc,
          prix: parseFloat(modalProd.prix) || p.prix,
          icon: modalProd.icon,
          stock: parseInt(modalProd.stock) || 0,
          photoUrl: modalProd.photoUrl,
          photo: modalProd.photoUrl,
          decoupes: modalProd.decoupes.split(',').map(s => s.trim()).filter(Boolean),
          preparation: modalProd.preparation.split(',').map(s => s.trim()).filter(Boolean),
        }
      }))
      // Sync Supabase
      if (!user?.isDemo && supabase) {
        supabase.updateProduit(modalProd.id, {
          ...modalProd,
          desc: modalProd.desc,
          photoUrl: modalProd.photoUrl,
        }).catch(console.error)
      }
      showToast('✅ Produit mis à jour !')
    }
    setModalProd(null)
  }

  function deleteProd(id: string) {
    if (!confirm('Supprimer ce produit ?')) return
    setProduits(prev => { const next = prev.filter(p => p.id !== id); boucherStore.setProduits(myBoucherieId, next); return next })
    if (!user?.isDemo && supabase) {
      supabase.deleteProduit(id).catch(console.error)
    }
    showToast('️ Produit supprimé')
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !modalProd) return
    setModalProd(f => f ? { ...f, photoUrl: URL.createObjectURL(file) } : f)
    showToast(' Photo ajoutée !')
    e.target.value = ''
  }

  function updateHoraire(key: string, field: keyof HoraireJour, value: string | boolean) {
    setBoutiquePersist(b => ({
      ...b,
      horaires: {
        ...b.horaires,
        [key]: { ...b.horaires[key], [field]: value },
      },
    }))
    setBoutiqueEdited(true)
  }

  function addPromo() {
    const newPromo: Promo = { id: Date.now().toString(), titre: '', description: '', type: 'message', valeur: '', dateDebut: '', dateFin: '', active: true }
    setBoutiquePersist(b => ({ ...b, promotions: [...b.promotions, newPromo] }))
    setBoutiqueEdited(true)
  }

  function updatePromo(idx: number, field: keyof Promo, value: string | boolean) {
    setBoutiquePersist(b => {
      const p = [...b.promotions]
      p[idx] = { ...p[idx], [field]: value }
      return { ...b, promotions: p }
    })
    setBoutiqueEdited(true)
  }

  function removePromo(idx: number) {
    setBoutiquePersist(b => ({ ...b, promotions: b.promotions.filter((_, i) => i !== idx) }))
    setBoutiqueEdited(true)
  }

  // ── Écran non-boucher ──────────────────────────────────────────────────────
  if (!user || !isBoucher()) {
    return (
      <div className="min-h-screen bg-creme flex flex-col items-center justify-center px-5 pb-10">
        <div className="text-center max-w-sm">
          <span className="text-6xl block mb-4"></span>
          <h1 className="font-serif text-2xl font-black text-brun mb-2">Espace Boucher</h1>
          <p className="text-gray-400 text-sm mb-6">Connectez-vous avec votre compte boucher pour accéder à votre tableau de bord.</p>
          <button className="w-full bg-brun text-white py-3.5 rounded-xl font-bold text-sm font-sans hover:bg-rouge-vif transition-colors"
            onClick={() => setAuthOpen(true)}> Connexion Boucher</button>
          <button className="w-full mt-3 bg-white border border-gris-bd text-brun py-3 rounded-xl font-semibold text-sm font-sans"
            onClick={() => router.push('/')}>← Retour à l'accueil</button>
        </div>
        {authOpen && <AuthModal onClose={() => setAuthOpen(false)} defaultRole="boucher" />}
      </div>
    )
  }

  // ── Interface boucher ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-creme" style={{ paddingBottom: 88 }}>

      {/* Header */}
      <div className="bg-brun px-4 py-3.5 flex justify-between items-center sticky top-0 z-10">
        <div>
          <span className="font-serif text-base font-black text-or"> {myBoucherie?.nom || 'Votre boucherie'}</span>
          <p className="text-white/55 text-xs mt-0.5">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} · {user.nom}
          </p>
        </div>
        <button className="bg-white/15 border border-white/25 rounded-xl px-3 py-1.5 text-white text-xs font-semibold"
          onClick={() => { logout(); router.push('/') }}>
          Déconnexion
        </button>
      </div>



      <div className="px-4 max-w-2xl mx-auto">

        {/* ══ COMMANDES ══ */}
        {tab === 'commandes' && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                className={'flex-1 py-2.5 rounded-xl text-xs font-bold font-sans border ' + (!showHistorique ? 'bg-brun text-white border-brun' : 'bg-white text-gray-500 border-gray-200')}
                onClick={() => setShowHistorique(false)}>
                 En cours ({orders.length})
              </button>
              <button
                className={'flex-1 py-2.5 rounded-xl text-xs font-bold font-sans border ' + (showHistorique ? 'bg-brun text-white border-brun' : 'bg-white text-gray-500 border-gray-200')}
                onClick={() => setShowHistorique(true)}>
                ️ Historique ({historique.length})
              </button>
            </div>

            {!showHistorique && (
              orders.length === 0
                ? (
                  <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm">
                    <span className="text-4xl block mb-2">✅</span>
                    <p className="text-sm font-semibold">Aucune commande en cours</p>
                  </div>
                )
                : orders.map(o => {
                  const sousTotal = o.lignes.reduce((s, l) => s + l.prix * l.qty, 0)
                  const total = sousTotal + o.frais
                  return (
                    <div key={o.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                      <div className="px-4 py-3 border-b border-gris-bd flex justify-between items-center">
                        <div>
                          <span className="font-black text-brun text-sm">{o.id}</span>
                          <span className="text-gray-400 text-xs ml-2">{o.heure}</span>
                        </div>
                        <span className={'text-[11px] font-bold px-2.5 py-1 rounded-full ' + SC[o.status]}>{SL[o.status]}</span>
                      </div>
                      <div className="px-4 py-3 border-b border-gris-bd flex justify-between items-start">
                        <div>
                          <p className="text-sm font-bold text-brun">{o.client}</p>
                          <p className="text-xs text-gray-400"> {o.adresse}</p>
                          <p className="text-xs text-or font-semibold mt-0.5"> {o.creneau}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-rouge-vif">{total.toFixed(2)} €</p>
                        </div>
                      </div>
                      <div className="px-4 py-2">
                        {o.lignes.map((l, i) => (
                          <div key={i} className={'flex items-start gap-2 py-2 ' + (i < o.lignes.length - 1 ? 'border-b border-gris-bd' : '')}>
                            <span className="text-base flex-shrink-0">{l.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-brun">{l.produit} <span className="text-gray-400 font-normal">×{l.qty}</span></p>
                              <p className="text-[11px] text-or font-semibold">✂️ {l.decoupe} · {l.preparation}</p>
                              {l.note ? <p className="text-[11px] text-gray-400 italic"> {l.note}</p> : null}
                            </div>
                            <span className="text-xs font-bold text-brun flex-shrink-0">{(l.prix * l.qty).toFixed(2)} €</span>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-3 border-t border-gris-bd flex gap-2">
                        <button className="flex-1 bg-or-pale border border-or/30 text-brun-clair text-xs font-bold py-2 rounded-xl font-sans"
                          onClick={() => setViewOrder(o)}> Récap</button>
                        <a href={'tel:' + o.tel} className="bg-blue-50 border border-blue-200 text-blue-500 text-xs font-bold px-3 py-2 rounded-xl font-sans flex items-center gap-1">📞</a>
                        {o.status === 'new' ? (
                          <>
                            <button className="flex-1 bg-red-50 border border-red-200 text-red-500 text-xs font-bold py-2 rounded-xl font-sans"
                              onClick={() => { setOrdersPersist(prev => prev.filter(x => x.id !== o.id)); showToast('❌ Commande refusée') }}>
                              Refuser
                            </button>
                            <button className="flex-1 bg-brun text-white text-xs font-bold py-2 rounded-xl font-sans"
                              onClick={() => progress(o.id)}>
                              ✅ Accepter
                            </button>
                          </>
                        ) : o.status !== 'done' ? (
                          <button className="flex-1 bg-brun text-white text-xs font-bold py-2 rounded-xl font-sans"
                            onClick={() => progress(o.id)}>{BL[o.status]} →</button>
                        ) : null}
                      </div>
                    </div>
                  )
                })
            )}

            {showHistorique && (
              historique.length === 0
                ? (
                  <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm">
                    <span className="text-4xl block mb-2">️</span>
                    <p className="text-sm">Aucune commande archivée</p>
                  </div>
                )
                : historique.map(o => {
                  const total = o.lignes.reduce((s, l) => s + l.prix * l.qty, 0) + o.frais
                  return (
                    <div key={o.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                      <div className="px-4 py-3 bg-gris-bd flex justify-between items-center">
                        <div>
                          <span className="font-black text-brun text-sm">{o.id}</span>
                          <span className="text-gray-400 text-xs ml-2">{o.date} · {o.heure}</span>
                        </div>
                        <span className="bg-green-100 text-green-600 text-[11px] font-bold px-2.5 py-1 rounded-full">✅ Livrée</span>
                      </div>
                      <div className="px-4 py-3 flex justify-between items-center border-b border-gris-bd">
                        <div>
                          <p className="text-sm font-bold text-brun">{o.client}</p>
                          <p className="text-xs text-gray-400">{o.lignes.length} article{o.lignes.length > 1 ? 's' : ''}</p>
                        </div>
                        <p className="text-sm font-black text-brun">{total.toFixed(2)} €</p>
                      </div>
                      <div className="px-4 py-3">
                        <button className="w-full bg-or-pale border border-or/30 text-brun-clair text-xs font-bold py-2 rounded-xl font-sans"
                          onClick={() => setViewOrder(o)}> Voir le récapitulatif</button>
                      </div>
                    </div>
                  )
                })
            )}
          </div>
        )}

        {/* ══ PRODUITS ══ */}
        {tab === 'produits' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gris-bd bg-or-pale">
              <div>
                <p className="font-bold text-brun text-sm">{myBoucherie?.nom}</p>
                <p className="text-xs text-gray-400">{myProduits.filter(p => (p as any).actif !== false).length} produit{myProduits.filter(p => (p as any).actif !== false).length > 1 ? 's' : ''} actif{myProduits.filter(p => (p as any).actif !== false).length > 1 ? 's' : ''} · {myProduits.length} total</p>
              </div>
              <button className="bg-brun text-white text-xs font-bold px-3 py-1.5 rounded-lg font-sans" onClick={openNew}>+ Ajouter</button>
            </div>
            {myProduits.length === 0
              ? <div className="text-center py-10 text-gray-400 text-sm">Aucun produit — <button className="text-or font-semibold" onClick={openNew}>en ajouter un</button></div>
              : myProduits.map((p, i) => {
                const isActif = (p as any).actif !== false

                function toggleActif() {
                  const newActif = !isActif
                  // Mettre à jour localement
                  setProduits(prev => {
                    const next = prev.map(x => x.id === p.id ? { ...x, actif: newActif } : x)
                    boucherStore.setProduits(myBoucherieId, next)
                    return next
                  })
                  // Sync Supabase
                  if (!user?.isDemo) {
                    fetch('/api/produits', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: p.id, actif: newActif }),
                    }).catch(console.error)
                  }
                  showToast(newActif ? '✅ Produit activé' : '⏸️ Produit masqué')
                }

                return (
                <div key={p.id} className={'p-3 transition-opacity ' + (i < myProduits.length - 1 ? 'border-b border-gris-bd' : '') + (!isActif ? ' opacity-50' : '')}>
                  {/* Ligne 1 : photo + nom + toggle */}
                  <div className="flex items-center gap-2.5">
                    {p.photoUrl
                      ? <img src={p.photoUrl} alt={p.nom} className="rounded-xl object-cover flex-shrink-0" style={{ width: 48, height: 48 }} />
                      : <div className="rounded-xl bg-or-pale flex items-center justify-center text-xl flex-shrink-0" style={{ width: 48, height: 48 }}>{p.icon}</div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className={'font-bold text-sm truncate ' + (isActif ? 'text-brun' : 'text-gray-400 line-through')}>{p.nom}</p>
                      <p className="text-xs text-gray-400 truncate">{p.desc}</p>
                    </div>
                    {/* Toggle bien aligné à droite */}
                    <button
                      className={'w-11 h-6 rounded-full relative transition-colors flex-shrink-0 ' + (isActif ? 'bg-green-400' : 'bg-gray-200')}
                      onClick={toggleActif}>
                      <span className={'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ' + (isActif ? 'translate-x-5' : 'translate-x-0.5')} />
                    </button>
                  </div>
                  {/* Ligne 2 : prix + stock + actions */}
                  <div className="flex items-center gap-2 mt-2 pl-[56px]">
                    <span className="text-xs font-bold text-rouge-vif">{p.prix.toFixed(2)} €</span>
                    <span className={'text-[10px] font-bold px-1.5 py-0.5 rounded-full ' + (p.stock === 0 ? 'bg-red-100 text-red-500' : p.stock <= 4 ? 'bg-orange-100 text-orange-500' : 'bg-green-100 text-green-600')}>
                      {p.stock === 0 ? 'Rupture' : String(p.stock)}
                    </span>
                    {!p.photoUrl && <span className="text-[10px] bg-orange-100 text-orange-500 px-1.5 py-0.5 rounded-full font-bold">📷</span>}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button className="bg-or-pale border border-or/30 text-brun-clair text-xs font-bold px-2.5 py-1.5 rounded-lg font-sans" onClick={() => openEdit(p)}>✏️</button>
                      <button className="bg-red-50 border border-red-200 text-red-400 text-xs font-bold px-2.5 py-1.5 rounded-lg font-sans" onClick={() => deleteProd(p.id)}>🗑️</button>
                    </div>
                  </div>
                </div>
                )
              })
            }
          </div>
        )}

        {/* ══ BOUTIQUE ══ */}
        {tab === 'boutique' && (
          <div className="space-y-4">

            {/* Aperçu */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Aperçu côté client</p>
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border-2 border-or/30">
                <div className="w-full h-28 bg-gradient-to-br from-brun to-brun-clair flex items-center justify-center relative">
                  <span className="text-white/20 font-serif text-5xl font-black">{boutique.nom ? boutique.nom[0] : ''}</span>
                  <span className="absolute top-2 left-2 bg-or text-brun text-[10px] font-bold px-2 py-0.5 rounded-lg">
                    {boutique.promo ? '️ Promo' : ' Artisan'}
                  </span>
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-serif text-sm font-bold text-brun">{boutique.nom || 'Nom de votre boutique'}</span>
                    <span className="text-xs text-or">⭐ —</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">{boutique.desc || 'Votre description apparaîtra ici…'}</p>
                  <div className="flex justify-between items-center pt-2 border-t border-gris-bd">
                    <span className="text-[11px] text-gray-400"> ~30 min ·  Click &amp; Collect</span>
                    <span className="bg-brun text-white text-[11px] font-semibold px-3 py-1 rounded-lg">Voir</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Infos */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-or-pale border-b border-gris-bd">
                <p className="font-bold text-brun text-sm"> Informations</p>
              </div>
              <div className="p-4 space-y-3">
                {([['nom', 'Nom de la boutique', 'Boucherie Dupont'], ['tel', 'Téléphone', '01 23 45 67 89'], ['email', 'Email', 'contact@maboucherie.fr'], ['adresse', 'Adresse', '12 rue du Marché']] as const).map(([k, l, ph]) => (
                  <div key={k}>
                    <label className="text-xs font-bold text-brun block mb-1">{l}</label>
                    <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                      placeholder={ph}
                      value={boutique[k] as string}
                      onChange={e => { setBoutiquePersist(b => ({ ...b, [k]: e.target.value })); setBoutiqueEdited(true) }} />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-bold text-brun block mb-1">Description</label>
                  <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun resize-none" rows={3}
                    placeholder="Vos spécialités, votre histoire…"
                    value={boutique.desc}
                    onChange={e => { setBoutiquePersist(b => ({ ...b, desc: e.target.value })); setBoutiqueEdited(true) }} />
                </div>
              </div>
            </div>

            {/* Promotions */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-or-pale border-b border-gris-bd flex justify-between items-center">
                <p className="font-bold text-brun text-sm">️ Promotions</p>
                <button className="bg-brun text-white text-xs font-bold px-3 py-1.5 rounded-lg font-sans" onClick={addPromo}>+ Ajouter</button>
              </div>
              {boutique.promotions.length === 0
                ? <div className="p-5 text-center text-gray-400"><span className="text-3xl block mb-2">️</span><p className="text-sm">Aucune promotion active.</p></div>
                : <div className="divide-y divide-gris-bd">
                    {boutique.promotions.map((promo, idx) => (
                      <div key={promo.id} className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <button className={'w-10 h-5 rounded-full relative transition-colors ' + (promo.active ? 'bg-green-400' : 'bg-gray-200')}
                              onClick={() => updatePromo(idx, 'active', !promo.active)}>
                              <span className={'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ' + (promo.active ? 'translate-x-5' : 'translate-x-0.5')} />
                            </button>
                            <span className={'text-xs font-bold ' + (promo.active ? 'text-green-600' : 'text-gray-400')}>{promo.active ? 'Active' : 'Inactive'}</span>
                          </div>
                          <button className="text-red-400 text-xs font-bold bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg font-sans"
                            onClick={() => removePromo(idx)}>️</button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {['message', 'reduction', 'livraison', 'offre'].map(val => (
                            <button key={val} className={'px-3 py-1.5 rounded-full border text-xs font-semibold font-sans ' + (promo.type === val ? 'bg-brun text-white border-brun' : 'border-gray-200 text-gray-500')}
                              onClick={() => updatePromo(idx, 'type', val)}>{val}</button>
                          ))}
                        </div>
                        <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                          placeholder="Titre affiché…" value={promo.titre}
                          onChange={e => updatePromo(idx, 'titre', e.target.value)} />
                        <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                          placeholder="Description…" value={promo.description}
                          onChange={e => updatePromo(idx, 'description', e.target.value)} />
                        {promo.titre ? (
                          <div className="bg-rouge-pale border border-rouge-vif/20 rounded-xl p-2.5">
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Aperçu client</p>
                            <p className="text-xs text-rouge-vif font-bold">{promo.titre}</p>
                            {promo.description ? <p className="text-xs text-gray-500 mt-0.5">{promo.description}</p> : null}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
              }
            </div>

            {/* Apparence */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-or-pale border-b border-gris-bd">
                <p className="font-bold text-brun text-sm"> Apparence</p>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-xs font-bold text-brun block mb-2">Badge sur la carte</label>
                  <div className="flex flex-wrap gap-2">
                    {[['Aucun', '—'], ['Promo', '️'], ['Nouveau', '✨'], ['Populaire', ''], ['Premium', '⭐']].map(([b, ico]) => (
                      <button key={b}
                        className={'px-3 py-1.5 rounded-full border text-xs font-semibold font-sans ' + ((b === 'Aucun' && !boutique.promo) || (b === 'Promo' && boutique.promo) ? 'bg-brun text-white border-brun' : 'border-gray-200 text-gray-500')}
                        onClick={() => { setBoutiquePersist(bq => ({ ...bq, promo: b === 'Promo' })); setBoutiqueEdited(true) }}>
                        {ico} {b}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-brun block mb-1">Photo de couverture</label>
                  <button className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-sm text-gray-400 font-sans"> Changer la photo</button>
                </div>
              </div>
            </div>

            {/* Horaires */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-or-pale border-b border-gris-bd">
                <p className="font-bold text-brun text-sm"> Horaires d'ouverture</p>
              </div>
              <div className="p-4 space-y-4">
                {JOURS.map(([key, label]) => {
                  const h = boutique.horaires[key]
                  return (
                    <div key={key}>
                      <div className="flex items-center gap-3 mb-2">
                        <button
                          className={'w-10 h-5 rounded-full relative transition-colors flex-shrink-0 ' + (h.ouvert ? 'bg-green-400' : 'bg-gray-200')}
                          onClick={() => updateHoraire(key, 'ouvert', !h.ouvert)}>
                          <span className={'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ' + (h.ouvert ? 'translate-x-5' : 'translate-x-0.5')} />
                        </button>
                        <span className={'text-sm font-bold flex-1 ' + (h.ouvert ? 'text-brun' : 'text-gray-300')}>{label}</span>
                        {!h.ouvert && <span className="text-xs text-gray-400 italic">Fermé</span>}
                      </div>
                      {h.ouvert && (
                        <div className="space-y-2 pl-4 border-l-2 border-gris-bd ml-3">
                          <div className="flex items-center gap-2">
                            <button className={'w-8 h-4 rounded-full relative transition-colors flex-shrink-0 ' + (h.matin ? 'bg-or' : 'bg-gray-200')}
                              onClick={() => updateHoraire(key, 'matin', !h.matin)}>
                              <span className={'absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ' + (h.matin ? 'translate-x-4' : 'translate-x-0.5')} />
                            </button>
                            <span className={'text-xs font-semibold w-14 flex-shrink-0 ' + (h.matin ? 'text-brun' : 'text-gray-300')}>Matin</span>
                            {h.matin ? (
                              <div className="flex items-center gap-1.5 flex-1">
                                <input type="time" className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs font-sans outline-none focus:border-brun min-w-0"
                                  value={h.matinDebut} onChange={e => updateHoraire(key, 'matinDebut', e.target.value)} />
                                <span className="text-xs text-gray-300">→</span>
                                <input type="time" className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs font-sans outline-none focus:border-brun min-w-0"
                                  value={h.matinFin} onChange={e => updateHoraire(key, 'matinFin', e.target.value)} />
                              </div>
                            ) : <span className="text-xs text-gray-300 italic">Fermé le matin</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <button className={'w-8 h-4 rounded-full relative transition-colors flex-shrink-0 ' + (h.am ? 'bg-or' : 'bg-gray-200')}
                              onClick={() => updateHoraire(key, 'am', !h.am)}>
                              <span className={'absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ' + (h.am ? 'translate-x-4' : 'translate-x-0.5')} />
                            </button>
                            <span className={'text-xs font-semibold w-14 flex-shrink-0 ' + (h.am ? 'text-brun' : 'text-gray-300')}>Après-m.</span>
                            {h.am ? (
                              <div className="flex items-center gap-1.5 flex-1">
                                <input type="time" className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs font-sans outline-none focus:border-brun min-w-0"
                                  value={h.amDebut} onChange={e => updateHoraire(key, 'amDebut', e.target.value)} />
                                <span className="text-xs text-gray-300">→</span>
                                <input type="time" className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs font-sans outline-none focus:border-brun min-w-0"
                                  value={h.amFin} onChange={e => updateHoraire(key, 'amFin', e.target.value)} />
                              </div>
                            ) : <span className="text-xs text-gray-300 italic">Fermé l'après-midi</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>



            {boutiqueEdited && (
              <button className="w-full bg-green-500 text-white font-bold py-3.5 rounded-2xl text-sm font-sans active:bg-green-600"
                onClick={() => { setBoutiqueEdited(false); showToast('✅ Boutique mise à jour !') }}>
                 Enregistrer les modifications
              </button>
            )}
          </div>
        )}

        {/* ══ PARAMÈTRES GÉNÉRAUX ══ */}
        {tab === 'parametres' && (
          <ParamsNav user={user} showToast={showToast} historique={historique} logout={logout} router={router} />
        )}
      </div>

      {/* ══ MODAL RÉCAP COMMANDE ══ */}
      {viewOrder && (() => {
        const o = viewOrder
        const sousTotal = o.lignes.reduce((s, l) => s + l.prix * l.qty, 0)
        const total = sousTotal + o.frais
        return (
          <div className="fixed inset-0 bg-black/65 z-[200] flex items-end justify-center" onClick={() => setViewOrder(null)}>
            <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[92dvh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center px-5 py-4 border-b border-gris-bd sticky top-0 bg-white z-10">
                <div>
                  <h2 className="font-serif text-lg font-black text-brun"> Récap {o.id}</h2>
                  <p className="text-xs text-gray-400">{o.date} à {o.heure}</p>
                </div>
                <button className="bg-gris-bd rounded-full w-8 h-8 text-sm flex items-center justify-center" onClick={() => setViewOrder(null)}>✕</button>
              </div>
              <div className="p-5 space-y-4">
                <div className={'flex items-center gap-2 px-4 py-3 rounded-xl ' + (o.status === 'done' ? 'bg-green-50 border border-green-200' : 'bg-or-pale border border-or/20')}>
                  <span className="text-lg">{o.status === 'done' ? '✅' : '⏳'}</span>
                  <div>
                    <p className={'text-sm font-bold ' + (o.status === 'done' ? 'text-green-700' : 'text-brun')}>
                      {o.status === 'done' ? 'Commande livrée' : 'En cours — ' + SL[o.status]}
                    </p>
                    <p className="text-xs text-gray-400">Créneau : {o.creneau}</p>
                  </div>
                </div>
                <div className="bg-creme rounded-2xl p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Client</p>
                  <p className="text-sm font-bold text-brun">{o.client}</p>
                  <p className="text-xs text-gray-500 mt-0.5"> {o.tel}</p>
                  <p className="text-xs text-gray-500 mt-0.5"> {o.adresse}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Articles</p>
                  <div className="bg-white border border-gris-bd rounded-2xl overflow-hidden">
                    {o.lignes.map((l, i) => (
                      <div key={i} className={'px-4 py-3 ' + (i < o.lignes.length - 1 ? 'border-b border-gris-bd' : '')}>
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-brun">{l.icon} {l.produit}</p>
                            <p className="text-[11px] text-or font-semibold mt-0.5">✂️ {l.decoupe} · {l.preparation}</p>
                            {l.note ? <p className="text-[11px] text-gray-400 italic mt-0.5"> {l.note}</p> : null}
                          </div>
                          <div className="text-right flex-shrink-0 ml-3">
                            <p className="text-xs text-gray-400">{l.qty} × {l.prix.toFixed(2)} €</p>
                            <p className="text-sm font-black text-brun">{(l.prix * l.qty).toFixed(2)} €</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Détail financier</p>
                  <div className="bg-white border border-gris-bd rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between text-xs text-gray-500"><span>Sous-total</span><span>{sousTotal.toFixed(2)} €</span></div>
                    <div className="flex justify-between text-xs text-gray-500"><span>Livraison</span><span>{o.frais === 0 ? 'Offerts' : o.frais.toFixed(2) + ' €'}</span></div>
                    <div className="flex justify-between text-sm font-black text-brun border-t border-gris-bd pt-2"><span>Total</span><span>{total.toFixed(2)} €</span></div>
                  </div>
                </div>
                <div className="flex gap-3 pb-2">
                  <button className="flex-1 bg-gris-bd text-brun font-semibold py-3 rounded-xl text-sm font-sans" onClick={() => setViewOrder(null)}>Fermer</button>
                  {o.status !== 'done' && (
                    <button className="flex-[2] bg-brun text-white font-bold py-3 rounded-xl text-sm font-sans"
                      onClick={() => { progress(o.id); setViewOrder(null) }}>
                      {BL[o.status]} →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ══ MODAL PRODUIT ══ */}
      {modalProd && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center" onClick={() => setModalProd(null)}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-5 py-4 border-b border-gris-bd sticky top-0 bg-white z-10">
              <h2 className="font-serif text-lg font-black text-brun">{isNew ? '+ Nouveau produit' : '✏️ Modifier'}</h2>
              <button className="bg-gris-bd rounded-full w-8 h-8 text-sm flex items-center justify-center" onClick={() => setModalProd(null)}>✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-brun block mb-2"> Photo</label>
                <div className="flex items-center gap-3">
                  {modalProd.photoUrl
                    ? <img src={modalProd.photoUrl} alt="Photo" className="w-20 h-20 rounded-xl object-cover border border-gris-bd" />
                    : <div className="w-20 h-20 rounded-xl bg-or-pale flex items-center justify-center text-3xl border-2 border-dashed border-or/30">{modalProd.icon}</div>
                  }
                  <div className="flex flex-col gap-2">
                    <button className="bg-brun text-white text-xs font-bold px-4 py-2 rounded-xl font-sans" onClick={() => fileRef.current?.click()}>
                      {modalProd.photoUrl ? ' Changer' : ' Ajouter'}
                    </button>
                    {modalProd.photoUrl && (
                      <button className="bg-red-50 text-red-400 text-xs font-bold px-4 py-2 rounded-xl font-sans border border-red-200"
                        onClick={() => setModalProd(f => f ? { ...f, photoUrl: null } : f)}>️ Supprimer</button>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-brun block mb-1.5">Icône</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(ico => (
                    <button key={ico}
                      className={'w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all font-sans ' + (modalProd.icon === ico ? 'bg-brun scale-110' : 'bg-gris-bd')}
                      onClick={() => setModalProd(f => f ? { ...f, icon: ico } : f)}>{ico}</button>
                  ))}
                </div>
              </div>
              {[['nom', 'Nom *', 'Entrecôte Charolais'], ['desc', 'Description', '500g, persillé idéal']].map(([k, l, ph]) => (
                <div key={k}>
                  <label className="text-xs font-bold text-brun block mb-1.5">{l}</label>
                  <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                    placeholder={ph}
                    value={(modalProd as any)[k]}
                    onChange={e => setModalProd(f => f ? { ...f, [k]: e.target.value } : f)} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                {[['prix', 'Prix (€) *', '18.90'], ['stock', 'Stock', '10']].map(([k, l, ph]) => (
                  <div key={k}>
                    <label className="text-xs font-bold text-brun block mb-1.5">{l}</label>
                    <input type="number" min="0"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                      placeholder={ph}
                      value={(modalProd as any)[k]}
                      onChange={e => setModalProd(f => f ? { ...f, [k]: e.target.value } : f)} />
                  </div>
                ))}
              </div>

              {/* Catégorie + Type de vente */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-brun block mb-1.5">Catégorie</label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun bg-white"
                    value={modalProd.cat}
                    onChange={e => setModalProd(f => f ? { ...f, cat: e.target.value } : f)}>
                    {['Bœuf','Veau','Agneau','Volaille','Porc','Entrée'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-brun block mb-1.5">Vendu</label>
                  <div className="flex flex-col gap-1.5">
                    {[['pièce','🔢 À la pièce'],['poids','⚖️ Au poids']].map(([v,l]) => (
                      <button key={v}
                        className={'py-2 rounded-xl border-2 text-xs font-bold font-sans transition-all ' + (modalProd.venteType === v ? 'bg-brun text-white border-brun' : 'border-gray-200 text-gray-500')}
                        onClick={() => setModalProd(f => f ? { ...f, venteType: v } : f)}>{l}</button>
                    ))}
                  </div>
                </div>
              </div>

              {[['decoupes', '✂️ Découpes', 'Standard, Fine, Épaisse'], ['preparation', ' Préparations', 'Nature, Marinée, BBQ']].map(([k, l, ph]) => (
                <div key={k}>
                  <label className="text-xs font-bold text-brun block mb-1.5">{l} <span className="text-gray-400 font-normal">(virgules)</span></label>
                  <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                    placeholder={ph}
                    value={(modalProd as any)[k]}
                    onChange={e => setModalProd(f => f ? { ...f, [k]: e.target.value } : f)} />
                </div>
              ))}
              {/* Allergènes obligatoires */}
              <div>
                <label className="text-xs font-bold text-brun block mb-1.5">
                  ⚠️ Allergènes <span className="text-rouge-vif">*</span>
                  <span className="text-gray-400 font-normal ml-1">(obligation légale)</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['Gluten','Crustacés','Œufs','Poisson','Arachides','Soja','Lait','Fruits à coque','Céleri','Moutarde','Sésame','Sulfites','Lupin','Mollusques','Aucun'].map(a => {
                    const selected = (modalProd.allergenes || '').split(',').map(s => s.trim()).filter(Boolean).includes(a)
                    return (
                      <button key={a}
                        className={'px-2 py-1 rounded-full text-[10px] font-semibold border transition-all font-sans ' + (selected ? 'bg-brun text-white border-brun' : 'border-gray-200 text-gray-500')}
                        onClick={() => {
                          const current = (modalProd.allergenes || '').split(',').map(s => s.trim()).filter(Boolean)
                          const next = selected ? current.filter(x => x !== a) : a === 'Aucun' ? ['Aucun'] : [...current.filter(x => x !== 'Aucun'), a]
                          setModalProd(f => f ? { ...f, allergenes: next.join(', ') } : f)
                        }}>
                        {a}
                      </button>
                    )
                  })}
                </div>
                {!(modalProd.allergenes) && <p className="text-[10px] text-rouge-vif mt-1">⚠️ Sélectionnez au moins "Aucun"</p>}
              </div>

              <div className="flex gap-3 pt-2 pb-4">
                <button className="flex-1 bg-gris-bd text-brun rounded-xl py-3 text-sm font-semibold font-sans" onClick={() => setModalProd(null)}>Annuler</button>
                <button className="flex-[2] bg-brun text-white rounded-xl py-3 text-sm font-bold font-sans" onClick={saveProduit}>
                  {isNew ? '✅ Créer' : '✅ Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-brun text-white px-5 py-2.5 rounded-xl text-sm font-semibold z-50 shadow-xl whitespace-nowrap">
          {toastMsg}
        </div>
      )}

      <BottomNavBoucher currentTab={tab} onTabChange={setTab} />
    </div>
  )

// ── Navigation paramètres boucher ────────────────────────────────────────────
type ParamsSection = 'compte' | 'alertes' | 'paiements' | 'support' | 'cgu' | null

function ParamsNav({ user, showToast, historique, logout, router }: {
  user: any; showToast: (m: string) => void; historique: any[]
  logout: () => void; router: any
}) {
  const [section, setSection] = useState<ParamsSection>(null)

  // ── Avatar header ──────────────────────────────────────────────────────────
  const header = (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-full bg-brun text-white text-2xl flex items-center justify-center flex-shrink-0">🔪</div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-brun text-sm truncate">{user?.nom || 'Mon compte'}</p>
        <p className="text-xs text-gray-400 truncate">{user?.email} · Boucher</p>
      </div>
      {user?.isDemo && <span className="bg-or/20 border border-or/40 text-or text-[9px] font-bold px-2 py-0.5 rounded-full">DÉMO</span>}
    </div>
  )

  // ── Sous-pages ─────────────────────────────────────────────────────────────
  if (section === 'compte') return (
    <div className="space-y-4">
      {header}
      <button className="flex items-center gap-2 text-brun font-semibold text-sm font-sans mb-2" onClick={() => setSection(null)}>← Mon compte</button>
      <BoucherProfilForm user={user} showToast={showToast} />
      <MdpSectionBoucher showToast={showToast} />
    </div>
  )

  if (section === 'alertes') return (
    <div className="space-y-4">
      {header}
      <button className="flex items-center gap-2 text-brun font-semibold text-sm font-sans mb-2" onClick={() => setSection(null)}>← Alertes</button>
      <BoucherNotifsForm />
    </div>
  )

  if (section === 'paiements') return (
    <div className="space-y-4">
      {header}
      <button className="flex items-center gap-2 text-brun font-semibold text-sm font-sans mb-2" onClick={() => setSection(null)}>← Paiements</button>
      <StripePaiementSection email={user?.email || ''} boutiqueName={user?.boucherieNom} showToast={showToast} />
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-1">Chiffre d'affaires</p>
        <CaSelector historique={historique} />
      </div>
    </div>
  )

  if (section === 'support') return (
    <div className="space-y-4">
      {header}
      <button className="flex items-center gap-2 text-brun font-semibold text-sm font-sans mb-2" onClick={() => setSection(null)}>← Support</button>
      <div className="bg-brun rounded-2xl p-5 text-center">
        <span className="text-4xl block mb-2">💬</span>
        <p className="text-white font-bold text-sm mb-1">Réponse garantie sous 2h</p>
        <p className="text-white/60 text-xs mb-3">Lun–Ven 8h–20h · Sam 9h–18h</p>
        <a href="mailto:support@boucheriedelivery.fr" className="inline-block bg-or text-brun text-xs font-bold px-5 py-2 rounded-xl no-underline">✉️ Envoyer un email</a>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        {[
          { q: "Comment modifier mes produits ?", a: "Allez dans l'onglet Produits, appuyez sur ✏️ à côté du produit à modifier." },
          { q: "Comment recevoir mes paiements ?", a: "Les virements sont effectués chaque lundi sur votre compte Stripe Connect." },
          { q: "Comment signaler un problème de livraison ?", a: "Contactez-nous par email avec le numéro de commande concerné." },
          { q: "Comment changer mes horaires ?", a: "Allez dans l'onglet Boutique, section Horaires." },
        ].map((faq, i, arr) => {
          const [open, setOpen] = useState(false)
          return (
            <div key={i} className={i < arr.length - 1 ? 'border-b border-gris-bd pb-3' : ''}>
              <button className="w-full flex justify-between items-start text-left gap-2 font-sans" onClick={() => setOpen(o => !o)}>
                <p className="text-sm font-semibold text-brun">{faq.q}</p>
                <span className="text-gray-400 flex-shrink-0">{open ? '▴' : '▾'}</span>
              </button>
              {open && <p className="text-xs text-gray-500 mt-2 leading-relaxed">{faq.a}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )

  if (section === 'cgu') return (
    <div className="space-y-4">
      {header}
      <button className="flex items-center gap-2 text-brun font-semibold text-sm font-sans mb-2" onClick={() => setSection(null)}>← Conditions</button>
      <div className="bg-or-pale border border-or/20 rounded-xl p-3">
        <p className="text-xs text-brun-clair font-semibold">Contrat partenaire boucher · En vigueur depuis le 13 mai 2026</p>
      </div>
      {[
        { t: "1. Commission", c: "BoucheriesDelivery retient 15% sur chaque commande. Le boucher reçoit 85% du montant des produits, versé chaque lundi." },
        { t: "2. Engagement", c: "Sans engagement de durée. Résiliation possible à tout moment depuis les paramètres. Prise d'effet sous 30 jours." },
        { t: "3. Responsabilité", c: "Le boucher est seul responsable de la qualité, conformité sanitaire et traçabilité de ses produits." },
        { t: "4. Allergènes", c: "Le boucher doit renseigner les 14 allergènes obligatoires sur chaque produit (obligation légale EU n°1169/2011)." },
        { t: "5. Paiements", c: "Les paiements sont gérés par Stripe. BoucheriesDelivery ne stocke jamais les coordonnées bancaires." },
        { t: "6. Propriété", c: "Les photos et descriptions publiées doivent appartenir au boucher ou être libres de droits." },
      ].map((s, i) => (
        <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-serif text-sm font-bold text-brun mb-1.5">{s.t}</h2>
          <p className="text-xs text-gray-500 leading-relaxed">{s.c}</p>
        </div>
      ))}
    </div>
  )

  // ── Menu principal ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {header}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {[
          { ico: '👤', label: 'Mon compte',   sub: 'Profil, email, téléphone, mot de passe', section: 'compte'   as ParamsSection },
          { ico: '🔔', label: 'Alertes',       sub: 'Notifications commandes et stock',       section: 'alertes'  as ParamsSection },
          { ico: '💳', label: 'Paiements',     sub: 'Stripe Connect, historique CA',           section: 'paiements'as ParamsSection },
          { ico: '🆘', label: 'Support',       sub: 'FAQ et contact',                          section: 'support'  as ParamsSection },
          { ico: '📋', label: 'CGU & Contrat', sub: "Conditions partenaire",                   section: 'cgu'      as ParamsSection },
        ].map((item, i, arr) => (
          <button key={item.label}
            className={'w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-creme transition-colors font-sans ' + (i < arr.length - 1 ? 'border-b border-gris-bd' : '')}
            onClick={() => setSection(item.section)}>
            <span className="text-xl flex-shrink-0">{item.ico}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-brun">{item.label}</p>
              <p className="text-xs text-gray-400 truncate">{item.sub}</p>
            </div>
            <span className="text-gray-300 text-base flex-shrink-0">›</span>
          </button>
        ))}
      </div>

      <button className="w-full bg-rouge-pale text-rouge-vif font-bold py-3.5 rounded-2xl text-sm font-sans active:bg-red-100"
        onClick={() => { logout(); router.push('/') }}>
        🚪 Se déconnecter
      </button>
      <p className="text-center text-xs text-gray-300 pb-2">BoucheriesDelivery v1.0.0</p>
    </div>
  )
}

// ── Changement de mot de passe boucher ────────────────────────────────────────
function MdpSectionBoucher({ showToast }: { showToast: (m: string) => void }) {
  const [form, setForm] = useState({ ancien: '', nouveau: '', confirm: '' })
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)

  function valider() {
    if (!form.ancien) { setError('Saisissez votre mot de passe actuel'); return }
    if (form.nouveau.length < 6) { setError('Minimum 6 caractères'); return }
    if (form.nouveau !== form.confirm) { setError('Les mots de passe ne correspondent pas'); return }
    setError('')
    setForm({ ancien: '', nouveau: '', confirm: '' })
    setOpen(false)
    showToast('✅ Mot de passe modifié !')
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left font-sans" onClick={() => setOpen(o => !o)}>
        <span className="text-xl">🔒</span>
        <div className="flex-1"><p className="text-sm font-semibold text-brun">Mot de passe</p><p className="text-xs text-gray-400">Modifier mon mot de passe</p></div>
        <span className="text-gray-300">{open ? '▴' : '›'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gris-bd pt-3">
          {[['ancien','Mot de passe actuel'],['nouveau','Nouveau mot de passe'],['confirm','Confirmer']].map(([k,l]) => (
            <div key={k}>
              <label className="text-xs font-bold text-brun block mb-1">{l}</label>
              <input type="password" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
            </div>
          ))}
          {error && <p className="text-xs text-rouge-vif">{error}</p>}
          <button className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm font-sans" onClick={valider}>Modifier</button>
        </div>
      )}
    </div>
  )
}

// ── Formulaire profil boucher ─────────────────────────────────────────────────
function BoucherProfilForm({ user, showToast }: { user: any; showToast: (msg: string) => void }) {
  const boucherStore = useBoucherStore()
  const { updateUser } = useAuth()
  const email = user?.email || ''

  const saved_profil = boucherStore.getBoucherProfil(email)

  const [form, setForm] = useState({
    prenom:   saved_profil?.prenom   || user?.nom?.split(' ')[0] || '',
    nom:      saved_profil?.nom      || user?.nom?.split(' ').slice(1).join(' ') || '',
    email:    saved_profil?.email    || email,
    tel:      saved_profil?.tel      || '',
    boutique: saved_profil?.boutique || user?.boucherieNom || '',
  })
  const [saved, setSaved] = useState(false)

  function enregistrer() {
    const newEmail = form.email.trim() || email

    // Migrer les données si l'email a changé
    if (newEmail !== email) {
      boucherStore.migrateEmail(email, newEmail)
    }

    // Sauvegarder dans le store boucher
    boucherStore.setBoucherProfil(newEmail, { ...form, email: newEmail })

    // Mettre à jour le store auth — déclenche un re-render de TOUS les composants
    // qui utilisent useAuth() sans rechargement de page
    updateUser({
      nom: `${form.prenom} ${form.nom}`.trim(),
      email: newEmail,
      boucherieNom: form.boutique,
    })

    setSaved(true)
    showToast('✅ Profil mis à jour !')
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-or-pale border-b border-gris-bd">
        <p className="text-xs font-bold text-brun">Informations personnelles</p>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {[['prenom','Prénom'],['nom','Nom']].map(([k,l]) => (
            <div key={k}>
              <label className="text-xs font-bold text-brun block mb-1">{l}</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
            </div>
          ))}
        </div>
        {[['email','Email'],['tel','Téléphone'],['boutique','Nom de la boutique']].map(([k,l]) => (
          <div key={k}>
            <label className="text-xs font-bold text-brun block mb-1">{l}</label>
            <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
              value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
          </div>
        ))}
        {saved && <p className="text-green-600 text-xs font-semibold">✅ Enregistré !</p>}
        <button className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm font-sans" onClick={enregistrer}>
          💾 Enregistrer
        </button>
      </div>
    </div>
  )
}

// ── Notifications boucher ─────────────────────────────────────────────────────
function BoucherNotifsForm() {
  const [prefs, setPrefs] = useState({ nouvelle_cmd: true, stock_faible: true, paiement: true, rapport: false })
  const items = [
    { key: 'nouvelle_cmd', label: 'Nouvelle commande',  sub: 'Son + notification push instantanée' },
    { key: 'stock_faible', label: 'Stock faible',        sub: 'Alerte quand stock ≤ 3' },
    { key: 'paiement',     label: 'Virement reçu',       sub: 'Confirmation chaque lundi' },
    { key: 'rapport',      label: 'Rapport quotidien',   sub: 'CA et commandes chaque soir' },
  ]
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {items.map((item, i) => (
        <div key={item.key} className={"flex items-center gap-3 px-4 py-3.5 " + (i < items.length - 1 ? 'border-b border-gris-bd' : '')}>
          <div className="flex-1">
            <p className="text-sm font-semibold text-brun">{item.label}</p>
            <p className="text-xs text-gray-400">{item.sub}</p>
          </div>
          <button
            className={"w-11 h-6 rounded-full relative transition-colors flex-shrink-0 " + ((prefs as any)[item.key] ? 'bg-green-400' : 'bg-gray-200')}
            onClick={() => setPrefs(p => ({ ...p, [item.key]: !(p as any)[item.key] }))}>
            <span className={"absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform " + ((prefs as any)[item.key] ? 'translate-x-5' : 'translate-x-0.5')} />
          </button>
        </div>
      ))}
    </div>
  )
}

// ── Stripe paiement section ───────────────────────────────────────────────────
function StripePaiementSection({ email, boutiqueName, showToast }: { email: string; boutiqueName?: string; showToast: (msg: string) => void }) {
  const boucherStore = useBoucherStore()
  const account = boucherStore.getStripeAccount(email)
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function connecterNouveauCompte() {
    setLoading(true)
    try {
      const res = await fetch('/api/connect/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          nom_boutique: boutiqueName || 'Boucherie',
          ville: '',
          type: 'boucher',
        }),
      })
      const data = await res.json()
      if (data.onboardingUrl) {
        boucherStore.clearStripeAccount(email)
        window.location.href = data.onboardingUrl
        return
      }
      showToast('❌ ' + (data.error || 'Erreur Stripe — contactez le support'))
    } catch (e: any) {
      showToast('❌ Erreur réseau : ' + (e?.message || 'réessayez'))
    } finally {
      setLoading(false)
    }
  }

  if (!account) return (
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3 text-center">
      <span className="text-3xl block">💳</span>
      <p className="text-sm font-semibold text-brun">Aucun compte Stripe lié</p>
      <p className="text-xs text-gray-400">Configurez votre compte pour recevoir vos paiements chaque lundi.</p>
      <button className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm font-sans" onClick={connecterNouveauCompte} disabled={loading}>
        {loading ? '⏳ Chargement…' : '🔗 Connecter mon compte Stripe'}
      </button>
    </div>
  )

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4 space-y-3">
        <div className={"rounded-xl p-3 flex items-start gap-3 " + (account.chargesEnabled && account.payoutsEnabled ? 'bg-green-50 border border-green-200' : 'bg-or-pale border border-or/20')}>
          <span className="text-xl">{account.chargesEnabled && account.payoutsEnabled ? '✅' : '⏳'}</span>
          <div>
            <p className={"text-sm font-bold " + (account.chargesEnabled && account.payoutsEnabled ? 'text-green-700' : 'text-brun')}>
              {account.chargesEnabled && account.payoutsEnabled ? 'Compte actif' : 'Vérification en cours'}
            </p>
            <p className="text-xs text-gray-400">{account.email} · Virements chaque lundi</p>
          </div>
        </div>
        {!confirming ? (
          <button className="w-full bg-rouge-pale text-rouge-vif border border-rouge-vif/20 py-2.5 rounded-xl text-xs font-bold font-sans" onClick={() => setConfirming(true)}>
            🔄 Changer de compte Stripe
          </button>
        ) : (
          <div className="bg-rouge-pale border border-rouge-vif/20 rounded-xl p-3 space-y-2">
            <p className="text-xs font-bold text-rouge-vif">⚠️ Confirmer le changement ?</p>
            <p className="text-xs text-gray-500">L'ancien compte sera dissocié. Les virements en attente ne seront pas affectés.</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-white border border-gray-200 text-brun text-xs font-bold py-2 rounded-xl font-sans" onClick={() => setConfirming(false)}>Annuler</button>
              <button className="flex-1 bg-rouge-vif text-white text-xs font-bold py-2 rounded-xl font-sans" onClick={connecterNouveauCompte} disabled={loading}>
                {loading ? '⏳' : 'Confirmer'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── CA Sélecteur ──────────────────────────────────────────────────────────────
function CaSelector({ historique }: { historique: any[] }) {
  const [periode, setPeriode] = useState<'jour'|'semaine'|'mois'|'annee'>('jour')

  function getDebut(p: typeof periode): Date {
    const d = new Date()
    if (p === 'jour')    { d.setHours(0,0,0,0); return d }
    if (p === 'semaine') { const day = d.getDay(); d.setDate(d.getDate() - (day === 0 ? 6 : day - 1)); d.setHours(0,0,0,0); return d }
    if (p === 'mois')    { return new Date(d.getFullYear(), d.getMonth(), 1) }
    return new Date(d.getFullYear(), 0, 1)
  }

  const debut = getDebut(periode)
  const filtered = historique.filter(o => {
    try {
      const parts = o.date.split('/')
      const date = new Date(+parts[2], +parts[1]-1, +parts[0])
      return date >= debut
    } catch { return false }
  })

  const ca = filtered.reduce((s, o) => s + o.lignes.reduce((a: number, l: any) => a + l.prix * l.qty, 0) + o.frais, 0)
  const nbCmd = filtered.length
  const panierMoy = nbCmd > 0 ? ca / nbCmd : 0
  const fraisTotal = filtered.reduce((s, o) => s + o.frais, 0)

  const PERIODES = [{ key: 'jour', label: "Aujourd'hui" },{ key: 'semaine', label: 'Semaine' },{ key: 'mois', label: 'Mois' },{ key: 'annee', label: 'Année' }]

  return (
    <div className="space-y-3">
      {/* Sélecteur */}
      <div className="grid grid-cols-4 gap-1.5 bg-white rounded-2xl p-2 shadow-sm">
        {PERIODES.map(p => (
          <button key={p.key}
            className={"py-2 rounded-xl text-[11px] font-bold font-sans transition-all " + (periode === p.key ? 'bg-brun text-white' : 'text-gray-400')}
            onClick={() => setPeriode(p.key as any)}>
            {p.label}
          </button>
        ))}
      </div>

      {/* CA principal */}
      <div className="bg-brun rounded-2xl p-5 text-center">
        <p className="text-white/60 text-xs mb-1">Chiffre d'affaires · {PERIODES.find(p => p.key === periode)?.label}</p>
        <p className="text-white font-black text-4xl">{ca.toFixed(2)} €</p>
        {nbCmd === 0 && <p className="text-white/40 text-xs mt-2">Aucune commande sur cette période</p>}
      </div>

      {/* Stats */}
      {nbCmd > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {[
            { ico:'📋', val: String(nbCmd),                   label:'Commandes' },
            { ico:'🧺', val: panierMoy.toFixed(2) + ' €',     label:'Panier moyen' },
            { ico:'💰', val: (ca * 0.85).toFixed(2) + ' €',   label:'Vos revenus (85%)' },
            { ico:'🏷️', val: (ca * 0.15).toFixed(2) + ' €',  label:'Commission (15%)' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-3 shadow-sm text-center">
              <div className="text-lg mb-0.5">{s.ico}</div>
              <div className="font-black text-brun text-sm">{s.val}</div>
              <div className="text-[10px] text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Transactions */}
      {nbCmd > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-or-pale border-b border-gris-bd flex justify-between">
            <p className="text-xs font-bold text-brun">Transactions</p>
            <p className="text-xs text-gray-400">{nbCmd} commande{nbCmd > 1 ? 's' : ''}</p>
          </div>
          {filtered.map((o, i) => {
            const total = o.lignes.reduce((s: number, l: any) => s + l.prix * l.qty, 0) + o.frais
            return (
              <div key={o.id} className={"px-4 py-3 flex items-center justify-between " + (i < filtered.length - 1 ? 'border-b border-gris-bd' : '')}>
                <div>
                  <p className="text-sm font-bold text-brun">{o.id}</p>
                  <p className="text-xs text-gray-400">{o.date} · {o.client}</p>
                </div>
                <p className="text-sm font-black text-green-600">+{total.toFixed(2)} €</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

}