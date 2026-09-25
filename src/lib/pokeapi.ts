import type { Move, Opponent, PlayerPokemon } from "@/lib/battle/types";

const pokemonCache = new Map<string, PlayerPokemon>();

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string): Promise<Response | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(8000),
      });

      if (response.ok || (response.status < 500 && response.status !== 429)) {
        return response;
      }

      if (attempt === 0) {
        await wait(500);
      }
    } catch (error) {
      if (isAbortError(error)) {
        return null;
      }
      if (attempt === 0) {
        await wait(500);
        continue;
      }
      return null;
    }
  }

  return null;
}

const TYPE_TRANSLATIONS: Record<string, string> = {
  normal: "Normal",
  fire: "Fogo",
  water: "Água",
  grass: "Planta",
  electric: "Elétrico",
  ice: "Gelo",
  fighting: "Lutador",
  poison: "Veneno",
  ground: "Terra",
  flying: "Voador",
  psychic: "Psíquico",
  bug: "Inseto",
  rock: "Pedra",
  ghost: "Fantasma",
  dragon: "Dragão",
  steel: "Aço",
  dark: "Noturno",
  fairy: "Fada",
};

const THEMATIC_MOVES: Record<
  string,
  { name: string; power: number; maxPp: number; desc: string }[]
> = {
  Fogo: [
    {
      name: "Lança-Chamas",
      power: 36,
      maxPp: 15,
      desc: "Dispara uma torrente intensa de chamas ardentes.",
    },
    { name: "Brasa Viva", power: 22, maxPp: 25, desc: "Lança brasas crepitantes no oponente." },
    {
      name: "Giro de Fogo",
      power: 28,
      maxPp: 15,
      desc: "Envolve o alvo em um vórtice de fogo giratório.",
    },
    {
      name: "Investida Ígnea",
      power: 32,
      maxPp: 12,
      desc: "Avança envolvido em um manto de labaredas.",
    },
  ],
  Água: [
    {
      name: "Hidro Bomba",
      power: 38,
      maxPp: 8,
      desc: "Dispara um poderoso jato de água em altíssima pressão.",
    },
    {
      name: "Jato d'Água",
      power: 24,
      maxPp: 20,
      desc: "Atira água límpida e veloz em linha reta.",
    },
    {
      name: "Bolhas Cortantes",
      power: 20,
      maxPp: 25,
      desc: "Lança rajadas de bolhas energizadas.",
    },
    { name: "Surfar", power: 30, maxPp: 15, desc: "Cria uma onda que atinge o campo adversário." },
  ],
  Planta: [
    {
      name: "Raio Solar",
      power: 40,
      maxPp: 8,
      desc: "Reúne energia solar concentrada e dispara em feixe.",
    },
    {
      name: "Folha Navalha",
      power: 26,
      maxPp: 20,
      desc: "Lança folhas afiadas com corte certeiro.",
    },
    {
      name: "Semente Vampira",
      power: 20,
      maxPp: 25,
      desc: "Drena a vitalidade do alvo com raízes sutis.",
    },
    {
      name: "Chicote de Vinha",
      power: 22,
      maxPp: 25,
      desc: "Chicoteia com ramos fortes e flexíveis.",
    },
  ],
  Elétrico: [
    { name: "Trovão", power: 40, maxPp: 8, desc: "Convoca um relâmpago estrondoso do céu." },
    {
      name: "Choque do Trovão",
      power: 24,
      maxPp: 25,
      desc: "Descarrega uma onda elétrica de alta voltagem.",
    },
    {
      name: "Faísca Veloz",
      power: 26,
      maxPp: 20,
      desc: "Ataca em disparada gerando estática fulminante.",
    },
    {
      name: "Onda de Choque",
      power: 30,
      maxPp: 15,
      desc: "Pulso elétrico impossível de esquivar.",
    },
  ],
  Lutador: [
    {
      name: "Soco Dinâmico",
      power: 36,
      maxPp: 10,
      desc: "Soco devastador com todo o peso do lutador.",
    },
    {
      name: "Golpe Cruzado",
      power: 28,
      maxPp: 15,
      desc: "Golpe duplo executado com precisão marcial.",
    },
    { name: "Rasteira Rápida", power: 22, maxPp: 20, desc: "Derruba o adversário com agilidade." },
    {
      name: "Quebra Telhas",
      power: 30,
      maxPp: 15,
      desc: "Corte seco que parte qualquer barreira.",
    },
  ],
  Terra: [
    {
      name: "Terremoto",
      power: 40,
      maxPp: 10,
      desc: "Faz o solo tremer com força telúrica máxima.",
    },
    { name: "Tiro de Lama", power: 22, maxPp: 20, desc: "Dispara torrões de terra endurecida." },
    {
      name: "Cavoucar",
      power: 30,
      maxPp: 12,
      desc: "Mergulha no solo e ressurge com golpe surpresa.",
    },
    {
      name: "Tempestade de Areia",
      power: 25,
      maxPp: 15,
      desc: "Levanta um redemoinho de areia abrasiva.",
    },
  ],
  Psíquico: [
    {
      name: "Psíquico",
      power: 36,
      maxPp: 12,
      desc: "Manifesta puro poder telecinético sobre o adversário.",
    },
    {
      name: "Confusão Mental",
      power: 24,
      maxPp: 20,
      desc: "Ondas mentais que desestabilizam o foco do alvo.",
    },
    {
      name: "Raio Psíquico",
      power: 30,
      maxPp: 15,
      desc: "Feixe de luz mística projetado da mente.",
    },
    {
      name: "Visão Futura",
      power: 38,
      maxPp: 8,
      desc: "Prepara uma retaliação psíquica inevitável.",
    },
  ],
  Dragão: [
    {
      name: "Pulso do Dragão",
      power: 36,
      maxPp: 10,
      desc: "Dispara uma onda de choque draconiana.",
    },
    {
      name: "Garra do Dragão",
      power: 30,
      maxPp: 15,
      desc: "Rasga com garras afiadas como diamante.",
    },
    {
      name: "Sopro Dracônico",
      power: 25,
      maxPp: 20,
      desc: "Expira uma rajada com essência mítica.",
    },
    {
      name: "Fúria do Dragão",
      power: 38,
      maxPp: 8,
      desc: "Ataque feroz que desafia qualquer resistência.",
    },
  ],
  Aço: [
    {
      name: "Canhão de Flash",
      power: 36,
      maxPp: 10,
      desc: "Concentra o brilho metálico em um feixe laser.",
    },
    { name: "Garra de Metal", power: 26, maxPp: 20, desc: "Ataque certeiro com garras blindadas." },
    {
      name: "Asa de Aço",
      power: 28,
      maxPp: 15,
      desc: "Golpeia com rigidez metálica impenetrável.",
    },
    {
      name: "Cabeçada de Ferro",
      power: 32,
      maxPp: 12,
      desc: "Investe de cabeça como um aríete de aço.",
    },
  ],
  Veneno: [
    {
      name: "Bomba de Lodo",
      power: 36,
      maxPp: 10,
      desc: "Dispara uma onda ácida pesada de lodo corrosivo.",
    },
    {
      name: "Gás Tóxico",
      power: 24,
      maxPp: 20,
      desc: "Expele vapores pestilentos que asfixiam o adversário.",
    },
    {
      name: "Cauda Venenosa",
      power: 28,
      maxPp: 15,
      desc: "Chicoteia com uma ponta embebida em veneno letal.",
    },
    {
      name: "Tiro de Ácido",
      power: 30,
      maxPp: 15,
      desc: "Jato corrosivo que dissolve as defesas do oponente.",
    },
  ],
  Voador: [
    {
      name: "Talho de Ar",
      power: 34,
      maxPp: 12,
      desc: "Lâmina de ar comprimido disparada com precisão supersônica.",
    },
    {
      name: "Ataque de Asa",
      power: 26,
      maxPp: 20,
      desc: "Golpeia com asas abertas e enrijecidas.",
    },
    {
      name: "Vendaval do Deserto",
      power: 38,
      maxPp: 8,
      desc: "Redemoinho violento que levanta o adversário aos céus.",
    },
    {
      name: "Picar Aéreo",
      power: 22,
      maxPp: 25,
      desc: "Mergulho rasante veloz que atinge em cheio o alvo.",
    },
  ],
  Gelo: [
    {
      name: "Raio de Gelo",
      power: 36,
      maxPp: 10,
      desc: "Raio congelante que solidifica a umidade do ar.",
    },
    {
      name: "Nevasca Polar",
      power: 40,
      maxPp: 5,
      desc: "Tempestade gélida com estilhaços de gelo cortante.",
    },
    {
      name: "Caco de Gelo",
      power: 22,
      maxPp: 25,
      desc: "Disparo instantâneo de estilhaço gélido veloz.",
    },
    {
      name: "Soco Congelado",
      power: 28,
      maxPp: 15,
      desc: "Soco gélido envolto em geada profunda.",
    },
  ],
  Pedra: [
    {
      name: "Lâmina de Pedra",
      power: 38,
      maxPp: 8,
      desc: "Monólitos afiados cravam-se no adversário pelo chão.",
    },
    {
      name: "Deslize de Rochas",
      power: 30,
      maxPp: 12,
      desc: "Derruba uma chuva de pedregulhos pesados.",
    },
    {
      name: "Lançamento de Rocha",
      power: 24,
      maxPp: 20,
      desc: "Arremessa um bloco de pedra maciça com força bruta.",
    },
    {
      name: "Tumba de Pedra",
      power: 26,
      maxPp: 15,
      desc: "Aprisiona o alvo sob blocos de arenito compacto.",
    },
  ],
  Inseto: [
    {
      name: "Tesoura X",
      power: 34,
      maxPp: 12,
      desc: "Cruza garras e foices em um corte duplo cirúrgico.",
    },
    {
      name: "Zumbido de Inseto",
      power: 36,
      maxPp: 10,
      desc: "Vibração acústica estridente que abala a armadura.",
    },
    {
      name: "Picada Rápida",
      power: 22,
      maxPp: 25,
      desc: "Ataque pontual e rápido com ferrão energizado.",
    },
    {
      name: "Dança das Asas",
      power: 28,
      maxPp: 15,
      desc: "Pólen dispersado em rodopio confunde e atordoa o oponente.",
    },
  ],
  Noturno: [
    {
      name: "Pulso Sombrio",
      power: 36,
      maxPp: 10,
      desc: "Dispara uma onda de pensamentos e escuridão profunda.",
    },
    {
      name: "Mordida Feroz",
      power: 26,
      maxPp: 20,
      desc: "Mordida voraz carregada de malícia noturna.",
    },
    {
      name: "Golpe Baixo",
      power: 30,
      maxPp: 12,
      desc: "Ataca de surpresa antes que o adversário possa reagir.",
    },
    {
      name: "Jogo Sujo",
      power: 34,
      maxPp: 10,
      desc: "Usa a própria força do adversário contra ele.",
    },
  ],
  Fada: [
    {
      name: "Brilho Mágico",
      power: 34,
      maxPp: 12,
      desc: "Explosão ofuscante de pura luz feérica estelar.",
    },
    {
      name: "Força Lunar",
      power: 38,
      maxPp: 8,
      desc: "Canaliza a energia mística e serena da lua cheia.",
    },
    {
      name: "Voz Desarmante",
      power: 24,
      maxPp: 20,
      desc: "Melodia encantadora que atinge o alvo sem falhar.",
    },
    {
      name: "Vento Feérico",
      power: 28,
      maxPp: 15,
      desc: "Sopros cintilantes que envolvem e castigam o rival.",
    },
  ],
  Fantasma: [
    {
      name: "Bola Sombria",
      power: 35,
      maxPp: 12,
      desc: "Projeta uma esfera negra de energia espiritual.",
    },
    {
      name: "Garra Sombria",
      power: 28,
      maxPp: 15,
      desc: "Um rasgo espectral vindo de outra dimensão.",
    },
    {
      name: "Raio Noturno",
      power: 24,
      maxPp: 20,
      desc: "Rajada sinistra que atravessa armaduras.",
    },
    {
      name: "Assombração",
      power: 32,
      maxPp: 10,
      desc: "Sussurro fantasmagórico que causa calafrios.",
    },
  ],
  Normal: [
    { name: "Hiper Raio", power: 42, maxPp: 5, desc: "Um canhão de energia pura devastador." },
    { name: "Ataque Rápido", power: 22, maxPp: 25, desc: "Avança em velocidade supersônica." },
    { name: "Investida", power: 18, maxPp: 30, desc: "Choque físico direto e eficiente." },
    { name: "Pancada Forte", power: 26, maxPp: 20, desc: "Golpe seco e determinado." },
  ],
};

export { THEMATIC_MOVES };

export function generateMovesForTypes(types: string[]): Move[] {
  const result: Move[] = [];
  const primary = types[0] || "Normal";
  const secondary = types[1] || primary;

  const poolPrimary = THEMATIC_MOVES[primary] || THEMATIC_MOVES.Normal!;
  const poolSecondary = THEMATIC_MOVES[secondary] || THEMATIC_MOVES.Normal!;

  if (secondary !== primary) {
    // Multi-type Pokémon get distinct moves representing BOTH types!
    if (poolPrimary[0]) {
      result.push({
        name: poolPrimary[0].name,
        type: primary,
        power: poolPrimary[0].power,
        pp: poolPrimary[0].maxPp,
        maxPp: poolPrimary[0].maxPp,
        description: poolPrimary[0].desc,
      });
    }
    if (poolPrimary[1]) {
      result.push({
        name: poolPrimary[1].name,
        type: primary,
        power: poolPrimary[1].power,
        pp: poolPrimary[1].maxPp,
        maxPp: poolPrimary[1].maxPp,
        description: poolPrimary[1].desc,
      });
    }
    if (poolSecondary[0]) {
      result.push({
        name: poolSecondary[0].name,
        type: secondary,
        power: poolSecondary[0].power,
        pp: poolSecondary[0].maxPp,
        maxPp: poolSecondary[0].maxPp,
        description: poolSecondary[0].desc,
      });
    }
    if (poolSecondary[1]) {
      result.push({
        name: poolSecondary[1].name,
        type: secondary,
        power: poolSecondary[1].power,
        pp: poolSecondary[1].maxPp,
        maxPp: poolSecondary[1].maxPp,
        description: poolSecondary[1].desc,
      });
    }
  } else {
    // Single-type Pokémon
    for (let i = 0; i < Math.min(3, poolPrimary.length); i++) {
      const m = poolPrimary[i]!;
      result.push({
        name: m.name,
        type: primary,
        power: m.power,
        pp: m.maxPp,
        maxPp: m.maxPp,
        description: m.desc,
      });
    }
    const norm = THEMATIC_MOVES.Normal![1]!;
    result.push({
      name: norm.name,
      type: "Normal",
      power: norm.power,
      pp: norm.maxPp,
      maxPp: norm.maxPp,
      description: norm.desc,
    });
  }

  return result;
}

export function getAvailableMovesForPokemon(pokemon: { type: string }): Move[] {
  const types = pokemon.type.split("/").map((t) => t.trim());
  const seen = new Set<string>();
  const available: Move[] = [];

  for (const t of [...types, "Normal"]) {
    const list = THEMATIC_MOVES[t] || [];
    for (const m of list) {
      if (!seen.has(m.name)) {
        seen.add(m.name);
        available.push({
          name: m.name,
          type: t,
          power: m.power,
          pp: m.maxPp,
          maxPp: m.maxPp,
          description: m.desc,
        });
      }
    }
  }
  return available;
}

export const POPULAR_POKEMON_SUGGESTIONS = [
  "pikachu",
  "charizard",
  "lucario",
  "gengar",
  "blastoise",
  "venusaur",
  "mewtwo",
  "rayquaza",
  "dragonite",
  "garchomp",
  "greninja",
  "snorlax",
  "eevee",
  "sylveon",
  "arcanine",
  "flygon",
  "psyduck",
  "machop",
  "trapinch",
  "porygon",
  "lapras",
  "gardevoir",
  "tyranitar",
  "scizor",
  "alazar",
];

export async function fetchPokemonFromApi(
  nameOrId: string | number,
): Promise<PlayerPokemon | null> {
  const cleanQuery = String(nameOrId).toLowerCase().trim().replace(/\s+/g, "-");
  if (!cleanQuery) return null;

  const cached = pokemonCache.get(cleanQuery);
  if (cached) return cached;

  try {
    const res = await fetchWithRetry(
      `https://pokeapi.co/api/v2/pokemon/${cleanQuery}`,
    );
    if (!res) return null;

    const data: {
      id: number;
      name: string;
      types: Array<{ type: { name: string } }>;
      stats: Array<{ stat: { name: string }; base_stat: number }>;
      sprites?: {
        other?: {
          showdown?: {
            front_default?: string | null;
            back_default?: string | null;
          };
          "official-artwork"?: {
            front_default?: string | null;
          };
        };
        front_default?: string | null;
        back_default?: string | null;
      };
    } = await res.json();

    const types: string[] = data.types.map(
      (t) => TYPE_TRANSLATIONS[t.type.name] || t.type.name,
    );

    const baseHp =
      data.stats.find((s) => s.stat.name === "hp")?.base_stat ?? 60;
    const calculatedHp = Math.max(50, Math.round(baseHp * 1.4 + 20));

    const showdownFront = data.sprites?.other?.showdown?.front_default;
    const officialArt = data.sprites?.other?.["official-artwork"]?.front_default;
    const defaultFront = data.sprites?.front_default;
    const sprite =
      showdownFront ||
      officialArt ||
      defaultFront ||
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`;

    const showdownBack = data.sprites?.other?.showdown?.back_default;
    const defaultBack = data.sprites?.back_default;
    const backSprite = showdownBack || defaultBack || sprite;

    const formattedName = data.name.charAt(0).toUpperCase() + data.name.slice(1);

    const pokemon: PlayerPokemon = {
      id: `poke-${data.id}-${Date.now().toString(36)}`,
      name: formattedName,
      level: 25,
      hp: calculatedHp,
      maxHp: calculatedHp,
      exp: 0,
      maxExp: 100,
      sprite,
      backSprite,
      type: types.join(" / "),
      moves: generateMovesForTypes(types),
    };

    pokemonCache.set(cleanQuery, pokemon);
    return pokemon;
  } catch (error) {
    if (isAbortError(error)) {
      return null;
    }

    console.error("Erro ao processar Pokémon da PokéAPI:", error);
    return null;
  }
}

export async function fetchRandomPokemonTeam(size = 3): Promise<PlayerPokemon[]> {
  // Pool of fun, diverse Pokemon IDs (Gens 1-5)
  const pool = [
    25, 6, 9, 3, 94, 448, 143, 149, 445, 130, 131, 59, 133, 134, 135, 136, 196, 197, 212, 248, 282,
    330, 328, 66, 54, 4, 7, 1, 150, 384, 658, 700, 137,
  ];
  // Shuffle pool
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, size);

  const team: PlayerPokemon[] = [];
  for (const id of shuffled) {
    const p = await fetchPokemonFromApi(id);
    if (p) team.push(p);
  }
  return team;
}

export async function fetchRandomOpponent(): Promise<Opponent> {
  const pool = [150, 384, 445, 94, 6, 130, 248, 149, 448, 330, 59, 143, 25, 131, 212, 282];
  const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
  const teamSize = 2 + Math.floor(Math.random() * 2); // 2 or 3 pokemon squad!
  const pickedIds = shuffledPool.slice(0, teamSize);

  const trainers = [
    {
      title: "Treinador Campeão Red",
      avatar: "https://play.pokemonshowdown.com/sprites/trainers/red.png",
    },
    {
      title: "Mestre Lucas",
      avatar: "https://play.pokemonshowdown.com/sprites/trainers/lucas.png",
    },
    {
      title: "Campeã Cynthia",
      avatar: "https://play.pokemonshowdown.com/sprites/trainers/cynthia.png",
    },
    {
      title: "Treinadora Dawn",
      avatar: "https://play.pokemonshowdown.com/sprites/trainers/dawn.png",
    },
    {
      title: "Viajante Brendan",
      avatar: "https://play.pokemonshowdown.com/sprites/trainers/brendan.png",
    },
    {
      title: "Líder Volkner",
      avatar: "https://play.pokemonshowdown.com/sprites/trainers/volkner.png",
    },
  ];
  const chosenTrainer = trainers[Math.floor(Math.random() * trainers.length)]!;

  const fetchedTeam: OpponentMember[] = [];
  for (const id of pickedIds) {
    const p = await fetchPokemonFromApi(id);
    if (p) {
      fetchedTeam.push({
        id: `opp-${p.name.toLowerCase()}`,
        name: p.name,
        level: 26 + Math.floor(Math.random() * 6),
        maxHp: Math.round(p.maxHp * 1.15),
        sprite: p.sprite,
        type: p.type,
        moves: p.moves.slice(0, 3).map((m) => ({ name: m.name, type: m.type, power: m.power })),
        rewardExp: 60 + Math.floor(Math.random() * 25),
      });
    }
  }

  if (fetchedTeam.length === 0) {
    const fallbackMember: OpponentMember = {
      id: "opp-random",
      name: "Dragonite",
      level: 30,
      maxHp: 120,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/149.gif",
      type: "Dragão / Voador",
      moves: [
        { name: "Garra do Dragão", type: "Dragão", power: 30 },
        { name: "Hiper Raio", type: "Normal", power: 38 },
        { name: "Ataque de Asa", type: "Voador", power: 25 },
      ],
      rewardExp: 75,
    };
    return {
      ...fallbackMember,
      trainer: chosenTrainer.title,
      trainerAvatar: chosenTrainer.avatar,
      team: [fallbackMember],
    };
  }

  const leader = fetchedTeam[0]!;
  return {
    ...leader,
    trainer: chosenTrainer.title,
    trainerAvatar: chosenTrainer.avatar,
    team: fetchedTeam,
  };
}
