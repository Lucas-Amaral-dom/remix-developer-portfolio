import { useEffect, useRef, useState } from "react";
import { sound } from "@/lib/sound";

interface Props {
  isActive: boolean;
  onComplete: () => void;
}

export function BattleTransition({ isActive, onComplete }: Props) {
  const [phase, setPhase] = useState<"idle" | "flash" | "shutter" | "fade">("idle");
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isActive) {
      setPhase("idle");
      return;
    }

    sound.playBattleStart();
    setPhase("flash");

    // Phase 1: Rapid 3-beat strobe flashes (0 - 280ms)
    const tShutter = setTimeout(() => {
      setPhase("shutter");
    }, 280);

    // Phase 2: Shutter stripes sweeping together (280ms - 750ms)
    const tFade = setTimeout(() => {
      setPhase("fade");
    }, 750);

    // Phase 3: Transition complete, reveal battle
    const tDone = setTimeout(() => {
      onCompleteRef.current();
    }, 900);

    return () => {
      clearTimeout(tShutter);
      clearTimeout(tFade);
      clearTimeout(tDone);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto overflow-hidden select-none">
      {/* Rapid Strobe Flash */}
      {phase === "flash" && (
        <div className="absolute inset-0 bg-white animate-[pulse_0.08s_ease-in-out_infinite]" />
      )}

      {/* Retro GBA Horizontal Shutter Stripes */}
      {phase === "shutter" && (
        <div className="absolute inset-0 flex flex-col w-full h-full bg-transparent">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 w-full bg-black transition-transform duration-300 ease-out ${
                i % 2 === 0
                  ? "animate-[slide-in-left_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards]"
                  : "animate-[slide-in-right_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards]"
              }`}
            />
          ))}
          {/* Center Pokéball silhouette flashing */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-8 border-white bg-black/80 flex items-center justify-center animate-ping">
              <div className="w-8 h-8 rounded-full bg-white border-4 border-black" />
            </div>
          </div>
        </div>
      )}

      {/* Solid Black Fade Hold right before arena reveals */}
      {phase === "fade" && (
        <div className="absolute inset-0 bg-black animate-in fade-in duration-150" />
      )}
    </div>
  );
}
