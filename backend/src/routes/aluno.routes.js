const express = require('express');
const AlunoController = require('../controllers/AlunoController');
const { autenticado, apenasPersonal, apenasAluno } = require('../config/auth');

const router = express.Router();

router.post('/alunos', autenticado, apenasPersonal, AlunoController.cadastrar);
router.get('/alunos', autenticado, AlunoController.listar);
router.get('/alunos/:id', autenticado, AlunoController.buscarPorId);

router.get('/evolucao-fisica', autenticado, apenasAluno, AlunoController.listarEvolucaoFisica);
router.post('/evolucao-fisica', autenticado, apenasAluno, AlunoController.registrarEvolucaoFisica);

module.exports = router;