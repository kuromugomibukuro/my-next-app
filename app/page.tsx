import { supabase } from '@/lib/supabase'

export default async function Home() {
  // Supabaseの 'posts' テーブルから全てのデータを取得
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')

  // エラー処理
  if (error) {
    return <p>データの読み込みに失敗しました: {error.message}</p>
  }

  // データ表示
  return (
    <div>
      <h1>📝 投稿一覧</h1>
      {posts && posts.length > 0 ? (
        posts.map((post) => (
          <div key={post.id} style={{
            border: '1px solid #ddd',
            margin: '16px 0',
            padding: '16px',
            borderRadius: '8px'
          }}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
          </div>
        ))
      ) : (
        <p>まだ投稿がありません。Supabaseでデータを追加してみてください。</p>
      )}
    </div>
  )
}

