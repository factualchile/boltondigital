'use client';

import { useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
    children: (user: any, subscriptionStatus: string) => ReactNode;
    landing: ReactNode;
    category?: 'SEM' | 'FREELANCE' | 'ADMIN';
}

export default function AuthGuard({ children, landing, category }: AuthGuardProps) {
    const [user, setUser] = useState<any>(null);
    const [subscriptionStatus, setSubscriptionStatus] = useState<string>('NONE');
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAccess = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            
            if (authUser) {
                setUser(authUser);
                
                // Si se requiere categoría específica, validar suscripción
                if (category === 'SEM') {
                    const { data: subData } = await supabase
                        .from('v_active_subscriptions')
                        .select('current_access_status')
                        .eq('user_id', authUser.id)
                        .eq('category', 'SEM')
                        .single();
                    
                    setSubscriptionStatus(subData?.current_access_status || 'EXPIRED');
                } else {
                    setSubscriptionStatus('ACTIVE'); // Para herramientas gratuitas o sin categoría
                }
            }
            setIsLoading(false);
        };

        checkAccess();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser(session.user);
                // Si la sesión cambia (ej: se loguea), forzamos un re-check de suscripción
                // Pero para evitar bucles, solo si no estábamos ya cargando
                checkAccess();
            } else {
                setUser(null);
                setSubscriptionStatus('NONE');
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [category]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!user) {
        return <>{landing}</>;
    }

    return <>{children(user, subscriptionStatus)}</>;
}
