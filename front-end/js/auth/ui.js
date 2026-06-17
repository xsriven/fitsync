/**
 * Manipulação visual e do DOM específicos da tela de Login.
 */
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

    // Reativa o botão caso ocorra algum erro
    liberarBotao() {
        this.loginButton.disabled = false;
    }

    // Renderiza mensagens de erro na tela de forma amigável
    exibirErro(texto) {
        this.messageElement.textContent = texto;
        this.messageElement.classList.add("error");
    }

    // Renderiza mensagem de sucesso
    exibirSucesso(texto) {
        this.messageElement.textContent = texto || "Login realizado com sucesso!";
        this.messageElement.classList.add("success");
    }

    // Gerencia o redirecionamento baseado no cargo (Role) que voltou do back-end
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