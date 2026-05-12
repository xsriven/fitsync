const form = document.getElementById("loginForm");
const message = document.getElementById("message");
const loginButton = document.getElementById("loginButton");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";
  message.className = "message";
  loginButton.disabled = true;

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    message.textContent = "Preencha email e senha.";
    message.classList.add("error");
    loginButton.disabled = false;
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      message.textContent = data.erro || "Falha ao fazer login.";
      message.classList.add("error");
      loginButton.disabled = false;
      return;
    }

    message.textContent = data.mensagem || "Login realizado com sucesso!";
    message.classList.add("success");

    // Salva token no localStorage e redireciona
    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(data.usuario));
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 800);
  } catch (error) {
    console.error(error);
    message.textContent = "Erro ao conectar com o servidor.";
    message.classList.add("error");
    loginButton.disabled = false;
  }
});
