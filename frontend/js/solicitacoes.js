const API_BASE = "http://localhost:8000";
const lista = document.querySelector("#lista");
const feedback = document.querySelector("#feedback");

function linha(item) {
  const criada = new Date(item.criada_em).toLocaleString("pt-BR");
  return `
    <tr>
      <td>${esc(item.codigo)}</td>
      <td>${esc(item.assunto)}</td>
      <td>${esc(item.prioridade)}</td>
      <td>${esc(item.status)}</td>
      <td>${esc(criada)}</td>
      <td><a href="detalhes.html?id=${encodeURIComponent(item.id)}">Ver detalhes</a></td>
    </tr>`;
}

async function carregarSolicitacoes() {
  try {
    const resposta = await fetch(`${API_BASE}/api/solicitacoes`);
    if (!resposta.ok) throw new Error("Não foi possível carregar as solicitações.");
    const itens = await resposta.json();

    if (itens.length === 0) {
      lista.innerHTML = "Nenhuma solicitação cadastrada.";
      return;
    }

    lista.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Código</th><th>Assunto</th><th>Prioridade</th><th>Status</th><th>Criada em</th><th></th></tr>
          </thead>
          <tbody>${itens.map(linha).join("")}</tbody>
        </table>
      </div>`;
  } catch (erro) {
    feedback.innerHTML = esc(erro.message);
    feedback.className = "feedback error";
    lista.innerHTML = "";
  }
}

carregarSolicitacoes();
