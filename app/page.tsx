'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [clickInfo, setClickInfo] = useState<{ x: number; y: number; category: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }: any) => {
      setUser(data.session?.user || null)
    })
  }, [])

  const handleTreeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    const category = y < 0.5 ? 'funny' : 'dark'
    setClickInfo({ x, y, category })
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* 上部のヘッダー */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">📚 ネットスラング辞書</h1>
        <div className="flex gap-2 items-center">
          {user ? (
            <>
              <span className="text-white text-sm drop-shadow hidden md:inline">{user.email}</span>
              <Link href="/list">
                <button className="px-4 py-2 bg-white/90 text-gray-800 rounded-lg hover:bg-white cursor-pointer">
                  辞書を見る
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer"
              >
                ログアウト
              </button>
            </>
          ) : (
            <Link href="/login">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer">
                ログイン
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* 桜の画像 */}
      <div className="absolute inset-0 cursor-pointer" onClick={handleTreeClick}>
        <img src="/sakura.png" alt="桜の木" className="w-full h-full object-cover" />
      </div>

      {/* クリック時のポップアップ */}
      {clickInfo && (
        <div
          className="absolute bg-white p-4 rounded-lg shadow-xl z-10"
          style={{
            left: `${clickInfo.x * 100}%`,
            top: `${clickInfo.y * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <p className="font-bold mb-1">
            {clickInfo.category === 'funny' ? '🎉 面白い系' : '🌑 物騒系'}
          </p>
          <p className="text-xs text-gray-500 mb-2">
            x: {(clickInfo.x * 100).toFixed(1)}% / y: {(clickInfo.y * 100).toFixed(1)}%
          </p>
          <button
            className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 cursor-pointer"
            onClick={() => {
              window.location.href = `/submit?category=${clickInfo.category}`
            }}
          >
            ここに投稿
          </button>
        </div>
      )}
    </div>
  )
}
