'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
      },
    })
    if (error) console.error('ログインエラー:', error.message)
  }

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
      <h1>ログイン</h1>
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        辞書アプリにログインして、語彙を投稿しましょう
      </p>
      <button
        onClick={handleGoogleLogin}
        style={{
          padding: '0.8rem 2rem',
          background: '#4285f4',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          cursor: 'pointer',
        }}
      >
        Googleでログイン
      </button>
    </div>
  )
}
