const express = require('express');
const AlunoController = require('../controllers/AlunoController');
const { autenticado, apenasPersonal } = require('../config/auth');

const router = express.Router();

router.post('/alunos', autenticado, apenasPersonal, AlunoController.cadastrar);
router.get('/alunos', autenticado, AlunoController.listar);
router.get('/alunos/:id', autenticado, AlunoController.buscarPorId);

router.get('/evolucao-fisica', autenticado, AlunoController.listarEvolucaoFisica);
router.post('/evolucao-fisica', autenticado, AlunoController.registrarEvolucaoFisica);

module.exports = router;