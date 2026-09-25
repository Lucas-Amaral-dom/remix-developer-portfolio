import { sound } from "@/lib/sound";

interface BattleMenuProps {
  disabled: boolean;
  availablePokemonCount: number;
  onChooseFight: () => void;
  onChooseBag: () => void;
  onChoosePokemon: () => void;
  onRun: () => void;
}

export function BattleMenu({
  disabled,
  availablePokemonCount,
  onChooseFight,
  onChooseBag,
  onChoosePokemon,
  onRun,
}: BattleMenuProps) {
  return (
    <div className="grid grid-cols-2 gap-1.5 h-full">
      <button type="button" disabled={disabled} onClick={onChooseFight} className="bg-rose-700 hover:bg-rose-600 text-white pixel-font text-[9px] font-bold rounded py-2 border border-rose-500/60 shadow active:scale-95 disabled:opacity-50 cursor-pointer">
        ⚔️ LUTAR
      </button>
      <button type="button" disabled={disabled} onClick={onChooseBag} className="bg-amber-600 hover:bg-amber-500 text-white pixel-font text-[9px] font-bold rounded py-2 border border-amber-400/60 shadow active:scale-95 disabled:opacity-50 cursor-pointer">
        🎒 BOLSA
      </button>
      <button type="button" disabled={disabled} onClick={onChoosePokemon} className="bg-emerald-700 hover:bg-emerald-600 text-white pixel-font text-[9px] font-bold rounded py-2 border border-emerald-500/60 shadow active:scale-95 disabled:opacity-50 cursor-pointer">
        🔄 POKÉMON ({availablePokemonCount})
      </button>
      <button type="button" disabled={disabled} onClick={onRun} className="bg-sky-700 hover:bg-sky-600 text-white pixel-font text-[9px] font-bold rounded py-2 border border-sky-500/60 shadow active:scale-95 disabled:opacity-50 cursor-pointer">
        🏃 FUGIR
      </button>
    </div>
  );
}
