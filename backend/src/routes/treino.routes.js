const express = require('express');
const TreinoController = require('../controllers/TreinoController');
const { autenticado, apenasPersonal } = require('../auth');

const router = express.Router();

router.post('/fichas-treino/divisoes', autenticado, apenasPersonal, TreinoController.criarDivisao);
router.get('/fichas-treino', autenticado, apenasPersonal, TreinoController.listarFichas);
router.get('/fichas-treino/:fichaId', autenticado, apenasPersonal, TreinoController.buscarDetalhesFicha);

module.exports = router;