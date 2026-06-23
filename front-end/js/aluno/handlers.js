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
            const observacoesInput = document.getElementById("treino-obs").value.trim();

            if (!fichaId) {
                alert("Nao foi possivel registrar o treino. Certifique-se de possuir uma ficha ativa.");
                return;
            }

            const selectFicha = document.getElementById("select-ficha");
            const divisaoTexto = selectFicha.options[selectFicha.selectedIndex].text;
            
            const observacoesFinais = `[${divisaoTexto}] - ${observacoesInput || 'Sem comentários complementares.'}`;

            await ApiService.registrarCheckinTreino({ 
                ficha_id: parseInt(fichaId), 
                observacoes: observacoesFinais 
            });
            
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
        const elementoOrigem = document.getElementById(`print-area-divisao-${divId}`);
        const nomeAluno = document.getElementById("aluno-nome")?.textContent || "Aluno";

        if (!elementoOrigem) return;

        const novaAba = window.open('', '_blank');
        if (!novaAba) {
            alert("Por favor, permita pop-ups para conseguir exportar o PDF.");
            return;
        }

        const conteudoClonado = elementoOrigem.cloneNode(true);

        const videoBoxes = conteudoClonado.querySelectorAll('.video-container-embed');
        videoBoxes.forEach(box => box.style.display = 'none');

        const caixaTreino = conteudoClonado.querySelector('.container-treino-principal');
        if (caixaTreino) {
            caixaTreino.style.background = '#ffffff';
            caixaTreino.style.color = '#000000';
            caixaTreino.style.padding = '20px';
            caixaTreino.style.boxShadow = 'none';

            const titulo = caixaTreino.querySelector('h2');
            if (titulo) {
                titulo.style.color = '#000000';
                titulo.style.borderBottom = '2px solid #000000';
            }

            const blocosEx = caixaTreino.querySelectorAll('.exercicio-bloco-pdf');
            blocosEx.forEach(bloco => {
                bloco.style.background = '#ffffff';
                bloco.style.border = '1px solid #dddddd';
                bloco.style.color = '#000000';
                
                const forte = bloco.querySelector('strong');
                if (forte) forte.style.color = '#000000';
                const p = bloco.querySelector('p');
                if (p) p.style.color = '#444444';

                const badge = bloco.querySelector('.badge-carga-pdf');
                if (badge) {
                    badge.style.background = '#f0f0f0';
                    badge.style.color = '#000000';
                    badge.style.border = '1px solid #cccccc';
                }
            });
        }

            novaAba.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Ficha de treino - ${nomeAluno}</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
                <style>
                    body {
                        background: #ffffff !important;
                        color: #000000 !important;
                        font-family: 'Inter', sans-serif;
                        margin: 20px;
                        padding: 0;
                    }
                    
                    .exercicio-bloco-pdf span, 
                    span[style*="color: #39FF14"],
                    span[style*="color:#39FF14"] {
                        color: #000000 !important;
                        background: #e0e0e0 !important;
                        border: 1px solid #cccccc !important;
                    }
                    @media print {
                        @page { margin: 10mm; }
                        body { margin: 0; }
                    }
                </style>
            </head>
            <body>
                ${conteudoClonado.innerHTML}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 500);
                    };
                <\/script>
            </body>
            </html>
        `);

        novaAba.document.close();
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