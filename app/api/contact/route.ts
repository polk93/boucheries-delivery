import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const DEST = 'boucheriesdelivery@gmail.com'

// ── Transporter Gmail SMTP ────────────────────────────────────────────────────
function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,   // boucheriesdelivery@gmail.com
      pass: process.env.GMAIL_PASS,   // Mot de passe d'application Gmail (16 caractères)
    },
  })
}

async function sendEmail(subject: string, html: string) {
  const transporter = getTransporter()
  await transporter.sendMail({
    from: `BoucheriesDelivery <${process.env.GMAIL_USER}>`,
    to: DEST,
    subject,
    html,
  })
}

// ── Template HTML commun ──────────────────────────────────────────────────────
function htmlTemplate(titre: string, couleur: string, rows: [string, string][]) {
  const lignes = rows.map(([label, val]) => `
    <tr>
      <td style="padding:8px 12px;font-weight:600;color:#5C2010;width:180px;vertical-align:top;background:#faf7f2;">${label}</td>
      <td style="padding:8px 12px;color:#333;">${val || '—'}</td>
    </tr>`).join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.1);">

    <!-- Header -->
    <div style="background:${couleur};padding:28px 32px;">
      <h1 style="margin:0;color:#C8953A;font-size:22px;letter-spacing:1px;">🥩 BoucheriesDelivery</h1>
      <h2 style="margin:8px 0 0;color:#fff;font-size:18px;font-weight:normal;">${titre}</h2>
    </div>

    <!-- Tableau -->
    <div style="padding:24px 0;">
      <table style="width:100%;border-collapse:collapse;">
        ${lignes}
      </table>
    </div>

    <!-- Footer -->
    <div style="background:#f5f0e8;padding:16px 32px;text-align:center;">
      <p style="margin:0;color:#999;font-size:12px;">
        Reçu le ${new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })} à ${new Date().toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })}
      </p>
      <p style="margin:4px 0 0;color:#999;font-size:12px;">BoucheriesDelivery · boucheriesdelivery@gmail.com</p>
    </div>
  </div>
</body>
</html>`
}

// ════════════════════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type } = body

    // ── Candidature livreur ────────────────────────────────────────────────
    if (type === 'livreur') {
      const { prenom, nom, email, tel, ville, vehicule, siret, iban, disponibilite, message } = body

      const vehiculeLabels: Record<string, string> = {
        velo: '🚲 Vélo',
        velo_elec: '⚡ Vélo électrique',
        scooter: '🛵 Scooter',
        voiture: '🚗 Voiture',
      }

      const html = htmlTemplate(
        `Nouvelle candidature livreur — ${prenom} ${nom}`,
        '#3D2012',
        [
          ['👤 Prénom & Nom',    `${prenom} ${nom}`],
          ['📧 Email',           `<a href="mailto:${email}" style="color:#C0392B;">${email}</a>`],
          ['📞 Téléphone',       `<a href="tel:${tel}" style="color:#C0392B;">${tel}</a>`],
          ['📍 Ville',           ville],
          ['🚲 Véhicule',        vehiculeLabels[vehicule] || vehicule],
          ['📄 SIRET',           siret || '—'],
          ['🏦 IBAN',            iban ? iban.slice(0, 8) + '••••••••••••••' : '—'],
          ['📅 Disponibilités',  disponibilite],
          ['💬 Message',         message || '—'],
        ]
      )

      await sendEmail(`🛵 Nouveau livreur : ${prenom} ${nom}`, html)
      return NextResponse.json({ ok: true })
    }

    // ── Candidature partenaire boucher ─────────────────────────────────────
    if (type === 'partenaire') {
      const { prenom, nom, email, tel, nom_boutique, adresse, ville, specialites, message } = body

      const html = htmlTemplate(
        `Nouvelle candidature partenaire — ${nom_boutique}`,
        '#8B1A1A',
        [
          ['🔪 Boucherie',       nom_boutique],
          ['📍 Adresse',         `${adresse}, ${ville}`],
          ['🥩 Spécialités',     specialites || '—'],
          ['👤 Contact',         `${prenom} ${nom}`],
          ['📧 Email',           `<a href="mailto:${email}" style="color:#C0392B;">${email}</a>`],
          ['📞 Téléphone',       `<a href="tel:${tel}" style="color:#C0392B;">${tel}</a>`],
          ['💬 Message',         message || '—'],
        ]
      )

      await sendEmail(`🔪 Nouveau partenaire : ${nom_boutique} (${ville})`, html)
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Type inconnu' }, { status: 400 })

  } catch (err: any) {
    console.error('[contact]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
