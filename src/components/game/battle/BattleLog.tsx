interface BattleLogProps {
  message: string;
}

export function BattleLog({ message }: BattleLogProps) {
  return (
    <div className="flex-1 bg-[#24180e] border-2 border-amber-500/50 p-2.5 rounded flex items-center shadow-inner">
      <p className="pixel-font text-[9px] sm:text-[10px] text-amber-100 leading-relaxed">{message}</p>
    </div>
  );
}
