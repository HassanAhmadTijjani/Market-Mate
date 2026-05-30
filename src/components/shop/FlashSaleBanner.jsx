// @ts-nocheck
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function useCountdown(endTime) {
    const [timeLeft, setTimeLeft] = useState('')
    const [expired, setExpired] = useState(false)

    useEffect(() => {
        function calculate() {
            const diff = new Date(endTime) - new Date()
            if (diff <= 0) {
                setExpired(true)
                setTimeLeft('00:00:00')
                return
            }
            const h = Math.floor(diff / 3600000)
            const m = Math.floor((diff % 3600000) / 60000)
            const s = Math.floor((diff % 60000) / 1000)
            setTimeLeft(
                `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
            )
        }
        calculate()
        const interval = setInterval(calculate, 1000)
        return () => clearInterval(interval)
    }, [endTime])

    return { timeLeft, expired }
}

function SaleBannerItem({ sale, onExpire }) {
    const navigate = useNavigate()
    const { timeLeft, expired } = useCountdown(sale.ends_at)

    useEffect(() => {
        if (expired) onExpire?.()
    }, [expired])

    if (expired) return null

    const original = Number(sale.products?.price)
    const salePrice = Number(sale.sale_price)
    const discountPct = Math.round(((original - salePrice) / original) * 100)

    return (
        <div
            onClick={() => navigate(`/shop/${sale.products?.slug}`)}
            className="flex items-center gap-3 cursor-pointer group shrink-0
                 px-4 sm:px-6"
        >
            {/* Product image */}
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                {sale.products?.cover_image ? (
                    <img src={sale.products.cover_image}
                        alt={sale.products.name}
                        className="w-full h-full object-cover" />
                ) : (
                    <span className="text-lg">📦</span>
                )}
            </div>

            {/* Info */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-white/20 text-white text-xs font-bold px-2
                         py-0.5 rounded-full">
                    {sale.label}
                </span>
                <span className="text-white font-semibold text-sm
                         group-hover:underline">
                    {sale.products?.name}
                </span>
                <span className="text-white/60 line-through text-xs">
                    ₦{original.toLocaleString()}
                </span>
                <span className="text-yellow-300 font-bold text-sm">
                    ₦{salePrice.toLocaleString()}
                </span>
                <span className="bg-yellow-400 text-black text-xs font-bold
                         px-1.5 py-0.5 rounded">
                    -{discountPct}%
                </span>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <span className="text-white/70 text-xs">Ends in</span>
                <span className="font-mono font-bold text-yellow-300 text-sm
                         bg-black/30 px-2 py-0.5 rounded">
                    {timeLeft}
                </span>
            </div>
        </div>
    )
}

export default function FlashSaleBanner({ flashSales, onSaleExpire }) {
    const [currentIndex, setCurrentIndex] = useState(0)

    // auto-rotate if multiple sales
    useEffect(() => {
        if (flashSales.length <= 1) return
        const interval = setInterval(() => {
            setCurrentIndex(i => (i + 1) % flashSales.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [flashSales.length])

    if (!flashSales?.length) return null

    const sale = flashSales[currentIndex]
    if (!sale) return null

    return (
        <div className="bg-linear-to-r from-blue-600 via-blue-500 to-green-500
                    relative overflow-hidden">
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent
                      via-red-500/50 to-transparent -skew-x-12
                      animate-[shimmer_3s_infinite]" />

            <div className="relative flex items-center justify-between
                      max-w-6xl mx-auto py-2.5">

                {/* Lightning icon */}
                <div className="flex items-center gap-2 px-4 shrink-0">
                    <span className="text-xl animate-bounce">⚡</span>
                </div>

                <SaleBannerItem
                    key={sale.id}
                    sale={sale}
                    onExpire={onSaleExpire}
                />

                {/* Multiple sales indicator */}
                {flashSales.length > 1 && (
                    <div className="flex gap-1 px-4 shrink-0">
                        {flashSales.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                className={`w-1.5 h-1.5 rounded-full transition-all
                  ${i === currentIndex ? 'bg-white' : 'bg-white/40'}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}