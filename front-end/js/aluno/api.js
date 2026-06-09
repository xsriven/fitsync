const API_URL = "http://localhost:3000";

const ApiService = {
    async getDadosPerfil() {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/alunos`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!res.ok) throw new Error("Erro ao buscar dados basicos do perfil.");
        return res.json();
    },

    async getTreinoAtivo() {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/meu-treino-ativo`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!res.ok) throw new Error("Erro ao carregar rotinas de treinos ativos.");
        return res.json();
    },

    async getHistoricoTreinos() {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/execucoes-treino`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Erro ao buscar historico de execucoes.");
        return res.json();
    },

    async getEvolucaoFisica() {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/evolucao-fisica`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Erro ao buscar dados corporais.");
        return res.json();
    },

    async registrarCheckinTreino(dados) {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/execucoes-treino`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });
        if (!res.ok) throw new Error("Erro ao salvar execucao do treino.");
        return res.json();
    },

    async atualizarDadosCorporais(dados) {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/evolucao-fisica`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });
        if (!res.ok) throw new Error("Erro ao atualizar dados corporais.");
        return res.json();
    }
};