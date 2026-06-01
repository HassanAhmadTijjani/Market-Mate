// @ts-nocheck
import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { supabase } from '../../lib/supabase'
import useSettings from '../../hooks/useSettings'
import toast from 'react-hot-toast'

const TABS = [
    { id: 'store', label: '🏪 Store Info' },
    { id: 'appearance', label: '🎨 Appearance' },
    { id: 'delivery', label: '🚚 Delivery' },
    { id: 'payment', label: '💳 Payment' },
    { id: 'business', label: '🛒 Business Rules' },
    { id: 'social', label: '📱 Social & Contact' },
]

export default function Settings() {
    const { settings, loading, updateSettings } = useSettings()
    const [activeTab, setActiveTab] = useState('store')
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        store_name: '', store_phone: '', super_admin_phone: '',
        store_email: '', store_address: '', store_description: '',
        logo_url: '', hero_badge_text: '', hero_cta_text: '',
        stat_products: '', stat_customers: '', stat_deliveries: '',
        why_choose_us: [], store_categories: [],
        delivery_fee_lagos: '', delivery_fee_nigeria: '', delivery_fee_outside: '',
        bank_name: '', account_number: '', account_name: '',
        payment_instructions: '', order_success_message: '',
        currency_symbol: '', cart_expiry_days: 3, default_low_stock: 3,
        whatsapp_number: '', instagram_url: '', twitter_url: '',
        facebook_url: '', business_hours: '',
        referral_enabled: false, referral_reward_type: 'promo',
        referral_discount: 10, referral_discount_type: 'percentage',
        randomize_products: false,
        welcome_discount: 0,
    })

    useEffect(() => {
        if (settings) {
            setForm({
                store_name: settings.store_name || '',
                store_phone: settings.store_phone || '',
                super_admin_phone: settings.super_admin_phone || '',
                store_email: settings.store_email || '',
                store_address: settings.store_address || '',
                store_description: settings.store_description || '',
                logo_url: settings.logo_url || '',
                hero_badge_text: settings.hero_badge_text || '',
                hero_cta_text: settings.hero_cta_text || '',
                stat_products: settings.stat_products || '100+',
                stat_customers: settings.stat_customers || '500+',
                stat_deliveries: settings.stat_deliveries || '1000+',
                why_choose_us: settings.why_choose_us || [],
                store_categories: settings.store_categories || [],
                delivery_fee_lagos: settings.delivery_fee_lagos || '',
                delivery_fee_nigeria: settings.delivery_fee_nigeria || '',
                delivery_fee_outside: settings.delivery_fee_outside || '',
                bank_name: settings.bank_name || '',
                account_number: settings.account_number || '',
                account_name: settings.account_name || '',
                payment_instructions: settings.payment_instructions || '',
                order_success_message: settings.order_success_message || '',
                currency_symbol: settings.currency_symbol || '₦',
                cart_expiry_days: settings.cart_expiry_days || 3,
                default_low_stock: settings.default_low_stock || 3,
                whatsapp_number: settings.whatsapp_number || '',
                instagram_url: settings.instagram_url || '',
                twitter_url: settings.twitter_url || '',
                facebook_url: settings.facebook_url || '',
                business_hours: settings.business_hours || '',
                referral_enabled: settings.referral_enabled || false,
                referral_reward_type: settings.referral_reward_type || 'promo',
                referral_discount: settings.referral_discount || 10,
                referral_discount_type: settings.referral_discount_type || 'percentage',
                randomize_products: settings.randomize_products || false,
                welcome_discount: settings.welcome_discount || 0,
            })
        }
    }, [settings])

    function handleChange(e) {
        const { name, value, type } = e.target
        setForm({ ...form, [name]: type === 'number' ? Number(value) : value })
    }

    function handleWhyChooseUs(index, field, value) {
        const updated = [...form.why_choose_us]
        updated[index] = { ...updated[index], [field]: value }
        setForm({ ...form, why_choose_us: updated })
    }

    function handleCategories(index, field, value) {
        const updated = [...form.store_categories]
        updated[index] = { ...updated[index], [field]: value }
        setForm({ ...form, store_categories: updated })
    }

    function addCategory() {
        setForm({
            ...form,
            store_categories: [...(form.store_categories || []),
            { name: '', icon: '', desc: '' }]
        })
    }

    function removeCategory(index) {
        setForm({
            ...form,
            store_categories: (form.store_categories || [])
                .filter((_, i) => i !== index)
        })
    }

    function addWhyChooseUs() {
        setForm({
            ...form,
            why_choose_us: [...(form.why_choose_us || []),
            { title: '', icon: '', desc: '' }]
        })
    }

    function removeWhyChooseUs(index) {
        setForm({
            ...form,
            why_choose_us: (form.why_choose_us || [])
                .filter((_, i) => i !== index)
        })
    }

    async function handleLogoUpload(e) {
        const file = e.target.files[0]
        if (!file) return
        try {
            const ext = file.name.split('.').pop()
            const fileName = `logo-${Date.now()}.${ext}`
            const { error: uploadError } = await supabase.storage
                .from('store-assets')
                .upload(`logos/${fileName}`, file)
            if (uploadError) throw uploadError
            const { data } = supabase.storage
                .from('store-assets')
                .getPublicUrl(`logos/${fileName}`)
            setForm(prev => ({ ...prev, logo_url: data.publicUrl }))
            toast.success('Logo uploaded!')
        } catch (err) {
            toast.error('Failed to upload logo')
        }
    }

    async function handleSave(e) {
        e.preventDefault()
        setSaving(true)
        const cleanedForm = {
            ...form,
            store_categories: (form.store_categories || [])
                .filter(c => c.name?.trim()),
            why_choose_us: (form.why_choose_us || [])
                .filter(w => w.title?.trim()),
        }
        try {
            await updateSettings(cleanedForm)
            setForm(cleanedForm)
            toast.success('Settings saved!')
        } catch (err) {
            toast.error('Failed to save: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return (
        <AdminLayout>
            <div className="space-y-4 animate-pulse">
                <div className="h-8 bg-gray-100 rounded w-1/4" />
                <div className="h-48 bg-gray-100 rounded-xl" />
            </div>
        </AdminLayout>
    )

    return (
        <AdminLayout>
            <div className="max-w-3xl">

                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-brand-charcoal">Settings</h1>
                    <p className="text-neutral-slate text-sm mt-1">
                        Configure everything about your store
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 flex-wrap mb-8">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === tab.id
                                    ? 'bg-primary text-white'
                                    : 'bg-white text-neutral-slate border border-gray-200 hover:border-primary hover:text-primary'
                                }`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSave} className="space-y-6">

                    {/* ── STORE INFO ── */}
                    {activeTab === 'store' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <h2 className="font-semibold text-brand-charcoal mb-4">Store Logo</h2>
                                {form.logo_url && (
                                    <img src={form.logo_url} alt="Logo"
                                        className="h-20 w-20 object-cover rounded-xl border border-gray-200 mb-4" />
                                )}
                                <input type="file" accept="image/*" onChange={handleLogoUpload}
                                    className="block w-full text-sm text-neutral-slate
                             file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                             file:bg-primary-light file:text-primary-dark file:font-semibold
                             file:text-sm hover:file:bg-primary hover:file:text-white
                             file:transition-all cursor-pointer" />
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
                                <h2 className="font-semibold text-brand-charcoal">Store Information</h2>
                                {[
                                    { label: 'Store Name', name: 'store_name', type: 'text', placeholder: 'e.g. TechZone' },
                                    { label: 'Store Description', name: 'store_description', type: 'text', placeholder: 'One-stop shop for gadgets' },
                                    { label: 'Store Email', name: 'store_email', type: 'email', placeholder: 'info@yourstore.com' },
                                    { label: 'Support Phone', name: 'store_phone', type: 'tel', placeholder: '08012345678' },
                                    { label: 'Admin Phone (Enquiries)', name: 'super_admin_phone', type: 'tel', placeholder: '08012345678' },
                                    { label: 'Store Address', name: 'store_address', type: 'text', placeholder: '12 Market Street, Lagos' },
                                    { label: 'Business Hours', name: 'business_hours', type: 'text', placeholder: 'Mon - Sat: 9am - 6pm' },
                                ].map(field => (
                                    <div key={field.name}>
                                        <label className="block text-sm font-medium text-brand-charcoal mb-1">
                                            {field.label}
                                        </label>
                                        <input type={field.type} name={field.name}
                                            value={form[field.name]} onChange={handleChange}
                                            placeholder={field.placeholder}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3
                                 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── APPEARANCE ── */}
                    {activeTab === 'appearance' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
                                <h2 className="font-semibold text-brand-charcoal">🏠 Homepage Hero</h2>
                                {[
                                    { label: 'Badge Text', name: 'hero_badge_text', placeholder: 'Now Live — Shop Online' },
                                    { label: 'Button Text', name: 'hero_cta_text', placeholder: 'Shop Now' },
                                ].map(field => (
                                    <div key={field.name}>
                                        <label className="block text-sm font-medium text-brand-charcoal mb-1">
                                            {field.label}
                                        </label>
                                        <input type="text" name={field.name}
                                            value={form[field.name]} onChange={handleChange}
                                            placeholder={field.placeholder}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3
                                 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
                                <h2 className="font-semibold text-brand-charcoal">📊 Homepage Stats</h2>
                                <p className="text-neutral-slate text-xs -mt-2">
                                    These appear in the stats bar below the hero
                                </p>
                                {[
                                    { label: 'Products Stat', name: 'stat_products', placeholder: '100+' },
                                    { label: 'Customers Stat', name: 'stat_customers', placeholder: '500+' },
                                    { label: 'Deliveries Stat', name: 'stat_deliveries', placeholder: '1000+' },
                                ].map(field => (
                                    <div key={field.name}>
                                        <label className="block text-sm font-medium text-brand-charcoal mb-1">
                                            {field.label}
                                        </label>
                                        <input type="text" name={field.name}
                                            value={form[field.name]} onChange={handleChange}
                                            placeholder={field.placeholder}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3
                                 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                    </div>
                                ))}
                            </div>

                            {/* Categories */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-5">
                                    <div>
                                        <h2 className="font-semibold text-brand-charcoal mb-1">
                                            🗂️ Homepage Categories
                                        </h2>
                                        <p className="text-neutral-slate text-xs">
                                            Categories highlighted on your homepage
                                        </p>
                                    </div>
                                    <button type="button" onClick={addCategory}
                                        className="text-xs bg-primary-light text-primary-dark px-3 py-1.5
                               rounded-lg font-bold hover:bg-primary hover:text-white
                               transition-all">
                                        + Add Category
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {(form.store_categories || []).map((cat, i) => (
                                        <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <p className="text-xs font-bold text-neutral-slate uppercase tracking-wider">
                                                    Category {i + 1}
                                                </p>
                                                <button type="button" onClick={() => removeCategory(i)}
                                                    className="text-xs text-red-500 font-bold hover:underline">
                                                    Remove
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <input type="text" value={cat.name || ''}
                                                    onChange={e => handleCategories(i, 'name', e.target.value)}
                                                    placeholder="Category name"
                                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                                     focus:outline-none focus:ring-2 focus:ring-primary" />
                                                <input type="text" value={cat.icon || ''}
                                                    onChange={e => handleCategories(i, 'icon', e.target.value)}
                                                    placeholder="Icon emoji e.g. 📱"
                                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                                     focus:outline-none focus:ring-2 focus:ring-primary" />
                                            </div>
                                            <input type="text" value={cat.desc || ''}
                                                onChange={e => handleCategories(i, 'desc', e.target.value)}
                                                placeholder="Short description"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2
                                   text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Why Choose Us */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-5">
                                    <div>
                                        <h2 className="font-semibold text-brand-charcoal mb-1">
                                            💡 Why Choose Us
                                        </h2>
                                        <p className="text-neutral-slate text-xs">
                                            Reasons shown at the bottom of the homepage
                                        </p>
                                    </div>
                                    <button type="button" onClick={addWhyChooseUs}
                                        className="text-xs bg-primary-light text-primary-dark px-3 py-1.5
                               rounded-lg font-bold hover:bg-primary hover:text-white
                               transition-all">
                                        + Add Reason
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {(form.why_choose_us || []).map((item, i) => (
                                        <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <p className="text-xs font-bold text-neutral-slate uppercase tracking-wider">
                                                    Reason {i + 1}
                                                </p>
                                                <button type="button" onClick={() => removeWhyChooseUs(i)}
                                                    className="text-xs text-red-500 font-bold hover:underline">
                                                    Remove
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <input type="text" value={item.icon || ''}
                                                    onChange={e => handleWhyChooseUs(i, 'icon', e.target.value)}
                                                    placeholder="Icon emoji e.g. ✅"
                                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                                     focus:outline-none focus:ring-2 focus:ring-primary" />
                                                <input type="text" value={item.title || ''}
                                                    onChange={e => handleWhyChooseUs(i, 'title', e.target.value)}
                                                    placeholder="Title"
                                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                                     focus:outline-none focus:ring-2 focus:ring-primary" />
                                            </div>
                                            <input type="text" value={item.desc || ''}
                                                onChange={e => handleWhyChooseUs(i, 'desc', e.target.value)}
                                                placeholder="Short description"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2
                                   text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── DELIVERY ── */}
                    {activeTab === 'delivery' && (
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
                            <h2 className="font-semibold text-brand-charcoal">🚚 Delivery Fees</h2>
                            <p className="text-neutral-slate text-xs -mt-2">
                                Fees added to customer order based on their zone
                            </p>
                            {[
                                { label: '🏙️ Within Lagos', name: 'delivery_fee_lagos', desc: 'Delivery within Lagos State' },
                                { label: '🇳🇬 Outside Lagos (Within Nigeria)', name: 'delivery_fee_nigeria', desc: 'Delivery to other Nigerian states' },
                                { label: '✈️ Outside Nigeria', name: 'delivery_fee_outside', desc: 'International delivery' },
                            ].map(field => (
                                <div key={field.name}>
                                    <label className="block text-sm font-medium text-brand-charcoal mb-1">
                                        {field.label}
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2
                                     text-neutral-slate font-bold text-sm">
                                            {form.currency_symbol || '₦'}
                                        </span>
                                        <input type="number" name={field.name}
                                            value={form[field.name] || ''} onChange={handleChange}
                                            placeholder="0" min="0"
                                            className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3
                                 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                    </div>
                                    <p className="text-xs text-neutral-slate mt-1">{field.desc}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── PAYMENT ── */}
                    {activeTab === 'payment' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
                                <h2 className="font-semibold text-brand-charcoal">🏦 Bank Account Details</h2>
                                {[
                                    { label: 'Bank Name', name: 'bank_name', placeholder: 'e.g. First Bank Nigeria' },
                                    { label: 'Account Number', name: 'account_number', placeholder: 'e.g. 1234567890' },
                                    { label: 'Account Name', name: 'account_name', placeholder: 'e.g. TechZone Ltd' },
                                ].map(field => (
                                    <div key={field.name}>
                                        <label className="block text-sm font-medium text-brand-charcoal mb-1">
                                            {field.label}
                                        </label>
                                        <input type="text" name={field.name}
                                            value={form[field.name]} onChange={handleChange}
                                            placeholder={field.placeholder}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3
                                 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                    </div>
                                ))}
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
                                <h2 className="font-semibold text-brand-charcoal">💬 Checkout Messages</h2>
                                <div>
                                    <label className="block text-sm font-medium text-brand-charcoal mb-1">
                                        Payment Instructions
                                    </label>
                                    <textarea name="payment_instructions"
                                        value={form.payment_instructions} onChange={handleChange} rows={3}
                                        placeholder="Transfer the exact amount and upload your proof"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3
                               text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brand-charcoal mb-1">
                                        Order Success Message
                                    </label>
                                    <textarea name="order_success_message"
                                        value={form.order_success_message} onChange={handleChange} rows={3}
                                        placeholder="Thank you for your order. We will contact you shortly."
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3
                               text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── BUSINESS RULES ── */}
                    {activeTab === 'business' && (
                        <div className="space-y-6">

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
                                <h2 className="font-semibold text-brand-charcoal">🛒 Business Rules</h2>
                                <p className="text-neutral-slate text-xs -mt-2">
                                    These control how the system behaves automatically
                                </p>
                                <div>
                                    <label className="block text-sm font-medium text-brand-charcoal mb-1">
                                        Currency Symbol
                                    </label>
                                    <input type="text" name="currency_symbol"
                                        value={form.currency_symbol} onChange={handleChange}
                                        placeholder="₦"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3
                               text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                    <p className="text-xs text-neutral-slate mt-1">
                                        Symbol shown before all prices — e.g. ₦, $, £
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brand-charcoal mb-1">
                                        Cart Expiry (Days)
                                    </label>
                                    <input type="number" name="cart_expiry_days"
                                        value={form.cart_expiry_days} onChange={handleChange}
                                        min="1" max="30"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3
                               text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                    <p className="text-xs text-neutral-slate mt-1">
                                        Cart items are automatically removed after this many days
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brand-charcoal mb-1">
                                        Default Low Stock Threshold
                                    </label>
                                    <input type="number" name="default_low_stock"
                                        value={form.default_low_stock} onChange={handleChange} min="1"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3
                               text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                    <p className="text-xs text-neutral-slate mt-1">
                                        Default low stock warning threshold for new products
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div>
                                        <label className="block text-sm font-medium text-brand-charcoal">
                                            Shuffle Products Daily
                                        </label>
                                        <p className="text-xs text-neutral-slate mt-1">
                                            Automatically change product order every 24 hours to keep the store feeling fresh.
                                        </p>
                                    </div>
                                    <button type="button"
                                        onClick={() => setForm(f => ({ ...f, randomize_products: !f.randomize_products }))}
                                        className={`relative w-12 h-6 rounded-full transition-all
                                            ${form.randomize_products ? 'bg-primary' : 'bg-gray-200'}`}>
                                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all
                                            ${form.randomize_products ? 'left-6' : 'left-0.5'}`} />
                                    </button>
                                </div>
                            </div>

                            {/* ✅ Referral Program — correctly inside business tab */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="font-semibold text-brand-charcoal">
                                            🔗 Referral Program
                                        </h2>
                                        <p className="text-neutral-slate text-xs mt-1">
                                            Reward customers who refer new buyers
                                        </p>
                                    </div>
                                    <button type="button"
                                        onClick={() => setForm(f => ({
                                            ...f, referral_enabled: !f.referral_enabled
                                        }))}
                                        className={`relative w-12 h-6 rounded-full transition-all
                      ${form.referral_enabled ? 'bg-primary' : 'bg-gray-200'}`}>
                                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full
                                     shadow transition-all
                      ${form.referral_enabled ? 'left-6' : 'left-0.5'}`} />
                                    </button>
                                </div>

                                {form.referral_enabled && (
                                    <div className="space-y-4 pt-2 border-t border-gray-100">
                                        <div>
                                            <label className="block text-sm font-medium text-brand-charcoal mb-2">
                                                Reward Type for Referrer
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { value: 'promo', label: '🎟️ Promo Code' },
                                                    { value: 'free_delivery', label: '🚚 Free Delivery' },
                                                ].map(type => (
                                                    <button key={type.value} type="button"
                                                        onClick={() => setForm(f => ({
                                                            ...f, referral_reward_type: type.value
                                                        }))}
                                                        className={`py-2.5 px-3 rounded-xl border-2 text-sm
                                        font-semibold transition-all
                              ${form.referral_reward_type === type.value
                                                                ? 'border-primary bg-primary-light text-primary'
                                                                : 'border-gray-200 text-neutral-slate'
                                                            }`}>
                                                        {type.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {form.referral_reward_type === 'promo' && (
                                            <div>
                                                <label className="block text-sm font-medium text-brand-charcoal mb-1">
                                                    Referrer Reward — Discount Value
                                                </label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <select
                                                        value={form.referral_discount_type || 'percentage'}
                                                        onChange={e => setForm(f => ({
                                                            ...f, referral_discount_type: e.target.value
                                                        }))}
                                                        className="border border-gray-300 rounded-lg px-4 py-3 text-sm
                                       focus:outline-none focus:ring-2 focus:ring-primary bg-white">
                                                        <option value="percentage">Percentage %</option>
                                                        <option value="fixed">Fixed Amount ₦</option>
                                                    </select>
                                                    <input type="number"
                                                        value={form.referral_discount || ''}
                                                        onChange={e => setForm(f => ({
                                                            ...f, referral_discount: e.target.value
                                                        }))}
                                                        placeholder={
                                                            form.referral_discount_type === 'percentage'
                                                                ? 'e.g. 10' : 'e.g. 5000'
                                                        }
                                                        className="border border-gray-300 rounded-lg px-4 py-3 text-sm
                                       focus:outline-none focus:ring-2 focus:ring-primary" />
                                                </div>
                                                <p className="text-xs text-neutral-slate mt-1">
                                                    Referrer gets this discount on their next order
                                                </p>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-brand-charcoal mb-1">
                                                Welcome Discount for New Customer (%)
                                                <span className="text-neutral-slate font-normal ml-1">
                                                    (0 = no welcome discount)
                                                </span>
                                            </label>
                                            <input type="number"
                                                value={form.welcome_discount || ''}
                                                onChange={e => setForm(f => ({
                                                    ...f, welcome_discount: e.target.value
                                                }))}
                                                placeholder="e.g. 5" min="0" max="100"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3
                                   text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                            <p className="text-xs text-neutral-slate mt-1">
                                                New customer gets this % off their first order
                                            </p>
                                        </div>

                                        <div className="bg-primary-light rounded-xl p-4">
                                            <p className="text-xs font-bold text-primary-dark mb-2">
                                                How it works for customers:
                                            </p>
                                            <ul className="space-y-1 text-xs text-primary-dark">
                                                <li>→ Customer shares their referral link</li>
                                                <li>→ Friend signs up and places first order</li>
                                                <li>
                                                    → Referrer gets{' '}
                                                    {form.referral_reward_type === 'free_delivery'
                                                        ? 'free delivery on next order'
                                                        : `${form.referral_discount || '?'}${form.referral_discount_type === 'percentage' ? '%' : '₦'
                                                        } off next order`
                                                    }
                                                </li>
                                                {form.welcome_discount > 0 && (
                                                    <li>
                                                        → New customer gets {form.welcome_discount}% off first order
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── SOCIAL & CONTACT ── */}
                    {activeTab === 'social' && (
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
                            <h2 className="font-semibold text-brand-charcoal">📱 Social & Contact</h2>
                            {[
                                { label: '💬 WhatsApp Number', name: 'whatsapp_number', placeholder: '2348012345678', desc: 'Include country code — no + or spaces' },
                                { label: '📸 Instagram URL', name: 'instagram_url', placeholder: 'https://instagram.com/yourstore', desc: '' },
                                { label: '🐦 Twitter/X URL', name: 'twitter_url', placeholder: 'https://twitter.com/yourstore', desc: '' },
                                { label: '👥 Facebook URL', name: 'facebook_url', placeholder: 'https://facebook.com/yourstore', desc: '' },
                            ].map(field => (
                                <div key={field.name}>
                                    <label className="block text-sm font-medium text-brand-charcoal mb-1">
                                        {field.label}
                                    </label>
                                    <input type="text" name={field.name}
                                        value={form[field.name]} onChange={handleChange}
                                        placeholder={field.placeholder}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3
                               text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                    {field.desc && (
                                        <p className="text-xs text-neutral-slate mt-1">{field.desc}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Save Button */}
                    <button type="submit" disabled={saving}
                        className="w-full bg-primary hover:bg-primary-dark text-white py-4
                       rounded-xl font-bold text-base transition-all hover:scale-[1.01]
                       disabled:opacity-50 disabled:cursor-not-allowed">
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>

                </form>
            </div>
        </AdminLayout>
    )
}