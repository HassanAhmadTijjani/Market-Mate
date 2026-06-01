// @ts-nocheck
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import useSettings from './useSettings'
import { useQuery } from '@tanstack/react-query'

const usePublicProducts = () => {
    const [filters, setFilters] = useState({})
    const { settings } = useSettings()
    const dailySeed = new Date().toISOString().split('T')[0]

    // 1. Core Fetching Logic
    const { data: products = [], isLoading: loading } = useQuery({
        queryKey: ['public-products', settings?.randomize_products, filters, dailySeed],
        queryFn: async () => {
            let query;
            const isFiltering = filters.search || filters.category_id || filters.min_price || filters.max_price;

            if (settings?.randomize_products && !isFiltering) {
                query = supabase.rpc('get_randomized_products', { p_seed: dailySeed, p_limit: 50 })
            } else {
                query = supabase.from('products').select('*, categories(id, name)').eq('is_active', true).order('created_at', { ascending: false })
            }

            if (filters.search) query = query.ilike('name', `%${filters.search}%`)
            if (filters.category_id) query = query.eq('category_id', filters.category_id)
            if (filters.min_price) query = query.gte('price', filters.min_price)
            if (filters.max_price) query = query.lte('price', filters.max_price)

            const { data, error } = await query
            if (error) throw error

            // Review stats logic...
            const productIds = data?.map(p => p.id) || []
            if (productIds.length === 0) return []

            const { data: reviewData } = await supabase.from('reviews').select('product_id, rating').in('product_id', productIds).eq('is_approved', true)

            const ratingMap = {}
            reviewData?.forEach(r => {
                if (!ratingMap[r.product_id]) ratingMap[r.product_id] = { sum: 0, count: 0 }
                ratingMap[r.product_id].sum += r.rating
                ratingMap[r.product_id].count += 1
            })

            return data.map(p => ({
                ...p,
                avg_rating: ratingMap[p.id] ? Math.round((ratingMap[p.id].sum / ratingMap[p.id].count) * 10) / 10 : null,
                review_count: ratingMap[p.id]?.count || 0,
            }))
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 mins
        enabled: !!settings, // Don't fetch until settings are loaded
    })

    // 2. Categories Fetch
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data, error } = await supabase.from('categories').select('*').order('name')
            if (error) throw error
            return data
        }
    })

    async function fetchProductBySlug(slug) {
        const { data, error } = await supabase
            .from('products')
            .select('*, categories(id, name)')
            .eq('slug', slug)
            .eq('is_active', true)
            .single()
        if (error) throw error
        return data
    }

    return {
        products,
        loading,
        categories,
        fetchProducts: setFilters, // Updating filters triggers a re-fetch
        fetchProductBySlug,
    }
}

export default usePublicProducts