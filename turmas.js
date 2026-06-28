/* ============================================================
   Página Turmas — visão detalhada por turma
   ============================================================ */

const COR = {
  brand: "#4b5fe2",
  brandLight: "#8ea0f5",
  green: "#2bb673",
  orange: "#f5a623",
  purple: "#8b5cf6",
  red: "#ef5b6e",
  grid: "#eceff7",
  muted: "#8a90a8",
};

const charts = {};
let turmaSelecionada = null;
let filtroSerie = "";
let ordenacao = { coluna: "Media", desc: true };

/* ---------- Helpers ---------- */
const media = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const round1 = (n) => Math.round(n * 10) / 10;

function faixaDe(v) {
  if (v >= 8) return "Excelente";
  if (v >= 6) return "Bom";
  return "Recuperação";
}

// Lista de turmas (Série + Turma) existentes
function listaTurmas() {
  const set = new Map();
  ALUNOS.forEach((a) => {
    const id = `${a.Serie} ${a.Turma}`;
    if (!set.has(id)) set.set(id, { id, serie: a.Serie, turma: a.Turma });
  });
  return [...set.values()].sort((a, b) => a.id.localeCompare(b.id, "pt-BR"));
}

function alunosDaTurma(t) {
  return ALUNOS.filter((a) => a.Serie === t.serie && a.Turma === t.turma);
}

/* ---------- Select de série ---------- */
function preencherFiltroSerie() {
  const series = [...new Set(ALUNOS.map((a) => a.Serie))].sort();
  const sel = document.getElementById("filtroSerie");
  sel.innerHTML =
    `<option value="">Todas as séries</option>` +
    series.map((s) => `<option value="${s}">${s}</option>`).join("");
  sel.addEventListener("change", (e) => {
    filtroSerie = e.target.value;
    renderCards();
  });
}

/* ============================================================
   Cards de turma
   ============================================================ */
function renderCards() {
  const grid = document.getElementById("turmaGrid");
  let turmas = listaTurmas();
  if (filtroSerie) turmas = turmas.filter((t) => t.serie === filtroSerie);

  grid.innerHTML = turmas
    .map((t) => {
      const alunos = alunosDaTurma(t);
      const med = round1(media(alunos.map((a) => a.Media)));
      const aprov = Math.round((alunos.filter((a) => a.Media >= 6).length / alunos.length) * 100);
      const pillClasse = aprov >= 80 ? "pill-green" : aprov >= 50 ? "pill-blue" : "pill-red";
      return `
        <div class="turma-card" data-id="${t.id}">
          <div class="tc-top">
            <span class="tc-badge">${t.id}</span>
            <span class="pill ${pillClasse}">${aprov}% aprov.</span>
          </div>
          <div class="tc-media">${med.toFixed(1)}</div>
          <div class="tc-row"><span>Alunos</span><b>${alunos.length}</b></div>
          <div class="tc-bar"><span style="width:${med * 10}%"></span></div>
        </div>`;
    })
    .join("");

  grid.querySelectorAll(".turma-card").forEach((card) => {
    card.addEventListener("click", () => {
      const t = listaTurmas().find((x) => x.id === card.dataset.id);
      selecionarTurma(t);
    });
  });

  // Mantém seleção válida / seleciona a primeira
  if (!turmas.find((t) => turmaSelecionada && t.id === turmaSelecionada.id)) {
    if (turmas.length) selecionarTurma(turmas[0]);
  } else {
    marcarCardAtivo();
  }
}

function marcarCardAtivo() {
  document.querySelectorAll(".turma-card").forEach((c) => {
    c.classList.toggle("active", turmaSelecionada && c.dataset.id === turmaSelecionada.id);
  });
}

/* ============================================================
   Detalhes da turma selecionada
   ============================================================ */
function selecionarTurma(t) {
  turmaSelecionada = t;
  marcarCardAtivo();
  const alunos = alunosDaTurma(t);

  document.getElementById("detTurmaNome").textContent = t.id;

  // KPIs
  document.getElementById("detAlunos").textContent = alunos.length;
  document.getElementById("detMedia").textContent = round1(media(alunos.map((a) => a.Media))).toFixed(1);
  const aprov = Math.round((alunos.filter((a) => a.Media >= 6).length / alunos.length) * 100);
  document.getElementById("detAprov").textContent = aprov + "%";
  const top = alunos.reduce((a, b) => (a.Media >= b.Media ? a : b));
  document.getElementById("detTop").textContent = top.Media.toFixed(1);
  document.getElementById("detTopNome").textContent = top.Nome;

  renderChartsTurma(alunos);
  renderTabela(alunos);
}

/* ---------- Gráficos ---------- */
function renderChartsTurma(alunos) {
  const mediaTurma = DISCIPLINAS.map((d) => round1(media(alunos.map((a) => a[d]))));
  const mediaEscola = DISCIPLINAS.map((d) => round1(media(ALUNOS.map((a) => a[d]))));

  if (!charts.disc) {
    charts.disc = new Chart(document.getElementById("chartDiscTurma"), {
      type: "bar",
      data: {
        labels: DISCIPLINAS,
        datasets: [
          { label: "Turma", data: mediaTurma, backgroundColor: COR.brand, borderRadius: 6, maxBarThickness: 22 },
          { label: "Escola", data: mediaEscola, backgroundColor: COR.orange + "99", borderRadius: 6, maxBarThickness: 22 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8, padding: 14 } } },
        scales: { y: { beginAtZero: true, max: 10, grid: { color: COR.grid } }, x: { grid: { display: false } } },
      },
    });
  } else {
    charts.disc.data.datasets[0].data = mediaTurma;
    charts.disc.data.datasets[1].data = mediaEscola;
    charts.disc.update();
  }

  const faixas = ["Excelente", "Bom", "Recuperação"];
  const dataFaixa = faixas.map((f) => alunos.filter((a) => faixaDe(a.Media) === f).length);
  if (!charts.faixa) {
    charts.faixa = new Chart(document.getElementById("chartFaixaTurma"), {
      type: "doughnut",
      data: { labels: faixas, datasets: [{ data: dataFaixa, backgroundColor: [COR.green, COR.brand, COR.red], borderWidth: 0 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: { legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8, padding: 14 } } },
      },
    });
  } else {
    charts.faixa.data.datasets[0].data = dataFaixa;
    charts.faixa.update();
  }
}

/* ---------- Tabela de alunos ---------- */
function renderTabela(alunos) {
  const colunas = ["Nome", ...DISCIPLINAS, "Media"];
  const thead = document.querySelector("#tabelaAlunos thead");
  thead.innerHTML =
    "<tr>" +
    colunas
      .map((c) => {
        const seta = ordenacao.coluna === c ? (ordenacao.desc ? " ▼" : " ▲") : "";
        const titulo = c === "Media" ? "Média" : c;
        return `<th data-col="${c}">${titulo}${seta}</th>`;
      })
      .join("") +
    "</tr>";

  const ordenados = [...alunos].sort((a, b) => {
    const va = a[ordenacao.coluna];
    const vb = b[ordenacao.coluna];
    if (typeof va === "string") return ordenacao.desc ? vb.localeCompare(va) : va.localeCompare(vb);
    return ordenacao.desc ? vb - va : va - vb;
  });

  const tbody = document.querySelector("#tabelaAlunos tbody");
  tbody.innerHTML = ordenados
    .map((a) => {
      const cells = colunas
        .map((c) => {
          if (c === "Nome") return `<td>${a.Nome}</td>`;
          const v = a[c];
          const cls = v < 6 ? "nota-baixa" : v >= 8 ? "nota-alta" : "";
          return `<td class="${cls}">${v.toFixed(1)}</td>`;
        })
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  thead.querySelectorAll("th").forEach((th) => {
    th.addEventListener("click", () => {
      const col = th.dataset.col;
      if (ordenacao.coluna === col) ordenacao.desc = !ordenacao.desc;
      else ordenacao = { coluna: col, desc: col !== "Nome" };
      renderTabela(alunos);
    });
  });

  document.getElementById("tabelaInfo").textContent = `ordenado por ${
    ordenacao.coluna === "Media" ? "média" : ordenacao.coluna
  } ${ordenacao.desc ? "↓" : "↑"} • clique no cabeçalho p/ ordenar`;
}

/* ---------- Start ---------- */
function init() {
  Chart.defaults.font.family = "Poppins, sans-serif";
  Chart.defaults.color = COR.muted;
  preencherFiltroSerie();
  renderCards();
}

document.addEventListener("DOMContentLoaded", init);
