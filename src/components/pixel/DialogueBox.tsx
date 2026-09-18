import { useEffect, useState, useRef } from "react";
import type { Dialogue } from "@/lib/portfolio-content";
import { PixelButton } from "./PixelButton";

interface Props {
  dialogue: Dialogue;
  onClose: () => void;
  onStartBattle?: (opponentId: string, openTeamBuilder?: boolean) => void;
  onHeal?: (source: "nurse" | "inn") => void;
  formSlot?: React.ReactNode;
}

const SPEAKER_AVATARS: Record<string, string> = {
  // Trainers matching map NPCs
  "Lutador de Sparring": "https://play.pokemonshowdown.com/sprites/trainers/blackbelt.png",
  "Pescadora do Oásis": "https://play.pokemonshowdown.com/sprites/trainers/fisherman.png",
  "Ranger do Santuário": "https://play.pokemonshowdown.com/sprites/trainers/hiker.png",
  "Mestre da Arena": "https://play.pokemonshowdown.com/sprites/trainers/veteran.png",
  "Viajante do Deserto": "https://play.pokemonshowdown.com/sprites/trainers/brendan.png",
  "Campista Dev": "https://play.pokemonshowdown.com/sprites/trainers/camper.png",
  "Desenvolvedor da Oficina": "https://play.pokemonshowdown.com/sprites/trainers/scientist.png",
  "Desenvolvedor Full Stack": "https://play.pokemonshowdown.com/sprites/trainers/scientist.png",
  "Mecânica de Software": "https://play.pokemonshowdown.com/sprites/trainers/lass.png",
  "Enfermeira Joy": "https://play.pokemonshowdown.com/sprites/trainers/nurse.png",
  "Hoteleira do Oásis": "https://play.pokemonshowdown.com/sprites/trainers/beauty.png",
  "Arquiteto de Software": "https://play.pokemonshowdown.com/sprites/trainers/acetrainer.png",
  "Mercador do Bazar": "https://play.pokemonshowdown.com/sprites/trainers/gentleman.png",
  "Mercador de Frutas e Itens": "https://play.pokemonshowdown.com/sprites/trainers/gentleman.png",
  Guia: "https://play.pokemonshowdown.com/sprites/trainers/acetrainerf.png",
  "Guia do Oásis": "https://play.pokemonshowdown.com/sprites/trainers/acetrainerf.png",
  "Garoto do parquinho": "https://play.pokemonshowdown.com/sprites/trainers/youngster.png",
  "Instrutor SENAI": "https://play.pokemonshowdown.com/sprites/trainers/scientist.png",
  "Juíza da Arena": "https://play.pokemonshowdown.com/sprites/trainers/contestjudge.png",
  Atendente: "https://play.pokemonshowdown.com/sprites/trainers/beauty.png",
  Lucas: "https://play.pokemonshowdown.com/sprites/trainers/lucas.png",
  "Lucas Amaral": "https://play.pokemonshowdown.com/sprites/trainers/lucas.png",

  // Pokémon companions & wild spawns
  Pikachu:
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/25.gif",
  Psyduck:
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/54.gif",
  "Pato do Oásis":
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/54.gif",
  Machop:
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/66.gif",
  Charmander:
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/4.gif",
  Trapinch:
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/328.gif",
  Flygon:
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/330.gif",
  Eevee:
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/133.gif",
  Porygon:
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/137.gif",
  Arcanine:
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/59.gif",
  Chansey:
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/113.gif",
  Bulbasaur:
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/1.gif",
  "Pássaro de Batalha":
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/277.gif",
  "Dino Mascote":
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/246.gif",
};

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

  const avatarUrl = SPEAKER_AVATARS[dialogue.speaker];

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
          {avatarUrl && (
            <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-md border-2 border-amber-800/60 bg-gradient-to-b from-amber-950/40 via-amber-900/20 to-black/50 flex items-center justify-center overflow-hidden p-1 shadow-md">
              <img
                src={avatarUrl}
                alt={dialogue.speaker}
                className="w-full h-full object-contain filter drop-shadow image-pixelated transition-transform hover:scale-105"
                style={{ imageRendering: "pixelated" }}
                referrerPolicy="no-referrer"
              />
            </div>
          )}
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
