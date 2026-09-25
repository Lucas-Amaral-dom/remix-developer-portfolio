import { useEffect, useState, useRef } from "react";
import type { Dialogue } from "@/lib/portfolio/types";
import { PixelButton } from "./PixelButton";

interface Props {
  dialogue: Dialogue;
  onClose: () => void;
  onStartBattle?: (opponentId: string, openTeamBuilder?: boolean) => void;
  onHeal?: (source: "nurse" | "inn") => void;
  formSlot?: React.ReactNode;
}

const SPEAKER_VARIANTS: Record<string, number> = {
  Lucas: 0,
  "Lucas Amaral": 0,
  Guia: 1,
  "Guia do Oásis": 0,
  "Pescadora do Oásis": 4,
  "Viajante do Deserto": 1,
  "Campista Dev": 3,
  "Desenvolvedor da Oficina": 5,
  "Desenvolvedor Full Stack": 5,
  "Mecânica de Software": 4,
  "Lutador de Sparring": 2,
  "Mestre da Arena": 2,
  "Ranger do Santuário": 4,
  "Mercador do Bazar": 5,
  "Mercador de Frutas e Itens": 5,
  "Hoteleira do Oásis": 3,
  "Enfermeira Joy": 4,
  "Arquiteto de Software": 5,
  "Instrutor SENAI": 5,
  "Juíza da Arena": 2,
  Atendente: 4,
};

function TrainerAvatar({ speaker }: { speaker: string }) {
  const variant = SPEAKER_VARIANTS[speaker] ?? 1;
  // The same 6-variant atlas used by the map: each trainer occupies
  // one 128×192 sheet. Display that sheet at 50% for a clean 64×96 portrait.
  const x = -variant * 64;
  const y = 0;
  return (
    <div
      aria-label={speaker}
      className="h-24 w-16 shrink-0 overflow-hidden rounded-md border-2 border-amber-800/60 bg-gradient-to-b from-amber-950/40 via-amber-900/20 to-black/50 shadow-md"
      style={{
        backgroundImage: 'url("/assets/trainers-real-overworld-atlas.png")',
        backgroundRepeat: "no-repeat",
        backgroundSize: "384px 96px",
        backgroundPosition: `${x}px ${y}px`,
        imageRendering: "pixelated",
      }}
    />
  );
}

/** Types the current page out with instant skip support on user click or key */
function useTypewriter(text: string) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setShown("");
    setDone(false);
    let i = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      i += 3;
      if (i >= text.length) {
        setShown(text);
        setDone(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        setShown(text.slice(0, i));
      }
    }, 12);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text]);

  const finish = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setShown(text);
    setDone(true);
  };

  return { shown, done, finish };
}

export function DialogueBox({ dialogue, onClose, onStartBattle, onHeal, formSlot }: Props) {
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [dialogue.speaker, dialogue.pages.length]);

  const current = dialogue.pages[page] ?? { text: "" };
  const { shown, done, finish } = useTypewriter(current.text);
  const isLast = page >= dialogue.pages.length - 1;

  function advance() {
    if (!done) {
      finish();
      return;
    }
    if (isLast) onClose();
    else setPage((p) => p + 1);
  }

  const advanceRef = useRef(advance);
  advanceRef.current = advance;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("input,textarea")) return;
      if (["Enter", " ", "e", "E"].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        advanceRef.current();
      }
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  return (
    <div
      className="pointer-events-auto absolute inset-x-2 bottom-2 z-30 md:inset-x-8 md:bottom-6 cursor-pointer select-none"
      onClick={(e) => {
        // Only advance if click was not inside an input, textarea or button
        if (e.target instanceof HTMLElement && e.target.closest("button,a,input,textarea")) return;
        advance();
      }}
    >
      <div className="bg-card text-card-foreground pixel-frame relative p-4 pt-6 md:p-6 md:pt-7">
        <span className="pixel-font bg-primary text-primary-foreground absolute -top-3 left-3 px-2 py-1 text-[9px]">
          {dialogue.speaker}
        </span>

        <div className="flex items-start gap-3.5 md:gap-5">
          <TrainerAvatar speaker={dialogue.speaker} />
          <p className="flex-1 min-h-[3.5rem] text-sm leading-relaxed whitespace-pre-line md:text-base">
            {shown}
            {!done && (
              <span className="ml-0.5 inline-block animate-[blink-cursor_1s_steps(1)_infinite]">
                ▌
              </span>
            )}
          </p>
        </div>

        {done && current.links && current.links.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {current.links.map((l) => (
              <a
                key={l.href + l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer noopener"
                className="pixel-font pixel-press bg-accent text-accent-foreground px-3 py-2 text-[10px]"
              >
                {l.label} ↗
              </a>
            ))}
          </div>
        )}

        {current.healAction && (
          <div className="mt-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onHeal?.(current.healAction!);
                advance();
              }}
              className="pixel-font pixel-press flex items-center gap-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2.5 text-xs shadow-md border-2 border-emerald-950 rounded-sm font-bold cursor-pointer transition-transform active:scale-95 animate-pulse"
            >
              <span className="text-sm">💖</span>
              <span>{current.healLabel || "Curar meus Pokémon!"}</span>
            </button>
          </div>
        )}

        {current.battleOpponentId && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const oppId = current.battleOpponentId;
                if (oppId) {
                  onStartBattle?.(oppId, false);
                  onClose();
                }
              }}
              className="pixel-font pixel-press flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:from-red-500 hover:to-amber-500 text-white px-3.5 py-2.5 text-xs shadow-md border-2 border-red-950 rounded-sm font-bold cursor-pointer transition-transform active:scale-95 animate-pulse"
            >
              <span className="text-sm">⚔️</span>
              <span>{current.battleLabel || "Batalhar Agora!"}</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const oppId = current.battleOpponentId;
                if (oppId) {
                  onStartBattle?.(oppId, true);
                  onClose();
                }
              }}
              className="pixel-font pixel-press flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-amber-100 px-3.5 py-2.5 text-xs shadow-md border-2 border-amber-950 rounded-sm font-bold cursor-pointer transition-transform active:scale-95"
              title="Personalizar seu time de Pokémon e ataques antes de entrar em combate"
            >
              <span>⭐</span>
              <span>Escolher Time & Golpes</span>
            </button>
          </div>
        )}

        {done && dialogue.form && formSlot ? <div className="mt-4">{formSlot}</div> : null}

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="pixel-font text-muted-foreground text-[9px]">
            {page + 1}/{dialogue.pages.length} · A / Enter
          </span>
          <div className="flex gap-2">
            <PixelButton variant="ghost" onClick={onClose}>
              Fechar
            </PixelButton>
            <PixelButton onClick={advance}>{isLast && done ? "Ok" : "Próximo ▶"}</PixelButton>
          </div>
        </div>
      </div>
    </div>
  );
}
