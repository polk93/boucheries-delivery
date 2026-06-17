import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// DELETE /api/cartes/[id] — détache le PaymentMethod de Stripe et supprime de Supabase
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase()
    const { id } = params

    // Récupérer le stripe_pm_id avant suppression
    const { data: carte } = await supabase
      .from('cartes_paiement')
      .select('stripe_pm_id')
      .eq('id', id)
      .single()

    if (carte?.stripe_pm_id) {
      // Révoquer l'accès côté Stripe (la carte ne peut plus être débitée)
      await stripe.paymentMethods.detach(carte.stripe_pm_id)
    }

    const { error } = await supabase.from('cartes_paiement').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
