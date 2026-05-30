import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useFlashSales() {
    const [flashSales, setFlashSales] = useState([])
    const [loading, setLoading] = useState(true)

    async function fetchActiveSales() {
        const { data } = await supabase
            .from('flash_sales')
            .select('*, products(id, name, cover_image, slug, price, stock)')
            .eq('is_active', true)
            .gt('ends_at', new Date().toISOString())
            .order('created_at', { ascending: false })

        if (data) setFlashSales(data)
        setLoading(false)
    }

    async function fetchAllSales() {
        const { data, error } = await supabase
            .from('flash_sales')
            .select('*, products(id, name, cover_image, price)')
            .order('created_at', { ascending: false })
        if (error) throw error
        return data || []
    }

    async function createSale(form) {
        const { error } = await supabase
            .from('flash_sales')
            .insert({
                product_id: form.product_id,
                sale_price: Number(form.sale_price),
                label: form.label || 'FLASH SALE',
                starts_at: form.starts_at || new Date().toISOString(),
                ends_at: form.ends_at,
                is_active: true,
            })
        if (error) throw error
        await fetchActiveSales()
    }

    async function toggleSale(id, currentValue) {
        const { error } = await supabase
            .from('flash_sales')
            .update({ is_active: !currentValue })
            .eq('id', id)
        if (error) throw error
    }

    async function deleteSale(id) {
        const { error } = await supabase
            .from('flash_sales')
            .delete()
            .eq('id', id)
        if (error) throw error
    }

    useEffect(() => { fetchActiveSales() }, [])

    return {
        flashSales, loading,
        fetchActiveSales, fetchAllSales,
        createSale, toggleSale, deleteSale,
    }
}