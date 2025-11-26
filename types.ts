export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Entity {
  id: string;
  position: Vector3;
  rotation: number; // Y-axis rotation in radians
  radius: number;
  active: boolean;
}

export interface Tank extends Entity {
  turretRotation: number;
  health: number;
  maxHealth: number;
  lastShotTime: number;
  color: string;
  isPlayer: boolean;
  targetPosition?: Vector3; // For AI
}

export interface Projectile extends Entity {
  velocity: Vector3;
  ownerId: string;
  damage: number;
}

export interface Particle {
  id: string;
  position: Vector3;
  velocity: Vector3;
  life: number; // 0 to 1
  color: string;
  size: number;
}

export interface Obstacle {
  id: string;
  position: Vector3;
  size: Vector3;
  color: string;
}

export enum GameState {
  MENU = 'MENU',
  LOADING_MISSION = 'LOADING_MISSION',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export interface MissionData {
  title: string;
  briefing: string;
  targetCount: number;
}