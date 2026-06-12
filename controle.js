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

        lista.appendChild(btn);

    });

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

        modoDiscussao
        .classList.add(
            "modoAtivo"
        );

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

        carregarTribuna();

    }

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

}

function ativarTempoExtra(){

    tempoExtraAtivo = !tempoExtraAtivo;

    const btn = document.getElementById("btnTempoExtra");

    if(tempoExtraAtivo){
        btn.style.background = "#ff6f00";
    } else {
        btn.style.background = "#2b7cd3";
    }

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

}
