import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { GameWorld } from './components/GameWorld';
import { UIOverlay } from './components/UIOverlay';
import { GameState, MissionData } from './types';
import { geminiService } from './services/geminiService';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [missionData, setMissionData] = useState<MissionData | null>(null);
  const [hudHealth, setHudHealth] = useState(100);
  const [hudEnemies, setHudEnemies] = useState(0);

  const startGame = async (difficulty: number) => {
    setGameState(GameState.LOADING_MISSION);
    
    // Fetch mission from Gemini
    const data = await geminiService.generateMission(difficulty);
    setMissionData(data);
    setHudEnemies(data.targetCount);
    setHudHealth(100);
    
    setGameState(GameState.PLAYING);
  };

  const handleGameOver = useCallback((won: boolean, score: number) => {
    setGameState(won ? GameState.VICTORY : GameState.GAME_OVER);
  }, []);

  const updateHUD = useCallback((hp: number, enemies: number) => {
    setHudHealth(hp);
    setHudEnemies(enemies);
  }, []);

  const handleRestart = () => {
    setGameState(GameState.MENU);
    setMissionData(null);
  };

  return (
    <div className="relative w-full h-full bg-neutral-900 select-none overflow-hidden font-sans">
      
      {/* 3D Scene */}
      <div className="absolute inset-0">
        <Canvas shadows camera={{ position: [0, 20, 20], fov: 45 }}>
          <GameWorld 
            gameState={gameState} 
            missionData={missionData}
            onGameOver={handleGameOver}
            updateHUD={updateHUD}
          />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <UIOverlay 
        gameState={gameState} 
        health={hudHealth} 
        enemiesLeft={hudEnemies}
        missionData={missionData}
        onStart={startGame}
        onRestart={handleRestart}
      />
    </div>
  );
}