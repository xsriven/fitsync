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
                        <p>${data.condicoes_medicas || 'Nenhuma condition mapeada.'}</p>
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
            badgeSelecionado.style.display = 'block';
            badgeSelecionado.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; background: rgba(57,255,20,0.1); border: 1px solid rgba(57,255,20,0.3); padding: 10px 14px; border-radius: 10px; color: #39FF14; font-weight: 600; box-sizing: border-box;">
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

        if (badgeSelecionado) {
            badgeSelecionado.innerHTML = '';
            badgeSelecionado.style.display = 'none';
        }

        if (inputBusca) {
            inputBusca.value = '';
            inputBusca.style.display = 'block';
            inputBusca.placeholder = "Digitar nome...";
            inputBusca.focus();
        }
        
        if (hiddenInput) hiddenInput.value = '';
    },

    adicionarLinhaExercicio() {
        const container = document.getElementById('exercicios-container');
        if (!container) return;

        const itemIndex = container.children.length;
        const tempDiv = document.createElement('div');
        
        tempDiv.innerHTML = UiService.criarLinhaExercicioFicha(itemIndex);
        container.appendChild(tempDiv.firstElementChild);
        exerciciosDoTreino.push({ id: null, series: 3, repeticoes: 10 });
    },

    filtrarExerciciosParaFicha(index) {
        const inputBusca = document.getElementById(`busca-exercicio-${index}`).value.toLowerCase();
        const dropdown = document.getElementById(`dropdown-${index}`);
        
        if (inputBusca.length === 0) {
            if (dropdown) dropdown.style.display = 'none';
            return;
        }
        
        const filtrados = listaExerciciosGlobal.filter(ex => 
            ex.nome.toLowerCase().includes(inputBusca) || 
            ex.grupo_muscular.toLowerCase().includes(inputBusca)
        );
        
        UiService.renderDropdownExercicios(index, filtrados);
    },

    selecionarExercicioFicha(index, exercicioId, nome, grupo) {
        const inputBusca = document.getElementById(`busca-exercicio-${index}`);
        const dropdown = document.getElementById(`dropdown-${index}`);
        const badgeSelecionado = document.getElementById(`exercicio-selecionado-${index}`);
        const nomeBadge = document.getElementById(`nome-ex-badge-${index}`);
        const grupoBadge = document.getElementById(`grupo-ex-badge-${index}`);
        const inputHidden = document.getElementById(`id-exercicio-${index}`);
        
        if (inputBusca) inputBusca.style.display = 'none';
        if (dropdown) dropdown.style.display = 'none';
        
        if (nomeBadge) nomeBadge.textContent = nome;
        if (grupoBadge) grupoBadge.textContent = grupo;
        if (badgeSelecionado) badgeSelecionado.style.display = 'flex';
        if (inputHidden) inputHidden.value = exercicioId;
        
        Handlers.atualizarObjetoExercicio(index);
    },

    trocarExercicioFicha(index) {
        const inputBusca = document.getElementById(`busca-exercicio-${index}`);
        const badgeSelecionado = document.getElementById(`exercicio-selecionado-${index}`);
        const inputHidden = document.getElementById(`id-exercicio-${index}`);
        
        if (inputBusca) {
            inputBusca.value = '';
            inputBusca.style.display = 'block';
            inputBusca.focus();
        }
        if (badgeSelecionado) badgeSelecionado.style.display = 'none';
        if (inputHidden) inputHidden.value = '';
        
        Handlers.atualizarObjetoExercicio(index);
    },

    atualizarObjetoExercicio(index) {
        const inputHidden = document.getElementById(`id-exercicio-${index}`);
        const exercicioId = inputHidden ? inputHidden.value : null;
        const seriesInput = document.getElementById(`series-${index}`);
        const repeticoesInput = document.getElementById(`repeticoes-${index}`);
        
        if (seriesInput && repeticoesInput && exerciciosDoTreino[index]) {
            exerciciosDoTreino[index] = {
                id: exercicioId ? parseInt(exercicioId) : null,
                series: parseInt(seriesInput.value) || 3,
                repeticoes: parseInt(repeticoesInput.value) || 10
            };
        }
    },

    removerExercicioFicha(index) {
        document.getElementById(`exercicio-row-${index}`)?.remove();
        
        const container = document.getElementById('exercicios-container');
        if (!container) return;
        
        const rows = container.children;
        Array.from(rows).forEach((row, newIndex) => {
            row.id = `exercicio-row-${newIndex}`;
            
            const busca = row.querySelector('.search-exercicio');
            if (busca) {
                busca.id = `busca-exercicio-${newIndex}`;
                busca.setAttribute('onkeyup', `Handlers.filtrarExerciciosParaFicha(${newIndex})`);
            }
            
            const dropdown = row.querySelector('.dropdown-exercicios');
            if (dropdown) dropdown.id = `dropdown-${newIndex}`;
            
            const hidden = row.querySelector('.id-exercicio-input');
            if (hidden) hidden.id = `id-exercicio-${newIndex}`;
            
            const selectedBox = row.querySelector('.exercicio-selecionado');
            if (selectedBox) {
                selectedBox.id = `exercicio-selecionado-${newIndex}`;
                const btnTrocar = selectedBox.querySelector('button');
                if (btnTrocar) btnTrocar.setAttribute('onclick', `Handlers.trocarExercicioFicha(${newIndex})`);
            }
            
            const nomeBadge = row.querySelector(`[id^="nome-ex-badge-"]`);
            if (nomeBadge) nomeBadge.id = `nome-ex-badge-${newIndex}`;
            
            const grupoBadge = row.querySelector(`[id^="grupo-ex-badge-"]`);
            if (grupoBadge) grupoBadge.id = `grupo-ex-badge-${newIndex}`;
            
            const series = row.querySelector('.series-input');
            if (series) {
                series.id = `series-${newIndex}`;
                series.setAttribute('onchange', `Handlers.atualizarObjetoExercicio(${newIndex})`);
            }
            
            const reps = row.querySelector('.repeticoes-input');
            if (reps) {
                reps.id = `repeticoes-${newIndex}`;
                reps.setAttribute('onchange', `Handlers.atualizarObjetoExercicio(${newIndex})`);
            }
        });
    },

    carregarFichaParaCriacao(alunoId, alunoNome) {
        Handlers.selecionarAlunoParaFicha(alunoId, alunoNome);
        const container = document.getElementById('exercicios-container');
        if (container) container.innerHTML = '';
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

        const container = document.getElementById('exercicios-container');
        const rows = container ? container.children : [];
        
        exerciciosDoTreino = Array.from(rows).map((row) => {
            const currentIdx = row.id.split('-').pop();
            
            const idVal = document.getElementById(`id-exercicio-${currentIdx}`)?.value;
            const seriesVal = document.getElementById(`series-${currentIdx}`)?.value;
            const repsVal = document.getElementById(`repeticoes-${currentIdx}`)?.value;
            
            return {
                exercicio_id: idVal ? parseInt(idVal) : null,
                series: parseInt(seriesVal) || 3,
                repeticoes: repsVal ? repsVal.toString() : "10"
            };
        });

        if (exerciciosDoTreino.length === 0) {
            alert('Adicione ao menos um exercício.');
            return;
        }

        if (exerciciosDoTreino.some(ex => !ex.exercicio_id)) {
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
            
            Handlers.removerAlunoDaFicha();
            document.getElementById('divisao-identificador').value = '';
            if (container) container.innerHTML = '';
            
            exerciciosDoTreino = [];
            alunoSelecionadoFicha = null;

            const updateFichas = await ApiService.getFichasTreino();
            UiService.renderFichas(updateFichas);
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
            alert(resultado.mensagem || 'Treino removido do panel.');
            
            const updateFichas = await ApiService.getFichasTreino();
            UiService.renderFichas(updateFichas);
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
            UiService.renderExercicios(listaExerciciosBackup, false);
            return;
        }
    
        const normalizar = (texto) => 
            texto ? texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

        const filtroNormalizado = normalizar(filtro);

        const filtrados = listaExerciciosBackup.filter(ex => 
            normalizar(ex.grupo_muscular) === filtroNormalizado
        );
        UiService.renderExercicios(filtrados, false);
    },

    filtrarAlunosInput() {
        const texto = document.getElementById('searchBox').value.toLowerCase();
        const filtrados = listaAlunosGlobal.filter(al => al.nome.toLowerCase().includes(texto));
        UiService.renderAlunos(filtrados);
    },

    async submeterNovoExercicio() {
        const nome = document.getElementById('exercicio-nome').value.trim();
        const grupo_muscular = document.getElementById('exercicio-grupo').value;
        const descricao = document.getElementById('exercicio-desc').value.trim();
        const url_execucao = document.getElementById('exercicio-url').value.trim();

        try {
            const resposta = await ApiService.cadastrarExercicio({
                nome,
                grupo_muscular,
                descricao,
                url_execucao
            });

            alert(resposta.mensagem || 'Exercício salvo com sucesso!');
            window.fecharModalCadastroExercicio();
            document.getElementById('form-cadastro-exercicio').reset();

            const novosExercicios = await ApiService.getExercicios();
            UiService.renderExercicios(novosExercicios);
        } catch (error) {
            alert(error.message);
        }
    }
};

window.adicionarExercicio = Handlers.adicionarLinhaExercicio;
window.salvarDivisaoTreino = Handlers.submeterDivisaoTreino;

window.Handlers = Handlers;
window.showSection = UiService.showSection;