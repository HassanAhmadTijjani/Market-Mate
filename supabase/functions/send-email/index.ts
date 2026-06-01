
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL')
const APP_URL = Deno.env.get('APP_URL') || 'https://marketmate.innovatorshub.com.ng'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

// Initialize Supabase with the service role key for admin-level access
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Normalize APP_URL to remove trailing slash for cleaner link construction
const normalizedAppUrl = APP_URL.replace(/\/$/, '')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Order {
  id: string;
  total?: number | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email: string;
  delivery_method?: string | null;
  address?: string;
  subtotal?: number | null;
  discount?: number | null;
  order_items?: Array<{
    name: string;
    quantity: number;
    subtotal: number;
  }>;
}

const getHostname = (url: string) => {
  try { return new URL(url).hostname; }
  catch { return 'marketmate.innovatorshub.com.ng'; }
}

// email templates
function newOrderEmail(order: Order, settings: { store_name: string }) {
  const total = order.total ?? 0;
  const customerName = order.customer_name ?? 'Customer';
  const customerPhone = order.customer_phone ?? 'N/A';
  const deliveryMethod = order.delivery_method ?? 'N/A';

  return {
    subject: `🛒 New Order #${order.id.slice(0, 8).toUpperCase()} — ₦${Number(total).toLocaleString()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0D0D0D; padding: 24px; text-align: center;">
          <h1 style="color: #16A34A; margin: 0;">${settings.store_name}</h1>
          <p style="color: #fff; margin: 8px 0 0;">New Order Received</p>
        </div>
        <div style="padding: 24px; background: #f9f9f9;">
          <h2 style="color: #1F1F1F;">Order #${order.id.slice(0, 8).toUpperCase()}</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <tr><td style="padding: 8px; color: #6B7280;">Customer</td>
                <td style="padding: 8px; font-weight: bold;">${customerName}</td></tr>
            <tr><td style="padding: 8px; color: #6B7280;">Phone</td>
                <td style="padding: 8px;">${customerPhone}</td></tr>
            <tr><td style="padding: 8px; color: #6B7280;">Method</td>
                <td style="padding: 8px; text-transform: capitalize;">${deliveryMethod}</td></tr>
            ${order.address ? `<tr><td style="padding: 8px; color: #6B7280;">Address</td>
                <td style="padding: 8px;">${order.address}</td></tr>` : ''}
            <tr><td style="padding: 8px; color: #6B7280;">Total</td>
                <td style="padding: 8px; font-weight: bold; color: #16A34A; font-size: 18px;">
                  ₦${Number(total).toLocaleString()}</td></tr>
          </table>
          <a href="${normalizedAppUrl}/admin/orders/${order.id}"
             style="background: #16A34A; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 8px; font-weight: bold;
                    display: inline-block;">
            View Order →
          </a>
        </div>
        <div style="padding: 16px; text-align: center; color: #6B7280; font-size: 12px;">
          ${settings.store_name} Admin Notification
        </div>
      </div>
    `
  }
}

function customerReceiptEmail(order: Order, settings: { store_name: string }) {
  const customerName = order.customer_name ?? 'Customer';
  const total = order.total ?? 0;
  const subtotal = order.subtotal ?? 0;
  const discount = order.discount ?? 0;
  const deliveryMethod = order.delivery_method ?? 'pickup';

  const itemsHtml = order.order_items?.map((item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name ?? 'Item'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity ?? 0}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
          ₦${Number(item.subtotal ?? 0).toLocaleString()}
        </td>
      </tr>
    `).join('') || ''

  return {
    subject: `✅ Order Confirmed — #${order.id.slice(0, 8).toUpperCase()}`,
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0D0D0D; padding: 24px; text-align: center;">
            <h1 style="color: #16A34A; margin: 0;">${settings.store_name}</h1>
            <p style="color: #fff; margin: 8px 0 0;">Order Confirmation</p>
          </div>
          <div style="padding: 24px;">
            <h2 style="color: #1F1F1F;">Hi ${customerName}! 👋</h2>
            <p style="color: #6B7280;">
              Thank you for your order from ${settings.store_name}. Here is your receipt.
            </p>
  
            <div style="background: #f9f9f9; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0; font-size: 12px; color: #6B7280;">Order ID</p>
              <p style="margin: 4px 0 0; font-weight: bold; font-size: 18px;">
                #${order.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
  
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="padding: 10px; text-align: left;">Item</th>
                  <th style="padding: 10px; text-align: center;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
  
            <div style="border-top: 2px solid #eee; padding-top: 12px;">
              ${discount > 0 ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #6B7280;">Subtotal</span>
                  <span>₦${Number(subtotal).toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #16A34A;">Discount</span>
                  <span style="color: #16A34A;">− ₦${Number(discount).toLocaleString()}</span>
                </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between;
                          font-weight: bold; font-size: 18px;">
                <span>Total</span>
                <span style="color: #16A34A;">₦${Number(total).toLocaleString()}</span>
              </div>
            </div>
  
            <div style="background: #DCFCE7; border-radius: 8px; padding: 16px; margin-top: 16px;">
              <p style="margin: 0; color: #15803D; font-weight: bold;">What happens next?</p>
              <p style="margin: 8px 0 0; color: #15803D; font-size: 14px;">
                ${deliveryMethod === 'delivery'
        ? '🚚 Our team will contact you to arrange delivery.'
        : '🏪 We will notify you when your order is ready for pickup.'
      }
              </p>
            </div>
  
            <div style="text-align: center; margin-top: 24px;">
              <a href="${normalizedAppUrl}/orders/${order.id}"
                 style="background: #16A34A; color: white; padding: 12px 24px;
                        text-decoration: none; border-radius: 8px; font-weight: bold;
                        display: inline-block;">
                Track Your Order →
              </a>
            </div>
          </div>
          <div style="padding: 16px; text-align: center; color: #6B7280; font-size: 12px;
                      border-top: 1px solid #eee;">
            ${settings.store_name} • ${getHostname(APP_URL)}
          </div>
        </div>
      `
  }
}

function orderStatusEmail(order: Order, newStatus: string, settings: { store_name: string }) {
  const statusMessages: Record<string, any> = {
    processing: {
      emoji: '⚙️', title: 'Order is Being Processed',
      message: 'Great news! Your order is now being prepared.'
    },
    shipped: {
      emoji: '🚚', title: 'Order is On the Way',
      message: 'Your order has been shipped and is on its way to you.'
    },
    delivered: {
      emoji: '✅', title: 'Order Delivered',
      message: 'Your order has been delivered. Thank you for shopping with us!'
    },
    cancelled: {
      emoji: '❌', title: 'Order Cancelled',
      message: 'Your order has been cancelled. Contact us if you have questions.'
    },
    pending: {
      emoji: '⏳', title: 'Order Pending',
      message: 'Your order is pending confirmation.'
    },
  }

  const info = statusMessages[newStatus] || statusMessages.pending
  const total = order.total ?? 0;

  return {
    subject: `${info.emoji} Order Update — #${order.id.slice(0, 8).toUpperCase()} is ${newStatus}`,
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0D0D0D; padding: 24px; text-align: center;">
            <h1 style="color: #16A34A; margin: 0;">${settings.store_name}</h1>
            <p style="color: #fff; margin: 8px 0 0;">Order Status Update</p>
          </div>
          <div style="padding: 24px; text-align: center;">
            <div style="font-size: 64px; margin-bottom: 16px;">${info.emoji}</div>
            <h2 style="color: #1F1F1F;">${info.title}</h2>
            <p style="color: #6B7280;">${info.message}</p>
  
            <div style="background: #f9f9f9; border-radius: 8px;
                        padding: 16px; margin: 24px 0; text-align: left;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6B7280;">Order ID</span>
                <span style="font-weight: bold;">
                  #${order.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6B7280;">Status</span>
                <span style="font-weight: bold; text-transform: capitalize; color: #16A34A;">
                  ${newStatus}
                </span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6B7280;">Total</span>
                <span style="font-weight: bold;">
                  ₦${Number(total).toLocaleString()}
                </span>
              </div>
            </div>
  
            <a href="${normalizedAppUrl}/orders/${order.id}"
               style="background: #16A34A; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 8px; font-weight: bold;
                      display: inline-block;">
              Track Order →
            </a>
          </div>
          <div style="padding: 16px; text-align: center; color: #6B7280;
                      font-size: 12px; border-top: 1px solid #eee;">
            ${settings.store_name} • ${getHostname(APP_URL)}
          </div>
        </div>
      `
  }
}

function paymentProofEmail(order: Order, settings: { store_name: string }) {
  const customerName = order.customer_name ?? 'Customer';
  const customerPhone = order.customer_phone ?? 'N/A';
  const total = order.total ?? 0;

  return {
    subject: `💳 Payment Proof Received — Order #${order.id.slice(0, 8).toUpperCase()}`,
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0D0D0D; padding: 24px; text-align: center;">
            <h1 style="color: #16A34A; margin: 0;">${settings.store_name}</h1>
            <p style="color: #fff; margin: 8px 0 0;">Payment Proof Received</p>
          </div>
          <div style="padding: 24px;">
            <h2 style="color: #1F1F1F;">Payment Proof Uploaded</h2>
            <p style="color: #6B7280;">
              ${customerName} has uploaded a payment proof for order
              #${order.id.slice(0, 8).toUpperCase()}.
              Please review and confirm the payment.
            </p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 8px; color: #6B7280;">Customer</td>
                  <td style="padding: 8px; font-weight: bold;">${customerName}</td></tr>
              <tr><td style="padding: 8px; color: #6B7280;">Phone</td>
                  <td style="padding: 8px;">${customerPhone}</td></tr>
              <tr><td style="padding: 8px; color: #6B7280;">Amount</td>
                  <td style="padding: 8px; font-weight: bold; color: #16A34A;">
                    ₦${Number(total).toLocaleString()}</td></tr>
            </table>
            <a href="${normalizedAppUrl}/admin/orders/${order.id}"
               style="background: #16A34A; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 8px; font-weight: bold;
                      display: inline-block;">
              Review & Confirm Payment →
            </a>
          </div>
        </div>
      `
  }
}

// function newCustomerEmail(profile: any) {
//     return {
//         subject: `👤 New Customer Registered — ${profile.full_name}`,
//         html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <div style="background: #0D0D0D; padding: 24px; text-align: center;">
//             <h1 style="color: #16A34A; margin: 0;">${settings?.store_name}</h1>
//             <p style="color: #fff; margin: 8px 0 0;">New Customer</p>
//           </div>
//           <div style="padding: 24px;">
//             <h2 style="color: #1F1F1F;">New Customer Registered 🎉</h2>
//             <p style="color: #6B7280;">
//               A new customer just created an account on your store.
//             </p>
//             <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
//               <tr><td style="padding: 8px; color: #6B7280;">Name</td>
//                   <td style="padding: 8px; font-weight: bold;">${profile.full_name}</td></tr>
//               <tr><td style="padding: 8px; color: #6B7280;">Email</td>
//                   <td style="padding: 8px;">${profile.email}</td></tr>
//               <tr><td style="padding: 8px; color: #6B7280;">Phone</td>
//                   <td style="padding: 8px;">${profile.phone || '—'}</td></tr>
//               <tr><td style="padding: 8px; color: #6B7280;">Joined</td>
//                   <td style="padding: 8px;">${new Date(profile.created_at).toLocaleDateString('en-NG')}</td></tr>
//             </table>
//             <a href="${APP_URL}/admin/customers"
//                style="background: #16A34A; color: white; padding: 12px 24px;
//                       text-decoration: none; border-radius: 8px; font-weight: bold;
//                       display: inline-block;">
//               View Customers →
//             </a>
//           </div>
//         </div>
//       `
//     }
//   }


// ✅ FIXED: Renamed to avoid recursion
async function sendEmailViaResend(to: string, subject: string, html: string, settings: { store_name: string; store_email?: string }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: `${settings.store_name} <orders@${getHostname(APP_URL)}>`,
      to: ["hassanahmadtijjani26@gmail.com"],
      reply_to: settings.store_email || ADMIN_EMAIL,
      subject: subject,
      html: html,
    }),
  })

  if (!res.ok) {
    throw new Error(`Failed to send email: ${res.statusText}`)
  }

  return res.json()
}

// ✅ FIXED: serve() wraps the entire handler
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (!RESEND_API_KEY || !ADMIN_EMAIL) {
    const errorMsg = !RESEND_API_KEY
      ? 'RESEND_API_KEY is not configured'
      : 'ADMIN_EMAIL is not configured';

    return new Response(JSON.stringify({ error: errorMsg }), { status: 500, headers: corsHeaders })
  }

  try {
    // Fetch latest settings on every request to avoid stale cache
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('store_name, store_email')
      .eq('id', 'store')
      .maybeSingle()

    if (settingsError) {
      console.error('[send-email] Error fetching store settings from database:', settingsError)
    }

    const settings = {
      store_name: settingsData?.store_name || 'MarketMate',
      store_email: settingsData?.store_email || ADMIN_EMAIL
    }

    const { type, data } = await req.json()

    if (!data) {
      throw new Error('Invalid request: payload data is required')
    }

    let emailContent: { subject: string; html: string } | null = null
    let to = ''

    switch (type) {
      case 'new_order':
        if (!data.order) throw new Error('Missing order object for new_order email')
        if (!data.order.id) throw new Error('Missing order ID for new_order email')

        emailContent = newOrderEmail(data.order, settings)
        to = ADMIN_EMAIL!
        break

      case 'customer_receipt':
        if (!data.order) throw new Error('Missing order object for customer_receipt email')
        if (!data.order.id) throw new Error('Missing order ID for customer_receipt email')
        if (!data.order.customer_email) throw new Error('Missing customer email for customer_receipt email')

        emailContent = customerReceiptEmail(data.order, settings)
        to = data.order.customer_email
        break

      case 'order_status_update':
        if (!data.order) throw new Error('Missing order object for order_status_update email')
        if (!data.order.id) throw new Error('Missing order ID for order_status_update email')
        if (!data.order.customer_email) throw new Error('Missing customer email for order_status_update email')

        emailContent = orderStatusEmail(data.order, data.newStatus || 'pending', settings)
        to = data.order.customer_email
        break

      case 'payment_proof':
        if (!data.order) throw new Error('Missing order object for payment_proof email')
        if (!data.order.id) throw new Error('Missing order ID for payment_proof email')

        emailContent = paymentProofEmail(data.order, settings)
        to = ADMIN_EMAIL!
        break

      default:
        throw new Error(`Unknown email type: ${type}`)
    }

    if (!to || !emailContent) {
      throw new Error('Missing email recipient or content')
    }

    // ✅ Call the renamed function
    await sendEmailViaResend(to, emailContent.subject, emailContent.html, settings)

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})