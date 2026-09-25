import { useCallback, useState } from "react";
import {
  fetchPokemonFromApi,
  fetchRandomPokemonTeam,
} from "@/lib/pokeapi";
import type { PlayerPokemon } from "@/lib/battle/types";
import { INITIAL_PLAYER_TEAM } from "@/lib/battle/initialTeam";
import { sound } from "@/lib/sound";

export function useTeamBuilder() {
  const [playerTeam, setPlayerTeam] = useState<PlayerPokemon[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("portfolio_player_team");
        if (saved) {
          const parsed: unknown = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed as PlayerPokemon[];
          }
        }
      } catch (error) {
        console.warn("Failed to load saved team:", error);
      }
    }

    return INITIAL_PLAYER_TEAM.map((pokemon) => ({
      ...pokemon,
      moves: pokemon.moves.map((move) => ({ ...move })),
    }));
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchingPokeApi, setIsSearchingPokeApi] = useState(false);
  const [searchResult, setSearchResult] = useState<PlayerPokemon | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const saveTeam = useCallback((newTeam: PlayerPokemon[]) => {
    setPlayerTeam(newTeam);
    try {
      localStorage.setItem("portfolio_player_team", JSON.stringify(newTeam));
    } catch (error) {
      console.warn("Storage error:", error);
    }
  }, []);

  const handleSearchPokeApi = useCallback(
    async (nameToSearch?: string) => {
      const query = (nameToSearch || searchQuery).trim();
      if (!query) return;
      setIsSearchingPokeApi(true);
      setSearchError(null);
      setSearchResult(null);

      const result = await fetchPokemonFromApi(query);
      setIsSearchingPokeApi(false);
      if (result) {
        setSearchResult(result);
      } else {
        setSearchError(
          `Pokémon "${query}" não encontrado na PokéAPI. Tente em inglês (ex: charizard, lucario, gengar).`,
        );
      }
    },
    [searchQuery],
  );

  const addToTeam = useCallback(
    (pokemon: PlayerPokemon) => {
      if (playerTeam.length >= 6) {
        setSearchError("Seu time já possui o limite máximo de 6 Pokémon! Remova um antes.");
        return;
      }
      saveTeam([...playerTeam, pokemon]);
      setSearchResult(null);
      setSearchQuery("");
      sound.playInteract();
    },
    [playerTeam, saveTeam],
  );

  const removeFromTeam = useCallback(
    (index: number) => {
      if (playerTeam.length <= 1) {
        setSearchError("Você precisa manter pelo menos 1 Pokémon no seu time!");
        return null;
      }
      const updatedTeam = playerTeam.filter((_, teamIndex) => teamIndex !== index);
      saveTeam(updatedTeam);
      sound.playInteract();
      return updatedTeam;
    },
    [playerTeam, saveTeam],
  );

  const generateRandomTeam = useCallback(async () => {
    setIsSearchingPokeApi(true);
    setSearchError(null);
    try {
      const randomTeam = await fetchRandomPokemonTeam(3);
      if (randomTeam.length > 0) {
        saveTeam(randomTeam);
        sound.playVictoryFanfare();
      }
    } catch (error) {
      console.error(error);
      setSearchError("Erro ao gerar time aleatório.");
    } finally {
      setIsSearchingPokeApi(false);
    }
  }, [saveTeam]);

  return {
    playerTeam,
    saveTeam,
    searchQuery,
    setSearchQuery,
    isSearchingPokeApi,
    searchResult,
    searchError,
    handleSearchPokeApi,
    addToTeam,
    removeFromTeam,
    generateRandomTeam,
  };
}
