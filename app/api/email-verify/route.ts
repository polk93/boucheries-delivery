import { NextRequest, NextResponse } from 'next/server'

// Stockage temporaire des codes (en prod → Supabase)
const codes = new Map<string, { code: string; email: string; expiresAt: number }>()

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// POST /api/email-verify → envoie un code
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'email requis' }, { status: 400 })

    const code = generateCode()
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes
    codes.set(email.toLowerCase(), { code, email, expiresAt })

    // Envoyer via EmailJS
    await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: 'service_uq712ai',
        template_id: 'template_0rdvwq8',
        user_id: 'LbqBSABkR-S5wg9PR',
        template_params: {
          to_email: email,
          subject: '🥩 Votre code de vérification Côte à Côte',
          message: `Votre code de vérification est : ${code}\n\nCe code expire dans 10 minutes.\n\nSi vous n'avez pas demandé ce code, ignorez cet email.`,
        },
      }),
    })

    return NextResponse.json({ success: true, message: 'Code envoyé' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PUT /api/email-verify → vérifie le code
export async function PUT(req: NextRequest) {
  try {
    const { email, code } = await req.json()
    if (!email || !code) return NextResponse.json({ error: 'email et code requis' }, { status: 400 })

    const stored = codes.get(email.toLowerCase())
    if (!stored) return NextResponse.json({ error: 'Code expiré ou invalide' }, { status: 400 })
    if (Date.now() > stored.expiresAt) {
      codes.delete(email.toLowerCase())
      return NextResponse.json({ error: 'Code expiré — demandez-en un nouveau' }, { status: 400 })
    }
    if (stored.code !== code) return NextResponse.json({ error: 'Code incorrect' }, { status: 400 })

    codes.delete(email.toLowerCase())
    return NextResponse.json({ success: true, verified: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
