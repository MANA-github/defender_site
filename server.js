import { serveDir } from "https://deno.land/std@0.203.0/http/file_server.ts";

const users = {
  "TestUser": "TestPass",
  "admin": "1234",
};

const sessions = new Map();
function generateSessionId() {
  return crypto.randomUUID();
}

Deno.serve({ hostname: "0.0.0.0", port: 8080 }, async (req) => {
  const url = new URL(req.url);

  // --- CORS ヘッダを統一 ---
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // --- プリフライト対応 ---
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method === "POST" && url.pathname === "/login") {
    try {
      const { userId, password } = await req.json();

      console.log(userId, password);
      console.log(req);


      if (users[userId] && users[userId] === password) {
        const sessionId = generateSessionId();
        sessions.set(sessionId, userId);

        return new Response(JSON.stringify({ message: "認証成功" }), {
          status: 200,
          headers: {
            ...corsHeaders,
            "Set-Cookie": `session=${sessionId}; HttpOnly; Path=/`,
            "Content-Type": "application/json",
          },
        });
      } else {
        return new Response(JSON.stringify({ message: "認証失敗" }), {
          status: 401,
          headers: corsHeaders,
        });
      }
    } catch {
      return new Response(JSON.stringify({ message: "Bad Request" }), {
        status: 400,
        headers: corsHeaders,
      });
    }
  }

  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/session=([a-f0-9-]+)/);
  const sessionId = match?.[1];
  const loggedIn = sessionId && sessions.has(sessionId);

  if (url.pathname === "/pages/home.html") {
    if (!loggedIn) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }
    return serveDir(req, { fsRoot: "public", urlRoot: "", index: "pages/home.html" });
  }

  return serveDir(req, { fsRoot: "public", index: "index.html" });
});
