export const MAP_SIZE = 60;
export const WALL_HEIGHT = 2;

export const PLAYER_SPEED = 0.15;
export const PLAYER_ROTATION_SPEED = 0.04;
export const TURRET_ROTATION_SPEED = 0.08;
export const FIRE_RATE = 500; // ms
export const PROJECTILE_SPEED = 0.6;
export const PROJECTILE_RADIUS = 0.3;

export const ENEMY_SPEED = 0.08;
export const ENEMY_FIRE_RATE = 2000;
export const ENEMY_DETECTION_RANGE = 25;

export const TANK_RADIUS = 1.2;
export const TANK_BODY_SIZE = { x: 2, y: 0.8, z: 2.5 };
export const TANK_TURRET_SIZE = { x: 1.2, y: 0.6, z: 1.2 };

export const COLORS = {
  ground: '#1a1a1a',
  grid: '#333333',
  player: '#00ff99',
  playerTurret: '#00cc7a',
  enemy: '#ff3333',
  enemyTurret: '#cc0000',
  obstacle: '#444466',
  bullet: '#ffff00',
};

// Simple input keys map
export const KEYS = {
  FORWARD: ['w', 'arrowup'],
  BACKWARD: ['s', 'arrowdown'],
  LEFT: ['a', 'arrowleft'],
  RIGHT: ['d', 'arrowright'],
  SHOOT: [' ', 'enter'], // Space or Enter
};