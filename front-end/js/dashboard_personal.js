// Inicialização: configurações e elementos da página
const API_URL = 'http://localhost:3000';
const token = localStorage.getItem('token');
const userData = JSON.parse(localStorage.getItem('usuario') || 'null');

// Elementos do DOM usados pela interface
const alunosContainer = document.getElementById('alunos-container');
const totalAlunosCount = document.getElementById('total-alunos');
const userGreeting = document.getElementById('userGreeting');
const usuarioNomeSidebar = document.getElementById('usuario-nome');
const usuarioEmailSidebar = document.getElementById('usuario-email');
const exerciciosTableBody = document.getElementById('exercicios-table-body');

// Modais
const cadastroAlunoModal = document.getElementById('cadastro-aluno-modal');
const cadastroExercicioModal = document.getElementById('cadastro-exercicio-modal');
const alunoDetalhesModal = document.getElementById('aluno-modal');
const modalAlunoTitle = document.getElementById('modal-aluno-title');
const modalAlunoBody = document.getElementById('modal-aluno-body');

// Navegação da sidebar
function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.style.display = 'none');

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }

    const buttons = document.querySelectorAll('.sidebar-link');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    const clickedButton = Array.from(buttons).find(btn => btn.getAttribute('onclick')?.includes(sectionId));
    if (clickedButton) {
        clickedButton.classList.add('active');
    }

    // Se o usuário clicar na seção de exercícios, carrega a tabela automaticamente
    if (sectionId === 'exercicios') {
        carregarExercicios();
    }
}

// Perfil do Personal
function inicializarPerfil() {
    if (userData) {
        if (userGreeting && userData.nome) {
            userGreeting.textContent = `Olá, ${userData.nome}`;
        }
        if (usuarioNomeSidebar) {
            usuarioNomeSidebar.textContent = userData.nome;
        }

        const perfilNomeInput = document.getElementById('perfil-nome');
        const perfilEmailInput = document.getElementById('perfil-email');
        if (perfilNomeInput) perfilNomeInput.value = userData.nome;
        if (perfilEmailInput) perfilEmailInput.value = userData.email || '';
    }
}

// Modais de exercício
function abrirModalCadastroExercicio() {
    cadastroExercicioModal?.classList.remove('hidden');
}

function fecharModalCadastroExercicio() {
    cadastroExercicioModal?.classList.add('hidden');
    document.getElementById('exercicio-nome').value = '';
    document.getElementById('exercicio-grupo').value = '';
    document.getElementById('exercicio-desc').value = '';
    document.getElementById('exercicio-url').value = '';
}

// API: exercí­cios
async function carregarExercicios() {
    if (!exerciciosTableBody) return;

    exerciciosTableBody.innerHTML = `
        <tr>
            <td colspan="4" style="text-align: center; color: #aaa; padding: 20px;">Carregando biblioteca...</td>
        </tr>
    `;

    try {
        const response = await fetch(`${API_URL}/exercicios`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Falha ao buscar exercícios.');

        const exercicios = await response.json();
        const listaExercicios = Array.isArray(exercicios) ? exercicios : [];

        if (listaExercicios.length === 0) {
            exerciciosTableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #666; padding: 40px;">Nenhum exercício cadastrado.</td>
                </tr>
            `;
            return;
        }

        exerciciosTableBody.innerHTML = ''; 

        listaExercicios.forEach(ex => {
            const tr = document.createElement('tr');
            
            const linkHTML = ex.url_execucao 
                ? `<a href="${ex.url_execucao}" target="_blank" rel="noopener noreferrer" style="color: #39FF14; text-decoration: none; font-weight: 600;">Ver Execução ↗</a>`
                : `<span style="color: #444;">Não informado</span>`;

            tr.innerHTML = `
                <td style="font-weight: 600; color: #fff;">${ex.nome}</td>
                <td><span style="background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 6px; font-size: 0.85rem;">${ex.grupo_muscular}</span></td>
                <td style="color: #aaa; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${ex.descricao || ''}</td>
                <td>${linkHTML}</td>
            `;
            exerciciosTableBody.appendChild(tr);
        });
    } catch (error) {
        console.error(error);
        exerciciosTableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: #ff5555; padding: 20px;">Erro ao carregar dados do servidor.</td>
            </tr>
        `;
    }
}

async function cadastrarExercicio() {
    const nome = document.getElementById('exercicio-nome').value.trim();
    const grupo_muscular = document.getElementById('exercicio-grupo').value;
    const descricao = document.getElementById('exercicio-desc').value.trim();
    const url_execucao = document.getElementById('exercicio-url').value.trim();

    if (!nome || !grupo_muscular) {
        alert('Nome e Grupo Muscular são obrigatórios.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/exercicios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ nome, grupo_muscular, descricao, url_execucao })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.erro || 'Erro ao salvar exercício.');
        }

        fecharModalCadastroExercicio();
        carregarExercicios(); 
        alert('Exercício adicionado com sucesso!');
    } catch (error) {
        console.error(error);
        alert(error.message || 'Falha ao salvar exercício.');
    }
}

// Navegação do formulário de cadastro em etapas
function proximaEtapaCadastro() {
    const nome = document.getElementById('aluno-nome').value.trim();
    const email = document.getElementById('aluno-email').value.trim();
    const senha = document.getElementById('aluno-password').value;
    const data_nascimento = document.getElementById('aluno-data').value;
    const peso = document.getElementById('aluno-peso').value;
    const altura = document.getElementById('aluno-altura').value;

    if (!nome || !email || !senha || !data_nascimento || !peso || !altura) {
        alert('Por favor, preencha todos os campos obrigatórios da Etapa 1 antes de avançar.');
        return;
    }

    document.getElementById('form-step-1').classList.add('hidden');
    document.getElementById('form-step-2').classList.remove('hidden');

    document.getElementById('ind-step-1').classList.remove('active');
    document.getElementById('ind-step-2').classList.add('active');
}

function etapaAnteriorCadastro() {
    document.getElementById('form-step-2').classList.add('hidden');
    document.getElementById('form-step-1').classList.remove('hidden');

    document.getElementById('ind-step-2').classList.remove('active');
    document.getElementById('ind-step-1').classList.add('active');
}

// Modais de aluno
function abrirModalCadastroAluno() { cadastroAlunoModal?.classList.remove('hidden'); }

function fecharModalCadastroAluno() {
    cadastroAlunoModal?.classList.add('hidden');
    
    // Reseta o fluxo visual estruturado das etapas
    document.getElementById('form-step-2').classList.add('hidden');
    document.getElementById('form-step-1').classList.remove('hidden');
    document.getElementById('ind-step-2').classList.remove('active');
    document.getElementById('ind-step-1').classList.add('active');

    // Limpeza completa de todos os campos de entrada do prontuário
    document.getElementById('aluno-nome').value = '';
    document.getElementById('aluno-email').value = '';
    document.getElementById('aluno-password').value = '';
    document.getElementById('aluno-objetivo').value = '';
    document.getElementById('aluno-data').value = '';
    document.getElementById('aluno-peso').value = '';
    document.getElementById('aluno-altura').value = '';
    document.getElementById('anamnese-lesoes').value = '';
    document.getElementById('anamnese-restricoes').value = '';
    document.getElementById('anamnese-condicoes').value = '';
}

function abrirModalAluno(alunoId) {
    alunoDetalhesModal?.classList.remove('hidden');
    buscarDetalhesAluno(alunoId);
}

function fecharModalAluno() {
    alunoDetalhesModal?.classList.add('hidden');
    if (modalAlunoBody) modalAlunoBody.innerHTML = '<p>Carregando prontuário do aluno...</p>';
}

// --- ROTAS DA API PARA ALUNOS (HU7, HU16 E HU17 IMPLEMENTADOS) ---
async function cadastrarAluno() {
    const nome = document.getElementById('aluno-nome').value.trim();
    const email = document.getElementById('aluno-email').value.trim();
    const objetivo = document.getElementById('aluno-objetivo').value.trim();
    const data_nascimento = document.getElementById('aluno-data').value;
    const senha = document.getElementById('aluno-password').value;

    const peso = parseFloat(document.getElementById('aluno-peso').value);
    const altura = parseFloat(document.getElementById('aluno-altura').value);
    const historico_lesoes = document.getElementById('anamnese-lesoes').value.trim();
    const restricoes_fisicas = document.getElementById('anamnese-restricoes').value.trim();
    const condicoes_medicas = document.getElementById('anamnese-condicoes').value.trim();

    if (!nome || !email || !data_nascimento || !senha || !peso || !altura) {
        alert('Preencha todos os campos obrigatórios (Dados de acesso e Avaliação Física Inicial).');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/alunos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ 
                nome, 
                email, 
                objetivo, 
                data_nascimento, 
                senha,
                peso,
                altura,
                historico_lesoes,
                restricoes_fisicas,
                condicoes_medicas
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.erro || 'Erro ao criar prontuário completo do aluno.');
        
        fecharModalCadastroAluno();
        carregarAlunos();
        alert('Cadastro do Aluno, Avaliação Física e Ficha de Anamnese salvos com sucesso!');
    } catch (error) {
        console.error(error);
        alert(error.message || 'Falha ao processar cadastro completo.');
    }
}

async function carregarAlunos() {
    if (!alunosContainer) return;
    alunosContainer.innerHTML = '<p class="dashboard-message">Carregando alunos...</p>';
    try {
        const response = await fetch(`${API_URL}/alunos`, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error('Falha ao buscar alunos.');
        const alunos = await response.json();
        const listaAlunos = Array.isArray(alunos) ? alunos : [];
        if (totalAlunosCount) totalAlunosCount.textContent = listaAlunos.length;
        if (listaAlunos.length === 0) {
            alunosContainer.innerHTML = '<p class="dashboard-message">Nenhum aluno encontrado.</p>';
            return;
        }
        alunosContainer.innerHTML = '';
        listaAlunos.forEach(aluno => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                    <div class="card-title" style="font-weight: 700; color: #fff; font-size: 1.1rem;">${aluno.nome}</div>
                    <span class="card-badge" style="color: #000; background: #39FF14; border-radius: 999px; padding: 4px 10px; font-size: 0.75rem; font-weight: 700;">Ativo</span>
                </div>
                <p class="card-description" style="margin: 5px 0 0; color: #ccc; font-size: 0.9rem;"><strong>📧</strong> ${aluno.email || 'Sem e-mail'}</p>
                <div class="card-exercises" style="display: grid; gap: 10px; margin-top: 15px;">
                    <div class="exercise-item" style="display: flex; justify-content: space-between; padding: 10px 12px; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); font-size: 0.85rem;">
                        <span style="color: #888;">Objetivo</span>
                        <span style="color: #fff; font-weight: 600;">${aluno.objetivo || 'Não informado'}</span>
                    </div>
                    <div class="exercise-item" style="display: flex; justify-content: space-between; padding: 10px 12px; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); font-size: 0.85rem;">
                        <span style="color: #888;">Nascimento</span>
                        <span style="color: #fff; font-weight: 600;">${formatarData(aluno.data_nascimento)}</span>
                    </div>
                </div>
                <div class="card-footer" style="display: flex; justify-content: flex-end; margin-top: 15px;">
                    <button class="card-action" onclick="abrirModalAluno('${aluno.id}')" style="border: none; padding: 8px 14px; border-radius: 8px; background: rgba(57, 255, 20, 0.15); color: #fff; font-weight: 700; cursor: pointer; transition: background 0.2s;">Ver Detalhes</button>
                </div>
            `;
            alunosContainer.appendChild(card);
        });
    } catch (error) {
        console.error(error);
        alunosContainer.innerHTML = '<p class="dashboard-message" style="color: #ff5555;">Erro ao carregar alunos.</p>';
    }
}

async function buscarDetalhesAluno(alunoId) {
    if (!modalAlunoBody) return;
    try {
        const response = await fetch(`${API_URL}/alunos/${alunoId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error('Não foi possível obter os dados do aluno.');
        const aluno = await response.json();
        if (modalAlunoTitle) modalAlunoTitle.textContent = aluno.nome;
        
        modalAlunoBody.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 10px; font-size: 0.95rem; color: #ddd;">
                <p><strong>✉️ Email:</strong> ${aluno.email}</p>
                <p><strong>🎯 Objetivo:</strong> ${aluno.objetivo || 'Não definido'}</p>
                <p><strong>📅 Data de Nascimento:</strong> ${formatarData(aluno.data_nascimento)}</p>
                
                <div style="height: 1px; background: rgba(255,255,255,0.05); margin: 5px 0;"></div>
                <h4 style="color: #39FF14; margin: 0; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.5px;">Ficha Clínico-Geral (Anamnese)</h4>
                <p><strong>🚨 Histórico de Lesões:</strong> <br><span style="color: #aaa; font-size: 0.9rem;">${aluno.historico_lesoes || 'Nenhuma restrição ou lesão informada.'}</span></p>
                <p><strong>⚠️ Restrições Físicas:</strong> <br><span style="color: #aaa; font-size: 0.9rem;">${aluno.restricoes_fisicas || 'Nenhuma restrição motora registrada.'}</span></p>
                <p><strong>💊 Condições Médicas:</strong> <br><span style="color: #aaa; font-size: 0.9rem;">${aluno.condicoes_medicas || 'Nenhuma condição clínica declarada.'}</span></p>
            </div>
        `;
    } catch (error) {
        console.error(error);
        modalAlunoBody.innerHTML = '<p style="color: #ff5555;">Erro ao buscar prontuário técnico e anamnese do aluno.</p>';
    }
}

function formatarData(data) {
    if (!data) return 'Não informado';
    const date = new Date(data.includes('T') ? data : `${data}T00:00:00`);
    if (Number.isNaN(date.getTime())) return 'Não informado';
    return date.toLocaleDateString('pt-BR');
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
}

// Inicialização de segurança
if (!token) {
    window.location.href = 'login.html';
} else {
    inicializarPerfil();
    carregarAlunos();

    window.addEventListener('click', event => {
        if (event.target === cadastroAlunoModal) fecharModalCadastroAluno();
        if (event.target === cadastroExercicioModal) fecharModalCadastroExercicio();
        if (event.target === alunoDetalhesModal) fecharModalAluno();
    });
}