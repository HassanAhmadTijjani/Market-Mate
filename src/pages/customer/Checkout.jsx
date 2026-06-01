/* eslint-disable no-unused-vars */
// @ts-nocheck
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/common/Layout'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import useSettings from '../../hooks/useSettings'
import useCheckout from '../../hooks/useCheckout'
import toast from 'react-hot-toast'


// ─────────────────────────────────────────────
// SESSION HELPERS
// ─────────────────────────────────────────────
function saveCheckoutSession(data) {
    sessionStorage.setItem('checkout_session', JSON.stringify(data))
}

function loadCheckoutSession() {
    try {
        const saved = sessionStorage.getItem('checkout_session')
        return saved ? JSON.parse(saved) : null
    } catch {
        return null
    }
}

function clearCheckoutSession() {
    sessionStorage.removeItem('checkout_session')
}

// ─────────────────────────────────────────────
// PROGRESS BAR
// ─────────────────────────────────────────────
function ProgressBar({ currentStep, setStep }) {
    const steps = [
        { number: 1, label: 'Delivery' },
        { number: 2, label: 'Review' },
        { number: 3, label: 'Payment' },
        { number: 4, label: 'Confirmation' },
    ]

    return (
        <div className="flex items-center justify-center mb-10">
            {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                    <div
                        className={`flex flex-col items-center ${currentStep < 4 && step.number < currentStep ? 'cursor-pointer group' : ''
                            }`}
                        onClick={() => {
                            if (currentStep < 4 && step.number < currentStep) {
                                setStep(step.number);
                                window.scrollTo(0, 0);
                            }
                        }}
                    >
                        <div className={`w-9 h-9 rounded-full flex items-center
                            justify-center font-bold text-sm transition-all 
              ${currentStep > step.number
                                ? 'bg-primary text-white'
                                : currentStep === step.number
                                    ? 'bg-primary text-white ring-4 ring-primary-light'
                                    : 'bg-gray-100 text-neutral-slate'
                            }`}>
                            {currentStep > step.number ? '✓' : step.number}
                        </div>
                        <p className={`text-xs mt-1.5 font-medium whitespace-nowrap
              ${currentStep >= step.number
                                ? 'text-primary'
                                : 'text-neutral-slate'
                            }`}>
                            {step.label}
                        </p>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 transition-all
              ${currentStep > step.number ? 'bg-primary' : 'bg-gray-200'}`}
                        />
                    )}
                </div>
            ))}
        </div>
    )
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function Checkout() {
    const { cartItems, cartTotal, cartCount, clearCart } = useCart()
    const { user, profile } = useAuth()

    // ✅ Fixed — was broken across two lines
    const { validatePromoCode, placeOrder, uploadPaymentProof } = useCheckout()

    const { settings } = useSettings()

    const savedSession = loadCheckoutSession()

    // STATES
    const [step, setStep] = useState(savedSession?.step || 1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [deliveryZone, setDeliveryZone] = useState('')
    const [deliveryFee, setDeliveryFee] = useState(0)
    const [deliveryMethod, setDeliveryMethod] = useState(
        savedSession?.deliveryMethod || 'delivery'
    )

    const [form, setForm] = useState({
        name: savedSession?.form?.name || profile?.full_name || '',
        email: savedSession?.form?.email || user?.email || '',
        phone: savedSession?.form?.phone || profile?.phone || '',
        address: savedSession?.form?.address || '',
    })

    const [promoInput, setPromoInput] = useState('')
    const [promoData, setPromoData] = useState(savedSession?.promoData || null)
    const [promoError, setPromoError] = useState('')
    const [promoLoading, setPromoLoading] = useState(false)
    const [discount, setDiscount] = useState(savedSession?.discount || 0)

    const [confirmedOrder, setConfirmedOrder] = useState(
        savedSession?.confirmedOrder || null
    )
    const [pendingOrderId, setPendingOrderId] = useState(
        savedSession?.pendingOrderId || null
    )

    const [paymentProofFile, setPaymentProofFile] = useState(null)
    const [paymentProofPreview, setPaymentProofPreview] = useState(
        savedSession?.paymentProofPreview || null
    )
    const [uploadingProof, setUploadingProof] = useState(false)
    const [paymentError, setPaymentError] = useState('')

    // ✅ finalTotal includes delivery fee
    const finalTotal = step === 4 && confirmedOrder
        ? confirmedOrder.total
        : Math.max(0, cartTotal - discount + deliveryFee)

    // DELIVERY ZONES
    const DELIVERY_ZONES = [
        {
            value: 'lagos',
            label: '🏙️ Within Lagos',
            description: 'Delivery within Lagos State',
            fee: Number(settings?.delivery_fee_lagos) || 0,
        },
        {
            value: 'nigeria',
            label: '🇳🇬 Outside Lagos (Within Nigeria)',
            description: 'Delivery to other Nigerian states',
            fee: Number(settings?.delivery_fee_nigeria) || 0,
        },
        {
            value: 'outside',
            label: '✈️ Outside Nigeria',
            description: 'International delivery',
            fee: Number(settings?.delivery_fee_outside) || 0,
        },
    ]

    function handleZoneChange(zone) {
        setDeliveryZone(zone.value)

        // ✅ Only apply the fee if a Free Delivery promo isn't already active
        if (promoData?.discount_type === 'free_delivery') {
            setDeliveryFee(0)
        } else {
            setDeliveryFee(zone.fee)
        }
    }

    // SAVE SESSION
    useEffect(() => {
        // If the order is completed (Step 4), we clear the session storage.
        // This prevents the "Success" state from being persisted, which would
        // block the user from starting a new checkout later.
        if (step === 4) {
            clearCheckoutSession()
        } else {
            saveCheckoutSession({
                step, deliveryMethod, form,
                promoData, discount, confirmedOrder, pendingOrderId,
            })
        }
    }, [step, deliveryMethod, form, promoData,
        discount, confirmedOrder, pendingOrderId])

    // WHATSAPP LINK
    function getWhatsAppUrl() {
        const productsList = cartItems
            .map(item => `- ${item.products?.name} x${item.quantity}`)
            .join('\n')

        const storeName = settings?.store_name || 'MarketMate'
        const message = `Hello ${storeName}\n\nI want to place an order.\n\nName: ${form.name}\n\nProducts:\n${productsList}\n\nTotal: ₦${finalTotal.toLocaleString()}\n\nDelivery: ${deliveryMethod}`

        const rawPhone = settings?.store_phone || settings?.super_admin_phone || '2348143128855'
        const formattedPhone = rawPhone.replace(/\D/g, '').replace(/^0/, '234')

        return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
    }

    // EMPTY CART CHECK
    if (cartCount === 0 && step !== 3 && step !== 4) {
        return (
            <Layout>
                <div className="max-w-6xl mx-auto px-6 py-20 text-center">
                    <p className="text-5xl mb-4">🛒</p>
                    <h1 className="text-2xl font-bold text-brand-charcoal mb-2">
                        Your cart is empty
                    </h1>
                    <p className="text-neutral-slate text-sm mb-6">
                        Add some products before checking out
                    </p>
                    <Link to="/shop"
                        className="bg-primary hover:bg-primary-dark text-white
                       px-6 py-3 rounded-lg font-semibold transition-all">
                        Go to Shop
                    </Link>
                </div>
            </Layout>
        )
    }

    function handleFormChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    // PROMO
    async function handleApplyPromo() {
        if (!promoInput.trim()) return
        setPromoError('')
        setPromoLoading(true)

        try {
            const { promoData: data, discountAmount, freeDelivery } =
                await validatePromoCode(promoInput, cartTotal)

            setPromoData(data)
            setDiscount(discountAmount)

            // ✅ if free delivery promo — waive the delivery fee
            if (freeDelivery) {
                setDeliveryFee(0)
                toast.success('🚚 Free delivery applied!')
            }

        } catch (err) {
            setPromoError(err.message)
            setPromoData(null)
            setDiscount(0)
        } finally {
            setPromoLoading(false)
        }
    }

    function handleRemovePromo() {
        // if it was a free delivery promo restore the zone fee
        if (promoData?.discount_type === 'free_delivery' && deliveryZone) {
            const zone = DELIVERY_ZONES.find(z => z.value === deliveryZone)
            if (zone) setDeliveryFee(zone.fee)
        }
        setPromoInput('')
        setPromoData(null)
        setPromoError('')
        setDiscount(0)
    }

    // STEP 1 VALIDATION
    function handleStep1Next() {
        setError('')
        if (!form.name) {
            setError('Please enter your full name')
            window.scrollTo({ top: 0, behavior: 'smooth' })
            return
        }
        if (!form.phone) {
            setError('Please enter your phone number')
            window.scrollTo({ top: 0, behavior: 'smooth' })
            return
        }
        if (deliveryMethod === 'delivery') {
            if (!deliveryZone) {
                setError('Please select your delivery zone')
                window.scrollTo({ top: 0, behavior: 'smooth' })
                return
            }
            if (!form.address) {
                setError('Please enter your delivery address')
                window.scrollTo({ top: 0, behavior: 'smooth' })
                return
            }
        }
        setStep(2)
        window.scrollTo(0, 0)
    }

    function handleGoToPayment() {
        setStep(3)
        window.scrollTo(0, 0)
    }

    function handleCopyAccountNumber() {
        navigator.clipboard.writeText(settings?.account_number || '')
        toast.success('Account number copied!')
    }

    // PAYMENT PROOF HANDLER
    function handlePaymentProof(e) {
        const file = e.target.files[0]
        if (!file) return
        if (paymentProofPreview) URL.revokeObjectURL(paymentProofPreview)
        setPaymentProofFile(file)
        setPaymentProofPreview(URL.createObjectURL(file))
    }

    // SUBMIT PROOF + CREATE ORDER
    async function handleSubmitProof() {
        if (!paymentProofFile) {
            return setPaymentError('Please upload your payment screenshot first')
        }

        setUploadingProof(true)
        setPaymentError('')

        try {
            let orderId = pendingOrderId
            let orderData = confirmedOrder

            // ✅ Fixed — was broken syntax
            // Create order only if not already created (prevents duplicates on retry)
            if (!orderId) {
                const order = await placeOrder({
                    userId: user.id,
                    cartItems: cartItems,
                    deliveryMethod: deliveryMethod,
                    customerName: form.name,
                    customerEmail: form.email,
                    customerPhone: form.phone,
                    address: form.address,
                    promoCode: promoData?.code || null,
                    subtotal: cartTotal,
                    discount: discount,
                    deliveryFee: deliveryFee,
                    deliveryZone: deliveryZone,
                    total: finalTotal,
                })
                orderId = order.id
                orderData = order
                setPendingOrderId(orderId)
            }

            // Upload proof
            await uploadPaymentProof(orderId, paymentProofFile)

            // Save confirmed order
            setConfirmedOrder({ ...orderData, items: [...cartItems] })

            // Clear cart
            await clearCart()

            // Go to confirmation
            setStep(4)

            // ✅ Fixed — was clearFormSession (doesn't exist)
            clearCheckoutSession()

            window.scrollTo(0, 0)
            toast.success('Payment proof submitted successfully!')

        } catch (err) {
            console.error(err)
            setPaymentError('Failed: ' + err.message)
        } finally {
            setUploadingProof(false)
        }
    }

    return (
        <Layout>
            <div className="max-w-3xl mx-auto px-6 py-10">

                <ProgressBar currentStep={step} setStep={setStep} />

                {/* ── STEP 1 ── */}
                {step === 1 && (
                    <div>
                        <h1 className="text-2xl font-bold text-brand-charcoal mb-6">
                            Delivery Details
                        </h1>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600
                              text-sm rounded-lg px-4 py-3 mb-6">
                                {error}
                            </div>
                        )}

                        {/* Delivery Method */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border
                            border-gray-100 mb-6">
                            <h2 className="font-semibold text-brand-charcoal mb-4">
                                Delivery Method
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <button type="button"
                                    onClick={() => setDeliveryMethod('delivery')}
                                    className={`p-4 rounded-xl border-2 text-left transition-all
                    ${deliveryMethod === 'delivery'
                                            ? 'border-primary bg-primary-light'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}>
                                    <p className="font-semibold text-brand-charcoal text-sm">
                                        🚚 Home Delivery
                                    </p>
                                    <p className="text-neutral-slate text-xs mt-1">
                                        Delivered to your address
                                    </p>
                                </button>

                                <button type="button"
                                    onClick={() => setDeliveryMethod('pickup')}
                                    className={`p-4 rounded-xl border-2 text-left transition-all
                    ${deliveryMethod === 'pickup'
                                            ? 'border-primary bg-primary-light'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}>
                                    <p className="font-semibold text-brand-charcoal text-sm">
                                        🏪 Store Pickup
                                    </p>
                                    <p className="text-neutral-slate text-xs mt-1">
                                        Pick up from our store
                                    </p>
                                </button>
                            </div>
                        </div>

                        {/* Delivery Zone */}
                        {deliveryMethod === 'delivery' && (
                            <div className="bg-white rounded-xl p-6 shadow-sm border
                              border-gray-100 mb-6">
                                <h2 className="font-semibold text-brand-charcoal mb-4">
                                    📍 Select Your Delivery Zone
                                </h2>
                                <div className="space-y-3">
                                    {DELIVERY_ZONES.map((zone) => (
                                        <button key={zone.value} type="button"
                                            onClick={() => handleZoneChange(zone)}
                                            className={`w-full p-4 rounded-xl border-2 text-left
                                  transition-all flex items-center justify-between
                        ${deliveryZone === zone.value
                                                    ? 'border-primary bg-primary-light'
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                                }`}>
                                            <div>
                                                <p className="font-semibold text-brand-charcoal text-sm">
                                                    {zone.label}
                                                </p>
                                                <p className="text-neutral-slate text-xs mt-0.5">
                                                    {zone.description}
                                                </p>
                                            </div>
                                            <p className={`font-bold text-sm shrink-0 ml-4
                        ${deliveryZone === zone.value
                                                    ? 'text-primary'
                                                    : 'text-brand-charcoal'
                                                }`}>
                                                {zone.fee === 0
                                                    ? 'Free'
                                                    : `₦${zone.fee.toLocaleString()}`
                                                }
                                            </p>
                                        </button>
                                    ))}
                                </div>

                                {deliveryZone && deliveryFee > 0 && (
                                    <div className="mt-4 bg-amber-50 border border-amber-200
                                  rounded-lg px-4 py-3">
                                        <p className="text-amber-800 text-sm font-medium">
                                            Delivery fee of ₦{deliveryFee.toLocaleString()} will be
                                            added to your order total
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Contact Info */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border
                            border-gray-100 space-y-4 mb-6">
                            <h2 className="font-semibold text-brand-charcoal">
                                Contact Information
                            </h2>

                            <div>
                                <label className="block text-sm font-medium
                                  text-brand-charcoal mb-1">Full Name *</label>
                                <input required type="text" name="name" value={form.name}
                                    onChange={handleFormChange} placeholder="Enter your full name"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3
                             text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium
                                  text-brand-charcoal mb-1">Phone Number *</label>
                                <input required type="tel" name="phone" value={form.phone}
                                    onChange={handleFormChange} placeholder="e.g. 08012345678"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3
                             text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium
                                  text-brand-charcoal mb-1">Email Address</label>
                                <input required type="email" name="email" value={form.email}
                                    onChange={handleFormChange} placeholder="Enter your email"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3
                             text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>

                            {deliveryMethod === 'delivery' && (
                                <div>
                                    <label className="block text-sm font-medium
                                    text-brand-charcoal mb-1">
                                        Delivery Address *
                                    </label>
                                    <textarea required name="address" value={form.address}
                                        onChange={handleFormChange} rows={3}
                                        placeholder="Enter your full delivery address..."
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3
                               text-sm focus:outline-none focus:ring-2
                               focus:ring-primary resize-none" />
                                </div>
                            )}

                            {deliveryMethod === 'pickup' && (
                                <div className="bg-primary-light rounded-lg px-4 py-3">
                                    <p className="text-primary-dark text-sm font-medium">
                                        📍 You will receive a notification when your order
                                        is ready for pickup at our store.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Promo Code */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border
                            border-gray-100 mb-6">
                            <h2 className="font-semibold text-brand-charcoal mb-4">
                                Promo Code (Optional)
                            </h2>
                            {promoData ? (
                                <div className="flex items-center justify-between
                  bg-primary-light rounded-lg px-4 py-3">
                                    <div>
                                        <p className="text-primary-dark font-semibold text-sm">
                                            ✅ {promoData.code} applied!
                                        </p>
                                        <p className="text-primary text-xs mt-0.5">
                                            {promoData.discount_type === 'free_delivery'
                                                ? '🚚 Free delivery on this order'
                                                : `You save ${settings?.currency_symbol || '₦'}${discount.toLocaleString()}`
                                            }
                                        </p>
                                    </div>
                                    <button onClick={handleRemovePromo}
                                        className="text-red-500 text-sm font-medium
                 hover:text-red-700 transition-colors">
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex gap-3">
                                        <input type="text" value={promoInput}
                                            onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                                            placeholder="Enter promo code"
                                            className="flex-1 border border-gray-300 rounded-lg
                                 px-4 py-3 text-sm focus:outline-none
                                 focus:ring-2 focus:ring-primary uppercase" />
                                        <button onClick={handleApplyPromo}
                                            disabled={promoLoading || !promoInput.trim()}
                                            className="bg-brand-black hover:bg-brand-charcoal text-white
                                 px-5 py-3 rounded-lg font-semibold text-sm
                                 transition-all disabled:opacity-50
                                 disabled:cursor-not-allowed">
                                            {promoLoading ? '...' : 'Apply'}
                                        </button>
                                    </div>
                                    {promoError && (
                                        <p className="text-red-500 text-xs mt-2">{promoError}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <button onClick={handleStep1Next}
                            className="w-full bg-primary hover:bg-primary-dark text-white
                         py-4 rounded-xl font-bold text-base transition-all
                         hover:scale-[1.01]">
                            Continue to Review →
                        </button>
                    </div>
                )}

                {/* ── STEP 2 ── */}
                {step === 2 && (
                    <div>
                        <h1 className="text-2xl font-bold text-brand-charcoal mb-6">
                            Review Order
                        </h1>

                        {/* Delivery Summary */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border
                            border-gray-100 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold text-brand-charcoal">
                                    Delivery Information
                                </h2>
                                <button onClick={() => setStep(1)}
                                    className="text-primary text-sm font-medium hover:underline">
                                    Edit
                                </button>
                            </div>
                            <div className="space-y-2 text-sm">
                                {[
                                    {
                                        label: 'Method', value: deliveryMethod === 'delivery'
                                            ? '🚚 Home Delivery' : '🏪 Store Pickup'
                                    },
                                    { label: 'Name', value: form.name },
                                    { label: 'Phone', value: form.phone },
                                    ...(deliveryMethod === 'delivery'
                                        ? [{ label: 'Address', value: form.address }]
                                        : []),
                                    ...(deliveryZone
                                        ? [{
                                            label: 'Zone',
                                            value: DELIVERY_ZONES.find(z => z.value === deliveryZone)?.label
                                        }]
                                        : []),
                                ].map((info) => (
                                    <div key={info.label} className="flex gap-3">
                                        <span className="text-neutral-slate w-20 shrink-0">
                                            {info.label}
                                        </span>
                                        <span className="font-medium text-brand-charcoal">
                                            {info.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border
                            border-gray-100 mb-6">
                            <h2 className="font-semibold text-brand-charcoal mb-4">
                                Order Items ({cartItems.length})
                            </h2>
                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-lg bg-neutral-light
                                    overflow-hidden shrink-0">
                                            {item.products?.cover_image ? (
                                                <img src={item.products.cover_image}
                                                    alt={item.products.name}
                                                    className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center
                                        justify-center text-xl">📦</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-brand-charcoal text-sm
                                    line-clamp-1">
                                                {item.products?.name}
                                            </p>
                                            {item.selected_color && (
                                                <span className="inline-flex items-center gap-1 mt-0.5
                                         bg-primary-light text-primary-dark text-xs
                                         px-2 py-0.5 rounded-full font-medium">
                                                    {item.selected_color}
                                                </span>
                                            )}
                                            <p className="text-neutral-slate text-xs mt-0.5">
                                                Qty: {item.quantity} ×
                                                ₦{Number(item.products?.price).toLocaleString()}
                                            </p>
                                        </div>
                                        <p className="font-bold text-brand-charcoal text-sm shrink-0">
                                            ₦{(Number(item.products?.price) * item.quantity)
                                                .toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

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
                                        ₦{cartTotal.toLocaleString()}
                                    </span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-primary">
                                            Promo ({promoData?.code})
                                        </span>
                                        <span className="font-medium text-primary">
                                            − ₦{discount.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-neutral-slate">Delivery</span>
                                    {deliveryMethod === 'pickup' ? (
                                        <span className="text-primary font-medium">Free (Pickup)</span>
                                    ) : deliveryFee === 0 ? (
                                        <span className="text-primary font-medium">Free</span>
                                    ) : (
                                        <span className="font-medium text-brand-charcoal">
                                            ₦{deliveryFee.toLocaleString()}
                                            <span className="text-neutral-slate font-normal ml-1 text-xs">
                                                ({DELIVERY_ZONES.find(z => z.value === deliveryZone)?.label})
                                            </span>
                                        </span>
                                    )}
                                </div>
                                <div className="border-t border-gray-100 pt-3
                                flex justify-between">
                                    <span className="font-bold text-brand-charcoal">Total</span>
                                    <span className="font-extrabold text-primary text-xl">
                                        ₦{finalTotal.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleGoToPayment}
                            className="w-full bg-primary hover:bg-primary-dark text-white
                         py-4 rounded-xl font-bold text-base transition-all
                         hover:scale-[1.01]">
                            Continue to Payment →
                        </button>

                        <button onClick={() => setStep(1)}
                            className="w-full mt-3 text-neutral-slate hover:text-brand-charcoal
                         text-sm font-medium transition-colors py-2">
                            ← Back to Delivery Details
                        </button>
                    </div>
                )}

                {/* ── STEP 3 ── */}
                {step === 3 && (
                    <div>
                        <h1 className="text-2xl font-bold text-brand-charcoal mb-2">
                            Complete Payment
                        </h1>
                        <p className="text-neutral-slate text-sm mb-6">
                            Transfer the exact amount then upload your proof below.
                        </p>

                        {/* Amount */}
                        <div className="bg-primary-light rounded-xl p-5 mb-6 text-center">
                            <p className="text-neutral-slate text-sm mb-1">Amount to Pay</p>
                            <p className="text-3xl font-extrabold text-primary">
                                ₦{finalTotal.toLocaleString()}
                            </p>
                        </div>

                        {/* Bank Details */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border
                            border-gray-100 mb-6">
                            <h2 className="font-semibold text-brand-charcoal mb-4">
                                🏦 Bank Account Details
                            </h2>
                            <div className="space-y-4">
                                {[
                                    { label: 'Bank Name', value: settings?.bank_name },
                                    { label: 'Account Number', value: settings?.account_number },
                                    { label: 'Account Name', value: settings?.account_name },
                                ].map((detail) => (
                                    <div key={detail.label}
                                        className="flex items-center justify-between py-3
                                  border-b border-gray-50 last:border-0">
                                        <span className="text-neutral-slate text-sm">
                                            {detail.label}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-brand-charcoal">
                                                {detail.value || '—'}
                                            </span>
                                            {detail.label === 'Account Number' && (
                                                <button onClick={handleCopyAccountNumber}
                                                    className="text-xs bg-primary-light text-primary-dark
                                     px-2 py-1 rounded-lg font-semibold">
                                                    Copy
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 bg-amber-50 border border-amber-200
                              rounded-lg px-4 py-3">
                                <p className="text-amber-800 text-xs font-medium">
                                    ⚠️ Please use{' '}
                                    <span className="font-bold">"{form.name}"</span>{' '}
                                    as the transfer narration.
                                </p>
                            </div>
                        </div>

                        {/* Upload Proof */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border
                            border-gray-100 mb-6">
                            <h2 className="font-semibold text-brand-charcoal mb-2">
                                📸 Upload Payment Proof
                            </h2>
                            <p className="text-neutral-slate text-xs mb-4">
                                Upload a screenshot or photo of your transfer receipt.
                            </p>

                            <label className="relative group cursor-pointer block">
                                {paymentProofPreview ? (
                                    <div className="mb-4 relative">
                                        <img src={paymentProofPreview} alt="preview"
                                            className="w-full h-48 object-contain rounded-xl
                                    border border-primary-light bg-primary-light/10" />
                                        <div className="absolute inset-0 flex items-center
                                    justify-center bg-black/20 opacity-0
                                    group-hover:opacity-100 transition-opacity
                                    rounded-xl">
                                            <span className="bg-white px-3 py-1.5 rounded-full
                                       text-xs font-bold shadow-sm">
                                                Change Image
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-gray-200
                                  rounded-xl p-8 text-center hover:border-primary
                                  hover:bg-primary-light/5 transition-all">
                                        <div className="text-4xl mb-3">📸</div>
                                        <p className="text-sm font-medium text-brand-charcoal">
                                            Click to upload receipt
                                        </p>
                                        <p className="text-xs text-neutral-slate mt-1">
                                            Supports PNG, JPG (Max 5MB)
                                        </p>
                                    </div>
                                )}
                                <input type="file" accept="image/*"
                                    onChange={handlePaymentProof} className="hidden" />
                            </label>
                        </div>

                        {paymentError && (
                            <div className="bg-red-50 border border-red-200 text-red-600
                              text-sm rounded-lg px-4 py-3 mb-4">
                                {paymentError}
                            </div>
                        )}

                        <button onClick={handleSubmitProof}
                            disabled={uploadingProof || !paymentProofFile}
                            className="w-full bg-primary hover:bg-primary-dark text-white
                         py-4 rounded-xl font-bold text-base transition-all
                         hover:scale-[1.01] disabled:opacity-50
                         disabled:cursor-not-allowed disabled:scale-100">
                            {uploadingProof
                                ? 'Submitting...'
                                : '✅ I Have Paid — Submit Proof'
                            }
                        </button>

                        <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
                            <button type="button"
                                className="w-full mt-3 bg-blue-500 hover:bg-blue-600
                           text-white py-3.5 rounded-xl font-bold text-base
                           text-center transition-all hover:scale-[1.01]
                           flex items-center justify-center gap-2">
                                💬 Pay via WhatsApp
                            </button>
                        </a>

                        <button onClick={() => setStep(2)}
                            className="w-full mt-3 text-neutral-slate hover:text-brand-charcoal
                         text-sm font-medium transition-colors py-2">
                            ← Back to Order Review
                        </button>
                    </div>
                )}

                {/* ── STEP 4 ── */}
                {step === 4 && confirmedOrder && (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-primary-light rounded-full flex
                            items-center justify-center text-4xl mx-auto mb-6 animate-pulse">
                            ✅
                        </div>
                        <h1 className="text-2xl font-bold text-brand-charcoal mb-2">
                            Order Placed Successfully!
                        </h1>
                        <p className="text-neutral-slate text-sm mb-8">
                            Your payment proof has been submitted. We will contact you shortly.
                        </p>

                        <div className="bg-white rounded-xl p-6 shadow-sm border
                            border-gray-100 text-left mb-8">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-neutral-slate">Order ID</span>
                                    <span className="font-mono font-bold text-brand-charcoal">
                                        #{confirmedOrder.id.slice(0, 8).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-slate">Delivery</span>
                                    <span className="font-medium text-brand-charcoal capitalize">
                                        {deliveryMethod}
                                    </span>
                                </div>
                                {deliveryFee > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-neutral-slate">Delivery Fee</span>
                                        <span className="font-medium text-brand-charcoal">
                                            ₦{deliveryFee.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-2 border-t border-gray-100">
                                    <span className="font-bold text-brand-charcoal">Total</span>
                                    <span className="font-extrabold text-primary">
                                        ₦{finalTotal.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Link to="/"
                                className="flex-1 border border-gray-300 text-neutral-slate
                           hover:text-brand-charcoal py-3 rounded-xl
                           font-semibold text-sm text-center transition-all">
                                Back to Home
                            </Link>
                            <Link to="/shop"
                                className="flex-1 bg-primary hover:bg-primary-dark text-white
                           py-3 rounded-xl font-bold text-sm text-center
                           transition-all">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                )}

            </div>
        </Layout>
    )
}