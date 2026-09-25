import type { Dialogue, PortfolioData } from "../types";

export function buildCityDialogues(data: PortfolioData): Record<string, Dialogue> {
  const c = data.content;
  const t = (key: string) => c[key] ?? "";
  const name = t("playerName") || "Lucas";
  const out: Record<string, Dialogue> = {};
  const c = data.content;
  const t = (key: string) => c[key] ?? "";
  const name = t("playerName") || "Lucas";
  const out: Record<string, Dialogue> = {};

  out["city-sign"] = {
    speaker: "Placa",
    pages: [
      { text: `CIDADE DEV — portfólio de ${name}.` },
      { text: t("tagline") || "" },
      {
        text: "Casa = sobre mim · Lab = skills · Arena = projetos · Loja = contato.",
      },
    ],
  };
  out["city-guide"] = {
    speaker: "Guia",
    pages: [
      { text: `Bem-vindo! Eu cuido da cidade do ${name}.` },
      { text: "Ande até a porta de um prédio e aperte A para entrar." },
      { text: "Visite as 4 construções para juntar todas as insígnias." },
    ],
  };

  out["city-kid"] = {
    speaker: "Garoto do parquinho",
    pages: [
      { text: "Eu adoro o escorregador! Você já entrou na Arena?" },
      { text: `Dizem que o ${name} tem projetos guardados lá dentro.` },
    ],
  };
  out["city-lake"] = {
    speaker: "Moça do lago",
    pages: [
      { text: "O lago é o melhor lugar pra pensar em código." },
      { text: "O Lab do SENAI fica ali em cima, cheio de bancadas de skills." },
    ],
  };
  out["city-oldman"] = {
    speaker: "Senhor da praça",
    pages: [
      { text: "No meu tempo portfólio era papel. Hoje é jogo!" },
      { text: "As portas abrem sozinhas quando você chega perto. Tecnologia..." },
    ],
  };
  out["city-playground"] = {
    speaker: "Parquinho",
    pages: [{ text: "O parquinho da cidade. Pausa merecida entre dois commits." }],
  };
  out["city-bench"] = {
    speaker: "Banco",
    pages: [{ text: "Um banco de praça. Bom lugar pra revisar ideias." }],
  };
  out["city-well"] = {
    speaker: "Poço do Oásis",
    pages: [
      { text: "Um antigo poço de pedra que abastece a cidade nos dias mais secos." },
      { text: "Aqui a cidade lembra que bons sistemas precisam de uma base confiável." },
    ],
  };
  out["city-stall"] = {
    speaker: "Mercado do Oásis",
    pages: [
      { text: "Barraca de especiarias, artesanato e pequenos suprimentos para quem cruza o deserto." },
      { text: "Os detalhes dão personalidade à cidade — como uma boa interface dá personalidade a um projeto." },
    ],
  };
  out["city-rock"] = {
    speaker: "Pedras do Canyon",
    pages: [{ text: "Fragmentos do canyon vermelho usados como decoração nas ruas do Oásis." }],
  };
  out["city-banner"] = {
    speaker: "Bandeira do Oásis",
    pages: [{ text: "As cores da cidade: areia, terracota, água e ouro." }],
  };


  out["city-fountain"] = {
    speaker: "Fonte",
    pages: [{ text: "A fonte da cidade. Jogue uma moeda e faça um deploy sem bugs." }],
  };

  return out;
}
