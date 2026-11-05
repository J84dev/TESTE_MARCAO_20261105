const API_BASE = "http://localhost:8000";
const lista = document.querySelector("#lista");
const feedback = document.querySelector("#feedback");

function celula(texto) {
  const td = document.createElement("td");
  td.textContent = texto ?? "";
  return td;
}

async function carregarSolicitacoes() {
  try {
    const resposta = await fetch(`${API_BASE}/api/solicitacoes`);
    if (!resposta.ok) throw new Error("Não foi possível carregar as solicitações.");
    const itens = await resposta.json();

    if (itens.length === 0) {
      lista.textContent = "Nenhuma solicitação cadastrada.";
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "table-wrap";
    const tabela = document.createElement("table");
    const thead = document.createElement("thead");
    const linhaCabecalho = document.createElement("tr");

    for (const titulo of ["Código", "Assunto", "Prioridade", "Status", "Criada em", ""]) {
      const th = document.createElement("th");
      th.textContent = titulo;
      linhaCabecalho.appendChild(th);
    }
    thead.appendChild(linhaCabecalho);

    const tbody = document.createElement("tbody");
    for (const item of itens) {
      const tr = document.createElement("tr");
      tr.append(
        celula(item.codigo),
        celula(item.assunto),
        celula(item.prioridade),
        celula(item.status),
        celula(new Date(item.criada_em).toLocaleString("pt-BR"))
      );

      const tdAcao = document.createElement("td");
      const link = document.createElement("a");
      link.textContent = "Ver detalhes";
      link.href = `detalhes.html?id=${encodeURIComponent(item.id)}`;
      tdAcao.appendChild(link);
      tr.appendChild(tdAcao);
      tbody.appendChild(tr);
    }

    tabela.append(thead, tbody);
    wrapper.appendChild(tabela);
    lista.replaceChildren(wrapper);
  } catch (erro) {
    feedback.textContent = erro.message;
    feedback.className = "feedback error";
    lista.replaceChildren();
  }
}

carregarSolicitacoes();
