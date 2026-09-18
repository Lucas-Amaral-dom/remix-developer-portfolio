import { sound } from "./sound";
import { type PlayerPokemon, type Move } from "./pokeapi";
import pikachuImg from "@/assets/pokemon/pikachu.png";
import charmanderImg from "@/assets/pokemon/charmander.png";
import bulbasaurImg from "@/assets/pokemon/bulbasaur.png";

export const DEFAULT_PLAYER_TEAM: PlayerPokemon[] = [
  {
    id: "starter-pikachu",
    name: "Pikachu",
    level: 25,
    hp: 100,
    maxHp: 100,
    exp: 42,
    maxExp: 100,
    sprite: pikachuImg,
    backSprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/25.gif",
    type: "Elétrico",
    moves: [
      {
        name: "Choque do Trovão",
        type: "Elétrico",
        power: 24,
        pp: 20,
        maxPp: 20,
        description: "Dispara descarga elétrica de alta voltagem.",
      },
      {
        name: "Ataque Rápido",
        type: "Normal",
        power: 16,
        pp: 30,
        maxPp: 30,
        description: "Ataca em velocidade ofuscante com alta prioridade.",
      },
      {
        name: "Cauda de Ferro",
        type: "Aço",
        power: 28,
        pp: 15,
        maxPp: 15,
        description: "Endurece a cauda como aço maciço e desfere um golpe pesado.",
      },
      {
        name: "Investida Trovão",
        type: "Elétrico",
        power: 32,
        pp: 10,
        maxPp: 10,
        description: "Envolve o corpo em eletricidade e avança com impacto crítico.",
      },
    ],
  },
  {
    id: "starter-charmander",
    name: "Charmander",
    level: 24,
    hp: 95,
    maxHp: 95,
    exp: 15,
    maxExp: 100,
    sprite: charmanderImg,
    backSprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/4.gif",
    type: "Fogo",
    moves: [
      {
        name: "Brasa",
        type: "Fogo",
        power: 22,
        pp: 25,
        maxPp: 25,
        description: "Lança brasas crepitantes no adversário.",
      },
      {
        name: "Lança-Chamas",
        type: "Fogo",
        power: 34,
        pp: 15,
        maxPp: 15,
        description: "Dispara uma poderosa e ardente coluna de fogo.",
      },
      {
        name: "Garra de Metal",
        type: "Aço",
        power: 24,
        pp: 20,
        maxPp: 20,
        description: "Ataca com garras duras como aço.",
      },
      {
        name: "Arranhão Feroz",
        type: "Normal",
        power: 18,
        pp: 30,
        maxPp: 30,
        description: "Desfere golpes rápidos com garras afiadas.",
      },
    ],
  },
  {
    id: "starter-bulbasaur",
    name: "Bulbasaur",
    level: 24,
    hp: 105,
    maxHp: 105,
    exp: 28,
    maxExp: 100,
    sprite: bulbasaurImg,
    backSprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/1.gif",
    type: "Planta / Veneno",
    moves: [
      {
        name: "Chicote de Vinha",
        type: "Planta",
        power: 22,
        pp: 25,
        maxPp: 25,
        description: "Golpeia o adversário com chicotes de vinhas verdes.",
      },
      {
        name: "Folha Navalha",
        type: "Planta",
        power: 28,
        pp: 20,
        maxPp: 20,
        description: "Lança folhas afiadas com alto índice de golpe crítico.",
      },
      {
        name: "Semente Sanguessuga",
        type: "Planta",
        power: 16,
        pp: 15,
        maxPp: 15,
        description: "Drena gradualmente a energia vital do adversário.",
      },
      {
        name: "Investida",
        type: "Normal",
        power: 16,
        pp: 35,
        maxPp: 35,
        description: "Investe contra o alvo com peso corporal total.",
      },
    ],
  },
];

const STORAGE_KEY = "portfolio_player_team";

/** Retrieves the current player team from localStorage, or initializes defaults */
export function getPlayerTeam(): PlayerPokemon[] {
  if (typeof window === "undefined") {
    return DEFAULT_PLAYER_TEAM.map((p) => ({
      ...p,
      moves: p.moves.map((m) => ({ ...m })),
    }));
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to load player team from localStorage:", err);
  }

  const initial = DEFAULT_PLAYER_TEAM.map((p) => ({
    ...p,
    moves: p.moves.map((m) => ({ ...m })),
  }));
  savePlayerTeam(initial);
  return initial;
}

/** Saves player team into localStorage */
export function savePlayerTeam(team: PlayerPokemon[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(team));
  } catch (err) {
    console.warn("Failed to save player team to localStorage:", err);
  }
}

/** Fully restores HP and PP of every Pokémon in the player's team */
export function healPlayerTeam(): { healedCount: number; team: PlayerPokemon[] } {
  const current = getPlayerTeam();
  let healedCount = 0;

  const healedTeam = current.map((pokemon) => {
    let wasHurt = false;
    if (pokemon.hp < pokemon.maxHp) {
      wasHurt = true;
    }

    const restoredMoves: Move[] = pokemon.moves.map((m) => {
      if (m.pp < m.maxPp) wasHurt = true;
      return { ...m, pp: m.maxPp };
    });

    if (wasHurt) healedCount++;

    return {
      ...pokemon,
      hp: pokemon.maxHp,
      moves: restoredMoves,
    };
  });

  savePlayerTeam(healedTeam);
  return { healedCount, team: healedTeam };
}
