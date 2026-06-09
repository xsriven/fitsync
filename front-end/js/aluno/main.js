document.addEventListener("DOMContentLoaded", () => {
    // Inicialização e verificação de barreiras de proteção
    const token = localStorage.getItem("token");
    const userStorage = localStorage.getItem("usuario");

    if (!token || !userStorage) {
        window.logout();
        return;
    }

    const usuarioLogado = JSON.parse(userStorage);
    if (usuarioLogado.tipo !== "ALUNO") {
        window.logout();
        return;
    }

    // Renderiza dados iniciais assíncronos baseados no Storage
    UiService.renderHeaderEPerfilStatic(usuarioLogado);

    async function inicializarDashboardAluno() {
        try {
            // Dispara as consultas paralelas iniciais
            const [historico, evolucao] = await Promise.all([
                ApiService.getHistoricoTreinos().catch(() => []),
                ApiService.getEvolucaoFisica().catch(() => [])
            ]);

            UiService.renderHistoricoTabela(historico);
            UiService.renderEvolucaoETabCards(evolucao);
            
            // Orquestra a carga de fichas do Handlers
            await Handlers.carregarRotinaCompletaFicha();
        } catch (error) {
            console.error("Erro geral ao carregar blocos do painel:", error);
        }
    }

    // Escutas de Modais fechando clicando na área escura de overlay
    window.addEventListener("click", event => {
        if (event.target === document.getElementById("registrar-treino-modal")) Handlers.fecharModalRegistrarTreino();
        if (event.target === document.getElementById("atualizar-dados-modal")) Handlers.fecharModalAtualizarDados();
    });

    inicializarDashboardAluno();
});

// Vinculo de atalhos globais legados no HTML para Modais e Check-in
window.abrirModalRegistrarTreino = () => Handlers.abrirModalRegistrarTreino();
window.fecharModalRegistrarTreino = () => Handlers.fecharModalRegistrarTreino();
window.abrirModalAtualizarDados = () => Handlers.abrirModalAtualizarDados();
window.fecharModalAtualizarDados = () => Handlers.fecharModalAtualizarDados();
window.salvarExecucaoTreino = () => Handlers.submeterCheckinDiario();
window.salvarDadosCorporais = () => Handlers.submeterNovosDadosCorporais();

window.logout = () => {
    localStorage.clear();
    window.location.href = "login.html";
};