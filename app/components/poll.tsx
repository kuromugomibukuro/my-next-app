'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

type PollProps = {
  wordId: string
  userEmail: string | undefined
  isCreator: boolean
}

export default function Poll({ wordId, userEmail, isCreator }: PollProps) {
  const [poll, setPoll] = useState<any>(null)
  const [options, setOptions] = useState<any[]>([])
  const [votes, setVotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasVoted, setHasVoted] = useState(false)

  // 作成フォーム用の状態
  const [isCreating, setIsCreating] = useState(false)
  const [newOptions, setNewOptions] = useState<string[]>(['', ''])
  const [endDate, setEndDate] = useState('')

  const fetchPollData = async () => {
    const supabase = createClient()
    
    // 投票テーマを取得
    const { data: pollData } = await supabase
      .from('polls')
      .select('*')
      .eq('word_id', wordId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (pollData) {
      setPoll(pollData)

      // 選択肢を取得
      const { data: optionsData } = await supabase
        .from('poll_options')
        .select('*')
        .eq('poll_id', pollData.id)
      setOptions(optionsData || [])

      // 投票結果を取得
      const { data: votesData } = await supabase
        .from('poll_votes')
        .select('*')
        .eq('poll_id', pollData.id)
      setVotes(votesData || [])

      // 自分が投票したか
      if (userEmail && votesData) {
        setHasVoted(votesData.some((v: any) => v.user_email === userEmail))
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPollData()
  }, [wordId, userEmail])

  // 投票の作成
  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userEmail) return

    const validOptions = newOptions.filter(o => o.trim() !== '')
    if (validOptions.length < 2) {
      alert('選択肢を最低2つ入力してください')
      return
    }
    if (!endDate) {
      alert('投票期限を設定してください')
      return
    }

    const supabase = createClient()
    
    // 1. pollsテーブルに保存
    const { data: newPoll, error: pollError } = await supabase
      .from('polls')
      .insert({
        word_id: Number(wordId),
        creator_email: userEmail,
        ends_at: new Date(endDate).toISOString()
      })
      .select()
      .single()

    if (pollError || !newPoll) {
      alert('投票の作成に失敗しました')
      return
    }

    // 2. 選択肢を保存
    const optionsToInsert = validOptions.map(text => ({
      poll_id: newPoll.id,
      option_text: text
    }))
    
    await supabase.from('poll_options').insert(optionsToInsert)
    
    setIsCreating(false)
    fetchPollData()
  }

  // 投票する
  const handleVote = async (optionId: number) => {
    if (!userEmail) {
      alert('投票するにはログインが必要です')
      return
    }
    if (hasVoted) return
    if (new Date(poll.ends_at) < new Date()) {
      alert('投票期限が終了しています')
      return
    }

    const supabase = createClient()
    const { error } = await supabase
      .from('poll_votes')
      .insert({
        poll_id: poll.id,
        option_id: optionId,
        user_email: userEmail
      })

    if (!error) {
      setHasVoted(true)
      fetchPollData() // 再集計
    }
  }

  if (loading) return <div className="text-gray-500 my-4">投票データ読み込み中...</div>

  // 投票がまだなく、作成者でもない場合
  if (!poll && !isCreator) return null

  // 投票がなく、作成者の場合（作成フォームを表示）
  if (!poll && isCreator) {
    if (!isCreating) {
      return (
        <div className="my-8 bg-pink-50 p-6 rounded-2xl border border-pink-200 text-center">
          <p className="text-gray-700 mb-4">この語彙について、ユーザーに問いかけたいことはありますか？</p>
          <button onClick={() => setIsCreating(true)} className="px-6 py-2 bg-pink-500 text-white font-bold rounded-lg hover:bg-pink-600 transition">
            投票（アンケート）を作成する
          </button>
        </div>
      )
    }

    return (
      <div className="my-8 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold mb-4">📊 投票を作成</h3>
        <form onSubmit={handleCreatePoll}>
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">選択肢（最大5つ）</label>
            {newOptions.map((opt, i) => (
              <input
                key={i}
                type="text"
                value={opt}
                onChange={(e) => {
                  const newOpts = [...newOptions]
                  newOpts[i] = e.target.value
                  setNewOptions(newOpts)
                }}
                placeholder={`選択肢 ${i + 1}`}
                className="w-full p-3 mb-2 border-2 border-gray-200 rounded-lg focus:border-pink-400 focus:outline-none"
              />
            ))}
            {newOptions.length < 5 && (
              <button type="button" onClick={() => setNewOptions([...newOptions, ''])} className="text-pink-500 text-sm font-bold">
                ＋ 選択肢を追加
              </button>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">投票期限</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-pink-400 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-gray-500">キャンセル</button>
            <button type="submit" className="px-6 py-2 bg-pink-500 text-white font-bold rounded-lg hover:bg-pink-600">作成する</button>
          </div>
        </form>
      </div>
    )
  }

  // 投票が存在する場合（集計と投票UI）
  const isExpired = new Date(poll.ends_at) < new Date()
  
  // 結果をカウントしてソート（ランキング）
  const results = options.map(opt => {
    const count = votes.filter(v => v.option_id === opt.id).length
    return { ...opt, count }
  }).sort((a, b) => b.count - a.count)

  const totalVotes = votes.length

  return (
    <div className="my-8 bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-pink-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">📊 投票結果</h3>
        <span className={`text-sm px-3 py-1 rounded-full ${isExpired ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700 font-bold'}`}>
          {isExpired ? '締め切り済み' : `締切: ${new Date(poll.ends_at).toLocaleString('ja-JP')}`}
        </span>
      </div>

      <div className="space-y-3">
        {results.map((result, index) => {
          const percentage = totalVotes === 0 ? 0 : Math.round((result.count / totalVotes) * 100)
          const isMyChoice = votes.find(v => v.user_email === userEmail)?.option_id === result.id

          return (
            <div 
              key={result.id} 
              onClick={() => !hasVoted && !isExpired && handleVote(result.id)}
              className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                !hasVoted && !isExpired ? 'cursor-pointer hover:border-pink-400' : ''
              } ${isMyChoice ? 'border-pink-500 bg-pink-50' : 'border-gray-200 bg-gray-50'}`}
            >
              {/* 結果のバーグラフ */}
              <div 
                className={`absolute top-0 left-0 h-full ${isMyChoice ? 'bg-pink-200' : 'bg-gray-200'}`} 
                style={{ width: `${percentage}%`, zIndex: 0 }}
              />
              
              <div className="relative z-10 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className={`font-bold text-lg ${index === 0 && totalVotes > 0 ? 'text-yellow-500' : 'text-gray-400'}`}>
                    {index + 1}位
                  </span>
                  <span className={`font-bold ${isMyChoice ? 'text-pink-700' : 'text-gray-700'}`}>
                    {result.option_text}
                  </span>
                  {isMyChoice && <span className="text-xs bg-pink-500 text-white px-2 py-0.5 rounded">あなたの投票</span>}
                </div>
                <div className="text-right">
                  <span className="font-bold text-xl">{result.count}票</span>
                  <span className="text-sm text-gray-500 ml-2">({percentage}%)</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      <p className="text-right text-sm text-gray-500 mt-4">合計: {totalVotes}票</p>
      {!userEmail && <p className="text-center text-sm text-blue-500 mt-2">※投票するにはログインしてください</p>}
    </div>
  )
}