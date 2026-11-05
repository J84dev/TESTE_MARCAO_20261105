const API_BASE = "http://localhost:8000";
const painel = document.querySelector("#detalhes");
const feedback = document.querySelector("#feedback");

function adicionarItem(container, rotulo, valor) {
  const item = document.createElement("div");
  item.className = "detail-item";

  const titulo = document.createElement("strong");
  titulo.textContent = rotulo;

  const conteudo = document.createElement("div");
  conteudo.textContent = valor ?? "—";

  item.append(titulo, conteudo);
  container.appendChild(item);
}

async function carregarDetalhes() {
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id || !/^[1-9]\d*$/.test(id)) {
    feedback.textContent = "Identificador inválido.";
    feedback.className = "feedback error";
    painel.replaceChildren();
    return;
  }

  try {
    const resposta = await fetch(`${API_BASE}/api/solicitacoes/${encodeURIComponent(id)}`);
    const dados = await resposta.json();
    if (!resposta.ok) throw new Error(dados.detail ?? "Não foi possível carregar a solicitação.");

    const titulo = document.createElement("h1");
    titulo.textContent = dados.codigo;

    const subtitulo = document.createElement("p");
    subtitulo.className = "muted";
    subtitulo.textContent = dados.assunto;

    const grid = document.createElement("div");
    grid.className = "detail-grid";
    adicionarItem(grid, "E-mail", dados.email);
    adicionarItem(grid, "Prioridade", dados.prioridade);
    adicionarItem(grid, "Status", dados.status);
    adicionarItem(grid, "Criada em", new Date(dados.criada_em).toLocaleString("pt-BR"));

    const descricaoTitulo = document.createElement("h2");
    descricaoTitulo.textContent = "Descrição";
    const descricao = document.createElement("p");
    descricao.className = "detail-description";
    descricao.textContent = dados.descricao;

    painel.replaceChildren(titulo, subtitulo, grid, descricaoTitulo, descricao);
  } catch (erro) {
    feedback.textContent = erro.message;
    feedback.className = "feedback error";
    painel.replaceChildren();
  }
}

carregarDetalhes();
