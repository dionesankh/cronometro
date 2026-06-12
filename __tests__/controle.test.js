const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const htmlSource = fs.readFileSync(
  path.resolve(__dirname, "..", "cronometro.html"),
  "utf-8"
);
const jsSource = fs.readFileSync(
  path.resolve(__dirname, "..", "controle.js"),
  "utf-8"
);

let dom, win, doc;

function orador() {
  return doc.getElementById("oradorAtual").textContent;
}
function cronometroText() {
  return doc.getElementById("cronometro").textContent;
}
function proximoText() {
  return doc.getElementById("proximoOrador").textContent;
}
function tituloText() {
  return doc.getElementById("tituloSessao").textContent;
}
function queueItems() {
  const el = doc.getElementById("filaOradores");
  if (!el) return [];
  return Array.from(el.querySelectorAll(".itemFila span")).map((s) =>
    s.textContent.replace(/^\s*\d+º\s*/, "").trim()
  );
}

function initApp() {
  jest.useFakeTimers();
  dom = new JSDOM(htmlSource, {
    runScripts: "dangerously",
    pretendToBeVisual: true,
    url: "http://localhost",
  });
  win = dom.window;
  doc = win.document;

  const scriptEl = doc.createElement("script");
  scriptEl.textContent = jsSource;
  doc.body.appendChild(scriptEl);
}

// ============================================================
// formatarTempo — pure time formatting
// ============================================================

describe("formatarTempo", () => {
  beforeEach(() => initApp());
  afterEach(() => jest.useRealTimers());

  test("formats 300s as 05:00", () => {
    expect(win.formatarTempo(300)).toBe("05:00");
  });

  test("formats 0s as 00:00", () => {
    expect(win.formatarTempo(0)).toBe("00:00");
  });

  test("formats 59s as 00:59", () => {
    expect(win.formatarTempo(59)).toBe("00:59");
  });

  test("formats 3661s as 61:01", () => {
    expect(win.formatarTempo(3661)).toBe("61:01");
  });

  test("formats negative seconds with minus sign", () => {
    expect(win.formatarTempo(-5)).toBe("-00:05");
    expect(win.formatarTempo(-65)).toBe("-01:05");
  });
});

// ============================================================
// inscreverVereador — queue behaviour
// ============================================================

describe("inscreverVereador / fila de considerações", () => {
  beforeEach(() => initApp());
  afterEach(() => jest.useRealTimers());

  test("first vereador goes to queue without auto-starting", () => {
    expect(orador().trim()).toBe("AGUARDANDO INÍCIO");
    win.inscreverVereador("Vereador Lucas Rufino Zocóli");
    expect(orador().trim()).toBe("AGUARDANDO INÍCIO");
    expect(queueItems()).toEqual(["Vereador Lucas Rufino Zocóli"]);
  });

  test("does not add duplicate vereador", () => {
    win.inscreverVereador("Vereador Alexandre de Barros Mendes");
    win.inscreverVereador("Vereador Renato Vieira");
    win.inscreverVereador("Vereador Renato Vieira");
    expect(queueItems()).toEqual(["Vereador Alexandre de Barros Mendes", "Vereador Renato Vieira"]);
  });

  test("multiple inscribed vereadores all stay in queue", () => {
    win.inscreverVereador("Vereador Lucas Rufino Zocóli");
    win.inscreverVereador("Vereador Paulo Cezar Tavares");
    expect(orador().trim()).toBe("AGUARDANDO INÍCIO");
    expect(queueItems()).toEqual(["Vereador Lucas Rufino Zocóli", "Vereador Paulo Cezar Tavares"]);
  });
});

// ============================================================
// subirOrador / descerOrador — queue reordering
// ============================================================

describe("subirOrador / descerOrador", () => {
  beforeEach(() => {
    initApp();
    win.inscreverVereador("Vereador Renato Vieira");
    win.inscreverVereador("Vereador Paulo Cezar Tavares");
    win.inscreverVereador("Vereador Samuel Soares da Silva");
    // queue: [Renato, Paulo, Samuel]
  });
  afterEach(() => jest.useRealTimers());

  test("subirOrador swaps element up", () => {
    win.subirOrador(1);
    const q = queueItems();
    expect(q[0]).toBe("Vereador Paulo Cezar Tavares");
    expect(q[1]).toBe("Vereador Renato Vieira");
  });

  test("subirOrador at index 0 does nothing", () => {
    const before = queueItems();
    win.subirOrador(0);
    expect(queueItems()).toEqual(before);
  });

  test("descerOrador swaps element down", () => {
    win.descerOrador(0);
    const q = queueItems();
    expect(q[0]).toBe("Vereador Paulo Cezar Tavares");
    expect(q[1]).toBe("Vereador Renato Vieira");
  });

  test("descerOrador at last index does nothing", () => {
    const before = queueItems();
    win.descerOrador(before.length - 1);
    expect(queueItems()).toEqual(before);
  });
});

// ============================================================
// chamarProximoOrador
// ============================================================

describe("chamarProximoOrador", () => {
  beforeEach(() => {
    initApp();
    win.inscreverVereador("Vereador Alexandre de Barros Mendes");
    win.inscreverVereador("Vereador Renato Vieira");
    win.inscreverVereador("Vereador Paulo Cezar Tavares");
    // queue: [Alexandre, Renato, Paulo]
  });
  afterEach(() => jest.useRealTimers());

  test("sets next speaker from queue", () => {
    win.chamarProximoOrador();
    expect(orador()).toBe("VEREADOR ALEXANDRE DE BARROS MENDES");
  });

  test("removes the called speaker from queue", () => {
    win.chamarProximoOrador();
    expect(queueItems()).toEqual(["Vereador Renato Vieira", "Vereador Paulo Cezar Tavares"]);
  });

  test("updates proximoOrador text", () => {
    win.chamarProximoOrador();
    expect(proximoText()).toBe("Próximo Orador: Vereador Renato Vieira");
  });

  test("shows --- when no next speaker", () => {
    win.chamarProximoOrador();
    win.chamarProximoOrador();
    win.chamarProximoOrador();
    expect(proximoText()).toBe("Próximo Orador: ---");
  });

  test("does nothing if queue is empty", () => {
    win.chamarProximoOrador();
    win.chamarProximoOrador();
    win.chamarProximoOrador();
    const before = orador();
    win.chamarProximoOrador();
    expect(orador()).toBe(before);
  });

  test("resets timer to 05:00", () => {
    win.chamarProximoOrador();
    expect(cronometroText()).toBe("05:00");
  });
});

// ============================================================
// cronômetro (timer)
// ============================================================

describe("cronômetro (timer)", () => {
  beforeEach(() => {
    initApp();
    win.inscreverVereador("Vereador Alexandre de Barros Mendes");
    win.chamarProximoOrador();
  });
  afterEach(() => jest.useRealTimers());

  test("iniciarCronometro starts countdown", () => {
    win.iniciarCronometro();
    jest.advanceTimersByTime(3000);
    expect(cronometroText()).toBe("04:57");
  });

  test("does nothing if AGUARDANDO INÍCIO", () => {
    win.pausarCronometro();
    doc.getElementById("oradorAtual").textContent = "AGUARDANDO INÍCIO";
    win.iniciarCronometro();
    jest.advanceTimersByTime(3000);
    expect(cronometroText()).toBe("05:00");
  });

  test("pausarCronometro stops countdown", () => {
    win.iniciarCronometro();
    jest.advanceTimersByTime(2000);
    win.pausarCronometro();
    const t = cronometroText();
    jest.advanceTimersByTime(5000);
    expect(cronometroText()).toBe(t);
  });

  test("restaurarCronometro resets to initial time", () => {
    win.iniciarCronometro();
    jest.advanceTimersByTime(5000);
    win.restaurarCronometro();
    expect(cronometroText()).toBe("05:00");
  });

  test("encerrarCronometro resets speaker to AGUARDANDO INÍCIO", () => {
    win.iniciarCronometro();
    win.encerrarCronometro();
    expect(orador()).toBe("AGUARDANDO INÍCIO");
  });
});

// ============================================================
// ativarTempoExtra / ativarAlarme toggles
// ============================================================

describe("ativarTempoExtra / ativarAlarme toggles", () => {
  beforeEach(() => initApp());
  afterEach(() => jest.useRealTimers());

  test("ativarTempoExtra toggles button text", () => {
    const btn = doc.getElementById("btnTempoExtra");
    win.ativarTempoExtra();
    expect(btn.textContent).toContain("Tempo Extra");
    expect(btn.style.background).toBe("rgb(255, 111, 0)");
    win.ativarTempoExtra();
    expect(btn.style.background).toBe("rgb(43, 124, 211)");
  });

  test("ativarAlarme toggles button text", () => {
    const btn = doc.getElementById("btnAlarme");
    win.ativarAlarme();
    expect(btn.textContent).toContain("Alarme");
    expect(btn.style.background).toBe("rgb(255, 111, 0)");
    win.ativarAlarme();
    expect(btn.style.background).toBe("rgb(43, 124, 211)");
  });
});

// ============================================================
// selecionarModo
// ============================================================

describe("selecionarModo", () => {
  beforeEach(() => initApp());
  afterEach(() => jest.useRealTimers());

  test("switches to discussao", () => {
    win.selecionarModo("discussao");
    expect(tituloText()).toBe("DISCUSSÃO DE PROPOSIÇÕES");
    expect(doc.getElementById("listaDiscussao")).toBeTruthy();
  });

  test("switches to consideracoes", () => {
    win.selecionarModo("consideracoes");
    expect(tituloText()).toBe("CONSIDERAÇÕES FINAIS");
    expect(doc.getElementById("listaConsideracoes")).toBeTruthy();
  });

  test("switches to tribuna", () => {
    win.selecionarModo("tribuna");
    expect(tituloText()).toBe("TRIBUNA LIVRE");
    expect(doc.getElementById("nomeConvidado")).toBeTruthy();
  });
});

// ============================================================
// selecionarOradorDiscussao
// ============================================================

describe("selecionarOradorDiscussao", () => {
  beforeEach(() => {
    initApp();
    win.selecionarModo("discussao");
  });
  afterEach(() => jest.useRealTimers());

  test("sets orador and adds to history", () => {
    win.selecionarOradorDiscussao("Vereador Renato Vieira");
    expect(orador()).toBe("VEREADOR RENATO VIEIRA");
    const histEl = doc.getElementById("historicoDiscussao");
    expect(histEl.textContent).toContain("Vereador Renato Vieira");
  });

  test("resets timer to 05:00", () => {
    win.selecionarOradorDiscussao("Vereador Renato Vieira");
    expect(cronometroText()).toBe("05:00");
  });
});

// ============================================================
// registrarConvidado (tribuna)
// ============================================================

describe("registrarConvidado (tribuna)", () => {
  beforeEach(() => {
    initApp();
    win.selecionarModo("tribuna");
  });
  afterEach(() => jest.useRealTimers());

  test("sets guest as current speaker", () => {
    const input = doc.getElementById("nomeConvidado");
    input.value = "João da Silva";
    win.registrarConvidado();
    expect(orador()).toBe("JOÃO DA SILVA");
    expect(input.value).toBe("");
  });

  test("alerts when name is empty", () => {
    win.alert = jest.fn();
    doc.getElementById("nomeConvidado").value = "   ";
    win.registrarConvidado();
    expect(win.alert).toHaveBeenCalled();
  });
});

// ============================================================
// salvarEstadoTelao (localStorage sync)
// ============================================================

describe("salvarEstadoTelao (localStorage sync)", () => {
  beforeEach(() => initApp());
  afterEach(() => jest.useRealTimers());

  test("saves state to localStorage", () => {
    win.salvarEstadoTelao();
    const state = JSON.parse(win.localStorage.getItem("estadoCronometro"));
    expect(state).toHaveProperty("tituloSessao");
    expect(state).toHaveProperty("oradorAtual");
    expect(state).toHaveProperty("cronometro");
    expect(state).toHaveProperty("proximoOrador");
  });

  test("reflects current speaker in saved state", () => {
    win.inscreverVereador("Vereador Renato Vieira");
    win.chamarProximoOrador();
    const state = JSON.parse(win.localStorage.getItem("estadoCronometro"));
    expect(state.oradorAtual).toBe("VEREADOR RENATO VIEIRA");
  });
});
