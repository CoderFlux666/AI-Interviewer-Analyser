"use client"
import React from 'react'
import { Button } from '@/components/ui/button';
import { supabase } from './../../services/supabaseClient';

function login() {
  //use for sign in with google 
  const asyncsignInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google'
    })

    if (error) {
      console.log(error)
    }
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4'>
      <div className='flex flex-col items-center justify-center gap-6 rounded-3xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-10 shadow-2xl transition-all duration-300 hover:shadow-3xl w-full max-w-md'>

        <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-500">
          <img src={'/veritas_logo.png'} alt='VeritasAI Logo' width={120} height={120}
            className='w-[120px] h-auto object-contain drop-shadow-md rounded-full border-4 border-white/50 shadow-lg' />
          <h1 className='text-3xl font-bold text-center text-gray-900 dark:text-white tracking-tight'>VeritasAI</h1>
        </div>

        <div className='flex items-center flex-col w-full animate-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-backwards'>
          <div className="relative w-full h-48 mb-6 rounded-2xl overflow-hidden group">
            <img src={'./login.png'} alt='Login Illustration'
              className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110' />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>

          <h2 className='text-xl font-semibold text-center text-gray-800 dark:text-gray-100'>Welcome Back</h2>
          <p className='text-gray-500 dark:text-gray-400 text-center mt-2 text-sm'>Your intelligent AI-powered recruitment assistant</p>

          <Button
            onClick={asyncsignInWithGoogle}
            className="mt-8 w-full bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 py-6 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-3">
            <img className='h-6 w-6' src={'https://www.svgrepo.com/show/475656/google-color.svg'} alt="Google" />
            Sign in with Google
          </Button>
        </div>

      </div>
      <footer className="mt-8 text-gray-400 text-xs">
        &copy; {new Date().getFullYear()} VeritasAI. All rights reserved.
      </footer>
    </div>
  )
}

export default login;