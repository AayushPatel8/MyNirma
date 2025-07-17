// app/(with-sidebar)/layout.tsx
'use client'
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserProvider } from "@/context/userContext";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

const supabase = createClient();

export default function WithSidebarLayout({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<{ name: string; profile_pic: string | null } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      // ...your getCurrentUserName logic...
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('users')
        .select('first_name, last_name, profile_pic')
        .eq('id', user.id)
        .single();
      if (!error && data) {
        setUserData({
          name: `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim(),
          profile_pic: data.profile_pic ?? null,
        });
      }
    };
    fetchUserData();
  }, []);

  return (
    <SidebarProvider>
      <UserProvider>
        <AppSidebar user={userData?.name ?? ""} profileImage={userData?.profile_pic ?? ""}/>
        <SidebarTrigger />
        {children}
      </UserProvider>
    </SidebarProvider>
  );
}
