import { DEFAULT_PORTFOLIO_DATA } from "../query";
import type { Dialogue, PortfolioData } from "../types";
import { buildCityDialogues } from "./city";
import { buildInteriorDialogues } from "./interiors";
import { buildOasisDialogues } from "./oasis";
import { buildPokemonDialogues } from "./pokemon";

export function buildDialogues(data: PortfolioData): Record<string, Dialogue> {
  return {
    ...buildCityDialogues(data),
    ...buildInteriorDialogues(data),
    ...buildOasisDialogues(data),
    ...buildPokemonDialogues(data),
  };
}

if (import.meta.env.DEV) {
  void import("@/game/world").then(({ SCENES }) => {
    const known = new Set(Object.keys(buildDialogues(DEFAULT_PORTFOLIO_DATA)));
    for (const scene of Object.values(SCENES)) {
      for (const item of scene.interactables) {
        if (item.dialogue && !known.has(item.dialogue)) {
          console.warn(
            `[dialogues] ID "${item.dialogue}" (scene "${scene.id}") não existe`,
          );
        }
      }
    }
  });
}
