import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const useSettings = () => {
    const queryClient = useQueryClient()
    const { profile, user } = useAuth()

    // 1. Fetch Logic
    const { data: settings, isLoading: loading } = useQuery({
        queryKey: ['settings', profile?.role, user?.id],
        queryFn: async () => {
            let data, error;
            const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin';
            const isLoggedIn = !!user;

            if (isAdmin) {
                const result = await supabase.from('settings').select('*').eq('id', 'store').maybeSingle();
                data = result.data;
                error = result.error;
            } else if (isLoggedIn) {
                const result = await supabase.from('customer_settings').select('*').maybeSingle();
                data = result.data;
                error = result.error;
            } else {
                const result = await supabase.from('public_settings').select('*').maybeSingle();
                data = result.data;
                error = result.error;
            }

            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 60 * 5, // Data stays "fresh" for 5 minutes
        gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours (PWA ready)
    });

    // 2. Update Logic (Mutation)
    const updateMutation = useMutation({
        mutationFn: async (updates) => {
            const { error } = await supabase
                .from('settings')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', 'store');
            if (error) throw error;
        },
        onMutate: async (updates) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['settings'] });

            // Snapshot the previous value
            const previousSettings = queryClient.getQueryData(['settings', profile?.role, user?.id]);

            // Optimistically update to the new value
            queryClient.setQueryData(['settings', profile?.role, user?.id], (old) => ({
                ...old,
                ...updates,
            }));

            return { previousSettings };
        },
        onError: (err, updates, context) => {
            // If the mutation fails, use the context we returned from onMutate to roll back
            queryClient.setQueryData(['settings', profile?.role, user?.id], context.previousSettings);
        },
        onSettled: () => {
            // Always refetch after error or success to guarantee sync
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        },
    });

    return {
        settings,
        loading,
        updateSettings: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending
    };
}

export default useSettings