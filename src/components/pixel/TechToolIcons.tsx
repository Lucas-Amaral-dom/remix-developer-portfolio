import React from "react";

export interface ToolDef {
  id: string;
  name: string;
  category: "Frontend" | "Backend" | "Database" | "Game & Creative" | "Tooling";
  color: string;
  bgColor: string;
  borderColor: string;
  capabilities: string[];
  deliverables: string;
  icon: React.ReactNode;
}

export const CODING_TOOLS: ToolDef[] = [
  {
    id: "react",
    name: "React 18",
    category: "Frontend",
    color: "#00d8ff",
    bgColor: "rgba(0, 216, 255, 0.08)",
    borderColor: "rgba(0, 216, 255, 0.4)",
    deliverables:
      "SPAs modernas, dashboards interativos, componentes reutilizáveis e interfaces acessíveis.",
    capabilities: [
      "Desenvolvimento de Single Page Applications completas e responsivas",
      "Arquitetura modular orientada a componentes reutilizáveis",
      "Gestão de estado reativo e hooks customizados (useMemo, useCallback, useRef)",
      "Formulários controlados com validação assíncrona e feedback em tempo real",
    ],
    icon: (
      <svg viewBox="-11.5 -10.23174 23 20.46348" className="w-5 h-5" fill="currentColor">
        <circle cx="0" cy="0" r="2.05" fill="#00d8ff" />
        <g stroke="#00d8ff" strokeWidth="1" fill="none">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    ),
  },
  {
    id: "typescript",
    name: "TypeScript",
    category: "Frontend",
    color: "#3178c6",
    bgColor: "rgba(49, 120, 198, 0.08)",
    borderColor: "rgba(49, 120, 198, 0.4)",
    deliverables: "Código tipado e autodocumentado com zero surpresas em runtime.",
    capabilities: [
      "Tipagem estrita de ponta a ponta (strict mode habilitado)",
      "Modelagem de interfaces, tipos utilitários e contratos de API consistentes",
      "Prevenção ativa de bugs em tempo de compilação antes de ir para produção",
      "Refatoração segura em bases de código de qualquer escala",
    ],
    icon: (
      <svg viewBox="0 0 128 128" className="w-5 h-5">
        <rect width="128" height="128" rx="8" fill="#3178c6" />
        <path
          d="M72.2 60.5h16.2v4.8h-5.4v39.1h-5.4V65.3h-5.4v-4.8zm23.8 28.3c1.6 2.4 3.8 3.7 6.6 3.7 2.1 0 3.8-.7 4.9-2.1 1.1-1.4 1.7-3.1 1.7-5.1 0-2.3-.7-4.1-2.1-5.6s-3.7-3.2-6.8-5.1c-3.6-2.2-6.2-4.5-7.7-6.9-1.5-2.4-2.3-5.2-2.3-8.3 0-4.1 1.4-7.4 4.3-9.9 2.9-2.5 6.6-3.8 11.2-3.8 3.8 0 7.1 1 9.9 2.9 2.8 1.9 4.7 4.8 5.7 8.5l-5.1 2.2c-.8-2.5-2.1-4.4-3.9-5.6-1.8-1.2-4-1.8-6.6-1.8-2.9 0-5.1.7-6.7 2.2-1.6 1.5-2.4 3.4-2.4 5.7 0 1.9.6 3.5 1.9 4.8 1.3 1.3 3.4 2.7 6.4 4.3 3.9 2.1 6.8 4.4 8.7 6.9 1.9 2.5 2.8 5.4 2.8 8.9 0 4.3-1.5 7.8-4.5 10.4-3 2.6-7 4-12 4-4.5 0-8.3-1.2-11.4-3.6-3.1-2.4-5.2-5.7-6.2-9.9l5.1-2.2z"
          fill="#ffffff"
        />
      </svg>
    ),
  },
  {
    id: "tailwind",
    name: "Tailwind CSS",
    category: "Frontend",
    color: "#38bdf8",
    bgColor: "rgba(56, 189, 248, 0.08)",
    borderColor: "rgba(56, 189, 248, 0.4)",
    deliverables:
      "Design systems consistentes, layouts 100% responsivos e estética pixel art autoral.",
    capabilities: [
      "Layouts fluidos e adaptativos (mobile-first, tablet e desktop)",
      "Criação de paletas consistentes, tipografia balanceada e espaçamentos rítmicos",
      "Estilizações temáticas personalizadas (pixel-perfect, dark mode, painéis RPG)",
      "Zero bundle bloat utilizando utilitários modernos sem overhead de CSS",
    ],
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#38bdf8">
        <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.336 6.182 14.975 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.336 13.382 8.975 12 6.001 12z" />
      </svg>
    ),
  },
  {
    id: "vite",
    name: "Vite",
    category: "Tooling",
    color: "#bd34fe",
    bgColor: "rgba(189, 52, 254, 0.08)",
    borderColor: "rgba(189, 52, 254, 0.4)",
    deliverables: "Pipeline de compilação ultrarrápida, builds enxutos e desenvolvimento ágil.",
    capabilities: [
      "Configuração de pipelines modernas de build e bundling otimizado",
      "Hot Module Replacement instantâneo com zero lentidão",
      "Gestão de aliases de importação (@/) e empacotamento de assets estáticos",
      "Otimização de bundles de produção gerando código minificado e veloz",
    ],
    icon: (
      <svg viewBox="0 0 32 32" className="w-5 h-5">
        <path d="M29.5 5.5L16.5 28.5L3.5 5.5L16.5 12.5L29.5 5.5Z" fill="url(#viteGradient)" />
        <path d="M17.5 3L8 16.5H16L14.5 26L24 12.5H16L17.5 3Z" fill="#ffc700" />
        <defs>
          <linearGradient id="viteGradient" x1="3.5" y1="5.5" x2="29.5" y2="28.5">
            <stop stopColor="#41d1ff" />
            <stop offset="1" stopColor="#bd34fe" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: "supabase",
    name: "Supabase & PostgreSQL",
    category: "Database",
    color: "#3ecf8e",
    bgColor: "rgba(62, 207, 142, 0.08)",
    borderColor: "rgba(62, 207, 142, 0.4)",
    deliverables:
      "Persistência em nuvem segura, modelagem relacional e sincronização em tempo real.",
    capabilities: [
      "Modelagem relacional de tabelas, chaves primárias e relacionamentos",
      "Segurança com políticas Row Level Security (RLS) granulares",
      "Operações CRUD seguras com biblioteca tipada (@supabase/supabase-js)",
      "Sincronização reativa de dados sem necessidade de recarregar a página",
    ],
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#3ecf8e">
        <path d="M13.35 22.8c-.85 1.05-2.55.45-2.55-.9V13.5H2.4c-1.35 0-2.1-1.65-1.2-2.7L10.65 1.2c.85-1.05 2.55-.45 2.55.9v8.4h8.4c1.35 0 2.1 1.65 1.2 2.7L13.35 22.8z" />
      </svg>
    ),
  },
  {
    id: "node",
    name: "Node.js & REST APIs",
    category: "Backend",
    color: "#68a063",
    bgColor: "rgba(104, 160, 99, 0.08)",
    borderColor: "rgba(104, 160, 99, 0.4)",
    deliverables: "Serviços de back-end robustos, endpoints RESTful e tratamento centralizado.",
    capabilities: [
      "Construção de APIs RESTful estruturadas no padrão arquitetural MVC",
      "Integração com bancos de dados relacionais para consultas eficientes",
      "Tratamento global de erros, logs padronizados e validação de payloads",
      "Divisão clara de responsabilidades entre front-end e serviços de dados",
    ],
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#68a063">
        <path d="M12 2l9 5.2v10.4L12 22.8 3 17.6V7.2L12 2zm0 2.3L5 8.3v7.4l7 4 7-4V8.3l-7-4zM10.8 9.5h2.4v5h-2.4v-5z" />
      </svg>
    ),
  },
  {
    id: "git",
    name: "Git & GitHub",
    category: "Tooling",
    color: "#f05032",
    bgColor: "rgba(240, 80, 50, 0.08)",
    borderColor: "rgba(240, 80, 50, 0.4)",
    deliverables: "Histórico limpo, versionamento profissional e documentação clara para equipes.",
    capabilities: [
      "Controle de versão profissional com commits atômicos e semânticos",
      "Estratégia de branches e resolução técnica de merge conflicts",
      "Publicação de repositórios estruturados com README e instruções claras de deploy",
      "Colaboração ágil em equipes multidisciplinares",
    ],
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#f05032">
        <path d="M2.6 10.59L8.38 4.8a2.53 2.53 0 0 1 3.58 0l2.36 2.36-2.58 2.58a1.9 1.9 0 0 0-2.33.32 1.9 1.9 0 0 0-.32 2.33L6.7 14.8a1.9 1.9 0 1 0 1.34 1.34l2.35-2.35a1.9 1.9 0 0 0 2.22-.38 1.9 1.9 0 0 0 .38-2.22l2.54-2.54 5.87 5.87a2.53 2.53 0 0 1 0 3.58l-5.78 5.78a2.53 2.53 0 0 1-3.58 0L2.6 14.17a2.53 2.53 0 0 1 0-3.58z" />
      </svg>
    ),
  },
  {
    id: "kaplay",
    name: "KAPLAY & Canvas 2D",
    category: "Game & Creative",
    color: "#ff6b6b",
    bgColor: "rgba(255, 107, 107, 0.08)",
    borderColor: "rgba(255, 107, 107, 0.4)",
    deliverables: "Experiências web imersivas, jogos 2D interativos e renderização gráfica.",
    capabilities: [
      "Renderização pixel-perfect com escala nítida sem anti-aliasing borrado",
      "Sistemas de colisão espacial por grid e detecção de sobreposição 2.5D",
      "Animação baseada em spritesheets GBA e máquinas de estado de personagens",
      "Transições dinâmicas de cena (íris, veneziana, diamantes) e áudio chiptune",
    ],
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#ff6b6b">
        <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H9v2H7v-2H5v-2h2V9h2v2h2v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3-3c-.83 0-1.5-.67-1.5-1.5S17.67 9 18.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
      </svg>
    ),
  },
];
