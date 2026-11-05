// Escapa texto para uso seguro em HTML (conteúdo e atributos entre aspas).
// Use em TUDO que vem da API antes de interpolar em innerHTML.
function esc(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}
