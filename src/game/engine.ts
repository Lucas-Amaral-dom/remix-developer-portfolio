import kaplay from "kaplay";
import type { KAPLAYCtx } from "kaplay";

import {
  SCENES,
  SOLID_TILES,
  TILE,
  type FurnitureKind,
  type Interactable,
  type SceneDef,
  type SceneId,
} from "./world";

import homeSprite from "@/assets/build-home.png";
import labSprite from "@/assets/build-lab.png";
import arenaSprite from "@/assets/build-arena.png";
import shopSprite from "@/assets/build-shop.png";
import pokecenterSprite from "@/assets/build-pokecenter.png";
import pokemartSprite from "@/assets/build-pokemart.png";
import innSprite from "@/assets/build-inn.png";
import workshopSprite from "@/assets/build-workshop.png";
import cottageSprite from "@/assets/build-cottage.png";
import trainerIdleAtlas from "@/assets/trainers-overworld-idle-atlas.png";
import doorModernSprite from "@/assets/door-modern.png";
import doorWoodSprite from "@/assets/door-wood.png";
import desertSandTile from "@/assets/tiles/desert-sand.png";
import desertBrickTile from "@/assets/tiles/desert-brick.png";

import pikachuSprite from "@/assets/pokemon/pikachu.png";
import trapinchSprite from "@/assets/pokemon/trapinch.png";
import chanseySprite from "@/assets/pokemon/chansey.png";
import psyduckSprite from "@/assets/pokemon/psyduck.png";
import charmanderSprite from "@/assets/pokemon/charmander.png";
import machopSprite from "@/assets/pokemon/machop.png";
import porygonSprite from "@/assets/pokemon/porygon.png";
import arcanineSprite from "@/assets/pokemon/arcanine.png";
import eeveeSprite from "@/assets/pokemon/eevee.png";
import flygonSprite from "@/assets/pokemon/flygon.png";
import bulbasaurSprite from "@/assets/pokemon/bulbasaur.png";

import { sound } from "@/lib/sound";
import { TransitionManager, type TransitionType } from "./transition";

// KAPLAY components can be torn down while an animation callback is still queued.
// Keep visual updates defensive so scene transitions never write into a missing
// position/scale component.
type MutableVisual = {
  pos?: { x: number; y: number };
  scale?: { x: number; y: number };
};
const setPosX = (obj: MutableVisual | null | undefined, value: number) => { if (obj?.pos) obj.pos.x = value; };
const setPosY = (obj: MutableVisual | null | undefined, value: number) => { if (obj?.pos) obj.pos.y = value; };
const setScaleX = (obj: MutableVisual | null | undefined, value: number) => { if (obj?.scale) obj.scale.x = value; };
const setScaleY = (obj: MutableVisual | null | undefined, value: number) => { if (obj?.scale) obj.scale.y = value; };

export type Dir = "up" | "down" | "left" | "right";

export interface GameCallbacks {
  onDialogue: (id: string) => void;
  onScene: (scene: SceneDef) => void;
  onPrompt: (prompt: { label: string; action: string } | null) => void;
  onTransitionComplete?: (scene: SceneDef) => void;
}

export interface GameHandle {
  destroy: () => void;
  setPaused: (paused: boolean) => void;
  setDir: (dir: Dir | null) => void;
  interact: () => void;
  goTo: (scene: SceneId) => void;
  setTransitionType: (type: TransitionType) => void;
}

const SPRITES: Record<string, string> = {
  home: homeSprite,
  lab: labSprite,
  arena: arenaSprite,
  shop: shopSprite,
  pokecenter: pokecenterSprite,
  pokemart: pokemartSprite,
  inn: innSprite,
  workshop: workshopSprite,
  cottage: cottageSprite,
  "poke-pikachu": pikachuSprite,
  "poke-trapinch": trapinchSprite,
  "poke-chansey": chanseySprite,
  "poke-psyduck": psyduckSprite,
  "poke-charmander": charmanderSprite,
  "poke-machop": machopSprite,
  "poke-porygon": porygonSprite,
  "poke-arcanine": arcanineSprite,
  "poke-eevee": eeveeSprite,
  "poke-flygon": flygonSprite,
  "poke-bulbasaur": bulbasaurSprite,
};

/**
 * characters.png — GBA-style trainer sheets stacked vertically.
 * 4 columns (idle, step A, idle, step B) and 4 rows per character
 * (down, left, right, up). Character 0 is the player.
 */
/** Real overworld trainer atlas built from the supplied trainer assets.
 * 5 variants: Red (player) + Leaf, Brendan, May and Serena (NPCs).
 * Each variant has 4 native 32x48 idle directional cells: down, left, right, up.
 */
const TRAINER_VARIANTS = 5;
const TRAINER_DIR_INDEX: Record<Dir, number> = { down: 0, left: 1, right: 2, up: 3 };
const TRAINER_FRAMES_PER_DIRECTION = 4;
const trainerFrame = (variant: number, dir: Dir, walkFrame = 0) =>
  ((Math.abs(variant) % TRAINER_VARIANTS) * 4 + TRAINER_DIR_INDEX[dir]) *
    TRAINER_FRAMES_PER_DIRECTION +
  (Math.abs(walkFrame) % TRAINER_FRAMES_PER_DIRECTION);

// Each supplied trainer sheet has four poses per direction.
const trainerWalkFrame = (phase: number) =>
  Math.floor(Math.max(0, phase) * TRAINER_FRAMES_PER_DIRECTION) % TRAINER_FRAMES_PER_DIRECTION;
const npcTrainerVariant = (id: number) => 1 + (Math.abs(id) % (TRAINER_VARIANTS - 1));

/** minimal structural types so we can mutate kaplay objects with strict TS */
type LeafObj = { width: number; pos: { x: number; y: number } };
type PlayerObj = {
  pos: { x: number; y: number };
  frame: number;
  facing: Dir;
  step: number;
};

/** Desert Oasis palette */
const PALETTE: Record<string, [number, number, number]> = {
  s: [234, 213, 165], // warm desert sand
  p: [214, 182, 142], // sandstone paved street
  w: [56, 160, 220], // oasis lake water
  W: [110, 200, 242], // waterfall
  C: [176, 80, 52], // canyon red cliff rock
  D: [186, 140, 96], // wooden pier / dock
  P: [234, 213, 165], // palm tree ground
  X: [234, 213, 165], // cactus ground
  x: [234, 213, 165], // small cactus ground
  F: [214, 182, 142], // planter ground
  H: [136, 92, 58], // vegetable farm soil
  h: [234, 213, 165], // fence ground
  K: [234, 213, 165], // campfire ground
  S: [234, 213, 165], // monument ground
  Y: [234, 213, 165], // training dummy ground
  L: [214, 182, 142], // streetlamp ground
  B: [234, 213, 165], // building base
  g: [124, 190, 148], // grass
  ".": [238, 224, 196], // indoor wooden floor
  V: [150, 116, 92], // indoor back wall
  E: [214, 72, 72], // indoor exit mat
  i: [198, 154, 108], // warm indoor wood
  q: [184, 194, 204], // cool indoor tile
  r: [148, 86, 74], // interior rug
};

export function createGame(root: HTMLElement, cb: GameCallbacks): GameHandle {
  // Own the canvas so it always fills the React container instead of the window.
  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  canvas.style.outline = "none";
  canvas.tabIndex = 0;
  root.appendChild(canvas);
  canvas.addEventListener("pointerdown", () => canvas.focus());
  requestAnimationFrame(() => canvas.focus());

  const k: KAPLAYCtx = kaplay({
    canvas,
    width: 960,
    height: 704,
    background: [36, 26, 22],
    global: false,
    crisp: true,
    pixelDensity: 1,
    stretch: true,
    letterbox: true,
    debug: false,
    focus: false,
  });

  for (const [name, src] of Object.entries(SPRITES)) k.loadSprite(name, src);
  k.loadSprite("trainer-chars", trainerIdleAtlas, { sliceX: TRAINER_VARIANTS * 4, sliceY: 4 });
  k.loadSprite("door-modern", doorModernSprite, { sliceX: 4, sliceY: 1 });
  k.loadSprite("door-wood", doorWoodSprite, { sliceX: 4, sliceY: 1 });
   k.loadSprite("terrain-sand", desertSandTile);
   k.loadSprite("terrain-brick", desertBrickTile);

  const state = {
    paused: false,
    transitioning: false,
    dir: null as Dir | null,
    facing: "down" as Dir,
    interact: null as null | (() => void),
    lastPromptKey: "" as string,
  };

  function rgb(ch: string) {
    const c = PALETTE[ch] ?? PALETTE["s"]!;
    return k.rgb(c[0], c[1], c[2]);
  }

  /** stable per-tile pseudo random so the texture never flickers */
  const noise = (col: number, row: number, salt = 0) => {
    const n = Math.sin((col * 127.1 + row * 311.7 + salt * 74.7) * 43758.5453);
    return n - Math.floor(n);
  };

  function drawTile(ch: string, col: number, row: number, rows?: string[]) {
    const px = col * TILE;
    const py = row * TILE;
    const dot = (x: number, y: number, w: number, h: number, c: [number, number, number], z = 1) =>
      k.add([k.rect(w, h), k.pos(px + x, py + y), k.color(c[0], c[1], c[2]), k.z(z)]);

    // Base background tile
    k.add([k.rect(TILE, TILE), k.pos(px, py), k.color(rgb(ch)), k.z(0)]);

    // Authentic Epsilon terrain tiles. The procedural shading below remains
    // as a subtle overlay, so the map gains the original pixel-art texture
    // without changing collision/grid logic.
    if (ch === "s") {
      k.add([k.sprite("terrain-sand"), k.pos(px + TILE / 2, py + TILE / 2), k.z(0)]);
    }
    if (ch === "p") {
      k.add([k.sprite("terrain-brick"), k.pos(px + TILE / 2, py + TILE / 2), k.z(1)]);
    }

    // Desert sand texture
    if (
      ch === "s" ||
      ch === "P" ||
      ch === "X" ||
      ch === "x" ||
      ch === "h" ||
      ch === "B" ||
      ch === "K" ||
      ch === "S" ||
      ch === "Y"
    ) {
      const n = noise(col, row, 11);
      // Subtle dune shading
      if ((col + row) % 2 === 0) dot(0, 0, TILE, TILE, [238, 218, 172], 0);
      dot(2 + Math.floor(n * 20), 4 + Math.floor(n * 16), 5, 2, [222, 196, 148]);
      dot(16 - Math.floor(n * 10), 18 + Math.floor(n * 8), 4, 2, [246, 230, 190]);
      if (n > 0.8) {
        // Desert pebble
        dot(12, 14, 5, 3, [192, 168, 126], 1);
        dot(12, 14, 5, 1, [238, 220, 186], 2);
      }
    }

    // Sandstone paved pathways
    if (ch === "p" || ch === "L" || ch === "F") {
      const n = noise(col, row, 3);
      dot(0, 0, TILE, 2, [188, 154, 116], 1);
      dot(0, 0, 2, TILE, [188, 154, 116], 1);
      dot(TILE - 2, 0, 2, TILE, [236, 206, 172], 1);
      dot(0, TILE - 2, TILE, 2, [236, 206, 172], 1);
      // Paver stone texture
      dot(4 + Math.floor(n * 14), 6 + Math.floor(n * 10), 6, 4, [198, 164, 124]);
      dot(18 - Math.floor(n * 10), 18, 5, 3, [228, 198, 160]);
    }

    // Canyon rock cliff
    if (ch === "C") {
      // Layered sedimentary cliff strata
      dot(0, 0, TILE, 6, [142, 60, 40], 2);
      dot(0, 6, TILE, 8, [196, 94, 62], 2);
      dot(0, 14, TILE, 7, [164, 74, 48], 2);
      dot(0, 21, TILE, 11, [122, 50, 32], 2);
      // Rock highlight cracks
      const n = noise(col, row, 7);
      dot(3 + Math.floor(n * 16), 4, 10, 2, [220, 120, 84], 3);
      dot(12, 12, 8, 2, [142, 60, 40], 3);
      dot(6 + Math.floor(n * 12), 22, 12, 2, [98, 38, 24], 3);
    }

    // Dynamic Oasis Lake Water with realistic physics, waves, ripples, glints & shoreline foam
    if (ch === "w") {
      // Depth gradient base
      dot(0, 0, TILE, TILE, [36, 138, 204], 1);
      dot(2, 2, TILE - 4, TILE - 4, [48, 158, 222], 1);

      // Check shoreline edges against neighboring grid cells
      const isShoreN =
        rows &&
        rows[row - 1]?.[col] !== "w" &&
        rows[row - 1]?.[col] !== "W" &&
        rows[row - 1]?.[col] !== "D";
      const isShoreS =
        rows &&
        rows[row + 1]?.[col] !== "w" &&
        rows[row + 1]?.[col] !== "W" &&
        rows[row + 1]?.[col] !== "D";
      const isShoreW =
        rows &&
        rows[row]?.[col - 1] !== "w" &&
        rows[row]?.[col - 1] !== "W" &&
        rows[row]?.[col - 1] !== "D";
      const isShoreE =
        rows &&
        rows[row]?.[col + 1] !== "w" &&
        rows[row]?.[col + 1] !== "W" &&
        rows[row]?.[col + 1] !== "D";

      // Animated Shoreline Foaming Waves
      if (isShoreN) {
        const foamN = k.add([
          k.rect(TILE, 4),
          k.pos(px, py),
          k.color(240, 252, 255),
          k.opacity(0.85),
          k.z(3),
        ]) as unknown as { pos: { y: number }; opacity: number };
        k.onUpdate(() => {
          setPosY(foamN, py + Math.sin(k.time() * 2.5 + col * 0.8) * 1.5);
          foamN.opacity = 0.5 + Math.sin(k.time() * 2.5 + col * 0.8) * 0.35;
        });
      }
      if (isShoreS) {
        const foamS = k.add([
          k.rect(TILE, 4),
          k.pos(px, py + TILE - 4),
          k.color(240, 252, 255),
          k.opacity(0.85),
          k.z(3),
        ]) as unknown as { pos: { y: number }; opacity: number };
        k.onUpdate(() => {
          setPosY(foamS, py + TILE - 4 - Math.sin(k.time() * 2.5 + col * 0.8) * 1.5);
          foamS.opacity = 0.5 + Math.sin(k.time() * 2.5 + col * 0.8) * 0.35;
        });
      }
      if (isShoreW) {
        const foamW = k.add([
          k.rect(4, TILE),
          k.pos(px, py),
          k.color(240, 252, 255),
          k.opacity(0.85),
          k.z(3),
        ]) as unknown as { pos: { x: number }; opacity: number };
        k.onUpdate(() => {
          setPosX(foamW, px + Math.sin(k.time() * 2.5 + row * 0.8) * 1.5);
          foamW.opacity = 0.5 + Math.sin(k.time() * 2.5 + row * 0.8) * 0.35;
        });
      }
      if (isShoreE) {
        const foamE = k.add([
          k.rect(4, TILE),
          k.pos(px + TILE - 4, py),
          k.color(240, 252, 255),
          k.opacity(0.85),
          k.z(3),
        ]) as unknown as { pos: { x: number }; opacity: number };
        k.onUpdate(() => {
          setPosX(foamE, px + TILE - 4 - Math.sin(k.time() * 2.5 + row * 0.8) * 1.5);
          foamE.opacity = 0.5 + Math.sin(k.time() * 2.5 + row * 0.8) * 0.35;
        });
      }

      // Multi-frequency surface wave bands
      const waveA = k.add([
        k.rect(14, 2, { radius: 1 }),
        k.pos(px + 4, py + 8),
        k.color(196, 244, 255),
        k.z(2),
        k.opacity(0.75),
      ]) as unknown as { pos: { x: number } };
      const waveB = k.add([
        k.rect(10, 2, { radius: 1 }),
        k.pos(px + 16, py + 20),
        k.color(140, 222, 255),
        k.z(2),
        k.opacity(0.6),
      ]) as unknown as { pos: { x: number } };
      const ox = px + 4;
      const oxB = px + 16;
      k.onUpdate(() => {
        setPosX(waveA, ox + Math.sin(k.time() * 2.0 + col * 1.5) * 3);
        setPosX(waveB, oxB + Math.cos(k.time() * 1.7 + row * 1.5) * 3);
      });

      // Natural expanding water ripple rings
      const ripple = k.add([
        k.circle(3),
        k.scale(1),
        k.pos(px + 16, py + 16),
        k.color(210, 248, 255),
        k.opacity(0.4),
        k.z(2),
      ]) as unknown as { scale: { x: number; y: number }; opacity: number };
      k.onUpdate(() => {
        const ph = (k.time() * 0.7 + (col * 0.37 + row * 0.73)) % 1;
        setScaleX(ripple, 0.8 + ph * 3.2);
        setScaleY(ripple, 0.4 + ph * 1.6);
        ripple.opacity = Math.max(0, (1 - ph) * 0.45);
      });

      // Sunlight sparkling glints
      const glintX = px + ((col * 13 + row * 7) % 20) + 6;
      const glintY = py + ((col * 7 + row * 19) % 18) + 6;
      const glint = k.add([
        k.rect(2, 2),
        k.pos(glintX, glintY),
        k.color(255, 255, 255),
        k.opacity(0.7),
        k.z(3),
      ]) as unknown as { opacity: number };
      k.onUpdate(() => {
        const gCycle = Math.sin(k.time() * 3.8 + col * 3 + row * 5);
        glint.opacity = gCycle > 0.6 ? (gCycle - 0.6) * 2.5 : 0;
      });
    }

    // Realistic Waterfall with vertical rushing streams and spray mist
    if (ch === "W") {
      dot(0, 0, TILE, TILE, [62, 168, 230], 2);
      // Rushing vertical streams
      const s1 = k.add([
        k.rect(4, TILE),
        k.pos(px + 4, py),
        k.color(220, 248, 255),
        k.opacity(0.8),
        k.z(3),
      ]) as unknown as { pos: { y: number } };
      const s2 = k.add([
        k.rect(5, TILE),
        k.pos(px + 14, py),
        k.color(240, 254, 255),
        k.opacity(0.9),
        k.z(3),
      ]) as unknown as { pos: { y: number } };
      const s3 = k.add([
        k.rect(4, TILE),
        k.pos(px + 24, py),
        k.color(220, 248, 255),
        k.opacity(0.8),
        k.z(3),
      ]) as unknown as { pos: { y: number } };
      k.onUpdate(() => {
        const t = k.time() * 90;
        setPosY(s1, py + (t % 12) - 6);
        setPosY(s2, py + ((t + 6) % 12) - 6);
        setPosY(s3, py + ((t + 3) % 12) - 6);
      });
      // Bottom splash mist
      const mist = k.add([
        k.rect(TILE + 4, 8, { radius: 3 }),
        k.scale(1),
        k.pos(px - 2, py + TILE - 8),
        k.color(250, 254, 255),
        k.opacity(0.85),
        k.z(4),
      ]) as unknown as { scale: { x: number; y: number }; opacity: number };
      k.onUpdate(() => {
        setScaleY(mist, 0.8 + Math.sin(k.time() * 9 + col) * 0.4);
        mist.opacity = 0.65 + Math.sin(k.time() * 8) * 0.25;
      });
    }

    // Wooden Pier / Dock
    if (ch === "D") {
      k.add([k.rect(TILE, 4), k.pos(px, py + 2), k.color(160, 114, 76), k.z(4)]);
      k.add([k.rect(TILE, 4), k.pos(px, py + 10), k.color(160, 114, 76), k.z(4)]);
      k.add([k.rect(TILE, 4), k.pos(px, py + 18), k.color(160, 114, 76), k.z(4)]);
      k.add([k.rect(TILE, 4), k.pos(px, py + 26), k.color(160, 114, 76), k.z(4)]);
      k.add([k.rect(4, TILE), k.pos(px + 2, py), k.color(118, 80, 52), k.z(5)]);
      k.add([k.rect(4, TILE), k.pos(px + TILE - 6, py), k.color(118, 80, 52), k.z(5)]);
    }

    // Palm Tree
    if (ch === "P") {
      // Curved trunk
      k.add([k.rect(8, 18, { radius: 2 }), k.pos(px + 12, py + 14), k.color(138, 98, 66), k.z(5)]);
      k.add([k.rect(6, 4), k.pos(px + 13, py + 18), k.color(108, 74, 48), k.z(6)]);
      k.add([k.rect(6, 4), k.pos(px + 13, py + 26), k.color(108, 74, 48), k.z(6)]);
      // Coconuts
      k.add([k.circle(4), k.pos(px + 13, py + 13), k.color(92, 60, 36), k.z(7)]);
      k.add([k.circle(4), k.pos(px + 18, py + 13), k.color(92, 60, 36), k.z(7)]);
      // Palm fronds
      k.add([k.circle(15), k.pos(px + 16, py + 8), k.color(44, 138, 74), k.z(8)]);
      k.add([k.circle(12), k.pos(px + 14, py + 6), k.color(68, 168, 96), k.z(9)]);
      k.add([k.circle(6), k.pos(px + 11, py + 4), k.color(112, 204, 136), k.z(10)]);
    }

    // Tall Saguaro Cactus
    if (ch === "X") {
      // Main central trunk
      k.add([k.rect(10, 24, { radius: 3 }), k.pos(px + 11, py + 7), k.color(48, 136, 78), k.z(6)]);
      k.add([k.rect(4, 24), k.pos(px + 14, py + 7), k.color(68, 168, 98), k.z(7)]);
      // Left arm
      k.add([k.rect(6, 4), k.pos(px + 5, py + 16), k.color(48, 136, 78), k.z(6)]);
      k.add([k.rect(5, 10, { radius: 2 }), k.pos(px + 4, py + 8), k.color(48, 136, 78), k.z(6)]);
      // Right arm
      k.add([k.rect(6, 4), k.pos(px + 21, py + 13), k.color(48, 136, 78), k.z(6)]);
      k.add([k.rect(5, 12, { radius: 2 }), k.pos(px + 23, py + 3), k.color(48, 136, 78), k.z(6)]);
      // Flower bloom on top
      k.add([k.circle(3), k.pos(px + 16, py + 6), k.color(248, 208, 88), k.z(8)]);
    }

    // Small Prickly Cactus
    if (ch === "x") {
      k.add([k.circle(8), k.pos(px + 16, py + 20), k.color(52, 142, 82), k.z(6)]);
      k.add([k.circle(5), k.pos(px + 11, py + 15), k.color(44, 128, 72), k.z(6)]);
      k.add([k.circle(3), k.pos(px + 16, py + 12), k.color(248, 112, 136), k.z(7)]);
    }

    // Flower Planters
    if (ch === "F") {
      k.add([k.rect(26, 12, { radius: 2 }), k.pos(px + 3, py + 16), k.color(164, 118, 78), k.z(5)]);
      k.add([k.rect(22, 6), k.pos(px + 5, py + 14), k.color(78, 52, 34), k.z(6)]);
      // Colorful flowers
      k.add([k.circle(4), k.pos(px + 8, py + 12), k.color(242, 98, 132), k.z(7)]);
      k.add([k.circle(4), k.pos(px + 16, py + 10), k.color(248, 218, 92), k.z(7)]);
      k.add([k.circle(4), k.pos(px + 24, py + 12), k.color(132, 184, 248), k.z(7)]);
    }

    // Vegetable Farm Plot
    if (ch === "H") {
      k.add([k.rect(TILE, TILE), k.pos(px, py), k.color(112, 74, 46), k.z(2)]);
      // Tilled furrow
      k.add([k.rect(TILE, 6), k.pos(px, py + 4), k.color(88, 56, 34), k.z(3)]);
      k.add([k.rect(TILE, 6), k.pos(px, py + 18), k.color(88, 56, 34), k.z(3)]);
      // Fresh leafy crops
      k.add([k.circle(4), k.pos(px + 6, py + 7), k.color(68, 178, 92), k.z(4)]);
      k.add([k.circle(4), k.pos(px + 16, py + 7), k.color(68, 178, 92), k.z(4)]);
      k.add([k.circle(4), k.pos(px + 26, py + 7), k.color(68, 178, 92), k.z(4)]);
      k.add([k.circle(4), k.pos(px + 11, py + 21), k.color(78, 196, 104), k.z(4)]);
      k.add([k.circle(4), k.pos(px + 21, py + 21), k.color(78, 196, 104), k.z(4)]);
    }

    // Wooden Fence
    if (ch === "h") {
      k.add([k.rect(TILE, 4), k.pos(px, py + 10), k.color(178, 134, 92), k.z(5)]);
      k.add([k.rect(TILE, 4), k.pos(px, py + 20), k.color(178, 134, 92), k.z(5)]);
      k.add([k.rect(5, 24), k.pos(px + 4, py + 5), k.color(138, 98, 62), k.z(6)]);
      k.add([k.rect(5, 24), k.pos(px + 22, py + 5), k.color(138, 98, 62), k.z(6)]);
    }

    // Open Wooden Fence Gate (walkable, clearly drawn with swinging gates open)
    if (ch === "o") {
      // Left gate post & open swinging gate door
      k.add([k.rect(5, 26), k.pos(px + 1, py + 4), k.color(138, 98, 62), k.z(6)]);
      k.add([k.rect(9, 4), k.pos(px + 2, py + 8), k.color(178, 134, 92), k.z(6)]);
      k.add([k.rect(9, 4), k.pos(px + 2, py + 18), k.color(178, 134, 92), k.z(6)]);
      // Right gate post & open swinging gate door
      k.add([k.rect(5, 26), k.pos(px + 26, py + 4), k.color(138, 98, 62), k.z(6)]);
      k.add([k.rect(9, 4), k.pos(px + 21, py + 8), k.color(178, 134, 92), k.z(6)]);
      k.add([k.rect(9, 4), k.pos(px + 21, py + 18), k.color(178, 134, 92), k.z(6)]);
      // Smooth open threshold stone path underneath
      k.add([
        k.rect(TILE - 6, 4, { radius: 1 }),
        k.pos(px + 3, py + 24),
        k.color(212, 182, 140),
        k.z(3),
      ]);
    }

    // Streetlamp with Red Banner
    if (ch === "L") {
      k.add([k.rect(4, 26), k.pos(px + 14, py + 5), k.color(52, 54, 64), k.z(6)]);
      k.add([k.rect(12, 3), k.pos(px + 10, py + 30), k.color(40, 42, 50), k.z(7)]);
      // Glowing Lantern
      k.add([
        k.rect(12, 10, { radius: 2 }),
        k.pos(px + 10, py + 2),
        k.color(252, 234, 136),
        k.outline(2, k.rgb(46, 48, 56)),
        k.z(8),
      ]);
      // Red celebratory banner hanging
      k.add([k.rect(6, 14), k.pos(px + 19, py + 8), k.color(214, 64, 64), k.z(7)]);
      k.add([k.rect(6, 2), k.pos(px + 19, py + 14), k.color(248, 222, 94), k.z(8)]);
    }

    // Ancient Stone Monument
    if (ch === "S") {
      k.add([
        k.rect(26, 10, { radius: 2 }),
        k.pos(px + 3, py + 20),
        k.color(138, 142, 154),
        k.z(6),
      ]);
      k.add([k.rect(18, 16, { radius: 3 }), k.pos(px + 7, py + 6), k.color(172, 178, 192), k.z(7)]);
      // Golden carving / emblem
      k.add([k.circle(4), k.pos(px + 16, py + 13), k.color(248, 214, 92), k.z(8)]);
    }

    // Training Sparring Dummy
    if (ch === "Y") {
      k.add([k.rect(6, 22), k.pos(px + 13, py + 9), k.color(128, 92, 60), k.z(6)]);
      k.add([k.rect(16, 14, { radius: 3 }), k.pos(px + 8, py + 6), k.color(186, 142, 96), k.z(7)]);
      // Red Target ring
      k.add([k.circle(4), k.pos(px + 16, py + 13), k.color(224, 64, 64), k.z(8)]);
    }

    // Campfire / Torch Brazier
    if (ch === "K") {
      k.add([k.circle(10), k.pos(px + 16, py + 22), k.color(92, 88, 94), k.z(5)]);
      k.add([k.rect(14, 4), k.pos(px + 9, py + 20), k.color(112, 78, 50), k.z(6)]);
      // Animated Flickering Fire Flame
      const flame = k.add([
        k.rect(8, 12, { radius: 3 }),
        k.pos(px + 12, py + 11),
        k.color(248, 148, 42),
        k.z(7),
      ]) as unknown as { pos: { y: number }; scale: { x: number; y: number } };
      const core = k.add([
        k.rect(4, 7, { radius: 2 }),
        k.pos(px + 14, py + 14),
        k.color(255, 234, 112),
        k.z(8),
      ]) as unknown as { pos: { y: number } };
      const fy = py + 11;
      const cy = py + 14;
      k.onUpdate(() => {
        const flicker = Math.sin(k.time() * 9 + col) * 2;
        setPosY(flame, fy + flicker);
        setPosY(core, cy + flicker);
      });
    }

    // Indoor wall decoration
    if (ch === "V") {
      k.add([k.rect(TILE - 8, 12), k.pos(px + 4, py + 8), k.color(178, 148, 118), k.z(2)]);
    }
    // Authentic indoor exit threshold & exterior sunlight spill (tile 'E')
    if (ch === "E") {
      // Sandstone door threshold frame
      k.add([k.rect(TILE, 6), k.pos(px, py + 26), k.color(196, 164, 124), k.z(2)]);
      k.add([k.rect(TILE - 4, 3), k.pos(px + 2, py + 28), k.color(158, 126, 92), k.z(3)]);
      // Gentle sunbeam coming from outside through the open entrance
      k.add([
        k.rect(TILE - 6, 16),
        k.pos(px + 3, py + 10),
        k.color(255, 244, 200),
        k.opacity(0.22),
        k.z(4),
      ]);
    }
  }

  interface ActiveNpc {
    item: Interactable;
    trainerVariant: number;
    facing: Dir;
    homeCol: number;
    homeRow: number;
    curCol: number;
    curRow: number;
    state: "idle" | "walking" | "talking";
    idleTimer: number;
    walkProgress: number;
    walkStep: number;
    fromX: number;
    fromY: number;
    targetX: number;
    targetY: number;
    canWander: boolean;
    spr: { frame: number; pos: { x: number; y: number } };
    shadow: { pos: { x: number; y: number } };
    emote: { opacity: number; pos: { x: number; y: number } };
  }

  let currentActiveNpcs: ActiveNpc[] = [];

  function drawFurniture(item: Interactable) {
    const { kind, x: col, y: row } = item;
    const px = col * TILE;
    const py = row * TILE;

    // NPCs are managed by the dynamic autonomous NPC system in scene("play")
    if (kind === "npc") {
      return;
    }

    const box = (x: number, y: number, w: number, h: number, c: [number, number, number], z = 8) =>
      k.add([
        k.rect(w, h, { radius: 2 }),
        k.pos(px + x, py + y),
        k.color(c[0], c[1], c[2]),
        k.outline(2, k.rgb(40, 34, 46)),
        k.z(z),
      ]);

    switch (kind as FurnitureKind) {
      case "pokemon": {
        const pokeKey = item.poke ? `poke-${item.poke}` : "poke-pikachu";
        const poke = item.poke || "pikachu";
        const isLarge = poke === "arcanine" || poke === "flygon";
        const isMedium =
          poke === "bulbasaur" ||
          poke === "charmander" ||
          poke === "machop" ||
          poke === "psyduck" ||
          poke === "chansey";
        const baseScale = isLarge ? 1.35 : isMedium ? 1.05 : 0.92;

        // Proportional soft pixel drop-shadow under the Pokémon
        k.add([
          k.rect(isLarge ? 36 : isMedium ? 26 : 20, isLarge ? 11 : isMedium ? 8 : 6, {
            radius: 4,
          }),
          k.anchor("center"),
          k.pos(px + 16, py + (isLarge ? 28 : 25)),
          k.color(28, 20, 16),
          k.opacity(0.38),
          k.z(10),
        ]);

        // Pokemon sprite: high-visibility GBA sprite scaled with gentle idle bobbing
        const spr = k.add([
          k.sprite(pokeKey),
          k.anchor("center"),
          k.pos(px + 16, py + (isLarge ? 12 : 15)),
          k.scale(baseScale),
          k.z(12),
        ]) as unknown as { pos: { y: number; x: number }; scale: { x: number; y: number } };

        const baseY = py + (isLarge ? 12 : 15);
        k.onUpdate(() => {
          const t = k.time();
          setPosY(spr, baseY + Math.sin(t * 3.2 + col * 0.7) * 1.5);
          // Subtle natural breathing squash & stretch
          setScaleY(spr, baseScale + Math.sin(t * 3.2 + col * 0.7) * 0.02);
          setScaleX(spr, baseScale - Math.sin(t * 3.2 + col * 0.7) * 0.015);
        });
        break;
      }
      case "duck": {
        // Water Pokémon / duck swimming in the oasis with buoyant paddling physics
        const duckPos = k.add([
          k.circle(7),
          k.pos(px + 14, py + 16),
          k.color(248, 214, 78),
          k.z(12),
        ]) as unknown as { pos: { y: number; x: number } };
        k.add([k.circle(4), k.pos(px + 18, py + 13), k.color(248, 214, 78), k.z(13)]);
        // Orange bill
        k.add([k.rect(4, 3), k.pos(px + 21, py + 13), k.color(244, 114, 42), k.z(14)]);
        // Eye
        k.add([k.rect(2, 2), k.pos(px + 19, py + 12), k.color(28, 28, 36), k.z(14)]);
        // Trailing water wake ripples
        const wake1 = k.add([
          k.rect(14, 5, { radius: 2 }),
          k.scale(1),
          k.anchor("center"),
          k.pos(px + 8, py + 19),
          k.color(186, 242, 255),
          k.opacity(0.7),
          k.z(11),
        ]) as unknown as { scale: { x: number; y: number } };
        const wake2 = k.add([
          k.rect(18, 6, { radius: 3 }),
          k.scale(1),
          k.anchor("center"),
          k.pos(px + 4, py + 20),
          k.color(186, 242, 255),
          k.opacity(0.5),
          k.z(11),
        ]) as unknown as { scale: { x: number; y: number } };
        const dy = py + 16;
        k.onUpdate(() => {
          const t = k.time();
          setPosY(duckPos, dy + Math.sin(t * 3.2 + col) * 2);
          setPosX(duckPos, px + 14 + Math.sin(t * 1.5 + col) * 3);
          setScaleX(wake1, 1 + Math.sin(t * 3) * 0.3);
          setScaleX(wake2, 1 + Math.cos(t * 3) * 0.3);
        });
        break;
      }
      case "campfire": {
        // Campfire with stone ring and flickering flame + rising spark particles
        box(6, 16, 20, 10, [104, 100, 106]);
        box(8, 14, 16, 6, [124, 82, 54], 9);
        const flame = k.add([
          k.rect(10, 15, { radius: 4 }),
          k.pos(px + 11, py + 4),
          k.color(248, 128, 36),
          k.z(11),
        ]) as unknown as { pos: { y: number } };
        k.add([k.circle(3), k.pos(px + 16, py + 12), k.color(255, 238, 116), k.z(12)]);
        const spark = k.add([
          k.rect(2, 2),
          k.pos(px + 15, py + 6),
          k.color(255, 230, 90),
          k.z(13),
        ]) as unknown as { pos: { y: number; x: number }; opacity: number };
        const fy = py + 4;
        k.onUpdate(() => {
          const t = k.time();
          setPosY(flame, fy + Math.sin(t * 9) * 2);
          const sparkPhase = (t * 2) % 1;
          setPosY(spark, py + 8 - sparkPhase * 16);
          setPosX(spark, px + 15 + Math.sin(t * 7) * 4);
          spark.opacity = 1 - sparkPhase;
        });
        break;
      }
      case "tent": {
        // Canvas camping tent with striped roof & entrance slit
        box(2, 10, 28, 20, [214, 98, 54], 6);
        box(5, 4, 22, 10, [238, 142, 82], 7);
        // Dark door opening slit
        box(12, 12, 8, 18, [54, 32, 24], 8);
        // Guy ropes & wooden pegs
        box(0, 26, 4, 4, [138, 96, 62], 8);
        box(28, 26, 4, 4, [138, 96, 62], 8);
        break;
      }
      case "brazier": {
        // Ceremonial flaming brazier
        box(10, 18, 12, 14, [118, 114, 124], 7);
        box(6, 12, 20, 8, [168, 124, 76], 8);
        const bFlame = k.add([
          k.rect(8, 12, { radius: 3 }),
          k.pos(px + 12, py + 3),
          k.color(248, 136, 38),
          k.z(9),
        ]) as unknown as { pos: { y: number } };
        k.add([k.circle(3), k.pos(px + 16, py + 8), k.color(255, 240, 120), k.z(10)]);
        const bfy = py + 3;
        k.onUpdate(() => {
          setPosY(bFlame, bfy + Math.sin(k.time() * 8.5) * 1.5);
        });
        break;
      }
      case "fountain": {
        // Stone circular fountain basin with bubbling center
        box(2, 4, 28, 24, [156, 160, 172], 6);
        box(5, 7, 22, 18, [62, 168, 228], 7);
        const jet = k.add([
          k.circle(4),
          k.scale(1),
          k.anchor("center"),
          k.pos(px + 16, py + 16),
          k.color(240, 252, 255),
          k.z(8),
        ]) as unknown as { scale: { x: number; y: number } };
        k.onUpdate(() => {
          setScaleX(jet, 0.8 + Math.sin(k.time() * 6) * 0.3);
          setScaleY(jet, 0.8 + Math.cos(k.time() * 6) * 0.3);
        });
        break;
      }
      case "computer": {
        // Dev Workshop workstation with dual monitors
        box(1, 10, 30, 8, [136, 96, 64]);
        box(3, 16, 4, 12, [110, 76, 48]);
        box(25, 16, 4, 12, [110, 76, 48]);
        // Left Monitor (IDE with glowing code lines)
        box(3, 1, 12, 10, [46, 52, 68], 9);
        k.add([k.rect(10, 6), k.pos(px + 4, py + 3), k.color(44, 144, 218), k.z(10)]);
        // Right Monitor (Terminal with green status)
        box(17, 1, 12, 10, [46, 52, 68], 9);
        k.add([k.rect(10, 6), k.pos(px + 18, py + 3), k.color(52, 198, 116), k.z(10)]);
        break;
      }
      case "monument": {
        box(2, 16, 28, 12, [142, 146, 158]);
        box(6, 4, 20, 14, [178, 184, 196], 9);
        k.add([k.circle(5), k.pos(px + 16, py + 10), k.color(246, 212, 88), k.z(10)]);
        break;
      }
      case "dummy": {
        box(13, 12, 6, 18, [138, 98, 66]);
        box(7, 4, 18, 14, [198, 154, 106], 9);
        k.add([k.circle(5), k.pos(px + 16, py + 11), k.color(228, 68, 68), k.z(10)]);
        break;
      }
      case "desk":
        box(1, 12, 30, 6, [156, 112, 76]);
        box(3, 18, 5, 12, [126, 90, 60]);
        box(24, 18, 5, 12, [126, 90, 60]);
        box(8, 2, 16, 11, [72, 88, 132], 9);
        k.add([k.rect(12, 7), k.pos(px + 10, py + 4), k.color(146, 226, 202), k.z(10)]);
        break;
      case "shelf":
        box(2, 0, 28, 30, [148, 106, 72]);
        box(5, 4, 22, 5, [214, 96, 96], 9);
        box(5, 13, 22, 5, [96, 148, 214], 9);
        box(5, 22, 22, 5, [246, 206, 106], 9);
        break;
      case "plant":
        box(11, 20, 11, 11, [186, 118, 82]);
        box(6, 2, 20, 18, [72, 158, 96], 9);
        break;
      case "trophy":
        box(8, 22, 17, 9, [126, 90, 60]);
        box(13, 12, 6, 11, [244, 206, 92]);
        box(7, 2, 18, 12, [252, 222, 118], 9);
        break;
      case "counter":
        box(0, 8, TILE, 22, [178, 130, 88]);
        box(2, 4, TILE - 4, 6, [220, 178, 128], 9);
        break;
      case "painting":
        box(3, 2, 26, 22, [92, 76, 132]);
        box(6, 5, 20, 16, [156, 206, 236], 9);
        k.add([k.rect(8, 8), k.pos(px + 9, py + 10), k.color(246, 216, 120), k.z(10)]);
        break;
      case "bed":
        box(4, 2, 24, 28, [226, 226, 236]);
        box(4, 2, 24, 9, [236, 246, 252], 9);
        box(4, 18, 24, 12, [214, 96, 96], 9);
        break;
      case "rug":
        box(1, 6, 30, 20, [214, 132, 132], 2);
        break;
      case "console":
        box(4, 8, 24, 22, [72, 70, 86]);
        box(7, 11, 18, 12, [126, 226, 196], 9);
        k.add([k.rect(4, 4), k.pos(px + 22, py + 25), k.color(238, 108, 108), k.z(10)]);
        break;
      case "bench":
        box(1, 14, 30, 6, [168, 120, 76]);
        box(1, 8, 30, 5, [186, 138, 90], 9);
        box(4, 20, 4, 10, [126, 88, 56]);
        box(24, 20, 4, 10, [126, 88, 56]);
        break;
      case "well": {
        // Stone desert well: a readable landmark and a natural gathering point.
        box(3, 13, 26, 13, [142, 126, 112], 6);
        box(6, 8, 20, 8, [188, 160, 126], 7);
        box(9, 10, 14, 8, [48, 94, 116], 8);
        k.add([k.rect(20, 3), k.pos(px + 6, py + 4), k.color(116, 78, 48), k.z(9)]);
        const water = k.add([
          k.circle(3),
          k.pos(px + 16, py + 14),
          k.color(120, 210, 236),
          k.opacity(0.7),
          k.z(10),
        ]) as unknown as { scale: { x: number; y: number } };
        k.onUpdate(() => {
          setScaleX(water, 0.8 + Math.sin(k.time() * 2.8 + item.x) * 0.15);
          setScaleY(water, 0.8 + Math.cos(k.time() * 2.8 + item.y) * 0.1);
        });
        break;
      }
      case "stall": {
        // Small market canopy suited to a desert bazaar.
        box(2, 16, 28, 12, [146, 92, 58], 6);
        box(1, 3, 30, 13, [202, 78, 52], 7);
        box(5, 6, 22, 7, [238, 190, 118], 8);
        box(5, 21, 4, 9, [116, 78, 50], 8);
        box(23, 21, 4, 9, [116, 78, 50], 8);
        break;
      }
      case "rock": {
        // Low canyon stones to break up empty sand without blocking the path.
        box(5, 17, 22, 10, [122, 94, 76], 6);
        box(9, 11, 14, 9, [166, 130, 100], 7);
        box(12, 8, 8, 5, [194, 156, 116], 8);
        break;
      }
      case "banner": {
        // Decorative oasis banner adds vertical color without occupying the road.
        box(14, 5, 4, 25, [102, 72, 48], 7);
        box(8, 4, 20, 10, [194, 62, 52], 8);
        box(11, 7, 14, 4, [238, 190, 92], 9);
        break;
      }
      case "sign":
        box(13, 14, 6, 16, [140, 100, 66], 9);
        box(2, 2, 28, 16, [196, 150, 100], 10);
        k.add([k.rect(20, 3), k.pos(px + 6, py + 7), k.color(90, 62, 40), k.z(11)]);
        k.add([k.rect(14, 3), k.pos(px + 6, py + 13), k.color(90, 62, 40), k.z(11)]);
        break;
      default:
        break;
    }
  }

  function makePlayer(pos: { x: number; y: number }, initialFacing: Dir = "down") {
    const p = k.add([
      k.sprite("trainer-chars", { frame: 0 }),
      k.pos(pos.x * TILE + TILE / 2, pos.y * TILE + TILE),
      k.anchor("bot"),
      k.scale(1.0),
      k.z(30),
      { facing: initialFacing, step: 0 },
      "player",
    ]);
        return p;
  }

  function isSolid(rows: string[], col: number, row: number) {
    const line = rows[row];
    if (!line) return true;
    const ch = line[col];
    if (ch === undefined) return true;
    return SOLID_TILES.has(ch);
  }

  // Active player reference for coordinate tracking
  let activePlayer: PlayerObj | null = null;

  // Active doors reference for smooth entrance animations
  let currentDoors: {
    x: number;
    y: number;
    to: SceneId;
    sign: string;
    open: number;
    apply: (open: number) => void;
  }[] = [];

  // Transition engine for authentic Pokemon-style door warps
  const transitionManager = new TransitionManager(root, 960, 704);
  let currentTransitionType: TransitionType = "iris";

  k.scene("play", (arg: { id: SceneId; spawn?: { x: number; y: number }; initialFacing?: Dir }) => {
    const scene = SCENES[arg.id];
    const rows = scene.grid;
    const mapW = rows[0]!.length;
    const mapH = rows.length;

    for (let row = 0; row < mapH; row++) {
      for (let col = 0; col < mapW; col++) {
        drawTile(rows[row]![col] ?? "s", col, row, rows);
      }
    }

    // Authentic Pokémon building entrances with animated pixel art doors
    const doors: {
      x: number;
      y: number;
      to: SceneId;
      sign: string;
      open: number;
      apply: (open: number) => void;
    }[] = [];
    currentDoors = doors;

    for (const b of scene.buildings) {
      const w = b.w * TILE;
      // Building Sprite with warm sun-baked desert tint
      k.add([
        k.sprite(b.sprite),
        k.pos(b.x * TILE - 4, b.y * TILE - TILE * 1.5),
        k.scale((w + 8) / 816),
        k.color(255, 246, 230),
        k.z(12),
      ]);

      // Desert architectural roof cresting (terracotta eaves)
      k.add([
        k.rect(w + 10, 5, { radius: 2 }),
        k.pos(b.x * TILE - 5, b.y * TILE - TILE * 1.5 - 2),
        k.color(186, 86, 50),
        k.outline(1, k.rgb(138, 54, 28)),
        k.z(13),
      ]);

      const dx = b.door.x * TILE;
      const dy = b.door.y * TILE - TILE;

      const isModern = b.sprite === "pokecenter" || b.sprite === "lab" || b.sprite === "pokemart";
      const doorKey = isModern ? "door-modern" : "door-wood";

      // Desert Canvas Sun Awning over entrance
      const awningW = 38;
      const awningH = 12;
      k.add([
        k.rect(awningW, awningH, { radius: 2 }),
        k.pos(dx - 3, dy - 10),
        k.color(196, 78, 48),
        k.outline(1, k.rgb(120, 42, 24)),
        k.z(14),
      ]);
      // Awning desert stripes
      for (let s = 0; s < 4; s++) {
        k.add([
          k.rect(4, awningH),
          k.pos(dx - 3 + s * 10 + 2, dy - 10),
          k.color(238, 218, 172),
          k.z(15),
        ]);
      }

      // Sandstone doorframe arch carved into the building facade
      k.add([
        k.rect(34, 34, { radius: 2 }),
        k.pos(dx - 1, dy - 1),
        k.color(214, 182, 138),
        k.outline(1, k.rgb(148, 112, 78)),
        k.z(12),
      ]);

      // Hanging desert brass lantern beside the entrance
      const lantern = k.add([
        k.rect(4, 7, { radius: 1 }),
        k.pos(dx - 7, dy + 10),
        k.color(248, 194, 72),
        k.outline(1, k.rgb(112, 76, 32)),
        k.z(15),
      ]);
      const lanternGlow = k.add([
        k.circle(9),
        k.pos(dx - 5, dy + 13),
        k.color(255, 214, 110),
        k.opacity(0.24),
        k.z(14),
      ]) as unknown as { opacity: number };
      k.onUpdate(() => {
        lanternGlow.opacity = 0.2 + Math.sin(k.time() * 5 + dx) * 0.08;
      });

      // Interior doorway depth opening
      k.add([k.rect(32, 32), k.pos(dx, dy), k.color(28, 18, 14), k.z(12)]);

      // Warm golden interior illumination spilling forward when door opens
      const doorGlow = k.add([
        k.rect(32, 18),
        k.pos(dx, dy + 16),
        k.color(255, 238, 176),
        k.opacity(0),
        k.z(12),
      ]) as unknown as { opacity: number };

      // High-quality 4-frame animated pixel art door sprite embedded flush on the facade
      const doorObj = k.add([
        k.sprite(doorKey, { frame: 0 }),
        k.pos(dx, dy),
        k.z(13),
      ]) as unknown as { frame: number };

      const applyDoor = (openVal: number) => {
        // Map 0..1 to frames 0, 1, 2, 3 smoothly
        const frameIdx = Math.min(3, Math.floor(openVal * 3.99));
        doorObj.frame = frameIdx;
        doorGlow.opacity = openVal * 0.7;
      };

      doors.push({
        x: b.door.x,
        y: b.door.y,
        to: b.to,
        sign: b.sign,
        open: 0,
        apply: applyDoor,
      });

      // Building sign label
      k.add([
        k.text(b.sign, { size: 9, font: "monospace", align: "center", width: w + 80 }),
        k.pos(b.x * TILE + w / 2, (b.y + b.h) * TILE + 4),
        k.anchor("top"),
        k.color(44, 34, 28),
        k.z(14),
      ]);
    }

    // Separate NPCs and Pokemon from other static furniture
    const npcInteractables = scene.interactables.filter((item) => item.kind === "npc");
    const pokeInteractables = scene.interactables.filter((item) => item.kind === "pokemon");
    const otherInteractables = scene.interactables.filter(
      (item) => item.kind !== "npc" && item.kind !== "pokemon",
    );

    for (const item of otherInteractables) {
      drawFurniture(item);
    }

    // Dynamic Autonomous Map Pokémon System with walking animations
    interface ActivePoke {
      item: Interactable;
      poke: string;
      homeCol: number;
      homeRow: number;
      curCol: number;
      curRow: number;
      facing: "left" | "right";
      state: "idle" | "walking" | "talking";
      idleTimer: number;
      walkProgress: number;
      fromX: number;
      fromY: number;
      targetX: number;
      targetY: number;
      baseScale: number;
      isLarge: boolean;
      spr: {
        pos: { x: number; y: number };
        scale: { x: number; y: number };
        angle: number;
        z: number;
      };
      shadow: { pos: { x: number; y: number } };
      emote: { pos: { x: number; y: number }; opacity: number };
    }

    const activePokemon: ActivePoke[] = [];
    for (const item of pokeInteractables) {
      const poke = item.poke || "pikachu";
      const pokeKey = `poke-${poke}`;
      const isLarge = poke === "arcanine" || poke === "flygon";
      const isMedium =
        poke === "bulbasaur" ||
        poke === "charmander" ||
        poke === "machop" ||
        poke === "psyduck" ||
        poke === "chansey";
      const baseScale = isLarge ? 1.35 : isMedium ? 1.05 : 0.92;
      const px = item.x * TILE + TILE / 2;
      const py = item.y * TILE + TILE - 2;

      const shadow = k.add([
        k.rect(isLarge ? 32 : isMedium ? 24 : 18, isLarge ? 9 : isMedium ? 7 : 5, {
          radius: 3,
        }),
        k.anchor("center"),
        k.pos(px, py),
        k.color(28, 20, 16),
        k.opacity(0.35),
        k.z(10),
      ]) as unknown as { pos: { x: number; y: number } };

      const spr = k.add([
        k.sprite(pokeKey),
        k.anchor("bot"),
        k.pos(px, py),
        k.scale(baseScale),
        k.z(20),
      ]) as unknown as {
        pos: { x: number; y: number };
        scale: { x: number; y: number };
        angle: number;
        z: number;
      };

      const emote = k.add([
        k.text("❤️", { size: 9 }),
        k.pos(px, py - 40),
        k.anchor("center"),
        k.opacity(0),
        k.z(26),
      ]) as unknown as { pos: { x: number; y: number }; opacity: number };

      activePokemon.push({
        item,
        poke,
        homeCol: item.x,
        homeRow: item.y,
        curCol: item.x,
        curRow: item.y,
        facing: "left",
        state: "idle",
        idleTimer: 1.0 + Math.random() * 2.0,
        walkProgress: 0,
        fromX: px,
        fromY: py,
        targetX: px,
        targetY: py,
        baseScale,
        isLarge,
        spr,
        shadow,
        emote,
      });
    }

    // Autonomous Dynamic NPC System
    const activeNpcs: ActiveNpc[] = [];
    for (const item of npcInteractables) {
      const trainerVariant = npcTrainerVariant(item.npc ?? 0);
      const face = item.face ?? "down";
      const px = item.x * TILE + TILE / 2;
      const py = item.y * TILE + TILE;

      // Soft pixel drop-shadow under NPC feet
      const shadow = k.add([
        k.rect(18, 6, { radius: 3 }),
        k.anchor("center"),
        k.pos(px, py - 2),
        k.color(28, 20, 16),
        k.opacity(0.35),
        k.z(19),
      ]) as unknown as { pos: { x: number; y: number } };

      // Sprite component (clean standing idle pose with integer pixel scale 1.0)
      const spr = k.add([
        k.sprite("trainer-chars", { frame: trainerFrame(trainerVariant, face) }),
        k.pos(px, py),
        k.anchor("bot"),
        k.scale(1.0),
        k.z(20),
      ]) as unknown as { frame: number; pos: { x: number; y: number } };

      // Reaction emote bubble
      const emote = k.add([
        k.text("💬", { size: 9 }),
        k.pos(px, py - 56),
        k.anchor("center"),
        k.opacity(0),
        k.z(25),
      ]) as unknown as { opacity: number; pos: { x: number; y: number } };

      // Wandering permissions
      const isCounterNpc = scene.indoor && item.y <= 3;
      const isStationary =
        item.dialogue === "city-guide" ||
        item.dialogue === "bazaar-merchant" ||
        item.dialogue === "oasis-lake";
      const canWander = !isCounterNpc && !isStationary;

      activeNpcs.push({
        item,
        trainerVariant,
        facing: face,
        homeCol: item.x,
        homeRow: item.y,
        curCol: item.x,
        curRow: item.y,
        state: "idle",
        idleTimer: 1.5 + Math.random() * 2.5,
        walkProgress: 0,
        walkStep: 0,
        fromX: px,
        fromY: py,
        targetX: px,
        targetY: py,
        canWander,
        spr,
        shadow,
        emote,
      });
    }

    currentActiveNpcs = activeNpcs;

    const spawn = arg.spawn ?? scene.spawn;
    const initialFacing = arg.initialFacing ?? (scene.indoor ? "up" : "down");
    const player = makePlayer(spawn, initialFacing) as unknown as PlayerObj;
    activePlayer = player;
    state.facing = initialFacing;

    // Player soft pixel drop shadow aligned under feet
    const playerShadow = k.add([
      k.rect(18, 6, { radius: 3 }),
      k.anchor("center"),
      k.pos(player.pos.x, player.pos.y - 2),
      k.color(28, 20, 16),
      k.opacity(0.35),
      k.z(29),
    ]) as unknown as { pos: { x: number; y: number } };

    const SPEED = 120;

    k.onUpdate(() => {
      // Keep player shadow aligned under feet
      setPosX(playerShadow, player.pos.x);
      setPosY(playerShadow, player.pos.y - 2);

      // Dynamic Y-depth sorting so characters and player never clip through roofs, walls or each other
      player.z = 20 + Math.floor(player.pos.y / 8);
      for (const npc of activeNpcs) {
        npc.spr.z = 20 + Math.floor(npc.spr.pos.y / 8);
      }

      // Doors slide open smoothly when near
      const ptxD = player.pos.x / TILE - 0.5;
      const ptyD = player.pos.y / TILE - 1.0;
      for (const d of doors) {
        const near = Math.hypot(d.x - ptxD, d.y - ptyD) < 1.9;
        d.open += ((near ? 1 : 0) - d.open) * Math.min(1, k.dt() * 9);
        d.apply(d.open);
      }

      // Update active roaming Pokémon with walking and trot animations
      for (const p of activePokemon) {
        if (state.paused || p.state === "talking") continue;

        p.spr.z = 20 + Math.floor(p.spr.pos.y / 8);

        if (p.state === "idle") {
          p.idleTimer -= k.dt();
          // Gentle breathing idle
          const t = k.time();
          setScaleY(p.spr, p.baseScale + Math.sin(t * 3.5 + p.curCol) * 0.02);
          setScaleX(p.spr, (p.facing === "left" ? -1 : 1) * p.baseScale);
          p.spr.angle = 0;

          if (p.idleTimer <= 0) {
            if (Math.random() < 0.45) {
              // Turn direction
              p.facing = p.facing === "left" ? "right" : "left";
              setScaleX(p.spr, (p.facing === "left" ? -1 : 1) * p.baseScale);
              p.idleTimer = 1.6 + Math.random() * 2.2;
            } else {
              // Take a roaming step
              const dirs: [number, number][] = [
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1],
              ];
              const [dx, dy] = dirs[Math.floor(Math.random() * dirs.length)]!;
              const nextCol = p.curCol + dx;
              const nextRow = p.curRow + dy;
              const distFromHome = Math.hypot(nextCol - p.homeCol, nextRow - p.homeRow);

              if (distFromHome <= 1.8 && !isSolid(rows, nextCol, nextRow)) {
                p.state = "walking";
                p.facing = dx < 0 ? "left" : dx > 0 ? "right" : p.facing;
                p.walkProgress = 0;
                p.fromX = p.spr.pos.x;
                p.fromY = p.curRow * TILE + TILE - 2;
                p.targetX = nextCol * TILE + TILE / 2;
                p.targetY = nextRow * TILE + TILE - 2;
              } else {
                p.idleTimer = 1.2 + Math.random() * 1.5;
              }
            }
          }
        } else if (p.state === "walking") {
          p.walkProgress += k.dt() * 1.5;
          const prog = Math.min(1, p.walkProgress);

          const curPx = p.fromX + (p.targetX - p.fromX) * prog;
          const curPy = p.fromY + (p.targetY - p.fromY) * prog;
          // Characteristic Pokemon hop & waddle
          const hop = Math.abs(Math.sin(prog * Math.PI * 3.5)) * 3;
          p.spr.angle = Math.sin(prog * Math.PI * 3.5) * 6;

          setScaleX(p.spr, (p.facing === "left" ? -1 : 1) * p.baseScale);
          setPosX(p.spr, curPx);
          setPosY(p.spr, curPy - hop);
          setPosX(p.shadow, curPx);
          setPosY(p.shadow, curPy);

          if (p.walkProgress >= 1) {
            p.curCol = Math.round((p.targetX - TILE / 2) / TILE);
            p.curRow = Math.round((p.targetY - (TILE - 2)) / TILE);
            p.item.x = p.curCol;
            p.item.y = p.curRow;
            p.state = "idle";
            p.spr.angle = 0;
            setPosY(p.spr, curPy);
            p.idleTimer = 1.8 + Math.random() * 2.8;
          }
        }
      }

      // Update active NPCs with authentic Pokemon movement AI
      for (const npc of activeNpcs) {
        if (state.paused || npc.state === "talking") {
          npc.spr.frame = trainerFrame(npc.trainerVariant, npc.facing, 0);
          continue;
        }

        if (npc.state === "idle") {
          // Always maintain clean standing idle pose (frame 0) with zero twitching
          npc.spr.frame = trainerFrame(npc.trainerVariant, npc.facing, 0);
          npc.idleTimer -= k.dt();

          if (npc.idleTimer <= 0) {
            const dirs: Dir[] = ["down", "left", "right", "up"];
            if (!npc.canWander || Math.random() < 0.4) {
              // Just look in a new direction
              npc.facing = dirs[Math.floor(Math.random() * dirs.length)]!;
              npc.spr.frame = trainerFrame(npc.trainerVariant, npc.facing, 0);
              npc.idleTimer = 1.8 + Math.random() * 2.5;
            } else {
              // Choose a step to walk
              const pickDir = dirs[Math.floor(Math.random() * dirs.length)]!;
              const deltaX = pickDir === "right" ? 1 : pickDir === "left" ? -1 : 0;
              const deltaY = pickDir === "down" ? 1 : pickDir === "up" ? -1 : 0;
              const nextCol = npc.curCol + deltaX;
              const nextRow = npc.curRow + deltaY;

              const distFromHome = Math.hypot(nextCol - npc.homeCol, nextRow - npc.homeRow);
              const pTileX = Math.floor(player.pos.x / TILE);
              const pTileY = Math.floor(player.pos.y / TILE);
              const nearPlayer = nextCol === pTileX && nextRow === pTileY;
              const occupiedByOther = activeNpcs.some(
                (other) =>
                  other !== npc &&
                  ((other.curCol === nextCol && other.curRow === nextRow) ||
                    (other.state === "walking" &&
                      Math.round((other.targetX - TILE / 2) / TILE) === nextCol &&
                      Math.round((other.targetY - (TILE - 2)) / TILE) === nextRow)),
              );

              if (
                distFromHome <= 2.2 &&
                !isSolid(rows, nextCol, nextRow) &&
                !nearPlayer &&
                !occupiedByOther
              ) {
                npc.state = "walking";
                npc.facing = pickDir;
                npc.walkProgress = 0;
                npc.walkStep = 0;
                npc.fromX = npc.curCol * TILE + TILE / 2;
                npc.fromY = npc.curRow * TILE + TILE - 2;
                npc.targetX = nextCol * TILE + TILE / 2;
                npc.targetY = nextRow * TILE + TILE - 2;
              } else {
                npc.idleTimer = 1.0 + Math.random() * 1.5;
              }
            }
          }
        } else if (npc.state === "walking") {
          npc.walkProgress += k.dt() * 1.8;
          const prog = Math.min(1, npc.walkProgress);

          // Step cycle tied directly to progression across the tile for authentic GBA movement:
          // 0.00..0.25 -> Frame 1 (step left foot)
          // 0.25..0.50 -> Frame 0 (neutral passing)
          // 0.50..0.75 -> Frame 3 (step right foot)
          // 0.75..1.00 -> Frame 0 (neutral standing)
          const stepPhase = Math.floor(prog * 4);
          npc.spr.frame = trainerFrame(npc.trainerVariant, npc.facing, trainerWalkFrame(prog));

          const curPx = npc.fromX + (npc.targetX - npc.fromX) * prog;
          const curPy = npc.fromY + (npc.targetY - npc.fromY) * prog;
          const stepBob = stepPhase === 1 || stepPhase === 3 ? 1 : 0;

          setPosX(npc.spr, curPx);
          setPosY(npc.spr, curPy + stepBob);
          setPosX(npc.shadow, curPx);
          setPosY(npc.shadow, curPy);
          setPosX(npc.emote, curPx);
          setPosY(npc.emote, curPy - 42);

          if (npc.walkProgress >= 1) {
            npc.curCol = Math.round((npc.targetX - TILE / 2) / TILE);
            npc.curRow = Math.round((npc.targetY - (TILE - 2)) / TILE);
            npc.item.x = npc.curCol;
            npc.item.y = npc.curRow;
            npc.state = "idle";
            npc.spr.frame = trainerFrame(npc.trainerVariant, npc.facing, 0);
            setPosY(npc.spr, curPy);
            npc.idleTimer = 1.8 + Math.random() * 2.5;
          }
        }
      }

      if (state.paused || state.transitioning) return;

      let dx = 0;
      let dy = 0;
      if (k.isKeyDown("right") || k.isKeyDown("d")) dx += 1;
      if (k.isKeyDown("left") || k.isKeyDown("a")) dx -= 1;
      if (k.isKeyDown("down") || k.isKeyDown("s")) dy += 1;
      if (k.isKeyDown("up") || k.isKeyDown("w")) dy -= 1;
      if (state.dir === "right") dx += 1;
      if (state.dir === "left") dx -= 1;
      if (state.dir === "down") dy += 1;
      if (state.dir === "up") dy -= 1;

      dx = Math.sign(dx);
      dy = Math.sign(dy);

      if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy) || 1;
        const vx = (dx / len) * SPEED * k.dt();
        const vy = (dy / len) * SPEED * k.dt();

        // Collision check with refined bounding box for bot anchor
        const tryMove = (nx: number, ny: number) => {
          const half = 9;
          const corners = [
            [nx - half, ny - 14],
            [nx + half, ny - 14],
            [nx - half, ny - 2],
            [nx + half, ny - 2],
          ];
          return corners.every(
            ([cx, cy]) => !isSolid(rows, Math.floor(cx! / TILE), Math.floor(cy! / TILE)),
          );
        };

        const prevX = player.pos.x;
        const prevY = player.pos.y;
        let movedX = false;
        let movedY = false;

        if (tryMove(player.pos.x + vx, player.pos.y)) {
          player.pos.x += vx;
          movedX = true;
        }
        if (tryMove(player.pos.x, player.pos.y + vy)) {
          player.pos.y += vy;
          movedY = true;
        }

        if (movedY && Math.abs(vy) > 0.001) {
          player.facing = vy > 0 ? "down" : "up";
        } else if (movedX && Math.abs(vx) > 0.001) {
          player.facing = vx > 0 ? "right" : "left";
        } else {
          player.facing = dy > 0 ? "down" : dy < 0 ? "up" : dx > 0 ? "right" : "left";
        }
        state.facing = player.facing;

        const movedDist = Math.hypot(player.pos.x - prevX, player.pos.y - prevY);
        if (movedDist > 0.001) {
          player.step += (movedDist / TILE) * 7.5;
          // One complete four-frame cycle per tile keeps the animation readable.
          player.frame = trainerFrame(0, player.facing, trainerWalkFrame(player.step / 2));
        } else {
          player.step = 0;
          player.frame = trainerFrame(0, player.facing, 0);
        }
      } else {
        player.step = 0;
        player.frame = trainerFrame(0, player.facing, 0);
      }

      // Check nearest interaction or door
      const ptx = player.pos.x / TILE - 0.5;
      const pty = player.pos.y / TILE - 1.0;
      let best: { label: string; action: string; run: () => void; dist: number } | null = null;

      // Dynamically open/close building doors smoothly as player approaches
      for (const dObj of currentDoors) {
        const d = Math.hypot(dObj.x - ptx, dObj.y - pty);
        const shouldOpen = d < 1.7 && player.pos.y >= (dObj.y - 1.2) * TILE;
        const targetOpen = shouldOpen ? 1 : 0;
        if (Math.abs(dObj.open - targetOpen) > 0.01) {
          const speed = targetOpen > dObj.open ? 8 : 4;
          dObj.open += (targetOpen - dObj.open) * Math.min(1, k.dt() * speed);
          dObj.apply(dObj.open);
        }
      }

      // Check exits & doors
      for (const exit of scene.exits) {
        const d = Math.hypot(exit.x - ptx, exit.y - pty);
        if (d < 1.4 && (!best || d < best.dist)) {
          const target = SCENES[exit.to];
          best = {
            label: scene.indoor ? "Voltar ao Desert Oasis" : `Entrar: ${target.title}`,
            action: scene.indoor ? "Sair" : "Entrar",
            dist: d,
            run: () => goTo(exit.to),
          };

          // Auto-trigger if stepped directly on the door mat facing the doorway/exit
          if (d < 0.75 && !state.transitioning) {
            if (scene.indoor && player.facing === "down") {
              goTo(exit.to);
              return;
            }
            if (!scene.indoor && player.facing === "up") {
              goTo(exit.to);
              return;
            }
          }
        }
      }

      for (const item of scene.interactables) {
        const d = Math.hypot(item.x - ptx, item.y - pty);
        if (d < 1.4 && (!best || d < best.dist)) {
          const isPoke = item.kind === "pokemon";
          best = {
            label: item.label,
            action: isPoke || item.kind === "npc" ? "Conversar" : "Inspecionar",
            dist: d,
            run: () => {
              if (item.kind === "npc") {
                const matchedNpc = activeNpcs.find((n) => n.item === item);
                if (matchedNpc) {
                  matchedNpc.state = "talking";
                  const diffX = player.pos.x - matchedNpc.spr.pos.x;
                  const diffY = player.pos.y - matchedNpc.spr.pos.y;
                  if (Math.abs(diffX) > Math.abs(diffY)) {
                    matchedNpc.facing = diffX > 0 ? "right" : "left";
                  } else {
                    matchedNpc.facing = diffY > 0 ? "down" : "up";
                  }
                  matchedNpc.spr.frame = trainerFrame(matchedNpc.trainerVariant, matchedNpc.facing);
                  matchedNpc.emote.opacity = 1;
                  k.wait(0.8, () => {
                    matchedNpc.emote.opacity = 0;
                  });
                }
              }
              if (isPoke) {
                const matchedPoke = activePokemon.find((p) => p.item === item);
                if (matchedPoke) {
                  matchedPoke.state = "talking";
                  matchedPoke.facing = player.pos.x < matchedPoke.spr.pos.x ? "left" : "right";
                  setScaleX(matchedPoke.spr, (matchedPoke.facing === "left" ? -1 : 1) * matchedPoke.baseScale);
                  matchedPoke.emote.opacity = 1;
                  // Joyful hop
                  matchedPoke.spr.pos.y -= 5;
                  k.wait(0.2, () => {
                    matchedPoke.spr.pos.y += 5;
                  });
                  k.wait(1.4, () => {
                    matchedPoke.emote.opacity = 0;
                    matchedPoke.state = "idle";
                  });
                }
              }
              if (item.dialogue === "pokecenter-nurse" || item.dialogue === "inn-rest") {
                sound.playHealJingle();
              } else {
                sound.playInteract();
              }
              cb.onDialogue(item.dialogue);
            },
          };
        }
      }

      state.interact = best ? best.run : null;
      const promptKey = best ? `${best.label}__${best.action}` : "";
      if (promptKey !== state.lastPromptKey) {
        state.lastPromptKey = promptKey;
        cb.onPrompt(best ? { label: best.label, action: best.action } : null);
      }

      // Direct instant camera tracking with map boundary clamping — eliminates camera stutter and angle-change lag
      const halfW = k.width() / 2;
      const halfH = k.height() / 2;
      const targetCx =
        mapW * TILE <= k.width()
          ? (mapW * TILE) / 2
          : Math.min(Math.max(player.pos.x, halfW), mapW * TILE - halfW);
      const targetCy =
        mapH * TILE <= k.height()
          ? (mapH * TILE) / 2
          : Math.min(Math.max(player.pos.y, halfH), mapH * TILE - halfH);

      k.setCamPos(Math.floor(targetCx), Math.floor(targetCy));
    });

    k.onKeyPress("enter", () => triggerInteract());
    k.onKeyPress("space", () => triggerInteract());
    k.onKeyPress("e", () => triggerInteract());
    k.onKeyPress("a", () => triggerInteract());

    cb.onScene(scene);
  });

  function goTo(id: SceneId) {
    if (state.transitioning) return;
    state.transitioning = true;
    state.dir = null;
    state.lastPromptKey = "";
    cb.onPrompt(null);

    // If entering a building from city, visually slide the door open and step in
    if (currentSceneId === "city") {
      const doorObj = currentDoors.find((d) => d.to === id);
      if (doorObj) {
        doorObj.open = 1;
        doorObj.apply(1);
        if (activePlayer) {
          activePlayer.facing = "up";
          activePlayer.frame = trainerFrame(0, "up");
          setPosX(activePlayer, doorObj.x * TILE + TILE / 2);
          setPosY(activePlayer, doorObj.y * TILE + 2);
        }
      }
    }

    // Play classic Pokemon door chime
    sound.playDoorChime();

    // Determine center of transition (screen coordinates)
    let origin = { x: 960 / 2, y: 704 / 2 };
    try {
      if (activePlayer && activePlayer.pos) {
        const screenPos = k.toScreen(activePlayer.pos);
        origin = { x: screenPos.x, y: screenPos.y };
      }
    } catch {
      // fallback to center
    }

    const target = SCENES[id];
    let spawn = target.spawn;
    const initialFacing: Dir = id === "city" ? "down" : "up";

    if (id === "city") {
      const from = currentSceneId;
      const b = SCENES.city.buildings.find((x) => x.to === from);
      if (b) {
        spawn = { x: b.door.x, y: b.door.y + 1 };
      }
    }

    transitionManager.runTransition({
      type: currentTransitionType,
      origin,
      onMidpoint: () => {
        currentSceneId = id;
        k.go("play", { id, spawn, initialFacing });
      },
      getNewOrigin: () => {
        try {
          const spawnScreen = k.toScreen(
            k.vec2(spawn.x * TILE + TILE / 2, spawn.y * TILE + TILE / 2),
          );
          return { x: spawnScreen.x, y: spawnScreen.y };
        } catch {
          return { x: 960 / 2, y: 704 / 2 };
        }
      },
      onComplete: () => {
        state.transitioning = false;
        cb.onTransitionComplete?.(target);
      },
    });
  }

  function triggerInteract() {
    if (state.paused || state.transitioning) return;
    state.interact?.();
  }

  let currentSceneId: SceneId = "city";
  k.go("play", { id: "city" });

  return {
    destroy: () => {
      transitionManager.destroy();
      k.quit();
      canvas.remove();
    },
    setPaused: (paused) => {
      state.paused = paused;
      if (paused) {
        state.dir = null;
      } else {
        for (const npc of currentActiveNpcs) {
          if (npc.state === "talking") {
            npc.state = "idle";
            npc.idleTimer = 2.0 + Math.random() * 2.0;
          }
        }
      }
    },
    setDir: (dir) => {
      state.dir = dir;
    },
    interact: triggerInteract,
    goTo,
    setTransitionType: (type: TransitionType) => {
      currentTransitionType = type;
      transitionManager.setType(type);
    },
  };
}
