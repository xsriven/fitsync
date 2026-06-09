let contadorExercicios = 0;
let alunoSelecionadoFicha = null;

const Handlers = {
    // Busca e Exibe Prontuário Clínico
    async verPerfilAluno(alunoId) {
        const modal = document.getElementById('aluno-modal');
        const modalBody = document.getElementById('modal-aluno-body');
        if (modal) modal.classList.remove('hidden');

        try {
            const data = await ApiService.getAlunodetales(alunoId);
            const { perfil, anamnese } = data;
            
            document.getElementById('modal-aluno-title').textContent = perfil.nome;
            if (modalBody) {
                modalBody.innerHTML = `
                    <div class="prontuario-grupo">
                        <h4>Dados do Aluno</h4>
                        <p><strong>Objetivo:</strong> ${perfil.objetivo || 'Não informado'}</p>
                        <p><strong>Nascimento:</strong> ${new Date(perfil.data_nascimento).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div class="divider"></div>
                    <div class="prontuario-grupo">
                        <h4>Histórico de Lesões</h4>
                        <p>${anamnese?.historico_lesoes || 'Nenhum registro crítico cadastrado.'}</p>
                    </div>
                    <div class="prontuario-grupo">
                        <h4>Restrições Físicas</h4>
                        <p>${anamnese?.restricoes_fisicas || 'Nenhuma restrição relatada.'}</p>
                    </div>
                    <div class="prontuario-grupo">
                        <h4>Condições Médicas</h4>
                        <p>${anamnese?.condicoes_medicas || 'Nenhuma condição mapeada.'}</p>
                    </div>
                `;
            }
        } catch (error) {
            if (modalBody) modalBody.innerHTML = `<p style="color:red;">${error.message}</p>`;
        }
    },

    // Abertura e preenchimento da visualização da Ficha Completa
    async visualizarFichaCompleta(fichaId) {
        const modal = document.getElementById('ficha-treino-modal');
        const modalBody = document.getElementById('modal-ficha-body');
        if (!modal) return;

        modal.classList.remove('hidden');
        if (modalBody) modalBody.innerHTML = '<p style="color: #aaa; text-align: center; padding: 20px;">Carregando detalhes da ficha de treino...</p>';

        try {
            const data = await ApiService.getDetalhesFicha(fichaId);
            UiService.renderModalFicha(data.ficha, data.divisoes);
        } catch (error) {
            if (modalBody) modalBody.innerHTML = `<p style="color:#ff5555; text-align:center;">${error.message}</p>`;
        }
    },

    // Manipulação da inserção dinâmica de exercícios na Ficha
    adicionarLinhaExercicio() {
        const container = document.getElementById('exercicios-container');
        if (!container) return;

        contadorExercicios++;
        const div = document.createElement('div');
        div.className = 'exercicio-row-item card';
        div.id = `exercicio-item-${contadorExercicios}`;
        div.style = 'background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 15px; margin-bottom: 15px; border-radius: 8px;';

        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <strong style="color: #888;">Exercício ${contadorExercicios}</strong>
                <button type="button" style="background: none; border: none; color: #ff5555; cursor: pointer; font-size: 0.85rem;" onclick="Handlers.removerLinhaExercicio(${contadorExercicios})">Remover</button>
            </div>
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 10px;">
                <div class="form-group">
                    <select class="form-input exercise-select-field" required style="background: #141414;">
                        <option value="" disabled selected>Selecione o Exercício</option>
                        ${listaExerciciosGlobal.map(ex => `<option value="${ex.id}">${ex.nome} (${ex.grupo_muscular})</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <input type="number" class="form-input exercise-series-field" placeholder="Séries" min="1" max="10" required>
                </div>
                <div class="form-group">
                    <input type="number" class="form-input exercise-reps-field" placeholder="Reps" min="1" max="100" required>
                </div>
            </div>
        `;
        container.appendChild(div);
    },

    removerLinhaExercicio(id) {
        document.getElementById(`exercicio-item-${id}`)?.remove();
    },

    carregarFichaParaCriacao(alunoId, alunoNome) {
        alunoSelecionadoFicha = { id: alunoId, nome: alunoNome };
        const displayLabel = document.getElementById('aluno-ficha-selecionado');
        const hiddenInput = document.getElementById('aluno-id-ficha');
        
        if (displayLabel) displayLabel.textContent = `Selecionado: ${alunoNome}`;
        if (hiddenInput) hiddenInput.value = alunoId;

        document.getElementById('exercicios-container').innerHTML = '';
        contadorExercicios = 0;
        Handlers.adicionarLinhaExercicio();

        UiService.showSection('criar-treino');
    },

    // Salvar nova Divisão de Treino
    async submeterDivisaoTreino() {
        const alunoId = document.getElementById('aluno-id-ficha')?.value;
        const identificador = document.getElementById('divisao-identificador')?.value;
        const ordem = document.getElementById('divisao-ordem')?.value;

        if (!alunoId || !identificador) {
            alert('Por favor, informe o aluno e o nome da divisão.');
            return;
        }

        const linhas = document.querySelectorAll('.exercicio-row-item');
        const exerciciosSelecionados = [];

        for (let linha of linhas) {
            const exercicio_id = linha.querySelector('.exercise-select-field').value;
            const series = linha.querySelector('.exercise-series-field').value;
            const repeticoes = linha.querySelector('.exercise-reps-field').value;

            if (!exercicio_id || !series || !repeticoes) {
                alert('Preencha as séries e repetições de todos os exercícios adicionados.');
                return;
            }

            exerciciosSelecionados.push({ exercicio_id, series, repeticoes });
        }

        if (exerciciosSelecionados.length === 0) {
            alert('Adicione ao menos um exercício para essa divisão.');
            return;
        }

        try {
            await ApiService.salvarDivisaoFicha({
                aluno_id: alunoId,
                identificador: identificador,
                ordem: ordem,
                exercicios: exerciciosSelecionados
            });

            alert('Divisão de treino gravada com sucesso.');
            
            // Limpa formulário
            document.getElementById('divisao-identificador').value = '';
            document.getElementById('exercicios-container').innerHTML = '';
            
            // Recarrega as listagens e volta à aba global
            const atualizaFichas = await ApiService.getFichasTreino();
            UiService.renderFichas(atualizaFichas);
            UiService.showSection('treinos');

        } catch (error) {
            alert(error.message);
        }
    },

    // Filtros no Front (Exercícios por Categoria e Busca de Alunos)
    filtrarExercicios() {
        const filtro = document.getElementById('filtro-grupo-muscular').value;
        if (!filtro) {
            UiService.renderExercicios(listaExerciciosGlobal);
            return;
        }
        const filtrados = listaExerciciosGlobal.filter(ex => ex.grupo_muscular === filtro);
        UiService.renderExercicios(filtrados);
    },

    filtrarAlunosInput() {
        const texto = document.getElementById('searchBox').value.toLowerCase();
        const filtrados = listaAlunosGlobal.filter(al => al.nome.toLowerCase().includes(texto));
        UiService.renderAlunos(filtrados);
    }
};

// Vincula escopos globais legados chamados no HTML pelas funções onclick do UI/Handlers
window.Handlers = Handlers;
window.showSection = UiService.showSection;