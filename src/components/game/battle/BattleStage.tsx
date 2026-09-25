import type { OpponentMember, PlayerPokemon } from "@/lib/battle/types";
import type { BattleOpponent } from "@/lib/battle/types";
import type { BattlePhase, BallThrowPhase } from "./useBattle";
import { PokeballThrow } from "./PokeballThrow";

interface BattleStageProps {
  opponent: BattleOpponent;
  opponentTeam: OpponentMember[];
  currentOpponent: OpponentMember;
  activeOpponentIndex: number;
  opponentHp: number;
  playerTeam: PlayerPokemon[];
  activeTeamIndex: number;
  activePlayerPokemon: PlayerPokemon;
  playerHp: number;
  playerExp: number;
  phase: BattlePhase;
  ballThrowPhase: BallThrowPhase;
  damageMultiplier: number;
}

const getHpColor = (current: number, max: number) => {
  const percentage = current / max;
  if (percentage > 0.5) return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]";
  if (percentage > 0.2) return "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.7)]";
  return "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)] animate-pulse";
};

export function BattleStage({
  opponent,
  opponentTeam,
  currentOpponent,
  activeOpponentIndex,
  opponentHp,
  playerTeam,
  activeTeamIndex,
  activePlayerPokemon,
  playerHp,
  playerExp,
  phase,
  ballThrowPhase,
  damageMultiplier,
}: BattleStageProps) {
  const screenShake = phase === "opponentHit" || phase === "playerHit";
  const opponentHit = phase === "opponentHit";
  const playerHit = phase === "playerHit";
  const opponentAttacking = phase === "opponentAttacking";
  const playerAttacking = phase === "playerAttacking";

  return (
    <div className="relative flex-1 bg-gradient-to-b from-[#7fa2cc] via-[#d5be9b] to-[#b9986b] overflow-hidden select-none">
      {screenShake && (
        <div
          className="pointer-events-none absolute inset-0 z-50"
          style={{
            backgroundColor:
              phase === "opponentHit"
                ? damageMultiplier >= 1.5
                  ? "rgba(255,230,80,0.5)"
                  : "rgba(255,255,255,0.4)"
                : "rgba(255,255,255,0.35)",
          }}
        />
      )}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-[#8e734c]/65 border-t-2 border-[#b59365]" />
      <div className="absolute top-4 left-6 text-2xl opacity-20 filter blur-[1px]">☁️</div>
      <div className="absolute top-8 right-12 text-3xl opacity-25 filter blur-[1px]">☁️</div>

      <div className="absolute top-6 right-6 md:right-12 w-56 h-48 flex items-end justify-center pointer-events-none">
        <div className="absolute bottom-2 w-48 h-14 rounded-[50%] bg-[#5c462b]/90 border-2 border-[#937146] shadow-md z-0" />
        <div className="absolute bottom-5 w-24 h-5 rounded-[50%] bg-black/40 blur-[1px] z-5 pointer-events-none" />
        <div className="relative z-10 bottom-6 flex items-end justify-center">
          <img
            src={currentOpponent.sprite}
            alt={currentOpponent.name}
            className={`w-32 h-32 md:w-36 md:h-36 object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)] transition-all duration-200 image-pixelated ${
              opponentHit ? "animate-[shake_0.15s_ease-in-out_2] brightness-200" : ""
            } ${
              opponentAttacking
                ? "translate-x-[-25px] translate-y-[20px] scale-110"
                : "animate-[bounce_2s_ease-in-out_infinite]"
            }`}
            style={{ imageRendering: "pixelated" }}
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

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
            <span className="pixel-font font-bold text-amber-200 text-[10px]">{currentOpponent.name}</span>
          </div>
          <span className="pixel-font text-amber-400 text-[9px]">Nv. {currentOpponent.level}</span>
        </div>
        <div className="flex items-center gap-1 my-1">
          <span className="pixel-font text-[7px] text-amber-400/80 mr-1">Time:</span>
          {opponentTeam.map((member, index) => {
            const isDefeated = index < activeOpponentIndex;
            const isActive = index === activeOpponentIndex;
            return (
              <span
                key={member.name + index}
                className={`inline-block w-2.5 h-2.5 rounded-full border text-[6px] text-center leading-none ${
                  isDefeated
                    ? "bg-zinc-700 border-zinc-600 opacity-40"
                    : isActive
                      ? "bg-red-500 border-amber-300 shadow-[0_0_6px_rgba(239,68,68,0.8)] animate-pulse"
                      : "bg-red-400 border-red-700"
                }`}
                title={`${member.name} (Nv. ${member.level})${isDefeated ? " - Derrotado" : isActive ? " - Em Batalha" : ""}`}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="pixel-font text-[7px] text-amber-300 font-bold">HP</span>
          <div className="flex-1 h-3 bg-zinc-900 rounded-sm overflow-hidden p-0.5 border border-zinc-700">
            <div
              className={`h-full transition-all duration-500 rounded-sm ${getHpColor(opponentHp, currentOpponent.maxHp)}`}
              style={{ width: `${(opponentHp / currentOpponent.maxHp) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between items-center pixel-font text-[8px] text-zinc-300 mt-1">
          <span className="text-zinc-400 text-[7px]">{opponent.trainer}</span>
          <span>{opponentHp} / {currentOpponent.maxHp}</span>
        </div>
      </div>

      <div className="absolute bottom-4 left-6 md:left-12 w-64 h-52 flex items-end justify-center pointer-events-none">
        <div className="absolute bottom-2 w-56 h-16 rounded-[50%] bg-[#4c3920]/95 border-2 border-[#82623a] shadow-lg z-0" />
        <div className="absolute bottom-7 w-28 h-6 rounded-[50%] bg-black/45 blur-[1px] z-5 pointer-events-none" />
        <PokeballThrow phase={ballThrowPhase} />
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
              playerHit ? "animate-[shake_0.15s_ease-in-out_2] brightness-200" : ""
            } ${
              playerAttacking
                ? "translate-x-[35px] translate-y-[-25px] scale-110"
                : "animate-[pulse_2.2s_ease-in-out_infinite]"
            }`}
            style={{ imageRendering: "pixelated" }}
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      <div className="absolute bottom-6 right-4 md:right-8 w-64 bg-[#1f1610]/95 border-2 border-amber-500/70 p-2.5 rounded shadow-lg">
        <div className="flex items-center justify-between">
          <span className="pixel-font font-bold text-amber-200 text-[10px]">{activePlayerPokemon.name}</span>
          <span className="pixel-font text-amber-400 text-[9px]">Nv. {activePlayerPokemon.level}</span>
        </div>
        <div className="flex items-center gap-1 my-1">
          <span className="pixel-font text-[7px] text-amber-400/80 mr-1">Time:</span>
          {playerTeam.map((member, index) => (
            <span
              key={member.id}
              className={`inline-block w-2.5 h-2.5 rounded-full border border-black text-[7px] leading-none text-center ${
                member.hp <= 0
                  ? "bg-zinc-600 opacity-40"
                  : index === activeTeamIndex
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
              className={`h-full transition-all duration-500 rounded-sm ${getHpColor(playerHp, activePlayerPokemon.maxHp)}`}
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
        <div className="w-full h-1 bg-zinc-800 rounded mt-1 overflow-hidden">
          <div
            className="h-full bg-cyan-400 transition-all duration-300"
            style={{ width: `${playerExp}%` }}
          />
        </div>
      </div>
    </div>
  );
}
