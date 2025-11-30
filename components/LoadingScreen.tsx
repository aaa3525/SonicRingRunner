
import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsReady(true);
          return 100;
        }
        // Random increment for realistic feel
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#1e1b4b,#312e81)] opacity-80"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center max-w-lg w-full px-6">
        
        {/* Logo / Title */}
        <h1 className="text-4xl md:text-6xl font-['Press_Start_2P'] text-yellow-400 text-center mb-12 drop-shadow-[4px_4px_0_#b45309] leading-tight animate-pulse">
          SONIC<br />
          <span className="text-blue-500 drop-shadow-[4px_4px_0_#1e3a8a]">RING RUNNER</span>
        </h1>

        {/* Loading Spinner / Visual */}
        {!isReady ? (
          <div className="flex flex-col items-center gap-6 w-full">
            {/* Spinning Ring */}
            <div className="relative w-24 h-24">
               <div className="absolute inset-0 border-8 border-yellow-400 rounded-full animate-[spin_1s_linear_infinite] border-t-transparent shadow-[0_0_20px_#facc15]"></div>
               <div className="absolute inset-0 flex items-center justify-center text-4xl">🦔</div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-6 bg-slate-700 rounded-full overflow-hidden border-2 border-slate-500">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300 ease-out flex items-center justify-end pr-2"
                style={{ width: `${progress}%` }}
              >
                <div className="w-2 h-full bg-white/30 animate-pulse"></div>
              </div>
            </div>
            
            <p className="text-blue-300 font-mono text-sm animate-pulse">
              LOADING ZONES... {Math.min(100, Math.floor(progress))}%
            </p>
          </div>
        ) : (
          /* Start Button */
          <div className="animate-bounce-in flex flex-col items-center gap-4">
            <button
              onClick={onComplete}
              className="group relative bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold py-4 px-12 rounded-full text-2xl shadow-[0_6px_0_#b45309] active:shadow-none active:translate-y-2 transition-all"
            >
              <div className="flex items-center gap-3">
                <Play fill="currentColor" size={28} />
                <span>START GAME</span>
              </div>
              
              {/* Button Shine Effect */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 group-hover:animate-[shimmer_1s_infinite]"></div>
              </div>
            </button>
            
            <p className="text-slate-400 text-xs mt-4 font-mono">
              PRESS START TO CONNECT TO SEPOLIA
            </p>
          </div>
        )}
      </div>

      {/* Footer Text */}
      <div className="absolute bottom-4 text-slate-500 text-[10px] md:text-xs text-center font-mono">
        POWERED BY ETHEREUM • WEB3 INTEGRATED • 2024
      </div>
    </div>
  );
};

export default LoadingScreen;
    