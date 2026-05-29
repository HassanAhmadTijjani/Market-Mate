// @ts-nocheck
import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import StarDisplay from '../../components/common/StarDisplay' // Import the common StarDisplay
import { useReviews } from '../../hooks/useReviews'
import toast from 'react-hot-toast'

export default function Reviews() {
    const { fetchAllReviews, toggleApprove, deleteReview } = useReviews()

    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    async function load() {
        setLoading(true)
        try {
            const data = await fetchAllReviews()
            setReviews(data)
        } catch (err) {
            toast.error(err.message || 'Failed to load reviews')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    async function handleToggle(review) {
        try {
            await toggleApprove(review.id, review.is_approved)
            toast.success(review.is_approved ? 'Review hidden' : 'Review approved')
            load()
        } catch (err) {
            toast.error(err.message)
        }
    }

    async function handleDelete(review) {
        if (!window.confirm('Delete this review permanently?')) return
        try {
            await deleteReview(review.id)
            toast.success('Review deleted')
            load()
        } catch (err) {
            toast.error(err.message)
        }
    }

    const filtered = reviews.filter(r => {
        if (filter === 'approved') return r.is_approved
        if (filter === 'hidden') return !r.is_approved
        if (filter === '5star') return r.rating === 5
        if (filter === 'low') return r.rating <= 2
        return true
    })

    return (
        <AdminLayout>
            <div>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-brand-charcoal">
                        Reviews
                    </h1>
                    <p className="text-neutral-slate text-sm mt-1">
                        Manage customer product reviews
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        {
                            label: 'Total Reviews', value: reviews.length,
                            color: 'text-brand-charcoal'
                        },
                        {
                            label: 'Approved', value: reviews.filter(r => r.is_approved).length,
                            color: 'text-primary'
                        },
                        {
                            label: 'Hidden', value: reviews.filter(r => !r.is_approved).length,
                            color: 'text-amber-600'
                        },
                        {
                            label: 'Avg Rating',
                            value: reviews.length
                                ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)
                                    .toFixed(1) + ' ★'
                                : '—',
                            color: 'text-amber-500'
                        },
                    ].map(stat => (
                        <div key={stat.label}
                            className="bg-white rounded-xl p-4 shadow-sm border
                            border-gray-100 text-center">
                            <p className={`text-2xl font-bold ${stat.color}`}>
                                {stat.value}
                            </p>
                            <p className="text-neutral-slate text-xs mt-1">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {[
                        { label: 'All', value: 'all' },
                        { label: '✅ Approved', value: 'approved' },
                        { label: '🙈 Hidden', value: 'hidden' },
                        { label: '⭐ 5 Stars', value: '5star' },
                        { label: '⚠️ Low', value: 'low' },
                    ].map(tab => (
                        <button key={tab.value}
                            onClick={() => setFilter(tab.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium
                          transition-all
                ${filter === tab.value
                                    ? 'bg-primary text-white'
                                    : 'bg-white text-neutral-slate border border-gray-200 hover:border-primary'
                                }`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Reviews List */}
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i}
                                className="h-32 bg-gray-100 rounded-xl animate-pulse" />
                        ))}
                    </div>

                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center border
                          border-gray-100">
                        <p className="text-4xl mb-3">⭐</p>
                        <p className="font-semibold text-brand-charcoal">
                            No reviews found
                        </p>
                    </div>

                ) : (
                    <div className="space-y-4">
                        {filtered.map(review => (
                            <div key={review.id}
                                className={`bg-white rounded-xl p-6 shadow-sm border
                               transition-all
                     ${review.is_approved
                                        ? 'border-gray-100'
                                        : 'border-amber-200 bg-amber-50/30'
                                    }`}>
                                <div className="flex items-start justify-between gap-4">

                                    {/* Left — product + customer */}
                                    <div className="flex items-start gap-4 flex-1 min-w-0">

                                        {/* Product Image */}
                                        <div className="w-14 h-14 rounded-xl overflow-hidden
                                    bg-neutral-light shrink-0">
                                            {review.products?.cover_image ? (
                                                <img src={review.products.cover_image}
                                                    alt={review.products.name}
                                                    className="w-full h-full object-cover" />
                                            ) : review.products?.name ? ( // Product exists, but no cover image
                                                <div className="w-full h-full flex items-center
                                                justify-center text-xl">📦</div>
                                            ) : (
                                                // Product does not exist or RLS blocked
                                                <div className="w-full h-full flex items-center
                                                justify-center text-xs text-neutral-slate text-center p-1">
                                                    Product Deleted
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            {/* Product name + rating */}
                                            <div className="flex items-center gap-3 flex-wrap mb-1">
                                                <p className={`font-semibold text-sm truncate
                                                    ${review.products ? 'text-brand-charcoal' : 'text-red-500 italic'}`}>
                                                    {review.products?.name || 'Deleted Product'}
                                                </p>
                                                <StarDisplay rating={review.rating} />
                                                <span className="font-bold text-amber-500 text-sm">
                                                    {review.rating}/5
                                                </span>
                                            </div>

                                            {/* Customer */}
                                            <p className="text-xs text-neutral-slate mb-2">
                                                By <span className="font-medium">
                                                    {review.profiles?.full_name || 'Anonymous'}
                                                </span> •{' '}
                                                {new Date(review.created_at).toLocaleDateString(
                                                    'en-NG', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                }
                                                )}
                                            </p>

                                            {/* Comment */}
                                            {review.comment && (
                                                <p className="text-neutral-slate text-sm
                                      leading-relaxed">
                                                    "{review.comment}"
                                                </p>
                                            )}

                                            {/* Status badge */}
                                            <div className="mt-2">
                                                <span className={`inline-flex px-2 py-0.5 rounded-full
                                          text-xs font-semibold
                          ${review.is_approved
                                                        ? 'bg-primary-light text-primary-dark'
                                                        : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {review.is_approved ? '✅ Visible' : '🙈 Hidden'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right — actions */}
                                    <div className="flex flex-col gap-2 shrink-0">
                                        <button onClick={() => handleToggle(review)}
                                            className={`text-xs font-semibold px-3 py-1.5
                                  rounded-lg transition-all
                        ${review.is_approved
                                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                    : 'bg-primary-light text-primary-dark hover:bg-primary hover:text-white'
                                                }`}>
                                            {review.is_approved ? 'Hide' : 'Approve'}
                                        </button>
                                        <button onClick={() => handleDelete(review)}
                                            className="text-xs font-semibold px-3 py-1.5
                                 rounded-lg bg-red-50 text-red-500
                                 hover:bg-red-500 hover:text-white
                                 transition-all">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </AdminLayout>
    )
}