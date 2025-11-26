import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Color } from 'three';
import { TANK_BODY_SIZE, TANK_TURRET_SIZE } from '../constants';

interface TankModelProps {
  position: { x: number; y: number; z: number };
  rotation: number;
  turretRotation: number;
  color: string;
  turretColor: string;
  isDead: boolean;
}

export const TankModel: React.FC<TankModelProps> = ({
  position,
  rotation,
  turretRotation,
  color,
  turretColor,
  isDead
}) => {
  const groupRef = useRef<any>(null);

  // Smooth interpolation for visual fidelity is handled by R3F automatically if props update per frame,
  // but here we are receiving direct props. We rely on the parent updating these props efficiently.
  
  return (
    <group position={[position.x, position.y, position.z]} visible={!isDead}>
      {/* Chassis Rotation Group */}
      <group rotation={[0, rotation, 0]}>
        {/* Main Body */}
        <mesh position={[0, TANK_BODY_SIZE.y / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[TANK_BODY_SIZE.x, TANK_BODY_SIZE.y, TANK_BODY_SIZE.z]} />
          <meshStandardMaterial color={color} />
        </mesh>
        
        {/* Tracks (Decorative) */}
        <mesh position={[1.1, 0.4, 0]}>
          <boxGeometry args={[0.3, 0.8, 2.4]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <mesh position={[-1.1, 0.4, 0]}>
          <boxGeometry args={[0.3, 0.8, 2.4]} />
          <meshStandardMaterial color="#222" />
        </mesh>

        {/* Turret Group */}
        <group position={[0, TANK_BODY_SIZE.y, 0]} rotation={[0, turretRotation - rotation, 0]}>
          {/* Turret Head */}
          <mesh position={[0, TANK_TURRET_SIZE.y / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[TANK_TURRET_SIZE.x, TANK_TURRET_SIZE.y, TANK_TURRET_SIZE.z]} />
            <meshStandardMaterial color={turretColor} />
          </mesh>
          
          {/* Barrel */}
          <mesh position={[0, TANK_TURRET_SIZE.y / 2, 1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 2, 16]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </group>
      </group>
    </group>
  );
};