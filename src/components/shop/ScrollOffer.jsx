// @ts-nocheck
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const SESSION_KEY = 'scroll_offer_shown'

function useOfferCountdown(minutes = 15) {
    const [seconds, setSeconds] = useState(minutes * 60)

    useEffect(() => {
        if (seconds <= 0) return
        const t = setInterval(() => setSeconds(s => s - 1), 1000)
        return () => clearInterval(t)
    }, [seconds])

    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return {
        display: `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
        expired: seconds <= 0,
    }
}

export default function ScrollOffer({ threshold = 8, enabled = true }) {
    const [show, setShow] = useState(false)
    const [promo, setPromo] = useState(null)
    const [copied, setCopied] = useState(false)
    const { display, expired } = useOfferCountdown(15)

    // fetch a random active promo code
    async function fetchPromo() {
        const { data } = await supabase
            .from('promo_codes')
            .select('code, discount_type, discount_value')
            .eq('is_active', true)
            .eq('is_system_generated', false)
            .gt('expires_at', new Date().toISOString())
            .or('expires_at.is.null')
            .limit(10)

        if (data && data.length > 0) {
            // pick a random one
            const random = data[Math.floor(Math.random() * data.length)]
            setPromo(random)
        } else {
            // fallback generic offer
            setPromo({
                code: 'WELCOME10',
                discount_type: 'percentage',
                discount_value: 10,
            })
        }
    }

    const handleScroll = useCallback(() => {
        if (!enabled) return
        if (sessionStorage.getItem(SESSION_KEY)) return

        const scrolled = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const pct = scrolled / docHeight

        // show after scrolling 35% of the page
        if (pct > 0.35) {
            sessionStorage.setItem(SESSION_KEY, '1')
            fetchPromo().then(() => setShow(true))
        }
    }, [enabled])

    useEffect(() => {
        if (sessionStorage.getItem(SESSION_KEY)) return
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [handleScroll])

    // auto-close when timer expires
    useEffect(() => {
        if (expired && show) setShow(false)
    }, [expired, show])

    function handleCopy() {
        if (!promo) return
        navigator.clipboard.writeText(promo.code)
        setCopied(true)
        toast.success('Promo code copied! Use it at checkout.')
        setTimeout(() => setCopied(false), 3000)
    }

    if (!show || !promo) return null

    const discountText = promo.discount_type === 'percentage'
        ? `${promo.discount_value}% OFF`
        : promo.discount_type === 'free_delivery'
            ? 'FREE DELIVERY'
            : `₦${Number(promo.discount_value).toLocaleString()} OFF`

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                    w-full max-w-sm px-4
                    animate-[slideUp_0.4s_ease-out]">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100
                      overflow-hidden">

                {/* Top strip */}
                <div className="bg-gradient-to-r from-primary to-green-400
                        px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">🎁</span>
                        <span className="text-white font-bold text-sm">
                            Special Offer Just For You!
                        </span>
                    </div>
                    <button
                        onClick={() => setShow(false)}
                        className="text-white/70 hover:text-white text-lg leading-none
                       transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-5">
                    {/* Discount highlight */}
                    <div className="text-center mb-4">
                        <p className="text-4xl font-extrabold text-primary mb-1">
                            {discountText}
                        </p>
                        <p className="text-neutral-slate text-sm">
                            on your next order
                        </p>
                    </div>

                    {/* Promo code */}
                    <div className="bg-neutral-light rounded-xl p-3 flex items-center
                          justify-between mb-4 border-2 border-dashed
                          border-primary/30">
                        <span className="font-mono font-bold text-brand-charcoal
                             tracking-widest text-lg">
                            {promo.code}
                        </span>
                        <button
                            onClick={handleCopy}
                            className={`text-sm font-bold px-3 py-1.5 rounded-lg
                          transition-all
                ${copied
                                    ? 'bg-primary text-white'
                                    : 'bg-primary-light text-primary hover:bg-primary hover:text-white'
                                }`}
                        >
                            {copied ? '✅ Copied!' : 'Copy'}
                        </button>
                    </div>

                    {/* Countdown */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-neutral-slate text-xs">
                            Offer expires in
                        </span>
                        <span className="font-mono font-bold text-red-500 text-sm
                             bg-red-50 px-2 py-0.5 rounded-lg">
                            ⏱️ {display}
                        </span>
                    </div>

                    <p className="text-center text-xs text-neutral-slate">
                        Apply at checkout. Limited time only.
                    </p>
                </div>
            </div>
        </div>
    )
}