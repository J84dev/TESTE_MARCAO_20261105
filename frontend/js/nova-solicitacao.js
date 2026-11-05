const API_BASE = "http://localhost:8000";

const form = document.querySelector("#solicitacao-form");
const feedback = document.querySelector("#feedback");

function mostrarFeedback(mensagem, tipo) {
  feedback.textContent = mensagem;
  feedback.className = `feedback ${tipo}`;
}

function criarCampo(campo) {
  const wrapper = document.createElement("div");
  wrapper.className = "field";

  const label = document.createElement("label");
  label.htmlFor = campo.nome;
  label.textContent = campo.rotulo;

  let input;
  if (campo.tipo === "textarea") {
    input = document.createElement("textarea");
  } else if (campo.tipo === "select") {
    input = document.createElement("select");
    for (const valor of campo.opcoes ?? []) {
      const option = document.createElement("option");
      option.value = valor;
      option.textContent = valor;
      input.appendChild(option);
    }
  } else {
    const tiposPermitidos = ["text", "email"];
    input = document.createElement("input");
    input.type = tiposPermitidos.includes(campo.tipo) ? campo.tipo : "text";
  }

  input.id = campo.nome;
  input.name = campo.nome;
  input.required = Boolean(campo.obrigatorio);
  if (campo.placeholder) input.placeholder = campo.placeholder;

  wrapper.append(label, input);
  return wrapper;
}

async function carregarSchema() {
  try {
    const resposta = await fetch(`${API_BASE}/api/schema`);
    if (!resposta.ok) throw new Error("Falha ao carregar o schema.");
    const schema = await resposta.json();

    // textContent evita interpretar dados recebidos como HTML.
    document.querySelector("#form-title").textContent = schema.titulo;
    document.querySelector("#form-description").textContent = schema.descricao;

    form.replaceChildren();
    for (const campo of schema.campos) form.appendChild(criarCampo(campo));

    const submit = document.createElement("button");
    submit.type = "submit";
    submit.textContent = "Enviar solicitação";
    form.appendChild(submit);
  } catch (erro) {
    mostrarFeedback(erro.message, "error");
    form.replaceChildren();
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
