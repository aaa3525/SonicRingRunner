import React, { useState } from 'react';
import GameCanvas from './GameCanvas';
import { CHARACTERS } from '../constants';
import { Play, RotateCcw, Award } from 'lucide-react';
import { Theme } from '../types';

interface GameTabProps {
  activeTheme: Theme;
  onMint: (amount: number) => void;
}

const GameTab: React.FC<GameTabProps> = ({ activeTheme, onMint }) => {
  const [selectedCharId, setSelectedCharId] = useState(0);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [rings, setRings] = useState(0);
  const [finalStats, setFinalStats] = useState({ score: 0, heldRings: 0, totalCollected: 0 });
  
  // Add a unique key to force Canvas remount on restart
  const [gameKey, setGameKey] = useState(0);

  const handleGameOver = (finalScore: number, heldRings: number, totalCollected: number) => {
    setFinalStats({ score: finalScore, heldRings, totalCollected });
    setGameState('gameover');
  };

  const updateScore = (s: number, r: number) => {
    setScore(s);
    setRings(r);
  };

  const handleStart = () => {
    setGameState('playing');
    setGameKey(prev => prev + 1); // Ensure fresh start
  };

  const handleRestart = () => {
      setScore(0);
      setRings(0);
      setGameKey(prev => prev + 1); // Force canvas to unmount/mount for clean state
      setGameState('playing');
  };
  
  const handleMint = () => {
      onMint(finalStats.totalCollected);
      setGameState('menu'); 
      setScore(0);
      setRings(0);
      setGameKey(prev => prev + 1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-6">
         {/* Character Select */}
         <div className="bg-white rounded-xl p-6 shadow-lg border-4 border-yellow-400">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                Select Character
            </h3>
            <div className="grid grid-cols-2 gap-3">
                {CHARACTERS.map(char => (
                    <button 
                        key={char.id}
                        onClick={() => gameState === 'menu' && setSelectedCharId(char.id)}
                        disabled={gameState !== 'menu'}
                        className={`p-2 rounded-lg border-2 transition-all text-center ${selectedCharId === char.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-slate-200 hover:border-blue-300'} ${gameState !== 'menu' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <div className="w-10 h-10 mx-auto rounded-full mb-2" style={{ backgroundColor: char.color }}></div>
                        <div className="text-xs font-bold truncate">{char.name}</div>
                        <div className="text-[10px] text-slate-500">{char.bonus}</div>
                    </button>
                ))}
            </div>
            <p className="text-xs text-slate-400 mt-4 text-center">Select character before starting</p>
         </div>

         {/* Score Board */}
         <div className="bg-white rounded-xl p-6 shadow-lg border-4 border-green-500">
             <h3 className="font-bold text-slate-700 mb-4">Current Run</h3>
             <div className="space-y-4">
                 <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex justify-between items-center">
                     <span className="text-green-800 font-bold uppercase text-sm">Score</span>
                     <span className="text-2xl font-bold text-green-600 font-mono">{score}</span>
                 </div>
                 <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 flex justify-between items-center">
                     <span className="text-yellow-800 font-bold uppercase text-sm">Rings</span>
                     <span className="text-2xl font-bold text-yellow-600 font-mono">{rings}</span>
                 </div>
             </div>
         </div>
      </div>

      {/* Main Game Area */}
      <div className="lg:col-span-3 relative bg-slate-900 rounded-xl p-1 border-4 border-slate-700 shadow-2xl">
          <GameCanvas 
            key={gameKey} // IMPORTANT: Changing this forces a hard reset of the canvas
            selectedCharacterId={selectedCharId} 
            onGameOver={handleGameOver} 
            gameState={gameState}
            setGameState={setGameState}
            updateScore={updateScore}
            activeTheme={activeTheme}
          />

          {/* Overlays */}
          {gameState === 'menu' && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
                  <div className="text-center text-white p-8 bg-slate-800 border-4 border-yellow-400 rounded-2xl shadow-2xl max-w-md">
                      <h2 className="text-4xl font-['Press_Start_2P'] text-yellow-400 mb-8 leading-relaxed">SONIC<br/>RING RUNNER</h2>
                      <button 
                        onClick={handleStart}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-12 rounded-full text-xl shadow-[0_6px_0_#15803d] active:shadow-none active:translate-y-1 transition-all flex items-center gap-2 mx-auto"
                      >
                          <Play fill="currentColor" /> START GAME
                      </button>
                      <div className="mt-8 text-sm text-slate-300 space-y-2">
                          <p>Jump: <kbd className="bg-slate-700 px-2 py-1 rounded">Space</kbd> or <kbd className="bg-slate-700 px-2 py-1 rounded">↑</kbd></p>
                          <p>Pause: <kbd className="bg-slate-700 px-2 py-1 rounded">Esc</kbd></p>
                      </div>
                  </div>
              </div>
          )}

          {gameState === 'paused' && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
                  <div className="text-center text-white">
                      <h2 className="text-5xl font-bold mb-8 drop-shadow-lg">PAUSED</h2>
                      <button 
                        onClick={() => setGameState('playing')}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-all"
                      >
                          RESUME
                      </button>
                  </div>
              </div>
          )}

          {gameState === 'gameover' && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center rounded-lg z-10">
                  <div className="text-center text-white p-8 bg-slate-800 border-4 border-red-500 rounded-2xl shadow-2xl animate-bounce-in max-w-lg w-full">
                      <h2 className="text-4xl font-bold text-red-500 mb-6 font-['Press_Start_2P']">GAME OVER</h2>
                      
                      <div className="grid grid-cols-3 gap-4 mb-8">
                          <div className="bg-slate-700 p-3 rounded-lg flex flex-col items-center">
                              <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Score</div>
                              <div className="text-xl font-bold text-white">{finalStats.score}</div>
                          </div>
                          <div className="bg-slate-700 p-3 rounded-lg flex flex-col items-center opacity-70">
                              <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Held</div>
                              <div className="text-xl font-bold text-red-400">{finalStats.heldRings}</div>
                          </div>
                          <div className="bg-yellow-900/40 border border-yellow-600 p-3 rounded-lg flex flex-col items-center">
                              <div className="text-yellow-400 text-[10px] uppercase font-bold mb-1">Collected</div>
                              <div className="text-xl font-bold text-yellow-400">{finalStats.totalCollected}</div>
                          </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        {finalStats.totalCollected > 0 ? (
                            <button 
                                onClick={handleMint}
                                className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-4 px-8 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 w-full transform hover:scale-105"
                            >
                                <Award size={24} /> Mint {finalStats.totalCollected} Tokens
                            </button>
                        ) : (
                            <div className="bg-slate-700 text-slate-400 py-3 px-8 rounded-lg text-sm font-bold">
                                No Rings Collected to Mint
                            </div>
                        )}
                        <button 
                            onClick={handleRestart}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
                        >
                            <RotateCcw size={20} /> Play Again
                        </button>
                      </div>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default GameTab;