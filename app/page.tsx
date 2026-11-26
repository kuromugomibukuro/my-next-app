'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Assistant from '@/app/components/Assistant'

const CATEGORIES = {
  funny:   { label: '🎉 面白い系', color: 'bg-pink-500' },
  dark:    { label: '🌑 物騒系',   color: 'bg-gray-800' },
  liminal: { label: '🚪 境界面',   color: 'bg-purple-500' },
} as const

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

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [isZooming, setIsZooming] = useState(false)
  const [clickPos, setClickPos] = useState({ x: 0, y: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }: any) => {
      setUser(data.session?.user || null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isZooming) return
    if (isAssistantOpen) return // アシスタントが開いている時は桜のクリック判定を無効化

    setClickPos({ x: e.clientX, y: e.clientY })
    setIsZooming(true)

    setTimeout(() => {
      window.location.href = `/submit`
    }, 800)
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
    <div 
      className={`relative w-full h-screen overflow-hidden bg-black transition-all duration-700 ${isZooming ? 'scale-150 opacity-30' : ''}`} 
      style={{ transformOrigin: `${clickPos.x}px ${clickPos.y}px` }}
    >
      {/* 桜の画像（クリック領域） */}
      <div onClick={handleClick} className="absolute inset-0 cursor-pointer">
        <picture>
          <source media="(max-width: 768px)" srcSet="/sakura-tree-sp.png" />
          <img src="/sakura-tree.png" alt="桜の木" className="w-full h-full object-cover" />
        </picture>
      </div>

      {/* 花びら */}
      {mounted && Array.from({ length: 30 }).map((_, i) => (
        <Petal key={i} />
      ))}

      {/* 中央の文字 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="flex flex-row gap-2 md:gap-12 lg:gap-20 px-2">
          <p className="fade-text text-white text-lg md:text-4xl lg:text-5xl font-bold tracking-widest drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] whitespace-nowrap" style={{ animationDelay: '0s' }}>演劇性</p>
          <p className="fade-text text-white text-lg md:text-4xl lg:text-5xl font-bold tracking-widest drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] whitespace-nowrap" style={{ animationDelay: '1.5s' }}>知覚</p>
          <p className="fade-text text-white text-lg md:text-4xl lg:text-5xl font-bold tracking-widest drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] whitespace-nowrap" style={{ animationDelay: '3s' }}>もすら</p>
        </div>
      </div>

      {/* ヘッダー */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">📚 ネットスラング辞書</h1>
        </div>
        <div className="flex gap-2 items-center">
          {user ? (
            <>
              <span className="text-white text-sm drop-shadow hidden md:inline">{user.email}</span>
              {user.email === 'syuuyou2014@gmail.com' && (
                <Link href="/admin" className="px-3 py-2 bg-yellow-500/80 text-white rounded-lg hover:bg-yellow-600 cursor-pointer text-sm font-bold">
                  👑 管理
                </Link>
              )}
              <Link href="/list" className="px-4 py-2 bg-white/90 text-gray-800 rounded-lg hover:bg-white cursor-pointer text-sm">辞書を見る</Link>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer text-sm">ログアウト</button>
            </>
          ) : (
            <Link href="/login" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer text-sm">ログイン</Link>
          )}
        </div>
      </div>

      {/* 検索バー */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center px-4">
        <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 max-w-2xl w-full">
          <input type="text" placeholder="検索ワードを入力..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-pink-400 text-gray-800" />
          <div className="flex gap-2 justify-end">
            <button onClick={() => handleSearch('google')} className="px-3 md:px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 font-bold text-xs md:text-sm cursor-pointer">Google</button>
            <button onClick={() => handleSearch('yahoo')} className="px-3 md:px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 font-bold text-xs md:text-sm cursor-pointer">Yahoo!</button>
            <button onClick={() => handleSearch('baidu')} className="px-3 md:px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 font-bold text-xs md:text-sm cursor-pointer">Baidu</button>
          </div>
        </div>
      </div>

      {/* アシスタント表示エリア */}
      {isAssistantOpen && (
        <div className="absolute top-20 right-4 z-50 animate-in slide-in-from-right-8 duration-300">
          <div className="relative">
            <button 
              onClick={() => setIsAssistantOpen(false)}
              className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center z-50 shadow-lg hover:bg-gray-700 cursor-pointer"
            >
              ✕
            </button>
            <Assistant />
          </div>
        </div>
      )}

      {/* ★ アシスタント呼び出しボタン（クラゲのような浮遊アニメーション） */}
      <button
        onClick={() => setIsAssistantOpen(true)}
        className="absolute bottom-20 right-4 md:bottom-24 md:right-6 z-40 w-24 h-24 md:w-32 md:h-32 flex items-center justify-center cursor-pointer transition-all hover:scale-110 animate-jelly"
        title="サイトの使い方"
      >
        <img 
          src="/assistant.png" 
          alt="アシスタント" 
          className="w-full h-full object-contain drop-shadow-2xl" 
        />
      </button>

    </div>
  )
}