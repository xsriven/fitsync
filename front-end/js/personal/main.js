document.addEventListener('DOMContentLoaded', () => {
    const userData = JSON.parse(localStorage.getItem('usuario') || 'null');
    
    if (userData && userData.nome) {
        const txtNome = document.getElementById('usuario-nome');
        const txtGreeting = document.getElementById('userGreeting');
        if (txtNome) txtNome.textContent = userData.nome;
        if (txtGreeting) txtGreeting.textContent = `Olá, ${userData.nome}`;
    }

    async function inicializarDashboard() {
        try {
            const [alunos, fichas, exercicios] = await Promise.all([
                ApiService.getAlunos(),
                ApiService.getFichasTreino(),
                ApiService.getExercicios()
            ]);

            UiService.renderAlunos(alunos);
            UiService.renderFichas(fichas);
            UiService.renderExercicios(exercicios);
        } catch (error) {
            console.error('Erro na inicialização dos dados do painel:', error);
        }
    }


    document.getElementById('searchBox')?.addEventListener('input', Handlers.filtrarAlunosInput);
    document.getElementById('filtro-grupo-muscular')?.addEventListener('change', Handlers.filtrarExercicios);

    
    document.getElementById('busca-aluno-ficha')?.addEventListener('keyup', Handlers.filtrarAlunosParaFicha);


    window.addEventListener('click', event => {
        if (event.target === document.getElementById('aluno-modal')) {
            document.getElementById('aluno-modal').classList.add('hidden');
        }
        if (event.target === document.getElementById('ficha-treino-modal')) {
            document.getElementById('ficha-treino-modal').classList.add('hidden');
        }
        if (event.target === document.getElementById('cadastro-aluno-modal')) {
            document.getElementById('cadastro-aluno-modal').classList.add('hidden');
        }
        if (event.target === document.getElementById('cadastro-exercicio-modal')) {
            document.getElementById('cadastro-exercicio-modal').classList.add('hidden');
        }
    });

    inicializarDashboard();
});

window.fecharModalAluno = () => document.getElementById('aluno-modal')?.classList.add('hidden');
window.fecharModalFicha = () => document.getElementById('ficha-treino-modal')?.classList.add('hidden');
window.fecharModalCadastroAluno = () => document.getElementById('cadastro-aluno-modal')?.classList.add('hidden');
window.fecharModalCadastroExercicio = () => document.getElementById('cadastro-exercicio-modal')?.classList.add('hidden');
window.abrirModalCadastroAluno = () => document.getElementById('cadastro-aluno-modal').classList.remove('hidden');
window.abrirModalCadastroExercicio = () => document.getElementById('cadastro-exercicio-modal').classList.remove('hidden');
window.adicionarExercicio = () => Handlers.adicionarLinhaExercicio();
window.salvarDivisaoTreino = () => Handlers.submeterDivisaoTreino();

window.logout = () => {
    localStorage.clear();
    window.location.href = 'login.html';
};