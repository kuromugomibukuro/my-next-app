'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'

// カテゴリの表示設定
const CATEGORIES = {
  funny:   { label: '🎉 面白い系', color: 'bg-pink-500' },
  dark:    { label: '🌑 物騒系',   color: 'bg-gray-800' },
  liminal: { label: '🚪 境界面',   color: 'bg-purple-500' },
} as const

type CategoryKey = keyof typeof CATEGORIES

// 散る花びら1枚
function Petal() {
  const style = useMemo(() => {
    const startLeft = Math.random() * 100
    const startTop = Math.random() * 60
    const duration = 10 + Math.random() * 8
    const delay = Math.random() * -20
    const size = 20 + Math.random() * 30
    return {
      left: `${startLeft}%`,
      top: `${startTop}%`,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`,
      width: `${size}px`,
    }
  }, [])

  return <img src="/petal.png" alt="" className="petal" style={style} />
}

// 桜の花びら部分をトライフォース状に3分割
function getCategoryFromPosition(x: number, y: number): CategoryKey {
  const TOP_BOTTOM = 0.3

  if (y < TOP_BOTTOM) {
    return 'liminal'
  }

  const ratio = (y - TOP_BOTTOM) / 0.3
  const xA = 0.25 + ratio * 0.25
  const xB = 0.75 - ratio * 0.25

  if (x < xA) return 'funny'
  if (x > xB) return 'dark'
  return 'liminal'
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [user, setUser] = useState<any>(null)
  const [clickInfo, setClickInfo] = useState<{ x: number; y: number; category: CategoryKey } | null>(null)
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const img = new Image()
    img.src = '/sakura-tree.png'
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(img, 0, 0)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }: any) => {
      setUser(data.session?.user || null)
    })
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = e.currentTarget.getBoundingClientRect()
    const xRatio = (e.clientX - rect.left) / rect.width
    const yRatio = (e.clientY - rect.top) / rect.height

    const canvasX = Math.floor(xRatio * canvas.width)
    const canvasY = Math.floor(yRatio * canvas.height)

    const ctx = canvas.getContext('2d')
    const pixel = ctx?.getImageData(canvasX, canvasY, 1, 1).data
    if (!pixel) return

    const [r, g, b, a] = pixel
    const isPink = r > 200 && b > 150 && g < r && g < b && a > 100
    if (!isPink) return

    const category = getCategoryFromPosition(xRatio, yRatio)
    setClickInfo({ x: xRatio, y: yRatio, category })
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
  }

    const handleSearch = (engine: 'google' | 'yahoo' | 'baidu') => {
    if (!searchQuery.trim()) return
    const query = encodeURIComponent(searchQuery)
    if (engine === 'google') window.open(`https://www.google.com/search?q=${query}`, '_blank')
    if (engine === 'yahoo') window.open(`https://search.yahoo.co.jp/search?p=${query}`, '_blank')
    if (engine === 'baidu') window.open(`https://www.baidu.com/s?wd=${query}`, '_blank')
  }

  
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <canvas ref={canvasRef} className="hidden" />

      {/* メイン画像（桜） */}
      <img
        src="/sakura-tree.png"
        alt="桜の木"
        onClick={handleClick}
        className="absolute inset-0 w-full h-full object-cover cursor-pointer"
      />

      {/* 散る花びら */}
      {mounted && Array.from({ length: 30 }).map((_, i) => (
        <Petal key={i} />
      ))}

            {/* ★ 中央のフェード文字（横一列） */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="flex flex-row gap-4 md:gap-12 lg:gap-20">
          <p className="fade-text text-white text-xl md:text-4xl lg:text-5xl font-bold tracking-widest drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] whitespace-nowrap" style={{ animationDelay: '0s' }}>演劇性</p>
          <p className="fade-text text-white text-xl md:text-4xl lg:text-5xl font-bold tracking-widest drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] whitespace-nowrap" style={{ animationDelay: '1.5s' }}>知覚</p>
          <p className="fade-text text-white text-xl md:text-4xl lg:text-5xl font-bold tracking-widest drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] whitespace-nowrap" style={{ animationDelay: '3s' }}>もすら</p>
        </div>
      </div>

      {/* ヘッダー */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">📚 ネットスラング辞書</h1>
        <div className="flex gap-2 items-center">
          {user ? (
            <>
              <span className="text-white text-sm drop-shadow hidden md:inline">{user.email}</span>
              <Link
                href="/list"
                className="px-4 py-2 bg-white/90 text-gray-800 rounded-lg hover:bg-white cursor-pointer"
              >
                辞書を見る
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer"
              >
                ログアウト
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
            >
              ログイン
            </Link>
          )}
        </div>
      </div>

      {/* ★ 下部：検索バー（あめぞう掲示板風） */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center px-4">
        <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 max-w-2xl w-full">
          <input
            type="text"
            placeholder="検索ワードを入力..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-pink-400 text-gray-800"
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => handleSearch('google')} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 font-bold text-sm cursor-pointer">Google</button>
            <button onClick={() => handleSearch('yahoo')} className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 font-bold text-sm cursor-pointer">Yahoo!</button>
                        <button onClick={() => handleSearch('baidu')} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 font-bold text-sm cursor-pointer">Baidu</button>
          </div>
        </div>
      </div>

           {/* クリック時のポップアップ */}
      {clickInfo && (
        <div
          className="absolute bg-white/80 backdrop-blur-md border border-white/50 p-5 rounded-2xl shadow-2xl z-30 min-w-[200px]"
          style={{
            left: `${clickInfo.x * 100}%`,
            top: `${clickInfo.y * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="text-center mb-4">
            <span className={`font-bold text-white px-3 py-1 rounded-full shadow-sm ${CATEGORIES[clickInfo.category].color}`}>
              {CATEGORIES[clickInfo.category].label}
            </span>
            <p className="text-[10px] text-gray-600 font-mono mt-2 bg-gray-100 rounded-full px-2 py-0.5 inline-block">
              x: {(clickInfo.x * 100).toFixed(1)}% / y: {(clickInfo.y * 100).toFixed(1)}%
            </p>
          </div>
          <button
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold px-4 py-2.5 rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer"
            onClick={() => {
              window.location.href = `/submit?category=${clickInfo.category}`
            }}
          >
            ここに投稿する
          </button>
        </div>
      )}
    </div>
  )
}