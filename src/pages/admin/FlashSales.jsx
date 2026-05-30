// @ts-nocheck
import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { useFlashSales } from '../../hooks/useFlashSales'
import { supabase } from '../../lib/supabase'
import useSettings from '../../hooks/useSettings'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
    product_id: '',
    sale_price: '',
    label: 'FLASH SALE',
    ends_at: '',
}

export default function FlashSales() {
    const { fetchAllSales, createSale, toggleSale, deleteSale } = useFlashSales()
    const { settings, updateSettings } = useSettings()

    const [sales, setSales] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)

    async function load() {
        setLoading(true)
        const data = await fetchAllSales()
        setSales(data)
        setLoading(false)
    }

    useEffect(() => {
        load()
        // load products for selector
        supabase
            .from('products')
            .select('id, name, price, cover_image')
            .eq('is_active', true)
            .order('name')
            .then(({ data }) => setProducts(data || []))
    }, [])

    async function handleSave() {
        if (!form.product_id) return toast.error('Select a product')
        if (!form.sale_price) return toast.error('Enter the sale price')
        if (!form.ends_at) return toast.error('Set an end date/time')

        const selectedProduct = products.find(p => p.id === form.product_id)
        if (selectedProduct &&
            Number(form.sale_price) >= Number(selectedProduct.price)) {
            return toast.error('Sale price must be lower than original price')
        }

        setSaving(true)
        try {
            await createSale(form)
            toast.success('Flash sale created!')
            setShowModal(false)
            setForm(EMPTY_FORM)
            load()
        } catch (err) {
            toast.error(err.message)
        } finally {
            setSaving(false)
        }
    }

    async function handleToggle(sale) {
        try {
            await toggleSale(sale.id, sale.is_active)
            toast.success(sale.is_active ? 'Sale disabled' : 'Sale enabled')
            load()
        } catch (err) {
            toast.error(err.message)
        }
    }

    async function handleDelete(sale) {
        if (!window.confirm(`Delete "${sale.label}"?`)) return
        try {
            await deleteSale(sale.id)
            toast.success('Flash sale deleted')
            load()
        } catch (err) {
            toast.error(err.message)
        }
    }

    function isExpired(endsAt) {
        return new Date(endsAt) < new Date()
    }

    function formatDate(d) {
        return new Date(d).toLocaleDateString('en-NG', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
    }

    const selectedProduct = products.find(p => p.id === form.product_id)

    return (
        <AdminLayout>
            <div>

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-brand-charcoal">
                            Flash Sales
                        </h1>
                        <p className="text-neutral-slate text-sm mt-1">
                            Create time-limited deals to drive urgency
                        </p>
                    </div>
                    <button onClick={() => setShowModal(true)}
                        className="bg-primary hover:bg-primary-dark text-white px-5
                       py-2.5 rounded-lg font-semibold text-sm transition-all
                       hover:scale-[1.02]">
                        + New Flash Sale
                    </button>
                </div>

                {/* Engagement toggles */}
                <div className="bg-white rounded-xl p-6 shadow-sm border
                        border-gray-100 mb-6">
                    <h2 className="font-semibold text-brand-charcoal mb-4">
                        ⚙️ Engagement Features
                    </h2>
                    <div className="space-y-3">
                        {[
                            {
                                key: 'flash_sales_enabled', label: '⚡ Flash Sale Banner',
                                desc: 'Show flash sale banner on shop page'
                            },
                            {
                                key: 'scroll_offer_enabled', label: '🎁 Scroll-Triggered Offer',
                                desc: 'Show promo popup when user scrolls down'
                            },
                            {
                                key: 'social_proof_enabled', label: '👥 Social Proof Notifications',
                                desc: 'Show live activity notifications'
                            },
                        ].map(item => (
                            <div key={item.key}
                                className="flex items-center justify-between py-2
                              border-b border-gray-50 last:border-0">
                                <div>
                                    <p className="font-medium text-brand-charcoal text-sm">
                                        {item.label}
                                    </p>
                                    <p className="text-neutral-slate text-xs">{item.desc}</p>
                                </div>
                                <button
                                    onClick={() => updateSettings({
                                        [item.key]: !settings?.[item.key]
                                    })}
                                    className={`relative w-12 h-6 rounded-full transition-all
                    ${settings?.[item.key] !== false
                                            ? 'bg-primary'
                                            : 'bg-gray-200'
                                        }`}
                                >
                                    <div className={`absolute top-0.5 w-5 h-5 bg-white
                                   rounded-full shadow transition-all
                    ${settings?.[item.key] !== false
                                            ? 'left-6'
                                            : 'left-0.5'
                                        }`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sales Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    {loading ? (
                        <div className="p-8 space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i}
                                    className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : sales.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-4xl mb-3">⚡</p>
                            <p className="font-semibold text-brand-charcoal mb-1">
                                No flash sales yet
                            </p>
                            <p className="text-neutral-slate text-sm mb-6">
                                Create your first flash sale to drive urgency
                            </p>
                            <button onClick={() => setShowModal(true)}
                                className="bg-primary text-white px-6 py-2.5 rounded-lg
                           font-semibold text-sm">
                                + Create Flash Sale
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        {['Product', 'Label', 'Original', 'Sale Price',
                                            'Discount', 'Ends At', 'Status', 'Actions'].map(h => (
                                                <th key={h}
                                                    className="text-left px-6 py-4 text-xs font-bold
                                     text-neutral-slate uppercase tracking-wider">
                                                    {h}
                                                </th>
                                            ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {sales.map(sale => {
                                        const expired = isExpired(sale.ends_at)
                                        const original = Number(sale.products?.price || 0)
                                        const saleP = Number(sale.sale_price)
                                        const discountPct = original > 0
                                            ? Math.round(((original - saleP) / original) * 100)
                                            : 0

                                        return (
                                            <tr key={sale.id}
                                                className="hover:bg-gray-50 transition-colors">

                                                {/* Product */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg overflow-hidden
                                            bg-neutral-light shrink-0">
                                                            {sale.products?.cover_image ? (
                                                                <img src={sale.products.cover_image}
                                                                    alt={sale.products.name}
                                                                    className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center
                                                justify-center text-sm">📦</div>
                                                            )}
                                                        </div>
                                                        <p className="text-sm font-medium text-brand-charcoal
                                          max-w-[150px] truncate">
                                                            {sale.products?.name}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Label */}
                                                <td className="px-6 py-4">
                                                    <span className="bg-red-100 text-red-600 text-xs
                                           font-bold px-2 py-0.5 rounded-full">
                                                        {sale.label}
                                                    </span>
                                                </td>

                                                {/* Original */}
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-neutral-slate
                                           line-through">
                                                        ₦{original.toLocaleString()}
                                                    </span>
                                                </td>

                                                {/* Sale Price */}
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-primary">
                                                        ₦{saleP.toLocaleString()}
                                                    </span>
                                                </td>

                                                {/* Discount */}
                                                <td className="px-6 py-4">
                                                    <span className="bg-yellow-100 text-yellow-700
                                           text-xs font-bold px-2 py-0.5
                                           rounded-full">
                                                        -{discountPct}%
                                                    </span>
                                                </td>

                                                {/* Ends At */}
                                                <td className="px-6 py-4">
                                                    <span className={`text-sm
                            ${expired
                                                            ? 'text-red-500 font-medium'
                                                            : 'text-neutral-slate'
                                                        }`}>
                                                        {expired ? '❌ Expired' : formatDate(sale.ends_at)}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-full
                                            text-xs font-semibold
                            ${!expired && sale.is_active
                                                            ? 'bg-primary-light text-primary-dark'
                                                            : 'bg-gray-100 text-neutral-slate'
                                                        }`}>
                                                        {expired ? 'Expired' : sale.is_active ? 'Live' : 'Paused'}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {!expired && (
                                                            <button onClick={() => handleToggle(sale)}
                                                                className={`text-sm font-medium transition-colors
                                  ${sale.is_active
                                                                        ? 'text-amber-600 hover:text-amber-800'
                                                                        : 'text-primary hover:text-primary-dark'
                                                                    }`}>
                                                                {sale.is_active ? 'Pause' : 'Resume'}
                                                            </button>
                                                        )}
                                                        <button onClick={() => handleDelete(sale)}
                                                            className="text-red-500 hover:text-red-700
                                         text-sm font-medium transition-colors">
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center
                        justify-center px-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">

                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-brand-charcoal">
                                Create Flash Sale
                            </h2>
                            <button onClick={() => setShowModal(false)}
                                className="text-neutral-slate hover:text-brand-charcoal
                           text-xl transition-colors">
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">

                            {/* Product selector */}
                            <div>
                                <label className="block text-sm font-medium
                                  text-brand-charcoal mb-1">
                                    Product *
                                </label>
                                <select
                                    value={form.product_id}
                                    onChange={e => setForm({ ...form, product_id: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3
                             text-sm focus:outline-none focus:ring-2
                             focus:ring-primary bg-white"
                                >
                                    <option value="">Select a product...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} — ₦{Number(p.price).toLocaleString()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Sale Price */}
                            <div>
                                <label className="block text-sm font-medium
                                  text-brand-charcoal mb-1">
                                    Sale Price (₦) *
                                </label>
                                <input
                                    type="number" value={form.sale_price}
                                    onChange={e => setForm({ ...form, sale_price: e.target.value })}
                                    placeholder={selectedProduct
                                        ? `Less than ₦${Number(selectedProduct.price).toLocaleString()}`
                                        : 'Enter sale price'}
                                    min="1"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3
                             text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                {selectedProduct && form.sale_price && (
                                    <p className="text-xs text-primary mt-1 font-medium">
                                        {Math.round(((Number(selectedProduct.price) -
                                            Number(form.sale_price)) / Number(selectedProduct.price)) * 100)}% discount
                                    </p>
                                )}
                            </div>

                            {/* Label */}
                            <div>
                                <label className="block text-sm font-medium
                                  text-brand-charcoal mb-1">
                                    Label
                                </label>
                                <input
                                    type="text" value={form.label}
                                    onChange={e => setForm({ ...form, label: e.target.value })}
                                    placeholder="e.g. FLASH SALE, WEEKEND DEAL"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3
                             text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            {/* End time */}
                            <div>
                                <label className="block text-sm font-medium
                                  text-brand-charcoal mb-1">
                                    Ends At *
                                </label>
                                <input
                                    type="datetime-local" value={form.ends_at}
                                    onChange={e => setForm({ ...form, ends_at: e.target.value })}
                                    min={new Date().toISOString().slice(0, 16)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3
                             text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            {/* Preview */}
                            {selectedProduct && form.sale_price && form.ends_at && (
                                <div className="bg-gradient-to-r from-red-500 to-orange-400
                                rounded-xl p-4 text-white">
                                    <p className="text-xs font-bold opacity-80 mb-1">Preview</p>
                                    <p className="font-bold text-sm">{form.label}</p>
                                    <p className="text-sm opacity-90 truncate">
                                        {selectedProduct.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="line-through opacity-60 text-xs">
                                            ₦{Number(selectedProduct.price).toLocaleString()}
                                        </span>
                                        <span className="font-bold text-yellow-300">
                                            ₦{Number(form.sale_price).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            )}

                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowModal(false)}
                                className="flex-1 border border-gray-300 text-neutral-slate
                           py-3 rounded-xl font-semibold text-sm">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={saving}
                                className="flex-1 bg-primary hover:bg-primary-dark text-white
                           py-3 rounded-xl font-bold text-sm transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed">
                                {saving ? 'Creating...' : '⚡ Create Flash Sale'}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </AdminLayout>
    )
}