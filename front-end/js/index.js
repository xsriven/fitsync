// Script de navegação da página inicial
const startBtn = document.getElementById('startBtn');
const userForm = document.getElementById('userForm');

startBtn.addEventListener('click', function() {
    this.style.display = 'none';
    userForm.classList.add('show-form');
});

function irPara(url) {
    window.location.href = url;
}