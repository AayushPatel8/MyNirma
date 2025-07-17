'use client'

import { useRouter } from 'next/navigation';
import { useUser } from '@/context/userContext';
import SignInWithGoogle from '@/components/signInWithGoogle';
import { Button } from '@/components/ui/button';
import { signout } from '@/lib/auth-actions';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Card, CardContent } from "@/components/ui/card"
import ProfessionalImageCard from '@/components/ProfessionalCard';



export default function Home() {

  const router = useRouter();
  const { user, setUser } = useUser();

  const supabase = createClient();
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (supabaseUser) {
        setUser(supabaseUser);
      } else {
        router.push('/auth');
      }
    };

    fetchUser();
  })

  const [signOutLoading, setSignOutLoading] = useState(false);

  const hanllesignOut = async () => {
    setSignOutLoading(true);
    const res: any = await signout();
    if (res) {
      setUser(null);
      router.push('/auth');
    }
    setSignOutLoading(false);
  };
  


  return (
     <div className="w-full max-w-6xl mx-auto p-4">
    <ProfessionalImageCard />
  </div>
  );
}
