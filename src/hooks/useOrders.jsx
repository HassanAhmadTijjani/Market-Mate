/* eslint-disable react-hooks/set-state-in-effect */
// @ts-nocheck
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { sendEmail } from '../utils/sendEmail'
import { useReferral } from './useReferral'


export function useOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { processReferralReward } = useReferral()


    const fetchOrders = useCallback(async (statusFilter = '') => {
        setLoading(true)
        let query = supabase
            .from('orders')
            .select(`*, order_items (id, name, price, quantity, subtotal)`)
            .order('created_at', { ascending: false })

        if (statusFilter) query = query.eq('status', statusFilter)

        const { data, error } = await query
        if (error) setError(error.message)
        else setOrders(data)
        setLoading(false)
    }, [])

    const fetchOrderById = useCallback(async (id) => {
        const { data, error } = await supabase
            .from('orders')
            .select(`
            *,
            order_items (
              id, name, price, quantity, subtotal,
              selected_color,
              product_id,
              products (cover_image, slug)
            )
          `)
            .eq('id', id)
            .single()
        if (error) throw error
        return data
      }, [])

    async function updateOrderStatus(orderId, newStatus, customerId) {
        const { error } = await supabase
            .from('orders')
            .update({
                status: newStatus,
                updated_at: new Date().toISOString(),
            })
            .eq('id', orderId)

        if (error) throw error

        // ✅ trigger referral reward when order delivered
        if (newStatus === 'delivered' && customerId) {
            await processReferralReward(customerId)
        }

        // send email notification
        await sendEmail('order_status_update', {
            order: { id: orderId, status: newStatus }
        })
      }

    useEffect(() => { fetchOrders() }, [fetchOrders])

    return { orders, loading, error, fetchOrders, fetchOrderById, updateOrderStatus }
}