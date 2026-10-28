'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const ADMIN_EMAIL = 'syuuyou2014@gmail.com'

export default function ThreadPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [wordData, setWordData] = useState<any>(null)
  const [replies, setReplies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  const [newReply, setNewReply] = useState('')
  const [isSending, setIsSending] = useState(false)

  const fetchData = async () => {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    const { data: word, error } = await supabase
      .from('words')
      .select('*, meanings(*)')
      .eq('id', id)
      .single()

    if (error || !word) {
      console.error("データが見つかりません", error)
      setLoading(false)
      return
    }
    setWordData(word)

    const { data: replyData } = await supabase
      .from('replies')
      .select('*')
      .eq('word_id', id)
      .order('created_at', { ascending: true })
      
    setReplies(replyData || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReply.trim() || !user) return

    setIsSending(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('replies')
      .insert({
        word_id: Number(id),
        content: newReply,
        user_email: user.email
      })

    if (error) {
      alert('返信に失敗しました')
      console.error(error)
    } else {
      setNewReply('')
      await fetchData()
    }
    setIsSending(false)
  }

  const handleDeleteReply = async (replyId: number) => {
    if (!confirm('この返信を削除しますか？')) return

    const supabase = createClient()
    const { error } = await supabase.from('replies').delete().eq('id', replyId)

    if (error) {
      alert('削除に失敗しました')
    } else {
      await fetchData()
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center">読み込み中...</div>
  if (!wordData) return <div className="min-h-screen bg-gray-100 flex items-center justify-center">語彙が見つかりませんでした</div>

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-3xl mx-auto p-6">
        
        <div className="flex justify-between items-center mb-8">
          <Link href="/list" className="text-pink-600 hover:text-pink-800 font-bold cursor-pointer">
            ← 辞書一覧に戻る
          </Link>
          <span className="text-sm text-gray-500">作成者: {wordData.user_email}</span>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-pink-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-400 to-purple-400"></div>
          
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">{wordData.word}</h1>
            <span className={`text-sm text-white px-3 py-1 rounded-full ${
              wordData.category === 'funny' ? 'bg-pink-500' : wordData.category === 'dark' ? 'bg-gray-800' : 'bg-purple-500'
            }`}>
              {wordData.category === 'funny' ? '面白い系' : wordData.category === 'dark' ? '物騒系' : '境界面'}
            </span>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <h2 className="text-sm font-bold text-gray-400 mb-2">📖 最初の定義（制作者より）</h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              {wordData.meanings?.[0]?.meaning || "定義がありません"}
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-bold text-gray-700 border-b pb-2">💬 この語彙についての会話</h2>
          
          {replies.length === 0 ? (
            <p className="text-gray-500 text-center py-4">まだ返信はありません。最初の会話を始めましょう！</p>
          ) : (
            replies.map((reply) => {
              const canDelete = user?.email === reply.user_email || user?.email === ADMIN_EMAIL

              return (
                <div key={reply.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-pink-600">{reply.user_email}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-400">
                        {new Date(reply.created_at).toLocaleString('ja-JP')}
                      </span>
                      {canDelete && (
                        <button 
                          onClick={() => handleDeleteReply(reply.id)}
                          className="text-red-400 hover:text-red-600 text-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer md:opacity-100"
                        >
                          🗑️ 削除
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                </div>
              )
            })
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-4">✍️ 会話に参加する</h3>
          {user ? (
            <form onSubmit={handleReplySubmit}>
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                required
                rows={3}
                placeholder="この語彙についての意見、参考資料、別の意味など..."
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-pink-400 focus:outline-none transition resize-vertical bg-gray-50 mb-3"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-6 py-2 bg-pink-500 text-white font-bold rounded-lg hover:bg-pink-600 transition cursor-pointer shadow disabled:opacity-50"
                >
                  {isSending ? '送信中...' : '返信する'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-4">会話に参加するにはログインが必要です。</p>
              <Link href="/login" className="px-6 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition">
                ログインする
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}