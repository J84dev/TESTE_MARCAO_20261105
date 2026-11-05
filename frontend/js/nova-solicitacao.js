const API_BASE = "http://localhost:8000";

const form = document.querySelector("#solicitacao-form");
const feedback = document.querySelector("#feedback");

function mostrarFeedback(mensagem, tipo) {
  feedback.innerHTML = esc(mensagem);
  feedback.className = `feedback ${tipo}`;
}

const TIPOS_INPUT = ["text", "email"];

function htmlCampo(campo) {
  const nome = esc(campo.nome);
  const obrigatorio = campo.obrigatorio ? " required" : "";
  const placeholder = campo.placeholder ? ` placeholder="${esc(campo.placeholder)}"` : "";
  const atributos = `id="${nome}" name="${nome}"${obrigatorio}${placeholder}`;

  let controle;
  if (campo.tipo === "textarea") {
    controle = `<textarea ${atributos}></textarea>`;
  } else if (campo.tipo === "select") {
    const opcoes = (campo.opcoes ?? [])
      .map((v) => `<option value="${esc(v)}">${esc(v)}</option>`)
      .join("");
    controle = `<select ${atributos}>${opcoes}</select>`;
  } else {
    const tipo = TIPOS_INPUT.includes(campo.tipo) ? campo.tipo : "text";
    controle = `<input type="${tipo}" ${atributos}>`;
  }

  return `<div class="field"><label for="${nome}">${esc(campo.rotulo)}</label>${controle}</div>`;
}

async function carregarSchema() {
  try {
    const resposta = await fetch(`${API_BASE}/api/schema`);
    if (!resposta.ok) throw new Error("Falha ao carregar o schema.");
    const schema = await resposta.json();

    document.querySelector("#form-title").innerHTML = esc(schema.titulo);
    document.querySelector("#form-description").innerHTML = esc(schema.descricao);

    form.innerHTML =
      schema.campos.map(htmlCampo).join("") +
      `<button type="submit">Enviar solicitação</button>`;
  } catch (erro) {
    mostrarFeedback(erro.message, "error");
    form.innerHTML = "";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const botao = form.querySelector('button[type="submit"]');
  botao.disabled = true;

  const dados = Object.fromEntries(new FormData(form).entries());

  try {
    const resposta = await fetch(`${API_BASE}/api/solicitacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });
    const resultado = await resposta.json();

    if (!resposta.ok) {
      const detalhe = resultado.detail;
      throw new Error(typeof detalhe === "string" ? detalhe : "Verifique os dados informados.");
    }

    mostrarFeedback(`Solicitação ${resultado.codigo} criada com sucesso!`, "success");
    form.reset();
  } catch (erro) {
    mostrarFeedback(erro.message, "error");
  } finally {
    botao.disabled = false;
  }
});

carregarSchema();
