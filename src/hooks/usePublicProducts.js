// @ts-nocheck
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const usePublicProducts = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [categories, setCategories] = useState([])

    async function fetchProducts(filters = {}) {
        setLoading(true)

        let query = supabase
            .from('products')
            .select('*, categories(id, name)')
            .eq('is_active', true)
            .order('created_at', { ascending: false })

        if (filters.search) query = query.ilike('name', `%${filters.search}%`)
        if (filters.category_id) query = query.eq('category_id', filters.category_id)
        if (filters.min_price) query = query.gte('price', filters.min_price)
        if (filters.max_price) query = query.lte('price', filters.max_price)

        const { data, error } = await query

        if (!error && data) {
            // fetch review stats for all products in one query
            const productIds = data.map(p => p.id)
            let reviewData = []
            if (productIds.length > 0) {
                const { data: fetchedReviews } = await supabase
                    .from('reviews')
                    .select('product_id, rating')
                    .in('product_id', productIds)
                    .eq('is_approved', true)
                if (fetchedReviews) reviewData = fetchedReviews
            }

            // calculate avg rating per product
            const ratingMap = {}
            if (reviewData) {
                reviewData.forEach(r => {
                    if (!ratingMap[r.product_id]) {
                        ratingMap[r.product_id] = { sum: 0, count: 0 }
                    }
                    ratingMap[r.product_id].sum += r.rating
                    ratingMap[r.product_id].count += 1
                })
            }

            // enrich products with rating data
            const enriched = data.map(p => ({
                ...p,
                avg_rating: ratingMap[p.id]
                    ? Math.round((ratingMap[p.id].sum / ratingMap[p.id].count) * 10) / 10
                    : null,
                review_count: ratingMap[p.id]?.count || 0,
            }))

            setProducts(enriched)
        }
        setLoading(false)
    }

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

    async function fetchCategories() {
        const { data } = await supabase
            .from('categories')
            .select('*')
            .order('name')
        if (data) setCategories(data)
    }

    useEffect(() => {
        fetchProducts()
        fetchCategories()
    }, [])

    return {
        products, loading, categories,
        fetchProducts, fetchProductBySlug,
    }
}

export default usePublicProducts