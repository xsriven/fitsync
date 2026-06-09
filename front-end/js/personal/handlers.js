let exerciciosDoTreino = [];
let alunoSelecionadoFicha = null;

const Handlers = {
    async verPerfilAluno(alunoId) {
        const modal = document.getElementById('aluno-modal');
        const modalBody = document.getElementById('modal-aluno-body');
        if (modal) modal.classList.remove('hidden');

        try {
            const data = await ApiService.getAlunodetales(alunoId);
            
            document.getElementById('modal-aluno-title').textContent = data.nome;
            if (modalBody) {
                const checkinsHTML = data.checkins && data.checkins.length > 0
                    ? data.checkins.map(c => `
                        <li style="margin-bottom: 8px; font-size: 0.9rem; color: #ccc; list-style: none; display: flex; justify-content: space-between; background: rgba(255,255,255,0.02); padding: 6px 10px; border-radius: 6px; border-left: 3px solid #39FF14;">
                            <strong>${new Date(c.data_execucao).toLocaleDateString('pt-BR')}</strong>
                            <span style="font-style: italic; color: #888; max-width: 60%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                ${c.observacoes || 'Sem observações'}
                            </span>
                        </li>
                      `).join('')
                    : `<p style="color: #666; font-size: 0.9rem; font-style: italic;">Nenhum check-in realizado ainda.</p>`;

                modalBody.innerHTML = `
                    <div class="prontuario-grupo">
                        <h4>Dados do Aluno</h4>
                        <p><strong>Objetivo:</strong> ${data.objetivo || 'Não informado'}</p>
                        <p><strong>Nascimento:</strong> ${new Date(data.data_nascimento).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div class="divider"></div>
                    <div class="prontuario-grupo">
                        <h4>Histórico de Lesões</h4>
                        <p>${data.historico_lesoes || 'Nenhum registro crítico cadastrado.'}</p>
                    </div>
                    <div class="prontuario-grupo">
                        <h4>Restrições Físicas</h4>
                        <p>${data.restricoes_fisicas || 'Nenhuma restrição relatada.'}</p>
                    </div>
                    <div class="prontuario-grupo">
                        <h4>Condições Médicas</h4>
                        <p>${data.condicoes_medicas || 'Nenhuma condição mapeada.'}</p>
                    </div>
                    
                    
                    <div class="divider"></div>
                    <div class="prontuario-grupo">
                        <h4 style="color: #39FF14; margin-bottom: 10px;">Últimos Check-ins(Frequência)</h4>
                        <ul style="padding: 0; margin: 0;">
                            ${checkinsHTML}
                        </ul>
                    </div>
                `;
            }
        } catch (error) {
            if (modalBody) modalBody.innerHTML = `<p style="color:red;">${error.message}</p>`;
        }
    },

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

    filtrarAlunosParaFicha() {
        const inputBusca = document.getElementById('busca-aluno-ficha').value.toLowerCase();
        const dropdown = document.getElementById('dropdown-alunos-ficha');
        
        if (inputBusca.length === 0) {
            if (dropdown) dropdown.style.display = 'none';
            return;
        }
        
        const filtrados = listaAlunosGlobal.filter(aluno => 
            aluno.nome.toLowerCase().includes(inputBusca)
        );
        
        UiService.renderDropdownAlunosFicha(filtrados);
    },

    selecionarAlunoParaFicha(alunoId, alunoNome) {
        alunoSelecionadoFicha = { id: alunoId, nome: alunoNome };
        
        const inputBusca = document.getElementById('busca-aluno-ficha');
        const dropdown = document.getElementById('dropdown-alunos-ficha');
        const badgeSelecionado = document.getElementById('aluno-ficha-selecionado');
        const hiddenInput = document.getElementById('aluno-id-ficha');

        if (inputBusca) inputBusca.style.display = 'none';
        if (dropdown) dropdown.style.display = 'none';
        
        if (badgeSelecionado) {
            badgeSelecionado.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; background: rgba(57,255,20,0.1); border: 1px solid rgba(57,255,20,0.3); padding: 10px 14px; border-radius: 10px; color: #39FF14; font-weight: 600;">
                    <span>Aluno: ${alunoNome}</span>
                    <button type="button" onclick="Handlers.removerAlunoDaFicha()" style="background: transparent; border: none; color: #ff5555; font-weight: 700; cursor: pointer; font-size: 0.9rem;">Remover</button>
                </div>
            `;
        }
        if (hiddenInput) hiddenInput.value = alunoId;
    },

    removerAlunoDaFicha() {
        alunoSelecionadoFicha = null;
        
        const inputBusca = document.getElementById('busca-aluno-ficha');
        const badgeSelecionado = document.getElementById('aluno-ficha-selecionado');
        const hiddenInput = document.getElementById('aluno-id-ficha');

        if (inputBusca) {
            inputBusca.value = '';
            inputBusca.style.display = 'block';
            inputBusca.focus();
        }
        
        if (badgeSelecionado) {
            badgeSelecionado.innerHTML = '<div style="color: #666; font-size: 0.9rem; padding: 5px 0;">Nenhum aluno selecionado</div>';
        }
        if (hiddenInput) hiddenInput.value = '';
    },

    adicionarLinhaExercicio() {
        const container = document.getElementById('exercicios-container');
        if (!container) return;

        const itemIndex = exerciciosDoTreino.length;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'exercicio-item-treino';
        itemDiv.id = `exercicio-treino-${itemIndex}`;
        itemDiv.style.cssText = 'margin-bottom: 15px; padding: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px;';
        
        itemDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 10px; align-items: start;">
                <div class="form-group" style="margin: 0; grid-column: 1 / -1; position: relative;">
                    <label style="font-size: 0.8rem; color: #888;">Buscar Exercício</label>
                    <input type="text" class="form-input search-exercicio" style="background: #141414; font-size: 0.9rem;" placeholder="Buscar por nome ou grupo..." onkeyup="Handlers.filtrarExerciciosAutocomplete(${itemIndex})">
                    <div class="dropdown-resultados" id="dropdown-${itemIndex}" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; max-height: 200px; overflow-y: auto; z-index: 1000; margin-top: 2px;"></div>
                </div>
                <div class="form-group" style="margin: 0; grid-column: 1 / 3;">
                    <label style="font-size: 0.8rem; color: #888;">Exercício Selecionado</label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <div style="padding: 8px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; flex: 1; color: #bbb; font-size: 0.85rem;">
                            <span id="exercicio-nome-${itemIndex}">Nenhum selecionado</span>
                        </div>
                        <button type="button" class="secondary-button" onclick="Handlers.limparExercicioFicha(${itemIndex})" id="btn-trocar-${itemIndex}" style="padding: 8px 12px; font-size: 0.8rem; background: rgba(57,255,20,0.15); color: #39FF14; border: 1px solid rgba(57,255,20,0.3); border-radius: 6px; cursor: pointer; display: none;">Trocar</button>
                    </div>
                    <input type="hidden" id="exercicio-id-${itemIndex}" value="">
                </div>
                <div class="form-group" style="margin: 0;">
                    <label style="font-size: 0.8rem; color: #888;">Séries</label>
                    <input type="number" id="series-${itemIndex}" class="form-input" style="background: #141414; font-size: 0.9rem;" min="1" max="10" value="3" onchange="Handlers.atualizarObjetoExercicio(${itemIndex})" required>
                </div>
                <div class="form-group" style="margin: 0;">
                    <label style="font-size: 0.8rem; color: #888;">Repetições</label>
                    <input type="number" id="repeticoes-${itemIndex}" class="form-input" style="background: #141414; font-size: 0.9rem;" min="1" max="50" value="10" onchange="Handlers.atualizarObjetoExercicio(${itemIndex})" required>
                </div>
                <button type="button" class="secondary-button" onclick="Handlers.removerExercicioFicha(${itemIndex})" style="padding: 8px 12px; font-size: 0.85rem; margin-top: 22px;">Remover</button>
            </div>
        `;
        
        container.appendChild(itemDiv);
        exerciciosDoTreino.push({ id: null, series: 3, repeticoes: 10 });
    },

    filtrarExerciciosAutocomplete(index) {
        const inputBusca = document.querySelector(`#exercicio-treino-${index} .search-exercicio`).value.toLowerCase();
        
        if (inputBusca.length === 0) {
            document.getElementById(`dropdown-${index}`).style.display = 'none';
            return;
        }
        
        const filtrados = listaExerciciosGlobal.filter(ex => 
            ex.nome.toLowerCase().includes(inputBusca) || 
            ex.grupo_muscular.toLowerCase().includes(inputBusca)
        );
        
        UiService.renderDropdownExercicios(index, filtrados);
    },

    selecionarExercicioFicha(index, exercicioId, nome, grupo) {
        const inputBusca = document.querySelector(`#exercicio-treino-${index} .search-exercicio`);
        const labelBusca = inputBusca?.previousElementSibling; // Pega o label "Buscar Exercício"
        const dropdown = document.getElementById(`dropdown-${index}`);
        const nomeElement = document.getElementById(`exercicio-nome-${index}`);
        const btnTrocar = document.getElementById(`btn-trocar-${index}`);
        const inputHidden = document.getElementById(`exercicio-id-${index}`);
        
        if (inputBusca) {
            inputBusca.value = '';
            inputBusca.style.display = 'none';
        }
        if (labelBusca) labelBusca.style.display = 'none';
        if (dropdown) dropdown.style.display = 'none';
        
        if (nomeElement) {
            nomeElement.innerHTML = `
                <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 12px; border-radius: 8px;">
                    <div style="font-weight: 700; color: #fff; font-size: 1rem; margin-bottom: 4px;">${nome}</div>
                    <span style="font-size: 0.75rem; color: #39FF14; background: rgba(57,255,20,0.1); padding: 2px 6px; border-radius: 4px;">${grupo}</span>
                </div>
            `;
        }
        
        if (btnTrocar) {
            btnTrocar.textContent = 'Remover Escolha';
            btnTrocar.style.cssText = 'padding: 8px 12px; font-size: 0.8rem; background: rgba(255,85,85,0.1); color: #ff5555; border: 1px solid rgba(255,85,85,0.2); border-radius: 6px; cursor: pointer; display: inline-block; width: 100%; text-align: center; margin-top: 5px;';
        }
        
        if (inputHidden) inputHidden.value = exercicioId;
        
        Handlers.atualizarObjetoExercicio(index);
    },

    limparExercicioFicha(index) {
        const inputBusca = document.querySelector(`#exercicio-treino-${index} .search-exercicio`);
        const labelBusca = inputBusca?.previousElementSibling;
        const nomeElement = document.getElementById(`exercicio-nome-${index}`);
        const btnTrocar = document.getElementById(`btn-trocar-${index}`);
        const inputHidden = document.getElementById(`exercicio-id-${index}`);
        
        if (inputBusca) {
            inputBusca.value = '';
            inputBusca.style.display = 'block';
            inputBusca.focus();
        }
        if (labelBusca) labelBusca.style.display = 'block';
        
        if (nomeElement) {
            nomeElement.textContent = 'Nenhum selecionado';
            nomeElement.style.color = '#bbb';
        }
        
        if (btnTrocar) btnTrocar.style.display = 'none';
        if (inputHidden) inputHidden.value = '';
        
        Handlers.atualizarObjetoExercicio(index);
    },

    atualizarObjetoExercicio(index) {
        const exercicioId = document.getElementById(`exercicio-id-${index}`).value;
        const seriesInput = document.getElementById(`series-${index}`);
        const repeticoesInput = document.getElementById(`repeticoes-${index}`);
        
        if (seriesInput && repeticoesInput) {
            exerciciosDoTreino[index] = {
                id: exercicioId ? parseInt(exercicioId) : null,
                series: parseInt(seriesInput.value) || 3,
                repeticoes: parseInt(repeticoesInput.value) || 10
            };
        }
    },

    removerExercicioFicha(index) {
        document.getElementById(`exercicio-treino-${index}`)?.remove();
        exerciciosDoTreino.splice(index, 1);
    },

    carregarFichaParaCriacao(alunoId, alunoNome) {
        Handlers.selecionarAlunoParaFicha(alunoId, alunoNome);
        document.getElementById('exercicios-container').innerHTML = '';
        exerciciosDoTreino = [];
        Handlers.adicionarLinhaExercicio();
        UiService.showSection('criar-treino');
    },

    async submeterDivisaoTreino() {
        const alunoId = document.getElementById('aluno-id-ficha').value;
        const identificador = document.getElementById('divisao-identificador').value.trim();
        const ordem = document.getElementById('divisao-ordem').value;

        if (!alunoId || !identificador) {
            alert('Por favor, informe o aluno e o nome da divisão.');
            return;
        }

        if (exerciciosDoTreino.length === 0) {
            alert('Adicione ao menos um exercício.');
            return;
        }

        if (exerciciosDoTreino.some(ex => !ex.id)) {
            exerciciosDoTreino.forEach((ex, index) => {
                const nomeElement = document.getElementById(`exercicio-nome-${index}`);
                if (nomeElement && !ex.id) nomeElement.style.color = '#ff6b6b';
            });
            alert('Todos os exercícios adicionados devem ter uma seleção válida.');
            return;
        }

        try {
            await ApiService.salvarDivisaoFicha({
                aluno_id: parseInt(alunoId),
                identificador,
                ordem: parseInt(ordem) || 1,
                exercicios: exerciciosDoTreino
            });

            alert('Divisão de treino gravada com sucesso.');
            
            document.getElementById('busca-aluno-ficha').value = '';
            document.getElementById('aluno-ficha-selecionado').textContent = 'Nenhum aluno selecionado';
            document.getElementById('aluno-id-ficha').value = '';
            document.getElementById('divisao-identificador').value = '';
            document.getElementById('exercicios-container').innerHTML = '';
            exerciciosDoTreino = [];
            alunoSelecionadoFicha = null;

            const atualizaFichas = await ApiService.getFichasTreino();
            UiService.renderFichas(atualizaFichas);
            UiService.showSection('treinos');

        } catch (error) {
            alert(error.message);
        }
    },

    proximaEtapaCadastro() {
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
    },

    etapaAnteriorCadastro() {
        document.getElementById('form-step-2').classList.add('hidden');
        document.getElementById('form-step-1').classList.remove('hidden');

        document.getElementById('ind-step-2').classList.remove('active');
        document.getElementById('ind-step-1').classList.add('active');
    },

    async deletarTreinoCompleto(fichaId, alunoNome) {
        const confirmar = confirm(`Tem certeza que deseja remover toda a ficha de treino e rotinas de ${alunoNome}?`);
        
        if (!confirmar) return;

        try {
            const resultado = await ApiService.excluirFichaTreino(fichaId);
            alert(resultado.mensagem || 'Treino removido do painel.');
            
            const atualizaFichas = await ApiService.getFichasTreino();
            UiService.renderFichas(atualizaFichas);
        } catch (error) {
            alert(error.message);
        }
    },
async cadastrarAluno() {
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
            await ApiService.cadastrarAluno({ 
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
            });
            
            window.fecharModalCadastroAluno();
            
            const novosAlunos = await ApiService.getAlunos();
            UiService.renderAlunos(novosAlunos);
            
            alert('Cadastro do Aluno, Avaliação Física e Ficha de Anamnese salvos com sucesso!');
        } catch (error) {
            console.error(error);
            alert(error.message || 'Falha ao processar cadastro completo.');
        }
    },
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

window.Handlers = Handlers;
window.showSection = UiService.showSection;