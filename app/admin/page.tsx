'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const ADMIN_EMAIL = 'syuuyou2014@gmail.com'

export default function AdminPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMessages = async () => {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/')
        return
      }

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error) setMessages(data || [])
      setLoading(false)
    }
    fetchMessages()
  }, [router])

  const handleDelete = async (id: number) => {
    if (!confirm('このメッセージを削除しますか？')) return
    const supabase = createClient()
    await supabase.from('messages').delete().eq('id', id)
    setMessages(messages.filter(m => m.id !== id))
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">👑 管理者メッセージボックス</h1>
          <Link href="/" className="text-pink-600 hover:underline">← トップへ戻る</Link>
        </div>

        {messages.length === 0 ? (
          <p className="text-gray-500">メッセージはありません。</p>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold text-gray-700">{msg.user_email || '匿名'}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400">
                      {new Date(msg.created_at).toLocaleString('ja-JP')}
                    </span>
                    <button onClick={() => handleDelete(msg.id)} className="text-red-500 text-sm hover:underline cursor-pointer">
                      削除
                    </button>
                  </div>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}