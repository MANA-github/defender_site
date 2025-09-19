import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";

// --- ユーザーとパスワードの定義 ---
const users = {
  "TestUser": "TestPass",
  "admin": "1234",
};

// --- セッション管理 ---
const sessions = new Map();

// --- CORS ヘッダー ---
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// --- サーバー起動 ---
Deno.serve({ hostname: "0.0.0.0", port: 80 }, async (req) => {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // --- プリフライト対応（CORS） ---
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // --- ログイン処理 ---
  if (req.method === "POST" && pathname === "/login") {
    try {
      const contentType = req.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        return new Response(JSON.stringify({ message: "Invalid Content-Type" }), {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        });
      }

      const raw = await req.text();
      console.log("📝 Raw body:", raw);

      const { userId, password } = JSON.parse(raw);
      console.log("✅ Parsed:", userId, password);

      if (users[userId] && users[userId] === password) {
        const sessionId = generateSessionId();
        sessions.set(sessionId, userId);

        return new Response(JSON.stringify({ message: "認証成功" }), {
          status: 200,
          headers: {
            ...corsHeaders,
            "Set-Cookie": `session=${sessionId}; HttpOnly; Path=/; SameSite=Lax`,
            "Content-Type": "application/json",
          },
        });
      } else {
        return new Response(JSON.stringify({ message: "認証失敗" }), {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (e) {
      console.error("❌ Login Error:", e);
      return new Response(JSON.stringify({ message: "Bad Request" }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }
  }

  // --- 認証チェック ---
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/session=([a-f0-9-]+)/);
  const sessionId = match?.[1];
  const loggedIn = sessionId && sessions.has(sessionId);

  // --- 認証必須ページ（例: /pages/home.html） ---
  if (pathname === "/pages/home.html") {
    if (!loggedIn) {
      return new Response("Unauthorized", {
        status: 401,
        headers: corsHeaders,
      });
    }
    // 認証済みならページ表示
    return serveDir(req, {
      fsRoot: "public",
      urlRoot: "",
      index: "pages/home.html",
    });
  }

  // --- 通常の静的ファイル配信（public以下） ---
  return serveDir(req, {
    fsRoot: "public",
    urlRoot: "",
    index: "index.html",
  });
});
