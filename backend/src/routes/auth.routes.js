const express = require('express');
const AuthController = require('../controllers/AuthController');
const PersonalController = require('../controllers/PersonalController');

const router = express.Router();

router.post('/login', AuthController.login);
router.post('/personal-trainers', PersonalController.cadastrar);

module.exports = router;