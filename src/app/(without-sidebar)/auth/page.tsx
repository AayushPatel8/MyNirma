'use client'
import SignInWithGoogle from '@/components/signInWithGoogle'
import SignIn from '@/components/Signin'
import React from 'react'

function page() {
  return (
    <div>
        <form>
            {/* <SignInWithGoogle /> */}
            <SignIn />
        </form>
    </div>
  )
}

export default page