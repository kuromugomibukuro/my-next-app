'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BackToSakuraButton from '@/app/components/BackToSakuraButton'

const CATEGORIES = {
  funny:   { label: '🎉 面白い系', color: 'bg-pink-500' },
  dark:    { label: '🌑 物騒系',   color: 'bg-gray-800' },
  liminal: { label: '🚪 境界面',   color: 'bg-purple-500' },
} as const

type CategoryKey = keyof typeof CATEGORIES

const Sparkle = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 100 100" className={className} style={style} fill="currentColor">
    <path d="M50 0 C52 40 60 48 100 50 C60 52 52 60 50 100 C48 60 40 52 0 50 C40 48 48 40 50 0 Z" />
  </svg>
)

export default function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const router = useRouter()
  const [category, setCategory] = useState<CategoryKey>('funny')
  const [words, setWords] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const init = async () => {
      const params = await searchParams
      const rawCategory = params.category || 'funny'
      const currentCategory = (rawCategory in CATEGORIES ? rawCategory : 'funny') as CategoryKey
      setCategory(currentCategory)

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data } = await supabase
        .from('words')
        .select('*, meanings(*)')
        .eq('category', currentCategory)
        .order('created_at', { ascending: false })
      setWords(data || [])
    }
    init()
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const word = formData.get('word') as string
    const meaning = formData.get('meaning') as string
    
    if (!word || !meaning) return

    setIsSubmitting(true)

    const supabase = createClient()

    const { data: wordData, error: wordError } = await supabase
      .from('words')
      .insert({ word, user_email: user?.email, category })
      .select()
      .single()

    if (wordError || !wordData) {
      alert("投稿に失敗しました")
      setIsSubmitting(false)
      return
    }

    await supabase.from('meanings').insert({ word_id: wordData.id, meaning })

    setTimeout(() => {
      router.push(`/thread/${wordData.id}`)
    }, 700)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-900">
      <img src="/sakura-tree.png" alt="背景" className="absolute inset-0 w-full h-full object-cover z-0" />

      {/* ★ 背景：語彙一覧（スマホでは隠す → hidden md:flex） */}
      <div className="hidden md:flex absolute inset-y-0 left-0 z-10 pointer-events-none overflow-y-auto flex-col items-start pt-24 pb-10 pl-10 w-1/2">
        <div className="w-full max-w-lg">
          {words.map((word) => (
            <div key={word.id} className="border border-white/20 p-4 mb-4 rounded-xl bg-black/70 text-white shadow-lg backdrop-blur-md">
              <h2 className="text-xl font-bold">{word.word}</h2>
              <ul className="list-disc list-inside text-sm mt-2 text-gray-200">
                {word.meanings?.map((m: any) => <li key={m.id}>{m.meaning}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ★ 前景：フォーム（スマホでは幅いっぱい） */}
      <div className="relative z-20 max-w-2xl mx-auto p-6 min-h-screen flex flex-col justify-center md:ml-auto md:mr-10 w-full md:w-auto">
        <BackToSakuraButton />
        <div className="bg-white/95 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl p-8">
          <h1 className="text-2xl font-bold mb-2 text-gray-800">✏️ 新しい語彙・会話を投稿</h1>
          <div className="mb-6">
            <span className={`text-sm text-white px-3 py-1 rounded-full ${CATEGORIES[category].color}`}>
              {CATEGORIES[category].label}
            </span>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block font-bold mb-2 text-gray-700">語彙・テーマ <span className="text-red-500">*</span></label>
              <input type="text" name="word" required placeholder="例：わからない" className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-pink-400 focus:outline-none transition bg-white/80" />
            </div>
            <div className="mb-6">
              <label className="block font-bold mb-2 text-gray-700">意味・定義（主催者の意図） <span className="text-red-500">*</span></label>
              <textarea name="meaning" required rows={4} placeholder="例：理解できない・共感できない" className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-pink-400 focus:outline-none transition resize-vertical bg-white/80" />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-pink-500 text-white font-bold rounded-lg hover:bg-pink-600 transition cursor-pointer shadow-lg disabled:opacity-50">
              {isSubmitting ? '送信中...' : '投稿して会話を始める'}
            </button>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {isSubmitting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 3, 0], opacity: [0, 1, 0] }} transition={{ duration: 0.7, ease: 'easeOut' }} className="absolute w-32 h-32 bg-white rounded-full blur-2xl" />
            {[...Array(8)].map((_, i) => {
              const startX = (Math.random() - 0.5) * window.innerWidth
              const startY = (Math.random() - 0.5) * window.innerHeight
              const size = 10 + Math.random() * 30
              return (
                <motion.div key={i} initial={{ x: startX, y: startY, scale: 1, opacity: 1, rotate: 0 }} animate={{ x: 0, y: -50, scale: 0, opacity: 0, rotate: 180 }} transition={{ duration: 0.7, ease: 'easeIn', delay: Math.random() * 0.2 }} className="absolute text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                  <Sparkle style={{ width: size, height: size }} />
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}