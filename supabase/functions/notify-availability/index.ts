import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { game_id, game_title, game_slug } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: subs } = await supabase
      .from('availability_notifications')
      .select('id, email')
      .eq('game_id', game_id)
      .is('notified_at', null)

    if (!subs?.length) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const RESEND_KEY = Deno.env.get('RESEND_API_KEY')!
    const productUrl = `https://watostore.vercel.app/producto/${game_slug}`

    let sent = 0
    const notifiedIds: string[] = []

    for (const sub of subs) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'WatoStore <onboarding@resend.dev>',
          to: sub.email,
          subject: `¡${game_title} ya está disponible! 🎮`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0f0f0f;color:#fafafa;padding:32px;border-radius:12px;">
              <div style="margin-bottom:20px;">
                <span style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#E60412;font-weight:700;">WATO STORE</span>
              </div>
              <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;">¡Buenas noticias! 🎮</h2>
              <p style="color:#a0a0a8;margin:0 0 24px;line-height:1.6;">
                <strong style="color:#fafafa;">${game_title}</strong> ya está disponible para alquilar.
                Animate antes de que se agote.
              </p>
              <a href="${productUrl}"
                style="display:inline-block;background:#E60412;color:white;padding:13px 26px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin-bottom:28px;">
                Ver juego →
              </a>
              <p style="color:#4b4b55;font-size:12px;margin:0;border-top:1px solid #1f1f1f;padding-top:16px;">
                Te anotaste para recibir este aviso en WatoStore. Si no fuiste vos, ignorá este mail.
              </p>
            </div>
          `,
        }),
      })

      if (res.ok) {
        sent++
        notifiedIds.push(sub.id)
      }
    }

    if (notifiedIds.length > 0) {
      await supabase
        .from('availability_notifications')
        .update({ notified_at: new Date().toISOString() })
        .in('id', notifiedIds)
    }

    return new Response(JSON.stringify({ sent }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
