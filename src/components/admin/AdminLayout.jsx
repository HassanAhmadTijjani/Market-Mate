// @ts-nocheck
import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import useSettings from '../../hooks/useSettings'

const AdminLayout = ({ children }) => {
    const navItems = [
        { label: 'Dashboard', to: '/admin', icon: '📊', superOnly: false },
        { label: 'Products', to: '/admin/products', icon: '📦', superOnly: false },
        { label: 'Orders', to: '/admin/orders', icon: '🛒', superOnly: false },
        { label: 'Customers', to: '/admin/customers', icon: '👥', superOnly: true },
        { label: 'Staff', to: '/admin/staff', icon: '👨‍💼', superOnly: true },
        { label: 'Promo Codes', to: '/admin/promos', icon: '🎟️', superOnly: false },
        // { label: 'Analytics', to: '/admin/analytics', icon: '📈', superOnly: true },
        { label: 'Settings', to: '/admin/settings', icon: '⚙️', superOnly: true },
        { label: 'Reviews', to: '/admin/reviews', icon: '⭐', superOnly: false },
        { label: 'Flash Sales', to: '/admin/flash-sales', icon: '⚡', superOnly: false },

      ]
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { profile, logout } = useAuth()
    const navigate = useNavigate()
    const { settings } = useSettings()
    const isSuperAdmin = profile?.role === 'super_admin'
    // filter nav items based on role
    const visibleNavItems = navItems.filter(
        item => !item.superOnly || isSuperAdmin
    )

    // Logout
    const handleLogout = async () => {
        const confirmed = window.confirm("Are you sure you want to logout?")
        if (!confirmed) return
        await logout()
        navigate('/login')
    }

    // Active link
    const linkClass = ({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-primary text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`

    return (
        <div className="h-screen bg-neutral-light flex overflow-hidden">
            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`text-white
  fixed top-0 left-0 h-screen w-60 bg-brand-black z-30
  flex flex-col
  ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
  lg:translate-x-0
`}
            >
                {/* Logo */}
                <div className="px-6 py-5 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-primary flex items-center
                            justify-center text-white font-bold text-xs">
                            MH
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm leading-none">{settings?.store_name}</p>
                            <p className="text-primary text-xs mt-0.5">
                                {isSuperAdmin ? 'Super Admin' : 'Admin'} Panel
                            </p>                        </div>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto scrollbar-thin">                    <p className="text-gray-600 text-xs font-bold uppercase tracking-widest
                      px-4 mb-2">
                    Management
                </p>
                    {visibleNavItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/admin'}
                            className={linkClass}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* User Info + Logout */}
                <div className="px-4 py-4 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center
                            justify-center text-white font-bold text-xs">
                            {profile?.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-white text-xs font-semibold leading-none">
                                {profile?.full_name}
                            </p>
                            <p className="text-gray-500 text-xs mt-0.5">{profile?.role?.replace('_', ' ')}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full text-left text-gray-400 hover:text-red-400
                       text-sm px-2 py-1 transition-colors"
                    >
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="ml-0 md:ml-60 flex-1 flex flex-col min-w-0">

                {/* Top bar — mobile only */}
                <header className="bg-white border-b border-gray-200 px-4 py-3
                       flex items-center gap-4 lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-xl text-gray-600"
                    >
                        ☰
                    </button>
                    <p className="font-bold text-brand-charcoal">{settings?.store_name} Admin</p>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
export default AdminLayout