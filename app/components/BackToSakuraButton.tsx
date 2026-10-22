'use client'

export default function BackToSakuraButton() {
  return (
    <button
      type="button"
      onClick={() => { window.location.href = '/' }}
      className="inline-block mb-4 text-pink-600 hover:text-pink-700 cursor-pointer"
    >
      ← 桜の画面に戻る
    </button>
  )
}