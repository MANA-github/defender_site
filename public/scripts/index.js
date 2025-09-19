const SERVER_URL = "http://localhost:8080/login";

let form = document.getElementById("form");
let uid  = document.getElementById("uid");
let pwd  = document.getElementById("pwd");

form.addEventListener("submit", async (event) => {
    event.preventDefault();
        const payload = {
        userid: uid.value,
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
        alert(JSON.stringify(data));

    } catch (err) {
        console.error("通信エラー:", err);
    }
});
