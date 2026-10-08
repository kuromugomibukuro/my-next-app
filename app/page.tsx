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
    const duration = 5 + Math.random() * 4
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
    // 上部の三角形 → 境界面
    return 'liminal'
  }

  // 下部は左・中央・右の3つに分割
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

  useEffect(() => {
    setMounted(true)
  }, [])

  // 画像をCanvasに読み込む（ピクセル判定用）
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

  // ログイン状態を取得
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }: any) => {
      setUser(data.session?.user || null)
    })
  }, [])

  // クリック時の処理（ピンク判定＋トライフォース分割）
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

    // ピンク判定（桜の花びら）
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

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* ピクセル判定用の隠しCanvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* メイン画像 */}
      <img
        src="/sakura-tree.png"
        alt="桜の木"
        onClick={handleClick}
        className="absolute inset-0 w-full h-full object-cover cursor-pointer"
      />

      {/* 散る花びら */}
      {mounted && Array.from({ length: 50 }).map((_, i) => (
        <Petal key={i} />
      ))}

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
            <Link href="/login">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer">
                ログイン
              </button>
            </Link>
          )}
        </div>
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
          <p className={`font-bold mb-1 text-white px-2 py-1 rounded inline-block ${CATEGORIES[clickInfo.category].color}`}>
            {CATEGORIES[clickInfo.category].label}
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