import type { PortfolioData, SkillRow } from "@/lib/portfolio-content";
import type { SceneId } from "@/game/world";
import { PixelButton } from "@/components/pixel/PixelButton";
import { ContactForm } from "@/components/pixel/ContactForm";
import { CODING_TOOLS } from "@/components/pixel/TechToolIcons";
import { sound } from "@/lib/sound";

const stars = (level: number) => "★".repeat(Math.max(0, Math.min(5, level))).padEnd(5, "☆");

const safeUrl = (v: string | null | undefined) => (v && /^https?:\/\//i.test(v) ? v : null);

const ABOUT_TECH_IDS = ["react", "typescript", "node", "supabase", "git", "kaplay"] as const;

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
  const featuredTools = ABOUT_TECH_IDS.map((id) => CODING_TOOLS.find((tool) => tool.id === id)).filter(
    (tool): tool is (typeof CODING_TOOLS)[number] => Boolean(tool),
  );

  return (
    <div className="space-y-5">
      <section className="pixel-frame-sm bg-secondary/10 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {photo && (
            <img
              src={photo}
              alt={`Foto de ${t("playerName") || "perfil"}`}
              loading="lazy"
              className="pixel-frame-sm h-24 w-24 object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="pixel-font text-[11px]">{t("playerName") || "Portfólio"}</p>
            <p className="text-muted-foreground mt-1 text-sm">{t("tagline")}</p>
            <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
              Um perfil rápido para entender minha formação, meu jeito de aprender e os tipos de
              sistemas que gosto de construir.
            </p>
          </div>
        </div>
      </section>

      <dl className="grid grid-cols-2 gap-2.5 text-xs">
        {[
          ["Classe", t("homeClass")],
          ["Origem", t("homeOrigin")],
          ["Foco", t("homeFocus")],
          ["Modo", t("homeMode")],
        ].map(([k, v]) => (
          <div key={k} className="pixel-frame-sm bg-card px-3 py-2.5">
            <dt className="pixel-font text-muted-foreground text-[8px] uppercase">{k}</dt>
            <dd className="mt-1">{v || "-"}</dd>
          </div>
        ))}
      </dl>

      {t("aboutIntro") && <Block title="Apresentação">{t("aboutIntro")}</Block>}

      <section className="space-y-2.5">
        <h3 className="pixel-font text-secondary text-[9px] uppercase">Minha jornada</h3>
        <div className="grid gap-2">
          <article className="pixel-frame-sm bg-card/80 p-3">
            <div className="flex items-start gap-2.5">
              <span className="pixel-font text-primary text-[9px]">01</span>
              <div>
                <p className="pixel-font text-[9px]">Formação</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {t("tagline") || "Técnico em Desenvolvimento de Sistemas — SENAI Criciúma"}
                </p>
              </div>
            </div>
          </article>
          <article className="pixel-frame-sm bg-card/80 p-3">
            <div className="flex items-start gap-2.5">
              <span className="pixel-font text-primary text-[9px]">02</span>
              <div>
                <p className="pixel-font text-[9px]">Construindo na prática</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {t("aboutStory") || "Projetos web de ponta a ponta: interface, API e banco de dados."}
                </p>
              </div>
            </div>
          </article>
          <article className="pixel-frame-sm bg-card/80 p-3">
            <div className="flex items-start gap-2.5">
              <span className="pixel-font text-primary text-[9px]">03</span>
              <div>
                <p className="pixel-font text-[9px]">Próximo objetivo</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {t("aboutSeeking") || "Continuar aprendendo e transformar estudo em projetos reais."}
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      {t("aboutHobby") && <Block title="Fora do código">{t("aboutHobby")}</Block>}

      <section className="space-y-3">
        <div>
          <h3 className="pixel-font text-secondary text-[9px] uppercase">Tecnologias no meu kit</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Em vez de só listar ferramentas, esta parte mostra onde cada tecnologia entra quando um
            projeto sai da ideia e vira produto.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {featuredTools.map((tool) => (
            <details key={tool.id} className="pixel-frame-sm bg-card/80 group">
              <summary className="flex cursor-pointer list-none items-center gap-2.5 p-3 [&::-webkit-details-marker]:hidden">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded border"
                  style={{ backgroundColor: tool.bgColor, borderColor: tool.borderColor }}
                  aria-hidden="true"
                >
                  {tool.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="pixel-font text-[9px]">{tool.name}</p>
                  <p className="text-[10px] text-muted-foreground">{tool.deliverables}</p>
                </div>
                <span className="text-primary text-xs transition-transform group-open:rotate-90">›</span>
              </summary>
              <div className="border-t border-border/60 px-3 pb-3 pt-2">
                <p className="text-[10px] leading-snug text-muted-foreground">
                  {tool.capabilities.slice(0, 2).join(" · ")}
                </p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <div className="pixel-frame-sm bg-primary/5 p-3">
        <p className="pixel-font text-[8px] uppercase text-amber-500">Como eu penso o desenvolvimento</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Entender o problema → organizar dados e responsabilidades → construir a interface → integrar
          serviços → versionar → testar e ajustar. A ideia é aprender construindo, não só acumulando ferramentas.
        </p>
      </div>

      <Block title="Resumo rápido">
        {data.skills.length} áreas de habilidade cadastradas · {data.projects.length} projetos.
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

  const categories = Array.from(new Set(CODING_TOOLS.map((tool) => tool.category)));
  const categoryLabels: Record<string, string> = {
    Frontend: "Frontend",
    Backend: "Backend",
    Database: "Dados",
    "Game & Creative": "Game & 2D",
    Tooling: "Ferramentas",
  };

  return (
    <div className="space-y-5">
      {t("skillsIntro") && <Block title="Visão geral">{t("skillsIntro")}</Block>}

      <section className="pixel-frame-sm bg-secondary/10 p-3">
        <p className="pixel-font text-[9px] text-primary uppercase">Tech Lab</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Cada tecnologia funciona como uma estação de trabalho: você consegue abrir os detalhes e
          ver para que ela serve e o que pode ser construído com ela.
        </p>
      </section>

      <div className="space-y-4">
        {categories.map((category) => {
          const tools = CODING_TOOLS.filter((tool) => tool.category === category);
          return (
            <section key={category} className="space-y-2">
              <div className="flex items-end justify-between gap-3">
                <h3 className="pixel-font text-secondary text-[9px] uppercase">
                  {categoryLabels[category] ?? category}
                </h3>
                <span className="pixel-font text-[7px] text-muted-foreground">
                  {tools.length} estação{tools.length === 1 ? "" : "ões"}
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {tools.map((tool) => (
                  <details
                    key={tool.id}
                    className="pixel-frame-sm bg-card"
                    style={{ borderLeft: `3px solid ${tool.color}` }}
                  >
                    <summary className="flex cursor-pointer list-none items-center gap-3 p-3 [&::-webkit-details-marker]:hidden">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded border"
                        style={{
                          backgroundColor: tool.bgColor,
                          borderColor: tool.borderColor,
                        }}
                        aria-hidden="true"
                      >
                        {tool.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="pixel-font text-[9px]">{tool.name}</h4>
                        <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
                          {tool.deliverables}
                        </p>
                      </div>
                      <span className="text-primary text-xs">+</span>
                    </summary>

                    <div className="border-t border-border/60 px-3 pb-3 pt-2.5">
                      <p className="pixel-font text-[7px] uppercase text-primary">O que consigo fazer</p>
                      <ul className="mt-1.5 space-y-1 text-[10px] leading-snug text-muted-foreground">
                        {tool.capabilities.slice(0, 3).map((capability) => (
                          <li key={capability} className="flex gap-1.5">
                            <span className="text-secondary">▸</span>
                            <span>{capability}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {entries.length > 0 && (
        <section className="space-y-2">
          <h3 className="pixel-font text-secondary text-[9px] uppercase">Competências do curso</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {entries.map(([group, list]) => (
              <div key={group} className="pixel-frame-sm bg-card/70 px-3 py-2">
                <p className="pixel-font text-[8px] uppercase">{group}</p>
                <div className="mt-2 space-y-2">
                  {list.map((s) => (
                    <div key={s.id}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="pixel-font text-[8px]">{s.title}</p>
                        <p className="text-[9px] text-secondary">{stars(s.level)}</p>
                      </div>
                      <p className="mt-1 text-[10px] leading-snug text-muted-foreground">{s.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="pixel-frame-sm bg-muted/20 p-3">
        <p className="pixel-font text-[9px] text-amber-500 uppercase">Rota pelo mapa</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Lab mostra as tecnologias. Workshop mostra como elas se encaixam. Arena mostra o resultado em
          projetos. O portfólio inteiro passa a contar a mesma história.
        </p>
      </div>
    </div>
  );
}

function projectPreviewUrl(p: PortfolioData["projects"][number]) {
  const id = p.id.toLowerCase();
  const title = p.title.toLowerCase();

  if (id.includes("proj-1") || title.includes("biblioteca")) {
    return "https://raw.githubusercontent.com/Lucas-Amaral-dom/biblioteca-front/main/public/logo512.png";
  }
  if (id.includes("proj-2") || title.includes("guarda")) {
    return "https://raw.githubusercontent.com/Lucas-Amaral-dom/projeto_guardavidas/main/public/logo-cbmsc.png";
  }
  if (id.includes("proj-3") || title.includes("rpg") || title.includes("portfólio")) {
    return "https://raw.githubusercontent.com/Lucas-Amaral-dom/portfolio/main/assets/center.jpg";
  }
  return null;
}

function ProjectsSection({ data, t }: { data: PortfolioData; t: T }) {
  const githubProfile = safeUrl(t("contactGithub")) || "https://github.com/Lucas-Amaral-dom";

  return (
    <div className="space-y-6">
      <section className="pixel-frame bg-gradient-to-br from-card via-card to-primary/10 p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="pixel-font text-[8px] uppercase tracking-widest text-secondary">Arena de Projetos</p>
            <h2 className="pixel-font mt-2 text-sm text-foreground md:text-base">Projetos que saíram do papel</h2>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted-foreground">
              Cada projeto abaixo representa uma etapa prática da minha formação: interface, API,
              banco de dados, regras de negócio e este próprio portfólio como experiência 2D.
            </p>
          </div>
          <a
            href={githubProfile}
            target="_blank"
            rel="noreferrer noopener"
            className="pixel-font pixel-press inline-flex items-center justify-center gap-2 bg-primary px-3 py-2 text-[8px] uppercase text-primary-foreground"
          >
            GitHub ↗
          </a>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="pixel-frame-sm bg-background/40 p-3">
            <p className="pixel-font text-[7px] text-muted-foreground">PROJETOS</p>
            <p className="pixel-font mt-1 text-lg text-primary">{data.projects.length}</p>
          </div>
          <div className="pixel-frame-sm bg-background/40 p-3">
            <p className="pixel-font text-[7px] text-muted-foreground">STACK</p>
            <p className="mt-1 text-[10px]">React · TypeScript · APIs</p>
          </div>
          <div className="pixel-frame-sm bg-background/40 p-3">
            <p className="pixel-font text-[7px] text-muted-foreground">FOCO</p>
            <p className="mt-1 text-[10px]">Aprender construindo</p>
          </div>
        </div>
      </section>

      {t("projectsIntro") && <Block title="Sobre os projetos">{t("projectsIntro")}</Block>}
      {data.projects.length === 0 && <p className="text-sm">Nenhum projeto cadastrado ainda.</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        {data.projects.map((p, index) => {
          const links = [
            ["Front-end", safeUrl(p.front_url)],
            ["Back-end", safeUrl(p.back_url)],
            ["Demo", safeUrl(p.demo_url)],
          ].filter(([, href]) => href) as [string, string][];
          const preview = projectPreviewUrl(p);

          return (
            <article
              key={p.id}
              className="group overflow-hidden pixel-frame-sm bg-card transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div className="relative aspect-[16/7] overflow-hidden border-b-2 border-border bg-muted/30">
                {preview ? (
                  <img
                    src={preview}
                    alt={`Prévia visual do projeto ${p.title}`}
                    loading={index === 0 ? "eager" : "lazy"}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    style={{ imageRendering: p.title.toLowerCase().includes("rpg") ? "pixelated" : "auto" }}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="pixel-font text-[8px] text-muted-foreground">PREVIEW DO PROJETO</span>
                  </div>
                )}
                <div className="absolute left-2 top-2 pixel-font bg-[#241a16]/90 px-2 py-1 text-[7px] text-amber-200">
                  QUEST {String(index + 1).padStart(2, "0")}
                </div>
              </div>

              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="pixel-font text-[11px] font-bold text-foreground">{p.title}</p>
                    <p className="mt-1 text-[9px] text-muted-foreground">
                      {index === 0 ? "Sistema web de biblioteca" : index === 1 ? "Sistema de registro para guarda-vidas" : "Portfólio jogável em pixel art"}
                    </p>
                  </div>
                  <span className="pixel-font text-[7px] text-primary">#{String(p.sort_order).padStart(2, "0")}</span>
                </div>

                <p className="text-sm leading-relaxed whitespace-pre-line">{p.description}</p>

                {p.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {p.tags.map((tag) => (
                      <span key={tag} className="pixel-font border border-border bg-secondary/10 px-2 py-1 text-[7px] uppercase text-secondary">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {links.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {links.map(([labelText, href]) => (
                      <a
                        key={labelText}
                        href={href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="pixel-font pixel-press bg-secondary px-2.5 py-1.5 text-[8px] uppercase text-secondary-foreground"
                      >
                        {labelText} ↗
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
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
  const layers = [
    ["01", "Interface", "🖥️", "React + Tailwind organizam telas, componentes, responsividade e a experiência visual."],
    ["02", "Experiência 2D", "🎮", "KAPLAY + Canvas cuidam do mapa, movimentação, colisões, sprites, cenas e transições."],
    ["03", "Dados", "🗄️", "Supabase/PostgreSQL sustentam conteúdo persistido e informações editáveis do portfólio."],
    ["04", "Integrações", "🔗", "APIs externas podem fornecer dados dinâmicos quando o projeto precisa deles."],
    ["05", "Entrega", "🚀", "TypeScript + Git/GitHub ajudam a manter contratos, histórico, refatoração e evolução do código."],
  ];

  return (
    <div className="space-y-5">
      <Block title="Dev Workshop — Como eu construo">
        Esta área funciona como uma visita técnica pelo projeto. Em vez de apenas mostrar ferramentas,
        ela explica como interface, jogo, dados, integrações e versionamento se conectam.
      </Block>

      <section className="pixel-frame-sm bg-secondary/10 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="pixel-font text-[9px] text-primary uppercase">Arquitetura do Oásis</p>
            <p className="mt-1 text-xs text-muted-foreground">Ideia → interface → lógica → dados → integração → entrega</p>
          </div>
          <span className="pixel-font text-[8px] text-amber-500">TECH FLOW</span>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {layers.map(([number, title, icon, description]) => (
            <article key={number} className="pixel-frame-sm bg-card/80 p-3">
              <div className="flex items-start gap-2.5">
                <span className="text-lg" aria-hidden="true">{icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="pixel-font text-[7px] text-muted-foreground">{number}</span>
                    <h3 className="pixel-font text-[9px]">{title}</h3>
                  </div>
                  <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">{description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="pixel-frame-sm bg-card p-3.5">
        <p className="pixel-font text-secondary text-[9px] uppercase">Fluxo de desenvolvimento</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-5">
          {[
            ["01", "Planejar", "definir objetivo"],
            ["02", "Modelar", "organizar dados"],
            ["03", "Construir", "implementar"],
            ["04", "Integrar", "conectar serviços"],
            ["05", "Entregar", "testar e versionar"],
          ].map(([number, title, description]) => (
            <div key={number} className="pixel-frame-sm bg-secondary/5 p-2.5">
              <p className="pixel-font text-[7px] text-primary">{number}</p>
              <p className="pixel-font mt-1 text-[8px]">{title}</p>
              <p className="mt-1 text-[9px] leading-snug text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <div>
          <h3 className="pixel-font text-secondary text-[9px] uppercase">Estações de trabalho</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Abra uma tecnologia para ver sua função e os tipos de entrega associados a ela.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {CODING_TOOLS.map((tool) => (
            <details key={tool.id} className="pixel-frame-sm bg-card" style={{ borderLeft: `3px solid ${tool.color}` }}>
              <summary className="flex cursor-pointer list-none items-center gap-2.5 p-3 [&::-webkit-details-marker]:hidden">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded border"
                  style={{ backgroundColor: tool.bgColor, borderColor: tool.borderColor }}
                  aria-hidden="true"
                >
                  {tool.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="pixel-font text-[9px]">{tool.name}</p>
                  <p className="text-[9px] text-muted-foreground">{tool.category}</p>
                </div>
                <span className="text-primary text-xs">+</span>
              </summary>
              <div className="border-t border-border/60 px-3 pb-3 pt-2.5">
                <p className="text-[10px] leading-snug text-primary">✦ {tool.deliverables}</p>
                <ul className="mt-2 space-y-1 text-[10px] leading-snug text-muted-foreground">
                  {tool.capabilities.map((capability) => (
                    <li key={capability} className="flex gap-1.5">
                      <span className="text-secondary">▸</span>
                      <span>{capability}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="pixel-frame-sm bg-primary/5 p-3.5">
        <p className="pixel-font text-[9px] text-amber-500 uppercase">Este portfólio também é um projeto</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <div>
            <p className="pixel-font text-[8px]">O que ele reúne</p>
            <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
              Interface React, tipagem TypeScript, conteúdo persistido, integrações, jogo 2D, sprites,
              áudio e navegação entre cenas.
            </p>
          </div>
          <div>
            <p className="pixel-font text-[8px]">O que demonstra</p>
            <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
              Capacidade de conectar diferentes partes de um sistema e transformar conteúdo técnico
              em uma experiência interativa.
            </p>
          </div>
        </div>
      </section>
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
