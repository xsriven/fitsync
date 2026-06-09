const API_URL = 'http://localhost:3000';
const token = localStorage.getItem('token');

// Redireciona caso não haja sessão ativa
if (!token) {
    window.location.href = 'login.html';
}

const ApiService = {
    async getAlunos() {
        const res = await fetch(`${API_URL}/alunos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Erro ao buscar alunos');
        return res.json();
    },

    async getAlunodetales(alunoId) {
        const res = await fetch(`${API_URL}/alunos/${alunoId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Erro ao buscar prontuário do aluno');
        return res.json();
    },

    async cadastrarAluno(dados) {
        const res = await fetch(`${API_URL}/alunos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dados)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.erro || 'Erro ao salvar aluno');
        }
        return res.json();
    },

    async getExercicios() {
        const res = await fetch(`${API_URL}/exercicios`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Erro ao carregar exercícios');
        return res.json();
    },

    async cadastrarExercicio(dados) {
        const res = await fetch(`${API_URL}/exercicios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dados)
        });
        if (!res.ok) throw new Error('Erro ao cadastrar exercício');
        return res.json();
    },

    async getFichasTreino() {
        const res = await fetch(`${API_URL}/fichas-treino`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Erro ao buscar fichas');
        return res.json();
    },

    async getDetalhesFicha(fichaId) {
        const res = await fetch(`${API_URL}/fichas-treino/${fichaId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Erro ao carregar detalhes da ficha');
        return res.json();
    },

    async salvarDivisaoFicha(dados) {
        const res = await fetch(`${API_URL}/fichas-treino`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dados)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.erro || 'Erro ao salvar divisão');
        }
        return res.json();
    }
};