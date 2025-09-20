import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";

// --- ユーザーとパスワード ---
const users = {
  "TestUser": "TestPass",
  "admin": "1234",
};

// --- セッション管理 ---
const sessions = new Map();

// --- セッションID生成 ---
function generateSessionId() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, "0")).join("");
}

// --- 動的 CORS ヘッダー ---
function createCorsHeaders(req) {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
  };
}

// --- サーバー起動 ---
Deno.serve({ hostname: "0.0.0.0", port: 8080 }, async (req) => {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // プリフライト（OPTIONS）対応
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: createCorsHeaders(req) });
  }

  // --- ログイン処理 ---
  if (req.method === "POST" && pathname === "/login") {
    try {
      const contentType = req.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        return new Response(JSON.stringify({ message: "Invalid Content-Type" }), {
          status: 400,
          headers: { ...createCorsHeaders(req), "Content-Type": "application/json" },
        });
      }

      const raw = await req.text();
      const { userId, password } = JSON.parse(raw);

      if (users[userId] && users[userId] === password) {
        const sessionId = generateSessionId();
        sessions.set(sessionId, userId);

        return new Response(JSON.stringify({ message: "認証成功" }), {
          status: 200,
          headers: {
            ...createCorsHeaders(req),
            // クロスオリジンでも受け取れるように SameSite=None、ローカルテストでは Secure は外す
            "Set-Cookie": `session=${sessionId}; HttpOnly; Path=/; SameSite=None`,
            "Content-Type": "application/json",
          },
        });
      } else {
        return new Response(JSON.stringify({ message: "認証失敗" }), {
          status: 401,
          headers: { ...createCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
    } catch (e) {
      console.error("Login Error:", e);
      return new Response(JSON.stringify({ message: "Bad Request" }), {
        status: 400,
        headers: { ...createCorsHeaders(req), "Content-Type": "application/json" },
      });
    }
  }
  
// --- 認証チェック ---
const cookieHeader = req.headers.get("cookie") || "";
const match = cookieHeader.match(/session=([a-f0-9]+)/);
const sessionId = match ? match[1] : null;
const loggedIn = sessionId && sessions.has(sessionId);


  // --- 認証必須ページ ---
  if (pathname === "/pages/home.html") {
    if (!loggedIn) {
      return new Response("Unauthorized", {
        status: 401,
        headers: createCorsHeaders(req),
      });
    }
    return serveDir(req, {
      fsRoot: "public",
      urlRoot: "",
      index: "pages/home.html",
    });
  }

  // --- 通常の静的ファイル配信 ---
  return serveDir(req, {
    fsRoot: "public",
    urlRoot: "",
    index: "index.html",
  });
});
