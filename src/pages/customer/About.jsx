import React from 'react'
import { useNavigate } from 'react-router-dom'
import useSettings from '../../hooks/useSettings'

const About = () => {
  const navigate = useNavigate()
  const { settings, loading } = useSettings()

  const storeName = settings?.store_name || 'Our Store'
  const storeDesc = settings?.store_description ||
    'Your trusted shop for quality products and accessories.'
  const phone = settings?.store_phone || ''
  const whyChooseUs = /** @type {Array<{ icon: string; title: string; desc: string }>} */ (
    Array.isArray(settings?.why_choose_us) ? settings.why_choose_us : []
  )
  const email = settings?.store_email || ''
  const address = settings?.store_address || ''
  const hours = settings?.business_hours || 'Mon - Sat: 9am - 6pm'
  const whatsapp = settings?.whatsapp_number || ''
  const instagram = settings?.instagram_url || ''
  const twitter = settings?.twitter_url || ''
  const facebook = settings?.facebook_url || ''
  const logo = settings?.logo_url || ''
  const whatsappLink = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '').replace(/^0/, '234')}` : null

  if (loading) return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-6 animate-pulse">
      <div className="h-64 bg-gray-100 rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 bg-gray-100 rounded-2xl" />
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-brand-black">
        <div className="absolute top-0 left-1/3 h-96 w-96 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 translate-y-1/2 rounded-full bg-primary/10 blur-2xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/20 px-4 py-1.5">
                <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  About Us
                </span>
              </div>

              <div className="mb-5 flex   items-center gap-4">
                {/* <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-primary/30 bg-white/10 shadow-lg">
                  {logo ? (
                    <img src={logo} alt={storeName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary to-blue-400">
                      <span className="text-2xl font-bold text-white">{storeName.charAt(0)}</span>
                    </div>
                  )}
                </div> */}

                <div>
                  <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
                    {storeName}
                  </h1>
                  <p className="mt-2 max-w-xl text-base leading-relaxed text-gray-400">
                    {storeDesc}
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-semibold leading-tight text-white sm:text-3xl lg:text-4xl">
                We help Nigerian businesses
                <span className="block text-blue-400">sell online professionally.</span>
              </h2>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-400">
                MarketMate is a complete e-commerce platform built by Innovators Hub specifically for retail businesses in Nigeria and across Africa. What you are browsing right now is a live demo — and every business can have their own branded version of this in 48 hours.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
                Why it stands out
              </p>
              <div className="mt-4 space-y-3 text-sm text-gray-300">
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="font-semibold text-white">Fast setup</p>
                  <p className="mt-1 text-gray-300">Launch a polished store in as little as 48 hours.</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="font-semibold text-white">Built for retail growth</p>
                  <p className="mt-1 text-gray-300">Manage products, orders, staff, and promotions from one dashboard.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="space-y-8 md:space-y-10">
          {/* What is this */}
          <section className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
            <h2 className="text-xl font-bold text-brand-charcoal">
              📌 What Is This Website?
            </h2>
            <div className="mt-5 space-y-4 text-neutral-slate leading-relaxed">
              <p>
                This is a <strong>live demo store</strong> powered by MarketMate. It shows exactly what a retail business's online store looks like when built on our platform.
              </p>
              <p>
                You can browse products, add to cart, go through the full checkout process, upload a payment proof, and track your order — just like a real customer would.
              </p>
              <p>
                If you own a retail business — phone shop, fashion store, gadget store, beauty store, or anything else — you can have your own version of this, fully branded with your name, logo, products, and bank details, live and taking real orders in <strong>48 hours.</strong>
              </p>
            </div>
          </section>

          {/* What you get */}
          <section>
            <h2 className="mb-6 text-xl font-bold text-brand-charcoal">
              What Your Business Gets
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                {
                  icon: '🛒', title: 'Professional Online Store',
                  desc: 'Your products, your branding, your prices. Customers browse and order anytime.'
                },
                {
                  icon: '⚙️', title: 'Full Admin Dashboard',
                  desc: 'Manage orders, products, staff and customers all from one place.'
                },
                {
                  icon: '🚚', title: 'Delivery Management',
                  desc: 'Lagos, nationwide and international delivery zones with automatic fee calculation.'
                },
                {
                  icon: '📧', title: 'Automated Emails',
                  desc: 'Customers receive order confirmations and updates automatically.'
                },
                {
                  icon: '🎟️', title: 'Promo Codes & Flash Sales',
                  desc: 'Run promotions and time-limited deals to drive more sales.'
                },
                {
                  icon: '🔗', title: 'Customer Referral Program',
                  desc: 'Your customers invite their friends and earn rewards automatically.'
                },
                {
                  icon: '⭐', title: 'Reviews & Ratings',
                  desc: 'Verified customer reviews build trust and drive more orders.'
                },
                {
                  icon: '📱', title: 'Works on All Devices',
                  desc: 'Customers can order from their phone, tablet or laptop seamlessly.'
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
                >
                  <span className="shrink-0 text-2xl">{item.icon}</span>
                  <div>
                    <p className="mb-1 text-sm font-bold text-brand-charcoal">{item.title}</p>
                    <p className="text-xs leading-relaxed text-neutral-slate">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section className="relative overflow-hidden rounded-[28px] bg-blue-600 p-6 text-white shadow-lg sm:p-8 lg:p-10">
            <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/10" />
            <div className="relative">
              <h2 className="text-xl font-bold">Simple, Honest Pricing</h2>
              <p className="mt-2 text-sm text-blue-100">
                We built this for Nigerian businesses — so our pricing reflects that.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-200">
                    Setup Fee
                  </p>
                  <p className="mb-1 text-3xl font-extrabold">₦50,000</p>
                  <p className="text-sm text-blue-200">
                    One-time. Full setup. Live in 48 hours.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-200">
                    Monthly Maintenance
                  </p>
                  <p className="mb-1 text-3xl font-extrabold">₦20,000</p>
                  <p className="text-sm text-blue-200">
                    Per month. Support, updates, monitoring.
                  </p>
                </div>
              </div>
              <p className="mt-6 text-sm text-blue-100">
                ✅ Split payment available — ₦25,000 to start, ₦25,000 when your store goes live.
              </p>
            </div>
          </section>

          {/* Who we are */}
          <section className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
            <h2 className="text-xl font-bold text-brand-charcoal">Who We Are</h2>
            <div className="mt-5 space-y-4 text-neutral-slate leading-relaxed">
              <p>
                We are <strong>Innovators Hub</strong> — a Nigerian software company dedicated to helping African businesses grow through technology.
              </p>
              <p>
                We built MarketMate because we saw thousands of great businesses across Nigeria losing customers every day simply because they had no proper way to sell online. We decided to change that.
              </p>
              <p>
                Every business deserves a professional online presence. We make that possible — affordably, quickly, and with full ongoing support.
              </p>
            </div>
          </section>

          {/* Contact cards */}
          <section>
            <h2 className="mb-6 text-xl font-bold text-brand-charcoal">Contact Us</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-primary hover:shadow-md"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-2xl transition-transform group-hover:scale-110">
                    📞
                  </div>
                  <p className="mb-1 text-sm font-bold text-brand-charcoal">Phone</p>
                  <p className="text-sm font-semibold text-primary">{phone}</p>
                  <p className="mt-1 text-xs text-neutral-slate">Tap to call</p>
                </a>
              )}

              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl transition-transform group-hover:scale-110">
                    💬
                  </div>
                  <p className="mb-1 text-sm font-bold text-brand-charcoal">WhatsApp</p>
                  <p className="text-sm font-semibold text-blue-600">Chat with us</p>
                  <p className="mt-1 text-xs text-neutral-slate">Tap to chat</p>
                </a>
              )}

              {email && (
                <a
                  href={`mailto:${email}`}
                  className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl transition-transform group-hover:scale-110">
                    ✉️
                  </div>
                  <p className="mb-1 text-sm font-bold text-brand-charcoal">Email</p>
                  <p className="truncate text-sm font-semibold text-blue-600">{email}</p>
                  <p className="mt-1 text-xs text-neutral-slate">Tap to email</p>
                </a>
              )}

              {address && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:col-span-2 lg:col-span-1">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-2xl">
                    📍
                  </div>
                  <p className="mb-1 text-sm font-bold text-brand-charcoal">Store Location</p>
                  <p className="text-sm leading-relaxed text-neutral-slate">{address}</p>
                </div>
              )}

              {hours && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-2xl">
                    🕐
                  </div>
                  <p className="mb-1 text-sm font-bold text-brand-charcoal">Business Hours</p>
                  <p className="text-sm leading-relaxed text-neutral-slate">{hours}</p>
                </div>
              )}
            </div>
          </section>

          {/* Social links */}
          {(instagram || twitter || facebook) && (
            <section>
              <h2 className="mb-6 text-xl font-bold text-brand-charcoal">Follow Us</h2>
              <div className="flex flex-wrap gap-4">
                {[
                  {
                    url: settings?.instagram_url, label: 'Instagram', icon: '📸',
                    color: 'hover:border-pink-300 hover:bg-pink-50'
                  },
                  {
                    url: settings?.twitter_url, label: 'Twitter/X', icon: '🐦',
                    color: 'hover:border-blue-300 hover:bg-blue-50'
                  },
                  {
                    url: settings?.facebook_url, label: 'Facebook', icon: '👥',
                    color: 'hover:border-blue-400 hover:bg-blue-50'
                  },
                ].filter(s => s.url).map((social) => (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-5 py-3 shadow-sm transition-all hover:shadow-md ${social.color}`}
                  >
                    <span className="text-xl">{social.icon}</span>
                    <span className="text-sm font-semibold text-brand-charcoal">{social.label}</span>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Why choose us */}
          {whyChooseUs.length > 0 && (
            <section className="rounded-[28px] bg-brand-black p-6 sm:p-8 md:p-10">
              <h2 className="mb-8 text-center text-xl font-bold text-white">
                Why Choose {storeName}?
              </h2>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {whyChooseUs.map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="mb-3 text-3xl">{item.icon}</div>
                    <p className="text-sm font-bold text-white">{item.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="relative overflow-hidden rounded-[28px] bg-linear-to-r from-primary to-blue-500 p-8 text-center shadow-lg sm:p-10">
            <div className="absolute right-0 top-0 h-48 w-48 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/10" />
            <div className="relative">
              <h2 className="text-2xl font-extrabold text-white">Ready to Shop?</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-white/80">
                Browse our full collection and find exactly what you need.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => navigate('/shop')}
                  className="rounded-xl bg-white px-8 py-3 text-sm font-bold text-primary shadow-lg transition-all hover:scale-[1.03] hover:bg-gray-50"
                >
                  Browse Products →
                </button>
                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-white/30 bg-white/20 px-8 py-3 text-sm font-bold text-white transition-all hover:bg-white/30"
                  >
                    💬 WhatsApp Us
                  </a>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default About