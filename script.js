// CONTADOR REGRESSIVO
function getNextFriday17h() {
    const now = new Date();
    const resultDate = new Date();
    
    resultDate.setDate(now.getDate() + (5 + 7 - now.getDay()) % 7);
    resultDate.setHours(17, 0, 0, 0);
    
    if (resultDate <= now) {
        resultDate.setDate(resultDate.getDate() + 7);
    }
    
    return resultDate.getTime();
}

const targetTime = getNextFriday17h();

const timer = setInterval(function() {
    const now = new Date().getTime();
    const difference = targetTime - now;
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    document.getElementById("days").innerText = days < 10 ? "0" + days : days;
    document.getElementById("hours").innerText = hours < 10 ? "0" + hours : hours;
    document.getElementById("minutes").innerText = minutes < 10 ? "0" + minutes : minutes;
    document.getElementById("seconds").innerText = seconds < 10 ? "0" + seconds : seconds;
    
    if (difference < 0) {
        clearInterval(timer);
        document.getElementById("countdown").innerHTML = "<h3 style='font-size:2rem; color:#ff4757;'>Chegou a hora! ❤️</h3>";
    }
}, 1000);


// GERENCIADOR DE ÁUDIO POR SEÇÃO (VERSÃO FINAL UNIFICADA)
const secoes = [
    { elemento: document.querySelector('.countdown-section'), audio: document.getElementById('audio-tictac') },
    { elemento: document.getElementById('secao-encontro1'), audio: document.getElementById('audio-encontro1') },
    { elemento: document.getElementById('secao-encontro2'), audio: document.getElementById('audio-encontro2') },
    { elemento: document.getElementById('secao-encontro3'), audio: document.getElementById('audio-encontro3') },
    { elemento: document.getElementById('secao-momentos'), audio: document.getElementById('audio-momentos') }
];

let audioIniciado = false;

function iniciarAudios() {
    if (!audioIniciado) {
        audioIniciado = true;
        controlarMusicaPorScroll();
        window.removeEventListener('click', iniciarAudios);
        window.removeEventListener('scroll', iniciarAudios);
    }
}

window.addEventListener('click', iniciarAudios);
window.addEventListener('scroll', iniciarAudios);

function controlarMusicaPorScroll() {
    if (!audioIniciado) return;

    let secaoAtiva = null;
    let maiorVisibilidade = -Infinity;

    // 1. Calcula a visibilidade das seções mapeadas
    secoes.forEach(secao => {
        const retangulo = secao.elemento.getBoundingClientRect();
        const inicioVisivel = Math.max(0, retangulo.top);
        const fimVisivel = Math.min(window.innerHeight, retangulo.bottom);
        const alturaVisivel = Math.max(0, fimVisivel - inicioVisivel);

        if (alturaVisivel > maiorVisibilidade) {
            maiorVisibilidade = alturaVisivel;
            secaoAtiva = secao;
        }
    });

    // 2. CHECAGEM ESPECIAL: Se o usuário estiver na seção da carta, 
    // consideramos que ele ainda está na seção de momentos para manter a música!
    const secaoCarta = document.querySelector('.carta-section');
    if (secaoCarta) {
        const retanguloCarta = secaoCarta.getBoundingClientRect();
        const inicioCarta = Math.max(0, retanguloCarta.top);
        const fimCarta = Math.min(window.innerHeight, retanguloCarta.bottom);
        const alturaCarta = Math.max(0, fimCarta - inicioCarta);

        // Se a carta estiver aparecendo mais na tela do que a seção ativa atual
        if (alturaCarta > maiorVisibilidade) {
            secaoAtiva = secoes.find(s => s.elemento.id === 'secao-momentos');
        }
    }

    // 3. Executa o play/pause sem dar conflito de repetição
    if (secaoAtiva) {
        secoes.forEach(secao => {
            if (secao === secaoAtiva) {
                if (secao.audio.paused) {
                    secao.audio.play().catch(e => console.log("Aguardando clique: ", e));
                }
            } else {
                // Só pausa se a próxima seção ativa NÃO usar o mesmo áudio
                if (secaoAtiva.audio !== secao.audio) {
                    secao.audio.pause();
                    secao.audio.currentTime = 0;
                }
            }
        });
    }
}

let emEspera = false;
window.addEventListener('scroll', function() {
    if (!emEspera) {
        window.requestAnimationFrame(function() {
            controlarMusicaPorScroll();
            emEspera = false;
        });
        emEspera = true;
    }
});