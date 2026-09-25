import type { Move } from "./types";

export interface DamageResult {
  damage: number;
  multiplier: number;
  effectivenessText: string;
}

/**
 * The current battle uses a compact type-effectiveness table rather than
 * the full Pokédex chart. The insertion order intentionally preserves the
 * existing priority when a dual-type defender matches more than one rule.
 */
export const TYPE_EFFECTIVENESS: Readonly<Record<string, Readonly<Record<string, number>>>> = {
  Elétrico: {
    Água: 1.6,
    Terra: 0.6,
  },
  Fogo: {
    Planta: 1.6,
    Água: 0.6,
  },
  Planta: {
    Terra: 1.6,
    Fogo: 0.6,
  },
  Lutador: {
    Normal: 1.6,
    Aço: 1.6,
  },
};

export function calculateDamage(move: Move, opponentType: string): DamageResult {
  const effectivenessRules = TYPE_EFFECTIVENESS[move.type] ?? {};
  const matchingRule = Object.entries(effectivenessRules).find(([targetType]) =>
    opponentType.includes(targetType),
  );
  const multiplier = matchingRule?.[1] ?? 1.0;

  const variance = 0.85 + Math.random() * 0.3;
  const damage = Math.max(8, Math.round(move.power * multiplier * variance));

  return {
    damage,
    multiplier,
    effectivenessText:
      multiplier > 1 ? "Foi super efetivo!" : multiplier < 1 ? "Não foi muito efetivo..." : "",
  };
}
