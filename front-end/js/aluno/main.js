document.addEventListener("DOMContentLoaded", () => {
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

    UiService.renderHeaderEPerfilStatic(usuarioLogado);

    async function inicializarDashboardAluno() {
        try {
            const [historico, evolucao] = await Promise.all([
                ApiService.getHistoricoTreinos().catch(() => []),
                ApiService.getEvolucaoFisica().catch(() => [])
            ]);

            UiService.renderHistoricoTabela(historico);
            UiService.renderEvolucaoETabCards(evolucao);
            
            
            await Handlers.carregarRotinaCompletaFicha();
        } catch (error) {
            console.error("Erro geral ao carregar blocos do painel:", error);
        }
    }

    window.addEventListener("click", event => {
        if (event.target === document.getElementById("registrar-treino-modal")) Handlers.fecharModalRegistrarTreino();
        if (event.target === document.getElementById("atualizar-dados-modal")) Handlers.fecharModalAtualizarDados();
    });

    inicializarDashboardAluno();
});

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