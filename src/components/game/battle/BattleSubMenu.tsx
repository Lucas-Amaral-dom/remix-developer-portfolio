import type { PlayerPokemon } from "@/lib/battle/types";
import type { BagItem, BattleMenu, BattlePhase } from "./useBattle";

interface BattleSubMenuProps {
  currentMenu: BattleMenu;
  activePlayerPokemon: PlayerPokemon;
  playerTeam: PlayerPokemon[];
  activeTeamIndex: number;
  bag: BagItem[];
  phase: BattlePhase;
  isBusy: boolean;
  onMove: (index: number) => void;
  onUseItem: (item: BagItem) => void;
  onSwitchPokemon: (index: number) => void;
  onBack: () => void;
}

export function BattleSubMenu({
  currentMenu,
  activePlayerPokemon,
  playerTeam,
  activeTeamIndex,
  bag,
  isBusy,
  onMove,
  onUseItem,
  onSwitchPokemon,
  onBack,
}: BattleSubMenuProps) {
  if (currentMenu === "main") return null;

  if (currentMenu === "fight") {
    return (
      <div className="flex flex-col h-full justify-between">
        <div className="grid grid-cols-2 gap-1.5">
          {activePlayerPokemon.moves.map((move, index) => (
            <button
              key={move.name}
              type="button"
              disabled={isBusy || move.pp <= 0}
              onClick={() => onMove(index)}
              className="bg-[#362315] hover:bg-[#4d321d] text-amber-200 border border-amber-500/40 text-[8px] pixel-font p-1.5 rounded text-left flex flex-col justify-between shadow active:scale-95 disabled:opacity-40 cursor-pointer"
              title={move.description}
            >
              <span className="font-bold text-amber-100 truncate">{move.name}</span>
              <span className="text-[7px] text-amber-400/80">
                {move.type} · {move.pp}/{move.maxPp}
              </span>
            </button>
          ))}
        </div>
        <button type="button" onClick={onBack} className="mt-1 text-[8px] text-amber-400 pixel-font hover:underline text-center cursor-pointer">
          ← Voltar
        </button>
      </div>
    );
  }

  if (currentMenu === "bag") {
    return (
      <div className="flex flex-col h-full justify-between overflow-y-auto">
        <div className="flex flex-col gap-1">
          {bag.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={item.count <= 0 || isBusy}
              onClick={() => onUseItem(item)}
              className="flex items-center justify-between bg-[#362315] hover:bg-[#4d321d] text-amber-200 border border-amber-500/40 text-[8px] pixel-font px-2 py-1 rounded cursor-pointer disabled:opacity-40"
            >
              <span>{item.name}</span>
              <span className="text-amber-400 font-bold">x{item.count}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={onBack} className="mt-1 text-[8px] text-amber-400 pixel-font hover:underline text-center cursor-pointer">
          ← Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full justify-between overflow-y-auto">
      <div className="flex flex-col gap-1">
        {playerTeam.map((pokemon, index) => (
          <button
            key={pokemon.id + index}
            type="button"
            disabled={isBusy || pokemon.hp <= 0}
            onClick={() => onSwitchPokemon(index)}
            className={`flex items-center justify-between text-[8px] pixel-font px-2 py-1 rounded border cursor-pointer ${
              index === activeTeamIndex
                ? "bg-amber-600/30 border-amber-400 text-amber-200"
                : pokemon.hp <= 0
                  ? "bg-zinc-900 border-zinc-800 text-zinc-600 opacity-50 cursor-not-allowed"
                  : "bg-[#362315] hover:bg-[#4d321d] border-amber-500/40 text-zinc-300"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <img
                src={pokemon.sprite}
                alt={pokemon.name}
                className="w-5 h-5 object-contain image-pixelated"
                style={{ imageRendering: "pixelated" }}
                referrerPolicy="no-referrer"
              />
              <span>{pokemon.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[7px] text-amber-400/80">
                {pokemon.hp}/{pokemon.maxHp} HP
              </span>
              <span className="text-amber-400 font-bold">Nv. {pokemon.level}</span>
            </div>
          </button>
        ))}
      </div>
      <button type="button" onClick={onBack} className="mt-1 text-[8px] text-amber-400 pixel-font hover:underline text-center cursor-pointer">
        ← Voltar
      </button>
    </div>
  );
}
