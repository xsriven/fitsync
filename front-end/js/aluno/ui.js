const UiService = {
    showSection(sectionId) {
        document.querySelectorAll(".content-section").forEach(sec => sec.style.display = "none");
        const targetSection = document.getElementById(sectionId);
        if (targetSection) targetSection.style.display = "block";

        document.querySelectorAll(".sidebar-link").forEach(btn => btn.classList.remove("active"));
        const activeBtn = document.querySelector(`button[onclick*="showSection('${sectionId}')"]`);
        if (activeBtn) activeBtn.classList.add("active");
    },

    renderHeaderEPerfilStatic(usuarioLogado) {
        if (!usuarioLogado) return;
        document.getElementById("aluno-nome").textContent = usuarioLogado.nome;
        document.getElementById("perfil-nome").value = usuarioLogado.nome;
        document.getElementById("perfil-email").value = usuarioLogado.email;
        document.getElementById("userGreeting").textContent = `Bora treinar, ${usuarioLogado.nome.split(' ')[0]}?`;
    },

    renderObjetivoENascimento(aluno) {
        if (!aluno) return;
        document.getElementById("aluno-objetivo-sidebar").textContent = `Objetivo: ${aluno.objetivo || "Nao definido"}`;
        const inputNascimento = document.getElementById("perfil-nascimento");
        if (inputNascimento && aluno.data_nascimento) {
            inputNascimento.value = new Date(aluno.data_nascimento).toLocaleDateString('pt-BR');
        }
    },

    renderFichaAtivaExercicios(divisoes, fichaId) {
        const container = document.getElementById("divisoes-treino-container");
        const selectFichaCheckin = document.getElementById("select-ficha");
        if (!container) return;

        if (!divisoes || divisoes.length === 0) {
            container.innerHTML = `
                <div class="card" style="text-align: center; color: #666; padding: 40px; width: 100%;">
                    Nenhuma ficha de treino ativa vinculada a voce. Solicite ao seu Personal Trainer!
                </div>
            `;
            if (selectFichaCheckin) selectFichaCheckin.innerHTML = '<option value="">Nenhum treino disponivel</option>';
            return;
        }

        if (selectFichaCheckin && fichaId) {
            selectFichaCheckin.innerHTML = divisoes.map(div => `
                <option value="${fichaId}">Ficha Ativa - ${div.identificador}</option>
            `).join('');
        }

        container.style.cssText = "display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; width: 100%;";
        container.innerHTML = divisoes.map(div => `
            <div class="exercicio-item-treino" style="cursor: pointer; background: rgba(20, 20, 20, 0.6); padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); transition: all 0.2s;" 
                 onclick="Handlers.visualizarDetalhesDaDivisao(${JSON.stringify(div).replace(/"/g, '&quot;')})"
                 onmouseover="this.style.borderColor='rgba(57, 255, 20, 0.4)'; this.style.transform='translateY(-2px)';" 
                 onmouseout="this.style.borderColor='rgba(255,255,255,0.05)'; this.style.transform='none';">
                <p class="eyebrow" style="margin: 0 0 4px 0;">Rotina Semanal</p>
                <h3 style="color: #fff; margin: 0 0 12px 0; font-size: 1.15rem;">${div.identificador}</h3>
                <span style="font-size: 0.8rem; color: #39FF14; background: rgba(57,255,20,0.1); padding: 4px 10px; border-radius: 6px; font-weight: 600;">
                    ${div.exercicios ? div.exercicios.length : 0} Exercicios vinculados
                </span>
            </div>
        `).join('');
    },

    renderPainelFocadoTreino(div) {
        const container = document.getElementById("divisoes-treino-container");
        if (!container) return;

        container.style.cssText = "display: flex; flex-direction: column; gap: 25px; width: 100%;";
        
        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.03); padding: 15px 20px; border-radius: 12px; margin-bottom: 10px;">
                <button class="secondary-button btn-small" onclick="Handlers.carregarRotinaCompletaFicha()" style="padding: 8px 16px; font-size: 0.85rem; color: #aaa; border-color: rgba(255,255,255,0.1);">⬅ Voltar aos Treinos</button>
                <div style="display: flex; gap: 10px;">
                    <button class="secondary-button btn-small" onclick="Handlers.exportarDivisaoEspecificaPDF(${div.id})" style="border-color: rgba(57, 255, 20, 0.3); color: #39FF14; padding: 8px 16px; font-size: 0.85rem;">Exportar para PDF</button>
                </div>
            </div>

            <div id="print-area-divisao-${div.id}">
                <div class="container-treino-principal" style="background: rgba(20, 20, 20, 0.8); border: 1px solid rgba(57, 255, 20, 0.15); border-radius: 16px; padding: 30px; box-shadow: 0 15px 35px rgba(0,0,0,0.5);">
                    <h2 style="color: #39FF14; margin: 0 0 24px 0; font-size: 1.4rem; font-weight: 700;">Divisão de treino: ${div.identificador}</h2>
                    
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        ${div.exercicios && div.exercicios.length > 0 ? div.exercicios.map(ex => {
                            let videoEmbedHTML = '';
                            if (ex.url_execucao && ex.url_execucao.includes('youtube.com/watch?v=')) {
                                const videoId = ex.url_execucao.split('v=')[1]?.split('&')[0];
                                if (videoId) {
                                    videoEmbedHTML = `
                                        <div id="video-box-${ex.id}" class="video-container-embed" style="flex: 1.2; min-width: 320px; max-width: 440px; width: 100%;">
                                            <div style="position: relative; width: 100%; padding-top: 56.25%; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06); background: #000; box-shadow: 0 8px 24px rgba(0,0,0,0.4);">
                                                <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                                            </div>
                                        </div>
                                    `;
                                }
                            }

                            return `
                                <div class="exercicio-bloco-pdf" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.04); padding: 24px; border-radius: 14px; gap: 24px;">
                                    <div id="text-box-${ex.id}" style="flex: 1; min-width: 280px; display: flex; flex-direction: column; justify-content: center; gap: 12px;">
                                        <div>
                                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                                                <strong style="color: #fff; font-size: 1.2rem; font-weight: 600; letter-spacing: -0.2px;">${ex.nome}</strong>
                                                <span style="font-size: 0.75rem; color: #39FF14; background: rgba(57,255,20,0.1); padding: 3px 10px; border-radius: 6px; font-weight: 600; text-transform: uppercase;">${ex.grupo_muscular}</span>
                                            </div>
                                            <p style="color: #888; font-size: 0.9rem; margin: 0; line-height: 1.5; max-width: 650px;">${ex.descricao || 'Sem recomendacoes tecnicas complementares cadastradas.'}</p>
                                        </div>
                                        <div>
                                            <span class="badge-carga-pdf" style="font-weight: 700; color: #39FF14; font-size: 1.05rem; background: rgba(57, 255, 20, 0.05); border: 1px solid rgba(57, 255, 20, 0.15); display: inline-block; padding: 6px 16px; border-radius: 8px; letter-spacing: 0.5px;">
                                                ${ex.series} × ${ex.repeticoes} Repeticoes
                                            </span>
                                        </div>
                                    </div>
                                    ${videoEmbedHTML}
                                </div>
                            `;
                        }).join('') : '<p style="color: #555; font-style: italic; padding: 10px;">Nenhum exercicio anexado a essa divisao de carga.</p>'}
                    </div>
                </div>
            </div>
        `;
    },

    renderHistoricoTabela(execucoes) {
        const container = document.getElementById("historico-container");
        if (!container) return;

        if (!execucoes || execucoes.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; color: #666; padding: 40px;">
                        Nenhuma execucao de treino registrada ate o momento.
                    </td>
                </tr>
            `;
            return;
        }

        container.innerHTML = execucoes.map(exec => {
            const dataFormatada = new Date(exec.data_execucao).toLocaleString('pt-BR');
            return `
                <tr>
                    <td>${dataFormatada}</td>
                    <td><span style="color: #39FF14; background: rgba(57,255,20,0.05); padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; border: 1px solid rgba(57,255,20,0.15);">Sessao Concluida</span></td>
                    <td>${exec.observacoes || "<span style='color:#444;'>Sem observacoes tecnicas</span>"}</td>
                </tr>
            `;
        }).join('');
    },

    renderEvolucaoETabCards(evolucoes) {
        const container = document.getElementById("evolucao-container");
        if (!container || evolucoes.length === 0) return;

        const maisRecente = evolucoes[evolucoes.length - 1];
        document.getElementById("total-peso").textContent = `${parseFloat(maisRecente.peso).toFixed(1)} kg`;
        
        const imcAtual = (maisRecente.peso / (maisRecente.altura * maisRecente.altura)).toFixed(2);
        document.getElementById("total-imc").textContent = imcAtual;

        container.innerHTML = evolucoes.map(ev => {
            const dataFormatada = new Date(ev.data_registro).toLocaleDateString('pt-BR');
            const imcLinha = (ev.peso / (ev.altura * ev.altura)).toFixed(2);
            return `
                <tr>
                    <td>${dataFormatada}</td>
                    <td>${ev.peso} kg</td>
                    <td>${ev.altura} m</td>
                    <td><strong style="color: #39FF14;">${imcLinha}</strong></td>
                </tr>
            `;
        }).join('');
    },
}