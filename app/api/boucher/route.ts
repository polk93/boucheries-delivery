import { NextRequest, NextResponse } from 'next/server'

const EMAILJS_SERVICE  = 'service_uq712ai'
const EMAILJS_TEMPLATE = 'template_0rdvwq8'
const EMAILJS_KEY      = 'LbqBSABkR-S5wg9PR'

function generatePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#'
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function POST(req: NextRequest) {
  try {
    const { email, nom, prenom, nom_boutique, ville } = await req.json()

    if (!email || !nom_boutique) {
      return NextResponse.json({ error: 'Email et nom_boutique requis' }, { status: 400 })
    }

    const password = generatePassword()
    const nomComplet = `${prenom || ''} ${nom || ''}`.trim() || nom_boutique

    // ── Email de bienvenue au boucher ─────────────────────────────────────────
    const emailRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE,
        template_id: EMAILJS_TEMPLATE,
        user_id: EMAILJS_KEY,
        template_params: {
          // Envoi au boucher (overrider le "to" via template params)
          to_email: email,
          to_name: nomComplet,
          subject: `🥩 Bienvenue sur BoucheriesDelivery — Vos accès`,
          message: `
Bonjour ${nomComplet},

Bienvenue sur BoucheriesDelivery ! Votre inscription a été validée.

Voici vos identifiants de connexion :

📧 Email       : ${email}
🔑 Mot de passe : ${password}

👉 Connectez-vous sur : https://boucheries-delivery.vercel.app

Une fois connecté, vous pourrez :
• Gérer votre catalogue de produits
• Suivre et traiter vos commandes
• Configurer vos horaires d'ouverture
• Suivre vos paiements

⚠️ Pour votre sécurité, changez votre mot de passe dès votre première connexion.
Paramètres → Mon profil → Modifier mon mot de passe

À très bientôt,
L'équipe BoucheriesDelivery
boucheriesdelivery@gmail.com
          `.trim(),
        },
      }),
    })

    // ── Email de notification à l'admin ───────────────────────────────────────
    await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE,
        template_id: EMAILJS_TEMPLATE,
        user_id: EMAILJS_KEY,
        template_params: {
          subject: `✅ Nouveau boucher créé : ${nom_boutique}`,
          message: `
Nouveau compte boucher créé automatiquement.

Boucherie  : ${nom_boutique}
Ville      : ${ville || '—'}
Contact    : ${nomComplet}
Email      : ${email}
Mot de passe généré : ${password}
Date       : ${new Date().toLocaleString('fr-FR')}
          `.trim(),
        },
      }),
    })

    return NextResponse.json({
      success: true,
      password, // retourné pour stocker côté client dans le store
      message: 'Compte créé et email envoyé',
    })

  } catch (err: any) {
    console.error('[boucher/create]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
