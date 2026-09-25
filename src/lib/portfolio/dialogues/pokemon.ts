import type { Dialogue, PortfolioData } from "../types";

export function buildPokemonDialogues(data: PortfolioData): Record<string, Dialogue> {
  void data;
  const out: Record<string, Dialogue> = {};

  out["poke-pikachu"] = {
    speaker: "Pikachu",
    pages: [
      { text: "Pika-pika! ⚡ *solta faíscas alegres pelas bochechas vermelhas*" },
      { text: "Pikachu parece muito animado para explorar os projetos com você!" },
    ],
  };

  out["poke-psyduck"] = {
    speaker: "Psyduck",
    pages: [
      {
        text: "Psy... duck? 🌊 *mergulha na água cristalina do oásis e segura a cabeça pensativo*",
      },
      {
        text: "A água fresca parece aliviar as dores de cabeça causadas por bugs complexos!\nQuer desafiar as habilidades psíquicas do Psyduck?",
        battleOpponentId: "psyduck",
        battleLabel: "Desafiar Psyduck",
      },
    ],
  };

  out["poke-charmander"] = {
    speaker: "Charmander",
    pages: [
      { text: "Char-char! 🔥 *a chama na ponta da cauda queima forte e aquece o acampamento*" },
      { text: "Charmander está mantendo a fogueira dev acesa durante toda a noite!" },
    ],
  };

  out["poke-machop"] = {
    speaker: "Machop",
    pages: [
      { text: "Chop! Machop! 🥊 *faz flexões e socos rápidos no ar em perfeita sincronia*" },
      {
        text: "Treinando pesado para refatorar qualquer legado e vencer testes rigorosos!\nMachop quer testar sua força em combate!",
        battleOpponentId: "machop",
        battleLabel: "Treinar com Machop",
      },
    ],
  };

  out["poke-trapinch"] = {
    speaker: "Trapinch",
    pages: [
      { text: "Pinch-pinch! 🏜️ *cava um pequeno buraco circular na areia dourada do deserto*" },
      {
        text: "Nativo das dunas do Desert Oasis, perfeitamente adaptado ao clima seco!\nTrapinch quer disputar uma batalha nas areias!",
        battleOpponentId: "trapinch",
        battleLabel: "Batalhar com Trapinch",
      },
    ],
  };

  out["poke-flygon"] = {
    speaker: "Flygon (Espírito do Deserto)",
    pages: [
      {
        text: "Goooon! ✨ *as asas vermelhas batem criando uma melodia mística como canto de areia*",
      },
      {
        text: "Conhecido como o Guardião do Monumento do Deserto, abençoa os desenvolvedores audaciosos!\nVocê se atreve a desafiar o poderoso Guardião do Deserto?",
        battleOpponentId: "flygon",
        battleLabel: "Desafiar Guardião Flygon",
      },
    ],
  };

  out["poke-chansey"] = {
    speaker: "Chansey",
    pages: [
      { text: "Chanseeeey! ❤️ *estende um ovo de felicidade com um sorriso caloroso*" },
      { text: "Chansey restaura todo o estresse e cansaço mental dos programadores!" },
    ],
  };

  out["poke-bulbasaur"] = {
    speaker: "Bulbasaur",
    pages: [
      { text: "Bulba-saur! 🌿 *o broto em suas costas absorve a luz dos monitores de pesquisa*" },
      { text: "Ajudando os pesquisadores do SENAI na germinação de novas tecnologias!" },
    ],
  };

  out["poke-porygon"] = {
    speaker: "Porygon",
    pages: [
      { text: "Pory-gon! 👾 *converte dados em pulsos luminosos entre as telas de código*" },
      { text: "Completamente feito de polígonos e código puro. O mascote ideal da Dev Workshop!" },
    ],
  };

  out["poke-eevee"] = {
    speaker: "Eevee",
    pages: [
      { text: "Eev-vee! 🐾 *se espreguiça preguiçosamente no tapete macio diante da lareira*" },
      {
        text: "Eevee possui infinitas possibilidades de evolução, assim como a carreira de um dev!",
      },
    ],
  };

  out["poke-arcanine"] = {
    speaker: "Arcanine",
    pages: [
      { text: "ROAAAR! 🦁🔥 *solta um rugido majestoso ecoando pela Arena de Projetos*" },
      {
        text: "Símbolo de liderança, lealdade e bravura técnica diante dos maiores desafios!\nO lendário Arcanine está pronto para defender a Arena!",
        battleOpponentId: "arcanine",
        battleLabel: "Batalhar com Arcanine da Arena",
      },
    ],
  };


  return out;
}
