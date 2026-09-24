export interface GithubTech {
  id: string;
  name: string;
  category: "Frontend" | "Backend" | "Database" | "Tooling";
  badgeUrl: string;
  iconName: string;
}

/**
 * Tecnologias exibidas no README do perfil do GitHub de Lucas Amaral.
 * As URLs dos badges seguem os mesmos símbolos/identidade visual do README.
 */
export const GITHUB_PROFILE_TECHS: GithubTech[] = [
  { id:"java", name:"Java", category:"Backend", badgeUrl:"https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white", iconName:"openjdk" },
  { id:"javascript", name:"JavaScript", category:"Frontend", badgeUrl:"https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black", iconName:"javascript" },
  { id:"react", name:"React", category:"Frontend", badgeUrl:"https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB", iconName:"react" },
  { id:"html5", name:"HTML5", category:"Frontend", badgeUrl:"https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white", iconName:"html5" },
  { id:"css3", name:"CSS3", category:"Frontend", badgeUrl:"https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white", iconName:"css3" },
  { id:"mysql", name:"MySQL", category:"Database", badgeUrl:"https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white", iconName:"mysql" },
  { id:"git", name:"Git", category:"Tooling", badgeUrl:"https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white", iconName:"git" },
  { id:"github", name:"GitHub", category:"Tooling", badgeUrl:"https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white", iconName:"github" },
];

export const PROJECT_TECHNOLOGIES: Record<string, string[]> = {
  Biblioteca: ["JavaScript","React","HTML5","CSS3","Java","MySQL"],
  "Projeto Guarda-vidas": ["React","JavaScript","HTML5","CSS3","Java","MySQL","Spring Boot","Tailwind CSS"],
  "Portfólio RPG": ["React","TypeScript","KAPLAY","Vite","Supabase","GitHub"],
};

export const PROJECT_REPOSITORIES = [
  { key:"Biblioteca", repository:"Lucas-Amaral-dom/biblioteca-front", relatedRepository:"Lucas-Amaral-dom/biblioteca-back-" },
  { key:"Projeto Guarda-vidas", repository:"Lucas-Amaral-dom/projeto_guardavidas", relatedRepository:"Lucas-Amaral-dom/projeto-guardavidas-Back" },
  { key:"Portfólio RPG", repository:"Lucas-Amaral-dom/portfolio", relatedRepository:null },
] as const;
