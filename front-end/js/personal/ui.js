let listaExerciciosGlobal = [];
let listaExerciciosBackup = [];
let listaAlunosGlobal = [];

const UiService = {
    showSection(sectionId) {
        document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
        const target = document.getElementById(sectionId);
        if (target) target.style.display = 'block';

        document.querySelectorAll('.sidebar-link').forEach(btn => btn.classList.remove('active'));
        const activeBtn = Array.from(document.querySelectorAll('.sidebar-link'))
            .find(btn => btn.getAttribute('onclick')?.includes(sectionId));
        if (activeBtn) activeBtn.classList.add('active');
    },

    renderAlunos(alunos) {
        listaAlunosGlobal = alunos;
        const container = document.getElementById('alunos-container');
        const totalCount = document.getElementById('total-alunos');
        
        if (totalCount) totalCount.textContent = alunos.filter(al => al.status === 'ATIVO').length;
        if (!container) return;

        if (alunos.length === 0) {
            container.innerHTML = '<p class="dashboard-message">Nenhum aluno encontrado para este filtro.</p>';
            return;
        }

        container.innerHTML = alunos.map(aluno => {
            const isInativo = aluno.status === 'INATIVO';
            
            return `
                <div class="aluno-card" style="${isInativo ? 'opacity: 0.55; border-color: rgba(255,255,255,0.05); background: rgba(255,255,255,0.01);' : ''}">
                    <div class="aluno-card-header">
                        <h3>${aluno.nome}</h3>
                        <span class="status-badge ${isInativo ? 'inactive' : 'active'}" style="${isInativo ? 'background: rgba(255,85,85,0.15); color: #ff5555;' : ''}">
                            ${aluno.status}
                        </span>
                    </div>
                    <div class="aluno-card-body">
                        <p><strong>Email:</strong> ${aluno.email}</p>
                        <p><strong>Objetivo:</strong> ${aluno.objetivo || 'Nao informado'}</p>
                    </div>
                    <div class="aluno-card-actions">
                        ${isInativo ? `
                            <button class="primary-button btn-small" onclick="Handlers.reativarAlunoCompleto(${aluno.id_usuario || aluno.id}, '${aluno.nome}')" style="width: 100%; background: #39FF14; color: #000;">
                                <i class="fa-solid fa-arrows-rotate"></i> Reativar Aluno
                            </button>
                        ` : `
                            <button class="secondary-button btn-small" onclick="Handlers.verPerfilAluno(${aluno.id_usuario || aluno.id})">Prontuario</button>
                            <button class="primary-button btn-small" onclick="Handlers.carregarFichaParaCriacao(${aluno.id_usuario || aluno.id}, '${aluno.nome}')">Adicionar Treino</button>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    },

   renderFichas(fichas) {
        const container = document.getElementById('treinos-container');
        const totalTreinos = document.getElementById('total-treinos');
        
        if (totalTreinos) totalTreinos.textContent = fichas.length;
        if (!container) return;

        if (fichas.length === 0) {
            container.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #666; padding: 40px;">Nenhuma ficha de treino cadastrada até o momento.</td></tr>`;
            return;
        }

        container.innerHTML = fichas.map(ficha => `
            <tr>
                <td class="col-aluno"><strong>${ficha.aluno_nome}</strong></td>
                <td>${ficha.aluno_email}</td>
                <td style="text-align: center;"><span style="background: rgba(57,255,20,0.15); padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; color: #39FF14;">${ficha.num_divisoes || 0} divisões</span></td>
                <td style="text-align: center;"><span class="status-badge ${ficha.status === 'ATIVA' ? 'active' : 'inactive'}">${ficha.status}</span></td>
                <td style="text-align: center;">
                    <div style="display: flex; gap: 8px; justify-content: center;">
                        <button class="primary-button btn-small" onclick="Handlers.visualizarFichaCompleta(${ficha.id})" style="padding: 6px 12px; font-size: 0.85rem;">Visualizar</button>
                        <button class="secondary-button btn-small" onclick="Handlers.deletarTreinoCompleto(${ficha.id}, '${ficha.aluno_nome}')" style="padding: 6px 12px; font-size: 0.85rem; background: rgba(255,85,85,0.05); color: #ff5555; border-color: rgba(255,85,85,0.15);">Excluir</button>
                    </div>
                </td>
            </tr>
        `).join('');
    },
    
    renderExercicios(exercicios, primeiroCarregamento = false) {
        listaExerciciosGlobal = exercicios;
        
        if (primeiroCarregamento || listaExerciciosBackup.length === 0) {
            listaExerciciosBackup = exercicios;
        }

        const tableBody = document.getElementById('exercicios-table-body');
        if (!tableBody) return;

        if (exercicios.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #666; padding: 40px;">Nenhum exercício encontrado.</td></tr>`;
            return;
        }

        tableBody.innerHTML = exercicios.map(ex => `
            <tr>
                <td><strong>${ex.nome}</strong></td>
                <td><span class="status-badge">${ex.grupo_muscular}</span></td>
                <td>${ex.descricao || 'Sem descrição técnica'}</td>
                <td>${ex.url_execucao ? `<a href="${ex.url_execucao}" target="_blank" class="table-link">Ver link</a>` : 'Não possui'}</td>
                <td style="text-align: center;">
                    <button onclick="Handlers.deletarExercicioCompleto(${ex.id}, '${ex.nome}')" 
                            style="background: transparent; border: none; color: #ff5555; font-size: 1.4rem; cursor: pointer; padding: 0; line-height: 1; transition: color 0.2s;"
                            onmouseover="this.style.color='#ff1a1a'"
                            onmouseout="this.style.color='#ff5555'">
                        &times;
                    </button>
                </td>
            </tr>
        `).join('');
    },

    renderDropdownAlunosFicha(alunosFiltrados) {
        const dropdown = document.getElementById('dropdown-alunos-ficha');
        if (!dropdown) return;

        if (alunosFiltrados.length === 0) {
            dropdown.innerHTML = '<div style="padding: 12px; color: #888; text-align: center; font-size: 0.9rem;">Nenhum aluno encontrado</div>';
            dropdown.style.display = 'block';
            return;
        }

        dropdown.innerHTML = alunosFiltrados.map(aluno => `
            <div onclick="Handlers.selecionarAlunoParaFicha(${aluno.id_usuario || aluno.id}, '${aluno.nome}')" 
                 style="padding: 12px 10px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s; font-size: 0.9rem; color: #ddd;"
                 onmouseover="this.style.background='rgba(57,255,20,0.15)'"
                 onmouseout="this.style.background=''">
                <div style="font-weight: 600; color: #39FF14;">${aluno.nome}</div>
                <div style="font-size: 0.8rem; color: #888; margin-top: 2px;">${aluno.email}</div>
            </div>
        `).join('');
        dropdown.style.display = 'block';
    },

    renderDropdownExercicios(index, exerciciosFiltrados) {
        const dropdown = document.getElementById(`dropdown-${index}`);
        if (!dropdown) return;

        if (exerciciosFiltrados.length === 0) {
            dropdown.innerHTML = '<div style="padding: 12px; color: #888; text-align: center; font-size: 0.9rem;">Nenhum exercicio encontrado</div>';
            dropdown.style.display = 'block';
            return;
        }

        dropdown.innerHTML = exerciciosFiltrados.map(ex => `
            <div onclick="Handlers.selecionarExercicioFicha(${index}, ${ex.id}, '${ex.nome}', '${ex.grupo_muscular}')" 
                 style="padding: 12px 10px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s; font-size: 0.9rem; color: #ddd;"
                 onmouseover="this.style.background='rgba(57,255,20,0.15)'"
                 onmouseout="this.style.background=''">
                <div style="font-weight: 600; color: #39FF14;">${ex.nome}</div>
                <div style="font-size: 0.8rem; color: #888; margin-top: 2px;">${ex.grupo_muscular}</div>
            </div>
        `).join('');
        dropdown.style.display = 'block';
    },

    renderModalFicha(ficha, divisoes) {
        const modalBody = document.getElementById('modal-ficha-body');
        const modalTitle = document.getElementById('modal-ficha-title');
        
        if (modalTitle) modalTitle.textContent = `Ficha de Treino - ${ficha.aluno_nome}`;
        if (!modalBody) return;

        if (!divisoes || divisoes.length === 0) {
            modalBody.innerHTML = `<div style="color: #bbb; padding: 20px; text-align: center;"><p>Esta ficha ainda nao possui nenhuma divisao cadastrada.</p></div>`;
            return;
        }

        modalBody.innerHTML = divisoes.map(div => `
            <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(57, 255, 20, 0.2); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px; margin-bottom: 12px;">
                    <h4 style="color: #39FF14; margin: 0; font-size: 1.1rem; font-weight: 700;">${div.identificador}</h4>
                    <span style="font-size: 0.8rem; background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px; color: #aaa;">Ordem: ${div.ordem}</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${div.exercicios && div.exercicios.length > 0 ? div.exercicios.map(ex => `
                        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.2); padding: 10px 14px; border-radius: 6px; font-size: 0.9rem;">
                            <div>
                                <span style="font-weight: 600; color: #fff;">${ex.nome}</span>
                                <span style="font-size: 0.75rem; color: #39FF14; background: rgba(57,255,20,0.1); padding: 2px 6px; border-radius: 4px; margin-left: 8px;">${ex.grupo_muscular}</span>
                                ${ex.descricao ? `<p style="margin: 4px 0 0 0; font-size: 0.8rem; color: #888;">${ex.descricao}</p>` : ''}
                            </div>
                            <div style="text-align: right; font-weight: 700; color: #ccc; min-width: 100px;">
                                <span>${ex.series} x ${ex.repeticoes}</span>
                            </div>
                        </div>
                    `).join('') : '<p style="color: #666; font-size: 0.85rem;">Nenhum exercicio configurado nesta divisao.</p>'}
                </div>
            </div>
        `).join('');
    },
    
    criarLinhaExercicioFicha(index) {
        return `
            <div class="exercicio-row-linear" id="exercicio-row-${index}">
                <div class="form-group-cell">
                    <label class="cell-label">Exercício</label>
                    <div style="position: relative; width: 100%;">
                        <input type="text" class="form-input search-exercicio" id="busca-exercicio-${index}" 
                               placeholder="Buscar por nome ou grupo..." onkeyup="Handlers.filtrarExerciciosParaFicha(${index})" style="width: 100%;">
                        
                        <div class="exercicio-selecionado" id="exercicio-selecionado-${index}" style="display: none; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 10px 14px; border-radius: 10px; height: 47px;">
                            <div style="display: flex; align-items: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                <strong id="nome-ex-badge-${index}" style="color: #fff; font-size: 0.95rem; margin-right: 8px;"></strong>
                                <span id="grupo-ex-badge-${index}" class="badge-status"></span>
                            </div>
                            <button type="button" class="btn-action-table" onclick="Handlers.trocarExercicioFicha(${index})" style="margin: 0; font-size: 0.8rem;">Trocar</button>
                        </div>

                        <div class="dropdown-exercicios" id="dropdown-${index}" 
                             style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: #0d0d0d; border: 1px solid rgba(57, 255, 20, 0.2); border-radius: 8px; max-height: 150px; overflow-y: auto; z-index: 10; margin-top: 2px;">
                        </div>
                        <input type="hidden" class="id-exercicio-input" id="id-exercicio-${index}" value="">
                    </div>
                </div>

                <div class="form-group-cell">
                    <label class="cell-label">Séries</label>
                    <input type="number" class="form-input series-input" id="series-${index}" placeholder="3" min="1" value="3" style="width: 100%; height: 47px;" onchange="Handlers.atualizarObjetoExercicio(${index})">
                </div>

                <div class="form-group-cell">
                    <label class="cell-label">Repetições</label>
                    <input type="text" class="form-input repeticoes-input" id="repeticoes-${index}" placeholder="10" value="10" style="width: 100%; height: 47px;" onchange="Handlers.atualizarObjetoExercicio(${index})">
                </div>

                <button type="button" class="btn-remove-exercise" onclick="Handlers.removerExercicioFicha(${index})" title="Remover exercício">
                    &times;
                </button>
            </div>
        `;
    }
};