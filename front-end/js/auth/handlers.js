document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");

    // Só ativa se o formulário realmente existir na página atual
    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Prepara a tela limpando estados anteriores
        authUI.limparMensagens();
        authUI.bloquearBotao();

        // Coleta os valores dos inputs do HTML
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const userType = form.querySelector('input[name="userType"]').value;

        // Validação rápida de front-end antes de gastar internet batendo na API
        if (!email || !password) {
            authUI.exibirErro("Preencha email e senha.");
            authUI.liberarBotao();
            return;
        }

        try {
            // Delega a chamada do servidor para a nossa camada de API
            const dadosSucesso = await authApi.realizarLogin(email, password, userType);

            // Se funcionou, salva as credenciais no localStorage do navegador
            localStorage.setItem("token", dadosSucesso.token);
            localStorage.setItem("usuario", JSON.stringify(dadosSucesso.usuario));

            // Alerta a UI para avisar o sucesso e jogar o usuário para dentro do sistema
            authUI.exibirSucesso(dadosSucesso.mensagem);
            authUI.redirecionarUsuario(userType);

        } catch (error) {
            // Trata erros de credenciais inválidas ou queda de servidor pegos na API
            console.error(error);
            authUI.exibirErro(error.message || "Erro ao conectar com o servidor.");
            authUI.liberarBotao();
        }
    });
});