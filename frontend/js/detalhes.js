const API_BASE = "http://localhost:8000";
const painel = document.querySelector("#detalhes");
const feedback = document.querySelector("#feedback");

function item(rotulo, valor) {
  return `
    <div class="detail-item">
      <strong>${esc(rotulo)}</strong>
      <div>${esc(valor ?? "—")}</div>
    </div>`;
}

async function carregarDetalhes() {
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id || !/^[1-9]\d*$/.test(id)) {
    feedback.innerHTML = "Identificador inválido.";
    feedback.className = "feedback error";
    painel.innerHTML = "";
    return;
  }

  try {
    const resposta = await fetch(`${API_BASE}/api/solicitacoes/${encodeURIComponent(id)}`);
    const dados = await resposta.json();
    if (!resposta.ok) throw new Error(dados.detail ?? "Não foi possível carregar a solicitação.");

    painel.innerHTML = `
      <h1>${esc(dados.codigo)}</h1>
      <p class="muted">${esc(dados.assunto)}</p>
      <div class="detail-grid">
        ${item("E-mail", dados.email)}
        ${item("Prioridade", dados.prioridade)}
        ${item("Status", dados.status)}
        ${item("Criada em", new Date(dados.criada_em).toLocaleString("pt-BR"))}
      </div>
      <h2>Descrição</h2>
      <p class="detail-description">${esc(dados.descricao)}</p>`;
  } catch (erro) {
    feedback.innerHTML = esc(erro.message);
    feedback.className = "feedback error";
    painel.innerHTML = "";
  }
}

carregarDetalhes();
