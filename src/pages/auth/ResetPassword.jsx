import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import useSettings from '../../hooks/useSettings'
import toast from 'react-hot-toast'

const ResetPassword = () => {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const { settings } = useSettings()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            return toast.error('Passwords do not match')
        }

        if (password.length < 6) {
            return toast.error('Password must be at least 6 characters')
        }

        

        setLoading(true)

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            toast.success('Password updated successfully!')
            // After success, send them to login or dashboard
            navigate('/login')
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-neutral-light flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-primary">
                        {settings?.store_name || 'Innovators'}
                    </h1>
                    <p className="text-neutral-slate mt-1 text-sm">Create a new password</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-brand-charcoal mb-1">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm
                                     focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brand-charcoal mb-1">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm
                                     focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-semibold
                                 py-3 rounded-lg transition-all duration-200 hover:scale-[1.02]
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ResetPassword