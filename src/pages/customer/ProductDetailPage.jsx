// @ts-nocheck
import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import usePublicProducts from '../../hooks/usePublicProducts'
import useSettings from '../../hooks/useSettings'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import StarDisplay from '../../components/common/StarDisplay' // Import the common StarDisplay
import { useReviews } from '../../hooks/useReviews'

const ProductDetailPage = () => {
    const { slug } = useParams()
    const { fetchProductBySlug } = usePublicProducts()
    const { settings } = useSettings()
    const { addToCart } = useCart()
    const { user } = useAuth()
    const navigate = useNavigate()

    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [quantity, setQuantity] = useState(1)
    const [notFound, setNotFound] = useState(false)
    const [addingToCart, setAddingToCart] = useState(false)
    const [addedToCart, setAddedToCart] = useState(false)
    const [activeImage, setActiveImage] = useState(null)
    const [selectedColor, setSelectedColor] = useState(null)
    const [colorError, setColorError] = useState(false)
    // Reviews
    const { fetchProductReviews } = useReviews()
    const [reviews, setReviews] = useState([])
    const [reviewsLoading, setReviewsLoading] = useState(true)
    const [avgRating, setAvgRating] = useState(0)

    useEffect(() => {
        async function loadProduct() {
            try {
                window.scrollTo(0, 0)
                const data = await fetchProductBySlug(slug)
                setProduct(data)
            } catch {
                setNotFound(true)
            } finally {
                setLoading(false)
            }
        }
        loadProduct()
    }, [slug])

    useEffect(() => {
        if (product) {
            setActiveImage(product.cover_image)
            setReviewsLoading(true)
            fetchProductReviews(product.id)
                .then(data => {
                    setReviews(data || [])
                    if (data && data.length > 0) {
                        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length
                        setAvgRating(Math.round(avg * 10) / 10)
                    } else {
                        setAvgRating(0)
                    }
                })
                .catch(() => {
                    setReviews([])
                    setAvgRating(0)
                })
                .finally(() => setReviewsLoading(false))
        }
    }, [product])

    async function handleAddToCart() {
        if (!user) {
            toast.error('Please login to add items to your cart')
            navigate('/login')
            return
        }

        // ✅ require color selection if product has colors
        if (product.colors && product.colors.length > 0 && !selectedColor) {
            setColorError(true)
            toast.error('Please select a color first')
            return
        }

        setColorError(false)
        setAddingToCart(true)
        await addToCart(product.id, quantity, selectedColor)
        setAddingToCart(false)
        setAddedToCart(true)
        setTimeout(() => setAddedToCart(false), 2000)
    }

    function increaseQty() {
        if (quantity < product.stock) setQuantity(q => q + 1)
    }

    function decreaseQty() {
        if (quantity > 1) setQuantity(q => q - 1)
    }

    function getWhatsAppLink() {
        const phone = (settings?.store_phone || '')
            .replace(/\D/g, '').replace(/^0/, '234')
        const message = encodeURIComponent(
            `Hello ${settings?.store_name || 'MarketMate'}, I want to ask about: ${product?.name}`
        )
        return `https://wa.me/${phone}?text=${message}`
    }

    if (loading) return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
                <div className="space-y-4">
                    <div className="h-6 bg-gray-100 rounded animate-pulse w-1/3" />
                    <div className="h-8 bg-gray-100 rounded animate-pulse" />
                    <div className="h-8 bg-gray-100 rounded animate-pulse w-1/2" />
                    <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                </div>
            </div>
        </div>
    )

    if (notFound) return (
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
            <p className="text-5xl mb-4">😕</p>
            <h1 className="text-2xl font-bold text-brand-charcoal mb-2">
                Product Not Found
            </h1>
            <p className="text-neutral-slate text-sm mb-6">
                This product doesn't exist or has been removed
            </p>
            <button onClick={() => navigate('/shop')}
                className="bg-primary hover:bg-primary-dark text-white px-6
                   py-2.5 rounded-lg font-semibold text-sm transition-all">
                Back to Shop
            </button>
        </div>
    )

    const isOutOfStock = product.stock === 0
    const isLowStock = product.stock > 0 &&
        product.stock <= product.low_stock_threshold

    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto px-6 py-10">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-neutral-slate mb-8">
                    <button onClick={() => navigate('/')}
                        className="hover:text-primary transition-colors">
                        Home
                    </button>
                    <span>›</span>
                    <button onClick={() => navigate('/shop')}
                        className="hover:text-primary transition-colors">
                        Shop
                    </button>
                    <span>›</span>
                    <span className="text-brand-charcoal font-medium truncate max-w-xs">
                        {product.name}
                    </span>
                </div>

                {/* Product Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">

                    {/* Image Gallery */}
                    <div className="flex flex-col gap-4">

                        {/* Main Image */}
                        <div className="w-full h-80 md:h-96 bg-neutral-light rounded-2xl
                            overflow-hidden border border-gray-100">
                            {activeImage ? (
                                <img src={activeImage} alt={product.name}
                                    className="w-full h-full object-cover transition-all duration-300" />
                            ) : (
                                <div className="w-full h-full flex items-center
                                justify-center text-6xl">📦</div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {product.images && product.images.length > 0 && (
                            <div className="flex gap-3 flex-wrap">

                                {/* Cover thumbnail */}
                                <button
                                    onClick={() => setActiveImage(product.cover_image)}
                                    className={`w-16 h-16 rounded-xl overflow-hidden border-2
                              transition-all shrink-0
                    ${activeImage === product.cover_image
                                            ? 'border-primary shadow-md scale-105'
                                            : 'border-gray-200 hover:border-primary hover:scale-105'
                                        }`}
                                >
                                    <img src={product.cover_image} alt="Cover"
                                        className="w-full h-full object-cover" />
                                </button>

                                {/* Extra thumbnails */}
                                {product.images.map((img, i) => (
                                    <button key={i}
                                        onClick={() => setActiveImage(img)}
                                        className={`w-16 h-16 rounded-xl overflow-hidden border-2
                                transition-all shrink-0
                      ${activeImage === img
                                                ? 'border-primary shadow-md scale-105'
                                                : 'border-gray-200 hover:border-primary hover:scale-105'
                                            }`}
                                    >
                                        <img src={img} alt={`Image ${i + 1}`}
                                            className="w-full h-full object-cover" />
                                    </button>
                                ))}

                                <div className="self-end mb-1">
                                    <span className="text-xs text-neutral-slate">
                                        {1 + product.images.length} photos
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div>

                        {/* Category & Brand */}
                        <div className="flex items-center gap-2 mb-3">
                            {product.categories?.name && (
                                <span className="bg-primary-light border text-primary-dark text-xs
                                 font-semibold px-3 py-1 rounded-full">
                                    {product.categories.name}
                                </span>
                            )}
                            {product.brand && (
                                <span className="text-neutral-slate text-sm">{product.brand}</span>
                            )}
                        </div>

                        {/* Name */}
                        <h1 className="text-2xl font-bold text-brand-charcoal mb-4 leading-snug">
                            {product.name}
                        </h1>

                        {/* Price */}
                        <p className="text-3xl md:text-4xl font-extrabold text-primary mb-6">
                            ₦{Number(product.price).toLocaleString()}
                        </p>

                        {/* Stock Status */}
                        <div className="mb-6">
                            {isOutOfStock ? (
                                <span className="bg-red-100 text-red-600 text-sm font-semibold
                                 px-3 py-1 rounded-full">
                                    ❌ Out of Stock
                                </span>
                            ) : isLowStock ? (
                                <span className="bg-amber-100 text-amber-700 text-sm font-semibold
                                 px-3 py-1 rounded-full">
                                    ⚠️ Only {product.stock} left
                                </span>
                            ) : (
                                <span className="bg-primary-light text-primary-dark text-sm
                                 font-semibold px-3 py-1 rounded-md border">
                                    In Stock ({product.stock} available)
                                </span>
                            )}
                        </div>

                        {/* Color Selector — only show if product has colors */}
                        {product.colors && product.colors.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-brand-charcoal">
                                        Color
                                        {selectedColor && (
                                            <span className="text-primary font-normal ml-2">
                                                — {selectedColor}
                                            </span>
                                        )}
                                    </h3>
                                    {colorError && (
                                        <span className="text-red-500 text-xs font-medium">
                                            Please select a color
                                        </span>
                                    )}
                                </div>

                                {/* Desktop — chips (hidden on mobile) */}
                                <div className="hidden sm:flex gap-2 flex-wrap">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => {
                                                setSelectedColor(color)
                                                setColorError(false)
                                            }}
                                            className={`px-4 py-2 rounded-full border-2 text-sm font-medium
                      transition-all hover:scale-[1.03]
            ${selectedColor === color
                                                    ? 'border-primary bg-primary text-white shadow-md'
                                                    : 'border-gray-300 text-brand-charcoal hover:border-primary'
                                                } ${colorError ? 'border-red-300' : ''}`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>

                                {/* Mobile — dropdown (hidden on desktop) */}
                                <select
                                    className={`block sm:hidden w-full border-2 rounded-xl px-4 py-3
                  text-sm focus:outline-none focus:ring-2 focus:ring-primary
                  bg-white font-medium transition-all
        ${colorError
                                            ? 'border-red-300 focus:ring-red-300'
                                            : selectedColor
                                                ? 'border-primary text-brand-charcoal'
                                                : 'border-gray-300 text-neutral-slate'
                                        }`}
                                    value={selectedColor || ''}
                                    onChange={(e) => {
                                        setSelectedColor(e.target.value || null)
                                        setColorError(false)
                                    }}
                                >
                                    <option value="">Select a color...</option>
                                    {product.colors.map((color) => (
                                        <option key={color} value={color}>{color}</option>
                                    ))}
                                </select>

                                {colorError && (
                                    <p className="text-red-500 text-xs mt-2">
                                        ⚠️ You must select a color before adding to cart
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Description */}
                        {product.description && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-brand-charcoal mb-2">
                                    Description
                                </h3>
                                <p className="text-neutral-slate text-sm leading-relaxed">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {/* Quantity */}
                        {!isOutOfStock && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-brand-charcoal mb-2">
                                    Quantity
                                </h3>
                                <div className="flex items-center gap-3">
                                    <button onClick={decreaseQty} disabled={quantity <= 1}
                                        className="w-9 h-9 rounded-lg border border-gray-300 flex items-center
                               justify-center text-lg font-bold text-brand-charcoal
                               hover:bg-gray-50 disabled:opacity-40
                               disabled:cursor-not-allowed transition-all">
                                        −
                                    </button>
                                    <span className="w-10 text-center font-bold text-brand-charcoal">
                                        {quantity}
                                    </span>
                                    <button onClick={increaseQty} disabled={quantity >= product.stock}
                                        className="w-9 h-9 rounded-lg border border-gray-300 flex items-center
                               justify-center text-lg font-bold text-brand-charcoal
                               hover:bg-gray-50 disabled:opacity-40
                               disabled:cursor-not-allowed transition-all">
                                        +
                                    </button>
                                </div>

                                {quantity > 1 && (
                                    <div className="mt-3 border bg-primary-light rounded-lg px-4 py-3
                                  flex items-center justify-between">
                                        <span className="text-sm text-primary-dark font-medium">
                                            {quantity} × ₦{Number(product.price).toLocaleString()}
                                        </span>
                                        <span className="text-base font-bold text-primary">
                                            = ₦{(quantity * Number(product.price)).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Reviews Summary - always show if not loading */}
                        {!reviewsLoading && (
                            <div className="mb-6 flex items-center gap-3">
                                {reviews.length > 0 ? (
                                    <>
                                        <StarDisplay rating={Math.round(avgRating)} size="md" />
                                        <span className="font-bold text-brand-charcoal">
                                            {avgRating}
                                        </span>
                                        <span className="text-neutral-slate text-sm">
                                            ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-neutral-slate text-xs italic">
                                        No reviews yet. Be the first to review!
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={handleAddToCart}
                                disabled={isOutOfStock || addingToCart || !product.is_active}
                                className="w-full bg-primary hover:bg-primary-dark text-white
                           py-4 rounded-xl font-bold text-base transition-all
                           hover:scale-[1.01] disabled:opacity-50 disabled:bg-gray-300
                           disabled:cursor-not-allowed disabled:scale-100"
                            >
                                {!product.is_active
                                    ? 'Currently Unavailable'
                                    : isOutOfStock
                                        ? 'Out of Stock'
                                        : addingToCart
                                            ? 'Adding...'
                                            : addedToCart
                                                ? '✅ Added to Cart!'
                                                : '🛒 Add to Cart'
                                }
                            </button>

                            <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer"
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3.5
                           rounded-xl font-bold text-base text-center transition-all
                           hover:scale-[1.01] flex items-center justify-center gap-2">
                                💬 Need Info? Chat on WhatsApp
                            </a>
                        </div>

                        {addedToCart && (
                            <div className="mt-3 text-center">
                                <Link to="/cart"
                                    className="text-primary text-sm font-semibold hover:underline">
                                    View Cart →
                                </Link>
                            </div>
                        )}

                    </div>
                </div>

                {/* Actual Reviews List Section */}
                <div className="border-t border-gray-100 pt-10">
                    <h2 className="text-xl font-bold text-brand-charcoal mb-8">
                        Customer Reviews
                    </h2>

                    {reviewsLoading ? (
                        <div className="space-y-6">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="flex gap-4 animate-pulse">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-100 rounded w-1/4" />
                                        <div className="h-3 bg-gray-100 rounded w-1/6" />
                                        <div className="h-10 bg-gray-100 rounded w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : reviews.length > 0 ? (
                        <div className="space-y-8">
                            {reviews.map((review) => (
                                <div key={review.id} className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold shrink-0">
                                        {review.profiles?.full_name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="font-bold text-brand-charcoal text-sm">
                                                {review.profiles?.full_name || 'Anonymous'}
                                            </p>
                                            <span className="text-[10px] text-neutral-slate">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <StarDisplay rating={review.rating} />
                                        {review.comment && (
                                            <div className="mt-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3">
                                                <p
                                                    className="text-neutral-slate text-sm leading-relaxed break-all whitespace-pre-wrap"
                                                >
                                                    "{review.comment}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-neutral-light rounded-2xl p-8 text-center border border-dashed border-neutral-border">
                            <p className="text-neutral-slate text-sm">
                                There are no approved reviews for this product yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProductDetailPage