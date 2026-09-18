import type { PortfolioData, SkillRow } from "@/lib/portfolio-content";
import type { SceneId } from "@/game/world";
import { PixelButton } from "@/components/pixel/PixelButton";
import { ContactForm } from "@/components/pixel/ContactForm";
import { CODING_TOOLS } from "@/components/pixel/TechToolIcons";
import { sound } from "@/lib/sound";

const stars = (level: number) => "★".repeat(Math.max(0, Math.min(5, level))).padEnd(5, "☆");

const safeUrl = (v: string | null | undefined) => (v && /^https?:\/\//i.test(v) ? v : null);

const TITLES: Record<Exclude<SceneId, "city">, string> = {
  home: "Sobre mim",
  lab: "Habilidades",
  arena: "Projetos",
  shop: "Contato",
  inn: "Trainer Inn — Descanso & Apresentação",
  workshop: "Dev Workshop — Arquitetura & Código",
  pokecenter: "Centro Pokémon — Recuperação & Saúde",
};

export function SceneScreen({
  scene,
  data,
  onClose,
}: {
  scene: Exclude<SceneId, "city">;
  data: PortfolioData;
  onClose: () => void;
}) {
  const c = data.content;
  const t = (k: string) => c[k] ?? "";

  return (
    <div className="bg-background/85 absolute inset-0 z-40 flex items-start justify-center overflow-y-auto p-3 backdrop-blur-sm">
      <div className="bg-card text-card-foreground pixel-frame w-full max-w-2xl space-y-5 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="pixel-font text-primary text-[11px]">{TITLES[scene]}</h2>
          <PixelButton variant="ghost" onClick={onClose}>
            ✕ Fechar
          </PixelButton>
        </div>

        {scene === "home" && <AboutSection data={data} t={t} />}
        {scene === "lab" && <SkillsSection data={data} t={t} />}
        {scene === "arena" && <ProjectsSection data={data} t={t} />}
        {scene === "shop" && <ContactSection t={t} />}
        {scene === "inn" && <InnSection t={t} />}
        {scene === "workshop" && <WorkshopSection />}
        {scene === "pokecenter" && <PokeCenterSection t={t} />}

        <p className="pixel-font text-muted-foreground text-[8px]">
          Feche esta tela para continuar explorando o cenário.
        </p>
      </div>
    </div>
  );
}

type T = (k: string) => string;

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-1">
      <h3 className="pixel-font text-secondary text-[9px] uppercase">{title}</h3>
      <div className="text-sm leading-relaxed whitespace-pre-line">{children}</div>
    </section>
  );
}

function AboutSection({ data, t }: { data: PortfolioData; t: T }) {
  const photo = safeUrl(t("photoUrl"));
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-4">
        {photo && (
          <img
            src={photo}
            alt={`Foto de ${t("playerName") || "perfil"}`}
            loading="lazy"
            className="pixel-frame-sm h-24 w-24 object-cover"
          />
        )}
        <div>
          <p className="pixel-font text-[11px]">{t("playerName") || "Portfólio"}</p>
          <p className="text-muted-foreground text-sm">{t("tagline")}</p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-xs">
        {[
          ["Classe", t("homeClass")],
          ["Origem", t("homeOrigin")],
          ["Foco", t("homeFocus")],
          ["Modo", t("homeMode")],
        ].map(([k, v]) => (
          <div key={k} className="pixel-frame-sm px-3 py-2">
            <dt className="pixel-font text-muted-foreground text-[8px] uppercase">{k}</dt>
            <dd className="mt-1">{v || "-"}</dd>
          </div>
        ))}
      </dl>
      {t("aboutIntro") && <Block title="Apresentação">{t("aboutIntro")}</Block>}
      {t("aboutStory") && <Block title="Trajetória">{t("aboutStory")}</Block>}
      {t("aboutSeeking") && <Block title="O que busco">{t("aboutSeeking")}</Block>}
      {t("aboutHobby") && <Block title="Fora do código">{t("aboutHobby")}</Block>}
      <Block title="Resumo rápido">
        {data.skills.length} habilidades cadastradas · {data.projects.length} projetos.
      </Block>
    </div>
  );
}

function SkillsSection({ data, t }: { data: PortfolioData; t: T }) {
  const groups = data.skills.reduce<Record<string, SkillRow[]>>((acc, s) => {
    (acc[s.group_key] ??= []).push(s);
    return acc;
  }, {});
  const entries = Object.entries(groups);

  return (
    <div className="space-y-5">
      {t("skillsIntro") && <Block title="Visão geral">{t("skillsIntro")}</Block>}
      {entries.length === 0 && <p className="text-sm">Nenhuma habilidade cadastrada ainda.</p>}
      {entries.map(([group, list]) => (
        <section key={group} className="space-y-2">
          <h3 className="pixel-font text-secondary text-[9px] uppercase">{group}</h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {list.map((s) => (
              <li key={s.id} className="pixel-frame-sm px-3 py-2">
                <p className="pixel-font text-[9px]">{s.title}</p>
                <p className="text-secondary text-xs">{stars(s.level)}</p>
                <p className="text-muted-foreground mt-1 text-xs">{s.description}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function ProjectsSection({ data, t }: { data: PortfolioData; t: T }) {
  const githubProfile = safeUrl(t("contactGithub")) || "https://github.com/Lucas-Amaral-dom";

  return (
    <div className="space-y-5">
      {/* GitHub Showcase Banner */}
      <div className="pixel-frame-sm p-4 space-y-3 bg-card border-2 border-primary/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 fill-current text-primary"
              aria-hidden="true"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <div>
              <p className="pixel-font text-[10px] text-primary">REPOSITÓRIOS NO GITHUB</p>
              <p className="text-xs text-muted-foreground">
                Projetos reais com código aberto e commits documentados
              </p>
            </div>
          </div>
          <a
            href={githubProfile}
            target="_blank"
            rel="noreferrer noopener"
            className="pixel-font pixel-press bg-primary text-primary-foreground px-3 py-2 text-[9px] uppercase inline-flex items-center gap-2"
          >
            <span>Ver Perfil GitHub</span>
            <span>↗</span>
          </a>
        </div>
      </div>

      {t("projectsIntro") && <Block title="Sobre os projetos">{t("projectsIntro")}</Block>}
      {data.projects.length === 0 && <p className="text-sm">Nenhum projeto cadastrado ainda.</p>}
      <ul className="space-y-3">
        {data.projects.map((p) => {
          const links = [
            ["Repo front-end", safeUrl(p.front_url)],
            ["Repo back-end", safeUrl(p.back_url)],
            ["Ver demo", safeUrl(p.demo_url)],
          ].filter(([, href]) => href) as [string, string][];
          return (
            <li key={p.id} className="pixel-frame-sm space-y-2 px-3 py-3">
              <div className="flex items-center justify-between gap-2">
                <p className="pixel-font text-[10px] text-foreground font-bold">{p.title}</p>
                <a
                  href={githubProfile}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="pixel-font text-[8px] text-muted-foreground hover:text-primary transition-colors"
                >
                  GitHub ↗
                </a>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-line">{p.description}</p>
              {p.tags.length > 0 && (
                <p className="pixel-font text-muted-foreground text-[8px] uppercase">
                  {p.tags.join(" · ")}
                </p>
              )}
              {links.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {links.map(([labelText, href]) => (
                    <a
                      key={labelText}
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="pixel-font pixel-press bg-secondary text-secondary-foreground px-2 py-1 text-[8px] uppercase inline-flex items-center gap-1"
                    >
                      <span>{labelText}</span>
                      <span>↗</span>
                    </a>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ContactSection({ t }: { t: T }) {
  const email = t("contactEmail");
  const links = [
    ...(email.includes("@") ? [["E-mail", `mailto:${email}`] as [string, string]] : []),
    ...(safeUrl(t("contactLinkedin"))
      ? [["LinkedIn", safeUrl(t("contactLinkedin"))!] as [string, string]]
      : []),
    ...(safeUrl(t("contactGithub"))
      ? [["GitHub", safeUrl(t("contactGithub"))!] as [string, string]]
      : []),
  ];

  return (
    <div className="space-y-5">
      {t("contactIntro") && <Block title="Vamos conversar">{t("contactIntro")}</Block>}
      {t("contactCity") && <Block title="Base">{t("contactCity")}</Block>}
      {links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {links.map(([labelText, href]) => (
            <a
              key={labelText}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="pixel-font pixel-press bg-secondary text-secondary-foreground px-3 py-2 text-[9px] uppercase"
            >
              {labelText}
            </a>
          ))}
        </div>
      )}
      <div className="pixel-frame-sm p-3">
        <ContactForm />
      </div>
    </div>
  );
}

function InnSection({ t }: { t: T }) {
  return (
    <div className="space-y-4">
      <Block title="Trainer Inn — Espaço de Conexão">
        A pousada é o ponto de encontro onde viajantes, recrutadores e desenvolvedores trocam
        experiências e histórias sobre suas jornadas de tecnologia.
      </Block>
      <div className="pixel-frame-sm p-4 space-y-3 bg-secondary/10">
        <h4 className="pixel-font text-[9px] text-primary uppercase">Descanso dos Treinadores</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Tire um momento para relaxar ao som da lareira ou recupere suas energias. Uma boa pausa
          entre sessões de código clareia a mente para soluções elegantes.
        </p>
        <PixelButton variant="secondary" onClick={() => sound.playHealJingle()} className="text-xs">
          🎵 Ouvir Som de Recuperação
        </PixelButton>
      </div>
      <Block title="Mensagem de Boas-Vindas">
        {t("heroSub") ||
          "Sinta-se em casa para explorar todos os detalhes do portfólio de Lucas Amaral."}
      </Block>
    </div>
  );
}

function WorkshopSection() {
  return (
    <div className="space-y-5">
      <Block title="Dev Workshop — Ferramentas & Capacidades de Desenvolvimento">
        Conheça as ferramentas que domino, o que posso construir com cada uma e a arquitetura
        técnica utilizada neste ecossistema.
      </Block>

      {/* Coding Tools Showcase with Official Symbols and Practical Deliverables */}
      <div className="grid grid-cols-1 gap-3">
        {CODING_TOOLS.map((tool) => (
          <div
            key={tool.id}
            className="pixel-frame-sm p-3.5 space-y-2 bg-card"
            style={{ borderLeft: `3px solid ${tool.color}` }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className="p-1.5 rounded"
                  style={{ backgroundColor: tool.bgColor, border: `1px solid ${tool.borderColor}` }}
                >
                  {tool.icon}
                </div>
                <div>
                  <h4 className="pixel-font text-[10px] text-foreground">{tool.name}</h4>
                  <span className="pixel-font text-[7px] uppercase tracking-wider text-muted-foreground">
                    {tool.category}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs font-medium text-primary">✦ {tool.deliverables}</p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px] text-muted-foreground">
              {tool.capabilities.map((cap, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-snug">
                  <span className="text-secondary select-none">▸</span>
                  <span>{cap}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="pixel-frame-sm p-3 space-y-1 bg-muted/20">
        <p className="pixel-font text-[9px] text-amber-500 uppercase">Boas Práticas & Pixel Art</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Renderização crisp em escala inteira, sem filtros de anti-aliasing borrados, código
          componentizado, zero erros de compilação e tipagem rigorosa de ponta a ponta.
        </p>
      </div>
    </div>
  );
}

function PokeCenterSection({ t }: { t: T }) {
  return (
    <div className="space-y-4">
      <Block title="Centro Pokémon do Desert Oasis">
        O centro de acolhimento e suporte a todos os aventureiros da região.
      </Block>
      <div className="pixel-frame-sm p-4 space-y-3 bg-red-500/10 border border-red-500/30">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏥</span>
          <div>
            <p className="pixel-font text-[9px] text-red-500 font-bold">ENFERMEIRA JOY</p>
            <p className="text-xs text-foreground">
              "Bem-vindo! Nós curamos seus Pokémon e revitalizamos seu foco de desenvolvimento!"
            </p>
          </div>
        </div>
        <PixelButton
          onClick={() => sound.playHealJingle()}
          className="bg-red-500 text-white hover:bg-red-600 text-xs"
        >
          ❤️ Curar Treinador & Pokémon
        </PixelButton>
      </div>
      <Block title="Contato do Treinador">
        Precisa de suporte ou quer trocar uma ideia?{" "}
        {t("contactEmail")
          ? `Envie um e-mail para ${t("contactEmail")}`
          : "Fale com o balcão da loja."}
      </Block>
    </div>
  );
}
