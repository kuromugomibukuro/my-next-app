'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ListPage() {
  const [user, setUser] = useState<any>(null)
  const [words, setWords] = useState<any[]>([])

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data }:any) => {
      setUser(data.session?.user || null)
    })

    supabase
      .from('words')
      .select('*, meanings(*)')
      .order('created_at', { ascending: false })
      .then(({ data }:any) => {
        setWords(data || [])
      })
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    alert('ログアウトしました')
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-pink-600">📚 ネットスラング辞書</h1>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <span className="text-sm text-gray-600">{user.email}</span>
              <Link href="/">
                <button className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600">
                  🌸 桜の画面へ
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                ログアウト
              </button>
            </>
          ) : (
            <Link href="/login">
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                ログイン
              </button>
            </Link>
          )}
        </div>
      </div>

      {words && words.length > 0 ? (
        words.map((word) => (
          <div key={word.id} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{word.word}</h2>
              <span className={`text-xs px-2 py-1 rounded ${
                word.category === 'funny'
                  ? 'bg-pink-100 text-pink-600'
                  : 'bg-gray-800 text-white'
              }`}>
                {word.category === 'funny' ? ' 面白い系' : ' 物騒系'}
              </span>
            </div>
            {word.user_email && (
              <p className="text-xs text-gray-500 mt-1">投稿者: {word.user_email}</p>
            )}
            {word.meanings && word.meanings.length > 0 ? (
              <ul className="mt-2 list-disc list-inside">
                {word.meanings.map((m: any) => (
                  <li key={m.id}>{m.meaning}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 mt-2">まだ意味が投稿されていません</p>
            )}
          </div>
        ))
      ) : (
        <p>まだ語彙がありません。最初の投稿をしてみましょう！</p>
      )}
    </div>
  )
}