import { GITHUB_PROFILE_TECHS } from "@/lib/github-profile-data";

const CATEGORY_LABELS = {
  Frontend: "WEB",
  Backend: "BACK-END",
  Database: "DADOS",
  Tooling: "FERRAMENTAS",
} as const;

export function GithubTechBadge({name,compact=false}:{name:string;compact?:boolean}) {
  const tech=GITHUB_PROFILE_TECHS.find((item)=>item.name.toLowerCase()===name.toLowerCase());
  if(!tech) return null;
  return <img src={tech.badgeUrl} alt={tech.name} loading="lazy" className={compact?"h-auto max-w-[108px]":"h-auto max-w-[140px]"} />;
}

export function GithubTechStack({compact=false}:{compact?:boolean}) {
  if (compact) return (
    <div className="flex flex-wrap gap-2" aria-label="Tecnologias do GitHub">
      {GITHUB_PROFILE_TECHS.map((tech)=><span key={tech.id} title={`${tech.name} — ${CATEGORY_LABELS[tech.category]}`} className="pixel-frame-sm inline-flex min-h-8 items-center gap-1.5 bg-background/60 px-2 py-1"><img src={tech.badgeUrl} alt={tech.name} loading="lazy" className="h-auto max-w-[118px]" /></span>)}
    </div>
  );

  return (
    <section className="space-y-3" aria-labelledby="github-stack-title">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 id="github-stack-title" className="pixel-font text-secondary text-[9px] uppercase">Tech Stack do GitHub</h3>
          <p className="mt-1 text-xs text-muted-foreground">Os mesmos símbolos de tecnologia usados no README do meu perfil.</p>
        </div>
        <a href="https://github.com/Lucas-Amaral-dom" target="_blank" rel="noreferrer noopener" className="pixel-font text-[8px] text-primary underline-offset-4 hover:underline">Abrir perfil ↗</a>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
        {GITHUB_PROFILE_TECHS.map((tech)=><div key={tech.id} className="pixel-frame-sm flex min-h-14 items-center justify-center bg-background/45 p-2 transition-transform hover:-translate-y-0.5"><img src={tech.badgeUrl} alt={tech.name} loading="lazy" className="h-auto w-full max-w-[150px]" /></div>)}
      </div>
    </section>
  );
}
