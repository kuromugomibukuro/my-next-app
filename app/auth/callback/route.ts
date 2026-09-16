import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  console.log('🔁 コールバック処理開始')
  console.log('📝 code:', code)

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('❌ セッション交換エラー:', error.message)
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`)
  }

  console.log('✅ ログイン成功！ユーザー:', data.user?.email)
  return NextResponse.redirect(`${origin}${next}`)
}
