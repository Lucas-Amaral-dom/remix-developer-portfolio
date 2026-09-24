import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { createGame, type Dir, type GameHandle } from "@/game/engine";
import { BADGES, type SceneDef, type SceneId } from "@/game/world";
import type { TransitionType } from "@/game/transition";
import { buildDialogues, portfolioQuery, type PortfolioData } from "@/lib/portfolio-content";
import { SceneScreen } from "@/components/game/SceneScreen";
import { BadgeCelebrationModal } from "@/components/game/BadgeCelebrationModal";
import { PokemonBattle } from "@/components/game/PokemonBattle";
import { PokeCenterHealOverlay } from "@/components/pixel/PokeCenterHealOverlay";
import { BattleTransition } from "@/components/pixel/BattleTransition";

import { DialogueBox } from "@/components/pixel/DialogueBox";
import { ContactForm } from "@/components/pixel/ContactForm";
import { DPad } from "@/components/pixel/DPad";
import { PixelButton } from "@/components/pixel/PixelButton";
import { sound } from "@/lib/sound";

export default function GameShell() {
  const { data, isPending, error } = useQuery(portfolioQuery);
  const [started, setStarted] = useState(false);

  const dialogues = useMemo(() => (data ? buildDialogues(data) : {}), [data]);

  if (error) {
    return (
      <Centered>
        <p className="pixel-font text-[10px]">Não deu para carregar o conteúdo do portfólio.</p>
      </Centered>
    );
  }

  if (isPending || !data) {
    return (
      <Centered>
        <p className="pixel-font animate-pulse text-[10px]">Carregando Desert Oasis...</p>
      </Centered>
    );
  }

  if (!started) {
    return (
      <TitleScreen
        name={data.content["playerName"] ?? "Portfólio"}
        tagline={data.content["tagline"] ?? ""}
        sub={data.content["heroSub"] ?? ""}
        onStart={() => setStarted(true)}
      />
    );
  }

  return <World dialogues={dialogues} data={data} />;
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 text-center">{children}</div>
  );
}

function TitleScreen({
  name,
  tagline,
  sub,
  onStart,
}: {
  name: string;
  tagline: string;
  sub: string;
  onStart: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["Enter", " "].includes(e.key)) onStart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onStart]);

  return (
    <div className="scanlines relative flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="bg-card text-card-foreground pixel-frame max-w-xl p-6 md:p-10">
        <p className="pixel-font text-primary text-[10px]">PORTFOLIO QUEST · DESERT OASIS</p>
        <h1 className="pixel-font mt-4 text-lg leading-relaxed md:text-2xl">{name}</h1>
        <p className="pixel-font text-muted-foreground mt-4 text-[9px] leading-relaxed">
          {tagline}
        </p>
        <p className="mt-4 text-sm leading-relaxed">{sub}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <PixelButton onClick={onStart} className="animate-[bob_1.6s_steps(4)_infinite]">
            ▶ Aperte Start
          </PixelButton>
          <Link
            to="/admin"
            className="pixel-font pixel-press bg-secondary text-secondary-foreground px-3 py-2 text-[10px] uppercase"
          >
            Painel
          </Link>
        </div>
      </div>
      <p className="pixel-font text-[8px] opacity-70">
        Setas / WASD para andar · A, Enter ou Espaço para interagir / entrar nas estruturas
      </p>
    </div>
  );
}

interface LocationToast {
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
}

const TRANSITIONS: { id: TransitionType; label: string; icon: string }[] = [
  { id: "iris", label: "Íris", icon: "🌀" },
  { id: "shutter", label: "Veneziana", icon: "▥" },
  { id: "diamond", label: "Diamantes", icon: "❖" },
  { id: "fade", label: "Fade", icon: "◼" },
];

const LOCATION_DATA: Record<string, LocationToast> = {
  city: {
    title: "DESERT OASIS",
    subtitle: "Cidade de Descanso dos Treinadores e Devs",
    icon: "🌴",
    badge: "OÁSIS",
  },
  pokecenter: {
    title: "CENTRO POKÉMON",
    subtitle: "Cura, Descanso & Encontro de Treinadores",
    icon: "🏥",
    badge: "CENTRO",
  },
  inn: {
    title: "TRAINER INN",
    subtitle: "Pousada & Descanso de Desenvolvedores",
    icon: "🏨",
    badge: "POUSADA",
  },
  workshop: {
    title: "DEV WORKSHOP",
    subtitle: "Oficina de Código & Arquitetura Técnica",
    icon: "💻",
    badge: "OFICINA",
  },
  home: {
    title: "CASA DO TREINADOR",
    subtitle: "Sobre mim & Trajetória Profissional",
    icon: "🏠",
    badge: "CASA",
  },
  lab: {
    title: "LAB SENAI",
    subtitle: "Pesquisa Tecnológica & Habilidades",
    icon: "🧪",
    badge: "LAB",
  },
  shop: {
    title: "LOJA & BAZAR",
    subtitle: "Bazar de Contato & Redes Sociais",
    icon: "🛒",
    badge: "LOJA",
  },
  arena: {
    title: "ARENA DE PROJETOS",
    subtitle: "Projetos em Destaque & Desafios",
    icon: "⚔️",
    badge: "ARENA",
  },
};

function World({
  dialogues,
  data,
}: {
  dialogues: ReturnType<typeof buildDialogues>;
  data: PortfolioData;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameHandle | null>(null);
  const gameDestroyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [scene, setScene] = useState<SceneDef | null>(null);
  const [prompt, setPrompt] = useState<{ label: string; action: string } | null>(null);
  const [dialogueId, setDialogueId] = useState<string | null>(null);
  const [badges, setBadges] = useState<SceneId[]>([]);
  const [screen, setScreen] = useState<Exclude<SceneId, "city"> | null>(null);
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [battleOpponent, setBattleOpponent] = useState<string | null>(null);
  const [battleTransitionTarget, setBattleTransitionTarget] = useState<string | null>(null);
  const [openTeamBuilderOnStart, setOpenTeamBuilderOnStart] = useState(false);
  const [healingOverlay, setHealingOverlay] = useState<{
    isOpen: boolean;
    source: "nurse" | "inn";
  }>({ isOpen: false, source: "nurse" });
  const [soundOn, setSoundOn] = useState(sound.enabled);
  const celebratedRef = useRef(false);
  const [transitionType, setTransitionType] = useState<TransitionType>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("portfolio_transition_type");
      if (saved === "iris" || saved === "shutter" || saved === "diamond" || saved === "fade") {
        return saved;
      }
    }
    return "iris";
  });
  const [locationToast, setLocationToast] = useState<LocationToast | null>(
    () => LOCATION_DATA.city ?? null,
  );
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // Auto-dismiss location toast banner after 2.4 seconds
  useEffect(() => {
    if (locationToast) {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => {
        setLocationToast(null);
      }, 2400);
    }
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [locationToast]);

  // Auto-dismiss interaction prompt text after 3 seconds
  const [promptVisible, setPromptVisible] = useState(false);
  const promptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePrompt = useCallback((p: { label: string; action: string } | null) => {
    setPrompt((prev) => {
      if (!prev && !p) return null;
      if (prev && p && prev.label === p.label && prev.action === p.action) {
        return prev;
      }
      return p;
    });

    if (promptTimerRef.current) clearTimeout(promptTimerRef.current);
    if (p) {
      setPromptVisible(true);
      promptTimerRef.current = setTimeout(() => {
        setPromptVisible(false);
      }, 3000);
    } else {
      setPromptVisible(false);
    }
  }, []);

  // Fullscreen support
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        setIsMaximized((prev) => !prev);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "f" || e.key === "F" || e.key === "F11") &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)
      ) {
        if (e.key === "f" || e.key === "F") {
          e.preventDefault();
          toggleFullscreen();
        }
      }
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleFullscreen]);

  const handleDialogue = useCallback((id: string) => setDialogueId(id), []);

  const cycleTransition = () => {
    const idx = TRANSITIONS.findIndex((t) => t.id === transitionType);
    const next = TRANSITIONS[(idx + 1) % TRANSITIONS.length]!.id;
    setTransitionType(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("portfolio_transition_type", next);
    }
    gameRef.current?.setTransitionType(next);
  };

  useEffect(() => {
    if (!hostRef.current) return;
    // In React StrictMode the effect is intentionally mounted, cleaned up and
    // mounted again. Reuse the existing KAPLAY instance during that probe.
    if (gameRef.current) {
      if (gameDestroyTimerRef.current) {
        clearTimeout(gameDestroyTimerRef.current);
        gameDestroyTimerRef.current = null;
      }
      return;
    }
    const game = createGame(hostRef.current, {
      onDialogue: handleDialogue,
      onScene: (s) => {
        setScene(s);

        // Badge acquisition logic
        if (BADGES.some((b) => b.scene === s.id)) {
          setBadges((prev) => {
            if (!prev.includes(s.id)) {
              sound.playBadgeUnlock();
              const next = [...prev, s.id];
              // When reaching all 4 badges, trigger grand celebration
              if (next.length >= 4 && !celebratedRef.current) {
                celebratedRef.current = true;
                setTimeout(() => {
                  setCelebrationOpen(true);
                }, 400);
              }
              return next;
            }
            return prev;
          });
        }
      },
      onPrompt: handlePrompt,
      onTransitionComplete: (s) => {
        const info = LOCATION_DATA[s.id];
        if (info) {
          setLocationToast(info);
          sound.playLocationChime();
          if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
          toastTimerRef.current = setTimeout(() => {
            setLocationToast(null);
          }, 2400);
        }
      },
    });
    gameRef.current = game;
    // Delay destruction by one tick so StrictMode's second mount can cancel it.
    return () => {
      gameDestroyTimerRef.current = setTimeout(() => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        game.destroy();
        if (gameRef.current === game) gameRef.current = null;
        gameDestroyTimerRef.current = null;
      }, 0);
    };
  }, [handleDialogue, handlePrompt]);

  useEffect(() => {
    gameRef.current?.setTransitionType(transitionType);
  }, [transitionType]);

  useEffect(() => {
    gameRef.current?.setPaused(
      dialogueId !== null ||
        screen !== null ||
        celebrationOpen ||
        battleOpponent !== null ||
        battleTransitionTarget !== null ||
        healingOverlay.isOpen,
    );
  }, [
    dialogueId,
    screen,
    celebrationOpen,
    battleOpponent,
    battleTransitionTarget,
    healingOverlay.isOpen,
  ]);

  const toggleSound = () => {
    const next = sound.toggle();
    setSoundOn(next);
  };

  const quickTravel = useCallback((target: Exclude<SceneId, "city">) => {
    setDialogueId(null);
    setScreen(null);
    setCelebrationOpen(false);
    setBattleOpponent(null);
    setBattleTransitionTarget(null);
    setHealingOverlay({ isOpen: false, source: "nurse" });
    gameRef.current?.goTo(target);
  }, []);

  const dialogue = dialogueId ? dialogues[dialogueId] : undefined;

  const activeTransition = TRANSITIONS.find((t) => t.id === transitionType) ?? TRANSITIONS[0]!;

  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="border-border flex flex-wrap items-center justify-between gap-3 border-b-4 px-3 py-2 bg-card/80 backdrop-blur-sm">
        <h1 className="pixel-font text-[10px] text-foreground">{scene?.title ?? "Desert Oasis"}</h1>

        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto">
          {/* Quick travel: click a destination to teleport directly to its building. */}
          {([
            ["home", "🏠", "Casa", "Sobre mim"],
            ["lab", "🧪", "Lab", "Tecnologias"],
            ["arena", "⚔️", "Arena", "Projetos"],
            ["shop", "🛒", "Loja", "Contato"],
          ] as const).map(([target, icon, label, title]) => (
            <button
              key={target}
              type="button"
              onClick={() => quickTravel(target)}
              className={`pixel-frame-sm flex shrink-0 items-center gap-1 px-2 py-1.5 text-[8px] transition-all hover:bg-primary/15 active:scale-95 ${
                scene?.id === target
                  ? "bg-primary/15 text-primary border-primary/60"
                  : "text-foreground"
              }`}
              title={`Ir diretamente para ${title}`}
            >
              <span aria-hidden="true">{icon}</span>
              <span className="pixel-font">{label}</span>
            </button>
          ))}

          {/* Pokemon Battle Launcher */}
          <button
            type="button"
            onClick={() => setBattleOpponent("machop")}
            className="px-2.5 py-1 pixel-frame-sm text-[9px] hover:bg-rose-500/20 text-rose-300 border border-rose-500/40 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Abrir o Sistema de Batalha Pokémon estilo GBA"
          >
            <span className="text-rose-400">⚔️</span>
            <span className="pixel-font text-[9px]">Batalha</span>
          </button>

          {/* Transition Effect Selector */}
          <button
            type="button"
            onClick={cycleTransition}
            className="px-2.5 py-1 pixel-frame-sm text-[9px] hover:bg-secondary/20 transition-colors flex items-center gap-1.5 text-foreground cursor-pointer"
            title="Alternar estilo de transição ao entrar/sair de prédios Pokémon (Íris, Veneziana, Diamantes, Fade)"
          >
            <span className="text-amber-400">{activeTransition.icon}</span>
            <span className="pixel-font text-[9px]">Transição: {activeTransition.label}</span>
          </button>

          {/* Audio toggle button */}
          <button
            type="button"
            onClick={toggleSound}
            className="px-2 py-1 pixel-frame-sm text-[10px] hover:bg-secondary/20 transition-colors"
            title={soundOn ? "Desativar Som Chiptune" : "Ativar Som Chiptune"}
          >
            {soundOn ? "🔊 Som: ON" : "🔇 Som: OFF"}
          </button>

          {/* Clickable Badge Tracker */}
          <button
            type="button"
            onClick={() => setCelebrationOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1 pixel-frame-sm hover:bg-secondary/20 transition-colors group cursor-pointer"
            title="Clique para abrir o Estojo de Insígnias"
          >
            <span className="pixel-font text-secondary text-[9px] group-hover:text-amber-400">
              Insígnias {badges.length}/{BADGES.length}
            </span>
            <div className="flex gap-1">
              {BADGES.map((b) => (
                <span
                  key={b.scene}
                  title={b.name}
                  className={`inline-block h-3.5 w-3.5 rounded-[1px] transition-all duration-300 ${
                    badges.includes(b.scene)
                      ? "bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)] scale-110"
                      : "bg-muted-foreground/30 border border-muted-foreground/20"
                  }`}
                />
              ))}
            </div>
          </button>

          {/* Fullscreen / Maximize Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-2.5 py-1.5 pixel-frame-sm bg-[#2c1d15] hover:bg-[#3d291e] text-amber-300 border border-amber-600/50 shadow text-[9px] pixel-font transition-all active:scale-95 cursor-pointer"
            title={
              isFullscreen || isMaximized ? "Sair da Tela Cheia (F)" : "Tela Cheia / Expandir (F)"
            }
          >
            <span>{isFullscreen || isMaximized ? "🗗" : "⛶"}</span>
            <span className="hidden sm:inline">
              {isFullscreen || isMaximized ? "Janela Normal" : "Tela Cheia"}
            </span>
          </button>
        </div>
      </header>

      <div
        className={`relative flex-1 overflow-hidden bg-[#241a16] ${
          isFullscreen || isMaximized ? "w-screen h-screen" : ""
        }`}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div ref={hostRef} className="relative h-full w-full overflow-hidden" />
        </div>

        {/* Pokemon GBA Location Toast Banner (auto-hides in ~2s or on click) */}
        {locationToast && !screen && (
          <div
            onClick={() => setLocationToast(null)}
            className="cursor-pointer absolute top-4 inset-x-0 flex justify-center z-30 transition-all duration-300 animate-in fade-in slide-in-from-top-3"
            title="Clique para fechar aviso"
          >
            <div className="bg-[#1a120e]/95 text-amber-100 pixel-frame-sm px-4 py-2 flex items-center gap-3 shadow-[0_8px_24px_rgba(0,0,0,0.6)] border-2 border-amber-500/70 backdrop-blur-sm hover:border-amber-400 transition-colors">
              <span className="text-xl select-none filter drop-shadow">{locationToast.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="pixel-font text-[10px] font-bold text-amber-300 tracking-wider">
                    {locationToast.title}
                  </span>
                  <span className="pixel-font text-[7px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-200 border border-amber-400/40 font-bold">
                    {locationToast.badge}
                  </span>
                </div>
                <p className="pixel-font text-[8px] text-zinc-300 mt-0.5">
                  {locationToast.subtitle}
                </p>
              </div>
              <span className="text-[10px] text-zinc-500 hover:text-amber-300 ml-1">✕</span>
            </div>
          </div>
        )}

        {/* Action prompt text at top of screen (auto-dismisses after 3 seconds) */}
        {prompt && promptVisible && !dialogue && (
          <div
            onClick={() => setPromptVisible(false)}
            className="cursor-pointer absolute inset-x-0 top-3 flex justify-center z-30 animate-in fade-in slide-in-from-top-2"
          >
            <span className="pixel-font bg-card/95 text-card-foreground pixel-frame-sm px-3.5 py-2 text-[9px] shadow-lg border border-primary/60 flex items-center gap-2">
              <span>
                {prompt.action}: {prompt.label} — aperte [A] ou [Espaço]
              </span>
              <span className="text-muted-foreground text-[8px] ml-1">✕</span>
            </span>
          </div>
        )}

        {!prompt && !dialogue && scene && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center px-4">
            <span className="pixel-font bg-card/90 text-card-foreground px-3 py-1.5 text-center text-[8px] leading-relaxed shadow-md border border-border">
              {scene.hint}
            </span>
          </div>
        )}

        {dialogue && !screen && !battleOpponent && !battleTransitionTarget && (
          <DialogueBox
            dialogue={dialogue}
            onClose={() => setDialogueId(null)}
            onStartBattle={(oppId, openTeamBuilder = false) => {
              setDialogueId(null);
              setOpenTeamBuilderOnStart(openTeamBuilder);
              setBattleTransitionTarget(oppId);
            }}
            onHeal={(source) => {
              setDialogueId(null);
              setHealingOverlay({ isOpen: true, source });
            }}
            formSlot={<ContactForm />}
          />
        )}

        {screen && <SceneScreen scene={screen} data={data} onClose={() => setScreen(null)} />}

        {/* Pokemon Battle Screen */}
        {battleOpponent && (
          <PokemonBattle
            initialOpponentId={battleOpponent}
            initialOpenTeamBuilder={openTeamBuilderOnStart}
            onClose={() => {
              setBattleOpponent(null);
              setOpenTeamBuilderOnStart(false);
            }}
          />
        )}

        {/* Battle Transition Animation */}
        <BattleTransition
          isActive={battleTransitionTarget !== null}
          onComplete={() => {
            const target = battleTransitionTarget;
            setBattleTransitionTarget(null);
            if (target) setBattleOpponent(target);
          }}
        />

        {/* Pokemon Center & Inn Healing Overlay */}
        <PokeCenterHealOverlay
          isOpen={healingOverlay.isOpen}
          source={healingOverlay.source}
          onClose={() => setHealingOverlay({ isOpen: false, source: "nurse" })}
        />

        {/* 4-Badge Celebration Modal */}
        <BadgeCelebrationModal
          badges={badges}
          isOpen={celebrationOpen}
          isAllUnlockedTrigger={badges.length >= 4}
          onClose={() => setCelebrationOpen(false)}
          onOpenContact={() => {
            setCelebrationOpen(false);
            setDialogueId("contact-form");
          }}
          onOpenProjects={() => {
            setCelebrationOpen(false);
            setScreen("arena");
          }}
        />
      </div>

      <footer className="border-border flex items-center justify-between gap-4 border-t-4 px-3 py-3 bg-card/90">
        <DPad
          onDir={(d: Dir | null) => gameRef.current?.setDir(d)}
          onAction={() => (dialogue ? undefined : gameRef.current?.interact())}
          actionLabel="A"
        />
        <div className="hidden md:block text-center">
          <p className="pixel-font text-[8px] opacity-80 leading-normal">
            Setas / WASD para andar · A, Enter, Espaço para interagir
          </p>
          <p className="pixel-font text-[7px] text-amber-500 mt-0.5">
            Dica: Ande até o tapete de qualquer porta para entrar suavemente!
          </p>
        </div>
        {scene?.indoor ? (
          <div className="flex gap-2">
            <PixelButton onClick={() => setScreen(scene.id as Exclude<SceneId, "city">)}>
              Ver dados
            </PixelButton>
            <PixelButton variant="secondary" onClick={() => gameRef.current?.goTo("city")}>
              ← Sair pra Cidade
            </PixelButton>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <PixelButton
              variant="ghost"
              onClick={() => setCelebrationOpen(true)}
              className="text-[9px]"
            >
              🏆 Insígnias ({badges.length}/4)
            </PixelButton>
            <Link
              to="/admin"
              className="pixel-font pixel-press bg-secondary text-secondary-foreground px-3 py-2 text-[10px] uppercase"
            >
              Painel
            </Link>
          </div>
        )}
      </footer>
    </div>
  );
}
