import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { order_id, items, payer, total } = await req.json()
    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')!
    const SITE_URL = 'https://watostore.vercel.app'

    const mpItems = items.map((item: { title: string; price: number; qty: number }) => ({
      id: item.title,
      title: item.title,
      quantity: item.qty,
      unit_price: item.price,
      currency_id: 'ARS',
    }))

    const preference = {
      items: mpItems,
      payer: { email: payer.email, name: payer.name },
      back_urls: {
        success: `${SITE_URL}/checkout/exito?order=${order_id}&status=approved`,
        failure: `${SITE_URL}/checkout/error?order=${order_id}&status=failure`,
        pending: `${SITE_URL}/checkout/pendiente?order=${order_id}&status=pending`,
      },
      auto_return: 'approved',
      external_reference: order_id,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mp-webhook`,
      statement_descriptor: 'WATO.STORE',
    }

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    })

    if (!mpRes.ok) {
      const err = await mpRes.json()
      throw new Error(err.message ?? 'MP error')
    }

    const mpData = await mpRes.json()

    // Save preference_id to order
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    await supabase
      .from('orders')
      .update({ mp_preference_id: mpData.id })
      .eq('id', order_id)

    return new Response(
      JSON.stringify({
        preference_id: mpData.id,
        init_point: mpData.init_point,
        sandbox_init_point: mpData.sandbox_init_point,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
