import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Euler, Quaternion } from 'three';
import { TankModel } from './TankModel';
import { 
  GameState, 
  Tank, 
  Projectile, 
  Obstacle, 
  Particle,
  MissionData
} from '../types';
import { 
  MAP_SIZE, 
  PLAYER_SPEED, 
  PLAYER_ROTATION_SPEED, 
  TURRET_ROTATION_SPEED,
  FIRE_RATE,
  PROJECTILE_SPEED,
  TANK_RADIUS,
  KEYS,
  COLORS,
  WALL_HEIGHT,
  ENEMY_SPEED,
  ENEMY_DETECTION_RANGE,
  ENEMY_FIRE_RATE,
  PROJECTILE_RADIUS
} from '../constants';

interface GameWorldProps {
  gameState: GameState;
  missionData: MissionData | null;
  onGameOver: (won: boolean, score: number) => void;
  updateHUD: (hp: number, enemiesLeft: number) => void;
}

export const GameWorld: React.FC<GameWorldProps> = ({ 
  gameState, 
  missionData, 
  onGameOver,
  updateHUD 
}) => {
  const { camera } = useThree();
  
  // Game State Refs (Mutable for performance loop)
  const playerRef = useRef<Tank>({
    id: 'player',
    position: { x: 0, y: 0, z: 20 },
    rotation: 0,
    turretRotation: 0,
    radius: TANK_RADIUS,
    active: true,
    health: 100,
    maxHealth: 100,
    lastShotTime: 0,
    color: COLORS.player,
    isPlayer: true
  });

  const enemiesRef = useRef<Tank[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  
  // Input State
  const inputRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    shoot: false,
    mouseX: 0,
    mouseY: 0
  });

  // React State for rendering (syncs with Refs)
  const [renderEnemies, setRenderEnemies] = useState<Tank[]>([]);
  const [renderProjectiles, setRenderProjectiles] = useState<Projectile[]>([]);
  const [renderParticles, setRenderParticles] = useState<Particle[]>([]);
  const [renderObstacles, setRenderObstacles] = useState<Obstacle[]>([]);
  
  // Force update trigger to re-render React components
  const [tick, setTick] = useState(0);

  // Initialize Level
  useEffect(() => {
    if (gameState === GameState.PLAYING && missionData) {
      // Reset Player
      playerRef.current = {
        ...playerRef.current,
        position: { x: 0, y: 0, z: 20 },
        rotation: 0,
        turretRotation: 0,
        health: 100,
        active: true,
        lastShotTime: 0
      };

      // Generate Obstacles
      const newObstacles: Obstacle[] = [];
      for (let i = 0; i < 15; i++) {
        const sizeX = 2 + Math.random() * 4;
        const sizeZ = 2 + Math.random() * 4;
        const x = (Math.random() - 0.5) * (MAP_SIZE - 10);
        const z = (Math.random() - 0.5) * (MAP_SIZE - 10);
        
        // Keep clear of center (spawn area)
        if (Math.abs(x) < 5 && Math.abs(z) > 15) continue;
        
        newObstacles.push({
          id: `obs-${i}`,
          position: { x, y: WALL_HEIGHT / 2, z },
          size: { x: sizeX, y: WALL_HEIGHT, z: sizeZ },
          color: COLORS.obstacle
        });
      }
      obstaclesRef.current = newObstacles;
      setRenderObstacles(newObstacles);

      // Generate Enemies
      const newEnemies: Tank[] = [];
      const count = missionData.targetCount;
      for (let i = 0; i < count; i++) {
        let ex, ez;
        do {
          ex = (Math.random() - 0.5) * (MAP_SIZE - 5);
          ez = (Math.random() - 0.5) * (MAP_SIZE - 25); // Spawn mostly on the other side
        } while (Math.abs(ez - 20) < 10); // Don't spawn too close to player start

        newEnemies.push({
          id: `enemy-${i}`,
          position: { x: ex, y: 0, z: ez },
          rotation: Math.PI, // Face player roughly
          turretRotation: Math.PI,
          radius: TANK_RADIUS,
          active: true,
          health: 50,
          maxHealth: 50,
          lastShotTime: 0,
          color: COLORS.enemy,
          isPlayer: false
        });
      }
      enemiesRef.current = newEnemies;
      setRenderEnemies(newEnemies);
      projectilesRef.current = [];
      particlesRef.current = [];
    }
  }, [gameState, missionData]);

  // Input Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (KEYS.FORWARD.includes(key)) inputRef.current.forward = true;
      if (KEYS.BACKWARD.includes(key)) inputRef.current.backward = true;
      if (KEYS.LEFT.includes(key)) inputRef.current.left = true;
      if (KEYS.RIGHT.includes(key)) inputRef.current.right = true;
      if (KEYS.SHOOT.includes(key)) inputRef.current.shoot = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (KEYS.FORWARD.includes(key)) inputRef.current.forward = false;
      if (KEYS.BACKWARD.includes(key)) inputRef.current.backward = false;
      if (KEYS.LEFT.includes(key)) inputRef.current.left = false;
      if (KEYS.RIGHT.includes(key)) inputRef.current.right = false;
      if (KEYS.SHOOT.includes(key)) inputRef.current.shoot = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Convert screen coordinates to normalized device coordinates (-1 to +1)
      inputRef.current.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      inputRef.current.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleMouseDown = () => { inputRef.current.shoot = true; };
    const handleMouseUp = () => { inputRef.current.shoot = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Helper: Collision Check
  const checkCollision = (pos: Vector3, radius: number, excludeId: string): boolean => {
    // Check Map Bounds
    const halfSize = MAP_SIZE / 2;
    if (pos.x < -halfSize || pos.x > halfSize || pos.z < -halfSize || pos.z > halfSize) return true;

    // Check Obstacles (AABB vs Circle approx)
    for (const obs of obstaclesRef.current) {
      const halfX = obs.size.x / 2 + radius;
      const halfZ = obs.size.z / 2 + radius;
      if (
        pos.x > obs.position.x - halfX &&
        pos.x < obs.position.x + halfX &&
        pos.z > obs.position.z - halfZ &&
        pos.z < obs.position.z + halfZ
      ) {
        return true;
      }
    }

    // Check Tanks
    if (excludeId !== 'player' && playerRef.current.active) {
       const dx = pos.x - playerRef.current.position.x;
       const dz = pos.z - playerRef.current.position.z;
       if (Math.sqrt(dx*dx + dz*dz) < radius + playerRef.current.radius) return true;
    }

    for (const enemy of enemiesRef.current) {
      if (!enemy.active || enemy.id === excludeId) continue;
      const dx = pos.x - enemy.position.x;
      const dz = pos.z - enemy.position.z;
      if (Math.sqrt(dx*dx + dz*dz) < radius + enemy.radius) return true;
    }

    return false;
  };

  const spawnExplosion = (pos: Vector3, color: string) => {
    for (let i = 0; i < 8; i++) {
      particlesRef.current.push({
        id: Math.random().toString(),
        position: { ...pos },
        velocity: { 
          x: (Math.random() - 0.5) * 0.5, 
          y: Math.random() * 0.5, 
          z: (Math.random() - 0.5) * 0.5 
        },
        life: 1.0,
        color: color,
        size: 0.3 + Math.random() * 0.3
      });
    }
  };

  // Main Game Loop
  useFrame((state, delta) => {
    if (gameState !== GameState.PLAYING) return;

    const player = playerRef.current;
    if (!player.active) return;

    // --- 1. Player Movement ---
    if (inputRef.current.left) player.rotation += PLAYER_ROTATION_SPEED;
    if (inputRef.current.right) player.rotation -= PLAYER_ROTATION_SPEED;

    const moveSpeed = (inputRef.current.forward ? 1 : 0) - (inputRef.current.backward ? 1 : 0);
    if (moveSpeed !== 0) {
      const newX = player.position.x + Math.sin(player.rotation) * PLAYER_SPEED * moveSpeed;
      const newZ = player.position.z + Math.cos(player.rotation) * PLAYER_SPEED * moveSpeed;
      
      if (!checkCollision({ x: newX, y: 0, z: newZ }, player.radius, player.id)) {
        player.position.x = newX;
        player.position.z = newZ;
      }
    }

    // --- 2. Player Turret Aiming (Raycaster logic simplified for top-down-ish) ---
    // Calculate angle from tank to mouse projected on ground
    // Use simple math instead of full raycaster for performance in this demo
    const vector = new Vector3(inputRef.current.mouseX, inputRef.current.mouseY, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.y / dir.y;
    const posOnGround = camera.position.clone().add(dir.multiplyScalar(distance));
    
    const dx = posOnGround.x - player.position.x;
    const dz = posOnGround.z - player.position.z;
    player.turretRotation = Math.atan2(dx, dz);

    // --- 3. Player Shooting ---
    const now = Date.now();
    if (inputRef.current.shoot && now - player.lastShotTime > FIRE_RATE) {
      player.lastShotTime = now;
      const bx = player.position.x + Math.sin(player.turretRotation) * 2;
      const bz = player.position.z + Math.cos(player.turretRotation) * 2;
      projectilesRef.current.push({
        id: `bullet-${now}`,
        position: { x: bx, y: 1.5, z: bz },
        rotation: 0,
        radius: PROJECTILE_RADIUS,
        active: true,
        velocity: { 
          x: Math.sin(player.turretRotation) * PROJECTILE_SPEED, 
          y: 0, 
          z: Math.cos(player.turretRotation) * PROJECTILE_SPEED 
        },
        ownerId: player.id,
        damage: 25
      });
    }

    // --- 4. Enemy AI ---
    enemiesRef.current.forEach(enemy => {
      if (!enemy.active) return;

      const distToPlayer = Math.sqrt(
        Math.pow(enemy.position.x - player.position.x, 2) + 
        Math.pow(enemy.position.z - player.position.z, 2)
      );

      // Aim at player
      const angleToPlayer = Math.atan2(
        player.position.x - enemy.position.x, 
        player.position.z - enemy.position.z
      );
      
      // Rotate turret slowly towards player
      let angleDiff = angleToPlayer - enemy.turretRotation;
      // Normalize angle
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      enemy.turretRotation += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), TURRET_ROTATION_SPEED);

      // Move if far
      if (distToPlayer > 10 && distToPlayer < ENEMY_DETECTION_RANGE) {
        // Also rotate body
        let bodyDiff = angleToPlayer - enemy.rotation;
        while (bodyDiff > Math.PI) bodyDiff -= Math.PI * 2;
        while (bodyDiff < -Math.PI) bodyDiff += Math.PI * 2;
        enemy.rotation += Math.sign(bodyDiff) * Math.min(Math.abs(bodyDiff), PLAYER_ROTATION_SPEED);

        const nextX = enemy.position.x + Math.sin(enemy.rotation) * ENEMY_SPEED;
        const nextZ = enemy.position.z + Math.cos(enemy.rotation) * ENEMY_SPEED;
        
        if (!checkCollision({ x: nextX, y: 0, z: nextZ }, enemy.radius, enemy.id)) {
          enemy.position.x = nextX;
          enemy.position.z = nextZ;
        }
      }

      // Shoot
      if (distToPlayer < ENEMY_DETECTION_RANGE && now - enemy.lastShotTime > ENEMY_FIRE_RATE) {
         // Check line of sight (simple angle check)
         if (Math.abs(angleDiff) < 0.2) {
           enemy.lastShotTime = now + Math.random() * 500; // Add jitter
           const bx = enemy.position.x + Math.sin(enemy.turretRotation) * 2;
           const bz = enemy.position.z + Math.cos(enemy.turretRotation) * 2;
           projectilesRef.current.push({
             id: `ebullet-${enemy.id}-${now}`,
             position: { x: bx, y: 1.5, z: bz },
             rotation: 0,
             radius: PROJECTILE_RADIUS,
             active: true,
             velocity: { 
               x: Math.sin(enemy.turretRotation) * PROJECTILE_SPEED, 
               y: 0, 
               z: Math.cos(enemy.turretRotation) * PROJECTILE_SPEED 
             },
             ownerId: enemy.id,
             damage: 10
           });
         }
      }
    });

    // --- 5. Projectiles & Physics ---
    projectilesRef.current.forEach(proj => {
      if (!proj.active) return;
      proj.position.x += proj.velocity.x;
      proj.position.z += proj.velocity.z;

      // Wall Collision
      if (checkCollision(proj.position, proj.radius, 'projectile')) {
        proj.active = false;
        spawnExplosion(proj.position, '#aaaaaa');
        return;
      }

      // Hit Player
      if (proj.ownerId !== player.id && player.active) {
        const dx = proj.position.x - player.position.x;
        const dz = proj.position.z - player.position.z;
        if (Math.sqrt(dx*dx + dz*dz) < player.radius + proj.radius) {
          player.health -= proj.damage;
          proj.active = false;
          spawnExplosion(proj.position, '#ff5500');
          if (player.health <= 0) {
            player.active = false;
            player.health = 0;
            spawnExplosion(player.position, COLORS.player);
            onGameOver(false, 0); // Score handling can be improved
          }
          return;
        }
      }

      // Hit Enemy
      if (proj.ownerId === player.id) {
        enemiesRef.current.forEach(enemy => {
          if (!enemy.active) return;
          const dx = proj.position.x - enemy.position.x;
          const dz = proj.position.z - enemy.position.z;
          if (Math.sqrt(dx*dx + dz*dz) < enemy.radius + proj.radius) {
            enemy.health -= proj.damage;
            proj.active = false;
            spawnExplosion(proj.position, '#ffaa00');
            if (enemy.health <= 0) {
              enemy.active = false;
              spawnExplosion(enemy.position, COLORS.enemy);
            }
          }
        });
      }
    });

    // Cleanup inactive entities
    projectilesRef.current = projectilesRef.current.filter(p => p.active && Math.abs(p.position.x) < MAP_SIZE && Math.abs(p.position.z) < MAP_SIZE);
    
    // Check Win Condition
    const activeEnemies = enemiesRef.current.filter(e => e.active);
    if (activeEnemies.length === 0 && enemiesRef.current.length > 0) {
      onGameOver(true, 1000);
    }

    // --- 6. Particles ---
    particlesRef.current.forEach(p => {
      p.position.x += p.velocity.x;
      p.position.y += p.velocity.y;
      p.position.z += p.velocity.z;
      p.life -= 0.05;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    // --- 7. Camera Follow ---
    // Smooth camera follow
    const targetX = player.position.x;
    const targetZ = player.position.z + 15; // Camera offset Z
    const targetY = 20; // Camera height

    camera.position.x += (targetX - camera.position.x) * 0.1;
    camera.position.z += (targetZ - camera.position.z) * 0.1;
    camera.position.y = targetY; // Keep height constant for now
    camera.lookAt(player.position.x, 0, player.position.z);


    // --- 8. Sync to React ---
    // We only update React state occasionally or for specific arrays to avoid full re-renders every frame
    // For this setup, we force a re-render every frame to draw the updated Refs.
    // In a production app, we would use <instancedMesh> and direct DOM manipulation for HUD.
    setRenderEnemies([...enemiesRef.current]);
    setRenderProjectiles([...projectilesRef.current]);
    setRenderParticles([...particlesRef.current]);
    
    // Update HUD sporadically
    if (state.clock.elapsedTime % 0.2 < 0.02) {
      updateHUD(player.health, activeEnemies.length);
    }
    
    // Trigger re-render of player (since it's a single object ref, we need to tick)
    setTick(t => t + 1); 

  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[20, 30, 10]} 
        intensity={1} 
        castShadow 
        shadow-mapSize={[1024, 1024]} 
      />
      
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[MAP_SIZE, MAP_SIZE]} />
        <meshStandardMaterial color={COLORS.ground} />
      </mesh>
      <gridHelper args={[MAP_SIZE, 20, COLORS.grid, COLORS.grid]} />

      {/* Obstacles */}
      {renderObstacles.map(obs => (
        <mesh 
          key={obs.id} 
          position={[obs.position.x, obs.position.y, obs.position.z]}
          castShadow 
          receiveShadow
        >
          <boxGeometry args={[obs.size.x, obs.size.y, obs.size.z]} />
          <meshStandardMaterial color={obs.color} />
        </mesh>
      ))}

      {/* Player */}
      <TankModel 
        position={playerRef.current.position} 
        rotation={playerRef.current.rotation}
        turretRotation={playerRef.current.turretRotation}
        color={COLORS.player}
        turretColor={COLORS.playerTurret}
        isDead={!playerRef.current.active}
      />

      {/* Enemies */}
      {renderEnemies.map(enemy => (
        <TankModel 
          key={enemy.id}
          position={enemy.position}
          rotation={enemy.rotation}
          turretRotation={enemy.turretRotation}
          color={COLORS.enemy}
          turretColor={COLORS.enemyTurret}
          isDead={!enemy.active}
        />
      ))}

      {/* Projectiles */}
      {renderProjectiles.map(proj => (
        <mesh key={proj.id} position={[proj.position.x, proj.position.y, proj.position.z]}>
          <sphereGeometry args={[proj.radius, 8, 8]} />
          <meshBasicMaterial color={COLORS.bullet} />
        </mesh>
      ))}

      {/* Particles */}
      {renderParticles.map(p => (
        <mesh key={p.id} position={[p.position.x, p.position.y, p.position.z]}>
          <boxGeometry args={[p.size, p.size, p.size]} />
          <meshBasicMaterial color={p.color} transparent opacity={p.life} />
        </mesh>
      ))}
    </>
  );
};