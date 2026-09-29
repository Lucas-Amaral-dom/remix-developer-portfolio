# Lucas Amaral — Interactive Developer Portfolio

> **Portfolio Quest · Desert Oasis** — portfólio web apresentado como uma experiência 2D explorável em pixel art.

O visitante pode caminhar pela cidade, conversar com NPCs, entrar em construções, conhecer tecnologias e projetos e iniciar batalhas demonstrativas.

## 🎮 O que a V9 demonstra

- Overworld 2D com KAPLAY, colisão, câmera e movimentação responsiva.
- Sprites de treinadores de overworld preservados e vinculados aos diálogos.
- Retrato de batalha local na interface de diálogo, mantendo a identidade do treinador.
- Portas e transições entre cidade e interiores.
- Lago, praça, áreas de treino e pontos de interesse.
- Interiores com layouts diferentes para as áreas do portfólio.
- Batalha Pokémon demonstrativa.
- Interface adaptada a desktop e telas menores.

## ⚡ Refinamentos de desempenho

A V9 mantém a arquitetura existente e concentra o trabalho de cada frame no que precisa de resposta imediata:

- IA de NPCs e Pokémon atualizada em frequência controlada;
- depth sorting desacoplado da atualização visual de cada frame;
- descoberta de prompts/interações limitada a uma frequência adequada;
- animações decorativas agrupadas em um loop visual compartilhado;
- remoção de uma segunda instância visual dos NPCs que podia causar duplicação/halo;
- menos treinadores redundantes na cidade;
- transições de cena mantendo o estado centralizado.

## 🛠️ Stack

- React 19
- TypeScript
- Vite
- KAPLAY
- Tailwind CSS
- Supabase (opcional)
- PokeAPI / dados de Pokémon

## 🚀 Desenvolvimento local

```bash
npm install
npm run dev
```

Validação:

```bash
npm run lint
npm run build
```

## 📁 Estrutura

- `src/game/` — mundo, engine e transições.
- `src/components/game/` — shell, batalha e telas do jogo.
- `src/components/pixel/` — diálogos e interface pixel.
- `src/assets/` — construções, Pokémon, treinadores e imagens dos projetos.
- `src/lib/` — dados de portfólio, batalha e integrações.

## 📌 Projetos

A experiência apresenta projetos como Biblioteca, Guarda-vidas e o próprio Portfólio RPG, permitindo transformar cada construção em uma área de apresentação técnica.

## 🧩 Créditos

Consulte [`CREDITS.md`](./CREDITS.md) antes de reutilizar assets.

## 🎤 Como apresentar

Uma demonstração curta pode seguir: **cidade → NPC → diálogo/retrato → porta → interior → Arena de Projetos → batalha**.
