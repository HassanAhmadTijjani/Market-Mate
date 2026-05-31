// @ts-nocheck
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useReferral } from '../../hooks/useReferral'
import useSettings from '../../hooks/useSettings'

const Register = () => {
    const { register } = useAuth()
    const navigate = useNavigate()
    const { settings } = useSettings()
    const [searchParams] = useSearchParams()
    const { handleSignupWithReferral } = useReferral()

    // ✅ read ref code from URL e.g. /register?ref=CHIDI4821
    const refCode = searchParams.get('ref') || ''

    const [form, setForm] = useState({
        fullName: '', email: '', password: '', confirm: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    // ✅ single submit handler — referral logic integrated here
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (form.password !== form.confirm) {
            return setError('Passwords do not match')
        }
        if (form.password.length < 6) {
            return setError('Password must be at least 6 characters')
        }

        setLoading(true)
        try {
            // 1. create the auth user via AuthContext
            const data = await register(form.fullName, form.email, form.password, refCode)

            // 3. navigate — if email confirmation required go to login
            if (data?.user && !data?.session) {
                navigate('/login')
            }
            // otherwise AuthContext + App.jsx handles the redirect

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-neutral-light flex items-center
                    justify-center px-4">
            <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-primary">
                        {settings?.store_name}
                    </h1>
                    <p className="text-neutral-slate mt-1 text-sm">
                        Create your account
                    </p>
                </div>

                {/* ✅ Referral badge — INSIDE the white card, above the form */}
                {refCode && (
                    <div className="bg-primary-light border border-primary/20
                          rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
                        <span className="text-2xl">🎁</span>
                        <div>
                            <p className="text-primary-dark font-semibold text-sm">
                                You were referred by a friend!
                            </p>
                            <p className="text-primary text-xs mt-0.5">
                                Sign up and place your first order to unlock exclusive rewards
                            </p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600
                          text-sm rounded-lg px-4 py-3 mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                        <label className="block text-sm font-medium text-brand-charcoal mb-1">
                            Full Name
                        </label>
                        <input type="text" name="fullName" value={form.fullName}
                            onChange={handleChange} placeholder="Enter your full name" required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3
                         text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brand-charcoal mb-1">
                            Email Address
                        </label>
                        <input type="email" name="email" value={form.email}
                            onChange={handleChange} placeholder="Enter your email" required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3
                         text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brand-charcoal mb-1">
                            Password
                        </label>
                        <input type="password" name="password" value={form.password}
                            onChange={handleChange} placeholder="Minimum 6 characters" required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3
                         text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brand-charcoal mb-1">
                            Confirm Password
                        </label>
                        <input type="password" name="confirm" value={form.confirm}
                            onChange={handleChange} placeholder="Re-enter your password" required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3
                         text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full bg-primary hover:bg-primary-dark text-white
                       font-semibold py-3 rounded-lg transition-all duration-200
                       hover:scale-[1.02] disabled:opacity-50
                       disabled:cursor-not-allowed">
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>

                </form>

                <p className="text-center text-sm text-neutral-slate mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary font-semibold hover:underline">
                        Login
                    </Link>
                </p>

            </div>
        </div>
    )
}

export default Register