import { useState, useEffect } from 'react'

// ── Coordonnées GPS boucheries ─────────────────────────────────────────────────
export const GPS_BOUCHERIES: Record<number, { lat: number; lng: number; adresse: string }> = {
  1: { lat: 48.8534, lng: 2.3813, adresse: '12 rue de la Roquette, 75011 Paris' },
  2: { lat: 48.8643, lng: 2.3699, adresse: '34 rue Oberkampf, 75011 Paris' },
  3: { lat: 48.8462, lng: 2.2933, adresse: '8 rue du Commerce, 75015 Paris' },
  4: { lat: 48.8632, lng: 2.3731, adresse: '22 av de la République, 75011 Paris' },
  5: { lat: 48.8619, lng: 2.3596, adresse: '5 rue de Bretagne, 75003 Paris' },
  6: { lat: 48.8866, lng: 2.3371, adresse: '18 rue Lepic, 75018 Paris' },
}

// ── Tarification ───────────────────────────────────────────────────────────────
export const TARIF_BASE = 2.50
export const TARIF_KM   = 0.80
export const TARIF_MIN  = 2.90
export const TARIF_MAX  = 8.90

// ── Distances de fallback par boucherie (si GPS refusé) ───────────────────────
const DISTANCES_FALLBACK: Record<number, number> = {
  1: 1.2, 2: 3.5, 3: 0.8, 4: 5.2, 5: 7.1, 6: 2.3
}

// ── Formule Haversine ──────────────────────────────────────────────────────────
export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

// ── Calcul des frais ───────────────────────────────────────────────────────────
export function calculerFrais(km: number): number {
  const calcule = TARIF_BASE + km * TARIF_KM
  return Math.min(Math.max(calcule, TARIF_MIN), TARIF_MAX)
}

// ── Hook principal ─────────────────────────────────────────────────────────────
export function useLivraisonFrais(boucherieId: number | undefined) {
  const [frais,      setFrais]      = useState<number>(TARIF_MIN)
  const [distanceKm, setDistanceKm] = useState<number>(0)
  const [loading,    setLoading]    = useState(false)
  const [gpsOk,      setGpsOk]      = useState(false)

  useEffect(() => {
    if (!boucherieId) return

    const fallback = DISTANCES_FALLBACK[boucherieId] || 2.5
    setDistanceKm(fallback)
    setFrais(calculerFrais(fallback))

    if (!navigator.geolocation) return

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const gps = GPS_BOUCHERIES[boucherieId]
        if (!gps) return
        const km = haversine(gps.lat, gps.lng, pos.coords.latitude, pos.coords.longitude)
        const kmArrondi = Math.round(km * 10) / 10
        setDistanceKm(kmArrondi)
        setFrais(calculerFrais(kmArrondi))
        setGpsOk(true)
        setLoading(false)
      },
      () => {
        // GPS refusé → garder le fallback
        setLoading(false)
      },
      { timeout: 5000, maximumAge: 60000 }
    )
  }, [boucherieId])

  return { frais, distanceKm, loading, gpsOk }
}
