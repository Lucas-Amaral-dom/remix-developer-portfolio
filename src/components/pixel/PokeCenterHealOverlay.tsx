import { useEffect, useState } from "react";
import { sound } from "@/lib/sound";
import { healPlayerTeam, type PlayerPokemon } from "@/lib/team-store";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  source?: "nurse" | "inn";
}

export function PokeCenterHealOverlay({
  isOpen,
  onClose,
  title = "Centro Pokémon · Recuperação Total",
  source = "nurse",
}: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [team, setTeam] = useState<PlayerPokemon[]>([]);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setActiveStep(0);
      setIsDone(false);
      return;
    }

    // Perform healing in store
    const { team: healed } = healPlayerTeam();
    setTeam(healed);

    // Play Pokémon healing jingle
    sound.playHealJingle();

    // Sequence of 6 Pokéballs lighting up on the tray
    const t1 = setTimeout(() => setActiveStep(1), 180);
    const t2 = setTimeout(() => setActiveStep(2), 360);
    const t3 = setTimeout(() => setActiveStep(3), 540);
    const t4 = setTimeout(() => setActiveStep(4), 720);
    const t5 = setTimeout(() => setActiveStep(5), 900);
    const t6 = setTimeout(() => setActiveStep(6), 1080);
    const tDone = setTimeout(() => {
      setIsDone(true);
    }, 1450);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(tDone);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (["Enter", " ", "Escape"].includes(e.key) && isDone) {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, isDone, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs select-none animate-in fade-in duration-200"
      onClick={() => {
        if (isDone) onClose();
      }}
    >
      <div
        className="bg-card text-card-foreground pixel-frame relative w-full max-w-lg p-5 md:p-6 shadow-2xl border-4 border-amber-900/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Badge */}
        <div className="flex items-center justify-between border-b-2 border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{source === "nurse" ? "🏥" : "🏨"}</span>
            <div>
              <h3 className="pixel-font text-xs md:text-sm font-bold text-primary">{title}</h3>
              <p className="pixel-font text-[9px] text-muted-foreground">
                {source === "nurse"
                  ? "Enfermeira Joy cuidando da sua equipe"
                  : "Descanso revigorante no Trainer Inn"}
              </p>
            </div>
          </div>
          <span className="pixel-font px-2 py-1 rounded bg-green-500/20 text-green-400 text-[8px] font-bold border border-green-500/40">
            {isDone ? "TOTALMENTE CURADOS" : "RECUPERANDO..."}
          </span>
        </div>

        {/* Center Healing Machine Graphic */}
        <div className="my-5 rounded-lg bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/40 p-4 border-2 border-amber-950/80 shadow-inner flex flex-col items-center">
          {/* Nurse Joy Avatar */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src={
                source === "nurse"
                  ? "https://play.pokemonshowdown.com/sprites/trainers/nurse.png"
                  : "https://play.pokemonshowdown.com/sprites/trainers/beauty.png"
              }
              alt="Nurse Joy"
              className="w-14 h-14 object-contain filter drop-shadow animate-bounce"
              style={{ imageRendering: "pixelated" }}
            />
            <div className="bg-black/60 px-3 py-2 rounded border border-amber-500/30 text-left">
              <p className="pixel-font text-[10px] text-amber-300">
                {source === "nurse"
                  ? "«Seus Pokémon já estão descansando na máquina!»"
                  : "«O descanso renova o corpo e restaura as energias da equipe!»"}
              </p>
              <p className="pixel-font text-[8px] text-white/70 mt-0.5">
                HP, status e pontos de poder (PP) restaurados a 100%!
              </p>
            </div>
          </div>

          {/* Healing Tray with 6 Glowing Pokéball Slots */}
          <div className="w-full max-w-xs bg-slate-900/90 rounded-md p-3 border-2 border-slate-700 shadow-md">
            <div className="text-center mb-2">
              <span className="pixel-font text-[8px] tracking-wider text-muted-foreground uppercase">
                Bandeja de Recuperação
              </span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
                const isActive = slotIdx < activeStep;
                const hasPokemon = slotIdx < team.length;
                return (
                  <div
                    key={slotIdx}
                    className={`relative aspect-square rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isActive
                        ? "bg-amber-400/30 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)] scale-110"
                        : hasPokemon
                          ? "bg-red-950/40 border-red-800/60 opacity-60"
                          : "bg-slate-950 border-slate-800 opacity-30"
                    }`}
                  >
                    {hasPokemon ? (
                      <span
                        className={`text-xs transition-transform ${
                          isActive ? "animate-spin scale-125" : ""
                        }`}
                      >
                        🔴
                      </span>
                    ) : (
                      <span className="text-[9px] opacity-30">⚪</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Team Status Cards */}
        <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
          {team.map((poke) => (
            <div
              key={poke.id}
              className="flex items-center justify-between p-2 rounded bg-black/40 border border-border"
            >
              <div className="flex items-center gap-2">
                <img
                  src={poke.sprite}
                  alt={poke.name}
                  className="w-8 h-8 object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
                <div>
                  <span className="pixel-font text-[10px] font-bold text-foreground">
                    {poke.name}
                  </span>
                  <span className="pixel-font text-[8px] text-muted-foreground ml-2">
                    Nv. {poke.level}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className="w-20 md:w-28 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div className="w-full h-full bg-emerald-500 rounded-full transition-all duration-500" />
                  </div>
                  <span className="pixel-font text-[9px] text-emerald-400 font-bold">
                    {poke.maxHp}/{poke.maxHp} HP
                  </span>
                </div>
                <span className="pixel-font text-[7px] text-muted-foreground">
                  PP dos 4 golpes no máximo
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="pixel-font text-[8px] text-muted-foreground">
            {isDone ? "Pressione [Espaço] ou [Enter] para continuar" : "Recuperando energias..."}
          </span>
          <button
            type="button"
            onClick={onClose}
            disabled={!isDone}
            className={`pixel-font pixel-press px-4 py-2 text-[10px] font-bold uppercase rounded cursor-pointer transition-all ${
              isDone
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
            }`}
          >
            {isDone ? "Pronto! Continuar ▶" : "Aguarde..."}
          </button>
        </div>
      </div>
    </div>
  );
}
