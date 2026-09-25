import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchRandomOpponent,
} from "@/lib/pokeapi";
import type { OpponentMember, PlayerPokemon } from "@/lib/battle/types";
import { calculateDamage, type DamageResult } from "@/lib/battle/damage";
import { MAP_OPPONENTS } from "@/lib/battle/opponents";
import type { BattleOpponent, Move } from "@/lib/battle/types";
import type { useTeamBuilder } from "./useTeamBuilder";
import { sound } from "@/lib/sound";

export type BattlePhase =
  | "intro"
  | "playerAttacking"
  | "opponentHit"
  | "opponentAttacking"
  | "playerHit"
  | "fainted"
  | "won"
  | "lost";

export type BattleMenu = "main" | "fight" | "bag" | "pokemon";

export interface BagItem {
  id: string;
  name: string;
  count: number;
  desc: string;
  healAmount: number;
}

export interface VictoryData {
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

interface UseBattleOptions {
  initialOpponentId?: string;
  onClose: () => void;
  team: ReturnType<typeof useTeamBuilder>;
}

export type BallThrowPhase = "idle" | "flying" | "burst" | "emerged";

export interface UseBattleResult {
  opponentsList: BattleOpponent[];
  selectedOpponentIdx: number;
  opponent: BattleOpponent;
  opponentTeam: OpponentMember[];
  currentOpponent: OpponentMember;
  activeOpponentIndex: number;
  opponentHp: number;
  accumulatedExp: number;
  playerHp: number;
  playerExp: number;
  activeTeamIndex: number;
  activePlayerPokemon: PlayerPokemon;
  currentMenu: BattleMenu;
  battleLog: string;
  phase: BattlePhase;
  battleState: "active" | "won" | "lost";
  isBusy: boolean;
  ballThrowPhase: BallThrowPhase;
  showVictoryOverlay: boolean;
  victoryData: VictoryData | null;
  lastDamageResult: DamageResult | null;
  totalWins: number;
  bag: BagItem[];
  setCurrentMenu: (menu: BattleMenu) => void;
  setShowVictoryOverlay: (open: boolean) => void;
  setActiveTeamIndex: (index: number) => void;
  selectTeamMember: (index: number) => void;
  handleSelectOpponent: (index: number) => void;
  handleSwitchPokemon: (index: number) => void;
  handlePlayerMove: (moveIndex: number) => void;
  handleUseItem: (item: BagItem) => void;
  handleGenerateRandomOpponent: () => Promise<void>;
  handleRun: () => void;
  handleContinueToMap: () => void;
  handleNextBattle: () => void;
  triggerPokeballThrow: (pokemonName: string) => void;
  setPlayerHp: (hp: number) => void;
  setPlayerExp: (exp: number) => void;
}

const INITIAL_BAG: BagItem[] = [
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
];

const getInitialOpponentIndex = (initialOpponentId?: string) => {
  if (!initialOpponentId) return 0;
  const index = MAP_OPPONENTS.findIndex((opponent) => opponent.id === initialOpponentId);
  return index >= 0 ? index : 0;
};

export function useBattle({ initialOpponentId, onClose, team }: UseBattleOptions): UseBattleResult {
  const [opponentsList, setOpponentsList] = useState<BattleOpponent[]>(MAP_OPPONENTS);
  const [selectedOpponentIdx, setSelectedOpponentIdx] = useState(() =>
    getInitialOpponentIndex(initialOpponentId),
  );
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);
  const [activeOpponentIndex, setActiveOpponentIndex] = useState(0);
  const [opponentHp, setOpponentHp] = useState(MAP_OPPONENTS[0]!.team![0]!.maxHp);
  const [accumulatedExp, setAccumulatedExp] = useState(0);
  const [playerHp, setPlayerHp] = useState(team.playerTeam[0]!.hp);
  const [playerExp, setPlayerExp] = useState(team.playerTeam[0]!.exp);
  const [currentMenu, setCurrentMenu] = useState<BattleMenu>("main");
  const [battleLog, setBattleLog] = useState("");
  const [phase, setPhase] = useState<BattlePhase>("intro");
  const [bag, setBag] = useState<BagItem[]>(INITIAL_BAG);
  const [ballThrowPhase, setBallThrowPhase] = useState<BallThrowPhase>("idle");
  const [showVictoryOverlay, setShowVictoryOverlay] = useState(false);
  const [victoryData, setVictoryData] = useState<VictoryData | null>(null);
  const [lastDamageResult, setLastDamageResult] = useState<DamageResult | null>(null);
  const [pendingMoveIndex, setPendingMoveIndex] = useState<number | null>(null);
  const [pendingOpponentMove, setPendingOpponentMove] = useState<Move | null>(null);
  const [runPending, setRunPending] = useState(false);
  const [totalWins, setTotalWins] = useState(() => {
    if (typeof window === "undefined") return 0;
    const saved = localStorage.getItem("portfolio_pokemon_wins");
    return saved ? Number.parseInt(saved, 10) : 0;
  });

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const ballTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const opponent = opponentsList[selectedOpponentIdx] ?? MAP_OPPONENTS[0]!;
  const opponentTeam = useMemo(
    () =>
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
          ],
    [opponent],
  );
  const currentOpponent = opponentTeam[activeOpponentIndex] ?? opponentTeam[0]!;
  const activePlayerPokemon = team.playerTeam[activeTeamIndex] ?? team.playerTeam[0]!;

  const battleState: "active" | "won" | "lost" =
    phase === "won" ? "won" : phase === "lost" ? "lost" : "active";
  const isBusy =
    phase !== "intro" || ballThrowPhase !== "emerged" || showVictoryOverlay;

  const clearBallTimers = useCallback(() => {
    for (const timer of ballTimersRef.current) clearTimeout(timer);
    ballTimersRef.current = [];
  }, []);

  const triggerPokeballThrow = useCallback(
    (pokemonName: string) => {
      clearBallTimers();
      setBallThrowPhase("flying");
      sound.playPokeballThrow();

      const burstTimer = setTimeout(() => {
        setBallThrowPhase("burst");
        sound.playPokeballOpen();
      }, 450);

      const emergedTimer = setTimeout(() => {
        setBallThrowPhase("emerged");
        setBattleLog(`Vai, ${pokemonName}! Mostre sua determinação em batalha!`);
      }, 800);

      ballTimersRef.current = [burstTimer, emergedTimer];
    },
    [clearBallTimers],
  );

  useEffect(() => {
    return () => clearBallTimers();
  }, [clearBallTimers]);

  useEffect(() => {
    setOpponentHp(currentOpponent.maxHp);
  }, [currentOpponent.maxHp]);

  const triggerInitialEntry = useRef(true);
  useEffect(() => {
    if (!triggerInitialEntry.current) return;
    triggerInitialEntry.current = false;
    sound.playBattleStart();
    triggerPokeballThrow(activePlayerPokemon.name);
    setBattleLog(`${opponent.trainer} desafia você para uma batalha! Vai, ${activePlayerPokemon.name}!`);
  }, [activePlayerPokemon.name, opponent.trainer, triggerPokeballThrow]);

  const handleSelectOpponent = useCallback(
    (idx: number) => {
      if (isBusy) return;
      const selected = opponentsList[idx];
      if (!selected) return;
      setSelectedOpponentIdx(idx);
      setActiveOpponentIndex(0);
      const teamForBattle = selected.team && selected.team.length > 0 ? selected.team : [selected];
      setOpponentHp(teamForBattle[0]!.maxHp);
      setAccumulatedExp(0);
      setLastDamageResult(null);
      setVictoryData(null);
      setShowVictoryOverlay(false);
      setCurrentMenu("main");
      setPhase("intro");
      setBattleLog(
        `Você desafiou ${selected.trainer} e sua equipe (${teamForBattle.length} Pokémon)! Vai, ${activePlayerPokemon.name}!`,
      );
      sound.playBattleStart();
      triggerPokeballThrow(activePlayerPokemon.name);
    },
    [activePlayerPokemon.name, isBusy, opponentsList, triggerPokeballThrow],
  );

  const selectTeamMember = useCallback(
    (index: number) => {
      const target = team.playerTeam[index];
      if (!target) return;
      setActiveTeamIndex(index);
      setPlayerHp(target.hp);
      setPlayerExp(target.exp);
      setCurrentMenu("main");
      sound.playInteract();
    },
    [team.playerTeam],
  );

  const handleSwitchPokemon = useCallback(
    (index: number) => {
      if (index === activeTeamIndex) {
        setCurrentMenu("main");
        return;
      }
      const target = team.playerTeam[index];
      if (!target || target.hp <= 0) {
        setBattleLog(`${target?.name || "Este Pokémon"} está desmaiado e não pode lutar!`);
        return;
      }
      setActiveTeamIndex(index);
      setPlayerHp(target.hp);
      setPlayerExp(target.exp);
      setCurrentMenu("main");
      setLastDamageResult(null);
      setPhase("intro");
      triggerPokeballThrow(target.name);
    },
    [activeTeamIndex, team.playerTeam, triggerPokeballThrow],
  );

  const handleGenerateRandomOpponent = useCallback(async () => {
    setBattleLog("Convocando um oponente aleatório da PokéAPI...");
    setPhase("fainted");
    try {
      const randomOpponent = await fetchRandomOpponent();
      const updatedOpponents = [
        randomOpponent,
        ...opponentsList.filter((candidate) => candidate.id !== randomOpponent.id),
      ];
      setOpponentsList(updatedOpponents);
      setSelectedOpponentIdx(0);
      setActiveOpponentIndex(0);
      const teamForBattle =
        randomOpponent.team && randomOpponent.team.length > 0
          ? randomOpponent.team
          : [randomOpponent];
      setOpponentHp(teamForBattle[0]!.maxHp);
      setAccumulatedExp(0);
      setLastDamageResult(null);
      setVictoryData(null);
      setShowVictoryOverlay(false);
      setCurrentMenu("main");
      setPhase("intro");
      setBattleLog(
        `Um oponente surpresa apareceu: ${randomOpponent.trainer} com ${teamForBattle.length} Pokémon!`,
      );
      sound.playBattleStart();
      triggerPokeballThrow(activePlayerPokemon.name);
    } catch (error) {
      console.error(error);
      setPhase("intro");
      setBattleLog("Erro ao convocar oponente aleatório da PokéAPI.");
    }
  }, [activePlayerPokemon.name, opponentsList, triggerPokeballThrow]);

  const handlePlayerMove = useCallback(
    (moveIndex: number) => {
      if (isBusy || battleState !== "active") return;
      const move = activePlayerPokemon.moves[moveIndex];
      if (!move || move.pp <= 0) {
        setBattleLog("Sem pontos de poder (PP) restantes para este golpe!");
        return;
      }

      const updatedTeam = team.playerTeam.map((pokemon, index) =>
        index === activeTeamIndex
          ? {
              ...pokemon,
              moves: pokemon.moves.map((teamMove, teamMoveIndex) =>
                teamMoveIndex === moveIndex ? { ...teamMove, pp: teamMove.pp - 1 } : teamMove,
              ),
            }
          : pokemon,
      );
      team.saveTeam(updatedTeam);
      setPendingMoveIndex(moveIndex);
      setPendingOpponentMove(null);
      setLastDamageResult(null);
      setCurrentMenu("main");
      setBattleLog(`${activePlayerPokemon.name} usou ${move.name}!`);
      setPhase("playerAttacking");
    },
    [
      activePlayerPokemon,
      activeTeamIndex,
      battleState,
      isBusy,
      team,
    ],
  );

  useEffect(() => {
    if (phase !== "playerAttacking") return;
    const timer = setTimeout(() => setPhase("opponentHit"), 450);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "opponentHit" || pendingMoveIndex === null) return;
    const timer = setTimeout(() => {
      const move = activePlayerPokemon.moves[pendingMoveIndex];
      if (!move) {
        setPhase("intro");
        return;
      }

      const result = calculateDamage(move, currentOpponent.type);
      setLastDamageResult(result);
      const nextOpponentHp = Math.max(0, opponentHp - result.damage);
      setOpponentHp(nextOpponentHp);
      setBattleLog(
        `${activePlayerPokemon.name} acertou em cheio causando ${result.damage} de dano!${result.effectivenessText ? ` ${result.effectivenessText}` : ""}`,
      );

      if (nextOpponentHp <= 0) {
        setPhase("fainted");
      } else {
        setPhase("opponentAttacking");
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [
    activePlayerPokemon.moves,
    activePlayerPokemon.name,
    currentOpponent.type,
    opponentHp,
    pendingMoveIndex,
    phase,
  ]);

  useEffect(() => {
    if (phase !== "opponentAttacking") return;
    const availableMoves = currentOpponent.moves;
    const selectedMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    if (!selectedMove) {
      setPhase("intro");
      return;
    }

    setPendingOpponentMove(selectedMove);
    setBattleLog(`${currentOpponent.name} contra-atacou com ${selectedMove.name}!`);
    const timer = setTimeout(() => setPhase("playerHit"), 500);
    return () => clearTimeout(timer);
  }, [currentOpponent.name, currentOpponent.moves, phase]);

  useEffect(() => {
    if (phase !== "playerHit" || !pendingOpponentMove) return;
    const timer = setTimeout(() => {
      const variance = 0.85 + Math.random() * 0.3;
      const damage = Math.max(6, Math.round(pendingOpponentMove.power * variance));
      const nextPlayerHp = Math.max(0, playerHp - damage);
      setPlayerHp(nextPlayerHp);
      team.saveTeam(
        team.playerTeam.map((member, index) =>
          index === activeTeamIndex ? { ...member, hp: nextPlayerHp } : member,
        ),
      );

      if (nextPlayerHp <= 0) {
        sound.playFaint();
        setBattleLog(`${activePlayerPokemon.name} desmaiou!`);
        const healthyIndex = team.playerTeam.findIndex(
          (pokemon, index) => index !== activeTeamIndex && pokemon.hp > 0,
        );
        if (healthyIndex >= 0) {
          setCurrentMenu("pokemon");
          setPhase("intro");
          setBattleLog("Escolha outro Pokémon da sua equipe para continuar!");
        } else {
          setPhase("lost");
          setBattleLog("Todos os seus Pokémon desmaiaram! Você perdeu a batalha.");
        }
      } else {
        setBattleLog(
          `${activePlayerPokemon.name} recebeu ${damage} de dano! O que você fará a seguir?`,
        );
        setPhase("intro");
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [
    activePlayerPokemon.name,
    activeTeamIndex,
    pendingOpponentMove,
    phase,
    playerHp,
    team,
  ]);

  useEffect(() => {
    if (phase !== "fainted") return;
    const timer = setTimeout(() => {
      sound.playFaint();

      const expGained = currentOpponent.rewardExp || currentOpponent.level * 12;
      const newAccumulatedExp = accumulatedExp + expGained;
      const prevExp = activePlayerPokemon.exp;
      const prevLevel = activePlayerPokemon.level;
      const totalExp = prevExp + expGained;
      const levelsGained = totalExp >= 100 ? Math.floor(totalExp / 100) : 0;
      const newLevel = prevLevel + levelsGained;
      const newExp = totalExp % 100;
      const didLevelUp = levelsGained > 0;

      setAccumulatedExp(newAccumulatedExp);
      setPlayerExp(newExp);

      const updatedTeam = team.playerTeam.map((member, index) => {
        if (index !== activeTeamIndex) return member;
        const nextMaxHp = didLevelUp
          ? member.maxHp + (newLevel - prevLevel) * 6
          : member.maxHp;
        return {
          ...member,
          level: newLevel,
          exp: newExp,
          maxHp: nextMaxHp,
          hp: didLevelUp ? nextMaxHp : member.hp,
        };
      });
      team.saveTeam(updatedTeam);

      const hasNextOpponent = activeOpponentIndex < opponentTeam.length - 1;
      if (hasNextOpponent) {
        const nextIndex = activeOpponentIndex + 1;
        const nextOpponent = opponentTeam[nextIndex]!;
        setBattleLog(`${currentOpponent.name} desmaiou! Você ganhou +${expGained} XP!`);
        setActiveOpponentIndex(nextIndex);
        setOpponentHp(nextOpponent.maxHp);
        setPendingMoveIndex(null);
        setPendingOpponentMove(null);
        setLastDamageResult(null);
        setPhase("intro");
        sound.playPokeballOpen();
        setBattleLog(
          `${opponent.trainer} enviou ${nextOpponent.name} (Nv. ${nextOpponent.level})!`,
        );
      } else {
        setBattleLog(
          `Todos os Pokémon de ${opponent.trainer} foram derrotados! Vitória completa!`,
        );
        const newWins = totalWins + 1;
        setTotalWins(newWins);
        localStorage.setItem("portfolio_pokemon_wins", String(newWins));
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
        setPhase("won");
        setShowVictoryOverlay(true);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [
    accumulatedExp,
    activeOpponentIndex,
    activePlayerPokemon,
    activeTeamIndex,
    currentOpponent,
    opponent,
    opponentTeam,
    phase,
    team,
    totalWins,
  ]);

  const handleUseItem = useCallback(
    (item: BagItem) => {
      if (item.count <= 0 || isBusy || battleState !== "active") return;
      if (playerHp >= activePlayerPokemon.maxHp) {
        setBattleLog(`${activePlayerPokemon.name} já está com a vida cheia!`);
        return;
      }

      const heal = Math.min(activePlayerPokemon.maxHp - playerHp, item.healAmount);
      const newHp = Math.min(activePlayerPokemon.maxHp, playerHp + heal);
      setBag((currentBag) =>
        currentBag.map((bagItem) =>
          bagItem.id === item.id ? { ...bagItem, count: bagItem.count - 1 } : bagItem,
        ),
      );
      setPlayerHp(newHp);
      team.saveTeam(
        team.playerTeam.map((member, index) =>
          index === activeTeamIndex ? { ...member, hp: newHp } : member,
        ),
      );
      setCurrentMenu("main");
      setBattleLog(
        `Você usou ${item.name}! ${activePlayerPokemon.name} recuperou ${heal} HP!`,
      );
      sound.playHealJingle();
      setPhase("opponentAttacking");
    },
    [activePlayerPokemon, activeTeamIndex, battleState, isBusy, playerHp, team],
  );

  const handleRun = useCallback(() => {
    if (isBusy) return;
    sound.playRun();
    setBattleLog("Você recuou da batalha com agilidade e segurança!");
    setPhase("lost");
    setRunPending(true);
  }, [isBusy]);

  useEffect(() => {
    if (phase !== "lost" || !runPending) return;
    const timer = setTimeout(() => {
      setRunPending(false);
      onCloseRef.current();
    }, 700);
    return () => clearTimeout(timer);
  }, [phase, runPending]);

  const handleContinueToMap = useCallback(() => {
    sound.playInteract();
    setShowVictoryOverlay(false);
    onCloseRef.current();
  }, []);

  const handleNextBattle = useCallback(() => {
    sound.playInteract();
    setShowVictoryOverlay(false);
    setVictoryData(null);
    const nextIndex = (selectedOpponentIdx + 1) % opponentsList.length;
    handleSelectOpponent(nextIndex);
  }, [handleSelectOpponent, opponentsList.length, selectedOpponentIdx]);

  return {
    opponentsList,
    selectedOpponentIdx,
    opponent,
    opponentTeam,
    currentOpponent,
    activeOpponentIndex,
    opponentHp,
    accumulatedExp,
    playerHp,
    playerExp,
    activeTeamIndex,
    activePlayerPokemon,
    currentMenu,
    battleLog,
    phase,
    battleState,
    isBusy,
    ballThrowPhase,
    showVictoryOverlay,
    victoryData,
    lastDamageResult,
    totalWins,
    bag,
    setCurrentMenu,
    setShowVictoryOverlay,
    setActiveTeamIndex,
    selectTeamMember,
    handleSelectOpponent,
    handleSwitchPokemon,
    handlePlayerMove,
    handleUseItem,
    handleGenerateRandomOpponent,
    handleRun,
    handleContinueToMap,
    handleNextBattle,
    triggerPokeballThrow,
    setPlayerHp,
    setPlayerExp,
  };
}
