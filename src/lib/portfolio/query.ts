import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { PROJECT_TECHNOLOGIES } from "@/lib/github-profile-data";
import type { PortfolioData, ProjectRow, SkillRow } from "./types";

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
  { key: "githubStackIntro", label: "Intro da stack do GitHub", multiline: true },
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
    homeFocus: "Back-end e desenvolvimento Web",
    homeMode: "Aprender, construir e evoluir",
    aboutIntro:
      "Olá! Sou Lucas, desenvolvedor fullstack em ascensão e estudante de Desenvolvimento de Sistemas no SENAI Criciúma. Gosto de resolver problemas, encarar desafios lógicos e transformar ideias em código.",
    aboutStory:
      "Estou construindo minha base em programação, desenvolvimento Web, APIs, SQL e boas práticas de código. Nos meus projetos públicos, venho trabalhando com front-end, back-end, banco de dados e integração de sistemas.",
    aboutSeeking:
      "Meu objetivo é concluir o curso, me aprimorar continuamente e alavancar minha carreira na tecnologia, buscando estágio ou primeira oportunidade como desenvolvedor.",
    aboutHobby:
      "Fora do código: jogos, pixel art e aprender coisas novas construindo pequenos projetos.",
    skillsIntro: "Competências e tecnologias apresentadas no meu GitHub, separando base de programação, web, backend, dados e ferramentas.",
    githubStackIntro: "Tecnologias e ferramentas que aparecem no meu README do GitHub e que fazem parte da minha jornada de desenvolvimento.",
    projectsIntro: "Projetos do meu GitHub mostrando front-end, back-end e banco de dados.",
    contactIntro: "Vamos conversar sobre estágio, projetos ou colaboração?",
    contactEmail: "lucasamaraldefarias144@gmail.com",
    contactLinkedin: "",
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
      technologies: ["JavaScript", "React", "HTML5", "CSS3", "Java", "MySQL"],
      image_url: null,
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
      technologies: ["React", "JavaScript", "HTML5", "CSS3", "Java", "MySQL", "Spring Boot", "Tailwind CSS"],
      image_url: null,
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
      technologies: ["React", "TypeScript", "KAPLAY", "Vite", "Supabase", "GitHub"],
      image_url: null,
    },
  ],
};

export const portfolioQuery = {
  queryKey: ["portfolio"] as const,
  // keeps the city in sync with the admin panel without a page reload
  refetchOnWindowFocus: true,
  refetchInterval: 8000,
  queryFn: async (): Promise<PortfolioData> => {
    // Preview/development environments may not provide Supabase credentials.
    // Do not hammer a placeholder endpoint every few seconds: the local defaults
    // are intentionally complete enough to render the portfolio.
    if (!isSupabaseConfigured()) {
      return DEFAULT_PORTFOLIO_DATA;
    }

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

      const rawProjects = projectsRes.data?.length
        ? projectsRes.data
        : DEFAULT_PORTFOLIO_DATA.projects;
      const projects = (rawProjects as Array<Partial<ProjectRow> & { id: string }>).map((project) => ({
        ...project,
        technologies:
          Array.isArray(project.technologies) && project.technologies.length > 0
            ? project.technologies
            : PROJECT_TECHNOLOGIES[project.title ?? ""] ?? project.tags ?? [],
        image_url: project.image_url ?? null,
      })) as ProjectRow[];

      return {
        content:
          Object.keys(content).length > 0
            ? { ...DEFAULT_PORTFOLIO_DATA.content, ...content }
            : DEFAULT_PORTFOLIO_DATA.content,
        skills: (skillsRes.data?.length
          ? skillsRes.data
          : DEFAULT_PORTFOLIO_DATA.skills) as SkillRow[],
        projects,
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
