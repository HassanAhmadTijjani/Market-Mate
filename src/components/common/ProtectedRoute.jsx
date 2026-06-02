// @ts-nocheck
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, profile, loading } = useAuth()
    const location = useLocation()

    // still checking auth — show nothing yet
    if (loading) return (
        <div className="min-h-screen bg-neutral-light flex items-center justify-center">
            <p className="text-primary font-semibold text-lg">Loading...</p>
        </div>
    )

    // not logged in
    if (!user) return <Navigate to="/login" state={{from: location}} replace />

    
    // check if account is active
    // if (profile && profile.is_active === false) {
    //     return <Navigate to="/login" replace />
    // }
    if (!profile) {
        return (
            <div className="min-h-screen bg-neutral-light flex items-center justify-center">
                <p className="text-primary font-semibold text-lg">
                    Loading...
                </p>
            </div>
        )
    }
    if (profile.is_active === false) {
        supabase.auth.signOut()

        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-light">
                <div className="bg-white p-8 rounded-xl shadow-md text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-3">
                        Account Deactivated
                    </h2>

                    <p className="text-neutral-slate">
                        Your account has been deactivated.
                        Please contact the administrator.
                    </p>
                </div>
            </div>
        )
    }

    // logged in but wrong role
    if (allowedRoles && !allowedRoles.includes(profile?.role)) {
        if (profile?.role === 'super_admin') return <Navigate to="/admin" replace />
        if (profile?.role === 'admin') return <Navigate to="/admin" replace />
        if (profile?.role === 'staff') return <Navigate to="/staff" replace />
        return <Navigate to="/" replace />
    }

    return children
}