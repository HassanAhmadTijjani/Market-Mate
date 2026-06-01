
/* eslint-disable react-hooks/exhaustive-deps */
// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, SlidersHorizontal, ChevronDown, PackageSearch, Zap, TrendingUp, Eye } from 'lucide-react';
import usePublicProducts from '../../hooks/usePublicProducts';
import ProductCard from '../../components/customer/ProductCard';
import FlashSaleBanner from '../../components/shop/FlashSaleBanner'
import ScrollOffer from '../../components/shop/ScrollOffer'
import SocialProof from '../../components/shop/SocialProof'
import { useFlashSales } from '../../hooks/useFlashSales'
import useSettings from '../../hooks/useSettings'

const Shop = () => {
    const { products, loading, categories, fetchProducts } = usePublicProducts();
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [priceRange, setPriceRange] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false); // For mobile filter toggle
    // Flash Sales
    const { flashSales, fetchActiveSales } = useFlashSales()
    const { settings } = useSettings()

    // --- ADDICTIVE FEATURE: Live Activity State ---
    // const [liveActivity, setLiveActivity] = useState(null);
    // const activities = [
    //     "Someone in Lagos just viewed an iPhone 13 Pro",
    //     "Someone in Kano just viewed an macbook 13 Pro",
    //     "Someone in Abuja just grabbed a cheep product",
    //     "New Vendor 'GadgetHub' just joined the platform!",
    //     "Flash Sale: 5 people are looking at the latest Samsung S24",
    //     "Flash Sale: 8 people just get their discount offer",
    //     "Fastest Finger: 2 just got an offer",
    //     "A user just used promo code 'WELCOME10'",
    //     "Verified Seller 'MarketMate' just updated their stock"
    // ];

    // useEffect(() => {
    //     // Cycle through live activities every 7 seconds
    //     const interval = setInterval(() => {
    //         const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    //         setLiveActivity(randomActivity);
    //         setTimeout(() => setLiveActivity(null), 4000); // Hide after 4 seconds
    //     }, 8000);
    //     return () => clearInterval(interval);
    // }, []);

    const priceOptions = [
        { label: 'All price', min: '', max: '' },
        { label: 'Under ₦50,000', min: '', max: '50000' },
        { label: '₦50,000 - ₦100,000', min: '50000', max: '100000' },
        { label: '₦100,000 - ₦300,000', min: '100000', max: '300000' },
        { label: 'Above ₦300,000', min: '300000', max: '' },
    ];

    useEffect(() => {
        window.scrollTo(0, 0);
        const selected = priceOptions.find((_, i) => String(i) === priceRange);
        fetchProducts({
            search: search,
            category_id: categoryId,
            min_price: selected?.min || '',
            max_price: selected?.max || '',
        });
    }, [search, categoryId, priceRange]);

    const handleClearFilters = () => {
        setSearch('');
        setCategoryId('');
        setPriceRange('');
    };

    const hasFilters = search || categoryId || priceRange;

    return (
        <div className="min-h-screen bg-slate-50/50 relative">
            {/* Flash Sale Banner — above everything */}
            {settings?.flash_sales_enabled !== false && flashSales.length > 0 && (
                <FlashSaleBanner
                    flashSales={flashSales}
                    onSaleExpire={fetchActiveSales}
                />
            )}

            {/* --- ADDICTIVE FEATURE: Live Pulse Toast --- */}
            {/* <AnimatePresence>
                {liveActivity && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="fixed bottom-10 left-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10"
                    >
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-xs font-medium">{liveActivity}</p>
                    </motion.div>
                )}
            </AnimatePresence> */}

            {/* HEADER AREA */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-30 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-xl">
                                <Zap className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">MarketMate Shop</h1>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time Device Feed</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Modern Search Bar */}
                            <div className="relative group flex-1 md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Find your next device..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                />
                            </div>

                            {/* Mobile Filter Toggle */}
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="md:hidden p-2.5 bg-slate-100 rounded-2xl text-slate-600"
                            >
                                <SlidersHorizontal className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* MOBILE OVERLAY BACKDROP */}
                    <AnimatePresence>
                        {isFilterOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsFilterOpen(false)}
                                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
                            />
                        )}
                    </AnimatePresence>

                    {/* SIDEBAR FILTERS - Mobile Drawer & Desktop Sticky */}
                    <aside className={`
                        ${isFilterOpen
                            ? 'fixed inset-y-0 left-0 z-50 w-[280px] bg-white p-6 shadow-2xl overflow-y-auto block'
                            : 'hidden lg:block'} 
                        lg:relative lg:inset-auto lg:z-auto lg:w-64 lg:sticky lg:top-28 lg:h-fit lg:bg-transparent lg:p-0 lg:shadow-none space-y-8
                    `}>
                        {/* Mobile Drawer Header */}
                        <div className="flex items-center justify-between lg:hidden mb-6">
                            <h2 className="text-lg font-black text-slate-900">Filters</h2>
                            <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-slate-100 rounded-xl text-slate-500 hover:text-primary transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Category Group */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Categories</h3>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => setCategoryId('')}
                                    className={`text-left px-4 py-2 rounded-xl text-sm font-medium transition-all ${!categoryId ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-600 hover:bg-slate-100'}`}
                                >
                                    All Products
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setCategoryId(cat.id)}
                                        className={`text-left px-4 py-2 rounded-xl text-sm font-medium transition-all ${categoryId === cat.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-600 hover:bg-slate-100'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range Group */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Price Bracket</h3>
                            <select
                                value={priceRange}
                                onChange={(e) => setPriceRange(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                            >
                                {priceOptions.map((opt, i) => (
                                    <option key={i} value={i === 0 ? '' : String(i)}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {hasFilters && (
                            <button
                                onClick={handleClearFilters}
                                className="w-full flex items-center justify-center gap-2 py-3 border border-red-100 text-red-500 rounded-2xl text-xs font-bold hover:bg-red-50 transition-colors"
                            >
                                <X className="w-4 h-4" /> Reset Filters
                            </button>
                        )}
                    </aside>

                    {/* PRODUCT LISTING AREA */}
                    <main className="flex-1">
                        {/* Active Filter Chips */}
                        <AnimatePresence>
                            {hasFilters && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-wrap gap-2 mb-6"
                                >
                                    {search && (
                                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-[11px] font-bold text-slate-700 shadow-sm">
                                            Search: {search} <X className="w-3 h-3 cursor-pointer text-slate-400" onClick={() => setSearch('')} />
                                        </div>
                                    )}
                                    {categoryId && (
                                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-[11px] font-bold text-slate-700 shadow-sm">
                                            Category: {categories.find(c => c.id === categoryId)?.name} <X className="w-3 h-3 cursor-pointer text-slate-400" onClick={() => setCategoryId('')} />
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {loading ? (
                            /* SKELETON GRID - Modernized */
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-3xl p-3 border border-slate-100 shadow-sm">
                                        <div className="h-44 bg-slate-100 animate-pulse rounded-2xl" />
                                        <div className="p-3 space-y-3">
                                            <div className="h-3 bg-slate-100 rounded-full w-1/2" />
                                            <div className="h-4 bg-slate-100 rounded-full w-3/4" />
                                            <div className="h-10 bg-slate-100 rounded-xl w-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            /* EMPTY STATE - Modernized */
                            <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                    <PackageSearch className="w-10 h-10 text-slate-300" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">Zero Results Found</h2>
                                <p className="text-slate-400 text-sm mt-2 max-w-xs">
                                    Our inventory couldn't match those parameters. Try adjusting your scope.
                                </p>
                                <button onClick={handleClearFilters} className="mt-8 text-primary font-bold text-sm underline underline-offset-4">
                                    Back to all products
                                </button>
                            </div>
                        ) : (
                            /* PRODUCT GRID - Staggered Motion */
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    visible: { transition: { staggerChildren: 0.05 } }
                                }}
                                className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
                            >
                                {products.map((product) => (
                                    <motion.div
                                        key={product.id}
                                        variants={{
                                            hidden: { opacity: 0, scale: 0.95 },
                                            visible: { opacity: 1, scale: 1 }
                                        }}
                                        className="bg-white p-2 rounded-[32px] border border-transparent hover:border-primary/20 hover:shadow-xl transition-all duration-300"
                                    >
                                        <ProductCard product={product} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </main>
                </div>
            </div>
            <ScrollOffer
                enabled={settings?.scroll_offer_enabled !== false}
                threshold={settings?.scroll_offer_threshold || 8}
            />

            {/* Social Proof — bottom left notifications */}
            <SocialProof
                enabled={settings?.social_proof_enabled !== false}
            />
        </div>
    );
};

export default Shop;