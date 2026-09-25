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
  /** Visual metadata stored in Supabase after migration. */
  technologies: string[];
  image_url: string | null;
}

export interface PortfolioData {
  content: Record<string, string>;
  skills: SkillRow[];
  projects: ProjectRow[];
}

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
