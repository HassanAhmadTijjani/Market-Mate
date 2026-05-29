import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useReviews() {
    const { user } = useAuth()

    // fetch approved reviews for a product
    async function fetchProductReviews(productId) {
        const { data, error } = await supabase
            .from('reviews')
            .select('*, profiles (full_name, avatar_url)')
            .eq('product_id', productId)
            .eq('is_approved', true)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    }

    // check if customer already reviewed this product from this order
    async function checkExistingReview(productId, orderId) {
        if (!user) return null
        const { data } = await supabase
            .from('reviews')
            .select('id')
            .eq('product_id', productId)
            .eq('customer_id', user.id)
            .eq('order_id', orderId)
            .maybeSingle()
        return data
    }

    // fetch all reviews submitted by current user for a given order
    // used to pre-mark which items are already reviewed on page load
    async function fetchOrderReviews(orderId) {
        if (!user) return []
        const { data, error } = await supabase
            .from('reviews')
            .select('product_id')
            .eq('order_id', orderId)
            .eq('customer_id', user.id)

        if (error) return []
        return data || []
    }

    // submit a new review
    // DB unique constraint (product_id, customer_id, order_id)
    // guarantees no duplicates even with concurrent submissions
    async function submitReview({ productId, orderId, rating, comment }) {
        if (!user) throw new Error('You must be logged in to review')
        const { error } = await supabase
            .from('reviews')
            .insert({
                product_id: productId,
                customer_id: user.id,
                order_id: orderId,
                rating,
                comment: comment?.trim() || null,
                is_approved: true,
            })

        if (error) {
            // unique constraint violation — already reviewed
            if (error.code === '23505') {
                throw new Error('You have already reviewed this product')
            }
            throw error
        }
    }

    // admin — fetch all reviews with product + customer info
    // uses left join on products so reviews for deleted products still show
    async function fetchAllReviews() {
        const { data, error } = await supabase
            .from('reviews')
            .select(`
        *,
        profiles (full_name),
        products (name, cover_image)
      `)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    }

    // admin — toggle review visibility
    async function toggleApprove(reviewId, currentValue) {
        const { error } = await supabase
            .from('reviews')
            .update({ is_approved: !currentValue })
            .eq('id', reviewId)

        if (error) throw error
    }

    // admin — permanently delete a review
    async function deleteReview(reviewId) {
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', reviewId)

        if (error) throw error
    }

    return {
        fetchProductReviews,
        checkExistingReview,
        fetchOrderReviews,
        submitReview,
        fetchAllReviews,
        toggleApprove,
        deleteReview,
    }
}