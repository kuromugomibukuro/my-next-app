'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const supabase = createClient()

    // ★ クライアントを事前にウォームアップ（Cookieの初期化）
    await supabase.auth.getSession()

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
        skipBrowserRedirect: true,
      },
    })

    if (error) {
      console.error('ログインエラー:', error.message)
      return
    }

    if (data?.url) {
      // ★ 待機時間を1500msに延長
      await new Promise((resolve) => setTimeout(resolve, 800))
      window.location.href = data.url
    }
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
