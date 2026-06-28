// Fonte de dados do dashboard.
// Prioridade: lê o arquivo notas_alunos.csv em tempo real (precisa de um servidor local).
// Reserva: se o arquivo for aberto direto pelo navegador (file://), usa a cópia embutida abaixo.
const CSV_FALLBACK = `Nome,Serie,Turma,Matematica,Portugues,Historia,Geografia,Fisica,Quimica,Biologia,Media
Ana Beatriz Souza,1º Ano,A,7.5,8.0,6.5,7.0,5.5,6.0,8.5,7.0
Bruno Carvalho Lima,1º Ano,A,5.0,6.5,7.0,8.0,4.5,5.5,6.0,6.1
Carla Mendes Rocha,1º Ano,A,9.0,8.5,9.5,8.0,9.0,8.5,9.0,8.8
Daniel Oliveira Pinto,1º Ano,B,6.0,5.5,6.0,7.5,5.0,6.5,7.0,6.2
Eduarda Ferreira Alves,1º Ano,B,8.0,9.0,8.5,7.5,7.0,8.0,8.5,8.1
Felipe Santos Barbosa,1º Ano,B,4.5,5.0,6.0,5.5,4.0,4.5,5.0,4.9
Gabriela Costa Dias,1º Ano,C,7.0,7.5,8.0,8.5,6.5,7.0,7.5,7.4
Henrique Almeida Moraes,1º Ano,C,6.5,6.0,5.5,6.0,7.0,6.5,6.0,6.2
Isabela Ribeiro Gomes,1º Ano,C,8.5,9.0,8.0,9.0,8.5,9.0,8.5,8.6
João Pedro Martins,2º Ano,A,5.5,6.0,6.5,7.0,5.0,5.5,6.0,5.9
Larissa Nunes Cardoso,2º Ano,A,9.5,9.0,9.0,8.5,9.5,9.0,9.5,9.1
Lucas Araujo Teixeira,2º Ano,A,6.0,5.5,7.0,6.5,5.5,6.0,6.5,6.1
Mariana Lopes Freitas,2º Ano,B,7.5,8.0,7.5,8.0,7.0,7.5,8.0,7.6
Matheus Castro Ramos,2º Ano,B,4.0,5.0,5.5,4.5,3.5,4.0,5.0,4.5
Natalia Correia Pires,2º Ano,B,8.0,8.5,9.0,8.0,7.5,8.0,8.5,8.2
Otavio Monteiro Silva,2º Ano,C,6.5,7.0,6.0,7.5,6.0,6.5,7.0,6.6
Patricia Vieira Nogueira,2º Ano,C,7.0,7.5,8.0,7.0,6.5,7.0,7.5,7.2
Rafael Duarte Campos,2º Ano,C,5.0,4.5,5.5,6.0,4.0,5.0,5.5,5.1
Sofia Cunha Batista,3º Ano,A,9.0,9.5,9.0,9.5,9.0,9.5,9.0,9.2
Thiago Reis Fonseca,3º Ano,A,6.0,6.5,7.0,6.5,5.5,6.0,6.5,6.3
Valentina Moreira Pacheco,3º Ano,A,8.5,8.0,8.5,8.0,8.0,8.5,8.0,8.2
William Tavares Macedo,3º Ano,B,5.5,5.0,6.0,5.5,5.0,5.5,6.0,5.5
Yasmin Cavalcanti Lira,3º Ano,B,7.5,8.0,7.0,7.5,7.0,7.5,8.0,7.5
Arthur Brandao Peixoto,3º Ano,B,6.5,6.0,6.5,7.0,6.0,6.5,7.0,6.5
Beatriz Antunes Sales,3º Ano,C,8.0,8.5,9.0,8.5,7.5,8.0,8.5,8.3
Caio Figueiredo Neves,1º Ano,A,4.5,5.5,5.0,4.5,4.0,4.5,5.0,4.7
Debora Marques Xavier,1º Ano,B,7.0,7.5,7.0,8.0,6.5,7.0,7.5,7.2
Enzo Cardoso Vasconcelos,1º Ano,C,8.5,8.0,8.5,9.0,8.0,8.5,9.0,8.5
Fernanda Aguiar Sampaio,2º Ano,A,6.0,6.5,6.0,6.5,5.5,6.0,6.5,6.1
Gustavo Borges Siqueira,2º Ano,B,5.0,4.5,5.5,5.0,4.5,5.0,5.5,5.0
Helena Pereira Fogaca,2º Ano,C,9.0,9.0,8.5,9.0,8.5,9.0,9.0,8.9
Igor Mendonca Bittencourt,3º Ano,A,6.5,7.0,6.5,7.0,6.0,6.5,7.0,6.6
Julia Andrade Quintana,3º Ano,B,8.0,8.5,8.0,8.5,7.5,8.0,8.5,8.1
Kevin Rocha Magalhaes,3º Ano,C,5.5,5.0,6.0,5.5,5.0,5.5,6.0,5.5
Leticia Barros Sarmento,1º Ano,A,7.5,8.0,7.5,8.0,7.0,7.5,8.0,7.6
Murilo Guimaraes Bastos,1º Ano,B,4.0,4.5,5.0,4.0,3.5,4.0,4.5,4.2
Nicole Carvalho Padilha,1º Ano,C,8.5,9.0,8.5,9.0,8.0,8.5,9.0,8.6
Pedro Henrique Couto,2º Ano,A,6.0,5.5,6.5,6.0,5.5,6.0,6.5,6.0
Rebeca Fernandes Lacerda,2º Ano,B,7.0,7.5,7.0,7.5,6.5,7.0,7.5,7.1
Samuel Azevedo Toledo,2º Ano,C,5.0,5.5,5.0,5.5,4.5,5.0,5.5,5.1
Tatiana Gomes Rezende,3º Ano,A,9.0,8.5,9.0,8.5,8.5,9.0,8.5,8.7
Vitor Hugo Camargo,3º Ano,B,6.5,6.0,6.5,6.0,6.0,6.5,6.0,6.2
Alice Ramos Verissimo,3º Ano,C,8.0,8.0,8.5,8.0,7.5,8.0,8.0,8.0
Bernardo Lima Esteves,1º Ano,A,5.5,6.0,5.5,6.0,5.0,5.5,6.0,5.6
Clara Souza Marinho,1º Ano,B,7.5,7.0,7.5,7.0,7.0,7.5,7.0,7.2
Davi Lucca Bezerra,2º Ano,A,6.0,6.5,6.0,6.5,5.5,6.0,6.5,6.1
Emanuelle Pinto Galvao,2º Ano,B,8.5,9.0,8.5,9.0,8.0,8.5,9.0,8.6
Fabio Junior Sena,3º Ano,A,5.0,4.5,5.0,5.5,4.5,5.0,5.5,5.0
Giovanna Castro Aragao,3º Ano,B,9.5,9.0,9.5,9.0,9.0,9.5,9.0,9.2
Heitor Nascimento Vidal,3º Ano,C,6.5,7.0,6.5,7.0,6.0,6.5,7.0,6.6
Lay Montenegro,3º Ano,C,6.5,7.0,6.5,7.0,6.0,6.5,7.0,6.6
Antonio da Silva,3º Ano,C,8.0,8.0,8.5,8.0,7.5,8.0,8.0,8.0`;

const DISCIPLINAS = ["Matematica", "Portugues", "Historia", "Geografia", "Fisica", "Quimica", "Biologia"];

function arredondar1(n) {
  return Math.round(n * 10) / 10;
}

function parseCSV(text) {
  // remove BOM e normaliza quebras de linha (Windows usa \r\n)
  const limpo = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const linhas = limpo.trim().split("\n").filter((l) => l.trim() !== "");
  const cabecalho = linhas[0].split(",").map((c) => c.trim());
  return linhas.slice(1).map((linha) => {
    const valores = linha.split(",");
    const registro = {};
    cabecalho.forEach((coluna, i) => {
      const valor = (valores[i] ?? "").trim();
      registro[coluna] = valor !== "" && !isNaN(Number(valor)) ? Number(valor) : valor;
    });
    return registro;
  });
}

// Média aritmética das disciplinas (ignora a coluna Media do CSV).
function calcularMediaAluno(registro) {
  const notas = DISCIPLINAS.map((d) => registro[d]).filter(
    (n) => typeof n === "number" && !Number.isNaN(n)
  );
  if (!notas.length) return null;
  return arredondar1(notas.reduce((soma, nota) => soma + nota, 0) / notas.length);
}

// Garante dados consistentes antes de alimentar o dashboard.
function normalizarAlunos(registros) {
  const alunos = [];

  registros.forEach((registro, indice) => {
    const nome = String(registro.Nome ?? "").trim();
    if (!nome) {
      console.warn(`Linha ${indice + 2} ignorada: nome vazio.`);
      return;
    }

    const aluno = { ...registro, Nome: nome };
    const media = calcularMediaAluno(aluno);

    if (media === null) {
      console.warn(`Aluno "${nome}" ignorado: sem notas válidas nas disciplinas.`);
      return;
    }

    aluno.Media = media;
    alunos.push(aluno);
  });

  return alunos;
}

// Preenchido por carregarDados() antes da inicialização das páginas.
let ALUNOS = [];

// Guarda o último conteúdo lido para detectar mudanças no arquivo.
let _ultimoCsvTexto = null;

// Lê o notas_alunos.csv (via servidor). Em caso de falha, usa a cópia embutida.
async function carregarDados() {
  try {
    const resp = await fetch("notas_alunos.csv", { cache: "no-store" });
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    const texto = await resp.text();
    _ultimoCsvTexto = texto;
    ALUNOS = normalizarAlunos(parseCSV(texto));
  } catch (e) {
    console.warn(
      "Não foi possível ler notas_alunos.csv (abra via servidor local). Usando dados embutidos.",
      e
    );
    ALUNOS = normalizarAlunos(parseCSV(CSV_FALLBACK));
  }
  return ALUNOS;
}

// Verifica o arquivo periodicamente e, ao detectar mudança, atualiza ALUNOS
// e chama aoAtualizar() para a página redesenhar — sem precisar recarregar (F5).
function iniciarAtualizacaoAutomatica(aoAtualizar, intervaloMs = 3000) {
  setInterval(async () => {
    try {
      const resp = await fetch("notas_alunos.csv", { cache: "no-store" });
      if (!resp.ok) return;
      const texto = await resp.text();
      if (texto === _ultimoCsvTexto) return; // nada mudou
      _ultimoCsvTexto = texto;
      ALUNOS = normalizarAlunos(parseCSV(texto));
      aoAtualizar();
    } catch (e) {
      // silencioso: arquivo aberto sem servidor ou indisponível momentaneamente
    }
  }, intervaloMs);
}
