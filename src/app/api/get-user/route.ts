import { createClient } from "@/utils/supabase/server";


export async function GET(request: Request) {


    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return Response.json({
                success: 404,
                message: "User not found"
            })
        }
        const {data: fullUser} = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email)
            .single();

        if (!fullUser) {
            return Response.json({
                success: 404,
                message: "User not found in database"
            })
        }
        return Response.json({
            success: 200,
            message: "User found",
            user: fullUser
        })

    } catch (error) {
        return Response.json({
            success: 500,
            message: "supabase connection failed"
        })
    }


}

