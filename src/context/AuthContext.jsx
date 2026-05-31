// @ts-nocheck

// importing 4 tools fromreact. 1. createContext — creates a "container" that can hold data and share it with any component in the app, 2. useContext — lets any component reach into that container and grab the data, 3. useEffect — runs code when the component first loads or when something changes, 4. useState — creates a variable that when it changes, React re - renders the page automaticall
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    // Fetch Profile from DB
    const fetchProfile = async (userId) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error || !data) {
            // profile missing — session is broken, sign out automatically
            await supabase.auth.signOut()
            setUser(null)
            setProfile(null)
            setLoading(false)
            return
        }

        setProfile(data)
        setLoading(false)
    }

    // Function that runs every time the app reloads to check logged in user
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)  //if session exist fetch the user, if the result is undefined use null instead of crashing
            if (session?.user) fetchProfile(session.user.id)    //if there IS a logged-in user, immediately fetch their profile to get their role
            setLoading(false)
        })

        // if a login or logout happens this run automatically
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setUser(session?.user ?? null)
                if (session?.user) {
                    fetchProfile(session.user.id)
                } else {
                    setProfile(null)
                }
                setLoading(false)
            }
        )
        return () => subscription.unsubscribe()
    }, [])

    // Creating a new User
    const register = async (fullName, email, password, referralCode) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    referral_code: referralCode
                },
                emailRedirectTo: `${window.location.origin}/login`
            }
        })

        if (error) throw error

        if (data?.user && !data?.session) {
            toast.success('Confirm! We have sent you a message to your email to confirm your account.', {
                duration: 6000,
            })
        } else if (data?.session) {
            toast.success('Registration successful!')
        }

        return data
        // don't navigate here — let onAuthStateChange handle it
    }

    // Loginauthentication
    const login = async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (!error) {
            toast.success('Sign in Successfull')
        }
        if (error) throw error
    }

    // Log out function
    const logout = async () => {
        const { error } = await supabase.auth.signOut()
        if (!error) toast.success('Logged out successfully')
        if (error) throw error
    }

    async function refreshProfile() {
        if (!user) return
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
        if (data) setProfile(data)
    }

    // packing all into one object, so any component in the app can eccess all of this
    const value = { user, profile, loading, refreshProfile, register, login, logout }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}  {/*only render the children when loading is falls. it prevents the app from showing even a blink of any page before knowing weather the user is logged in or not*/}
        </AuthContext.Provider>
    )
}
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext)
}