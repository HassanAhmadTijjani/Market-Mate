// @ts-nocheck

import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import useSettings from '../../hooks/useSettings'



const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const linkClass = ({ isActive }) => isActive ? 'bg-blue-600 text-white px-3 py-2 rounded-sm font-bold' : 'text-slate-200 px-3 py-2 rounded-sm hover:bg-blue-600/20'
    const { user, profile, logout } = useAuth()
    const { cartCount } = useCart()
    const { settings } = useSettings()
    const navigate = useNavigate()


    return (
        <nav className='bg-slate-950/95  border-b border-white/5 sticky top-0 z-50 text-white'>
            <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">

                <div className="flex items-center gap-2">
                    {settings?.logo_url ? (
                        <img
                            src={settings.logo_url}
                            alt="Store Logo"
                            className="h-10 w-10 object-cover rounded-xl"
                        />
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-primary" />
                    )}

                    <h1 className="font-bold text-xl">
                        {settings?.store_name || 'MarketMate'}
                    </h1>
                </div>

                <div className='hidden md:flex gap-6'>
                    <NavLink to='/' className={linkClass}>Home</NavLink>
                    <NavLink to='/shop' className={linkClass}>Shop</NavLink>
                    <NavLink to='/about' className={linkClass}>About</NavLink>
                    {/* Users orders*/}
                    {user && profile?.role === 'customer' && (
                        <NavLink to='/orders' className={linkClass}>
                            My Orders
                        </NavLink>
                    )}
                    {/* Cart Icon — only show for logged in customers */}
                    {user && profile?.role === 'customer' && (
                        <Link to="/cart" className="relative">
                            <span className="text-2xl">🛒</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-primary text-white
                       text-xs font-bold w-5 h-5 rounded-full flex
                       items-center justify-center">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Link>
                    )}


                    {/* Profile Avatar — customer only */}
                    {user && profile?.role === 'customer' && (
                        <button
                            onClick={() => navigate('/profile')}
                            className="w-9 h-9 rounded-full overflow-hidden border-2
               border-primary/20 hover:border-primary transition-all
               shrink-0"
                            title="My Profile"
                        >
                            {profile?.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-linear-to-br from-primary
                      to-blue-400 flex items-center justify-center">
                                    <span className="text-white font-bold text-xs">
                                        {(profile?.full_name || user?.email || 'U')
                                            .split(' ')
                                            .map(w => w[0])
                                            .join('')
                                            .toUpperCase()
                                            .slice(0, 2)}
                                    </span>
                                </div>
                            )}
                        </button>
                    )}

                    {user ? (<div>
                        <span>Hi, {profile?.full_name} </span>
                        <button onClick={logout} className='bg-amber-800 p-2 rounded'>Logout</button>
                    </div>) : (
                        <Link to="/login" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-semibold transition-all">
                            Login
                        </Link>
                    )}
                </div>

                <button
                    className="md:hidden text-2xl"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? 'X' : '☰'}
                </button>
            </div>

            {/* Mobile Menu */}
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50  z-40"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            {/* Drawer Menu */}
            <div className={`fixed top-0 right-0 h-full w-64 bg-[#0d0d0d]/80  z-50 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`} >
                <div className="px-6 py-4 flex flex-col gap-6">

                    {/* Close button */}
                    <button
                        className="text-2xl self-end"
                        onClick={() => setIsOpen(false)}
                    >
                        ✕
                    </button>

                    {/* Links */}
                    <NavLink to='/' className={linkClass} onClick={() => setIsOpen(false)}>Home</NavLink>
                    <NavLink to='/shop' className={linkClass} onClick={() => setIsOpen(false)}>Shop</NavLink>
                    {/* Mobile Users Orders*/}
                    {user && profile?.role === 'customer' && (
                        <NavLink
                            to='/orders'
                            className={linkClass}
                            onClick={() => setIsOpen(false)}
                        >
                            My Orders
                        </NavLink>
                    )}
                    <NavLink to='/about' className={linkClass} onClick={() => setIsOpen(false)}>About</NavLink>
                    {/* Cart Icon Mobile */}
                    {user && profile?.role === 'customer' && (
                        <NavLink
                            to='/cart'
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 text-white px-3 py-2"
                        >
                            <span className="relative">
                                🛒
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-primary text-white
                         text-xs font-bold w-5 h-5 rounded-full flex
                         items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </span>
                            <span>Cart ({cartCount})</span>
                        </NavLink>
                    )}

                    {/* Mobile — Profile link */}
                    {/* {user && profile?.role === 'customer' && (
                        <NavLink
                            to='/profile'
                            className={linkClass}
                            onClick={() => setIsOpen(false)}
                        >
                            👤 My Profile
                        </NavLink>
                    )} */}
                    {/* Profile Avatar — customer only */}
                    <div className='flex items-center gap-2 '>

                   <h2>Settings</h2>

                    {user && profile?.role === 'customer' && (
                        <button
                            onClick={() => navigate('/profile')}
                            className="w-10 h-10 rounded-full overflow-hidden border
               border-primary/20 hover:border-primary transition-all
               shrink-0"
                            title="My Profile"
                        > 
                            {profile?.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    /> 
                                    
                            ) : (
                                <div className="w-full h-full bg-linear-to-br from-primary
                      to-blue-400 flex items-center justify-center">
                                    <span className="text-white font-bold text-xs">
                                        {(profile?.full_name || user?.email || 'U')
                                            .split(' ')
                                            .map(w => w[0])
                                            .join('')
                                            .toUpperCase()
                                            .slice(0, 2)}
                                    </span>
                                </div>
                            )}
                        </button>
                    )}
                    </div>
                    {user ? (<div>
                        <span>Hi, {profile?.full_name} </span>
                        <button onClick={logout} className='bg-amber-800 p-2 rounded'>Logout</button>
                    </div>) : (
                        <div>
                            <a href="/login">Login</a>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile menu OUTSIDE */}
            {/* <div className={`md:hidden px-6 transition-all duration-300 ${isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                }`}>
                <div className="flex flex-col gap-4 py-4 ">
                    <NavLink to='/' className={linkClass}>Home</NavLink>
                    <NavLink to='/shop' className={linkClass}>Shop</NavLink>
                    <NavLink to='/about' className={linkClass}>About</NavLink>
                </div>
            </div> */}
        </nav>
    )
}

export default Navbar