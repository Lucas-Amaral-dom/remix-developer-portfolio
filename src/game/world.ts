// Pure, browser-safe map data for the pixel-art portfolio.
// No engine imports here so both SSR routes and the lazy game module can use it.

export const TILE = 32;

export type SceneId =
  "city" | "home" | "lab" | "arena" | "shop" | "inn" | "workshop" | "pokecenter";

export type FurnitureKind =
  | "npc"
  | "desk"
  | "shelf"
  | "plant"
  | "trophy"
  | "counter"
  | "painting"
  | "bed"
  | "rug"
  | "console"
  | "swing"
  | "slide"
  | "sandbox"
  | "bench"
  | "fountain"
  | "sign"
  | "campfire"
  | "monument"
  | "dummy"
  | "duck"
  | "computer"
  | "tent"
  | "brazier"
  | "pokemon"
  | "well"
  | "stall"
  | "rock"
  | "banner"
  | "gazebo"
  | "table"
  | "chair"
  | "planter"
  | "crate";

export interface Interactable {
  /** tile coords of the object itself */
  x: number;
  y: number;
  kind: FurnitureKind;
  /** row of the NPC spritesheet (0-12), only for kind "npc" */
  npc?: number;
  /** which way the NPC looks: down | up | left | right */
  face?: "down" | "up" | "left" | "right";
  /** optional Pokemon sprite key for kind "pokemon" */
  poke?: string;
  /** floating label above the object */
  label: string;
  /** id resolved to dialogue pages by the React layer */
  dialogue: string;
}

export interface Exit {
  x: number;
  y: number;
  to: SceneId;
  spawn: { x: number; y: number };
}

export interface BuildingDef {
  sprite:
    "home" | "lab" | "arena" | "shop" | "pokecenter" | "pokemart" | "inn" | "workshop" | "cottage";
  /** top-left tile of the collision footprint */
  x: number;
  y: number;
  w: number;
  h: number;
  door: { x: number; y: number };
  to: SceneId;
  sign: string;
}

export interface SceneDef {
  id: SceneId;
  title: string;
  grid: string[];
  spawn: { x: number; y: number };
  interactables: Interactable[];
  exits: Exit[];
  buildings: BuildingDef[];
  indoor: boolean;
  hint: string;
}

/* ── grid helpers (build arrays instead of hand-counted string art) ───────── */

function makeGrid(w: number, h: number, fill: string): string[][] {
  return Array.from({ length: h }, () => Array.from({ length: w }, () => fill));
}

function set(g: string[][], x: number, y: number, ch: string) {
  const row = g[y];
  if (row && row[x] !== undefined) row[x] = ch;
}

function fillRect(g: string[][], x: number, y: number, w: number, h: number, ch: string) {
  for (let row = y; row < y + h; row++) {
    for (let col = x; col < x + w; col++) {
      set(g, col, row, ch);
    }
  }
}

function border(g: string[][], ch: string) {
  const h = g.length;
  const w = g[0]!.length;
  fillRect(g, 0, 0, w, 1, ch);
  fillRect(g, 0, h - 1, w, 1, ch);
  fillRect(g, 0, 0, 1, h, ch);
  fillRect(g, w - 1, 0, 1, h, ch);
}

function toRows(g: string[][]): string[] {
  return g.map((row) => row.join(""));
}

/* ── Desert Oasis city ───────────────────────────────────────────────────── */

export const CITY_W = 38;
export const CITY_H = 26;

export const CITY_BUILDINGS: BuildingDef[] = [
  {
    sprite: "pokecenter",
    x: 16,
    y: 2,
    w: 5,
    h: 4,
    door: { x: 18, y: 6 },
    to: "pokecenter",
    sign: "CENTRO POKÉMON — Cura & Descanso",
  },
  {
    sprite: "lab",
    x: 23,
    y: 2,
    w: 5,
    h: 4,
    door: { x: 25, y: 6 },
    to: "lab",
    sign: "LAB SENAI — Skills & Tech",
  },
  {
    sprite: "home",
    x: 4,
    y: 9,
    w: 5,
    h: 4,
    door: { x: 6, y: 13 },
    to: "home",
    sign: "CASA — Sobre mim",
  },
  {
    sprite: "inn",
    x: 25,
    y: 13,
    w: 7,
    h: 5,
    door: { x: 28, y: 18 },
    to: "inn",
    sign: "TRAINER INN — Pousada & Descanso",
  },
  {
    sprite: "workshop",
    x: 9,
    y: 18,
    w: 6,
    h: 4,
    door: { x: 11, y: 22 },
    to: "workshop",
    sign: "DEV WORKSHOP — Arquitetura & Código",
  },
  {
    sprite: "shop",
    x: 22,
    y: 19,
    w: 5,
    h: 4,
    door: { x: 24, y: 22 },
    to: "shop",
    sign: "LOJA & BAZAR — Contato",
  },
  {
    sprite: "arena",
    x: 29,
    y: 19,
    w: 6,
    h: 5,
    door: { x: 32, y: 23 },
    to: "arena",
    sign: "ARENA — Projetos",
  },
];

function buildCity(): SceneDef {
  // Base golden desert sand
  const g = makeGrid(CITY_W, CITY_H, "s");

  // Canyon perimeter rock cliffs around the oasis
  fillRect(g, 0, 0, CITY_W, 2, "C");
  fillRect(g, 0, CITY_H - 2, CITY_W, 2, "C");
  fillRect(g, 0, 0, 2, CITY_H, "C");
  fillRect(g, CITY_W - 2, 0, 2, CITY_H, "C");

  // Waterfall cut in the north cliff
  fillRect(g, 12, 0, 2, 3, "W");

  // South canyon staircase opening
  fillRect(g, 18, CITY_H - 2, 3, 2, "p");
  set(g, 17, CITY_H - 2, "K"); // Left torch brazier
  set(g, 21, CITY_H - 2, "K"); // Right torch brazier

  // Oasis Lake with deep blue water
  fillRect(g, 4, 3, 8, 4, "w");
  fillRect(g, 5, 2, 6, 1, "w");
  // Shore sand around lake
  fillRect(g, 3, 2, 1, 6, "s");
  fillRect(g, 12, 3, 1, 4, "s");
  fillRect(g, 4, 7, 8, 1, "s");

  // Wooden dock / pier extending into lake
  fillRect(g, 9, 4, 3, 2, "D");

  // Palms around oasis and town
  for (const [x, y] of [
    [2, 2],
    [3, 7],
    [13, 2],
    [14, 7],
    [2, 23],
    [15, 23],
    [22, 23],
    [35, 2],
    [35, 23],
  ] as const) {
    set(g, x, y, "P");
  }

  // Saguaro cacti and desert shrubs
  for (const [x, y] of [
    [2, 10],
    [8, 8],
    [15, 9],
    [22, 8],
    [35, 8],
    [35, 14],
    [16, 16],
    [27, 23],
  ] as const) {
    set(g, x, y, "X");
  }

  // Stone monument cactus sanctuary (cols 27-34, rows 8-12) - Fully open entry gates
  fillRect(g, 27, 8, 8, 1, "h");
  fillRect(g, 27, 12, 8, 1, "h");
  fillRect(g, 27, 8, 1, 5, "h");
  fillRect(g, 34, 8, 1, 5, "h");
  // Wide open entrance gate on south side (cols 29-32)
  set(g, 29, 12, "o");
  set(g, 30, 12, "p");
  set(g, 31, 12, "p");
  set(g, 32, 12, "o");
  // Wide open entrance gate on north side (cols 30-31)
  set(g, 30, 8, "o");
  set(g, 31, 8, "p");
  // Wide open entrance gate on west side (col 27, rows 9-11)
  set(g, 27, 9, "o");
  set(g, 27, 10, "p");
  set(g, 27, 11, "o");
  // Wide open entrance gate on east side (col 34, row 10)
  set(g, 34, 10, "o");
  set(g, 30, 10, "S"); // ancient stone statue
  set(g, 28, 9, "X");
  set(g, 33, 9, "X");
  set(g, 28, 11, "x");
  set(g, 33, 11, "x");

  // Fenced vegetable garden plot by Casa (cols 2-6, rows 14-16) with open walking path
  fillRect(g, 2, 14, 5, 3, "H");
  set(g, 3, 14, "p");
  set(g, 4, 14, "p");
  set(g, 5, 14, "p");
  set(g, 4, 15, "p");
  set(g, 4, 16, "p");

  // Sparring corral / training ring (cols 8-14, rows 14-17) - Fully OPEN gates on all sides
  fillRect(g, 8, 14, 7, 4, "h");
  fillRect(g, 9, 15, 5, 2, "s");
  // Wide open gate on North side (Row 14, cols 10, 11, 12)
  set(g, 10, 14, "o");
  set(g, 11, 14, "p");
  set(g, 12, 14, "o");
  // Wide open gate on South side (Row 17, cols 10, 11, 12)
  set(g, 10, 17, "o");
  set(g, 11, 17, "p");
  set(g, 12, 17, "o");
  // Wide open gate on East side facing main avenue (Col 14, rows 15-16)
  set(g, 14, 15, "o");
  set(g, 14, 16, "p");
  // Wide open gate on West side (Col 8, rows 15-16)
  set(g, 8, 15, "o");
  set(g, 8, 16, "p");
  // Dummies positioned neatly so walkway is wide and free
  set(g, 9, 15, "Y"); // dummy
  set(g, 9, 16, "Y"); // dummy
  set(g, 13, 15, "Y"); // dummy

  // Camping area (cols 2-7, rows 19-23)
  set(g, 5, 21, "K"); // Campfire
  set(g, 3, 20, "s"); // tent ground
  set(g, 2, 22, "s"); // tent ground

  // Oasis lakeside promenade and resting plaza.
  // The dock now feeds directly into a small paved square, giving the lake
  // a clear social landmark instead of leaving the shoreline visually empty.
  fillRect(g, 10, 7, 2, 3, "p");
  fillRect(g, 10, 9, 5, 4, "p");

  // Main Cobblestone / Sandstone Streets
  // North-south central avenue
  fillRect(g, 18, 6, 2, 18, "p");
  // East-west main crossroad
  fillRect(g, 6, 13, 22, 2, "p");
  // Connector to PokéCenter and Lab
  fillRect(g, 17, 6, 2, 2, "p");
  fillRect(g, 24, 6, 2, 2, "p");
  // Connector to Dev Workshop
  fillRect(g, 11, 21, 2, 2, "p");
  fillRect(g, 12, 19, 7, 2, "p");
  // Connector to Trainer Inn
  fillRect(g, 27, 17, 3, 2, "p");
  // Connector to Bazaar & Arena
  fillRect(g, 19, 18, 14, 2, "p");

  // Planter flower boxes in front of modern centers
  set(g, 15, 6, "F");
  set(g, 20, 6, "F");
  set(g, 22, 6, "F");
  set(g, 27, 6, "F");

  // Ornate street lamps with banners
  set(g, 15, 11, "L");
  set(g, 22, 11, "L");
  set(g, 16, 17, "L");
  set(g, 21, 17, "L");

  // Block building footprints
  for (const b of CITY_BUILDINGS) {
    fillRect(g, b.x, b.y, b.w, b.h, "B");
    set(g, b.door.x, b.door.y, "p");
  }

  return {
    id: "city",
    title: "Desert Oasis — Cidade dos Treinadores & Devs",
    grid: toRows(g),
    spawn: { x: 19, y: 15 },
    indoor: false,
    hint: "Explore o Desert Oasis! Aproxime-se da porta de qualquer construção para entrar suavemente.",
    buildings: CITY_BUILDINGS,
    interactables: [
      // Central Town Map & Bulletin Board
      { x: 19, y: 14, kind: "sign", label: "Mapa do Oásis", dialogue: "city-sign" },
      { x: 17, y: 14, kind: "bench", label: "Banco da Praça", dialogue: "city-bench" },
      {
        x: 18,
        y: 13,
        kind: "pokemon",
        poke: "pikachu",
        label: "Pikachu Companheiro",
        dialogue: "poke-pikachu",
      },
      {
        x: 19,
        y: 12,
        kind: "npc",
        npc: 0,
        face: "down",
        label: "Guia do Oásis",
        dialogue: "city-guide",
      },
      {
        x: 23,
        y: 13,
        kind: "npc",
        npc: 1,
        face: "left",
        label: "Viajante do Deserto",
        dialogue: "city-traveler",
      },
      // Oasis Lake & Dock
      {
        x: 11,
        y: 4,
        kind: "npc",
        npc: 4,
        face: "left",
        label: "Pescadora do Oásis",
        dialogue: "oasis-lake",
      },
      {
        x: 7,
        y: 4,
        kind: "pokemon",
        poke: "psyduck",
        label: "Psyduck Nadador",
        dialogue: "poke-psyduck",
      },
      { x: 5, y: 5, kind: "duck", label: "Mascote Aquático", dialogue: "oasis-duck" },
      { x: 5, y: 7, kind: "sign", label: "Guarda-sol & Descanso", dialogue: "oasis-umbrella" },
      { x: 3, y: 4, kind: "counter", label: "Barraca de Água de Coco", dialogue: "oasis-juice" },

      // Lakeside Oasis Plaza
      { x: 12, y: 10, kind: "fountain", label: "Fonte da Praça do Oásis", dialogue: "oasis-plaza" },
      { x: 10, y: 10, kind: "gazebo", label: "Pavilhão da Praça do Oásis", dialogue: "oasis-plaza" },
      { x: 11, y: 12, kind: "bench", label: "Banco da Fonte", dialogue: "city-bench" },
      { x: 14, y: 12, kind: "bench", label: "Banco da Fonte", dialogue: "city-bench" },
      { x: 13, y: 9, kind: "planter", label: "Jardim do Oásis", dialogue: "oasis-plaza" },
      { x: 14, y: 10, kind: "banner", label: "Bandeira da Praça", dialogue: "city-banner" },

      // Training Sparring Corral
      {
        x: 11,
        y: 16,
        kind: "npc",
        npc: 2,
        face: "up",
        label: "Lutador de Sparring",
        dialogue: "sparring-ring",
      },
      {
        x: 10,
        y: 16,
        kind: "pokemon",
        poke: "machop",
        label: "Machop Lutador",
        dialogue: "poke-machop",
      },
      { x: 10, y: 15, kind: "dummy", label: "Boneco de Treino", dialogue: "sparring-dummy" },
      { x: 12, y: 16, kind: "dummy", label: "Alvo de Treino", dialogue: "sparring-dummy" },

      // Camping Area
      { x: 5, y: 21, kind: "campfire", label: "Fogueira Aconchegante", dialogue: "camp-fire" },
      {
        x: 6,
        y: 21,
        kind: "pokemon",
        poke: "charmander",
        label: "Charmander da Fogueira",
        dialogue: "poke-charmander",
      },
      { x: 3, y: 20, kind: "tent", label: "Barraca de Camping", dialogue: "camp-camper" },
      { x: 2, y: 22, kind: "tent", label: "Barraca de Expedição", dialogue: "camp-camper" },
      {
        x: 4,
        y: 22,
        kind: "npc",
        npc: 3,
        face: "right",
        label: "Campista Dev",
        dialogue: "camp-camper",
      },

      // Dev Workshop Porch & Garden
      {
        x: 13,
        y: 22,
        kind: "npc",
        npc: 5,
        face: "down",
        label: "Desenvolvedor Full Stack",
        dialogue: "dev-coder",
      },
      {
        x: 14,
        y: 21,
        kind: "npc",
        npc: 4,
        face: "left",
        label: "Mecânica de Software",
        dialogue: "dev-mechanic",
      },
      { x: 15, y: 22, kind: "duck", label: "Mascote Dino Dev", dialogue: "dev-dino" },
      { x: 12, y: 22, kind: "computer", label: "Bancada com Monitores", dialogue: "dev-terminal" },

      // Cactus Sanctuary Monument
      {
        x: 30,
        y: 10,
        kind: "monument",
        label: "Monumento dos Treinadores",
        dialogue: "cactus-monument",
      },
      {
        x: 30,
        y: 9,
        kind: "pokemon",
        poke: "flygon",
        label: "Flygon Guardião",
        dialogue: "poke-flygon",
      },
      {
        x: 31,
        y: 11,
        kind: "npc",
        npc: 6,
        face: "up",
        label: "Ranger do Santuário",
        dialogue: "cactus-ranger",
      },
      {
        x: 32,
        y: 12,
        kind: "pokemon",
        poke: "trapinch",
        label: "Trapinch do Deserto",
        dialogue: "poke-trapinch",
      },

      // Bazaar / Marketplace
      {
        x: 24,
        y: 21,
        kind: "npc",
        npc: 1,
        face: "down",
        label: "Mercador de Frutas e Itens",
        dialogue: "bazaar-merchant",
      },

      // Circular Battle Arena
      {
        x: 32,
        y: 21,
        kind: "npc",
        npc: 9,
        face: "left",
        label: "Mestre de Batalhas",
        dialogue: "arena-trainer",
      },
      { x: 31, y: 22, kind: "duck", label: "Pássaro de Batalha", dialogue: "arena-bird" },

      // South Exit
      { x: 19, y: 24, kind: "sign", label: "Portal Sul do Oásis", dialogue: "south-exit" },

      // Desert city landmarks: visual anchors that make the map feel inhabited.
      { x: 34, y: 17, kind: "well", label: "Poço do Oásis", dialogue: "city-well" },
      { x: 16, y: 8, kind: "stall", label: "Barraca de Especiarias", dialogue: "city-stall" },
      { x: 20, y: 8, kind: "stall", label: "Barraca de Artesanato", dialogue: "city-stall" },
      { x: 15, y: 12, kind: "rock", label: "Pedras do Canyon", dialogue: "city-rock" },
      { x: 26, y: 11, kind: "rock", label: "Pedras do Deserto", dialogue: "city-rock" },
      { x: 17, y: 10, kind: "banner", label: "Bandeira do Oásis", dialogue: "city-banner" },

      // Benches
      { x: 22, y: 14, kind: "bench", label: "Banco da Praça", dialogue: "city-bench" },
      { x: 7, y: 11, kind: "bench", label: "Banco do Jardim", dialogue: "city-bench" },
    ],
    exits: CITY_BUILDINGS.map((b) => ({
      x: b.door.x,
      y: b.door.y,
      to: b.to,
      spawn: { x: 6, y: 7 },
    })),
  };
}

/* ── interiors ───────────────────────────────────────────────────────────── */

function buildInterior(
  id: SceneId,
  title: string,
  interactables: Interactable[],
  hint: string,
): SceneDef {
  const w = 13;
  const h = 9;
  const g = makeGrid(w, h, ".");

  // Every building gets a deliberate floor plan instead of a generic empty room.
  // The center remains open for movement; decoration stays against walls.
  border(g, "W");
  fillRect(g, 1, 1, w - 2, 1, "V");

  const floorByScene: Record<SceneId, string> = {
    city: ".",
    home: "i",
    lab: "q",
    arena: "q",
    shop: "i",
    inn: "i",
    workshop: "q",
    pokecenter: "q",
  };

  const floor = floorByScene[id];
  fillRect(g, 1, 2, w - 2, h - 3, floor);

  // Subtle checker/aisle pattern keeps rooms readable without becoming noisy.
  for (let y = 2; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      if ((x + y) % 2 === 0 && floor !== "i") set(g, x, y, "q");
    }
  }

  // Scene-specific visual anchors.
  if (id === "home" || id === "inn") {
    fillRect(g, 4, 5, 5, 2, "r");
  }
  if (id === "lab" || id === "pokecenter") {
    fillRect(g, 5, 2, 3, 1, "V");
    fillRect(g, 5, 6, 3, 1, "r");
  }
  if (id === "arena") {
    fillRect(g, 4, 4, 5, 2, "r");
  }
  if (id === "workshop") {
    fillRect(g, 4, 5, 5, 1, "r");
  }
  if (id === "shop") {
    fillRect(g, 4, 5, 5, 1, "r");
  }

  // Door is centered and always has a clear 3-tile approach.
  set(g, 6, h - 1, "E");

  return {
    id,
    title,
    grid: toRows(g),
    spawn: { x: 6, y: 7 },
    indoor: true,
    hint,
    buildings: [],
    interactables,
    exits: [{ x: 6, y: h - 1, to: "city", spawn: { x: 6, y: 7 } }],
  };
}

export const SCENES: Record<SceneId, SceneDef> = {
  city: buildCity(),
  home: buildInterior(
    "home",
    "Casa — Sobre mim",
    [
      {
        x: 6,
        y: 4,
        kind: "npc",
        npc: 2,
        face: "down",
        label: "Lucas Amaral",
        dialogue: "about-intro",
      },
      { x: 2, y: 2, kind: "painting", label: "Quadro de Atributos", dialogue: "about-card" },
      { x: 10, y: 2, kind: "bed", label: "Cama", dialogue: "about-hobby" },
      { x: 4, y: 6, kind: "desk", label: "Escrivaninha de Estudos", dialogue: "about-story" },
      { x: 9, y: 6, kind: "console", label: "Console de Jogos", dialogue: "about-seeking" },
      { x: 1, y: 6, kind: "plant", label: "Planta Decorativa", dialogue: "flavor-plant" },
      { x: 10, y: 2, kind: "shelf", label: "Estante de Estudos", dialogue: "about-story" },
      { x: 2, y: 5, kind: "rug", label: "Tapete da Casa", dialogue: "city-bench" },
    ],
    "Fale com o Lucas e vasculhe os móveis para conhecer sua história.",
  ),
  lab: buildInterior(
    "lab",
    "Lab SENAI — Skills & Tech",
    [
      { x: 2, y: 3, kind: "desk", label: "Bancada: Base de Código", dialogue: "skill-base" },
      {
        x: 3,
        y: 3,
        kind: "pokemon",
        poke: "bulbasaur",
        label: "Bulbasaur Pesquisador",
        dialogue: "poke-bulbasaur",
      },
      { x: 5, y: 3, kind: "desk", label: "Bancada: Web & Front-end", dialogue: "skill-web" },
      { x: 8, y: 3, kind: "desk", label: "Bancada: Dados & Backend", dialogue: "skill-data" },
      {
        x: 11,
        y: 3,
        kind: "desk",
        label: "Bancada: Qualidade & Deploy",
        dialogue: "skill-quality",
      },
      {
        x: 6,
        y: 6,
        kind: "npc",
        npc: 9,
        face: "down",
        label: "Instrutor SENAI",
        dialogue: "skills-intro",
      },
      { x: 1, y: 6, kind: "shelf", label: "Mural de Tecnologias", dialogue: "skills-list" },
      { x: 10, y: 6, kind: "shelf", label: "Biblioteca Técnica", dialogue: "skills-list" },
      { x: 2, y: 5, kind: "computer", label: "Terminal de Testes", dialogue: "skill-quality" },
    ],
    "Cada bancada de pesquisa detalha uma área técnica do desenvolvedor.",
  ),
  arena: buildInterior(
    "arena",
    "Arena — Projetos",
    [
      { x: 3, y: 3, kind: "trophy", label: "Troféu: Biblioteca", dialogue: "project-0" },
      { x: 6, y: 3, kind: "trophy", label: "Troféu: Guarda-vidas", dialogue: "project-1" },
      { x: 9, y: 3, kind: "trophy", label: "Troféu: Portfólio RPG", dialogue: "project-2" },
      {
        x: 8,
        y: 5,
        kind: "pokemon",
        poke: "arcanine",
        label: "Arcanine Campeão",
        dialogue: "poke-arcanine",
      },
      {
        x: 11,
        y: 6,
        kind: "npc",
        npc: 6,
        face: "left",
        label: "Juíza da Arena",
        dialogue: "projects-intro",
      },
      { x: 1, y: 6, kind: "shelf", label: "Hall dos Campeões", dialogue: "projects-all" },
      { x: 2, y: 6, kind: "bench", label: "Banco da Arena", dialogue: "city-bench" },
      { x: 10, y: 6, kind: "dummy", label: "Alvo de Treino", dialogue: "sparring-dummy" },
      { x: 2, y: 2, kind: "banner", label: "Bandeira da Arena", dialogue: "city-banner" },
    ],
    "Cada troféu guarda os repositórios e tecnologias dos projetos.",
  ),
  shop: buildInterior(
    "shop",
    "Loja & Bazar — Contato",
    [
      { x: 6, y: 3, kind: "counter", label: "Balcão de Contato", dialogue: "contact-form" },
      {
        x: 6,
        y: 2,
        kind: "npc",
        npc: 1,
        face: "down",
        label: "Atendente",
        dialogue: "contact-intro",
      },
      { x: 2, y: 6, kind: "shelf", label: "Redes & Links", dialogue: "contact-links" },
      { x: 10, y: 6, kind: "plant", label: "Cacto Raro", dialogue: "flavor-plant" },
      { x: 10, y: 3, kind: "console", label: "Terminal de Localização", dialogue: "contact-city" },
      { x: 1, y: 3, kind: "shelf", label: "Produtos do Bazar", dialogue: "contact-links" },
      { x: 9, y: 6, kind: "crate", label: "Caixas do Bazar", dialogue: "city-stall" },
    ],
    "Fale com a atendente no balcão para enviar uma mensagem diretamente.",
  ),
  inn: buildInterior(
    "inn",
    "Trainer Inn — Pousada dos Treinadores",
    [
      { x: 6, y: 3, kind: "counter", label: "Recepção da Pousada", dialogue: "inn-clerk" },
      {
        x: 6,
        y: 2,
        kind: "npc",
        npc: 5,
        face: "down",
        label: "Hoteleira do Oásis",
        dialogue: "inn-clerk",
      },
      { x: 2, y: 3, kind: "bed", label: "Cama Macia", dialogue: "inn-rest" },
      { x: 10, y: 3, kind: "bed", label: "Cama Macia", dialogue: "inn-rest" },
      {
        x: 9,
        y: 6,
        kind: "pokemon",
        poke: "eevee",
        label: "Eevee Sonolento",
        dialogue: "poke-eevee",
      },
      { x: 2, y: 6, kind: "shelf", label: "Livro de Hóspedes", dialogue: "inn-book" },
      { x: 10, y: 6, kind: "console", label: "Lareira Acolhedora", dialogue: "inn-fire" },
      { x: 6, y: 6, kind: "table", label: "Mesa da Pousada", dialogue: "inn-book" },
      { x: 4, y: 6, kind: "chair", label: "Cadeira da Pousada", dialogue: "inn-book" },
    ],
    "Descanse nas camas para revigorar seus Pokémon e seu espírito de dev!",
  ),
  workshop: buildInterior(
    "workshop",
    "Dev Workshop — Oficina de Código",
    [
      {
        x: 6,
        y: 4,
        kind: "desk",
        label: "Estação Principal: React + Vite",
        dialogue: "workshop-stack",
      },
      {
        x: 8,
        y: 4,
        kind: "pokemon",
        poke: "porygon",
        label: "Porygon Mascote",
        dialogue: "poke-porygon",
      },
      {
        x: 6,
        y: 3,
        kind: "npc",
        npc: 7,
        face: "down",
        label: "Arquiteto de Software",
        dialogue: "workshop-coder",
      },
      { x: 2, y: 3, kind: "shelf", label: "Quadro Kanban & Código", dialogue: "workshop-board" },
      {
        x: 10,
        y: 3,
        kind: "console",
        label: "Terminal de Build & Deploy",
        dialogue: "workshop-deploy",
      },
      { x: 2, y: 6, kind: "desk", label: "Bancada de Testes & Lint", dialogue: "workshop-lint" },
      { x: 10, y: 6, kind: "plant", label: "Planta Bonsai", dialogue: "flavor-plant" },
      { x: 2, y: 5, kind: "computer", label: "Terminal de Integração", dialogue: "workshop-deploy" },
      { x: 9, y: 5, kind: "computer", label: "Terminal de Testes", dialogue: "workshop-lint" },
    ],
    "Conheça as ferramentas, arquitetura e bastidores deste projeto.",
  ),
  pokecenter: buildInterior(
    "pokecenter",
    "Centro Pokémon — Cura & Treinadores",
    [
      { x: 6, y: 3, kind: "counter", label: "Balcão de Atendimento", dialogue: "pokecenter-nurse" },
      {
        x: 7,
        y: 2,
        kind: "pokemon",
        poke: "chansey",
        label: "Chansey Assistente",
        dialogue: "poke-chansey",
      },
      {
        x: 6,
        y: 2,
        kind: "npc",
        npc: 4,
        face: "down",
        label: "Enfermeira Joy",
        dialogue: "pokecenter-nurse",
      },
      { x: 2, y: 3, kind: "console", label: "PC de Treinador & Git", dialogue: "pokecenter-pc" },
      { x: 10, y: 3, kind: "shelf", label: "Mapa da Região", dialogue: "pokecenter-map" },
      { x: 2, y: 6, kind: "bench", label: "Sofá da Recepção", dialogue: "city-bench" },
      { x: 10, y: 6, kind: "plant", label: "Vaso de Flores", dialogue: "flavor-plant" },
      { x: 1, y: 5, kind: "shelf", label: "Suprimentos Médicos", dialogue: "pokecenter-map" },
      { x: 9, y: 5, kind: "bench", label: "Banco de Espera", dialogue: "city-bench" },
    ],
    "Recupere suas energias e converse com a Enfermeira Joy!",
  ),
};

export const SOLID_TILES = new Set([
  "T",
  "w",
  "W",
  "B",
  "W",
  "V",
  "h",
  "C",
  "P",
  "X",
  "H",
  "S",
  "U",
]);

export const BADGES: { scene: SceneId; name: string }[] = [
  { scene: "home", name: "Insígnia da Casa" },
  { scene: "lab", name: "Insígnia do Lab" },
  { scene: "arena", name: "Insígnia da Arena" },
  { scene: "shop", name: "Insígnia da Loja" },
];
