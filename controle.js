"use strict";

/* ==========================
ESTADO GLOBAL
========================== */

let modoSessao =
"consideracoes";
let historicoDiscussao = [];


let tempoInicial = 300;
let tempoRestante = 300;
let filaConsideracoes = [];
let cronometroRodando = false;
let intervaloCronometro = null;
let oradorAtualConsideracoes = null;
let tempoExtraAtivo = false;
let alarmeAtivo = false;
let oradorTribunaLivre = null;
let filaReplicas = [];

/* ==========================
VEREADORES
========================== */

const vereadores = [

"Alexandre de Barros Mendes",
"Aline Moreira Silva Melo",
"André Eustaquio Alves",
"Antônio Domingos Ximendes Trindade",
"Aparecida Sônia Ferreira Vidal",
"Breno Reis de Oliveira",
"Gilson Fazolla Filgueiras",
"Jane Cristina Lacerda Pinto",
"José Maria Fernandes",
"José Roberto Reis Filgueiras",
"Lucas Rufino Zocóli",
"Marilda Aparecida Leoncio",
"Paulo Cezar Tavares",
"Renato Vieira",
"Samuel Soares da Silva"

];

/* ==========================
FUNÇÕES DE SINCRONIZAÇÃO
========================== */

function salvarEstadoTelao(){

    const oradorAtualElemento = document.getElementById("oradorAtual");
    let oradorExibir = oradorAtualElemento.textContent;

    const cronEl = document.getElementById("cronometro");

    const estado = {
        tituloSessao: tituloSessao.textContent,
        oradorAtual: oradorExibir,
        cronometro: cronEl.textContent,
        cronometroCor: cronEl.style.color || "",
        proximoOrador: document.getElementById("proximoOrador").textContent,
        modoSessao: modoSessao
    };

    localStorage.setItem('estadoCronometro', JSON.stringify(estado));

}

/* ==========================
TELAS
========================== */

function carregarDiscussao(){

    painelEsquerdo.innerHTML = `

        <h2>Vereadores</h2>

        <div id="listaDiscussao"></div>

    `;

    painelCentro.innerHTML = `

        <h2>Histórico</h2>

        <div id="historicoDiscussao"></div>

    `;

    const lista =
    document.getElementById(
        "listaDiscussao"
    );

    vereadores.forEach(nome=>{

        const btn =
        document.createElement(
            "button"
        );

        btn.textContent =
        nome;

        btn.className =
        "botaoVereador";

        btn.onclick = ()=>{

            selecionarOradorDiscussao(
                nome
            );

        };

        lista.appendChild(
            btn
        );

    });

    atualizarHistoricoDiscussao();

}

function carregarConsideracoes(){

    painelEsquerdo.innerHTML = `

        <h2>
            Inscrição dos Vereadores
        </h2>

        <div id="listaConsideracoes"></div>

    `;

    painelCentro.innerHTML = `

        <h2>
            Fila de Oradores
        </h2>

        <div id="filaOradores"></div>

        <hr>

        <h3>
            Réplicas Pendentes
        </h3>

        <div id="filaReplicas"></div>

    `;

    const lista =
    document.getElementById(
        "listaConsideracoes"
    );

    vereadores.forEach(nome=>{

        const btn =
        document.createElement(
            "button"
        );

        btn.textContent =
        nome;

        btn.className =
        "botaoVereador";

        btn.onclick = ()=>{

            inscreverVereador(
                nome
            );

        };

        lista.appendChild(
            btn
        );

    });

    atualizarFilaConsideracoes();

}

function carregarTribuna(){

    painelEsquerdo.innerHTML = `

        <h2>
            Tribuna Livre
        </h2>

        <input
        id="nomeConvidado"
        placeholder="Nome do convidado">

        <button
        id="btnRegistrarConvidado">

            Registrar Orador

        </button>

    `;

    painelCentro.innerHTML = `

        <h2>
            Comentários dos Vereadores
        </h2>

        <div id="listaComentarios"></div>

    `;

    const lista =
    document.getElementById(
        "listaComentarios"
    );

    vereadores.forEach(nome=>{

        const btn =
        document.createElement(
            "button"
        );

        btn.textContent =
        nome;

        btn.className =
        "botaoVereador";

        btn.onclick = ()=>{

            selecionarVereadorTribuna(
                nome
            );

        };

        lista.appendChild(btn);

    });

    // Adicionar listener para registrar convidado
    document.getElementById("btnRegistrarConvidado").addEventListener("click", registrarConvidado);

}

function registrarConvidado(){

    const nomeInput = document.getElementById("nomeConvidado");
    const nome = nomeInput.value.trim();

    if(nome === ""){
        alert("Por favor, insira um nome");
        return;
    }

    oradorTribunaLivre = nome;

    document.getElementById("oradorAtual").textContent = nome.toUpperCase();

    tempoInicial = 600;
    tempoRestante = 600;

    atualizarCronometro();
    salvarEstadoTelao();

    nomeInput.value = "";

}

function selecionarVereadorTribuna(nome){

    oradorTribunaLivre = nome;

    document.getElementById("oradorAtual").textContent = nome.toUpperCase();

    tempoInicial = 120;
    tempoRestante = 120;

    atualizarCronometro();
    salvarEstadoTelao();

}

/* ==========================
MODOS
========================== */

function selecionarModo(
    modo
){

    modoSessao =
    modo;

    document
    .querySelectorAll(
        ".modosSessao button"
    )
    .forEach(btn=>
        btn.classList.remove(
            "modoAtivo"
        )
    );

    const proximoEl =
    document.getElementById(
        "proximoOrador"
    );

    const btnProximoEl =
    document.getElementById(
        "btnProximo"
    );

    const btnReplicaEl =
    document.getElementById(
        "btnReplica"
    );

    if(
        modo ===
        "discussao"
    ){

        tituloSessao.textContent =
        "DISCUSSÃO DE PROPOSIÇÕES";

        modoDiscussao
        .classList.add(
            "modoAtivo"
        );

        proximoEl.style.display = "none";
        btnProximoEl.style.display = "none";
        btnReplicaEl.style.display = "none";

        carregarDiscussao();

    }

    if(
        modo ===
        "consideracoes"
    ){

        tituloSessao.textContent =
        "CONSIDERAÇÕES FINAIS";

        modoConsideracoes
        .classList.add(
            "modoAtivo"
        );

        proximoEl.style.display = "";
        btnProximoEl.style.display = "";
        btnReplicaEl.style.display = "";

        carregarConsideracoes();

    }

    if(
        modo ===
        "tribuna"
    ){

        tituloSessao.textContent =
        "TRIBUNA LIVRE";

        modoTribuna
        .classList.add(
            "modoAtivo"
        );

        proximoEl.style.display = "none";
        btnProximoEl.style.display = "none";
        btnReplicaEl.style.display = "none";

        carregarTribuna();

    }

    salvarEstadoTelao();

}

/* ==========================
INICIALIZAÇÃO
========================== */

const painelEsquerdo =
document.getElementById(
    "painelEsquerdo"
);

const painelCentro =
document.getElementById(
    "painelCentro"
);

const tituloSessao =
document.getElementById(
    "tituloSessao"
);

modoDiscussao
.addEventListener(
    "click",
    ()=>selecionarModo(
        "discussao"
    )
);

modoConsideracoes
.addEventListener(
    "click",
    ()=>selecionarModo(
        "consideracoes"
    )
);

modoTribuna
.addEventListener(
    "click",
    ()=>selecionarModo(
        "tribuna"
    )
);

selecionarModo(
    "consideracoes"
);

function selecionarOradorDiscussao(
    nome
){

    document
    .getElementById(
        "oradorAtual"
    )
    .textContent =
    nome.toUpperCase();

    historicoDiscussao.push(
        nome
    );

    atualizarHistoricoDiscussao();
    
    tempoInicial = 300;
    tempoRestante = 300;

    atualizarCronometro();
    salvarEstadoTelao();
}


function atualizarHistoricoDiscussao(){

    const div =
    document.getElementById(
        "historicoDiscussao"
    );

    if(!div){
        return;
    }

    div.innerHTML = "";

    historicoDiscussao
    .slice()
    .reverse()
    .forEach(nome=>{

        const item =
        document.createElement(
            "div"
        );

        item.className =
        "botaoVereador";

        item.textContent =
        nome;

        div.appendChild(
            item
        );

    });

}

function formatarTempo(segundos){

    const min =
    Math.floor(Math.abs(segundos) / 60);

    const seg =
    Math.abs(segundos) % 60;

    const sinal = segundos < 0 ? "-" : "";

    return sinal + String(min)
    .padStart(2,"0")
    + ":"
    + String(seg)
    .padStart(2,"0");

}

function atualizarCronometro(){

    const cronEl =
    document.getElementById("cronometro");

    cronEl.textContent =
    formatarTempo(
        tempoRestante
    );

    if(tempoRestante <= 0){
        cronEl.style.color = "#d32f2f";
    } else if(tempoRestante <= 10){
        cronEl.style.color = "#f57c00";
    } else if(tempoRestante <= 30){
        cronEl.style.color = "#f9a825";
    } else {
        cronEl.style.color = "";
    }

    salvarEstadoTelao();

}

function iniciarCronometro(){

    if(
        document
        .getElementById("oradorAtual")
        .textContent.trim() ===
        "AGUARDANDO INÍCIO"
    ){
        return;
    }

    if(cronometroRodando){
        return;
    }

    cronometroRodando = true;

    intervaloCronometro =
    setInterval(()=>{

        tempoRestante--;

        atualizarCronometro();

        // Verificar se deve ativar alarme ao chegar em 00:00
        if(tempoRestante === 0 && alarmeAtivo){
            tocarAlarme();
        }

    },1000);

}

function pausarCronometro(){

    cronometroRodando = false;

    clearInterval(
        intervaloCronometro
    );

}

function restaurarCronometro(){

    pausarCronometro();

    tempoRestante =
    tempoInicial;

    atualizarCronometro();

}

function encerrarCronometro(){

    pausarCronometro();

    document
    .getElementById("oradorAtual")
    .textContent =
    "AGUARDANDO INÍCIO";

    if(modoSessao === "tribuna"){
        oradorTribunaLivre = null;
    }

    salvarEstadoTelao();

}

function ativarTempoExtra(){

    tempoExtraAtivo = !tempoExtraAtivo;

    const btn = document.getElementById("btnTempoExtra");

    if(tempoExtraAtivo){
        btn.style.background = "#ff6f00";
        btn.textContent = "🟠 Tempo Extra";
    } else {
        btn.style.background = "#2b7cd3";
        btn.textContent = "🟢 Tempo Extra";
    }

}

function ativarAlarme(){

    alarmeAtivo = !alarmeAtivo;

    const btn = document.getElementById("btnAlarme");

    if(alarmeAtivo){
        btn.style.background = "#ff6f00";
        btn.textContent = "🟠 Alarme";
    } else {
        btn.style.background = "#2b7cd3";
        btn.textContent = "🟢 Alarme";
    }

}

function tocarAlarme(){

    // Tentar criar som com Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800; // Frequência em Hz
        oscillator.type = 'sine'; // Tipo de onda
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        
    } catch(e){
        console.log("Áudio não suportado");
    }

}

function abrirTelao(){

    window.open('telao.html', 'telao', 'width=1920,height=1080');

}

btnIniciar.addEventListener(
    "click",
    iniciarCronometro
);

btnPausar.addEventListener(
    "click",
    pausarCronometro
);

btnRestaurar.addEventListener(
    "click",
    restaurarCronometro
);

btnEncerrar.addEventListener(
    "click",
    encerrarCronometro
);

btnTempoExtra.addEventListener(
    "click",
    ativarTempoExtra
);

btnAlarme.addEventListener(
    "click",
    ativarAlarme
);

btnTelao.addEventListener(
    "click",
    abrirTelao
);

btnProximo.addEventListener(
    "click",
    ()=>{

        if(
            modoSessao ===
            "consideracoes"
        ){

            chamarProximoOrador();

        }

    }
);

btnReplica.addEventListener(
    "click",
    ()=>{

        if(
            modoSessao ===
            "consideracoes"
        ){

            abrirModalReplica();

        }

    }
);

function inscreverVereador(
    nome
){

    if(
        filaConsideracoes.includes(
            nome
        )
    ){
        return;
    }

    if(
        document
        .getElementById("oradorAtual")
        .textContent.trim() ===
        nome.toUpperCase()
    ){
        return;
    }

    filaConsideracoes.push(
        nome
    );

    atualizarFilaConsideracoes();

}

function atualizarFilaConsideracoes(){

    const div =
    document.getElementById(
        "filaOradores"
    );

    if(!div){
        return;
    }

    div.innerHTML = "";

    document
    .getElementById(
        "proximoOrador"
    )
    .textContent =

    filaConsideracoes.length > 0

    ? "Próximo Orador: " +
    filaConsideracoes[0]

    : "Próximo Orador: ---";

    filaConsideracoes.forEach(
        (nome,index)=>{

        const item =
        document.createElement(
            "div"
        );

        item.className =
        "itemFila";

        item.innerHTML = `

            <span>

                ${index+1}º
                ${nome}

            </span>

            <div>

                <button
                onclick="
                subirOrador(
                ${index}
                )">

                ▲

                </button>

                <button
                onclick="
                descerOrador(
                ${index}
                )">

                ▼

                </button>

            </div>

        `;

        div.appendChild(
            item
        );

    });

}

function subirOrador(
    index
){

    if(index === 0){
        return;
    }

    [
        filaConsideracoes[index-1],
        filaConsideracoes[index]
    ] =
    [
        filaConsideracoes[index],
        filaConsideracoes[index-1]
    ];

    atualizarFilaConsideracoes();

}

function descerOrador(
    index
){

    if(
        index >=
        filaConsideracoes.length-1
    ){
        return;
    }

    [
        filaConsideracoes[index+1],
        filaConsideracoes[index]
    ] =
    [
        filaConsideracoes[index],
        filaConsideracoes[index+1]
    ];

    atualizarFilaConsideracoes();

}

function chamarProximoOrador(){

    if(
        filaConsideracoes.length === 0
    ){
        return;
    }

    const nome =
    filaConsideracoes.shift();

    oradorAtualConsideracoes =
    nome;

    document
    .getElementById("oradorAtual")
    .textContent =
    nome.toUpperCase();

    tempoInicial = 300;
    tempoRestante = 300;

    atualizarCronometro();

    atualizarFilaConsideracoes();

    document
    .getElementById(
        "proximoOrador"
    )
    .textContent =

    filaConsideracoes.length > 0

    ? "Próximo Orador: " +
    filaConsideracoes[0]

    : "Próximo Orador: ---";

    // Forçar sincronização do telão
    setTimeout(() => {
        salvarEstadoTelao();
    }, 100);

}

function abrirModalReplica(){

    document.getElementById("modalReplica").style.display = "flex";

}

document.getElementById("btnCancelarReplica").addEventListener("click", ()=>{
    document.getElementById("modalReplica").style.display = "none";
});
