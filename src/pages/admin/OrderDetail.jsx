// @ts-nocheck
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { useOrders } from '../../hooks/useOrders'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
// import { useRef } from 'react'
// import { useReactToPrint } from 'react-to-print'
import useSettings from '../../hooks/useSettings'
// import OrderReceipt from '../../components/admin/OrderReceipt'
const OrderDetail = () => {
    const STATUS_OPTIONS = [
        { value: 'pending', label: '🟡 Pending' },
        { value: 'processing', label: '🔵 Processing' },
        { value: 'shipped', label: '🟣 Shipped' },
        { value: 'delivered', label: '✅ Delivered' },
        { value: 'cancelled', label: '❌ Cancelled' },
    ]

    const STATUS_STYLES = {
        pending: 'bg-amber-100 text-amber-700',
        processing: 'bg-blue-100 text-blue-700',
        shipped: 'bg-purple-100 text-purple-700',
        delivered: 'bg-primary-light text-primary-dark',
        cancelled: 'bg-red-100 text-red-600',
    }

    const { id } = useParams()
    const { fetchOrderById, updateOrderStatus } = useOrders()
    const navigate = useNavigate()

    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [newStatus, setNewStatus] = useState('')
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')
    const { settings } = useSettings()
    // const receiptRef = useRef()

    // function to print receipt
    // Utility function to escape HTML special characters
    function escapeHtml(text) {
        if (text === null || text === undefined) {
            return ''
        }

        const str = String(text)

        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }

        return str.replace(/[&<>"']/g, (m) => map[m])
    }

    // const handlePrint = useReactToPrint({
    //     contentRef: receiptRef,
    //     documentTitle: `Receipt-${order?.id?.slice(0, 8).toUpperCase()}`,
    // })

    function handlePrint() {
        const storeName = settings?.store_name || ''
        const storeAddress = settings?.store_address || ''
        const storePhone = settings?.store_phone || ''
        const storeEmail = settings?.store_email || ''
        const logoUrl = settings?.logo_url || '';

        const itemsHtml = order.order_items?.map(item => `
          <div style="margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="flex: 1; padding-right: 8px; font-size: 12px;">
                ${escapeHtml(item.name)}
                ${item.selected_color
                ? `<span style="display: block; color: #6B7280;
                                 font-size: 11px; margin-top: 2px;">
                      Color: ${escapeHtml(item.selected_color)}
                     </span>`
                : ''
            }
              </span>
              <span style="font-size: 12px; font-weight: 600;">
                ₦${Number(item.subtotal).toLocaleString()}
              </span>
            </div>
            <div style="font-size: 11px; color: #6B7280;">
              ${item.quantity} × ₦${Number(item.price).toLocaleString()}
            </div>
          </div>
        `).join('') || ''

        const receiptHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Receipt - #${order.id.slice(0, 8).toUpperCase()}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                color: #1a1a1a;
                background: white;
                padding: 20px;
                max-width: 320px;
                margin: 0 auto;
              }
              .center { text-align: center; }
              .bold { font-weight: bold; }
              .divider-solid {
                border-top: 2px solid #333;
                margin: 10px 0;
              }
              .divider-dashed {
                border-top: 1px dashed #666;
                margin: 10px 0;
              }
              .row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 4px;
                font-size: 11px;
              }
              .total-row {
                display: flex;
                justify-content: space-between;
                font-weight: bold;
                font-size: 14px;
                margin-top: 4px;
              }
              .label { color: #555; }
              .status-paid { color: #16A34A; font-weight: bold; }
              .status-pending { color: #D97706; font-weight: bold; }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            
            <div class="center" style="margin-bottom: 16px;">
            ${logoUrl
                ? `<img src="${escapeHtml(logoUrl)}"
                     alt="Store Logo"
                     style="max-width: 50px; height: auto; margin-bottom: 8px;" />`
                : ''}
              <div class="bold" style="font-size: 18px; letter-spacing: 2px; text-transform: uppercase;">
                ${storeName}
              </div>
              ${storeAddress
                ? `<div style="font-size: 11px; color: #555; margin-top: 4px;">${storeAddress}</div>`
                : ''
            }
              ${storePhone
                ? `<div style="font-size: 11px; color: #555;">Tel: ${storePhone}</div>`
                : ''
            }
              ${storeEmail
                ? `<div style="font-size: 11px; color: #555;">${storeEmail}</div>`
                : ''
            }
            </div>
      
            <div class="divider-solid"></div>
      
            <div class="center bold" style="font-size: 13px; letter-spacing: 3px;
                                            text-transform: uppercase; margin: 8px 0;">
              RECEIPT
            </div>
      
            <div class="divider-dashed"></div>
      
            <div style="margin-bottom: 12px;">
              <div class="row">
                <span class="label">Order ID:</span>
                <span class="bold">#${order.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div class="row">
                <span class="label">Date:</span>
                <span>${new Date(order.created_at).toLocaleDateString('en-NG', {
                day: 'numeric', month: 'long', year: 'numeric'
            })}</span>
              </div>
              <div class="row">
                <span class="label">Customer:</span>
                <span class="bold">${escapeHtml(order.customer_name)}</span>
              </div>
              <div class="row">
                <span class="label">Phone:</span>
                <span>${order.customer_phone}</span>
              </div>
              <div class="row">
                <span class="label">Method:</span>
                <span>${order.delivery_method === 'delivery'
                ? 'Home Delivery' : 'Store Pickup'}</span>
              </div>
              ${order.delivery_method === 'delivery' && order.address
                ? `<div class="row">
                     <span class="label">Address:</span>
                     <span style="text-align: right; max-width: 180px;">${escapeHtml(order.address)}</span>
                   </div>`
                : ''
            }
            </div>
      
            <div class="divider-dashed"></div>
      
            <div style="margin-bottom: 4px;">
              <div class="row bold" style="text-transform: uppercase; color: #555;">
                <span>Item</span><span>Amount</span>
              </div>
            </div>
      
            <div style="margin-bottom: 8px;">${itemsHtml}</div>
      
            <div class="divider-dashed"></div>
      
            <div style="margin-bottom: 12px;">
            <div class="row">
            <span class="label">Subtotal</span>
            <span>₦${Number(order.subtotal).toLocaleString()}</span>
          </div>
          ${order.discount > 0
                ? `<div class="row">
                 <span class="label">Discount</span>
                 <span>− ₦${Number(order.discount).toLocaleString()}</span>
               </div>`
                : ''
            }
          ${Number(order.delivery_fee) > 0
                ? `<div class="row">
                 <span class="label">Delivery Fee</span>
                 <span>₦${Number(order.delivery_fee).toLocaleString()}</span>
               </div>`
                : `<div class="row">
                 <span class="label">Delivery</span>
                 <span>${order.delivery_method === 'pickup'
                    ? 'Free (Pickup)' : 'Free'}</span>
               </div>`
            }
              <div class="row">
                <span class="label">Payment</span>
                <span>${(order.payment_method || '').replace(/_/g, ' ')}</span>
              </div>
              <div class="row">
                <span class="label">Payment Status</span>
                <span class="${order.payment_status === 'paid'
                ? 'status-paid' : 'status-pending'}">
                  ${(order.payment_status || '').toUpperCase()}
                </span>
              </div>
            </div>
      
            <div class="divider-solid"></div>
      
            <div class="total-row" style="margin-top: 8px;">
              <span>TOTAL</span>
              <span>₦${Number(order.total).toLocaleString()}</span>
            </div>
      
            <div class="divider-solid" style="margin-top: 8px;"></div>
      
            <div class="center" style="margin-top: 16px; font-size: 11px; color: #555;">
              <div class="bold" style="color: #1a1a1a; margin-bottom: 4px;">
                Thank you for your patronage!
              </div>
              <div style="margin-top: 8px; font-weight: bold;">${storeName}</div>
            </div>
          </body>
          </html>
        `

        // open new window and print
        const printWindow = window.open('', '_blank', 'width=400,height=600')

        if (!printWindow) {
            toast.error('Popup blocked! Please allow popups for this site to print receipts.')
            return
        }

        printWindow.document.write(receiptHtml)
        printWindow.document.close()

        const doPrint = () => {
            printWindow.focus()
            printWindow.print()
            printWindow.onafterprint = () => printWindow.close()
        }

        printWindow.onload = () => {
            const images = printWindow.document.querySelectorAll('img')
            if (images.length === 0) {
                doPrint()
                return
            }

            // Ensure all images (like the store logo) are fully loaded before triggering print
            let attempts = 0;
            const checkInterval = setInterval(() => {
                attempts++;
                if (printWindow.closed) {
                    clearInterval(checkInterval);
                    return;
                }
                const allLoaded = Array.from(images).every(img => img.complete);
                if (allLoaded || attempts > 100) { // 10 second timeout
                    clearInterval(checkInterval);
                    doPrint();
                }
            }, 100);
        }
    }

    useEffect(() => {
        async function load() {
            try {
                window.scrollTo(0, 0)
                const data = await fetchOrderById(id)
                setOrder(data)
                setNewStatus(data.status)
            } catch {
                setError('Order not found')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [fetchOrderById, id])

    async function handleStatusUpdate() {
        if (newStatus === order.status) return

        setUpdating(true)
        setError('')
        setSuccess('')

        try {

            // Restore stock if order is being cancelled
            if (
                order.status !== 'cancelled' &&
                newStatus === 'cancelled'
            ) {

                for (const item of order.order_items) {

                    // get current stock
                    const { data: product, error: fetchError } = await supabase
                        .from('products')
                        .select('stock')
                        .eq('id', item.product_id)
                        .single()

                    if (fetchError) {
                        throw new Error(fetchError.message)
                    }

                    // restore stock
                    const { error: updateError } = await supabase
                        .from('products')
                        .update({
                            stock: product.stock + item.quantity
                        })
                        .eq('id', item.product_id)

                    if (updateError) {
                        throw new Error(updateError.message)
                    }
                }
            }

            await updateOrderStatus(id, newStatus, order.customer_id)
            setOrder({ ...order, status: newStatus })

            toast.success('Order status updated successfully')

        } catch (err) {

            setError('Failed to update status: ' + err.message)
            toast.error(err.message)

        } finally {

            setUpdating(false)

        }
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-NG', {
            day: 'numeric', month: 'long',
            year: 'numeric', hour: '2-digit', minute: '2-digit',
        })
    }

    if (loading) return (
        <AdminLayout>
            <div className="space-y-4 animate-pulse">
                <div className="h-8  bg-gray-100 rounded w-1/3" />
                <div className="h-48 bg-gray-100 rounded-xl" />
                <div className="h-48 bg-gray-100 rounded-xl" />
            </div>
        </AdminLayout>
    )
    if (error && !order) return (
        <AdminLayout>
            <div className="text-center py-20">
                <p className="text-4xl mb-3">😕</p>
                <p className="font-bold text-brand-charcoal mb-4">{error}</p>
                <button onClick={() => navigate('/admin/orders')}
                    className="bg-primary text-white px-6 py-2.5 rounded-lg
                         font-semibold text-sm">
                    Back to Orders
                </button>
            </div>
        </AdminLayout>
    )

    return (
        <AdminLayout>
            <div className="max-w-3xl">

                {/* Header */}
                <div className="flex items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/orders')}
                            className="text-neutral-slate hover:text-brand-charcoal
                 transition-colors"
                        >
                            ← Back
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-brand-charcoal">
                                Order #{order.id.slice(0, 8).toUpperCase()}
                            </h1>
                            <p className="text-neutral-slate text-sm mt-0.5">
                                Placed on {formatDate(order.created_at)}
                            </p>
                        </div>
                    </div>

                    {/* Print Button */}
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-brand-black
               hover:bg-brand-charcoal text-white px-4 py-2.5
               rounded-lg font-semibold text-sm transition-all
               shrink-0"
                    >
                        🖨️ Print Receipt
                    </button>
                </div>


                {/* Success / Error */}
                {success && (
                    <div className="bg-primary-light border border-primary text-primary-dark
                              text-sm rounded-lg px-4 py-3 mb-6">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600
                              text-sm rounded-lg px-4 py-3 mb-6">
                        {error}
                    </div>
                )}

                {/* Status Update Card */}
                <div className="bg-white rounded-xl p-6 shadow-sm border
                            border-gray-100 mb-6">
                    <h2 className="font-semibold text-brand-charcoal mb-4">
                        Order Status
                    </h2>

                    <div className="flex items-center gap-4 flex-wrap">
                        {/* Current Status */}
                        <span className={`inline-flex px-3 py-1.5 rounded-full
                                  text-sm font-semibold capitalize
                  ${STATUS_STYLES[order.status]}`}>
                            Current: {order.status}
                        </span>

                        <span className="text-neutral-slate text-sm">→ Update to:</span>

                        {/* Status Dropdown */}
                        <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="border border-gray-300 rounded-lg px-4 py-2
                             text-sm focus:outline-none focus:ring-2
                             focus:ring-primary bg-white"
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>

                        {/* Update Button */}
                        <button
                            onClick={handleStatusUpdate}
                            disabled={updating || newStatus === order.status}
                            className="bg-primary hover:bg-primary-dark text-white
                             px-5 py-2 rounded-lg font-semibold text-sm
                             transition-all disabled:opacity-50
                             disabled:cursor-not-allowed"
                        >
                            {updating ? 'Updating...' : 'Update Status'}
                        </button>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="bg-white rounded-xl p-6 shadow-sm border
                            border-gray-100 mb-6">
                    <h2 className="font-semibold text-brand-charcoal mb-4">
                        Customer Information
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        {[
                            { label: 'Name', value: order.customer_name },
                            { label: 'Phone', value: order.customer_phone },
                            { label: 'Email', value: order.customer_email },
                            {
                                label: 'Method', value: order.delivery_method === 'delivery'
                                    ? '🚚 Home Delivery' : '🏪 Store Pickup'
                            },
                            ...(order.delivery_method === 'delivery' ? [{
                                label: 'Address',
                                value: order.address
                            }] : []),
                        ].map((info) => (
                            <div key={info.label}>
                                <p className="text-neutral-slate text-xs mb-0.5">
                                    {info.label}
                                </p>
                                <p className="font-medium text-brand-charcoal">
                                    {info.value || '—'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-xl p-6 shadow-sm border
                            border-gray-100 mb-6">
                    <h2 className="font-semibold text-brand-charcoal mb-4">
                        Order Items ({order.order_items?.length})
                    </h2>
                    <div className="space-y-4">
                        {order.order_items?.map((item) => (
                            <div key={item.id}
                                className="flex items-center gap-4 py-3 border-b
                                  border-gray-50 last:border-0">

                                {/* Image */}
                                <div className="w-14 h-14 rounded-lg bg-neutral-light
                                    overflow-hidden shrink-0">
                                    {item.products?.cover_image ? (
                                        <img
                                            src={item.products.cover_image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center
                                        justify-center text-xl">
                                            📦
                                        </div>
                                    )}
                                </div>

                                {/* Item Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-brand-charcoal text-sm line-clamp-1">
                                        {item.name}
                                    </p>

                                    {/* ✅ Show color */}
                                    {item.selected_color && (

                                        <span className="inline-flex items-center gap-1 mt-0.5 bg-primary-light
                     text-primary-dark text-xs px-2 py-0.5 rounded-full
                     font-medium">
                                            {item.selected_color}
                                        </span>
                                    )}

                                    <p className="text-neutral-slate text-xs mt-0.5">
                                        ₦{Number(item.price).toLocaleString()} × {item.quantity}
                                    </p>
                                </div>

                                {/* Subtotal */}
                                <p className="font-bold text-brand-charcoal text-sm
                                   shrink-0">
                                    ₦{Number(item.subtotal).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Proof Card */}
                {order.payment_proof && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border
                        border-gray-100 mb-6">
                        <h2 className="font-semibold text-brand-charcoal mb-4">
                            💳 Payment Proof
                        </h2>
                        <div className="group relative w-full rounded-xl overflow-hidden border
                            border-gray-200 mb-4 bg-gray-50">
                            <img
                                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/payment-proofs/${order.payment_proof}`}
                                alt="Payment proof"
                                className="w-full object-contain max-h-96 bg-gray-50"
                            />
                            <a href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/payment-proofs/${order.payment_proof}`}
                                target="_blank" rel="noreferrer"
                                className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                🔍 View Full Size
                            </a>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={async () => {
                                    const { error } = await supabase
                                        .from('orders')
                                        .update({ payment_status: 'paid' })
                                        .eq('id', order.id)

                                    if (error) {
                                        toast.error('Failed to confirm payment: ' + error.message)
                                    } else {
                                        setOrder({ ...order, payment_status: 'paid' })
                                        toast.success('Payment confirmed!')
                                    }
                                }}
                                disabled={order.payment_status === 'paid'}
                                className="flex-1 bg-primary hover:bg-primary-dark text-white
             py-2.5 rounded-lg font-semibold text-sm transition-all
             disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {order.payment_status === 'paid'
                                    ? '✅ Payment Confirmed'
                                    : 'Confirm Payment'
                                }
                            </button>
                        </div>
                    </div>
                )}

                {/* Price Breakdown */}
                <div className="bg-white rounded-xl p-6 shadow-sm border
                            border-gray-100 mb-6">
                    <h2 className="font-semibold text-brand-charcoal mb-4">
                        Price Breakdown
                    </h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-neutral-slate">Subtotal</span>
                            <span className="font-medium text-brand-charcoal">
                                ₦{Number(order.subtotal).toLocaleString()}
                            </span>
                        </div>

                        {order.discount > 0 && (
                            <div className="flex justify-between">
                                <span className="text-primary">Discount</span>
                                <span className="font-medium text-primary">
                                    − ₦{Number(order.discount).toLocaleString()}
                                </span>
                            </div>
                        )}

                        {/* ✅ Show delivery fee */}
                        <div className="flex justify-between">
                            <span className="text-neutral-slate">
                                Delivery Fee
                                {order.delivery_zone && (
                                    <span className="ml-1 text-xs text-neutral-slate">
                                        ({order.delivery_zone === 'lagos'
                                            ? 'Within Lagos'
                                            : order.delivery_zone === 'nigeria'
                                                ? 'Within Nigeria'
                                                : 'Outside Nigeria'
                                        })
                                    </span>
                                )}
                            </span>
                            <span className={`font-medium
      ${Number(order.delivery_fee) === 0
                                    ? 'text-primary'
                                    : 'text-brand-charcoal'
                                }`}>
                                {Number(order.delivery_fee) === 0
                                    ? order.delivery_method === 'pickup' ? 'Free (Pickup)' : 'Free'
                                    : `₦${Number(order.delivery_fee).toLocaleString()}`
                                }
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-neutral-slate">Payment Method</span>
                            <span className="font-medium text-brand-charcoal capitalize">
                                {order.payment_method?.replace(/_/g, ' ')}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-neutral-slate">Payment Status</span>
                            <span className={`font-semibold capitalize
      ${order.payment_status === 'paid'
                                    ? 'text-primary' : 'text-amber-600'
                                }`}>
                                {order.payment_status}
                            </span>
                        </div>

                        <div className="border-t border-gray-100 pt-3 flex justify-between">
                            <span className="font-bold text-brand-charcoal">Total</span>
                            <span className="font-extrabold text-primary text-xl">
                                ₦{Number(order.total).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            {/* Hidden Receipt for Printing */}
            {/* <div className="hidden">
                {order && (
                    <OrderReceipt
                        ref={receiptRef}
                        order={order}
                        settings={settings}
                    />
                )}
            </div> */}
        </AdminLayout>
    )
}

export default OrderDetail