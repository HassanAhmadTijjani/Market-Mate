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
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        // verify caller is super_admin
        const authHeader = req.headers.get('Authorization')
        const token = authHeader?.replace('Bearer ', '') || ''

        const { data: { user }, error: authError } = await createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_ANON_KEY')!
        ).auth.getUser(token)

        if (authError || !user) throw new Error('Unauthorized')

        const { data: callerProfile } = await supabaseAdmin.schema('public')
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (callerProfile?.role !== 'super_admin') {
            throw new Error('Only super admins can delete staff accounts')
        }

        const { staffId } = await req.json()

        if (!staffId) throw new Error('Staff ID is required')

        // Safety: Prevent self-deletion
        if (staffId === user.id) {
            throw new Error('You cannot delete your own account')
        }

        // delete from auth.users — this cascades to profiles automatically
        const { error: deleteError } = await supabaseAdmin
            .auth.admin.deleteUser(staffId)

        if (deleteError) throw deleteError

        return new Response(
            JSON.stringify({ success: true }),
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