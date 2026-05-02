import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const body = await req.json()

    // MP sends 'payment' or 'merchant_order' notifications
    if (body.type !== 'payment') {
      return new Response('ok', { status: 200 })
    }

    const paymentId = body.data?.id
    if (!paymentId) return new Response('ok', { status: 200 })

    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')!

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    })
    const payment = await mpRes.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const statusMap: Record<string, string> = {
      approved: 'paid',
      rejected: 'cancelled',
      cancelled: 'cancelled',
      pending: 'pending',
      in_process: 'pending',
    }

    const newStatus = statusMap[payment.status] ?? 'pending'

    await supabase
      .from('orders')
      .update({
        status: newStatus,
        mp_payment_id: String(paymentId),
      })
      .eq('id', payment.external_reference)

    // Increment coupon used_count if paid
    if (newStatus === 'paid') {
      const { data: order } = await supabase
        .from('orders')
        .select('coupon_code')
        .eq('id', payment.external_reference)
        .single()

      if (order?.coupon_code) {
        await supabase.rpc('increment_coupon_uses', { coupon_code: order.coupon_code })
      }
    }

    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error('mp-webhook error', err)
    return new Response('error', { status: 500 })
  }
})
