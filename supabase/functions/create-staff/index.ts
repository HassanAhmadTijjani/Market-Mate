// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // create admin client with service role key
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        // verify the caller is a super_admin
        const authHeader = req.headers.get('Authorization')
        const { data: { user }, error: authError } = await createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_ANON_KEY')!
        ).auth.getUser(authHeader?.replace('Bearer ', '') || '')

        if (authError || !user) {
            throw new Error('Unauthorized')
        }

        // check caller is super_admin
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'super_admin') {
            throw new Error('Only super admins can create staff accounts')
        }

        const { fullName, email, password, phone, role } = await req.json()

        // Input Validation
        if (!fullName || !email || !password) {
            throw new Error('Full name, email, and password are required')
        }

        // create the auth user
        const { data: newUser, error: createError } =
            await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { full_name: fullName },
            })

        if (createError) throw createError

        // upsert profile with explicit schema and search path safety
        const { error: profileError } = await supabaseAdmin.schema('public')
            .from('profiles')
            .upsert({
                id: newUser.user.id,
                full_name: fullName,
                email,
                phone: phone || '',
                role: role || 'staff',
                is_active: true,
            })

        if (profileError) throw profileError

        return new Response(
            JSON.stringify({ success: true, userId: newUser.user.id }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )
    }
})