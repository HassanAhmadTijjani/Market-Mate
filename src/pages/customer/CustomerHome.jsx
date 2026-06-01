

// @ts-nocheck
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Truck, Headset, ArrowRight, Star, Flame } from 'lucide-react';
import useHomeProducts from '../../hooks/useHomeProducts';
import useSettings from '../../hooks/useSettings';
import ProductCard from '../../components/customer/ProductCard';


// Optimized Skeleton Loader
const ProductSkeleton = () => (
    <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100 animate-pulse">
        <div className="h-48 bg-slate-100" />
        <div className="p-5 space-y-3">
            <div className="h-3 bg-slate-100 rounded w-1/3" />
            <div className="h-4 bg-slate-100 rounded w-3/4" />
            <div className="flex justify-between items-center pt-2">
                <div className="h-6 bg-slate-100 rounded w-1/4" />
                <div className="h-9 bg-slate-100 rounded w-1/3" />
            </div>
        </div>
    </div>
);

// Reusable Section Header with improved spacing
const SectionHeader = ({ title, subtitle, icon: Icon, actionLabel, onAction }) => (
    <div className="flex items-end justify-between mb-8">
        <div>
            <div className="flex items-center gap-2 mb-1">
                {Icon && <Icon className="w-5 h-5 text-primary" />}
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                    {title}
                </h2>
            </div>
            {subtitle && <p className="text-slate-500 text-sm font-medium">{subtitle}</p>}
        </div>
        {actionLabel && (
            <button
                onClick={onAction}
                className="group flex items-center gap-2 text-primary text-sm font-bold hover:gap-3 transition-all"
            >
                {actionLabel} <ArrowRight className="w-4 h-4" />
            </button>
        )}
    </div>
);

export default function CustomerHome() {
    const navigate = useNavigate();
    const { settings } = useSettings();
    const { featuredProducts, topSellers, loading } = useHomeProducts();

    // Memoize settings for stability
    const config = useMemo(() => ({
        name: settings?.store_name || "MarketMate",
        desc: settings?.store_description || "Securely buy, sell, and swap devices.",
        badge: settings?.hero_badge_text || "The Future of Device Commerce",
    }), [settings]);

    return (
        <div className="min-h-screen bg-slate-50/50">

            {/* ── HERO SECTION ─────────────────────────── */}
            <section className="relative bg-slate-900 py-20 lg:py-32 overflow-hidden">
                {/* Visual Blobs */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
                    <div className="absolute top-1/2 -right-24 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" />
                </div>

                <div className="relative max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl"
                    >
                        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md rounded-full px-4 py-1.5 mb-8">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            <span className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em]">
                                {config.badge}
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tighter">
                            Upgrade Smarter at <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                                {config.name}
                            </span>
                        </h1>

                        <p className="text-slate-400 text-lg md:text-xl mb-10 leading-relaxed max-w-xl font-medium">
                            {config.desc}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => navigate('/shop')}
                                className="bg-primary hover:bg-primary-dark text-white px-10 py-4 rounded-2xl font-bold transition-all hover:scale-105 shadow-xl shadow-primary/25 flex items-center justify-center gap-2"
                            >
                                Start Shopping <ArrowRight className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => navigate('/about')}
                                className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-10 py-4 rounded-2xl font-bold transition-all"
                            >
                                How it works
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── STATS / TRUST BAR ────────────────────── */}
            <div className="relative z-10 -mt-10 max-w-5xl mx-auto px-6">
                <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8 grid grid-cols-3 gap-4">
                    {[
                        { label: 'Verified Devices', value: settings?.stat_products || '2.4k+', color: 'text-blue-600' },
                        { label: 'Active Swappers', value: settings?.stat_customers || '850+', color: 'text-emerald-600' },
                        { label: 'Safe Deliveries', value: settings?.stat_deliveries || '1.2k+', color: 'text-primary' },
                    ].map((stat, i) => (
                        <div key={i} className="text-center border-r last:border-0 border-slate-100">
                            <p className={`text-xl md:text-3xl font-black ${stat.color} tracking-tight`}>{stat.value}</p>
                            <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-20 space-y-24">

                {/* ── CATEGORIES ───────────────────────────── */}
                <section>
                    <SectionHeader title="Explore Categories" subtitle="What are you looking for today?" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(settings?.store_categories || [
                            { name: 'Phones', icon: '📱', desc: 'Flagships & Budget' },
                            { name: 'Laptops', icon: '💻', desc: 'Work & Gaming' },
                            { name: 'Accessories', icon: '🎧', desc: 'Premium Audio' },
                            { name: 'Tablets', icon: '📱', desc: 'IPads & More' }
                        ]).map((cat) => (
                            <button
                                key={cat.name}
                                onClick={() => navigate('/shop')}
                                className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all text-center"
                            >
                                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-500">{cat.icon}</div>
                                <h3 className="font-bold text-slate-900 text-lg">{cat.name}</h3>
                                <p className="text-slate-400 text-xs mt-1">{cat.desc}</p>
                            </button>
                        ))}
                    </div>
                </section>

                {/* ── FEATURED ─────────────────────────────── */}
                <section>
                    <SectionHeader
                        title="Featured Deals"
                        icon={Star}
                        subtitle="Top quality devices at unbeatable prices"
                        actionLabel="View all deals"
                        onAction={() => navigate('/shop')}
                    />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {loading ? [...Array(4)].map((_, i) => <ProductSkeleton key={i} />)
                            : featuredProducts.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                </section>

                {/* ── TOP SELLERS ──────────────────────────── */}
                <section>
                    <SectionHeader
                        title="Top Sellers"
                        icon={Flame}
                        subtitle="The most sought-after tech this week"
                        actionLabel="Check availability"
                        onAction={() => navigate('/shop')}
                    />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {loading ? [...Array(4)].map((_, i) => <ProductSkeleton key={i} />)
                            : topSellers.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                </section>

                {/* ── WHY MARKETMATE ───────────────────────── */}
                <section className="bg-slate-900 rounded-[48px] p-10 md:p-20 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px]" />
                    <div className="relative z-10 text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Why MarketMate?</h2>
                        <p className="text-slate-400 font-medium">We're changing the way Africa trades technology.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                        {[
                            { icon: ShieldCheck, title: 'Verified Only', desc: 'Every device undergoes a 20-point quality check.' },
                            { icon: Truck, title: 'Priority Shipping', desc: 'Same-day delivery within Lagos & Abuja.' },
                            { icon: Zap, title: 'Instant Swap', desc: 'Exchange your old device for a new one in minutes.' },
                            { icon: Headset, title: 'Expert Support', desc: 'Real humans ready to help you on WhatsApp 24/7.' },
                        ].map((item, i) => (
                            <div key={i} className="text-center group">
                                <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary transition-colors">
                                    <item.icon className="w-8 h-8 text-primary group-hover:text-white" />
                                </div>
                                <h4 className="text-white font-bold mb-2">{item.title}</h4>
                                <p className="text-slate-400 text-xs leading-relaxed px-4">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
}