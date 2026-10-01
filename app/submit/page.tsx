import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const category = params.category || 'funny'

  // ログインチェック
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  async function handleSubmit(formData: FormData) {
    'use server'

    const word = formData.get('word') as string
    const meaning = formData.get('meaning') as string
    const category = formData.get('category') as string

    if (!word || !meaning) {
      console.error('語彙と意味は必須です')
      return
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error('ログインが必要です')
      return
    }

    // words テーブルに語彙を挿入（categoryも保存）
    const { data: wordData, error: wordError } = await supabase
      .from('words')
      .insert({
        word,
        user_email: user.email,
        category: category,
      })
      .select()
      .single()

    if (wordError) {
      console.error('語彙の保存に失敗:', wordError.message)
      return
    }

    const { error: meaningError } = await supabase
      .from('meanings')
      .insert({
        word_id: wordData.id,
        meaning: meaning,
      })

    if (meaningError) {
      console.error('意味の保存に失敗:', meaningError.message)
      return
    }

    redirect('/')
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">
        ✏️ 新しい語彙を投稿
      </h1>
      <p className="mb-6 text-gray-600">
        カテゴリ: {category === 'funny' ? '🎉 面白い系' : '🌑 物騒系'}
      </p>

      <form action={handleSubmit}>
        <input type="hidden" name="category" value={category} />

        <div className="mb-4">
          <label className="block font-bold mb-2">
            語彙（例：わからない）
          </label>
          <input
            type="text"
            name="word"
            required
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="mb-6">
          <label className="block font-bold mb-2">
            意味（例：理解できない・共感できない）
          </label>
          <textarea
            name="meaning"
            required
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>

        <button
          type="submit"
          className="px-8 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
        >
          投稿する
        </button>
      </form>
    </div>
  )
}
