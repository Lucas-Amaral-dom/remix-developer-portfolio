import type { Dir } from "@/game/engine";

interface Props {
  onDir: (dir: Dir | null) => void;
  onAction: () => void;
  actionLabel: string;
}

export function DPad({ onDir, onAction, actionLabel }: Props) {
  const pad = (dir: Dir, glyph: string, area: string) => (
    <button
      type="button"
      aria-label={dir}
      style={{ gridArea: area }}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        onDir(dir);
      }}
      onPointerUp={(e) => {
        e.preventDefault();
        if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
        onDir(null);
      }}
      onPointerCancel={() => onDir(null)}
      onContextMenu={(e) => e.preventDefault()}
      className="pixel-press flex h-14 w-14 select-none touch-none touch-manipulation items-center justify-center border border-white/10 bg-white/[0.08] text-card-foreground shadow-[0_4px_14px_rgba(0,0,0,0.18)] backdrop-blur-md active:bg-white/[0.18] pixel-font text-[13px]"
    >
      {glyph}
    </button>
  );

  return (
    <div className="flex items-end justify-between gap-4 md:hidden">
      <div
        className="grid gap-1"
        style={{
          gridTemplateAreas: '". u ." "l . r" ". d ."',
          gridTemplateColumns: "repeat(3, auto)",
        }}
      >
        {pad("up", "▲", "u")}
        {pad("left", "◀", "l")}
        {pad("right", "▶", "r")}
        {pad("down", "▼", "d")}
      </div>
      <button
        type="button"
        onClick={onAction}
        className="pixel-press bg-primary text-primary-foreground pixel-font flex h-16 w-16 items-center justify-center rounded-full text-[11px] select-none touch-none"
      >
        {actionLabel}
      </button>
    </div>
  );
}
