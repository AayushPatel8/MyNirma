import { createClient } from "@/utils/supabase/server";

export default async function GET(request:Request){
    const supabase= await createClient();
    supabase.auth.signOut();
    return Response;
}