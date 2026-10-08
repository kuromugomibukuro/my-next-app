'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const CATEGORIES = {
  funny:   { label: '🎉 面白い系', color: 'bg-pink-500' },
  dark:    { label: '🌑 物騒系',   color: 'bg-gray-800' },
  liminal: { label: '🚪 境界面',   color: 'bg-purple-500' },
} as const

type CategoryKey = keyof typeof CATEGORIES

export default function ListPage() {
  const [user, setUser] = useState<any>(null)
  const [words, setWords] = useState<any[]>([])
  const [filters, setFilters] = useState<Record<CategoryKey, boolean>>({
    funny: true,
    dark: true,
    liminal: true,
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }: any) => {
      setUser(data.session?.user || null)
    })

    supabase
      .from('words')
      .select('*, meanings(*)')
      .order('created_at', { ascending: false })
      .then(({ data }: any) => {
        setWords(data || [])
      })
  }, [])

  const toggleFilter = (key: CategoryKey) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const filteredWords = words.filter((w) => {
    const cat = (w.category || 'dark') as CategoryKey
    return filters[cat] ?? true
  })

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-pink-600">📚 ネットスラング辞書</h1>
        <Link
          href="/"
          className="px-3 py-1 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 cursor-pointer"
        >
          🌸 桜の画面へ
        </Link>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => (
          <button
            key={key}
            onClick={() => toggleFilter(key)}
            className={`px-4 py-2 rounded-lg font-medium transition cursor-pointer ${
              filters[key]
                ? `${CATEGORIES[key].color} text-white shadow`
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            {CATEGORIES[key].label}
          </button>
        ))}
      </div>

      {filteredWords.length > 0 ? (
        filteredWords.map((word) => {
          const cat = (word.category || 'dark') as CategoryKey
          return (
            <div
              key={word.id}
              className="border border-gray-200 rounded-lg p-4 mb-4 hover:shadow-md transition"
            >
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">{word.word}</h2>
                <span className={`text-xs px-2 py-1 rounded text-white ${CATEGORIES[cat].color}`}>
                  {CATEGORIES[cat].label}
                </span>
              </div>
              {word.user_email && (
                <p className="text-xs text-gray-500 mb-2">投稿者: {word.user_email}</p>
              )}
              {word.meanings && word.meanings.length > 0 ? (
                <ul className="mt-2 list-disc list-inside text-gray-700">
                  {word.meanings.map((m: any) => (
                    <li key={m.id}>{m.meaning}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-sm">まだ意味が投稿されていません</p>
              )}
            </div>
          )
        })
      ) : (
        <p className="text-gray-500">表示できる語彙がありません。フィルタを確認してください。</p>
      )}
    </div>
  )
}