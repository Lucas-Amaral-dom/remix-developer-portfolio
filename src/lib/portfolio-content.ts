import { supabase } from "@/integrations/supabase/client";

export interface SkillRow {
  id: string;
  group_key: string;
  title: string;
  description: string;
  level: number;
  sort_order: number;
}

export interface ProjectRow {
  id: string;
  title: string;
  description: string;
  tags: string[];
  front_url: string | null;
  back_url: string | null;
  demo_url: string | null;
  sort_order: number;
}

export interface PortfolioData {
  content: Record<string, string>;
  skills: SkillRow[];
  projects: ProjectRow[];
}

export const CONTENT_FIELDS: { key: string; label: string; multiline?: boolean }[] = [
  { key: "playerName", label: "Seu nome" },
  { key: "photoUrl", label: "Foto (URL https)" },
  { key: "tagline", label: "Linha de apresentação" },
  { key: "heroSub", label: "Subtítulo da tela de título" },

  { key: "homeClass", label: "Classe" },
  { key: "homeOrigin", label: "Origem" },
  { key: "homeFocus", label: "Foco" },
  { key: "homeMode", label: "Modo" },
  { key: "aboutIntro", label: "Sobre — apresentação", multiline: true },
  { key: "aboutStory", label: "Sobre — trajetória", multiline: true },
  { key: "aboutSeeking", label: "Sobre — o que busco", multiline: true },
  { key: "aboutHobby", label: "Sobre — fora do código", multiline: true },
  { key: "skillsIntro", label: "Intro das skills", multiline: true },
  { key: "projectsIntro", label: "Intro dos projetos", multiline: true },
  { key: "contactIntro", label: "Intro do contato", multiline: true },
  { key: "contactEmail", label: "E-mail" },
  { key: "contactLinkedin", label: "LinkedIn (URL)" },
  { key: "contactGithub", label: "GitHub (URL)" },
  { key: "contactCity", label: "Cidade" },
];

export const DEFAULT_PORTFOLIO_DATA: PortfolioData = {
  content: {
    playerName: "Lucas Amaral",
    tagline: "Técnico em Desenvolvimento de Sistemas — SENAI Criciúma",
    heroSub: "Um portfólio em pixel art. Explore a cidade e entre nas construções.",
    homeClass: "Dev Full Stack Jr.",
    homeOrigin: "Criciúma, SC",
    homeFocus: "Web, apps e banco de dados",
    homeMode: "Aprender construindo",
    aboutIntro:
      "Olá! Sou Lucas, estudante de Desenvolvimento de Sistemas. Gosto de resolver problemas com tecnologia e criar interfaces bem cuidadas.",
    aboutStory:
      "Escolhi Desenvolvimento de Sistemas porque gosto de entender como as coisas funcionam por dentro. Hoje estudo no SENAI Criciúma e construo projetos web de ponta a ponta: interface, API e banco de dados.",
    aboutSeeking:
      "Estou em busca de estágio ou primeira oportunidade como desenvolvedor, presencial em Criciúma ou remoto.",
    aboutHobby:
      "Fora do código: jogos, pixel art e aprender coisas novas construindo pequenos projetos.",
    skillsIntro: "Competências do curso Técnico em Desenvolvimento de Sistemas — SENAI Criciúma.",
    projectsIntro: "Projetos do meu GitHub mostrando front-end, back-end e banco de dados.",
    contactIntro: "Vamos conversar sobre estágio, projetos ou colaboração?",
    contactEmail: "lucasamaraldefarias144@gmail.com",
    contactLinkedin: "https://www.linkedin.com/",
    contactGithub: "https://github.com/Lucas-Amaral-dom",
    contactCity: "Criciúma, Santa Catarina",
  },
  skills: [
    {
      id: "skill-1",
      group_key: "base",
      title: "Base de programação",
      description:
        "Algoritmos, lógica, versionamento com Git, estruturação de código e resolução de problemas.",
      level: 4,
      sort_order: 1,
    },
    {
      id: "skill-2",
      group_key: "web",
      title: "Web e interfaces",
      description:
        "HTML, CSS, JavaScript, protótipos, acessibilidade, responsividade e sistemas web.",
      level: 4,
      sort_order: 2,
    },
    {
      id: "skill-3",
      group_key: "data",
      title: "Dados e backend",
      description:
        "Banco de dados, modelagem, CRUD, APIs REST, regras de negócio e integração de sistemas.",
      level: 3,
      sort_order: 3,
    },
    {
      id: "skill-4",
      group_key: "quality",
      title: "Qualidade e entrega",
      description: "Testes, implantação, manutenção, documentação e gestão de projetos.",
      level: 3,
      sort_order: 4,
    },
  ],
  projects: [
    {
      id: "proj-1",
      title: "Biblioteca",
      description:
        "Sistema dividido em front-end e back-end para organizar uma biblioteca com cadastro, listagem e consulta de acervo.",
      tags: ["Front-end", "Back-end", "CRUD"],
      front_url: "https://github.com/Lucas-Amaral-dom/biblioteca-front",
      back_url: "https://github.com/Lucas-Amaral-dom/biblioteca-back-",
      demo_url: null,
      sort_order: 1,
    },
    {
      id: "proj-2",
      title: "Projeto Guarda-vidas",
      description:
        "Solução com repositórios de interface e back-end para apoiar o trabalho de guarda-vidas, com API e sistema web.",
      tags: ["API", "Sistema web", "Equipe"],
      front_url: "https://github.com/Lucas-Amaral-dom/projeto_guardavidas",
      back_url: "https://github.com/Lucas-Amaral-dom/projeto-guardavidas-Back",
      demo_url: null,
      sort_order: 2,
    },
    {
      id: "proj-3",
      title: "Portfólio RPG",
      description:
        "Este portfólio: um jogo 2D em pixel art estilo Pokémon onde cada construção guarda uma parte da minha trajetória.",
      tags: ["Kaplay", "React", "Game"],
      front_url: "https://github.com/Lucas-Amaral-dom/portfolio",
      back_url: null,
      demo_url: null,
      sort_order: 3,
    },
  ],
};

export const portfolioQuery = {
  queryKey: ["portfolio"] as const,
  // keeps the city in sync with the admin panel without a page reload
  refetchOnWindowFocus: true,
  refetchInterval: 8000,
  queryFn: async (): Promise<PortfolioData> => {
    try {
      const [contentRes, skillsRes, projectsRes] = await Promise.all([
        supabase.from("site_content").select("key,value"),
        supabase.from("skills").select("*").order("sort_order"),
        supabase.from("projects").select("*").order("sort_order"),
      ]);

      if (contentRes.error || skillsRes.error || projectsRes.error) {
        throw contentRes.error || skillsRes.error || projectsRes.error;
      }

      const content: Record<string, string> = {};
      for (const row of contentRes.data ?? []) content[row.key] = row.value;

      return {
        content:
          Object.keys(content).length > 0
            ? { ...DEFAULT_PORTFOLIO_DATA.content, ...content }
            : DEFAULT_PORTFOLIO_DATA.content,
        skills: (skillsRes.data?.length
          ? skillsRes.data
          : DEFAULT_PORTFOLIO_DATA.skills) as SkillRow[],
        projects: (projectsRes.data?.length
          ? projectsRes.data
          : DEFAULT_PORTFOLIO_DATA.projects) as ProjectRow[],
      };
    } catch (err) {
      console.warn(
        "[portfolioQuery] Error or offline database, falling back to default data:",
        err,
      );
      return DEFAULT_PORTFOLIO_DATA;
    }
  },
};

/* ── dialogue ─────────────────────────────────────────────────────────────── */

export interface DialogueLink {
  label: string;
  href: string;
}

export interface DialoguePage {
  text: string;
  links?: DialogueLink[];
  battleOpponentId?: string;
  battleLabel?: string;
  healAction?: "nurse" | "inn";
  healLabel?: string;
}

export interface Dialogue {
  speaker: string;
  pages: DialoguePage[];
  /** opens the contact form instead of plain pages */
  form?: boolean;
}

function stars(level: number) {
  return "★".repeat(Math.max(0, Math.min(5, level))).padEnd(5, "☆");
}

function safeUrl(value: string | null | undefined) {
  if (!value) return null;
  return /^https?:\/\//i.test(value) ? value : null;
}

export function buildDialogues(data: PortfolioData): Record<string, Dialogue> {
  const c = data.content;
  const t = (key: string) => c[key] ?? "";
  const name = t("playerName") || "Lucas";
  const out: Record<string, Dialogue> = {};

  out["city-sign"] = {
    speaker: "Placa",
    pages: [
      { text: `CIDADE DEV — portfólio de ${name}.` },
      { text: t("tagline") || "" },
      {
        text: "Casa = sobre mim · Lab = skills · Arena = projetos · Loja = contato.",
      },
    ],
  };
  out["city-guide"] = {
    speaker: "Guia",
    pages: [
      { text: `Bem-vindo! Eu cuido da cidade do ${name}.` },
      { text: "Ande até a porta de um prédio e aperte A para entrar." },
      { text: "Visite as 4 construções para juntar todas as insígnias." },
    ],
  };

  out["city-kid"] = {
    speaker: "Garoto do parquinho",
    pages: [
      { text: "Eu adoro o escorregador! Você já entrou na Arena?" },
      { text: `Dizem que o ${name} tem projetos guardados lá dentro.` },
    ],
  };
  out["city-lake"] = {
    speaker: "Moça do lago",
    pages: [
      { text: "O lago é o melhor lugar pra pensar em código." },
      { text: "O Lab do SENAI fica ali em cima, cheio de bancadas de skills." },
    ],
  };
  out["city-oldman"] = {
    speaker: "Senhor da praça",
    pages: [
      { text: "No meu tempo portfólio era papel. Hoje é jogo!" },
      { text: "As portas abrem sozinhas quando você chega perto. Tecnologia..." },
    ],
  };
  out["city-playground"] = {
    speaker: "Parquinho",
    pages: [{ text: "O parquinho da cidade. Pausa merecida entre dois commits." }],
  };
  out["city-bench"] = {
    speaker: "Banco",
    pages: [{ text: "Um banco de praça. Bom lugar pra revisar ideias." }],
  };
  out["city-fountain"] = {
    speaker: "Fonte",
    pages: [{ text: "A fonte da cidade. Jogue uma moeda e faça um deploy sem bugs." }],
  };

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

  /* ── Desert Oasis additions ────────────────────────────────────────────── */

  out["city-traveler"] = {
    speaker: "Viajante do Deserto",
    pages: [
      { text: "Atravessei as dunas até chegar a este Oásis!" },
      { text: "Dizem que o Lucas Amaral construiu esse refúgio unindo código e criatividade." },
      {
        text: "Você já visitou a Casa dele e o Lab do SENAI logo ali acima?\nMeu Flygon quer sentir a emoção de uma boa batalha!",
        battleOpponentId: "flygon",
        battleLabel: "⚔️ Desafiar Viajante (Flygon Nv. 32)!",
      },
    ],
  };

  out["oasis-lake"] = {
    speaker: "Pescadora do Oásis",
    pages: [
      { text: "A água cristalina deste oásis refresca qualquer cansaço de depuração!" },
      {
        text: "A cachoeira vem direto do canyon vermelho. Meu Psyduck adora mergulhar e treinar aqui!",
        battleOpponentId: "psyduck",
        battleLabel: "⚔️ Batalhar com a Pescadora (Psyduck Nv. 20)!",
      },
    ],
  };

  out["oasis-duck"] = {
    speaker: "Pato do Oásis",
    pages: [{ text: "Quack! *mergulha na água fresca e solta pequenas bolhas brilhantes*" }],
  };

  out["oasis-umbrella"] = {
    speaker: "Guarda-sol & Cadeira",
    pages: [
      { text: "Uma espreguiçadeira confortável sob a sombra fresca do guarda-sol listrado." },
      { text: "A brisa do oásis sopra suavemente." },
    ],
  };

  out["oasis-juice"] = {
    speaker: "Barraca de Água de Coco",
    pages: [
      { text: "Água de coco fresca, sucos tropicais e frutas do deserto para recuperar HP!" },
    ],
  };

  out["sparring-ring"] = {
    speaker: "Lutador de Sparring",
    pages: [
      { text: "1, 2! Soco! Esquiva! A disciplina das artes marciais é idêntica à programação!" },
      {
        text: "Erros de compilação são como golpes recebidos: você aprende, refatora a postura e volta mais forte!\nQuer testar seus reflexos agora mesmo?",
        battleOpponentId: "machop",
        battleLabel: "⚔️ Batalhar com Lutador de Sparring!",
      },
    ],
  };

  out["sparring-dummy"] = {
    speaker: "Boneco de Treino",
    pages: [{ text: "Um boneco de madeira com marcas de treino. Testes unitários em ação!" }],
  };

  out["camp-fire"] = {
    speaker: "Fogueira do Acampamento",
    pages: [
      { text: "As chamas crepitam suavemente iluminando as barracas sob o céu do deserto." },
      { text: "Sentar ao redor do fogo renova as ideias para o próximo grande projeto." },
    ],
  };

  out["camp-camper"] = {
    speaker: "Campista Dev",
    pages: [
      { text: "Adoro acampar aqui! O ar noturno do deserto é perfeito para hackathons ao luar." },
      {
        text: "Meu Charmander mantém a fogueira acesa e adora batalhas animadas ao redor do fogo!",
        battleOpponentId: "charmander",
        battleLabel: "⚔️ Batalhar com o Campista Dev (Charmander Nv. 24)!",
      },
    ],
  };

  out["dev-coder"] = {
    speaker: "Desenvolvedor da Oficina",
    pages: [
      { text: "Bem-vindo ao Dev Workshop! Aqui é onde a mágica do código acontece." },
      {
        text: "Compilei um companheiro de código em pixel art: Porygon! Vamos testar nossas habilidades?",
        battleOpponentId: "porygon",
        battleLabel: "⚔️ Desafiar Desenvolvedor (Porygon Nv. 26)!",
      },
    ],
  };

  out["dev-mechanic"] = {
    speaker: "Mecânica de Software",
    pages: [
      {
        text: "Estou otimizando a pipeline de build e garantindo que cada sprite fique com renderização pixel-perfect nítida!",
      },
      {
        text: "Meu Eevee tem código polimórfico e está pronto para qualquer desafio! Aceita?",
        battleOpponentId: "eevee",
        battleLabel: "⚔️ Desafiar Mecânica de Software (Eevee Nv. 25)!",
      },
    ],
  };

  out["dev-dino"] = {
    speaker: "Dino Mascote",
    pages: [
      { text: "Gawrr! *balança a cauda amigavelmente dando suporte moral aos programadores*" },
    ],
  };

  out["dev-terminal"] = {
    speaker: "Bancada com Monitores",
    pages: [
      {
        text: "Telas duplas exibindo editores de código, terminal e painel de controle do Supabase.",
      },
      { text: "npm run build: 0 erros, TypeScript strict ativado!" },
    ],
  };

  out["cactus-monument"] = {
    speaker: "Monumento Antigo",
    pages: [
      {
        text: "Uma imponente escultura em pedra homenageando os pioneiros da tecnologia e treinadores lendários.",
      },
      { text: "Inscrição: 'Que cada linha escrita transforme ideias em realidade.'" },
    ],
  };

  out["cactus-ranger"] = {
    speaker: "Ranger do Santuário",
    pages: [
      { text: "Eu cuido destes cactos saguaro e do monumento sagrado." },
      {
        text: "Mesmo nas condições mais áridas do deserto, a determinação faz a vida florescer!\nTrapinch e eu queremos um duelo nas areias!",
        battleOpponentId: "trapinch",
        battleLabel: "⚔️ Desafiar Ranger do Santuário (Trapinch Nv. 22)!",
      },
    ],
  };

  out["bazaar-merchant"] = {
    speaker: "Mercador do Bazar",
    pages: [
      { text: "Venha conferir nossos suprimentos! Temos poções, frutas raras e contatos diretos!" },
      {
        text: "Precisa de um desenvolvedor dedicado e comunicativo? O Lucas está pronto para novos desafios!",
      },
    ],
  };

  out["arena-trainer"] = {
    speaker: "Mestre da Arena",
    pages: [
      {
        text: "Esta é a arena de combate! Treinamos duro para disputar nos maiores campeonatos de software.",
      },
      {
        text: "Meu Arcanine tem o fogo da paixão por tecnologia! Mostre do que sua equipe é capaz!",
        battleOpponentId: "arcanine",
        battleLabel: "⚔️ Desafiar Mestre da Arena (Arcanine Nv. 28)!",
      },
    ],
  };

  out["arena-bird"] = {
    speaker: "Pássaro de Batalha",
    pages: [{ text: "Piu-piu! *bate as asas animado pronto para o próximo round*" }],
  };

  out["south-exit"] = {
    speaker: "Portal Sul",
    pages: [
      {
        text: "Escadaria de pedra e tochas eternas que levam para a vasta região de Santa Catarina e além.",
      },
    ],
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

  /* ── GBA Pokémon Companions ────────────────────────────────────────────── */
  out["poke-pikachu"] = {
    speaker: "Pikachu",
    pages: [
      { text: "Pika-pika! ⚡ *solta faíscas alegres pelas bochechas vermelhas*" },
      { text: "Pikachu parece muito animado para explorar os projetos com você!" },
    ],
  };

  out["poke-psyduck"] = {
    speaker: "Psyduck",
    pages: [
      {
        text: "Psy... duck? 🌊 *mergulha na água cristalina do oásis e segura a cabeça pensativo*",
      },
      {
        text: "A água fresca parece aliviar as dores de cabeça causadas por bugs complexos!\nQuer desafiar as habilidades psíquicas do Psyduck?",
        battleOpponentId: "psyduck",
        battleLabel: "Desafiar Psyduck",
      },
    ],
  };

  out["poke-charmander"] = {
    speaker: "Charmander",
    pages: [
      { text: "Char-char! 🔥 *a chama na ponta da cauda queima forte e aquece o acampamento*" },
      { text: "Charmander está mantendo a fogueira dev acesa durante toda a noite!" },
    ],
  };

  out["poke-machop"] = {
    speaker: "Machop",
    pages: [
      { text: "Chop! Machop! 🥊 *faz flexões e socos rápidos no ar em perfeita sincronia*" },
      {
        text: "Treinando pesado para refatorar qualquer legado e vencer testes rigorosos!\nMachop quer testar sua força em combate!",
        battleOpponentId: "machop",
        battleLabel: "Treinar com Machop",
      },
    ],
  };

  out["poke-trapinch"] = {
    speaker: "Trapinch",
    pages: [
      { text: "Pinch-pinch! 🏜️ *cava um pequeno buraco circular na areia dourada do deserto*" },
      {
        text: "Nativo das dunas do Desert Oasis, perfeitamente adaptado ao clima seco!\nTrapinch quer disputar uma batalha nas areias!",
        battleOpponentId: "trapinch",
        battleLabel: "Batalhar com Trapinch",
      },
    ],
  };

  out["poke-flygon"] = {
    speaker: "Flygon (Espírito do Deserto)",
    pages: [
      {
        text: "Goooon! ✨ *as asas vermelhas batem criando uma melodia mística como canto de areia*",
      },
      {
        text: "Conhecido como o Guardião do Monumento do Deserto, abençoa os desenvolvedores audaciosos!\nVocê se atreve a desafiar o poderoso Guardião do Deserto?",
        battleOpponentId: "flygon",
        battleLabel: "Desafiar Guardião Flygon",
      },
    ],
  };

  out["poke-chansey"] = {
    speaker: "Chansey",
    pages: [
      { text: "Chanseeeey! ❤️ *estende um ovo de felicidade com um sorriso caloroso*" },
      { text: "Chansey restaura todo o estresse e cansaço mental dos programadores!" },
    ],
  };

  out["poke-bulbasaur"] = {
    speaker: "Bulbasaur",
    pages: [
      { text: "Bulba-saur! 🌿 *o broto em suas costas absorve a luz dos monitores de pesquisa*" },
      { text: "Ajudando os pesquisadores do SENAI na germinação de novas tecnologias!" },
    ],
  };

  out["poke-porygon"] = {
    speaker: "Porygon",
    pages: [
      { text: "Pory-gon! 👾 *converte dados em pulsos luminosos entre as telas de código*" },
      { text: "Completamente feito de polígonos e código puro. O mascote ideal da Dev Workshop!" },
    ],
  };

  out["poke-eevee"] = {
    speaker: "Eevee",
    pages: [
      { text: "Eev-vee! 🐾 *se espreguiça preguiçosamente no tapete macio diante da lareira*" },
      {
        text: "Eevee possui infinitas possibilidades de evolução, assim como a carreira de um dev!",
      },
    ],
  };

  out["poke-arcanine"] = {
    speaker: "Arcanine",
    pages: [
      { text: "ROAAAR! 🦁🔥 *solta um rugido majestoso ecoando pela Arena de Projetos*" },
      {
        text: "Símbolo de liderança, lealdade e bravura técnica diante dos maiores desafios!\nO lendário Arcanine está pronto para defender a Arena!",
        battleOpponentId: "arcanine",
        battleLabel: "Batalhar com Arcanine da Arena",
      },
    ],
  };

  return out;
}
