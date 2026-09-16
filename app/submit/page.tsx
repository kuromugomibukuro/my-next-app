import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SubmitPage() {
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

    if (!word || !meaning) {
      console.error('語彙と意味は必須です')
      return
    }

    const supabase = await createClient()

    // ログインユーザーを取得
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error('ログインが必要です')
      return
    }

    // words テーブルに語彙を挿入（user_emailも一緒に保存）
    const { data: wordData, error: wordError } = await supabase
      .from('words')
      .insert({
        word,
        user_email: user.email,
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
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>
        ✏️ 新しい語彙を投稿
      </h1>
      <form action={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>
            語彙（例：わからない）
          </label>
          <input
            type="text"
            name="word"
            required
            style={{
              width: '100%',
              padding: '0.6rem',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '1rem',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>
            意味（例：理解できない・共感できない）
          </label>
          <textarea
            name="meaning"
            required
            rows={4}
            style={{
              width: '100%',
              padding: '0.6rem',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '1rem',
              resize: 'vertical',
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: '0.6rem 2rem',
            background: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          投稿する
        </button>
      </form>

      <p style={{ marginTop: '2rem', color: '#888' }}>
        ※ 投稿した語彙はトップページに一覧表示されます
      </p>
    </div>
  )
}
