// テスト用のidとパスワード
const users = {
  "TestUser": "TestPass",
  "admin": "1234",
};

// ポート80番でサーバー起動
Deno.serve({ port: 80 }, async (req) => {
  console.log("Server Def is running at http://localhost:80");

  const url = new URL(req.url);

  // ログイン処理
  if (req.method === "POST" && url.pathname === "/login") {
    try {
      const { userId, password } = await req.json();
      console.log("Login process execution");

      // 認証チェック
      if (users[userId] && users[userId] === password) {
        return new Response("認証成功", { status: 200 });
      } else {
        return new Response("認証失敗", { status: 401 });
      }
    } catch (e) {
      return new Response("Bad Request", { status: 400 });
    }
  }

  // その他のリクエスト
  return new Response("Not Found", { status: 404 });
});