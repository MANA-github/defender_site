const SERVER_URL = "http://192.168.3.9:8080/login";

const form = document.getElementById("form");
const uid  = document.getElementById("uid");
const pwd  = document.getElementById("pwd");
const msg  = document.getElementById("msg");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!uid.value || !pwd.value) {
    alert("ユーザーIDとパスワードを入力してください");
    return;
  }

  const payload = {
    userId: uid.value,
    password: pwd.value
  };

  try {
    // fetch でログイン
    const res = await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include" // ← Cookie を受け取る
    });

    const data = await res.json();
    console.log("サーバーからのレスポンス:", data);

    if (res.ok) {
      // GET で /pages/home.html を再度 fetch して Cookie を送信
      const homeRes = await fetch("http://192.168.3.9:8080/pages/home.html", {
        method: "GET",
        credentials: "include"
      });

      if (homeRes.ok) {
        // ページ移動
        location.href = "/pages/home.html";
      } else {
        msg.innerHTML = "セッションが無効です。再ログインしてください。";
      }

    } else {
      alert("ログイン失敗: " + data.message);
      msg.innerHTML = "ID またはパスワードが違います。";
    }

  } catch (err) {
    console.error("通信エラー:", err);
    alert("通信エラーが発生しました");
  }
});
