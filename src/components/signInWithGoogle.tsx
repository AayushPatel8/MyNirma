'use client'
import { Button } from "./ui/button"
import { signInWithGoogle } from "@/lib/auth-actions"

const SignInWithGoogle = () => {
    return (
        <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={signInWithGoogle}
        >
            Sign in with Google
        </Button>
    )
}

export default SignInWithGoogle