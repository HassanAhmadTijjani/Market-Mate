/* eslint-disable no-unused-vars */
// @ts-nocheck
'use client';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, DollarSign, RefreshCw, Gift, ArrowRight, Check, Star, Shield, Zap, ChevronRight, Menu, X, Smartphone, } from 'lucide-react';
import usePublicProducts from '../../hooks/usePublicProducts';
import ProductCard from '../../components/customer/ProductCard';
import useSettings from '../../hooks/useSettings';

const navLinks = [
  { label: 'Buy', href: '/shop' },
  { label: 'Sell', href: '#sell' },
  { label: 'Swap', href: '#swap' },
  { label: 'Referral', href: '/login' },
];

const coreActions = [
  {
    icon: ShoppingCart,
    title: 'Buy Products',
    description: 'Browse verified products at fair market prices. Every listing is inspected and quality-checked.',

    href: '#',
    primary: true,
  },
  {
    icon: DollarSign,
    title: 'Sell Products',
    description: 'List your products in minutes. Get paid fast with our secure escrow payment system.',
    href: '#',
    primary: false,
  },
  {
    icon: RefreshCw,
    title: 'Swap Products',
    description: 'Trade your products directly with other users. Upgrade without spending extra cash.',
    href: '#',
    primary: false,
  },
  {
    icon: Gift,
    title: 'Refer & Earn',
    description: 'Invite friends and earn cash rewards for every successful transaction they complete.',
    href: '#',
    primary: false,
  },
];

const steps = [
  {
    number: '01',
    title: 'Create Account',
    description: 'Sign up in under 60 seconds. Verify your identity to unlock buying and selling.',
  },
  {
    number: '02',
    title: 'Choose Action',
    description: 'Browse listings to buy, post your device to sell, or find a swap match.',
  },
  {
    number: '03',
    title: 'Complete Transaction',
    description: 'Pay or get paid securely. Shipping includes tracking and buyer protection.',
  },
];

export default function LandingPage() {
  const { products, loading } = usePublicProducts();
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* HERO SECTION */}
      <section className="relative bg-brand-black text-white overflow-hidden">
        {/* Dynamic Abstract Background Spheres */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-3xl rounded-full translate-x-10 -translate-y-10" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 blur-3xl rounded-full -translate-x-10 translate-y-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">

            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-slate-300 text-xs font-medium px-4 py-2 rounded-full backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Trusted by 50,000+ buyers and sellers globally
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
                Start selling Products <br />
                <span className="bg-linear-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                  Smarter &amp; Faster
                </span>
              </h1>

              <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
                {settings?.store_description || "Experience the ultimate marketplace framework tailored perfectly to securely handle product exchanges, escrow transactions, and certified trade-ins."}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 text-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Explore Marketplace
                </Link>
                <a
                  href="#"
                  className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-xl transition-all backdrop-blur-sm text-sm"
                >
                  <DollarSign className="w-4 h-4" />
                  Instant Sell
                </a>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-3 pt-6 text-sm text-slate-400 border-t border-white/10">
                {['Verified Sellers', '30-Day Warranty', 'Secure Payments'].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero Right Visual: Asymmetric/Floating Composition */}
            <div className="lg:col-span-5 relative flex justify-center items-center lg:justify-end">
              <div className="relative w-full max-w-sm">

                {/* Main Card */}
                <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-brand-charcoal shadow-2xl">
                  <img
                    src="https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=700" // Keep specific image for visual example
                    alt="Product marketplace"
                    className="w-full h-100 object-cover filter brightness-90 grayscale-[10%]"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Bottom Text Widget */}
                  <div className="absolute bottom-6 left-6 right-6 bg-brand-black/90 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] bg-primary/20 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Hot Pick</span>
                        <p className="text-sm font-bold text-white mt-1">iPhone 14 Pro Max &mdash; 256GB</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-white">₦649</p> {/* Keep specific price for visual example */}
                        <p className="text-xs text-emerald-400 font-medium">Like New</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Micro Widget 1 */}
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 -left-10 bg-white border border-gray-100 p-3 rounded-2xl shadow-xl flex items-center gap-3 text-brand-charcoal sm:flex"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium leading-none">Protection</p>
                    <p className="text-xs font-bold mt-0.5">Payment Guaranteed</p>
                  </div>
                </motion.div>

                {/* Floating Micro Widget 2 */}
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute -bottom-4 -right-6 bg-brand-black border border-white/10 p-3 rounded-2xl shadow-xl flex items-center gap-3 text-white hidden sm:flex"
                >
                  <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white">
                    <Star className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium leading-none">Rating</p>
                    <p className="text-xs font-bold mt-0.5">4.9 / 5.0 Services</p>
                  </div>
                </motion.div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CORE ACTIONS: Modern Bento Box Grid Structural Swap */}
      <section className="py-24 bg-white" id="actions">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">
              One Architecture. Endless Ecosystems.
            </h2>
            <p className="text-slate-500 text-base">
              Explore dynamic transactional lanes built for speed, transparency, and top-tier client customization.
            </p>
          </div>

          {/* Bento Grid Styling */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary Action Card - Spans large section */}
            <motion.a
              whileHover={{ y: -6 }}
              href={coreActions[0].href}
              className="md:col-span-2 bg-linear-to-br from-primary to-indigo-700 p-8 rounded-3xl text-white shadow-xl shadow-primary/10 flex flex-col justify-between group relative overflow-hidden h-72 md:h-auto min-h-[280px]"
            >
              <div className="relative z-10 max-w-md">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md"> {/* Changed from bg-white/10 to bg-primary/20 for consistency */}
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Buy Products</h3>
                <p className="text-white/80 text-sm leading-relaxed">Browse verified products at fair market prices. Every listing is inspected and quality-checked.</p>
              </div>

              <div className="relative z-10 flex items-center gap-2 text-sm font-bold bg-white/10 hover:bg-white/20 w-max px-4 py-2 rounded-xl backdrop-blur-sm mt-6 transition-colors">
                Launch Market Center <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-white/5 rounded-full blur-2xl" /> {/* Changed from bg-white/5 to bg-primary/10 for consistency */}
            </motion.a>

            {/* Sell Device Box */}
            {/* Changed from bg-slate-900 to bg-brand-black */}
            <motion.a
              whileHover={{ y: -6 }}
              href={coreActions[1].href}
              className="bg-brand-black p-8 rounded-3xl text-white flex flex-col justify-between group h-72 md:h-auto min-h-[280px]"
            >
              <div>
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div> {/* Changed from text-primary to text-white for better contrast on dark background */}
                <h3 className="text-xl font-bold mb-2">Sell Products</h3>
                <p className="text-slate-400 text-sm leading-relaxed">List your products in minutes. Get paid fast with our secure escrow payment system.</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-primary mt-6">
                Liquidation Engine <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </motion.a>

            {/* Swap Product Card */}
            <motion.a
              whileHover={{ y: -6 }}
              href={coreActions[2].href}
              className="bg-neutral-light border border-neutral-border p-8 rounded-3xl flex flex-col justify-between group min-h-[240px]"
            >
              <div>
                <div className="w-11 h-11 bg-white border border-neutral-border shadow-sm rounded-xl flex items-center justify-center mb-6">
                  <RefreshCw className="w-5 h-5 text-brand-charcoal group-hover:rotate-45 transition-transform" />
                </div> {/* Changed from text-slate-700 to text-brand-charcoal */}
                <h3 className="text-lg font-bold text-brand-charcoal mb-2">Swap Products</h3>
                <p className="text-neutral-slate text-xs leading-relaxed">Trade your products directly with other users. Upgrade without spending extra cash.</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-brand-black mt-4">
                P2P Exchange Network <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </motion.a>

            {/* Referral / Incentive Card - Spans double on bottom row */}
            <motion.a
              whileHover={{ y: -6 }}
              href={coreActions[3].href}
              className="md:col-span-2 bg-linear-to-r from-primary-light/50 to-blue-50/50 border border-primary-light p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 min-h-[240px]"
            >
              <div className="max-w-md">
                <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center mb-4 text-white shadow-md shadow-primary/10">
                  <Gift className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-brand-black mb-1">Refer & Earn</h3>
                <p className="text-primary-dark/80 text-xs leading-relaxed">Invite friends and earn cash rewards for every successful transaction they complete.</p>
              </div>
              <div className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-5 py-3 rounded-xl transition-colors shrink-0">
                Claim Reward Link
              </div>
            </motion.a>

          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS: Asymmetric Staggered Grid Restructuring */}
      <section className="py-24 bg-slate-50/50 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
            <div>
              <span className="text-xs font-bold text-primary tracking-widest uppercase">Live Dynamic Catalog</span>
              <h2 className="text-3xl font-black text-slate-900 mt-1">Curated Retail Showroom</h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-colors group"
            >
              View Full Inventories
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          </div>

          {/* Asymmetric Structural Shift */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.slice(0, 10).map((product, index) => (
              <motion.div
                key={product.id}
                /* Ensure all product cards have equal height */
                className="transition-all duration-300 h-full"
              >
                <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow group h-full flex flex-col">
                  <ProductCard product={product} />
                </div>
              </motion.div>
            ))}
          </div>

          {loading && (
            <div className="flex flex-col justify-center items-center text-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
              <p className="text-slate-500 mt-4 text-sm font-medium">Syncing distributed catalogs...</p>
            </div>
          )}

          {products.length === 0 && !loading && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 max-w-xl mx-auto mt-12">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-slate-900 font-bold text-sm">No Listings Broadcasted</p>
              <p className="text-slate-400 text-xs mt-1">Products will appear once uploaded into your administration systems.</p>
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-md mx-auto mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-3">Seamless Operations</h2>
            <p className="text-slate-500 text-sm">Three logical workflows bridging deployment speed with safe checkouts.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 lg:gap-12 mb-16">
            {steps.map((step) => (
              <div key={step.number} className="relative group">
                <div className="absolute top-6 left-0 right-0 h-0.5 bg-neutral-border hidden sm:block -z-10" />
                <div className="bg-white pr-4 h-full"> {/* Added h-full here */}
                  <div className="w-12 h-12 rounded-2xl bg-brand-black text-white flex items-center justify-center font-bold text-sm group-hover:bg-primary transition-colors shadow-lg shadow-brand-black/10">
                    {step.number}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-6 mb-2">{step.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Micro Trust badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-12">
            {[
              { icon: Shield, label: 'Buyer Escrow Guard', desc: 'Comprehensive financial protection mechanisms on all exchange routes.' },
              { icon: Zap, label: 'Swift Settlement', desc: 'Merchant parameters clear processing pipelines in under 24 hours.' },
              { icon: Star, label: 'Inspected Grading', desc: 'Product conditions thoroughly managed using tiered diagnostics.' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex gap-4 p-4 rounded-2xl hover:bg-neutral-light transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{label}</p>
                  <p className="text-xs text-slate-400 mt-1 leading-normal">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="bg-brand-black py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Ready to deploy your new hub?
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
            Initialize immediate customer acquisition with completely unique dashboard experiences. Setup takes under a minute.
          </p>
          <div className="pt-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-10 py-4 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-xl"
            >
              Get Started Instantly
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-[11px] text-slate-600">Enterprise deployment guidelines apply. Cancellation rules are obsolete.</p>
        </div>
      </section>
    </div>
  );
}