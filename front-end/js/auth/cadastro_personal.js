/**
 * Orquestrador do fluxo de eventos da tela de cadastro de Personal Trainer.
 */
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("cadastroPersonalForm");

    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Limpa mensagens e bloqueia o botão usando o seu gerenciador visual padrão
        authUI.limparMensagens();
        
        const cadastroButton = document.getElementById("cadastroButton");
        cadastroButton.disabled = true;

        // Captura os dados preenchidos no formulário
        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim();
        const registro_profissional = document.getElementById("registro_profissional").value.trim();
        const password = document.getElementById("password").value;

        try {
            // Dispara a chamada para a API do seu back-end
            const resultado = await authApi.realizarCadastroPersonal(nome, email, password, registro_profissional);

            // Se der bom, exibe a mensagem de sucesso na cor neon
            authUI.exibirSucesso(resultado.mensagem || "Cadastro realizado com sucesso!");

            // Redireciona o novo profissional para a tela de login após 1.5 segundos
            setTimeout(() => {
                window.location.href = "login_personal.html";
            }, 1500);

        } catch (error) {
            console.error(error);
            // Se o back-end apontar erro (como e-mail já existente), exibe na tela e destrava o botão
            authUI.exibirErro(error.message || "Erro ao conectar com o servidor.");
            cadastroButton.disabled = false;
        }
    });
});