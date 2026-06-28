/* ============================================================
   Dashboard de Notas — lógica, KPIs, gráficos e filtros
   ============================================================ */

// Paleta
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

// Estado dos filtros
const filtros = {
  serie: "",
  turma: "",
  disciplina: "", // disciplina "em foco" -> muda a métrica analisada
  faixa: "",
  busca: "",
};

// Referências de gráficos
const charts = {};

/* ---------- Helpers ---------- */
const media = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const round1 = (n) => Math.round(n * 10) / 10;

// valor usado nas análises: média geral ou disciplina em foco
function valorAluno(aluno) {
  return filtros.disciplina ? aluno[filtros.disciplina] : aluno.Media;
}

function faixaDe(valor) {
  if (valor >= 8) return "Excelente";
  if (valor >= 6) return "Bom";
  return "Recuperação";
}

// Aplica todos os filtros EXCETO o indicado (para gráficos não se "auto-zerarem")
function dadosFiltrados(exceto = null) {
  return ALUNOS.filter((a) => {
    if (exceto !== "serie" && filtros.serie && a.Serie !== filtros.serie) return false;
    if (exceto !== "turma" && filtros.turma && a.Turma !== filtros.turma) return false;
    if (exceto !== "faixa" && filtros.faixa && faixaDe(valorAluno(a)) !== filtros.faixa) return false;
    if (filtros.busca && !a.Nome.toLowerCase().includes(filtros.busca.toLowerCase())) return false;
    return true;
  });
}

/* ---------- Inicialização dos selects ---------- */
function preencherSelect(id, valores, rotuloTodos) {
  const sel = document.getElementById(id);
  sel.innerHTML = `<option value="">${rotuloTodos}</option>` +
    valores.map((v) => `<option value="${v}">${v}</option>`).join("");
}

function unicos(campo) {
  return [...new Set(ALUNOS.map((a) => a[campo]))].sort();
}

/* ============================================================
   KPIs
   ============================================================ */
function atualizarKPIs() {
  const dados = dadosFiltrados();
  const valores = dados.map(valorAluno);

  document.getElementById("kpiTotal").textContent = dados.length;
  document.getElementById("kpiMedia").textContent = dados.length ? round1(media(valores)).toFixed(1) : "0";

  const aprovados = valores.filter((v) => v >= 6).length;
  const taxa = dados.length ? Math.round((aprovados / dados.length) * 100) : 0;
  document.getElementById("kpiAprov").textContent = taxa + "%";

  if (dados.length) {
    const melhor = dados.reduce((a, b) => (valorAluno(a) >= valorAluno(b) ? a : b));
    document.getElementById("kpiTop").textContent = round1(valorAluno(melhor)).toFixed(1);
    document.getElementById("kpiTopNome").textContent = melhor.Nome;
  } else {
    document.getElementById("kpiTop").textContent = "-";
    document.getElementById("kpiTopNome").textContent = "Sem dados";
  }
}

/* ============================================================
   Gráficos
   ============================================================ */

// Destaca a fatia/barra selecionada vs as demais
function coresSelecionadas(labels, selecionado, base, apagada) {
  return labels.map((l) => (selecionado && l !== selecionado ? apagada : base));
}

function criarGraficos() {
  Chart.defaults.font.family = "Poppins, sans-serif";
  Chart.defaults.color = COR.muted;

  // 1) Média por Disciplina (foco da disciplina)
  charts.disciplina = new Chart(document.getElementById("chartDisciplina"), {
    type: "bar",
    data: { labels: DISCIPLINAS, datasets: [{ label: "Média", data: [], borderRadius: 8, maxBarThickness: 46 }] },
    options: baseOpts({
      onClick: (e, els) => {
        if (!els.length) return;
        const disc = DISCIPLINAS[els[0].index];
        filtros.disciplina = filtros.disciplina === disc ? "" : disc;
        sincronizarControles();
        renderTudo();
      },
      yMax: 10,
    }),
  });

  // 2) Faixas de Desempenho (doughnut)
  charts.faixa = new Chart(document.getElementById("chartFaixa"), {
    type: "doughnut",
    data: { labels: ["Excelente", "Bom", "Recuperação"], datasets: [{ data: [], borderWidth: 0 }] },
    options: doughnutOpts((label) => {
      filtros.faixa = filtros.faixa === label ? "" : label;
      sincronizarControles();
      renderTudo();
    }),
  });

  // 3) Média por Série (bar)
  charts.serie = new Chart(document.getElementById("chartSerie"), {
    type: "bar",
    data: { labels: unicos("Serie"), datasets: [{ label: "Média", data: [], borderRadius: 8, maxBarThickness: 60 }] },
    options: baseOpts({
      onClick: (e, els) => {
        if (!els.length) return;
        const serie = charts.serie.data.labels[els[0].index];
        filtros.serie = filtros.serie === serie ? "" : serie;
        sincronizarControles();
        renderTudo();
      },
      yMax: 10,
    }),
  });

  // 4) Distribuição por Turma (doughnut por quantidade de alunos)
  charts.turma = new Chart(document.getElementById("chartTurma"), {
    type: "doughnut",
    data: { labels: unicos("Turma").map((t) => "Turma " + t), datasets: [{ data: [], borderWidth: 0 }] },
    options: doughnutOpts((label) => {
      const turma = label.replace("Turma ", "");
      filtros.turma = filtros.turma === turma ? "" : turma;
      sincronizarControles();
      renderTudo();
    }),
  });

  // 5) Ranking Top 10 (horizontal bar)
  charts.ranking = new Chart(document.getElementById("chartRanking"), {
    type: "bar",
    data: { labels: [], datasets: [{ label: "Média", data: [], borderRadius: 8, maxBarThickness: 22 }] },
    options: baseOpts({
      horizontal: true,
      xMax: 10,
      onClick: (e, els) => {
        if (!els.length) return;
        const nome = charts.ranking.data.labels[els[0].index];
        const buscaInput = document.getElementById("busca");
        buscaInput.value = buscaInput.value === nome ? "" : nome;
        filtros.busca = buscaInput.value;
        renderTudo();
      },
    }),
  });
}

/* ---------- Opções reutilizáveis ---------- */
function baseOpts({ onClick, yMax, xMax, horizontal } = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? "y" : "x",
    onClick,
    onHover: (e, els) => (e.native.target.style.cursor = els.length ? "pointer" : "default"),
    plugins: { legend: { display: false }, tooltip: { padding: 10 } },
    scales: {
      x: { grid: { display: !horizontal ? false : true, color: COR.grid }, max: xMax, beginAtZero: !!xMax },
      y: { grid: { display: horizontal ? false : true, color: COR.grid }, max: yMax, beginAtZero: true },
    },
  };
}

function doughnutOpts(onSliceClick) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    onHover: (e, els) => (e.native.target.style.cursor = els.length ? "pointer" : "default"),
    onClick: (e, els) => {
      if (!els.length) return;
      const label = e.chart.data.labels[els[0].index];
      onSliceClick(label);
    },
    plugins: {
      legend: { position: "bottom", labels: { usePointStyle: true, padding: 14, boxWidth: 8 } },
      tooltip: { padding: 10 },
    },
  };
}

/* ============================================================
   Render dos dados nos gráficos
   ============================================================ */
function renderGraficos() {
  const metricaLabel = filtros.disciplina || "Média Geral";

  // 1) Média por disciplina — sempre considera filtros de série/turma/faixa/busca
  const baseDisc = dadosFiltrados();
  charts.disciplina.data.datasets[0].data = DISCIPLINAS.map((d) => round1(media(baseDisc.map((a) => a[d]))));
  charts.disciplina.data.datasets[0].backgroundColor = DISCIPLINAS.map((d) =>
    filtros.disciplina && d !== filtros.disciplina ? COR.brandLight + "66" : COR.brand
  );
  charts.disciplina.update();

  // 2) Faixas de desempenho
  const baseFaixa = dadosFiltrados("faixa");
  const faixas = ["Excelente", "Bom", "Recuperação"];
  charts.faixa.data.datasets[0].data = faixas.map(
    (f) => baseFaixa.filter((a) => faixaDe(valorAluno(a)) === f).length
  );
  const coresFaixa = [COR.green, COR.brand, COR.red];
  charts.faixa.data.datasets[0].backgroundColor = faixas.map((f, i) =>
    filtros.faixa && f !== filtros.faixa ? coresFaixa[i] + "44" : coresFaixa[i]
  );
  charts.faixa.update();

  // 3) Média por série
  const baseSerie = dadosFiltrados("serie");
  const series = charts.serie.data.labels;
  charts.serie.data.datasets[0].data = series.map((s) =>
    round1(media(baseSerie.filter((a) => a.Serie === s).map(valorAluno)))
  );
  charts.serie.data.datasets[0].backgroundColor = series.map((s) =>
    filtros.serie && s !== filtros.serie ? COR.brandLight + "66" : COR.purple
  );
  charts.serie.update();

  // 4) Distribuição por turma (quantidade)
  const baseTurma = dadosFiltrados("turma");
  const turmas = unicos("Turma");
  charts.turma.data.datasets[0].data = turmas.map(
    (t) => baseTurma.filter((a) => a.Turma === t).length
  );
  const coresTurma = [COR.brand, COR.orange, COR.green];
  charts.turma.data.datasets[0].backgroundColor = turmas.map((t, i) =>
    filtros.turma && t !== filtros.turma ? coresTurma[i % 3] + "44" : coresTurma[i % 3]
  );
  charts.turma.update();

  // 5) Ranking top 10
  const baseRank = dadosFiltrados();
  const top = [...baseRank].sort((a, b) => valorAluno(b) - valorAluno(a)).slice(0, 10);
  charts.ranking.data.labels = top.map((a) => a.Nome);
  charts.ranking.data.datasets[0].data = top.map((a) => round1(valorAluno(a)));
  charts.ranking.data.datasets[0].backgroundColor = top.map((a) =>
    filtros.busca && a.Nome === filtros.busca ? COR.orange : COR.brand
  );
  charts.ranking.update();

  document.getElementById("rankLabel").textContent = `(por ${metricaLabel.toLowerCase()})`;
}

/* ============================================================
   Chips de filtros ativos
   ============================================================ */
function renderChips() {
  const chips = [];
  if (filtros.serie) chips.push(["serie", "Série: " + filtros.serie]);
  if (filtros.turma) chips.push(["turma", "Turma: " + filtros.turma]);
  if (filtros.disciplina) chips.push(["disciplina", "Foco: " + filtros.disciplina]);
  if (filtros.faixa) chips.push(["faixa", "Desempenho: " + filtros.faixa]);
  if (filtros.busca) chips.push(["busca", "Aluno: " + filtros.busca]);

  const el = document.getElementById("chips");
  el.innerHTML = chips
    .map(([key, txt]) => `<span class="chip">${txt} <b data-key="${key}">✕</b></span>`)
    .join("");

  el.querySelectorAll("b[data-key]").forEach((b) => {
    b.addEventListener("click", () => {
      const key = b.dataset.key;
      filtros[key] = "";
      if (key === "busca") document.getElementById("busca").value = "";
      sincronizarControles();
      renderTudo();
    });
  });
}

/* ============================================================
   Sincronização dos controles de UI com o estado
   ============================================================ */
function sincronizarControles() {
  document.getElementById("filtroSerie").value = filtros.serie;
  document.getElementById("filtroTurma").value = filtros.turma;
  document.getElementById("filtroDisciplina").value = filtros.disciplina;
  document.getElementById("filtroFaixa").value = filtros.faixa;
}

function renderTudo() {
  atualizarKPIs();
  renderGraficos();
  renderChips();
}

/* ============================================================
   Eventos
   ============================================================ */
function ligarEventos() {
  document.getElementById("filtroSerie").addEventListener("change", (e) => { filtros.serie = e.target.value; renderTudo(); });
  document.getElementById("filtroTurma").addEventListener("change", (e) => { filtros.turma = e.target.value; renderTudo(); });
  document.getElementById("filtroDisciplina").addEventListener("change", (e) => { filtros.disciplina = e.target.value; renderTudo(); });
  document.getElementById("filtroFaixa").addEventListener("change", (e) => { filtros.faixa = e.target.value; renderTudo(); });
  document.getElementById("busca").addEventListener("input", (e) => { filtros.busca = e.target.value.trim(); renderTudo(); });

  document.getElementById("btnReset").addEventListener("click", () => {
    Object.keys(filtros).forEach((k) => (filtros[k] = ""));
    document.getElementById("busca").value = "";
    sincronizarControles();
    renderTudo();
  });
}

/* ============================================================
   Start
   ============================================================ */
function init() {
  preencherSelect("filtroSerie", unicos("Serie"), "Todas as séries");
  preencherSelect("filtroTurma", unicos("Turma"), "Todas as turmas");
  preencherSelect("filtroDisciplina", DISCIPLINAS, "Média geral");
  criarGraficos();
  ligarEventos();
  renderTudo();
}

document.addEventListener("DOMContentLoaded", init);
