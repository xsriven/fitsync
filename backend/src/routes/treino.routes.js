const express = require('express');
const TreinoController = require('../controllers/TreinoController');
const { autenticado, apenasPersonal } = require('../config/auth');

const router = express.Router();

router.post('/fichas-treino/divisoes', autenticado, apenasPersonal, TreinoController.criarDivisao);
router.get('/fichas-treino', autenticado, apenasPersonal, TreinoController.listarFichas);
router.get('/fichas-treino/:fichaId', autenticado, apenasPersonal, TreinoController.buscarDetalhesFicha);
router.delete('/fichas-treino/:fichaId', autenticado, apenasPersonal, TreinoController.excluirFicha);
router.get('/treinos', autenticado, apenasPersonal, TreinoController.listarFichas);

router.get('/meu-treino-ativo', autenticado, TreinoController.buscarFichaAtivaAluno);
router.post('/execucoes-treino', autenticado, TreinoController.registrarExecucao);
router.get('/execucoes-treino', autenticado, TreinoController.listarExecucoes);

module.exports = router;