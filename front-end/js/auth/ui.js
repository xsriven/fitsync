class AuthUI {
    constructor() {
        this.messageElement = document.getElementById("message");
        this.loginButton = document.getElementById("loginButton");
    }

    // Limpa as classes e textos de mensagens anteriores
    limparMensagens() {
        this.messageElement.textContent = "";
        this.messageElement.className = "message";
    }

    // Desativa o botão para evitar cliques duplos enquanto a API responde
    bloquearBotao() {
        this.loginButton.disabled = true;
    }

    liberarBotao() {
        this.loginButton.disabled = false;
    }

    // mensagens de erro na tela
    exibirErro(texto) {
        this.messageElement.textContent = texto;
        this.messageElement.classList.add("error");
    }

    // mensagem de sucesso
    exibirSucesso(texto) {
        this.messageElement.textContent = texto || "Login realizado com sucesso!";
        this.messageElement.classList.add("success");
    }

    // gerencia o redirecionamento baseado no cargo que voltou do back-end
    redirecionarUsuario(userType) {
        setTimeout(() => {
            if (userType === "PERSONAL") {
                window.location.href = "dashboard_personal.html";
            } else {
                window.location.href = "dashboard_aluno.html";
            }
        }, 800);
    }
}

const authUI = new AuthUI();