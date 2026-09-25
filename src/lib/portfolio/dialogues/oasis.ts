import type { Dialogue, PortfolioData } from "../types";

export function buildOasisDialogues(data: PortfolioData): Record<string, Dialogue> {
  void data;
  const out: Record<string, Dialogue> = {};


  out["city-traveler"] = {
    speaker: "Viajante do Deserto",
    pages: [
      { text: "Atravessei as dunas até chegar a este Oásis!" },
      { text: "Dizem que o Lucas Amaral construiu esse refúgio unindo código e criatividade." },
      {
        text: "Você já visitou a Casa dele e o Lab do SENAI logo ali acima?\nMeu Flygon quer sentir a emoção de uma boa batalha!",
        battleOpponentId: "flygon",
        battleLabel: "⚔️ Desafiar Viajante (Flygon Nv. 32)!",
      },
    ],
  };

  out["oasis-plaza"] = {
    speaker: "Praça do Oásis",
    pages: [
      { text: "Uma pequena praça sombreada entre o lago e as ruas principais." },
      { text: "É um ponto de encontro para treinadores descansarem, trocarem ideias e seguirem viagem." },
    ],
  };

  out["oasis-lake"] = {
    speaker: "Pescadora do Oásis",
    pages: [
      { text: "A água cristalina deste oásis refresca qualquer cansaço de depuração!" },
      {
        text: "A cachoeira vem direto do canyon vermelho. Meu Psyduck adora mergulhar e treinar aqui!",
        battleOpponentId: "psyduck",
        battleLabel: "⚔️ Batalhar com a Pescadora (Psyduck Nv. 20)!",
      },
    ],
  };

  out["oasis-duck"] = {
    speaker: "Pato do Oásis",
    pages: [{ text: "Quack! *mergulha na água fresca e solta pequenas bolhas brilhantes*" }],
  };

  out["oasis-umbrella"] = {
    speaker: "Guarda-sol & Cadeira",
    pages: [
      { text: "Uma espreguiçadeira confortável sob a sombra fresca do guarda-sol listrado." },
      { text: "A brisa do oásis sopra suavemente." },
    ],
  };

  out["oasis-juice"] = {
    speaker: "Barraca de Água de Coco",
    pages: [
      { text: "Água de coco fresca, sucos tropicais e frutas do deserto para recuperar HP!" },
    ],
  };

  out["sparring-ring"] = {
    speaker: "Lutador de Sparring",
    pages: [
      { text: "1, 2! Soco! Esquiva! A disciplina das artes marciais é idêntica à programação!" },
      {
        text: "Erros de compilação são como golpes recebidos: você aprende, refatora a postura e volta mais forte!\nQuer testar seus reflexos agora mesmo?",
        battleOpponentId: "machop",
        battleLabel: "⚔️ Batalhar com Lutador de Sparring!",
      },
    ],
  };

  out["sparring-dummy"] = {
    speaker: "Boneco de Treino",
    pages: [{ text: "Um boneco de madeira com marcas de treino. Testes unitários em ação!" }],
  };

  out["camp-fire"] = {
    speaker: "Fogueira do Acampamento",
    pages: [
      { text: "As chamas crepitam suavemente iluminando as barracas sob o céu do deserto." },
      { text: "Sentar ao redor do fogo renova as ideias para o próximo grande projeto." },
    ],
  };

  out["camp-camper"] = {
    speaker: "Campista Dev",
    pages: [
      { text: "Adoro acampar aqui! O ar noturno do deserto é perfeito para hackathons ao luar." },
      {
        text: "Meu Charmander mantém a fogueira acesa e adora batalhas animadas ao redor do fogo!",
        battleOpponentId: "charmander",
        battleLabel: "⚔️ Batalhar com o Campista Dev (Charmander Nv. 24)!",
      },
    ],
  };

  out["dev-coder"] = {
    speaker: "Desenvolvedor da Oficina",
    pages: [
      { text: "Bem-vindo ao Dev Workshop! Aqui é onde a mágica do código acontece." },
      {
        text: "Compilei um companheiro de código em pixel art: Porygon! Vamos testar nossas habilidades?",
        battleOpponentId: "porygon",
        battleLabel: "⚔️ Desafiar Desenvolvedor (Porygon Nv. 26)!",
      },
    ],
  };

  out["dev-mechanic"] = {
    speaker: "Mecânica de Software",
    pages: [
      {
        text: "Estou otimizando a pipeline de build e garantindo que cada sprite fique com renderização pixel-perfect nítida!",
      },
      {
        text: "Meu Eevee tem código polimórfico e está pronto para qualquer desafio! Aceita?",
        battleOpponentId: "eevee",
        battleLabel: "⚔️ Desafiar Mecânica de Software (Eevee Nv. 25)!",
      },
    ],
  };

  out["dev-dino"] = {
    speaker: "Dino Mascote",
    pages: [
      { text: "Gawrr! *balança a cauda amigavelmente dando suporte moral aos programadores*" },
    ],
  };

  out["dev-terminal"] = {
    speaker: "Bancada com Monitores",
    pages: [
      {
        text: "Telas duplas exibindo editores de código, terminal e painel de controle do Supabase.",
      },
      { text: "npm run build: 0 erros, TypeScript strict ativado!" },
    ],
  };

  out["cactus-monument"] = {
    speaker: "Monumento Antigo",
    pages: [
      {
        text: "Uma imponente escultura em pedra homenageando os pioneiros da tecnologia e treinadores lendários.",
      },
      { text: "Inscrição: 'Que cada linha escrita transforme ideias em realidade.'" },
    ],
  };

  out["cactus-ranger"] = {
    speaker: "Ranger do Santuário",
    pages: [
      { text: "Eu cuido destes cactos saguaro e do monumento sagrado." },
      {
        text: "Mesmo nas condições mais áridas do deserto, a determinação faz a vida florescer!\nTrapinch e eu queremos um duelo nas areias!",
        battleOpponentId: "trapinch",
        battleLabel: "⚔️ Desafiar Ranger do Santuário (Trapinch Nv. 22)!",
      },
    ],
  };

  out["bazaar-merchant"] = {
    speaker: "Mercador do Bazar",
    pages: [
      { text: "Venha conferir nossos suprimentos! Temos poções, frutas raras e contatos diretos!" },
      {
        text: "Precisa de um desenvolvedor dedicado e comunicativo? O Lucas está pronto para novos desafios!",
      },
    ],
  };

  out["arena-trainer"] = {
    speaker: "Mestre da Arena",
    pages: [
      {
        text: "Esta é a arena de combate! Treinamos duro para disputar nos maiores campeonatos de software.",
      },
      {
        text: "Meu Arcanine tem o fogo da paixão por tecnologia! Mostre do que sua equipe é capaz!",
        battleOpponentId: "arcanine",
        battleLabel: "⚔️ Desafiar Mestre da Arena (Arcanine Nv. 28)!",
      },
    ],
  };

  out["arena-bird"] = {
    speaker: "Pássaro de Batalha",
    pages: [{ text: "Piu-piu! *bate as asas animado pronto para o próximo round*" }],
  };

  out["south-exit"] = {
    speaker: "Portal Sul",
    pages: [
      {
        text: "Escadaria de pedra e tochas eternas que levam para a vasta região de Santa Catarina e além.",
      },
    ],
  };


  return out;
}
