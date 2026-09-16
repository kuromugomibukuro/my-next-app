'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [words, setWords] = useState<any[]>([])

  const fetchData = () => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null)
    })

    supabase
      .from('words')
      .select('*, meanings(*)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setWords(data || [])
      })
  }

  useEffect(() => {
    fetchData()
  }, [])

  // ログアウト処理
  const handleLogout = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('ログアウトエラー:', error.message)
      return
    }
    setUser(null)
    alert('ログアウトしました')
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>📚 ネットスラング辞書</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user ? (
            <>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>{user.email}</span>
              <Link href="/submit">
                <button style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                  ＋ 新規投稿
                </button>
              </Link>
              <button
                onClick={handleLogout}
                style={{ padding: '0.5rem 1rem', background: '#e53e3e', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
              >
                ログアウト
              </button>
            </>
          ) : (
            <Link href="/login">
              <button style={{ padding: '0.5rem 1rem', background: '#4285f4', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                ログイン
              </button>
            </Link>
          )}
        </div>
      </div>

      {words && words.length > 0 ? (
        words.map((word) => (
          <div key={word.id} style={{ border: '1px solid #ddd', margin: '1rem 0', padding: '1rem', borderRadius: 8 }}>
            <h2 style={{ margin: 0 }}>{word.word}</h2>
            {word.user_email && (
              <p style={{ margin: '0.3rem 0', fontSize: '0.85rem', color: '#888' }}>
                投稿者: {word.user_email}
              </p>
            )}
            {word.meanings && word.meanings.length > 0 ? (
              <ul>
                {word.meanings.map((m: any) => (
                  <li key={m.id}>{m.meaning}</li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#999' }}>まだ意味が投稿されていません</p>
            )}
          </div>
        ))
      ) : (
        <p>まだ語彙がありません。最初の投稿をしてみましょう！</p>
      )}
    </div>
  )
}
