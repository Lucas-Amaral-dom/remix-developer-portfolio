import { useEffect, useState } from "react";
import type { SceneId } from "@/game/world";
import { BADGES } from "@/game/world";
import { PixelButton } from "@/components/pixel/PixelButton";
import { sound } from "@/lib/sound";

interface BadgeCelebrationModalProps {
  badges: SceneId[];
  isOpen: boolean;
  isAllUnlockedTrigger?: boolean;
  onClose: () => void;
  onOpenContact: () => void;
  onOpenProjects: () => void;
}

const BADGE_DETAILS: Record<
  SceneId,
  {
    icon: string;
    title: string;
    domain: string;
    desc: string;
    color: string;
    bgGlow: string;
  }
> = {
  home: {
    icon: "🏠",
    title: "Insígnia da Casa",
    domain: "Sobre Mim",
    desc: "Origem, formação técnica no SENAI e motivações no desenvolvimento de sistemas.",
    color: "#F59E0B",
    bgGlow: "rgba(245, 158, 11, 0.25)",
  },
  lab: {
    icon: "🧪",
    title: "Insígnia do Lab",
    domain: "Habilidades",
    desc: "Competências em Front-End, Back-End, APIs, Banco de Dados e Qualidade.",
    color: "#3B82F6",
    bgGlow: "rgba(59, 130, 246, 0.25)",
  },
  arena: {
    icon: "🏆",
    title: "Insígnia da Arena",
    domain: "Projetos",
    desc: "Projetos reais com repositórios no GitHub, arquitetura e interfaces funcionais.",
    color: "#EF4444",
    bgGlow: "rgba(239, 68, 68, 0.25)",
  },
  shop: {
    icon: "💼",
    title: "Insígnia da Loja",
    domain: "Contato",
    desc: "Canais abertos para contratação, estágios, colaborações e networking.",
    color: "#10B981",
    bgGlow: "rgba(16, 185, 129, 0.25)",
  },
  // Extra venues for completion
  inn: {
    icon: "🛏️",
    title: "Insígnia da Pousada",
    domain: "Descanso",
    desc: "Área social e relaxamento dos desenvolvedores.",
    color: "#EC4899",
    bgGlow: "rgba(236, 72, 153, 0.25)",
  },
  workshop: {
    icon: "💻",
    title: "Insígnia da Oficina",
    domain: "Arquitetura",
    desc: "Stack técnica, ferramentas modernas e código do projeto.",
    color: "#8B5CF6",
    bgGlow: "rgba(139, 92, 246, 0.25)",
  },
  pokecenter: {
    icon: "🏥",
    title: "Insígnia do Centro",
    domain: "Energia",
    desc: "Revitalização e acolhimento para a jornada.",
    color: "#F43F5E",
    bgGlow: "rgba(244, 63, 94, 0.25)",
  },
  city: {
    icon: "🌴",
    title: "Insígnia do Oásis",
    domain: "Exploração",
    desc: "A cidade desértica autoral dos treinadores e devs.",
    color: "#F59E0B",
    bgGlow: "rgba(245, 158, 11, 0.25)",
  },
};

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speedY: number;
  speedX: number;
  rotation: number;
}

export function BadgeCelebrationModal({
  badges,
  isOpen,
  isAllUnlockedTrigger = false,
  onClose,
  onOpenContact,
  onOpenProjects,
}: BadgeCelebrationModalProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const isComplete = badges.length >= 4;

  useEffect(() => {
    if (!isOpen) {
      setConfetti([]);
      return;
    }

    if (isComplete || isAllUnlockedTrigger) {
      sound.playVictoryFanfare();

      // Generate confetti particles
      const colors = ["#F59E0B", "#EF4444", "#3B82F6", "#10B981", "#EC4899", "#8B5CF6", "#F3F4F6"];
      const pieces: ConfettiPiece[] = Array.from({ length: 42 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 40,
        size: 6 + Math.floor(Math.random() * 8),
        color: colors[Math.floor(Math.random() * colors.length)]!,
        speedY: 1.5 + Math.random() * 2.5,
        speedX: (Math.random() - 0.5) * 1.5,
        rotation: Math.random() * 360,
      }));
      setConfetti(pieces);

      const interval = setInterval(() => {
        setConfetti((prev) =>
          prev.map((p) => {
            let nextY = p.y + p.speedY;
            let nextX = p.x + p.speedX;
            if (nextY > 105) {
              nextY = -5;
              nextX = Math.random() * 100;
            }
            return {
              ...p,
              y: nextY,
              x: nextX,
              rotation: (p.rotation + 4) % 360,
            };
          }),
        );
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isOpen, isComplete, isAllUnlockedTrigger]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      {/* Falling pixel confetti */}
      {(isComplete || isAllUnlockedTrigger) && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {confetti.map((c) => (
            <div
              key={c.id}
              className="absolute shadow-sm"
              style={{
                left: `${c.x}%`,
                top: `${c.y}%`,
                width: `${c.size}px`,
                height: `${c.size}px`,
                backgroundColor: c.color,
                transform: `rotate(${c.rotation}deg)`,
                opacity: 0.9,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative w-full max-w-2xl bg-card text-card-foreground pixel-frame border-4 border-amber-400 p-5 md:p-8 space-y-6 max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header Ribbon */}
        <div className="text-center space-y-2">
          <div className="inline-block px-4 py-1.5 bg-amber-400 text-black pixel-font text-[10px] md:text-xs tracking-wider uppercase font-bold shadow-md animate-pulse">
            {isComplete ? "★ CAMPEÃO DO PORTFÓLIO QUEST ★" : "ESTOJO DE INSÍGNIAS"}
          </div>

          <h2 className="pixel-font text-base md:text-xl text-primary mt-2">
            {isComplete
              ? "TODAS AS 4 INSÍGNIAS CONQUISTADAS!"
              : `PROGRESSO: ${badges.length} DE 4 INSÍGNIAS`}
          </h2>

          <p className="text-xs md:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            {isComplete
              ? "Parabéns, Treinador! Você explorou o Desert Oasis completo e conheceu toda a trajetória, habilidades e projetos de Lucas Amaral."
              : "Visite cada uma das 4 construções principais da cidade para carimbar sua jornada de desenvolvedor."}
          </p>
        </div>

        {/* 4 Core Badges Showcase Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {BADGES.map((b) => {
            const hasBadge = badges.includes(b.scene);
            const info = BADGE_DETAILS[b.scene];
            return (
              <div
                key={b.scene}
                className={`relative p-3.5 pixel-frame-sm flex items-start gap-3 transition-all duration-300 ${
                  hasBadge
                    ? "bg-secondary/20 border-amber-400 shadow-md"
                    : "bg-muted/30 opacity-60 grayscale border-dashed"
                }`}
                style={{
                  boxShadow: hasBadge ? `0 0 15px ${info.bgGlow}` : "none",
                }}
              >
                {/* Badge Icon Emblem */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-sm border-2 flex items-center justify-center text-2xl select-none ${
                    hasBadge
                      ? "border-amber-400 bg-background animate-[bounce_3s_ease-in-out_infinite]"
                      : "border-muted-foreground/30 bg-muted/20"
                  }`}
                  style={{ borderColor: hasBadge ? info.color : undefined }}
                >
                  {info.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="pixel-font text-[10px] md:text-xs truncate font-bold text-foreground">
                      {info.title}
                    </span>
                    <span
                      className={`pixel-font text-[8px] px-1.5 py-0.5 uppercase ${
                        hasBadge
                          ? "bg-amber-400 text-black font-bold"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {hasBadge ? "OBTIDA" : "PENDENTE"}
                    </span>
                  </div>
                  <p className="pixel-font text-[8px] text-amber-500 uppercase mt-0.5">
                    {info.domain}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-1">{info.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Developer Contact CTA */}
        {isComplete && (
          <div className="p-3.5 bg-amber-500/10 border-2 border-amber-400/60 pixel-frame-sm text-center space-y-2">
            <p className="pixel-font text-[9px] text-amber-400 uppercase">
              Próximo Passo da Jornada
            </p>
            <p className="text-xs text-foreground/90 leading-relaxed">
              Gostou do portfólio e da proposta interativa? Vamos conversar sobre estágio, projetos
              ou oportunidades profissionais!
            </p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <PixelButton
            onClick={() => {
              onClose();
              onOpenContact();
            }}
            className="bg-amber-400 text-black hover:bg-amber-300 font-bold"
          >
            ✉️ Falar com Lucas
          </PixelButton>

          <PixelButton
            variant="secondary"
            onClick={() => {
              onClose();
              onOpenProjects();
            }}
          >
            🏆 Ver Projetos
          </PixelButton>

          <PixelButton
            variant="ghost"
            onClick={() => sound.playVictoryFanfare()}
            title="Ouvir a fanfarra chiptune"
          >
            🔊 Fanfarra
          </PixelButton>

          <PixelButton variant="ghost" onClick={onClose}>
            ✕ Continuar Explorando
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
