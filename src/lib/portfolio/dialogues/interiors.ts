import type { Dialogue, DialogueLink, PortfolioData } from "../types";

function stars(level: number): string {
  return "★".repeat(Math.max(0, Math.min(5, level))).padEnd(5, "☆");
}

function safeUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  return /^https?:\/\//i.test(value) ? value : null;
}

export function buildInteriorDialogues(data: PortfolioData): Record<string, Dialogue> {
  const c = data.content;
  const t = (key: string) => c[key] ?? "";
  const name = t("playerName") || "Lucas";
  const out: Record<string, Dialogue> = {};
  out["about-intro"] = {
    speaker: name,
    pages: [{ text: t("aboutIntro") || "" }, { text: t("aboutStory") || "" }],
  };
  out["about-story"] = {
    speaker: "Escrivaninha",
    pages: [{ text: t("aboutStory") || "" }],
  };
  out["about-seeking"] = {
    speaker: "Console",
    pages: [{ text: t("aboutSeeking") || "" }],
  };
  out["about-hobby"] = { speaker: "Cama", pages: [{ text: t("aboutHobby") || "" }] };
  out["about-card"] = {
    speaker: "Quadro",
    pages: [
      { text: `CLASSE: ${t("homeClass") || "-"}` },
      { text: `ORIGEM: ${t("homeOrigin") || "-"}` },
      { text: `FOCO: ${t("homeFocus") || "-"}` },
      { text: `MODO: ${t("homeMode") || "-"}` },
    ],
  };
  out["flavor-plant"] = {
    speaker: "Planta",
    pages: [{ text: "É só uma planta. Mas está bem cuidada." }],
  };

  out["skills-intro"] = {
    speaker: "Instrutor",
    pages: [
      { text: t("skillsIntro") || "" },
      { text: "Cada bancada mostra um grupo de competências. Dê uma olhada!" },
    ],
  };
  out["skills-list"] = {
    speaker: "Estante",
    pages: data.skills.map((s) => ({
      text: `${s.title} ${stars(s.level)}`,
    })),
  };
  const groups: Record<string, string> = {
    base: "skill-base",
    web: "skill-web",
    data: "skill-data",
    quality: "skill-quality",
  };
  for (const [groupKey, dialogueId] of Object.entries(groups)) {
    const list = data.skills.filter((s) => s.group_key === groupKey);
    out[dialogueId] = {
      speaker: list[0]?.title || "Bancada",
      pages: list.length
        ? list.flatMap((s) => [
            { text: `${s.title} — nível ${stars(s.level)}` },
            { text: s.description },
          ])
        : [{ text: "Bancada vazia. Adicione competências no painel de edição." }],
    };
  }

  out["projects-intro"] = {
    speaker: "Juíza",
    pages: [
      { text: t("projectsIntro") || "" },
      { text: "Toque em cada troféu para ver o projeto e os repositórios." },
    ],
  };
  out["projects-all"] = {
    speaker: "Mural",
    pages: data.projects.map((p) => ({ text: `${p.title} — ${p.tags.join(", ")}` })),
  };
  data.projects.forEach((p, i) => {
    const links: DialogueLink[] = [];
    const front = safeUrl(p.front_url);
    const back = safeUrl(p.back_url);
    const demo = safeUrl(p.demo_url);
    if (front) links.push({ label: "Repo front-end", href: front });
    if (back) links.push({ label: "Repo back-end", href: back });
    if (demo) links.push({ label: "Ver demo", href: demo });
    out[`project-${i}`] = {
      speaker: p.title,
      pages: [{ text: p.description }, { text: `TAGS: ${p.tags.join(" · ") || "-"}`, links }],
    };
  });
  // troféus sem projeto correspondente
  for (let i = data.projects.length; i < 6; i++) {
    out[`project-${i}`] = {
      speaker: "Pedestal vazio",
      pages: [{ text: "Nenhum projeto aqui ainda. Em breve!" }],
    };
  }

  out["contact-intro"] = {
    speaker: "Atendente",
    pages: [
      { text: t("contactIntro") || "" },
      { text: "Fale com o balcão para me mandar uma mensagem." },
    ],
  };
  const contactLinks: DialogueLink[] = [];
  if (t("contactEmail").includes("@"))
    contactLinks.push({ label: t("contactEmail"), href: `mailto:${t("contactEmail")}` });
  const li = safeUrl(t("contactLinkedin"));
  if (li) contactLinks.push({ label: "LinkedIn", href: li });
  const gh = safeUrl(t("contactGithub"));
  if (gh) contactLinks.push({ label: "GitHub", href: gh });
  out["contact-links"] = {
    speaker: "Prateleira",
    pages: [{ text: "Meus canais:", links: contactLinks }],
  };
  out["contact-city"] = {
    speaker: "Terminal",
    pages: [
      { text: `Base de operações: ${t("contactCity") || "-"}` },
      { text: "Aberto a trabalho remoto ou presencial." },
    ],
  };
  out["contact-form"] = {
    speaker: "Balcão",
    form: true,
    pages: [{ text: "Deixe seu recado e eu respondo assim que possível." }],
  };

  // Trainer Inn interior dialogues
  out["inn-clerk"] = {
    speaker: "Hoteleira do Oásis",
    pages: [
      { text: "Bem-vindo à Trainer Inn! A pousada de descanso de treinadores e programadores." },
      { text: "Sinta-se em casa! Nossas camas são aconchegantes e a lareira está sempre acesa." },
    ],
  };

  out["inn-rest"] = {
    speaker: "Cama Macia",
    pages: [
      {
        text: "Você se deita confortavelmente nos lençóis macios da pousada dos treinadores...",
        healAction: "inn",
        healLabel: "💤 Descansar na Cama e Curar Equipe",
      },
      {
        text: "Energias totalmente recuperadas! Sua mente está descansada e sua equipe pronta para programar!",
      },
    ],
  };

  out["inn-book"] = {
    speaker: "Livro de Hóspedes",
    pages: [
      {
        text: "Muitos viajantes, recrutadores e treinadores passaram por aqui e deixaram elogios.",
      },
    ],
  };

  out["inn-fire"] = {
    speaker: "Lareira",
    pages: [
      { text: "O calor da lareira aquece a sala de estar da pousada. Um refúgio acolhedor." },
    ],
  };

  // Dev Workshop interior dialogues
  out["workshop-coder"] = {
    speaker: "Arquiteto de Software",
    pages: [
      {
        text: "Aqui montamos a arquitetura do projeto com componentes modulares e dados isolados da renderização.",
      },
      {
        text: "Seguimos rigorosamente os princípios de código limpo e renderização pixel-perfect.",
      },
    ],
  };

  out["workshop-stack"] = {
    speaker: "Estação de Trabalho",
    pages: [
      { text: "STACK TÉCNICA: React 18, TypeScript, Vite, Tailwind CSS, KAPLAY e Supabase." },
      {
        text: "Arquitetura escalável com tipagem estrita e separação entre mapa, entidades e interface.",
      },
    ],
  };

  out["workshop-board"] = {
    speaker: "Quadro Kanban",
    pages: [
      { text: "A FAZER: Continuar inovando em soluções web." },
      { text: "EM PROGRESSO: Construindo projetos de alto impacto." },
      { text: "CONCLUÍDO: Formação SENAI, portfólio interativo e novos desafios!" },
    ],
  };

  out["workshop-deploy"] = {
    speaker: "Terminal de Deploy",
    pages: [{ text: "Status: Produção online e integração contínua ativa." }],
  };

  out["workshop-lint"] = {
    speaker: "Bancada de Testes",
    pages: [{ text: "Zero erros de compilação. Código limpo, componentizado e documentado." }],
  };

  // Pokemon Center interior dialogues
  out["pokecenter-nurse"] = {
    speaker: "Enfermeira Joy",
    pages: [
      { text: "Olá! Bem-vindo ao Centro Pokémon do Desert Oasis!" },
      {
        text: "Deseja que eu cure seus Pokémon e recupere 100% dos pontos de vida (HP) e poder (PP)?",
        healAction: "nurse",
        healLabel: "💖 Curar Meus Pokémon Agora!",
      },
      { text: "Pronto! Seus Pokémon e você estão com 100% de energia e inspiração!" },
    ],
  };

  out["pokecenter-pc"] = {
    speaker: "PC do Treinador",
    pages: [
      { text: "Acessando Sistema de Armazenamento de Código..." },
      { text: "Repositórios sincronizados com sucesso no GitHub!" },
    ],
  };

  out["pokecenter-map"] = {
    speaker: "Mapa Regional",
    pages: [
      {
        text: "Mapa geográfico detalhando Criciúma, Santa Catarina e o vasto mundo do desenvolvimento web.",
      },
    ],
  };


  return out;
}
