import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

async function serverDef() {
  console.log("Server Def is running at http://localhost:80");

  // ポート番号80でサーバー起動
  await serve(
    () => new Response("Hello from Server Def!", {
      headers: { "Content-Type": "text/plain" },
    }),
    { port: 80 },
  );
}

// サーバーを起動
serverDef();