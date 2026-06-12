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

    try {

        const oradorAtualElemento = document.getElementById("oradorAtual");
        const cronometroElemento = document.getElementById("cronometro");
        const proximoOradorElemento = document.getElementById("proximoOrador");

        if(!oradorAtualElemento || !cronometroElemento || !proximoOradorElemento || !tituloSessao){
            console.error("salvarEstadoTelao: elementos do DOM não encontrados");
            return;
        }

        const estado = {
            tituloSessao: tituloSessao.textContent,
            oradorAtual: oradorAtualElemento.textContent,
            cronometro: cronometroElemento.textContent,
            proximoOrador: proximoOradorElemento.textContent
        };

        localStorage.setItem('estadoCronometro', JSON.stringify(estado));

    } catch(e){
        console.error("Erro ao salvar estado do telão:", e);
    }

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

    tempoInicial = 300;
    tempoRestante = 300;

    atualizarCronometro();
    salvarEstadoTelao();

    nomeInput.value = "";

}

function selecionarVereadorTribuna(nome){

    oradorTribunaLivre = nome;

    document.getElementById("oradorAtual").textContent = nome.toUpperCase();

    tempoInicial = 300;
    tempoRestante = 300;

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

    if(
        modo ===
        "discussao"
    ){

        tituloSessao.textContent =
        "DISCUSSÃO DE PROPOSIÇÕES";

        if(modoDiscussaoBtn){
            modoDiscussaoBtn
            .classList.add(
                "modoAtivo"
            );
        }

        carregarDiscussao();

    }

    if(
        modo ===
        "consideracoes"
    ){

        tituloSessao.textContent =
        "CONSIDERAÇÕES FINAIS";

        if(modoConsideracoesBtn){
            modoConsideracoesBtn
            .classList.add(
                "modoAtivo"
            );
        }

        carregarConsideracoes();

    }

    if(
        modo ===
        "tribuna"
    ){

        tituloSessao.textContent =
        "TRIBUNA LIVRE";

        if(modoTribunaBtn){
            modoTribunaBtn
            .classList.add(
                "modoAtivo"
            );
        }

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

if(!painelEsquerdo || !painelCentro || !tituloSessao){
    console.error(
        "Erro de inicialização: painéis principais não encontrados no DOM"
    );
}

const modoDiscussaoBtn =
document.getElementById(
    "modoDiscussao"
);

const modoConsideracoesBtn =
document.getElementById(
    "modoConsideracoes"
);

const modoTribunaBtn =
document.getElementById(
    "modoTribuna"
);

if(modoDiscussaoBtn){
    modoDiscussaoBtn
    .addEventListener(
        "click",
        ()=>selecionarModo(
            "discussao"
        )
    );
} else {
    console.error(
        "Elemento #modoDiscussao não encontrado"
    );
}

if(modoConsideracoesBtn){
    modoConsideracoesBtn
    .addEventListener(
        "click",
        ()=>selecionarModo(
            "consideracoes"
        )
    );
} else {
    console.error(
        "Elemento #modoConsideracoes não encontrado"
    );
}

if(modoTribunaBtn){
    modoTribunaBtn
    .addEventListener(
        "click",
        ()=>selecionarModo(
            "tribuna"
        )
    );
} else {
    console.error(
        "Elemento #modoTribuna não encontrado"
    );
}

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

    document
    .getElementById("cronometro")
    .textContent =
    formatarTempo(
        tempoRestante
    );

    salvarEstadoTelao();

}

function iniciarCronometro(){

    if(
        document
        .getElementById("oradorAtual")
        .textContent ===
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

function mostrarMensagemTempo(texto){

    const el = document.getElementById("mensagemTempo");

    if(!el){
        console.error("Elemento #mensagemTempo não encontrado");
        return;
    }

    el.textContent = texto;

    setTimeout(()=>{
        el.textContent = "";
    }, 4000);

}

function tocarAlarme(){

    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;

        if(!AudioCtx){
            console.warn("Web Audio API não suportada neste navegador");
            mostrarMensagemTempo("⚠ Alarme sonoro indisponível");
            return;
        }

        const audioContext = new AudioCtx();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);

    } catch(e){
        console.error("Erro ao tocar alarme:", e);
        mostrarMensagemTempo("⚠ Não foi possível tocar o alarme");
    }

}

function abrirTelao(){

    const janela = window.open('telao.html', 'telao', 'width=1920,height=1080');

    if(!janela){
        alert("Não foi possível abrir o telão. Verifique se o bloqueador de pop-ups está desativado.");
    }

}

function vincularBotao(id, handler){

    const el = document.getElementById(id);

    if(!el){
        console.error(
            "Elemento #" + id + " não encontrado"
        );
        return;
    }

    el.addEventListener("click", handler);

}

vincularBotao("btnIniciar", iniciarCronometro);
vincularBotao("btnPausar", pausarCronometro);
vincularBotao("btnRestaurar", restaurarCronometro);
vincularBotao("btnEncerrar", encerrarCronometro);
vincularBotao("btnTempoExtra", ativarTempoExtra);
vincularBotao("btnAlarme", ativarAlarme);
vincularBotao("btnTelao", abrirTelao);

vincularBotao("btnProximo", ()=>{

    if(
        modoSessao ===
        "consideracoes"
    ){

        chamarProximoOrador();

    }

});

vincularBotao("btnReplica", ()=>{

    if(
        modoSessao ===
        "consideracoes"
    ){

        abrirModalReplica();

    }

});

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

    const modal = document.getElementById("modalReplica");

    if(!modal){
        console.error("Elemento #modalReplica não encontrado");
        return;
    }

    modal.style.display = "flex";

}

const btnCancelarReplicaEl = document.getElementById("btnCancelarReplica");

if(btnCancelarReplicaEl){
    btnCancelarReplicaEl.addEventListener("click", ()=>{
        const modal = document.getElementById("modalReplica");
        if(modal){
            modal.style.display = "none";
        }
    });
} else {
    console.error("Elemento #btnCancelarReplica não encontrado");
}
