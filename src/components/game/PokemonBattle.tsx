import { useState, useEffect, useRef } from "react";
import { sound } from "@/lib/sound";
import {
  fetchPokemonFromApi,
  fetchRandomPokemonTeam,
  fetchRandomOpponent,
  getAvailableMovesForPokemon,
  generateMovesForTypes,
  THEMATIC_MOVES,
  POPULAR_POKEMON_SUGGESTIONS,
} from "@/lib/pokeapi";
import { calculateDamage } from "@/lib/battle/damage";
import { INITIAL_PLAYER_TEAM } from "@/lib/battle/initialTeam";
import { MAP_OPPONENTS } from "@/lib/battle/opponents";
import type { BattleOpponent, Move, PlayerPokemon } from "@/lib/battle/types";

interface BagItem {
  id: string;
  name: string;
  count: number;
  desc: string;
  healAmount: number;
}

export function PokemonBattle({
  initialOpponentId,
  initialOpenTeamBuilder = false,
  onClose,
}: {
  initialOpponentId?: string;
  initialOpenTeamBuilder?: boolean;
  onClose: () => void;
}) {
  // Opponent list includes predefined map trainers + option for random PokeAPI opponent
  const [opponentsList, setOpponentsList] = useState<BattleOpponent[]>(MAP_OPPONENTS);
  const [selectedOpponentIdx, setSelectedOpponentIdx] = useState(() => {
    if (!initialOpponentId) return 0;
    const found = MAP_OPPONENTS.findIndex((o) => o.id === initialOpponentId);
    return found >= 0 ? found : 0;
  });

  // Player team (up to 6 Pokémon)
  const [playerTeam, setPlayerTeam] = useState<PlayerPokemon[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("portfolio_player_team");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn("Failed to load saved team:", e);
      }
    }
    return INITIAL_PLAYER_TEAM.map((p) => ({
      ...p,
      moves: p.moves.map((m) => ({ ...m })),
    }));
  });

  const [activeTeamIndex, setActiveTeamIndex] = useState(0);
  const activePlayerPokemon = playerTeam[activeTeamIndex] || playerTeam[0]!;

  const opponent = opponentsList[selectedOpponentIdx] || MAP_OPPONENTS[0]!;

  const opponentTeam =
    opponent.team && opponent.team.length > 0
      ? opponent.team
      : [
          {
            id: opponent.id,
            name: opponent.name,
            level: opponent.level,
            maxHp: opponent.maxHp,
            sprite: opponent.sprite,
            type: opponent.type,
            moves: opponent.moves,
            rewardExp: opponent.rewardExp,
          },
        ];

  const [activeOpponentIndex, setActiveOpponentIndex] = useState(0);
  const currentOpponent = opponentTeam[activeOpponentIndex] || opponentTeam[0]!;
  const [opponentHp, setOpponentHp] = useState(currentOpponent.maxHp);
  const [accumulatedExp, setAccumulatedExp] = useState(0);
  const [playerHp, setPlayerHp] = useState(activePlayerPokemon.hp);
  const [playerExp, setPlayerExp] = useState(activePlayerPokemon.exp);

  const [bag, setBag] = useState<BagItem[]>([
    {
      id: "potion",
      name: "Poção",
      count: 4,
      desc: "Restaura 30 pontos de vida (HP).",
      healAmount: 30,
    },
    {
      id: "super_potion",
      name: "Super Poção",
      count: 3,
      desc: "Restaura 60 pontos de vida (HP).",
      healAmount: 60,
    },
    {
      id: "hyper_potion",
      name: "Hiper Poção",
      count: 2,
      desc: "Restaura 120 pontos de vida (HP).",
      healAmount: 120,
    },
    {
      id: "berry",
      name: "Fruta Cítrica",
      count: 5,
      desc: "Fruta revigorante que cura 25 HP.",
      healAmount: 25,
    },
  ]);

  const [currentMenu, setCurrentMenu] = useState<"main" | "fight" | "bag" | "pokemon">("main");
  const [battleLog, setBattleLog] = useState<string>(
    `${opponent.trainer} desafia você para uma batalha! Vai, ${activePlayerPokemon.name}!`,
  );
  const [isBusy, setIsBusy] = useState(false);
  const [battleState, setBattleState] = useState<"active" | "won" | "lost">("active");

  // Animations & FX
  const [screenShake, setScreenShake] = useState(false);
  const [flashColor, setFlashColor] = useState<string | null>(null);
  const [animOpponentHit, setAnimOpponentHit] = useState(false);
  const [animPlayerHit, setAnimPlayerHit] = useState(false);
  const [animOpponentAttack, setAnimOpponentAttack] = useState(false);
  const [animPlayerAttack, setAnimPlayerAttack] = useState(false);

  // Pokéball Throw Animation State
  // "flying": Ball flying through the air
  // "burst": Energy flare expanding as ball opens
  // "emerged": Pokemon fully on the field
  const [ballThrowPhase, setBallThrowPhase] = useState<"idle" | "flying" | "burst" | "emerged">(
    "idle",
  );

  // Team Selection Modal State
  const [showTeamBuilder, setShowTeamBuilder] = useState(initialOpenTeamBuilder);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchingPokeApi, setIsSearchingPokeApi] = useState(false);
  const [searchResult, setSearchResult] = useState<PlayerPokemon | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Move Customizer Modal State
  const [editingMovesPokemonIdx, setEditingMovesPokemonIdx] = useState<number | null>(null);
  const [selectedMoveSlot, setSelectedMoveSlot] = useState<number>(0);
  const [moveEquippedNotice, setMoveEquippedNotice] = useState<string | null>(null);

  const handleAssignMoveToPokemon = (pokemonIdx: number, slotIdx: number, move: Move) => {
    sound.playSelect();
    setPlayerTeam((prev) => {
      const next = [...prev];
      const target = { ...next[pokemonIdx]! };
      const newMoves = [...target.moves];
      newMoves[slotIdx] = { ...move };
      target.moves = newMoves;
      next[pokemonIdx] = target;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("portfolio_player_team", JSON.stringify(next));
        } catch (e) {
          console.warn("Failed to persist team moves:", e);
        }
      }
      return next;
    });
    setMoveEquippedNotice(`Golpe "${move.name}" equipado no Slot ${slotIdx + 1}!`);
    setTimeout(() => setMoveEquippedNotice(null), 2200);
  };

  const [totalWins, setTotalWins] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("portfolio_pokemon_wins");
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  // Victory Overlay State
  interface VictoryData {
    expGained: number;
    prevExp: number;
    newExp: number;
    prevLevel: number;
    newLevel: number;
    didLevelUp: boolean;
    opponentName: string;
    trainerName: string;
    pokemonName: string;
    pokemonSprite: string;
    totalWins: number;
  }
  const [showVictoryOverlay, setShowVictoryOverlay] = useState(false);
  const [victoryData, setVictoryData] = useState<VictoryData | null>(null);
  const [animatedExp, setAnimatedExp] = useState(0);

  // Animate XP number counting up on victory
  useEffect(() => {
    if (showVictoryOverlay && victoryData) {
      setAnimatedExp(0);
      const target = victoryData.expGained;
      const duration = 900;
      const startTime = performance.now();

      let animationFrameId: number;
      const frame = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / duration);
        const ease = 1 - Math.pow(1 - progress, 3);
        setAnimatedExp(Math.round(ease * target));
        if (progress < 1) {
          animationFrameId = requestAnimationFrame(frame);
        }
      };
      animationFrameId = requestAnimationFrame(frame);
      return () => cancelAnimationFrame(animationFrameId);
    }
  }, [showVictoryOverlay, victoryData]);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Keyboard shortcut listener for Victory Overlay: Space/Enter/Esc to continue to map
  useEffect(() => {
    if (!showVictoryOverlay) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        e.preventDefault();
        sound.playInteract();
        setShowVictoryOverlay(false);
        onCloseRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showVictoryOverlay]);

  const handleContinueToMap = () => {
    sound.playInteract();
    setShowVictoryOverlay(false);
    onClose();
  };

  const handleNextBattle = () => {
    sound.playInteract();
    setShowVictoryOverlay(false);
    setVictoryData(null);
    setBattleState("active");
    const nextIdx = (selectedOpponentIdx + 1) % opponentsList.length;
    handleSelectOpponent(nextIdx);
  };

  // Trigger Pokéball Throw on start and whenever switching
  const triggerPokeballThrow = (pokeName: string) => {
    setBallThrowPhase("flying");
    sound.playPokeballThrow();

    setTimeout(() => {
      setBallThrowPhase("burst");
      sound.playPokeballOpen();

      setTimeout(() => {
        setBallThrowPhase("emerged");
        setBattleLog(`Vai, ${pokeName}! Mostre sua determinação em batalha!`);
      }, 350);
    }, 450);
  };

  // Run on battle mount
  useEffect(() => {
    sound.playBattleStart();
    triggerPokeballThrow(activePlayerPokemon.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save team changes
  const saveTeam = (newTeam: PlayerPokemon[]) => {
    setPlayerTeam(newTeam);
    try {
      localStorage.setItem("portfolio_player_team", JSON.stringify(newTeam));
    } catch (e) {
      console.warn("Storage error:", e);
    }
  };

  // Reset HP and trigger entry when switching opponent
  const handleSelectOpponent = (idx: number) => {
    if (isBusy) return;
    const opp = opponentsList[idx];
    if (!opp) return;
    setSelectedOpponentIdx(idx);
    setActiveOpponentIndex(0);
    const team = opp.team && opp.team.length > 0 ? opp.team : [opp];
    setOpponentHp(team[0]!.maxHp);
    setAccumulatedExp(0);
    setBattleState("active");
    setShowVictoryOverlay(false);
    setVictoryData(null);
    setCurrentMenu("main");
    setBattleLog(
      `Você desafiou ${opp.trainer} e sua equipe (${team.length} Pokémon)! Vai, ${activePlayerPokemon.name}!`,
    );
    sound.playBattleStart();
    triggerPokeballThrow(activePlayerPokemon.name);
  };

  // Switch active player Pokemon
  const handleSwitchPokemon = (idx: number) => {
    if (idx === activeTeamIndex) {
      setCurrentMenu("main");
      return;
    }
    const target = playerTeam[idx];
    if (!target || target.hp <= 0) {
      setBattleLog(`${target?.name || "Este Pokémon"} está desmaiado e não pode lutar!`);
      return;
    }
    setActiveTeamIndex(idx);
    setPlayerHp(target.hp);
    setPlayerExp(target.exp);
    setCurrentMenu("main");
    triggerPokeballThrow(target.name);
  };

  // Search PokéAPI by name
  const handleSearchPokeApi = async (nameToSearch?: string) => {
    const q = (nameToSearch || searchQuery).trim();
    if (!q) return;
    setIsSearchingPokeApi(true);
    setSearchError(null);
    setSearchResult(null);

    const result = await fetchPokemonFromApi(q);
    setIsSearchingPokeApi(false);
    if (result) {
      setSearchResult(result);
    } else {
      setSearchError(
        `Pokémon "${q}" não encontrado na PokéAPI. Tente em inglês (ex: charizard, lucario, gengar).`,
      );
    }
  };

  // Add found Pokemon to team
  const handleAddToTeam = (poke: PlayerPokemon) => {
    if (playerTeam.length >= 6) {
      setSearchError("Seu time já possui o limite máximo de 6 Pokémon! Remova um antes.");
      return;
    }
    const updated = [...playerTeam, poke];
    saveTeam(updated);
    setSearchResult(null);
    setSearchQuery("");
    sound.playInteract();
  };

  // Remove Pokemon from team
  const handleRemoveFromTeam = (idx: number) => {
    if (playerTeam.length <= 1) {
      setSearchError("Você precisa manter pelo menos 1 Pokémon no seu time!");
      return;
    }
    const updated = playerTeam.filter((_, i) => i !== idx);
    saveTeam(updated);
    if (activeTeamIndex >= updated.length) {
      setActiveTeamIndex(0);
      setPlayerHp(updated[0]!.hp);
    }
    sound.playInteract();
  };

  // Generate a completely random team from PokeAPI
  const handleGenerateRandomTeam = async () => {
    setIsSearchingPokeApi(true);
    setSearchError(null);
    try {
      const randomTeam = await fetchRandomPokemonTeam(3);
      if (randomTeam.length > 0) {
        saveTeam(randomTeam);
        setActiveTeamIndex(0);
        setPlayerHp(randomTeam[0]!.hp);
        setPlayerExp(randomTeam[0]!.exp);
        sound.playVictoryFanfare();
        setBattleLog("Novo time aleatório convocado da PokéAPI com sucesso!");
      }
    } catch (e) {
      console.error(e);
      setSearchError("Erro ao gerar time aleatório.");
    } finally {
      setIsSearchingPokeApi(false);
    }
  };

  // Generate random opponent from PokeAPI
  const handleGenerateRandomOpponent = async () => {
    setIsBusy(true);
    setBattleLog("Convocando um oponente aleatório da PokéAPI...");
    try {
      const randomOpp = await fetchRandomOpponent();
      const updatedOpponents = [randomOpp, ...opponentsList.filter((o) => o.id !== randomOpp.id)];
      setOpponentsList(updatedOpponents);
      setSelectedOpponentIdx(0);
      setActiveOpponentIndex(0);
      const team = randomOpp.team && randomOpp.team.length > 0 ? randomOpp.team : [randomOpp];
      setOpponentHp(team[0]!.maxHp);
      setAccumulatedExp(0);
      setBattleState("active");
      setShowVictoryOverlay(false);
      setVictoryData(null);
      setCurrentMenu("main");
      setBattleLog(
        `Um oponente surpresa apareceu: ${randomOpp.trainer} com ${team.length} Pokémon!`,
      );
      sound.playBattleStart();
      triggerPokeballThrow(activePlayerPokemon.name);
    } catch (e) {
      console.error(e);
      setBattleLog("Erro ao convocar oponente aleatório da PokéAPI.");
    } finally {
      setIsBusy(false);
    }
  };

  // Attack action
  const handlePlayerMove = (moveIndex: number) => {
    if (isBusy || battleState !== "active") return;
    const move = activePlayerPokemon.moves[moveIndex];
    if (!move || move.pp <= 0) {
      setBattleLog("Sem pontos de poder (PP) restantes para este golpe!");
      return;
    }

    setIsBusy(true);

    const updatedTeamAfterMove = playerTeam.map((pokemon, teamIndex) =>
      teamIndex === activeTeamIndex
        ? {
            ...pokemon,
            moves: pokemon.moves.map((teamMove, teamMoveIndex) =>
              teamMoveIndex === moveIndex ? { ...teamMove, pp: teamMove.pp - 1 } : teamMove,
            ),
          }
        : pokemon,
    );
    saveTeam(updatedTeamAfterMove);
    setCurrentMenu("main");

    // 1. Player attack animation
    setAnimPlayerAttack(true);
    setBattleLog(`${activePlayerPokemon.name} usou ${move.name}!`);

    setTimeout(() => {
      setAnimPlayerAttack(false);

      const { damage, multiplier: mult, effectivenessText: effText } = calculateDamage(
        move,
        currentOpponent.type,
      );

      // Visual and audio impact
      setAnimOpponentHit(true);
      setScreenShake(true);
      setFlashColor(mult >= 1.5 ? "rgba(255,230,80,0.5)" : "rgba(255,255,255,0.4)");

      if (mult >= 1.5) {
        sound.playSuperEffective();
      } else {
        sound.playAttackHit();
      }

      setTimeout(() => {
        setScreenShake(false);
        setFlashColor(null);
        setAnimOpponentHit(false);

        const nextOppHp = Math.max(0, opponentHp - damage);
        setOpponentHp(nextOppHp);
        setBattleLog(
          `${activePlayerPokemon.name} acertou em cheio causando ${damage} de dano!${effText ? ` ${effText}` : ""}`,
        );

        // Check if opponent fainted
        if (nextOppHp <= 0) {
          setTimeout(() => {
            sound.playFaint();

            // Calculate EXP gained for this Pokemon
            const expGained = currentOpponent.rewardExp || currentOpponent.level * 12;
            const newAccumulatedExp = accumulatedExp + expGained;
            setAccumulatedExp(newAccumulatedExp);

            const prevExp = activePlayerPokemon.exp ?? 0;
            const prevLevel = activePlayerPokemon.level;
            const totalExp = prevExp + expGained;
            let newLevel = prevLevel;
            let newExp = totalExp;
            let didLevelUp = false;

            if (totalExp >= 100) {
              const levelsGained = Math.floor(totalExp / 100);
              newLevel += levelsGained;
              newExp = totalExp % 100;
              didLevelUp = true;
            }

            setPlayerExp(newExp);

            // Update active Pokémon in the player's team and persist
            const updatedTeam = playerTeam.map((member, teamIndex) => {
              if (teamIndex !== activeTeamIndex) return member;

              const nextMaxHp =
                didLevelUp ? member.maxHp + (newLevel - prevLevel) * 6 : member.maxHp;
              const nextHp = didLevelUp ? nextMaxHp : member.hp;

              return {
                ...member,
                level: newLevel,
                exp: newExp,
                maxHp: nextMaxHp,
                hp: nextHp,
              };
            });

            const updatedActivePokemon = updatedTeam[activeTeamIndex];
            if (updatedActivePokemon) {
              if (didLevelUp) {
                setPlayerHp(updatedActivePokemon.hp);
              }
              saveTeam(updatedTeam);
            }

            const hasNextOpponent = activeOpponentIndex < opponentTeam.length - 1;

            if (hasNextOpponent) {
              const nextIdx = activeOpponentIndex + 1;
              const nextOppPoke = opponentTeam[nextIdx]!;
              setBattleLog(`${currentOpponent.name} desmaiou! Você ganhou +${expGained} XP!`);

              setTimeout(() => {
                setBattleLog(
                  `${opponent.trainer} enviou ${nextOppPoke.name} (Nv. ${nextOppPoke.level})!`,
                );
                setActiveOpponentIndex(nextIdx);
                setOpponentHp(nextOppPoke.maxHp);
                sound.playPokeballOpen();
                setIsBusy(false);
              }, 1100);
            } else {
              // Full victory! All opponent Pokémon defeated!
              setBattleLog(
                `Todos os Pokémon de ${opponent.trainer} foram derrotados! Vitória completa!`,
              );
              setBattleState("won");
              setIsBusy(false);

              const newWins = totalWins + 1;
              setTotalWins(newWins);
              if (typeof window !== "undefined") {
                localStorage.setItem("portfolio_pokemon_wins", String(newWins));
              }

              setVictoryData({
                expGained: newAccumulatedExp,
                prevExp,
                newExp,
                prevLevel,
                newLevel,
                didLevelUp,
                opponentName: `${opponent.name} e Equipe (${opponentTeam.length} Pokémon)`,
                trainerName: opponent.trainer,
                pokemonName: activePlayerPokemon.name,
                pokemonSprite: activePlayerPokemon.sprite,
                totalWins: newWins,
              });

              sound.playVictoryFanfare();
              setShowVictoryOverlay(true);
            }
          }, 800);
        } else {
          // Opponent turn
          setTimeout(() => {
            handleOpponentTurn();
          }, 1200);
        }
      }, 350);
    }, 450);
  };

  // Opponent turn AI
  const handleOpponentTurn = () => {
    const oppMove =
      currentOpponent.moves[Math.floor(Math.random() * currentOpponent.moves.length)]!;
    setAnimOpponentAttack(true);
    setBattleLog(`${currentOpponent.name} contra-atacou com ${oppMove.name}!`);

    setTimeout(() => {
      setAnimOpponentAttack(false);
      const variance = 0.85 + Math.random() * 0.3;
      const damage = Math.max(6, Math.round(oppMove.power * variance));

      setAnimPlayerHit(true);
      setScreenShake(true);
      sound.playAttackHit();

      setTimeout(() => {
        setAnimPlayerHit(false);
        setScreenShake(false);

        const nextPlayerHp = Math.max(0, playerHp - damage);
        setPlayerHp(nextPlayerHp);

        // Update active team member HP
        const updatedTeam = playerTeam.map((member, teamIndex) =>
          teamIndex === activeTeamIndex ? { ...member, hp: nextPlayerHp } : member,
        );
        saveTeam(updatedTeam);

        if (nextPlayerHp <= 0) {
          sound.playFaint();
          setBattleLog(`${activePlayerPokemon.name} desmaiou!`);

          // Check if other teammates are alive
          const healthyIdx = updatedTeam.findIndex((p) => p.hp > 0);
          if (healthyIdx >= 0) {
            setTimeout(() => {
              setBattleLog(`Escolha outro Pokémon da sua equipe para continuar!`);
              setCurrentMenu("pokemon");
              setIsBusy(false);
            }, 800);
          } else {
            setBattleState("lost");
            setBattleLog("Todos os seus Pokémon desmaiaram! Você perdeu a batalha.");
            setIsBusy(false);
          }
        } else {
          setBattleLog(
            `${activePlayerPokemon.name} recebeu ${damage} de dano! O que você fará a seguir?`,
          );
          setIsBusy(false);
        }
      }, 350);
    }, 500);
  };

  // Use Item
  const handleUseItem = (item: BagItem) => {
    if (item.count <= 0 || isBusy || battleState !== "active") return;
    if (playerHp >= activePlayerPokemon.maxHp) {
      setBattleLog(`${activePlayerPokemon.name} já está com a vida cheia!`);
      return;
    }

    setIsBusy(true);
    setBag((prev) => prev.map((i) => (i.id === item.id ? { ...i, count: i.count - 1 } : i)));
    const heal = Math.min(activePlayerPokemon.maxHp - playerHp, item.healAmount);
    const newHp = Math.min(activePlayerPokemon.maxHp, playerHp + heal);
    setPlayerHp(newHp);

    const updatedTeam = playerTeam.map((member, teamIndex) =>
      teamIndex === activeTeamIndex ? { ...member, hp: newHp } : member,
    );
    saveTeam(updatedTeam);

    sound.playHealJingle();
    setCurrentMenu("main");
    setBattleLog(`Você usou ${item.name}! ${activePlayerPokemon.name} recuperou ${heal} HP!`);

    setTimeout(() => {
      handleOpponentTurn();
    }, 1200);
  };

  // Run action
  const handleRun = () => {
    if (isBusy) return;
    sound.playRun();
    setBattleLog("Você recuou da batalha com agilidade e segurança!");
    setIsBusy(true);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  const getHpColor = (current: number, max: number) => {
    const pct = current / max;
    if (pct > 0.5) return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]";
    if (pct > 0.2) return "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.7)]";
    return "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)] animate-pulse";
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 transition-all duration-300 backdrop-blur-md select-none ${
        screenShake ? "animate-[shake_0.2s_ease-in-out_infinite]" : ""
      }`}
    >
      {/* Screen flash on hit */}
      {flashColor && (
        <div
          className="pointer-events-none absolute inset-0 z-50 transition-opacity duration-150"
          style={{ backgroundColor: flashColor }}
        />
      )}

      <div className="relative flex flex-col w-full max-w-[820px] aspect-[4/3] bg-[#1a1410] border-4 border-amber-600/80 rounded-sm shadow-[0_0_35px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Top Header with Opponent Selector, Team Builder Button & Close */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#2a1e16] border-b-2 border-amber-500/40 text-[10px]">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold tracking-wide pixel-font text-[9px]">
              ⚔️ ARENA DE BATALHA POKÉMON
            </span>
            <span className="bg-amber-500/20 text-amber-200 border border-amber-500/40 px-1.5 py-0.5 rounded text-[8px] pixel-font">
              Vitórias: {totalWins}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Moves Customizer Button */}
            <button
              type="button"
              onClick={() => {
                setEditingMovesPokemonIdx(activeTeamIndex);
                setSelectedMoveSlot(0);
                sound.playInteract();
              }}
              className="bg-emerald-700 hover:bg-emerald-600 text-emerald-100 font-bold px-2 py-0.5 rounded text-[8px] pixel-font border border-emerald-400 flex items-center gap-1 shadow cursor-pointer transition-transform active:scale-95"
              title="Escolher e personalizar os golpes do seu Pokémon ativo"
            >
              <span>⚔️ Golpes</span>
            </button>

            {/* Team Builder Button */}
            <button
              type="button"
              onClick={() => setShowTeamBuilder(true)}
              className="bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold px-2 py-0.5 rounded text-[8px] pixel-font border border-amber-400 flex items-center gap-1 shadow cursor-pointer transition-transform active:scale-95"
              title="Gerenciar seu time e buscar Pokémon na PokéAPI"
            >
              <span>⭐ Time ({playerTeam.length}/6)</span>
            </button>

            {/* Random Opponent Button */}
            <button
              type="button"
              disabled={isBusy}
              onClick={handleGenerateRandomOpponent}
              className="bg-purple-800 hover:bg-purple-700 text-purple-100 px-2 py-0.5 rounded text-[8px] pixel-font border border-purple-400 shadow cursor-pointer disabled:opacity-50"
              title="Gerar um oponente aleatório da PokéAPI"
            >
              🎲 Oponente Aleatório
            </button>

            {/* Opponent Selector */}
            <select
              value={selectedOpponentIdx}
              onChange={(e) => handleSelectOpponent(Number(e.target.value))}
              disabled={isBusy}
              className="bg-[#18110c] text-amber-200 border border-amber-500/50 px-2 py-0.5 rounded text-[8px] pixel-font cursor-pointer focus:outline-none max-w-[130px] truncate"
            >
              {opponentsList.map((opp, idx) => (
                <option key={opp.id + idx} value={idx}>
                  {opp.name} ({opp.trainer})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onClose}
              className="text-amber-400 hover:text-white px-2 py-0.5 text-[11px] font-bold cursor-pointer"
              title="Sair da Batalha"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Battle Scene Stage */}
        <div className="relative flex-1 bg-gradient-to-b from-[#7fa2cc] via-[#d5be9b] to-[#b9986b] overflow-hidden select-none">
          {/* Desert arena floor texture */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-[#8e734c]/65 border-t-2 border-[#b59365]" />

          {/* Distant desert dunes & clouds */}
          <div className="absolute top-4 left-6 text-2xl opacity-20 filter blur-[1px]">☁️</div>
          <div className="absolute top-8 right-12 text-3xl opacity-25 filter blur-[1px]">☁️</div>

          {/* ══════════════════════════════════════════════════════════════════════════
              OPPONENT STAGE (TOP RIGHT)
              Fixed: The Pokémon sprite rests DIRECTLY ON TOP of the shadow pedestal,
              never below it!
          ══════════════════════════════════════════════════════════════════════════ */}
          <div className="absolute top-6 right-6 md:right-12 w-56 h-48 flex items-end justify-center pointer-events-none">
            {/* Sand Shadow Pedestal */}
            <div className="absolute bottom-2 w-48 h-14 rounded-[50%] bg-[#5c462b]/90 border-2 border-[#937146] shadow-md z-0" />

            {/* Feet contact shadow */}
            <div className="absolute bottom-5 w-24 h-5 rounded-[50%] bg-black/40 blur-[1px] z-5 pointer-events-none" />

            {/* Opponent Sprite - Resting squarely ON TOP of the shadow pedestal center */}
            <div className="relative z-10 bottom-6 flex items-end justify-center">
              <img
                src={currentOpponent.sprite}
                alt={currentOpponent.name}
                className={`w-32 h-32 md:w-36 md:h-36 object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)] transition-all duration-200 image-pixelated ${
                  animOpponentHit ? "animate-[shake_0.15s_ease-in-out_2] brightness-200" : ""
                } ${animOpponentAttack ? "translate-x-[-25px] translate-y-[20px] scale-110" : "animate-[bounce_2s_ease-in-out_infinite]"}`}
                style={{ imageRendering: "pixelated" }}
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Opponent Status Box (Top Left) */}
          <div className="absolute top-4 left-4 md:left-6 w-64 bg-[#1f1610]/95 border-2 border-amber-500/70 p-2.5 rounded shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {opponent.trainerAvatar && (
                  <img
                    src={opponent.trainerAvatar}
                    alt={opponent.trainer}
                    className="w-5 h-5 rounded-full bg-amber-950/60 object-contain image-pixelated"
                    style={{ imageRendering: "pixelated" }}
                    referrerPolicy="no-referrer"
                  />
                )}
                <span className="pixel-font font-bold text-amber-200 text-[10px]">
                  {currentOpponent.name}
                </span>
              </div>
              <span className="pixel-font text-amber-400 text-[9px]">
                Nv. {currentOpponent.level}
              </span>
            </div>

            {/* Opponent Team Pokéballs */}
            <div className="flex items-center gap-1 my-1">
              <span className="pixel-font text-[7px] text-amber-400/80 mr-1">Time:</span>
              {opponentTeam.map((member, i) => {
                const isDefeated = i < activeOpponentIndex;
                const isActive = i === activeOpponentIndex;
                return (
                  <span
                    key={member.name + i}
                    className={`inline-block w-2.5 h-2.5 rounded-full border text-[6px] text-center leading-none ${
                      isDefeated
                        ? "bg-zinc-700 border-zinc-600 opacity-40"
                        : isActive
                          ? "bg-red-500 border-amber-300 shadow-[0_0_6px_rgba(239,68,68,0.8)] animate-pulse"
                          : "bg-red-400 border-red-700"
                    }`}
                    title={`${member.name} (Nv. ${member.level})${
                      isDefeated ? " - Derrotado" : isActive ? " - Em Batalha" : ""
                    }`}
                  />
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 mt-1">
              <span className="pixel-font text-[7px] text-amber-300 font-bold">HP</span>
              <div className="flex-1 h-3 bg-zinc-900 rounded-sm overflow-hidden p-0.5 border border-zinc-700">
                <div
                  className={`h-full transition-all duration-500 rounded-sm ${getHpColor(
                    opponentHp,
                    currentOpponent.maxHp,
                  )}`}
                  style={{ width: `${(opponentHp / currentOpponent.maxHp) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between items-center pixel-font text-[8px] text-zinc-300 mt-1">
              <span className="text-zinc-400 text-[7px]">{opponent.trainer}</span>
              <span>
                {opponentHp} / {currentOpponent.maxHp}
              </span>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════════════
              PLAYER STAGE (BOTTOM LEFT)
              Fixed: The Pokémon sprite sits DIRECTLY ON TOP of the shadow pedestal!
              Includes Pokéball Throw Arc, Burst, and Emergence Animations.
          ══════════════════════════════════════════════════════════════════════════ */}
          <div className="absolute bottom-4 left-6 md:left-12 w-64 h-52 flex items-end justify-center pointer-events-none">
            {/* Sand Shadow Pedestal */}
            <div className="absolute bottom-2 w-56 h-16 rounded-[50%] bg-[#4c3920]/95 border-2 border-[#82623a] shadow-lg z-0" />

            {/* Contact shadow */}
            <div className="absolute bottom-7 w-28 h-6 rounded-[50%] bg-black/45 blur-[1px] z-5 pointer-events-none" />

            {/* Pokéball Throw & Burst Animation Layer */}
            {ballThrowPhase === "flying" && (
              <div
                className="absolute z-30 bottom-11 animate-[pokeball-throw_0.45s_cubic-bezier(0.2,0.8,0.3,1)_forwards]"
                style={{
                  animation: "pokeballThrow 0.45s cubic-bezier(0.2, 0.8, 0.3, 1) forwards",
                }}
              >
                {/* 3D-styled Pokéball */}
                <div className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-gradient-to-b from-red-600 50% to-white 50% relative shadow-md animate-spin">
                  <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-zinc-950" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-zinc-950 bg-white shadow-inner flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-zinc-400" />
                  </div>
                </div>
              </div>
            )}

            {/* Pokéball Burst Effect */}
            {ballThrowPhase === "burst" && (
              <div className="absolute bottom-7 z-25 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-200 via-white to-amber-300 animate-ping opacity-90 blur-sm" />
                <div className="absolute w-12 h-12 rounded-full bg-white shadow-[0_0_20px_#fff]" />
                <div className="absolute text-yellow-300 text-xl font-bold animate-pulse">✨</div>
              </div>
            )}

            {/* Player Pokémon Sprite - Resting exactly ON TOP of the shadow pedestal */}
            <div
              className={`relative z-10 bottom-8 flex items-end justify-center transition-all duration-300 ${
                ballThrowPhase === "flying"
                  ? "opacity-0 scale-0"
                  : ballThrowPhase === "burst"
                    ? "opacity-80 scale-50 brightness-200"
                    : "opacity-100 scale-100"
              }`}
            >
              <img
                src={activePlayerPokemon.backSprite || activePlayerPokemon.sprite}
                alt={activePlayerPokemon.name}
                className={`w-36 h-36 md:w-40 md:h-40 object-contain filter drop-shadow-[0_6px_8px_rgba(0,0,0,0.45)] transition-all duration-200 image-pixelated ${
                  animPlayerHit ? "animate-[shake_0.15s_ease-in-out_2] brightness-200" : ""
                } ${animPlayerAttack ? "translate-x-[35px] translate-y-[-25px] scale-110" : "animate-[pulse_2.2s_ease-in-out_infinite]"}`}
                style={{ imageRendering: "pixelated" }}
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Player Status Box (Bottom Right) */}
          <div className="absolute bottom-6 right-4 md:right-8 w-64 bg-[#1f1610]/95 border-2 border-amber-500/70 p-2.5 rounded shadow-lg">
            <div className="flex items-center justify-between">
              <span className="pixel-font font-bold text-amber-200 text-[10px]">
                {activePlayerPokemon.name}
              </span>
              <span className="pixel-font text-amber-400 text-[9px]">
                Nv. {activePlayerPokemon.level}
              </span>
            </div>

            {/* Team Pokéballs Status Bar */}
            <div className="flex items-center gap-1 my-1">
              <span className="pixel-font text-[7px] text-amber-400/80 mr-1">Time:</span>
              {playerTeam.map((member, i) => (
                <span
                  key={member.id}
                  className={`inline-block w-2.5 h-2.5 rounded-full border border-black text-[7px] leading-none text-center ${
                    member.hp <= 0
                      ? "bg-zinc-600 opacity-40"
                      : i === activeTeamIndex
                        ? "bg-amber-400 ring-1 ring-white"
                        : "bg-red-500"
                  }`}
                  title={`${member.name} (${member.hp}/${member.maxHp} HP)`}
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5 mt-1">
              <span className="pixel-font text-[7px] text-amber-300 font-bold">HP</span>
              <div className="flex-1 h-3.5 bg-zinc-900 rounded-sm overflow-hidden p-0.5 border border-zinc-700">
                <div
                  className={`h-full transition-all duration-500 rounded-sm ${getHpColor(
                    playerHp,
                    activePlayerPokemon.maxHp,
                  )}`}
                  style={{ width: `${(playerHp / activePlayerPokemon.maxHp) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between items-center text-[8px] pixel-font text-zinc-300 mt-1">
              <span className="text-zinc-400">EXP: {playerExp}%</span>
              <span className="font-bold text-amber-100">
                {playerHp} / {activePlayerPokemon.maxHp}
              </span>
            </div>
            {/* EXP bar */}
            <div className="w-full h-1 bg-zinc-800 rounded mt-1 overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${playerExp}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Control & Dialogue Panel */}
        <div className="h-36 bg-[#18110b] border-t-4 border-amber-600/90 flex flex-col sm:flex-row p-2.5 gap-2">
          {/* Battle Message Box */}
          <div className="flex-1 bg-[#24180e] border-2 border-amber-500/50 p-2.5 rounded flex items-center shadow-inner">
            <p className="pixel-font text-[9px] sm:text-[10px] text-amber-100 leading-relaxed">
              {battleLog}
            </p>
          </div>

          {/* Action Menu (Fight, Bag, Pokemon, Run) */}
          <div className="w-full sm:w-64 bg-[#24180e] border-2 border-amber-500/50 p-2 rounded flex flex-col justify-center">
            {currentMenu === "main" && (
              <div className="grid grid-cols-2 gap-1.5 h-full">
                <button
                  type="button"
                  disabled={isBusy || battleState !== "active"}
                  onClick={() => {
                    sound.playInteract();
                    setCurrentMenu("fight");
                  }}
                  className="bg-rose-700 hover:bg-rose-600 text-white pixel-font text-[9px] font-bold rounded py-2 border border-rose-500/60 shadow active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  ⚔️ LUTAR
                </button>
                <button
                  type="button"
                  disabled={isBusy || battleState !== "active"}
                  onClick={() => {
                    sound.playInteract();
                    setCurrentMenu("bag");
                  }}
                  className="bg-amber-600 hover:bg-amber-500 text-white pixel-font text-[9px] font-bold rounded py-2 border border-amber-400/60 shadow active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  🎒 BOLSA
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => {
                    sound.playInteract();
                    setCurrentMenu("pokemon");
                  }}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white pixel-font text-[9px] font-bold rounded py-2 border border-emerald-500/60 shadow active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  🔄 POKÉMON ({playerTeam.filter((p) => p.hp > 0).length})
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={handleRun}
                  className="bg-sky-700 hover:bg-sky-600 text-white pixel-font text-[9px] font-bold rounded py-2 border border-sky-500/60 shadow active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  🏃 FUGIR
                </button>
              </div>
            )}

            {/* 4 Moves Fight Submenu */}
            {currentMenu === "fight" && (
              <div className="flex flex-col h-full justify-between">
                <div className="grid grid-cols-2 gap-1.5">
                  {activePlayerPokemon.moves.map((m, idx) => (
                    <button
                      key={m.name}
                      type="button"
                      disabled={isBusy || m.pp <= 0}
                      onClick={() => handlePlayerMove(idx)}
                      className="bg-[#362315] hover:bg-[#4d321d] text-amber-200 border border-amber-500/40 text-[8px] pixel-font p-1.5 rounded text-left flex flex-col justify-between shadow active:scale-95 disabled:opacity-40 cursor-pointer"
                      title={m.description}
                    >
                      <span className="font-bold text-amber-100 truncate">{m.name}</span>
                      <span className="text-[7px] text-amber-400/80">
                        {m.type} · {m.pp}/{m.maxPp}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentMenu("main")}
                  className="mt-1 text-[8px] text-amber-400 pixel-font hover:underline text-center cursor-pointer"
                >
                  ← Voltar
                </button>
              </div>
            )}

            {/* Bag Submenu */}
            {currentMenu === "bag" && (
              <div className="flex flex-col h-full justify-between overflow-y-auto">
                <div className="flex flex-col gap-1">
                  {bag.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      disabled={item.count <= 0 || isBusy}
                      onClick={() => handleUseItem(item)}
                      className="flex items-center justify-between bg-[#362315] hover:bg-[#4d321d] text-amber-200 border border-amber-500/40 text-[8px] pixel-font px-2 py-1 rounded cursor-pointer disabled:opacity-40"
                    >
                      <span>{item.name}</span>
                      <span className="text-amber-400 font-bold">x{item.count}</span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentMenu("main")}
                  className="mt-1 text-[8px] text-amber-400 pixel-font hover:underline text-center cursor-pointer"
                >
                  ← Voltar
                </button>
              </div>
            )}

            {/* Switch Pokemon Submenu */}
            {currentMenu === "pokemon" && (
              <div className="flex flex-col h-full justify-between overflow-y-auto">
                <div className="flex flex-col gap-1">
                  {playerTeam.map((poke, idx) => (
                    <button
                      key={poke.id + idx}
                      type="button"
                      disabled={isBusy || poke.hp <= 0}
                      onClick={() => handleSwitchPokemon(idx)}
                      className={`flex items-center justify-between text-[8px] pixel-font px-2 py-1 rounded border cursor-pointer ${
                        idx === activeTeamIndex
                          ? "bg-amber-600/30 border-amber-400 text-amber-200"
                          : poke.hp <= 0
                            ? "bg-zinc-900 border-zinc-800 text-zinc-600 opacity-50 cursor-not-allowed"
                            : "bg-[#362315] hover:bg-[#4d321d] border-amber-500/40 text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <img
                          src={poke.sprite}
                          alt={poke.name}
                          className="w-5 h-5 object-contain image-pixelated"
                          style={{ imageRendering: "pixelated" }}
                          referrerPolicy="no-referrer"
                        />
                        <span>{poke.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[7px] text-amber-400/80">
                          {poke.hp}/{poke.maxHp} HP
                        </span>
                        <span className="text-amber-400 font-bold">Nv. {poke.level}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentMenu("main")}
                  className="mt-1 text-[8px] text-amber-400 pixel-font hover:underline text-center cursor-pointer"
                >
                  ← Voltar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════════
            VICTORY OVERLAY ANIMATION
            Appears after winning a battle, featuring:
            - Animated victory entrance & floating retro sparkle particles
            - MVP Pokémon victory showcase with bounce & Level Up celebration
            - Total XP Gained with animated counter (+XP) & level progress bar
            - Opponent defeated summary & tournament wins
            - Prominent "CONTINUAR (VOLTAR AO MAPA)" button and keyboard shortcuts
        ══════════════════════════════════════════════════════════════════════════ */}
        {showVictoryOverlay && victoryData && (
          <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
            {/* Ambient Particles & Sparkles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <span className="absolute top-6 left-10 text-2xl animate-[bounce_1.8s_infinite] opacity-80">
                ⭐
              </span>
              <span className="absolute top-8 right-12 text-2xl animate-[pulse_1.5s_infinite] opacity-90">
                ✨
              </span>
              <span className="absolute bottom-14 left-12 text-xl animate-[pulse_2s_infinite] opacity-75">
                🌟
              </span>
              <span className="absolute bottom-10 right-14 text-2xl animate-[bounce_2.2s_infinite] opacity-80">
                🎉
              </span>
              <span className="absolute top-1/2 left-6 text-lg opacity-70 animate-ping">✨</span>
              <span className="absolute top-1/3 right-8 text-lg opacity-70 animate-ping">✨</span>
            </div>

            {/* Victory Card Container */}
            <div
              className="relative w-full max-w-lg bg-gradient-to-b from-[#2a1e14] via-[#1f160e] to-[#140d08] border-4 border-amber-500 rounded p-4 sm:p-5 shadow-[0_0_50px_rgba(245,158,11,0.55)] flex flex-col items-center text-center"
              style={{
                animation: "victoryPop 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
              }}
            >
              {/* Top Victory Ribbon */}
              <div className="bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 border-2 border-yellow-200 text-amber-950 font-black pixel-font text-sm sm:text-base px-6 py-1 rounded shadow-lg uppercase tracking-widest mb-1.5 flex items-center gap-2 animate-pulse">
                <span>🏆</span>
                <span>VITÓRIA!</span>
                <span>🏆</span>
              </div>

              <p className="pixel-font text-[9px] sm:text-[10px] text-amber-200/90 mb-3">
                Você superou o desafio na Arena do Desert Oasis!
              </p>

              {/* Grid: Victorious Pokemon & XP Rewards */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-12 gap-2.5 mb-4 items-stretch">
                {/* Left Column: MVP Pokémon */}
                <div className="sm:col-span-5 bg-[#2d1b10]/90 border-2 border-amber-500/60 rounded p-2.5 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                  <div className="absolute w-24 h-24 rounded-full bg-amber-500/15 blur-lg pointer-events-none" />

                  <img
                    src={victoryData.pokemonSprite}
                    alt={victoryData.pokemonName}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-contain filter drop-shadow-[0_6px_10px_rgba(0,0,0,0.7)] animate-[bounce_1.5s_ease-in-out_infinite] z-10 image-pixelated"
                    style={{ imageRendering: "pixelated" }}
                    referrerPolicy="no-referrer"
                  />

                  <span className="pixel-font font-bold text-amber-100 text-[11px] mt-1 z-10">
                    {victoryData.pokemonName}
                  </span>

                  <span className="pixel-font text-[9px] text-amber-400 z-10">
                    Nv. {victoryData.newLevel}
                  </span>

                  {victoryData.didLevelUp && (
                    <span className="mt-1 bg-yellow-400 text-yellow-950 text-[8px] font-black pixel-font px-2 py-0.5 rounded border border-yellow-200 animate-pulse z-10">
                      ⭐ SUBIU DE NÍVEL!
                    </span>
                  )}
                </div>

                {/* Right Column: XP Gained & Tournament Status */}
                <div className="sm:col-span-7 bg-[#2d1b10]/90 border-2 border-amber-500/60 rounded p-3 flex flex-col justify-between text-left shadow-inner">
                  {/* Total XP Gained Display */}
                  <div>
                    <span className="pixel-font text-[8px] text-amber-300 font-bold uppercase tracking-wider block">
                      ⚡ Total de XP Ganho:
                    </span>
                    <div className="text-2xl sm:text-3xl pixel-font font-black text-emerald-400 tracking-wide mt-0.5 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      +{animatedExp} XP
                    </div>
                  </div>

                  {/* Animated Level / EXP Bar */}
                  <div className="my-1.5">
                    <div className="flex justify-between items-center text-[8px] pixel-font text-amber-200 mb-1">
                      <span>Progresso p/ Nv. {victoryData.newLevel + 1}:</span>
                      <span className="text-cyan-300 font-bold">
                        {victoryData.newExp} / 100 EXP
                      </span>
                    </div>
                    <div className="w-full h-3 bg-zinc-950 rounded p-0.5 border border-zinc-700 overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded transition-all duration-700"
                        style={{ width: `${victoryData.newExp}%` }}
                      />
                    </div>
                  </div>

                  {/* Opponent Defeated Info */}
                  <div className="text-[8px] pixel-font text-zinc-300 border-t border-amber-500/30 pt-1.5 space-y-0.5">
                    <div>
                      Treinador:{" "}
                      <span className="text-amber-200 font-bold">{victoryData.trainerName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 truncate max-w-[120px]">
                        Derrotou: {victoryData.opponentName}
                      </span>
                      <span className="text-yellow-400 font-bold">
                        🏆 {victoryData.totalWins} Vitórias
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={handleContinueToMap}
                  className="w-full flex-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-amber-950 font-black pixel-font text-xs sm:text-sm py-2.5 px-4 rounded border-2 border-yellow-100 shadow-[0_0_20px_rgba(245,158,11,0.6)] cursor-pointer active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                  title="Retornar ao mapa de Desert Oasis"
                >
                  <span>CONTINUAR (VOLTAR AO MAPA)</span>
                  <span>▶</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextBattle}
                  className="w-full sm:w-auto bg-[#362315] hover:bg-[#4d321d] text-amber-300 pixel-font text-[9px] py-2.5 px-3 rounded border border-amber-500/50 shadow cursor-pointer active:scale-95 transition-transform whitespace-nowrap"
                  title="Enfrentar o próximo oponente na arena"
                >
                  Próxima Batalha ⚔️
                </button>
              </div>

              {/* Keyboard shortcut hint */}
              <span className="pixel-font text-[7px] text-amber-300/70 mt-2">
                [Pressione Espaço ou Enter para continuar]
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          POKÉAPI TEAM BUILDER MODAL
          Allows selecting Pokémon by name via PokéAPI, managing up to 6 members,
          and generating random teams for battle!
      ══════════════════════════════════════════════════════════════════════════ */}
      {showTeamBuilder && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm">
          <div className="bg-[#1c140e] border-4 border-amber-600 rounded-sm w-full max-w-xl p-4 shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-amber-500/40 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 pixel-font font-bold text-sm">
                  ⭐ MONTAR TIME POKÉMON ({playerTeam.length}/6)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowTeamBuilder(false)}
                className="text-amber-400 hover:text-white pixel-font text-xs font-bold cursor-pointer"
              >
                ✕ Fechar
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto py-3 space-y-4">
              {/* Current Team Roster */}
              <div>
                <span className="pixel-font text-[9px] text-amber-300 font-bold block mb-1.5">
                  SEU TIME ATUAL:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {playerTeam.map((member, idx) => (
                    <div
                      key={member.id + idx}
                      className={`flex items-center justify-between p-2 rounded border ${
                        idx === activeTeamIndex
                          ? "border-amber-400 bg-amber-950/40"
                          : "border-zinc-700 bg-zinc-900/60"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={member.sprite}
                          alt={member.name}
                          className="w-8 h-8 object-contain image-pixelated"
                          style={{ imageRendering: "pixelated" }}
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="pixel-font font-bold text-amber-200 text-[10px]">
                            {member.name}{" "}
                            {idx === activeTeamIndex && (
                              <span className="text-[7px] text-amber-400 font-normal">
                                (Titular)
                              </span>
                            )}
                          </div>
                          <div className="text-[8px] text-zinc-400 pixel-font">
                            {member.type} · Nv. {member.level}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMovesPokemonIdx(idx);
                            setSelectedMoveSlot(0);
                            sound.playInteract();
                          }}
                          className="bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 text-[8px] pixel-font px-2 py-0.5 rounded cursor-pointer flex items-center gap-1 border border-emerald-500/50"
                          title="Escolher e personalizar os golpes deste Pokémon"
                        >
                          <span>⚔️</span>
                          <span>Golpes</span>
                        </button>
                        {idx !== activeTeamIndex && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTeamIndex(idx);
                              setPlayerHp(member.hp);
                              sound.playInteract();
                            }}
                            className="bg-amber-600/60 hover:bg-amber-600 text-amber-100 text-[8px] pixel-font px-1.5 py-0.5 rounded cursor-pointer"
                          >
                            Líder
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveFromTeam(idx)}
                          className="bg-red-800/80 hover:bg-red-700 text-white text-[8px] pixel-font px-1.5 py-0.5 rounded cursor-pointer"
                          title="Remover do time"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PokéAPI Search Bar */}
              <div className="bg-[#2a1d14] border border-amber-500/40 p-3 rounded">
                <span className="pixel-font text-[9px] text-amber-300 font-bold block mb-1">
                  🔍 BUSCAR POKÉMON NA POKE API:
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchPokeApi()}
                    placeholder="Nome em inglês (ex: pikachu, lucario, gengar, mewtwo...)"
                    className="flex-1 bg-[#140e0a] border border-amber-500/60 text-amber-100 px-2.5 py-1.5 text-xs pixel-font rounded focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    disabled={isSearchingPokeApi || !searchQuery.trim()}
                    onClick={() => handleSearchPokeApi()}
                    className="bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold px-3 py-1.5 text-[9px] pixel-font rounded shadow cursor-pointer disabled:opacity-50"
                  >
                    {isSearchingPokeApi ? "Buscando..." : "Buscar"}
                  </button>
                </div>

                {/* Popular Quick Suggestions */}
                <div className="mt-2.5">
                  <span className="text-[7px] text-amber-400/80 pixel-font block mb-1">
                    Sugestões Populares:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {POPULAR_POKEMON_SUGGESTIONS.slice(0, 14).map((pName) => (
                      <button
                        key={pName}
                        type="button"
                        onClick={() => {
                          setSearchQuery(pName);
                          handleSearchPokeApi(pName);
                        }}
                        className="bg-amber-950/60 hover:bg-amber-800/80 border border-amber-500/30 text-amber-200 text-[7px] pixel-font px-1.5 py-0.5 rounded cursor-pointer capitalize"
                      >
                        {pName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Error */}
                {searchError && (
                  <div className="mt-2 text-rose-400 text-[8px] pixel-font bg-rose-950/40 p-1.5 rounded border border-rose-800">
                    ⚠️ {searchError}
                  </div>
                )}

                {/* Search Result Card */}
                {searchResult && (
                  <div className="mt-3 bg-[#18110b] border border-amber-400 p-2.5 rounded flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={searchResult.sprite}
                        alt={searchResult.name}
                        className="w-12 h-12 object-contain image-pixelated filter drop-shadow"
                        style={{ imageRendering: "pixelated" }}
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="pixel-font font-bold text-amber-300 text-xs">
                          {searchResult.name}
                        </div>
                        <div className="pixel-font text-[8px] text-zinc-400">
                          Tipo: {searchResult.type} · HP: {searchResult.maxHp}
                        </div>
                        <div className="pixel-font text-[7px] text-amber-400/80 mt-0.5">
                          Golpes: {searchResult.moves.map((m) => m.name).join(", ")}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToTeam(searchResult)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold pixel-font text-[8px] px-3 py-1.5 rounded shadow cursor-pointer active:scale-95"
                    >
                      + Adicionar ao Time
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Actions (Random Team, Random Opponent) */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  disabled={isSearchingPokeApi}
                  onClick={handleGenerateRandomTeam}
                  className="flex-1 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white pixel-font text-[9px] py-2 px-3 rounded border border-emerald-400 shadow cursor-pointer text-center font-bold"
                >
                  🎲 Gerar Time Aleatório (3 Pokémon da PokéAPI)
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t-2 border-amber-500/40 pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowTeamBuilder(false);
                  triggerPokeballThrow(activePlayerPokemon.name);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold px-4 py-1.5 rounded text-[9px] pixel-font shadow cursor-pointer"
              >
                Pronto para a Batalha ▶
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          MOVE CUSTOMIZER MODAL ("Escolher e Personalizar Golpes")
          Allows choosing and customizing attacks for Pokémon based on all its types!
      ══════════════════════════════════════════════════════════════════════════ */}
      {editingMovesPokemonIdx !== null &&
        playerTeam[editingMovesPokemonIdx] &&
        (() => {
          const targetPoke = playerTeam[editingMovesPokemonIdx]!;
          const availableMoves = getAvailableMovesForPokemon(targetPoke);

          return (
            <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm">
              <div className="bg-[#1a120e] border-4 border-emerald-600 rounded-sm w-full max-w-xl p-4 shadow-2xl flex flex-col max-h-[92vh]">
                {/* Header */}
                <div className="flex items-center justify-between border-b-2 border-emerald-500/40 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 pixel-font font-bold text-sm">
                      ⚔️ PERSONALIZAR GOLPES — {targetPoke.name.toUpperCase()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingMovesPokemonIdx(null)}
                    className="text-zinc-400 hover:text-white pixel-font text-xs font-bold cursor-pointer"
                  >
                    ✕ Fechar
                  </button>
                </div>

                {/* Pokemon Info & Current 4 Move Slots */}
                <div className="flex-1 overflow-y-auto py-3 space-y-3.5">
                  <div className="flex items-center gap-3 bg-[#241a14] p-2.5 rounded border border-amber-600/30">
                    <img
                      src={targetPoke.sprite}
                      alt={targetPoke.name}
                      className="w-12 h-12 object-contain image-pixelated"
                      style={{ imageRendering: "pixelated" }}
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="pixel-font text-xs font-bold text-amber-200">
                        {targetPoke.name}{" "}
                        <span className="text-[9px] text-zinc-400">(Nv. {targetPoke.level})</span>
                      </div>
                      <div className="flex gap-1.5 mt-1">
                        {targetPoke.type.split("/").map((t) => (
                          <span
                            key={t.trim()}
                            className="pixel-font text-[8px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 font-bold"
                          >
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                    {moveEquippedNotice && (
                      <div className="ml-auto bg-emerald-900/90 text-emerald-200 border border-emerald-400 text-[8px] pixel-font px-2.5 py-1 rounded animate-in fade-in">
                        ✓ {moveEquippedNotice}
                      </div>
                    )}
                  </div>

                  {/* 4 Active Move Slots */}
                  <div>
                    <span className="pixel-font text-[9px] text-amber-300 font-bold block mb-1">
                      GOLPES ATUAIS (Clique no slot que deseja substituir):
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {targetPoke.moves.map((m, slotIdx) => {
                        const isSelected = selectedMoveSlot === slotIdx;
                        return (
                          <button
                            key={m.name + slotIdx}
                            type="button"
                            onClick={() => {
                              setSelectedMoveSlot(slotIdx);
                              sound.playInteract();
                            }}
                            className={`p-2 rounded text-left border transition-all cursor-pointer ${
                              isSelected
                                ? "border-amber-400 bg-amber-950/70 shadow-[0_0_8px_rgba(251,191,36,0.5)] scale-[1.02]"
                                : "border-zinc-700 bg-zinc-900/70 hover:border-zinc-500"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="pixel-font text-[9px] font-bold text-amber-100">
                                {slotIdx + 1}. {m.name}
                              </span>
                              <span className="pixel-font text-[7px] px-1.5 py-0.2 rounded bg-amber-600/30 text-amber-300 border border-amber-500/40">
                                {m.type}
                              </span>
                            </div>
                            <div className="flex justify-between text-[7px] text-zinc-400 pixel-font mt-1">
                              <span>Poder: {m.power}</span>
                              <span>
                                PP: {m.pp}/{m.maxPp}
                              </span>
                            </div>
                            <p className="text-[7px] text-zinc-400 pixel-font mt-0.5 line-clamp-1">
                              {m.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Available Move Pool */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="pixel-font text-[9px] text-emerald-300 font-bold">
                        GOLPES DISPONÍVEIS PARA O SLOT {selectedMoveSlot + 1}:
                      </span>
                      <span className="text-[7px] text-zinc-400 pixel-font">
                        Clique em qualquer golpe para equipar
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[36vh] overflow-y-auto pr-1">
                      {availableMoves.map((m) => {
                        const isEquippedInActiveSlot =
                          targetPoke.moves[selectedMoveSlot]?.name === m.name;
                        const isEquippedElsewhere = targetPoke.moves.some(
                          (cur, i) => cur.name === m.name && i !== selectedMoveSlot,
                        );

                        return (
                          <div
                            key={m.name}
                            className={`p-2 rounded border flex flex-col justify-between ${
                              isEquippedInActiveSlot
                                ? "border-emerald-500 bg-emerald-950/40"
                                : isEquippedElsewhere
                                  ? "border-zinc-800 bg-zinc-900/40 opacity-70"
                                  : "border-zinc-700 bg-zinc-900/80 hover:border-emerald-500/60 hover:bg-zinc-800/80"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="pixel-font text-[9px] font-bold text-amber-200">
                                  {m.name}
                                </span>
                                <span className="pixel-font text-[7px] px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-500/40">
                                  {m.type}
                                </span>
                              </div>
                              <div className="flex gap-2 text-[7px] text-zinc-300 pixel-font mt-1">
                                <span>
                                  Poder: <strong className="text-amber-300">{m.power}</strong>
                                </span>
                                <span>PP: {m.maxPp}</span>
                              </div>
                              <p className="text-[7.5px] text-zinc-400 pixel-font mt-1 leading-snug">
                                {m.description}
                              </p>
                            </div>

                            <div className="mt-2 pt-1 border-t border-zinc-800 flex justify-end">
                              {isEquippedInActiveSlot ? (
                                <span className="text-[7.5px] text-emerald-400 pixel-font font-bold">
                                  ✓ Equipado neste slot
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAssignMoveToPokemon(
                                      editingMovesPokemonIdx,
                                      selectedMoveSlot,
                                      m,
                                    )
                                  }
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white pixel-font text-[7.5px] px-2 py-0.5 rounded cursor-pointer active:scale-95 font-bold"
                                >
                                  Equipar no Slot {selectedMoveSlot + 1}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="border-t-2 border-emerald-500/40 pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingMovesPokemonIdx(null)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1.5 rounded text-[9px] pixel-font shadow cursor-pointer"
                  >
                    ✓ Concluir Escolha de Golpes
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Global Style for Keyframe Throw Animation & Victory Pop */}
      <style>{`
        @keyframes pokeballThrow {
          0% {
            transform: translate(-140px, 90px) scale(0.3) rotate(0deg);
            opacity: 0.8;
          }
          50% {
            transform: translate(-70px, -35px) scale(0.9) rotate(360deg);
            opacity: 1;
          }
          100% {
            transform: translate(0px, 0px) scale(1) rotate(720deg);
            opacity: 1;
          }
        }
        @keyframes victoryPop {
          0% {
            transform: scale(0.65) translateY(24px);
            opacity: 0;
          }
          65% {
            transform: scale(1.04) translateY(-4px);
            opacity: 1;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
