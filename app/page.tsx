'use client'

import { useState } from 'react'

export default function Home() {
  const [clickInfo, setClickInfo] = useState<{ x: number; y: number; category: string } | null>(null)

  const handleTreeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  // 0〜1の割合
    const y = (e.clientY - rect.top) / rect.height  // 0〜1の割合

    // 上の半分なら「面白い」、下の半分なら「物騒」と判定
    const category = y < 0.5 ? 'funny' : 'dark'

    setClickInfo({ x, y, category })
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* 桜の画像 */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={handleTreeClick}
      >
        <img
          src="/sakura.png"
          alt="桜の木"
          className="w-full h-full object-cover"
        />
      </div>

      {/* クリックした場所に表示される仮のUI */}
      {clickInfo && (
        <div
          className="absolute bg-white p-4 rounded-lg shadow-lg"
          style={{
            left: `${clickInfo.x * 100}%`,
            top: `${clickInfo.y * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <p className="font-bold">
            {clickInfo.category === 'funny' ? '🎉 面白い系' : '🌑 物騒系'}
          </p>
          <p className="text-sm text-gray-500">
            x: {(clickInfo.x * 100).toFixed(1)}% / y: {(clickInfo.y * 100).toFixed(1)}%
          </p>
          <button
            className="mt-2 bg-pink-500 text-white px-4 py-2 rounded"
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
