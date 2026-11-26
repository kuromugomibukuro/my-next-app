'use client'

export default function Assistant() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md max-h-[80vh] overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4 text-pink-600 border-b pb-2">
        🌸 このサイトの歩き方
      </h2>

      <div className="space-y-6 text-gray-700">
        <section>
          <h3 className="text-lg font-bold mb-2 text-gray-800">
            1. トップページ（桜の画面）
          </h3>
          <p className="text-sm leading-relaxed">
            画面いっぱいの桜の木が目印です。桜をクリックすると、新しい語彙や会話のテーマを投稿する画面へ移動します。
          </p>
          <p className="text-sm mt-2 leading-relaxed text-gray-500">
            ※ 画面下部にはGoogle・Yahoo!・Baiduの検索バーもあります。気になる言葉を調べてみましょう。
          </p>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-2 text-gray-800">
            2. 語彙の投稿
          </h3>
          <p className="text-sm leading-relaxed">
            投稿する際に「面白い系」「物騒系」「境界面」の3つのカテゴリから選択できます。あなたの直感で分類してみてください。
          </p>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-2 text-gray-800">
            3. 辞書一覧と会話（スレッド）
          </h3>
          <p className="text-sm leading-relaxed">
            辞書一覧から語彙をクリックすると、その語彙専用の会話ページ（スレッド）に飛びます。他のユーザーの意見を読んだり、自分の知識を書き込んだりして会話を深めましょう。
          </p>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-2 text-gray-800">
            4. 管理者へのメッセージ
          </h3>
          <p className="text-sm leading-relaxed">
            サイトの不具合や「この言葉を削除してほしい」という要望は、トップページの「管理者へメッセージ」から送信できます。
          </p>
        </section>
      </div>
      
      <div className="mt-8 pt-4 border-t text-center">
        <p className="text-xs text-gray-400">ネットスラング辞書 - 知覚と接続のプラットフォーム</p>
      </div>
    </div>
  )
}