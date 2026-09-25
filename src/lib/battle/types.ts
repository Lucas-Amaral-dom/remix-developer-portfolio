export interface Move {
  name: string;
  type: string;
  power: number;
  pp: number;
  maxPp: number;
  description: string;
}

export interface PlayerPokemon {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  exp: number;
  maxExp: number;
  sprite: string;
  backSprite?: string;
  type: string;
  moves: Move[];
}

export interface OpponentMember {
  id: string;
  name: string;
  level: number;
  maxHp: number;
  sprite: string;
  type: string;
  moves: { name: string; type: string; power: number }[];
  rewardExp: number;
}

export interface Opponent {
  id: string;
  name: string;
  trainer: string;
  trainerAvatar?: string;
  level: number;
  maxHp: number;
  sprite: string;
  type: string;
  moves: { name: string; type: string; power: number }[];
  rewardExp: number;
  team?: OpponentMember[];
}

export interface BattleOpponent extends Opponent {}
