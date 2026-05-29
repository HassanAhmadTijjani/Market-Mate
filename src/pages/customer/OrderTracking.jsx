// @ts-nocheck
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '../../components/common/Layout'
import { useCustomerOrders } from '../../hooks/useCustomerOrders'
import { useReviews } from '../../hooks/useReviews'
import StarDisplay from '../../components/common/StarDisplay'
import toast from 'react-hot-toast'

const ORDER_STEPS = [
  { key: 'pending',    label: 'Order Placed', desc: 'Your order has been received',  icon: '📋' },
  { key: 'processing', label: 'Processing',   desc: 'Your order is being prepared',  icon: '⚙️' },
  { key: 'shipped',    label: 'Shipped',       desc: 'Your order is on the way',      icon: '🚚' },
  { key: 'delivered',  label: 'Delivered',     desc: 'Your order has been delivered', icon: '✅' },
]

const PICKUP_STEPS = [
  { key: 'pending',    label: 'Order Placed',     desc: 'Your order has been received',            icon: '📋' },
  { key: 'processing', label: 'Processing',        desc: 'Your order is being prepared',            icon: '⚙️' },
  { key: 'delivered',  label: 'Ready for Pickup',  desc: 'Come collect your order at the store',   icon: '🏪' },
]

const STATUS_STYLES = {
  pending:    'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-primary-light text-primary-dark',
  cancelled:  'bg-red-100 text-red-600',
}

function getStepIndex(status, steps) {
  if (status === 'cancelled') return -1
  return steps.findIndex(s => s.key === status)
}

// ✅ Defined OUTSIDE component — not recreated on every render
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className={`text-3xl transition-all hover:scale-110
            ${star <= (hovered || value)
              ? 'text-amber-400'
              : 'text-gray-200'
            }`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function OrderTracking() {
  const { id }                                                 = useParams()
  const { fetchOrderById }                                     = useCustomerOrders()
  const { checkExistingReview, submitReview, fetchOrderReviews } = useReviews()
  const navigate                                               = useNavigate()

  const [order, setOrder]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  // review states
  const [reviewed, setReviewed]         = useState({}) // { itemId: true }
  const [reviewModal, setReviewModal]   = useState(null) // { item, orderId }
  const [reviewForm, setReviewForm]     = useState({ rating: 0, comment: '' })
  const [submitting, setSubmitting]     = useState(false)

  // load order
  useEffect(() => {
    async function load() {
      try {
        const data = await fetchOrderById(id)
        setOrder(data)
      } catch {
        setError('Order not found')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [fetchOrderById, id])

  // when order loads, pre-mark which items are already reviewed
  // this prevents showing "Leave Review" on already-reviewed items
  useEffect(() => {
    if (!order || order.status !== 'delivered') return

    fetchOrderReviews(order.id).then(reviewedProducts => {
      if (!reviewedProducts?.length) return

      const reviewMap = {}
      order.order_items?.forEach(item => {
        const alreadyReviewed = reviewedProducts.find(
          r => r.product_id === item.product_id
        )
        if (alreadyReviewed) reviewMap[item.id] = true
      })
      setReviewed(reviewMap)
    })
  }, [order])

  async function handleOpenReview(item) {
    // double-check at DB level before opening modal
    const existing = await checkExistingReview(item.product_id, order.id)
    if (existing) {
      // already reviewed — mark in state and return
      setReviewed(prev => ({ ...prev, [item.id]: true }))
      toast.error('You have already reviewed this product')
      return
    }
    setReviewModal({ item, orderId: order.id })
    setReviewForm({ rating: 0, comment: '' })
  }

  async function handleSubmitReview() {
    if (reviewForm.rating === 0) {
      toast.error('Please select a star rating')
      return
    }

    setSubmitting(true)
    try {
      await submitReview({
        productId: reviewModal.item.product_id,
        orderId:   reviewModal.orderId,
        rating:    reviewForm.rating,
        comment:   reviewForm.comment,
      })

      // mark as reviewed immediately
      setReviewed(prev => ({ ...prev, [reviewModal.item.id]: true }))
      setReviewModal(null)
      toast.success('Review submitted! Thank you 🎉')

    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-NG', {
      day: 'numeric', month: 'long',
      year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  if (loading) return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-4 animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-1/3" />
        <div className="h-32 bg-gray-100 rounded-xl" />
        <div className="h-48 bg-gray-100 rounded-xl" />
      </div>
    </Layout>
  )

  if (error) return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h1 className="text-xl font-bold text-brand-charcoal mb-2">{error}</h1>
        <button onClick={() => navigate('/orders')}
          className="bg-primary text-white px-6 py-2.5 rounded-lg
                     font-semibold text-sm mt-4">
          Back to My Orders
        </button>
      </div>
    </Layout>
  )

  const isCancelled = order.status === 'cancelled'
  const steps       = order.delivery_method === 'pickup' ? PICKUP_STEPS : ORDER_STEPS
  const currentStep = getStepIndex(order.status, steps)

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/orders')}
            className="text-neutral-slate hover:text-brand-charcoal transition-colors">
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
          <span className={`ml-auto text-xs px-3 py-1.5 rounded-full
                            font-semibold capitalize shrink-0
            ${STATUS_STYLES[order.status]}`}>
            {order.status}
          </span>
        </div>

        {/* Progress Tracker */}
        {!isCancelled ? (
          <div className="bg-white rounded-xl p-6 shadow-sm border
                          border-gray-100 mb-6">
            <h2 className="font-semibold text-brand-charcoal mb-6">
              Order Progress
            </h2>
            <div className="flex items-start justify-between relative">
              <div className="absolute top-5 left-0 right-0 h-0.5
                              bg-gray-200 mx-8 z-0">
                <div className="h-full bg-primary transition-all duration-500"
                     style={{
                       width: currentStep <= 0
                         ? '0%'
                         : `${(currentStep / (steps.length - 1)) * 100}%`
                     }} />
              </div>
              {steps.map((step, index) => {
                const isCompleted = index < currentStep
                const isCurrent   = index === currentStep
                const isFuture    = index > currentStep
                return (
                  <div key={step.key}
                       className="flex flex-col items-center z-10 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center
                                    justify-center text-lg mb-2 transition-all
                                    border-2
                      ${isCompleted
                        ? 'bg-primary border-primary'
                        : isCurrent
                        ? 'bg-white border-primary ring-4 ring-primary-light'
                        : 'bg-white border-gray-200'
                      }`}>
                      {isCompleted
                        ? <span className="text-white text-sm font-bold">✓</span>
                        : <span className={isFuture ? 'opacity-40' : ''}>
                            {step.icon}
                          </span>
                      }
                    </div>
                    <p className={`text-xs font-semibold text-center leading-tight
                                   max-w-[70px]
                      ${isCompleted || isCurrent
                        ? 'text-primary'
                        : 'text-neutral-slate'
                      }`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-neutral-slate text-center
                                  leading-tight max-w-20 mt-0.5 hidden sm:block">
                      {step.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-xl
                          p-6 mb-6 text-center">
            <p className="text-3xl mb-2">❌</p>
            <p className="font-bold text-red-700 mb-1">Order Cancelled</p>
            <p className="text-red-600 text-sm">
              This order has been cancelled. Contact us if you have questions.
            </p>
          </div>
        )}

        {/* Delivery Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border
                        border-gray-100 mb-6">
          <h2 className="font-semibold text-brand-charcoal mb-4">
            Delivery Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {[
              { label: 'Name',   value: order.customer_name  },
              { label: 'Phone',  value: order.customer_phone },
              {
                label: 'Method',
                value: order.delivery_method === 'delivery'
                  ? '🚚 Home Delivery'
                  : '🏪 Store Pickup'
              },
              ...(order.delivery_method === 'delivery'
                ? [{ label: 'Address', value: order.address }]
                : []),
            ].map(info => (
              <div key={info.label}>
                <p className="text-neutral-slate text-xs mb-0.5">{info.label}</p>
                <p className="font-medium text-brand-charcoal">{info.value || '—'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl p-6 shadow-sm border
                        border-gray-100 mb-6">
          <h2 className="font-semibold text-brand-charcoal mb-4">
            Products Ordered ({order.order_items?.length})
          </h2>

          {/* Delivered banner */}
          {order.status === 'delivered' && (
            <div className="bg-primary-light rounded-lg px-4 py-2.5 mb-4
                            flex items-center gap-2">
              <span>⭐</span>
              <p className="text-primary-dark text-xs font-medium">
                Your order was delivered! Share your experience by
                leaving a review on each product.
              </p>
            </div>
          )}

          <div className="space-y-1">
            {order.order_items?.map(item => (
              <div key={item.id}
                   className="py-4 border-b border-gray-50 last:border-0">

                {/* Item row */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-neutral-light
                                  overflow-hidden shrink-0">
                    {item.products?.cover_image ? (
                      <img src={item.products.cover_image} alt={item.name}
                           className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center
                                      justify-center text-xl">📦</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-brand-charcoal text-sm
                                  line-clamp-1">
                      {item.name}
                    </p>
                    {item.selected_color && (
                      <span className="inline-flex items-center gap-1 mt-0.5
                                       bg-primary-light text-primary-dark text-xs
                                       px-2 py-0.5 rounded-full font-medium">
                        🎨 {item.selected_color}
                      </span>
                    )}
                    <p className="text-neutral-slate text-xs mt-0.5">
                      ₦{Number(item.price).toLocaleString()} × {item.quantity}
                    </p>
                  </div>

                  <p className="font-bold text-brand-charcoal text-sm shrink-0">
                    ₦{Number(item.subtotal).toLocaleString()}
                  </p>
                </div>

                {/* ✅ Review button — separate row below item */}
                {order.status === 'delivered' && (
                  <div className="mt-2 ml-18">
                    {reviewed[item.id] ? (
                      <span className="inline-flex items-center gap-1 text-xs
                                       text-primary font-semibold p-2 border rounded-lg">
                        ✅ You reviewed this product
                      </span>
                    ) : (
                      <button
                        onClick={() => handleOpenReview(item)}
                        className="inline-flex items-center gap-1.5 text-xs
                                   font-semibold text-neutral-slate
                                   hover:text-primary transition-colors
                                   border border-gray-200 hover:border-primary
                                   px-3 py-1.5 rounded-lg p-2  "
                      >
                        ⭐ Leave a Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Price Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border
                        border-gray-100 mb-8">
          <h2 className="font-semibold text-brand-charcoal mb-4">
            Price Summary
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
            <div className="flex justify-between">
              <span className="text-neutral-slate">Delivery</span>
              <span className="font-medium text-brand-charcoal">
                {Number(order.delivery_fee) === 0
                  ? order.delivery_method === 'pickup' ? 'Free (Pickup)' : 'Free'
                  : `₦${Number(order.delivery_fee).toLocaleString()}`
                }
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

        {/* Actions */}
        <div className="flex gap-4">
          <Link to="/orders"
            className="flex-1 border border-gray-300 text-neutral-slate
                       hover:text-brand-charcoal py-3 rounded-xl font-semibold
                       text-sm text-center transition-all">
            ← All Orders
          </Link>
          <Link to="/shop"
            className="flex-1 bg-primary hover:bg-primary-dark text-white
                       py-3 rounded-xl font-bold text-sm text-center
                       transition-all">
            Continue Shopping
          </Link>
        </div>

      </div>

      {/* ── Review Modal ── */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center
                        justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-brand-charcoal">
                Leave a Review
              </h2>
              <button onClick={() => !submitting && setReviewModal(null)}
                disabled={submitting}
                className="text-neutral-slate hover:text-brand-charcoal
                           text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                ✕
              </button>
            </div>

            {/* Product Info */}
            <div className="flex items-center gap-3 mb-6 p-3
                            bg-neutral-light rounded-xl">
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                {reviewModal.item.products?.cover_image ? (
                  <img src={reviewModal.item.products.cover_image}
                       alt={reviewModal.item.name}
                       className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center
                                  justify-center text-xl bg-white">📦</div>
                )}
              </div>
              <p className="font-semibold text-brand-charcoal text-sm line-clamp-2">
                {reviewModal.item.name}
              </p>
            </div>

            {/* Star Picker */}
            <div className="mb-4">
              <p className="text-sm font-medium text-brand-charcoal mb-2">
                Your Rating *
              </p>
              <StarPicker
                value={reviewForm.rating}
                onChange={v => setReviewForm({ ...reviewForm, rating: v })}
              />
              {reviewForm.rating > 0 && (
                <p className="text-xs text-neutral-slate mt-1">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][
                    reviewForm.rating
                  ]}
                </p>
              )}
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-medium
                                text-brand-charcoal mb-1">
                Your Comment
                <span className="text-neutral-slate font-normal ml-1">
                  (optional)
                </span>
              </label>
              <textarea
                value={reviewForm.comment}
                onChange={e => setReviewForm({
                  ...reviewForm, comment: e.target.value
                })}
                rows={4}
                placeholder="Share your experience with this product..."
                className="w-full border border-gray-300 rounded-xl
                           px-4 py-3 text-sm focus:outline-none
                           focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => !submitting && setReviewModal(null)}
                disabled={submitting}
                className="flex-1 border border-gray-300 text-neutral-slate
                           py-3 rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submitting || reviewForm.rating === 0}
                className="flex-1 bg-primary hover:bg-primary-dark text-white
                           py-3 rounded-xl font-bold text-sm transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>

          </div>
        </div>
      )}

    </Layout>
  )
}