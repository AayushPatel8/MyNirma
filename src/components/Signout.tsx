'use client'
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/userContext';
import { signout } from '@/lib/auth-actions';
import { useState } from 'react';



function Signout() {
    const router = useRouter();
    const { user, setUser } = useUser();
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
    <span onClick={hanllesignOut}>Sign out</span>
  )
}

export default Signout