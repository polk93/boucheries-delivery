// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { messages, boucheriesContext } = await req.json()

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: `Tu es l'assistant IA de BoucherieDelivery, une app de livraison de viande artisanale. Expert en boucherie, viandes et gastronomie française. Boucheries disponibles : ${boucheriesContext}. Réponds en français, de façon concise (3-4 phrases max) et chaleureuse.`,
      messages,
    }),
  })

  const data = await res.json()
  return NextResponse.json({ reply: data.content?.[0]?.text || 'Désolé, je rencontre un problème.' })
}

