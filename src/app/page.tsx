'use client'

import { redirect, useRouter } from 'next/navigation';
import { useUser } from '@/context/userContext';
import SignInWithGoogle from '@/components/signInWithGoogle';
import { Button } from '@/components/ui/button';
import { signout } from '@/lib/auth-actions';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { set } from 'react-hook-form';



export default function Home() {

  const router = useRouter();
  const { user, setUser } = useUser();

  const supabase = createClient();
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (supabaseUser) {
        setUser(supabaseUser);
        const { data, error } = await supabase
          .from('users')
          .select('verified')
          .eq('id', supabaseUser.id)
          .single();
        if (error) {
          console.error('Error fetching isVerified:', error);
        }
        console.log(data?.verified)
        if (data?.verified) {
          redirect('/home');
        }
        else redirect('/onboarding')


      } else {
        router.push('/auth');
      }
    };

    fetchUser();

  })

  return (
    <div >

    </div>
  );
}
