// @ts-nocheck
import React from 'react'
import { useNavigate } from 'react-router-dom'

const ProductCard = ({ product }) => {
    const navigate = useNavigate()
    const isOutOfStock = product.stock === 0
    const isLowStock = product.stock > 0 && product.stock <= product.low_stock_threshold

    // Slug generator when clicked
    const handleClick = () => {
        navigate(`/shop/${product.slug}`)
    }
    return (
        <div
            onClick={handleClick}
            className="bg-white rounded-xl shadow-sm border border-gray-100
hover:shadow-lg hover:-translate-y-1 transition-all
duration-300 cursor-pointer overflow-hidden group"
        >
            {/* Image */}
            <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                {product.cover_image ? (
                    <img
                        loading='lazy'
                        src={product.cover_image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                        📦
                    </div>
                )}

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all"></div>
                {/* Stock Badge */}
                {isOutOfStock && (
                    <div className="absolute top-2 right-2 bg-red-500/90 backdrop-blur text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow">
                        Out of Stock
                    </div>
                )}

                {isLowStock && (
                    <div className="absolute top-2 right-2 bg-amber-500/90 backdrop-blur text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow">
                        Low Stock
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-4">
                <p className="text-xs text-neutral-slate mb-1 line-clamp-2">
                    {product.description}
                </p>
                <h3 className="font-semibold text-brand-charcoal text-sm leading-snug
                     line-clamp-2 mb-2">
                    {product.name}
                </h3>

                {/* Star Rating */}
                {/* {product.avg_rating && (
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(s => (
                            <span key={s}
                                className={`text-xs
              ${s <= Math.round(product.avg_rating)
                                        ? 'text-amber-400'
                                        : 'text-gray-200'
                                    }`}>
                                ★
                            </span>
                        ))}
                        <span className="text-xs text-neutral-slate ml-1">
                            ({product.review_count || 0})
                        </span>
                    </div>
                )} */}

                {/* Price & Button */}
                <div className="flex justify-between">
                    <p className="text-sm font-bold text-primary">
                        ₦{Number(product.price).toLocaleString()}
                    </p>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            handleClick()
                        }}
                        disabled={isOutOfStock}
                        className="bg-primary hover:bg-primary-dark text-white text-xs
                     font-semibold px-2 py-2 rounded-sm transition-all
                     disabled:bg-gray-300 disabled:cursor-not-allowed "
                    >
                        {isOutOfStock ? 'Sold Out' : 'Buy'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProductCard