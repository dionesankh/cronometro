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
