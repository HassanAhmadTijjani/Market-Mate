// @ts-nocheck
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/common/Layout'
import { useAuth } from '../../context/AuthContext'
import useSettings from '../../hooks/useSettings'  // ✅ only once
import useProfile from '../../hooks/useProfile'
import { useReferral } from '../../hooks/useReferral'
import toast from 'react-hot-toast'

export default function Profile() {
    const { user, profile, refreshProfile } = useAuth()
    const { saving, uploading, updateProfile,
        uploadAvatar, fetchOrderStats } = useProfile()
    const { settings } = useSettings() // ✅ only once
    const { fetchMyReferrals, fetchMyRewards } = useReferral()
    const navigate = useNavigate()
    const fileInputRef = useRef(null)

    const [form, setForm] = useState({ full_name: '', phone: '' })
    const [avatarPreview, setAvatarPreview] = useState(null)
    const [stats, setStats] = useState({ count: 0, totalSpent: 0 })
    const [referrals, setReferrals] = useState([])
    const [rewards, setRewards] = useState([])
    const [copied, setCopied] = useState(false)

    const currency = settings?.currency_symbol || '₦'

    useEffect(() => {
        if (profile) {
            setForm({
                full_name: profile.full_name || '',
                phone: profile.phone || '',
            })
            if (profile.avatar_url) setAvatarPreview(profile.avatar_url)
        }
    }, [profile])

    useEffect(() => {
        fetchOrderStats().then(setStats)
    }, [])

    useEffect(() => {
        if (!user) return
        fetchMyReferrals(user.id).then(setReferrals)
        fetchMyRewards(user.id).then(setRewards)
    }, [user])

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function handleAvatarChange(e) {
        const file = e.target.files[0]
        if (!file) return
        setAvatarPreview(URL.createObjectURL(file))
        try {
            const url = await uploadAvatar(file)
            setAvatarPreview(url)
            toast.success('Profile photo updated!')
        } catch (err) {
            toast.error('Failed to upload photo')
        }
    }

    async function handleSave(e) {
        e.preventDefault()
        if (!form.full_name.trim()) return toast.error('Name cannot be empty')
        try {
            await updateProfile(form)
            await refreshProfile()
            toast.success('Profile updated successfully!')
        } catch (err) {
            toast.error('Failed to update profile')
        }
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-NG', {
            day: 'numeric', month: 'long', year: 'numeric'
        })
    }

    const initials = (profile?.full_name || user?.email || 'U')
        .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

    return (
        <Layout>
            {/* ✅ Everything inside one container */}
            <div className="max-w-2xl mx-auto px-6 py-10">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-brand-charcoal">My Profile</h1>
                    <p className="text-neutral-slate text-sm mt-1">
                        Manage your account information
                    </p>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">

                    {/* Avatar */}
                    <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                        <div className="relative shrink-0">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-primary/20">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Profile"
                                        className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary
                                  to-green-400 flex items-center justify-center">
                                        <span className="text-white font-bold text-2xl">{initials}</span>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary
                           hover:bg-primary-dark text-white rounded-full
                           flex items-center justify-center text-sm
                           transition-all shadow-lg disabled:opacity-50">
                                {uploading ? '⏳' : '📷'}
                            </button>
                            <input ref={fileInputRef} type="file" accept="image/*"
                                onChange={handleAvatarChange} className="hidden" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-bold text-brand-charcoal truncate">
                                {profile?.full_name || 'Customer'}
                            </h2>
                            <p className="text-neutral-slate text-sm mt-0.5 truncate">
                                {user?.email}
                            </p>
                            {profile?.created_at && (
                                <p className="text-neutral-slate text-xs mt-1">
                                    Member since {formatDate(profile.created_at)}
                                </p>
                            )}
                            <button onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="text-primary text-xs font-semibold mt-2
                           hover:underline transition-colors">
                                {uploading ? 'Uploading...' : 'Change profile photo'}
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-8 pb-8 border-b border-gray-100">
                        <div className="bg-primary-light rounded-xl p-4 text-center">
                            <p className="text-2xl font-extrabold text-primary">{stats.count}</p>
                            <p className="text-primary-dark text-xs font-medium mt-0.5">Total Orders</p>
                        </div>
                        <div className="bg-primary-light rounded-xl p-4 text-center">
                            <p className="text-2xl font-extrabold text-primary">
                                {currency}{stats.totalSpent.toLocaleString()}
                            </p>
                            <p className="text-primary-dark text-xs font-medium mt-0.5">Total Spent</p>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <form onSubmit={handleSave} className="space-y-5">
                        <h3 className="font-semibold text-brand-charcoal">Personal Information</h3>

                        <div>
                            <label className="block text-sm font-medium text-brand-charcoal mb-1">
                                Full Name *
                            </label>
                            <input type="text" name="full_name" value={form.full_name}
                                onChange={handleChange} placeholder="Enter your full name"
                                className="w-full border border-gray-300 rounded-xl px-4 py-3
                           text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-brand-charcoal mb-1">
                                Phone Number
                            </label>
                            <input type="tel" name="phone" value={form.phone}
                                onChange={handleChange} placeholder="e.g. 08012345678"
                                className="w-full border border-gray-300 rounded-xl px-4 py-3
                           text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-brand-charcoal mb-1">
                                Email Address
                            </label>
                            <input type="email" value={user?.email || ''} disabled
                                className="w-full border border-gray-200 rounded-xl px-4 py-3
                           text-sm bg-neutral-light text-neutral-slate
                           cursor-not-allowed" />
                            <p className="text-xs text-neutral-slate mt-1">Email cannot be changed</p>
                        </div>

                        <button type="submit" disabled={saving}
                            className="w-full bg-primary hover:bg-primary-dark text-white py-3.5
                         rounded-xl font-bold text-sm transition-all hover:scale-[1.01]
                         disabled:opacity-50 disabled:cursor-not-allowed">
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h3 className="font-semibold text-brand-charcoal mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        {[
                            { icon: '📦', label: 'My Orders', desc: 'View and track your orders', path: '/orders' },
                            { icon: '🛒', label: 'Continue Shopping', desc: 'Browse our latest products', path: '/shop' },
                        ].map(item => (
                            <button key={item.path} onClick={() => navigate(item.path)}
                                className="w-full flex items-center gap-4 p-4 rounded-xl border
                           border-gray-100 hover:border-primary hover:bg-primary-light
                           transition-all text-left group">
                                <span className="text-2xl">{item.icon}</span>
                                <div>
                                    <p className="font-semibold text-brand-charcoal text-sm
                                group-hover:text-primary transition-colors">
                                        {item.label}
                                    </p>
                                    <p className="text-neutral-slate text-xs mt-0.5">{item.desc}</p>
                                </div>
                                <span className="ml-auto text-neutral-slate
                                 group-hover:text-primary transition-colors">→</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ✅ Referral Section — INSIDE max-w-2xl container */}
                {settings?.referral_enabled && profile?.referral_code && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-primary-light rounded-xl flex
                              items-center justify-center text-xl">🔗</div>
                            <div>
                                <h3 className="font-bold text-brand-charcoal">Referral Program</h3>
                                <p className="text-neutral-slate text-xs mt-0.5">
                                    Invite friends and earn rewards
                                </p>
                            </div>
                        </div>

                        {/* How it works */}
                        <div className="bg-neutral-light rounded-xl p-4 mb-6">
                            <p className="text-xs font-bold text-neutral-slate uppercase
                            tracking-wider mb-3">
                                How it works
                            </p>
                            <div className="space-y-2">
                                {[
                                    { step: '1', text: 'Share your referral link with friends' },
                                    { step: '2', text: 'Friend signs up and places first order' },
                                    { step: '3', text: 'You earn a reward automatically' },
                                ].map(item => (
                                    <div key={item.step} className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-primary text-white rounded-full
                                    flex items-center justify-center text-xs
                                    font-bold shrink-0">
                                            {item.step}
                                        </div>
                                        <p className="text-sm text-brand-charcoal">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Referral Link */}
                        <div className="mb-6">
                            <p className="text-sm font-medium text-brand-charcoal mb-2">
                                Your Referral Link
                            </p>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-neutral-light rounded-xl px-4 py-3
                                text-xs text-neutral-slate font-mono truncate
                                border border-gray-200">
                                    {`${window.location.origin}/register?ref=${profile.referral_code}`}
                                </div>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            `${window.location.origin}/register?ref=${profile.referral_code}`
                                        )
                                        setCopied(true)
                                        setTimeout(() => setCopied(false), 2000)
                                    }}
                                    className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold
                               transition-all
                    ${copied
                                            ? 'bg-primary text-white'
                                            : 'bg-primary-light text-primary hover:bg-primary hover:text-white'
                                        }`}>
                                    {copied ? '✅ Copied!' : 'Copy'}
                                </button>
                            </div>

                            <a href={`https://wa.me/?text=${encodeURIComponent(
                                `Hey! Shop at ${settings?.store_name || 'our store'} and get great deals. Use my referral link: ${window.location.origin}/register?ref=${profile.referral_code}`
                            )}`}
                                target="_blank" rel="noopener noreferrer"
                                className="mt-3 w-full flex items-center justify-center gap-2
                           bg-green-500 hover:bg-green-600 text-white py-3
                           rounded-xl font-bold text-sm transition-all hover:scale-[1.01]">
                                💬 Share on WhatsApp
                            </a>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-primary-light rounded-xl p-4 text-center">
                                <p className="text-2xl font-extrabold text-primary">
                                    {referrals.length}
                                </p>
                                <p className="text-primary-dark text-xs font-medium mt-0.5">
                                    Friends Referred
                                </p>
                            </div>
                            <div className="bg-primary-light rounded-xl p-4 text-center">
                                <p className="text-2xl font-extrabold text-primary">
                                    {referrals.filter(r => r.status === 'rewarded').length}
                                </p>
                                <p className="text-primary-dark text-xs font-medium mt-0.5">
                                    Rewards Earned
                                </p>
                            </div>
                        </div>

                        {/* Reward Codes */}
                        {rewards.length > 0 && (
                            <div className="mb-6">
                                <p className="text-sm font-semibold text-brand-charcoal mb-3">
                                    🎁 Your Reward Codes
                                </p>
                                <div className="space-y-3">
                                    {rewards.map(reward => {
                                        const isUsed = reward.used_count >= 1
                                        const isExpired = reward.expires_at &&
                                            new Date(reward.expires_at) < new Date()
                                        return (
                                            <div key={reward.id}
                                                className={`flex items-center justify-between
                                       rounded-xl p-3 border
                             ${isUsed || isExpired
                                                        ? 'bg-gray-50 border-gray-200'
                                                        : 'bg-primary-light border-primary/20'
                                                    }`}>
                                                <div>
                                                    <p className={`font-mono font-bold tracking-wider text-sm
                              ${isUsed || isExpired
                                                            ? 'text-neutral-slate line-through'
                                                            : 'text-primary'
                                                        }`}>
                                                        {reward.code}
                                                    </p>
                                                    <p className="text-xs text-neutral-slate mt-0.5">
                                                        {reward.discount_type === 'free_delivery'
                                                            ? 'Free Delivery'
                                                            : reward.discount_type === 'percentage'
                                                                ? `${reward.discount_value}% off`
                                                                : `₦${Number(reward.discount_value).toLocaleString()} off`
                                                        }
                                                        {reward.expires_at && !isExpired && (
                                                            <span className="ml-2">
                                                                · Expires {new Date(reward.expires_at)
                                                                    .toLocaleDateString('en-NG', {
                                                                        day: 'numeric', month: 'short'
                                                                    })}
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                            ${isUsed
                                                        ? 'bg-gray-200 text-neutral-slate'
                                                        : isExpired
                                                            ? 'bg-red-100 text-red-500'
                                                            : 'bg-primary text-white'
                                                    }`}>
                                                    {isUsed ? 'Used' : isExpired ? 'Expired' : 'Active'}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Friends referred */}
                        {referrals.length > 0 && (
                            <div>
                                <p className="text-sm font-semibold text-brand-charcoal mb-3">
                                    👥 Friends You Referred
                                </p>
                                <div className="space-y-2">
                                    {referrals.map(ref => (
                                        <div key={ref.id}
                                            className="flex items-center justify-between py-2
                                    border-b border-gray-50 last:border-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-neutral-light rounded-full
                                        flex items-center justify-center text-sm
                                        font-bold text-neutral-slate">
                                                    {(ref.referred?.full_name || 'A').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-brand-charcoal">
                                                        {ref.referred?.full_name || 'New Customer'}
                                                    </p>
                                                    <p className="text-xs text-neutral-slate">
                                                        Joined {new Date(ref.created_at).toLocaleDateString('en-NG', {
                                                            day: 'numeric', month: 'short', year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`text-xs font-semibold px-2 py-0.5
                                        rounded-full capitalize
                          ${ref.status === 'rewarded'
                                                    ? 'bg-primary-light text-primary-dark'
                                                    : ref.status === 'completed'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {ref.status === 'rewarded' ? '✅ Rewarded'
                                                    : ref.status === 'completed' ? '🔵 Completed'
                                                        : '⏳ Pending'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                )}

            </div>
        </Layout>
    )
}