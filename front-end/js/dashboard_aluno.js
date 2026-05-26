// Inicialização e verificação
const API_URL = "http://localhost:3000";
let usuarioLogado = null;

document.addEventListener("DOMContentLoaded", () => {
    verificarAutenticacao();
    carregarDadosPerfil();
    carregarFichaAtiva();
    carregarHistoricoTreinos();
    carregarEvolucaoFisica();
});

// Verifica token e tipo de usuário
function verificarAutenticacao() {
    const token = localStorage.getItem("token");
    const userStorage = localStorage.getItem("usuario");

    if (!token || !userStorage) {
        logout();
        return;
    }

    usuarioLogado = JSON.parse(userStorage);

    // Proteção extra no Front-end se um Personal tentar acessar o painel do Aluno
    if (usuarioLogado.tipo !== "ALUNO") {
        logout();
    }
}

// Navegação entre seções
function showSection(sectionId) {
    // Esconde todas as seções
    const sections = document.querySelectorAll(".content-section");
    sections.forEach(sec => sec.style.display = "none");

    // Remove a classe active de todos os botões da sidebar
    const buttons = document.querySelectorAll(".sidebar-link");
    buttons.forEach(btn => btn.classList.remove("active"));

    // Exibe a seção clicada
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = "block";
    }

    // Adiciona active no botão clicado correspondente
    const activeBtn = document.querySelector(`button[onclick="showSection('${sectionId}')"]`);
    if (activeBtn) {
        activeBtn.classList.add("active");
    }
}

// Carregamento de dados (API)

// Preenche dados do aluno na interface
function carregarDadosPerfil() {
    if (!usuarioLogado) return;

    document.getElementById("aluno-nome").textContent = usuarioLogado.nome;
    document.getElementById("perfil-nome").value = usuarioLogado.nome;
    document.getElementById("perfil-email").value = usuarioLogado.email;
    
    // Altera a saudação do Header
    document.getElementById("userGreeting").textContent = `Bora treinar, ${usuarioLogado.nome.split(' ')[0]}?`;
}

// Busca a Ficha Ativa do Aluno logado (HU4)
async function carregarFichaAtiva() {
    try {
        const token = localStorage.getItem("token");
        // Requisição para buscar os dados do próprio aluno (A rota GET /alunos filtra por ID caso seja perfil ALUNO)
        const response = await fetch(`${API_URL}/alunos`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error("Erro ao buscar dados da ficha.");

        const dados = await response.json();
        
        if (dados && dados.length > 0) {
            const aluno = dados[0];
            // Atualiza o objetivo na barra lateral
            document.getElementById("aluno-objetivo-sidebar").textContent = `Objetivo: ${aluno.objetivo || "Não definido"}`;
            if (document.getElementById("perfil-nascimento")) {
                // Formata a data para exibição no perfil
                const dataFormatada = new Date(aluno.data_nascimento).toLocaleDateString('pt-BR');
                document.getElementById("perfil-nascimento").value = dataFormatada;
            }
        }

        // Nota: rotas futuras podem popular a lista de treinos ativos

    } catch (error) {
        console.error("Erro:", error);
    }
}

// Busca o histórico de execuções de treino feitas pelo aluno (HU11)
async function carregarHistoricoTreinos() {
    try {
        const token = localStorage.getItem("token");
        // Exemplo de chamada (você criará esse endpoint com base na tabela execucoes_treino)
        const response = await fetch(`${API_URL}/execucoes-treino`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) return;
        const execucoes = await response.json();
        
        const container = document.getElementById("historico-container");
        if (execucoes.length === 0) return;

        container.innerHTML = "";
        execucoes.forEach(exec => {
            const dataFormatada = new Date(exec.data_execucao).toLocaleString('pt-BR');
            container.innerHTML += `
                <tr>
                    <td>${dataFormatada}</td>
                    <td><strong>${exec.identificador_divisao || "Treino Executado"}</strong></td>
                    <td>${exec.observacoes || "<span style='color:#444;'>Sem observações</span>"}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Erro ao carregar histórico:", error);
    }
}

// Busca o histórico de peso/altura e calcula o progresso do IMC (HU12)
async function carregarEvolucaoFisica() {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/evolucao-fisica`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) return;
        const evolucoes = await response.json();

        const container = document.getElementById("evolucao-container");
        if (evolucoes.length === 0) return;

        container.innerHTML = "";
        
        // Atualiza os cards rápidos da tela inicial com os dados mais recentes (último item do array)
        const maisRecente = evolucoes[evolucoes.length - 1];
        document.getElementById("total-peso").textContent = `${parseFloat(maisRecente.peso).toFixed(1)} kg`;
        
        // Calcula o IMC localmente para exibir nos cards rápidos
        const imcAtual = (maisRecente.peso / (maisRecente.altura * maisRecente.altura)).toFixed(2);
        document.getElementById("total-imc").textContent = imcAtual;

        // Renderiza as linhas da tabela de evolução histórica
        evolucoes.forEach(ev => {
            const dataFormatada = new Date(ev.data_registro).toLocaleDateString('pt-BR');
            const imcLinha = (ev.peso / (ev.altura * ev.altura)).toFixed(2);
            
            container.innerHTML += `
                <tr>
                    <td>${dataFormatada}</td>
                    <td>${ev.peso} kg</td>
                    <td>${ev.altura} m</td>
                    <td><strong style="color: #39FF14;">${imcLinha}</strong></td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Erro ao carregar evolução física:", error);
    }
}

// Submits e operações (modais)

// Salva execução de treino (check-in)
async function salvarExecucaoTreino() {
    try {
        const token = localStorage.getItem("token");
        const divisaoId = document.getElementById("select-ficha").value;
        const observacoes = document.getElementById("treino-obs").value;

        const response = await fetch(`${API_URL}/execucoes-treino`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ divisaoId, observacoes })
        });

        if (!response.ok) {
            alert("Erro ao salvar execução do treino.");
            return;
        }

        fecharModalRegistrarTreino();
        carregarHistoricoTreinos(); // Atualiza a tabela na hora
        alert("Treino registrado com sucesso! Boa performance!");
    } catch (error) {
        console.error("Erro ao salvar treino:", error);
    }
}

// Validação e envio de dados corporais
async function salvarDadosCorporais() {
    try {
        const token = localStorage.getItem("token");
        const peso = parseFloat(document.getElementById("corpo-peso").value);
        const altura = parseFloat(document.getElementById("corpo-altura").value);

        // RN-006: Restrição Fisiológica Padrão do Back-end/Front-end
        if (peso < 20 || peso > 300 || altura < 1.00 || altura > 2.50) {
            alert("Valores fora dos limites permitidos (Peso: 20-300kg, Altura: 1.00-2.50m).");
            return;
        }

        const response = await fetch(`${API_URL}/evolucao-fisica`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ peso, altura })
        });

        if (!response.ok) {
            alert("Erro ao atualizar dados corporais.");
            return;
        }

        fecharModalAtualizarDados();
        carregarEvolucaoFisica(); // Atualiza os blocos e tabelas na hora
        alert("Dados corporais atualizados e IMC recalculado com sucesso!");
    } catch (error) {
        console.error("Erro ao salvar dados corporais:", error);
    }
}

// Gerenciamento de modais (abrir/fechar)
function abrirModalRegistrarTreino() {
    document.getElementById("registrar-treino-modal").classList.remove("hidden");
}

function fecharModalRegistrarTreino() {
    document.getElementById("registrar-treino-modal").classList.add("hidden");
    document.getElementById("form-registrar-treino").reset();
}

function abrirModalAtualizarDados() {
    document.getElementById("atualizar-dados-modal").classList.remove("hidden");
}

function fecharModalAtualizarDados() {
    document.getElementById("atualizar-dados-modal").classList.add("hidden");
    document.getElementById("form-atualizar-dados").reset();
}

// ==================== LOGOUT ====================
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
}