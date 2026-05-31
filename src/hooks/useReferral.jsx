import { supabase } from '../lib/supabase'

export function useReferral() {

    // generate a unique referral code for a new customer
    function generateReferralCode(fullName) {
        const namepart = (fullName || 'USER')
            .replace(/[^a-zA-Z]/g, '')
            .toUpperCase()
            .slice(0, 5)
            .padEnd(3, 'X')
        const numpart = Math.floor(Math.random() * 9000 + 1000)
        return `${namepart}${numpart}`
    }

    // save referral code to new user's profile + create referral record
    async function handleSignupWithReferral(userId, fullName, refCode) {
        // 1. generate this user's own referral code
        const myCode = generateReferralCode(fullName)

        // 2. if they came via a referral link find the referrer
        let referrerId = null
        if (refCode) {
            const { data: referrer } = await supabase
                .from('profiles')
                .select('id')
                .eq('referral_code', refCode.toUpperCase())
                .maybeSingle()

            if (referrer && referrer.id !== userId) {
                referrerId = referrer.id
            }
        }

        // 3. update their profile with referral code + who referred them
        await supabase
            .from('profiles')
            .update({
                referral_code: myCode,
                referred_by: referrerId,
            })
            .eq('id', userId)

        // 4. create referral record
        if (referrerId) {
            await supabase
                .from('referrals')
                .insert({
                    referrer_id: referrerId,
                    referred_id: userId,
                    status: 'pending',
                })
                .single()
        }
    }

    // called when an order is marked as delivered
    // checks if the customer was referred and rewards the referrer
    async function processReferralReward(customerId) {
        // check if this customer was referred
        const { data: profile } = await supabase
            .from('profiles')
            .select('referred_by, full_name')
            .eq('id', customerId)
            .single()

        if (!profile?.referred_by) return

        // check if this is their first completed order
        const { data: orders } = await supabase
            .from('orders')
            .select('id')
            .eq('customer_id', customerId)
            .eq('status', 'delivered')

        // only reward on first delivery
        if (!orders || orders.length !== 1) return

        // check referral not already rewarded
        const { data: referral } = await supabase
            .from('referrals')
            .select('id, status')
            .eq('referrer_id', profile.referred_by)
            .eq('referred_id', customerId)
            .maybeSingle()

        if (!referral || referral.status === 'rewarded') return

        // get reward settings
        const { data: settings } = await supabase
            .from('settings')
            .select('referral_reward_type, referral_discount, referral_discount_type')
            .eq('id', 'store')
            .single()

        if (!settings) return

        // 1. generate unique reward promo code
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // removed confusing chars like 0, O, I, 1
        const randomStr = Array.from({ length: 5 }, () => 
            chars[Math.floor(Math.random() * chars.length)]
        ).join('')
        
        const rewardCode = `REFR-${randomStr}`

        const discountType = settings.referral_reward_type === 'free_delivery'
            ? 'free_delivery'
            : settings.referral_discount_type || 'percentage'

        // 2. create the promo code entry as ONE TIME USE
        await supabase
            .from('promo_codes')
            .insert({
                code: rewardCode,
                description: `One-time referral bonus`,
                discount_type: discountType,
                discount_value: discountType === 'free_delivery'
                    ? 0
                    : Number(settings.referral_discount),
                min_order_amount: 0,
                max_uses: 1, // ✅ This makes it one-time used
                used_count: 0,
                is_active: true,
                is_system_generated: true,
                generated_for: profile.referred_by,
                expires_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
                    .toISOString(), // 90 days
            })

        // mark referral as rewarded
        await supabase
            .from('referrals')
            .update({ status: 'rewarded', reward_code: rewardCode })
            .eq('id', referral.id)
    }

    // fetch referral stats for a customer's profile page
    async function fetchMyReferrals(userId) {
        const { data } = await supabase
            .from('referrals')
            .select(`
        *,
        referred:referred_id (full_name, created_at)
      `)
            .eq('referrer_id', userId)
            .order('created_at', { ascending: false })

        return data || []
    }

    // fetch reward codes earned by a customer
    async function fetchMyRewards(userId) {
        const { data } = await supabase
            .from('promo_codes')
            .select('*')
            .eq('is_system_generated', true)
            .eq('generated_for', userId)
            .order('created_at', { ascending: false })

        return data || []
    }

    return {
        generateReferralCode,
        handleSignupWithReferral,
        processReferralReward,
        fetchMyReferrals,
        fetchMyRewards,
    }
}