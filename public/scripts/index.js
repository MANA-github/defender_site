const SERVER_URL = "http://192.168.10.101:80/login";

let form = document.getElementById("form");
let uid  = document.getElementById("uid");
let pwd  = document.getElementById("pwd");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!uid.value || !pwd.value) {
    alert("ユーザーIDとパスワードを入力してください");
    return;
  }

  const payload = {
    userId: uid.value,     // ✅ 修正: キー名一致
    password: pwd.value
  };

  try {
    const res = await fetch(SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    console.log("サーバーからのレスポンス:", data);

    if (res.ok) {
      alert("ログイン成功！");
      location.href = "/pages/home.html";
    } else {
      alert("ログイン失敗: " + data.message);
    }

  } catch (err) {
    console.error("通信エラー:", err);
    alert("通信エラーが発生しました");
  }
});
