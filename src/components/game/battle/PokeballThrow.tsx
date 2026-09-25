import type { BallThrowPhase } from "./useBattle";

interface PokeballThrowProps {
  phase: BallThrowPhase;
}

export function PokeballThrow({ phase }: PokeballThrowProps) {
  return (
    <>
      {phase === "flying" && (
        <div
          className="absolute z-30 bottom-11 animate-[pokeball-throw_0.45s_cubic-bezier(0.2,0.8,0.3,1)_forwards]"
          style={{ animation: "pokeballThrow 0.45s cubic-bezier(0.2, 0.8, 0.3, 1) forwards" }}
        >
          <div className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-gradient-to-b from-red-600 50% to-white 50% relative shadow-md animate-spin">
            <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-zinc-950" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-zinc-950 bg-white shadow-inner flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-zinc-400" />
            </div>
          </div>
        </div>
      )}
      {phase === "burst" && (
        <div className="absolute bottom-7 z-25 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-200 via-white to-amber-300 animate-ping opacity-90 blur-sm" />
          <div className="absolute w-12 h-12 rounded-full bg-white shadow-[0_0_20px_#fff]" />
          <div className="absolute text-yellow-300 text-xl font-bold animate-pulse">✨</div>
        </div>
      )}
      <style>{`
        @keyframes pokeballThrow {
          0% { transform: translate(-140px, 90px) scale(0.3) rotate(0deg); opacity: 0.8; }
          50% { transform: translate(-70px, -35px) scale(0.9) rotate(360deg); opacity: 1; }
          100% { transform: translate(0px, 0px) scale(1) rotate(720deg); opacity: 1; }
        }
      `}</style>
    </>
  );
}
