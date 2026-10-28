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

const ADMIN_EMAIL = 'syuuyou2014@gmail.com'

export default function ListPage() {
  const [user, setUser] = useState<any>(null)
  const [words, setWords] = useState<any[]>([])
  const [filters, setFilters] = useState<Record<CategoryKey, boolean>>({
    funny: true,
    dark: true,
    liminal: true,
  })

  // データ取得用の関数
  const fetchData = () => {
    const supabase = createClient()
    supabase
      .from('words')
      .select('*, meanings(*)')
      .order('created_at', { ascending: false })
      .then(({ data }: any) => {
        setWords(data || [])
      })
  }

  useEffect(() => {
    const supabase = createClient()
    // ログインユーザーの取得
    supabase.auth.getSession().then(({ data }: any) => {
      setUser(data.session?.user || null)
    })
    // 一覧データの取得
    fetchData()
  }, [])

  // フィルタの切り替え
  const toggleFilter = (key: CategoryKey) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // 削除処理
  const handleDelete = async (wordId: number, word: string) => {
    const confirmDelete = window.confirm(`「${word}」を削除しますか？\nこの操作は取り消せません。`)
    if (!confirmDelete) return

    const supabase = createClient()
    const { error } = await supabase
      .from('words')
      .delete()
      .eq('id', wordId)

    if (error) {
      console.error('削除に失敗:', error.message)
      alert('削除に失敗しました: ' + error.message)
      return
    }

    alert('削除しました')
    fetchData() // 一覧を再取得
  }

  // フィルタリングされた語彙一覧
  const filteredWords = words.filter((w) => {
    const cat = (w.category || 'dark') as CategoryKey
    return filters[cat] ?? true
  })

  const isAdmin = user?.email === ADMIN_EMAIL

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-pink-600">📚 ネットスラング辞書</h1>
        <div className="flex gap-2 items-center">
          <Link
            href="/"
            className="px-3 py-1 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 cursor-pointer"
          >
            🌸 桜の画面へ
          </Link>
        </div>
      </div>

      {isAdmin && (
        <p className="text-xs text-gray-500 mb-2">👑 管理者モード</p>
      )}

      {/* フィルタボタン */}
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

      {/* 投稿一覧 */}
      {filteredWords.length > 0 ? (
        filteredWords.map((word) => {
          const cat = (word.category || 'dark') as CategoryKey
          const canDelete = user?.email === word.user_email || isAdmin

          return (
            <div
              key={word.id}
              className="relative border border-gray-200 rounded-lg mb-4 hover:shadow-md transition bg-white group"
            >
              {/* カード全体を覆うリンク */}
              <Link href={`/thread/${word.id}`} className="block p-4">
                <div className="flex items-center gap-2 mb-1 pr-16"> {/* pr-16で削除ボタンのスペースを空ける */}
                  <h2 className="text-xl font-bold group-hover:text-pink-600 transition-colors">
                    {word.word}
                  </h2>
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
                
                {/* クリックを促す小さなテキスト */}
                <div className="mt-3 text-xs text-pink-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  クリックして会話を見る →
                </div>
              </Link>

              {/* 削除ボタン（リンクの上に絶対配置で重ねる） */}
              {canDelete && (
                <button
                  onClick={(e) => {
                    e.preventDefault() // Linkの遷移を止める
                    e.stopPropagation() // イベントの伝播を止める
                    handleDelete(word.id, word.word)
                  }}
                  className="absolute top-4 right-4 z-10 text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 cursor-pointer"
                  title="削除"
                >
                  🗑️ 削除
                </button>
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