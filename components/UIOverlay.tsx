import React from 'react';
import { GameState, MissionData } from '../types';

interface UIOverlayProps {
  gameState: GameState;
  health: number;
  enemiesLeft: number;
  missionData: MissionData | null;
  onStart: (difficulty: number) => void;
  onRestart: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({
  gameState,
  health,
  enemiesLeft,
  missionData,
  onStart,
  onRestart
}) => {
  if (gameState === GameState.MENU) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
        <div className="bg-gray-900 p-8 border-2 border-green-500 rounded-lg max-w-md w-full text-center shadow-[0_0_20px_rgba(0,255,153,0.3)]">
          <h1 className="text-4xl font-bold text-green-400 mb-2 tracking-widest uppercase">Neon Tank</h1>
          <h2 className="text-xl text-green-600 mb-8 uppercase">Command Interface</h2>
          
          <div className="space-y-4">
            <p className="text-gray-400 text-sm mb-4">Select Operations Level</p>
            <button 
              onClick={() => onStart(1)}
              className="w-full py-3 bg-green-900/30 hover:bg-green-500 hover:text-black border border-green-500 text-green-500 font-bold transition-all uppercase tracking-widest"
            >
              Easy Patrol
            </button>
            <button 
              onClick={() => onStart(2)}
              className="w-full py-3 bg-yellow-900/30 hover:bg-yellow-500 hover:text-black border border-yellow-500 text-yellow-500 font-bold transition-all uppercase tracking-widest"
            >
              Medium Assault
            </button>
            <button 
              onClick={() => onStart(3)}
              className="w-full py-3 bg-red-900/30 hover:bg-red-500 hover:text-black border border-red-500 text-red-500 font-bold transition-all uppercase tracking-widest"
            >
              Hard Crusade
            </button>
          </div>
          
          <div className="mt-8 text-xs text-gray-600 font-mono">
             WASD to Move | Mouse to Aim | Click to Fire
          </div>
        </div>
      </div>
    );
  }

  if (gameState === GameState.LOADING_MISSION) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-green-500 font-mono animate-pulse">ESTABLISHING UPLINK...</p>
          <p className="text-xs text-gray-500 mt-2">DECRYPTING MISSION PARAMETERS</p>
        </div>
      </div>
    );
  }

  if (gameState === GameState.GAME_OVER || gameState === GameState.VICTORY) {
    const isVictory = gameState === GameState.VICTORY;
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
        <div className={`p-8 border-4 ${isVictory ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'} rounded-lg max-w-md w-full text-center backdrop-blur-md`}>
          <h1 className={`text-5xl font-bold mb-4 ${isVictory ? 'text-green-400' : 'text-red-500'}`}>
            {isVictory ? 'MISSION ACCOMPLISHED' : 'CRITICAL FAILURE'}
          </h1>
          <p className="text-white mb-8 font-mono">
            {isVictory ? 'Sector secured. Returning to base.' : 'Signal lost. Unit destroyed.'}
          </p>
          <button 
            onClick={onRestart}
            className="px-8 py-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors uppercase tracking-widest"
          >
            Re-Deploy
          </button>
        </div>
      </div>
    );
  }

  // HUD
  return (
    <div className="absolute inset-0 pointer-events-none z-10 p-4 flex flex-col justify-between">
      {/* Top Bar: Mission Info */}
      <div className="flex justify-between items-start">
        <div className="bg-black/50 border-l-4 border-green-500 p-4 max-w-md backdrop-blur-sm">
          <h3 className="text-green-400 font-bold uppercase text-sm tracking-wider mb-1">
            {missionData?.title || "Unknown Op"}
          </h3>
          <p className="text-white text-xs font-mono opacity-80">
            {missionData?.briefing || "..."}
          </p>
        </div>
        
        <div className="text-right">
           <div className="text-4xl font-bold text-red-500 drop-shadow-md">
             {enemiesLeft}
           </div>
           <div className="text-xs text-red-300 uppercase tracking-widest">Targets Remaining</div>
        </div>
      </div>

      {/* Bottom Bar: Health */}
      <div className="flex justify-center items-end pb-4">
        <div className="w-96 bg-gray-900/80 border border-gray-700 p-2 rounded-lg">
          <div className="flex justify-between text-xs text-gray-400 mb-1 font-mono uppercase">
            <span>Hull Integrity</span>
            <span>{Math.max(0, Math.floor(health))}%</span>
          </div>
          <div className="h-4 bg-gray-800 rounded overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${health > 50 ? 'bg-green-500' : health > 20 ? 'bg-yellow-500' : 'bg-red-600'}`}
              style={{ width: `${Math.max(0, health)}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Reticle */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-white/30 rounded-full pointer-events-none">
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-green-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
    </div>
  );
};