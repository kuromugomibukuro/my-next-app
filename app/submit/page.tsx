import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BackToSakuraButton from '@/app/components/BackToSakuraButton'

const CATEGORIES = {
  funny:   { label: '🎉 面白い系', color: 'bg-pink-500' },
  dark:    { label: '🌑 物騒系',   color: 'bg-gray-800' },
  liminal: { label: '🚪 境界面',   color: 'bg-purple-500' },
} as const

type CategoryKey = keyof typeof CATEGORIES

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const rawCategory = params.category || 'funny'
  const category = (rawCategory in CATEGORIES ? rawCategory : 'funny') as CategoryKey

  // ログインチェック
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 背景に表示する語彙一覧を取得（クリックしたカテゴリのみ）
  const { data: words } = await supabase
    .from('words')
    .select('*, meanings(*)')
    .eq('category', category)
    .order('created_at', { ascending: false })

  async function handleSubmit(formData: FormData) {
    'use server'

    const word = formData.get('word') as string
    const meaning = formData.get('meaning') as string
    const category = formData.get('category') as string

    if (!word || !meaning) return

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: wordData, error: wordError } = await supabase
      .from('words')
      .insert({ word, user_email: user.email, category })
      .select()
      .single()

    if (wordError) return

    const { error: meaningError } = await supabase
      .from('meanings')
      .insert({ word_id: wordData.id, meaning })

    if (meaningError) return

    redirect('/list')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-900">
      {/* 背景：桜の画像 */}
      <img
        src="/sakura-tree.png"
        alt="背景"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* ★ デバッグ用：取得件数を画面左上に大きく表示 */}
      <div className="absolute top-4 left-4 z-50 bg-black/80 text-white px-4 py-2 rounded-lg font-bold text-xl">
        DB取得件数: {words?.length || 0} 件
      </div>

      {/* 背景：クリックしたカテゴリの語彙一覧（左側に寄せる） */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-y-auto flex flex-col items-start pt-24 pb-10 pl-4 md:pl-10 w-full md:w-1/2">
        <div className="w-full max-w-lg">
          {words && words.length > 0 ? (
            words.map((word) => (
              <div key={word.id} className="border border-white/20 p-4 mb-4 rounded-xl bg-black/70 text-white shadow-lg backdrop-blur-md">
                <h2 className="text-xl font-bold">{word.word}</h2>
                <ul className="list-disc list-inside text-sm mt-2 text-gray-200">
                  {word.meanings?.map((m: any) => <li key={m.id}>{m.meaning}</li>)}
                </ul>
              </div>
            ))
          ) : (
            <p className="text-white bg-red-500/80 p-4 rounded-lg text-center font-bold">
              データがありません（0件）
            </p>
          )}
        </div>
      </div>

      {/* 前景：投稿フォーム（右側に寄せる） */}
      <div className="relative z-20 max-w-2xl mx-auto p-6 min-h-screen flex flex-col justify-center md:ml-auto md:mr-10">
        <BackToSakuraButton />

        <div className="bg-white/95 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl p-8">
          <h1 className="text-2xl font-bold mb-2 text-gray-800">
            ✏️ 新しい語彙を投稿
          </h1>

          <div className="mb-6">
            <span className={`text-sm text-white px-3 py-1 rounded-full ${CATEGORIES[category].color}`}>
              {CATEGORIES[category].label}
            </span>
          </div>

          <form action={handleSubmit}>
            <input type="hidden" name="category" value={category} />

            <div className="mb-5">
              <label className="block font-bold mb-2 text-gray-700">
                語彙 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="word"
                required
                placeholder="例：わからない"
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-pink-400 focus:outline-none transition bg-white/80"
              />
            </div>

            <div className="mb-6">
              <label className="block font-bold mb-2 text-gray-700">
                意味 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="meaning"
                required
                rows={4}
                placeholder="例：理解できない・共感できない"
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-pink-400 focus:outline-none transition resize-vertical bg-white/80"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-pink-500 text-white font-bold rounded-lg hover:bg-pink-600 transition cursor-pointer shadow-lg"
            >
              投稿する
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}