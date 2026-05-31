// @ts-nocheck
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

// Nigerian first names pool
const NAMES = [
    'Chidi', 'Amaka', 'Emeka', 'Ngozi', 'Tunde', 'Kemi', 'Seun',
    'Funmi', 'Bola', 'Yemi', 'Uche', 'Ifeoma', 'Ade', 'Sola',
    'Dami', 'Tobi', 'Ladi', 'Zara', 'Femi', 'Chisom', 'Nkechi',
    'Obinna', 'Adaeze', 'Kayode', 'Halima', 'Ibrahim', 'Fatima',
    'Musa', 'Aisha', 'Yusuf', 'Blessing', 'Victor', 'Grace',
    'Emmanuel', 'Patience', 'Daniel', 'Ruth', 'Samuel', 'Esther',
]

// Nigerian cities pool
const CITIES = [
    'Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan',
    'Benin City', 'Kaduna', 'Enugu', 'Jos', 'Warri',
    'Owerri', 'Uyo', 'Calabar', 'Zaria', 'Ilorin',
    'Abeokuta', 'Onitsha', 'Asaba', 'Aba', 'Maiduguri',
]

const ACTIONS = [
    { text: 'just ordered', icon: '🛒', color: 'text-primary' },
    { text: 'just bought', icon: '✅', color: 'text-green-600' },
    { text: 'added to cart', icon: '🛍️', color: 'text-blue-600' },
    { text: 'is viewing', icon: '👀', color: 'text-purple-600' },
]

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

function timeAgo() {
    const mins = Math.floor(Math.random() * 12) + 1
    if (mins === 1) return 'just now'
    if (mins < 5) return `${mins} mins ago`
    return `${mins} mins ago`
}

export default function SocialProof({ enabled = true }) {
    const [notification, setNotification] = useState(null)
    const [visible, setVisible] = useState(false)
    const [products, setProducts] = useState([])
    const timerRef = useRef(null)

    // fetch real product names to use in notifications
    useEffect(() => {
        if (!enabled) return
        supabase
            .from('products')
            .select('name, cover_image')
            .eq('is_active', true)
            .limit(20)
            .then(({ data }) => {
                if (data && data.length > 0) setProducts(data)
            })
    }, [enabled])

    function generateNotification() {
        if (!products.length) return null

        const product = getRandom(products)
        const name = getRandom(NAMES)
        const city = getRandom(CITIES)
        const action = getRandom(ACTIONS)

        return { product, name, city, action, time: timeAgo() }
    }

    function showNext() {
        const notif = generateNotification()
        if (!notif) return

        setNotification(notif)
        setVisible(true)

        // hide after 4 seconds
        setTimeout(() => {
            setVisible(false)
        }, 4000)
    }

    useEffect(() => {
        if (!enabled || !products.length) return

        let timeoutId;

        function scheduleNext() {
            const delay = Math.random() * 6000 + 8000;
            timeoutId = setTimeout(() => {
                showNext();
                scheduleNext();
            }, delay);
        }

        // first notification after 6 seconds
        const firstTimer = setTimeout(() => {
            showNext();
            scheduleNext();
        }, 6000);

        return () => {
            clearTimeout(firstTimer);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [products, enabled])

    if (!enabled || !notification || !visible) return null

    return (
        <div className={`fixed bottom-6 left-4 z-40 transition-all duration-500
                     max-w-70
      ${visible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4 pointer-events-none'
            }`}>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100
                      p-3 flex items-center gap-3">

                {/* Product image or icon */}
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0
                        bg-neutral-light">
                    {notification.product.cover_image ? (
                        <img
                            src={notification.product.cover_image}
                            alt={notification.product.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center
                            text-xl">
                            📦
                        </div>
                    )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-brand-charcoal leading-snug">
                        <span className="font-bold">{notification.name}</span>
                        {' '}
                        <span className={`font-medium ${notification.action.color}`}>
                            {notification.action.icon} {notification.action.text}
                        </span>
                    </p>
                    <p className="text-xs text-neutral-slate mt-0.5 truncate">
                        {notification.product.name}
                    </p>
                    <p className="text-xs text-neutral-slate mt-0.5">
                        📍 {notification.city} · {notification.time}
                    </p>
                </div>

                {/* Close */}
                <button
                    onClick={() => setVisible(false)}
                    className="text-gray-300 hover:text-gray-500 text-xs
                     transition-colors shrink-0 self-start"
                >
                    ✕
                </button>
            </div>
        </div>
    )
}