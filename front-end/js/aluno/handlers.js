const Handlers = {

async carregarRotinaCompletaFicha() {
    try {
        const dadosPerfil = await ApiService.getDadosPerfil();
        if (dadosPerfil && dadosPerfil.length > 0) {
            UiService.renderObjetivoENascimento(dadosPerfil[0]);
        }

        const respostaTreino = await ApiService.getTreinoAtivo();
        
        if (respostaTreino.mensagem || !respostaTreino.divisoes) {
            UiService.renderFichaAtivaExercicios([], null);
        } else {
            UiService.renderFichaAtivaExercicios(respostaTreino.divisoes, respostaTreino.ficha.id);
        }
    } catch (error) {
        console.error(error);
        const container = document.getElementById("divisoes-treino-container");
        if (container) container.innerHTML = '<p style="color: #ff5555; padding: 20px;">Falha ao carregar dados do treino ativo vindo do servidor.</p>';
    }
},

    async submeterCheckinDiario() {
        try {
            const fichaId = document.getElementById("select-ficha").value;
            const observacoes = document.getElementById("treino-obs").value;

            if (!fichaId) {
                alert("Nao foi possivel registrar o treino. Certifique-se de possuir uma ficha ativa.");
                return;
            }

            await ApiService.registrarCheckinTreino({ fichaId, observacoes });
            
            Handlers.fecharModalRegistrarTreino();
            
            const logs = await ApiService.getHistoricoTreinos();
            UiService.renderHistoricoTabela(logs);
            
            alert("Treino registrado com sucesso! Boa performance!");
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar execucao do treino.");
        }
    },

    visualizarDetalhesDaDivisao(div) {
        UiService.renderPainelFocadoTreino(div);
    },

    exportarDivisaoEspecificaPDF(divId) {
        const elemento = document.getElementById(`print-area-divisao-${divId}`);
        const nomeAluno = document.getElementById("aluno-nome")?.textContent || "Aluno";

        if (!elemento) return;

        const videoBoxes = elemento.querySelectorAll('.video-container-embed');
        videoBoxes.forEach(box => box.classList.add('no-print'));

        const opcoes = {
            margin:       12,
            filename:     `Treino_${divId}_${nomeAluno.replace(/\s+/g, '_')}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { 
                scale: 2, 
                useCORS: true,
                backgroundColor: '#060606'
            },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opcoes).from(elemento).save().then(() => {
            videoBoxes.forEach(box => box.classList.remove('no-print'));
            console.log("PDF limpo exportado com sucesso.");
        }).catch(err => {
            videoBoxes.forEach(box => box.classList.remove('no-print'));
            console.error(err);
        });
    },

    async submeterNovosDadosCorporais() {
        try {
            const peso = parseFloat(document.getElementById("corpo-peso").value);
            const altura = parseFloat(document.getElementById("corpo-altura").value);

            if (peso < 20 || peso > 300 || altura < 1.00 || altura > 2.50) {
                alert("Valores fora dos limites permitidos (Peso: 20-300kg, Altura: 1.00-2.50m).");
                return;
            }

            await ApiService.atualizarDadosCorporais({ peso, altura });
            
            Handlers.fecharModalAtualizarDados();
            
            const evolucoes = await ApiService.getEvolucaoFisica();
            UiService.renderEvolucaoETabCards(evolucoes);
            
            alert("Dados corporais updated e IMC recalculado com sucesso!");
        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar dados corporais.");
        }
    },

    abrirModalRegistrarTreino() {
        document.getElementById("registrar-treino-modal")?.classList.remove("hidden");
    },

    fecharModalRegistrarTreino() {
        document.getElementById("registrar-treino-modal")?.classList.add("hidden");
        document.getElementById("form-registrar-treino")?.reset();
    },

    abrirModalAtualizarDados() {
        document.getElementById("atualizar-dados-modal")?.classList.remove("hidden");
    },

    fecharModalAtualizarDados() {
        document.getElementById("atualizar-dados-modal")?.classList.add("hidden");
        document.getElementById("form-atualizar-dados")?.reset();
    }
};

window.Handlers = Handlers;
window.showSection = UiService.showSection;