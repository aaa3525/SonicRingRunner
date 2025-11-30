import React, { useState, useEffect } from 'react';
import { CHARACTERS } from '../constants';

const CharactersTab: React.FC = () => {
  return (
    <div className="bg-white rounded-xl p-8 shadow-lg border-4 border-yellow-400 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-blue-600 mb-2 font-['Press_Start_2P'] uppercase">Character Roster</h2>
        <p className="text-slate-500 text-lg">Meet the heroes of Sonic Ring Runner</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {CHARACTERS.map((char) => (
          <div key={char.id} className="bg-white rounded-2xl overflow-hidden shadow-xl hover:-translate-y-2 transition-transform duration-300 border-2 border-slate-200 group">
            <div className="h-48 relative flex items-center justify-center p-6" style={{ background: `linear-gradient(135deg, ${char.color}, #333)` }}>
               <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 animate-pulse-scale relative overflow-hidden">
                   {/* Sprite Animator handles the idle animation */}
                   <SpriteAnimator 
                      paths={char.idleImagePaths} 
                      color={char.color} 
                   />
               </div>
               <div className="absolute bottom-4 left-0 right-0 text-center">
                  <h3 className="text-2xl font-bold text-white drop-shadow-md">{char.name}</h3>
                  <p className="text-white/80 text-sm font-medium">{char.title}</p>
               </div>
            </div>
            
            <div className="p-6">
               <div className="space-y-3">
                  <StatBar label="Speed" value={char.stats.speed} color={char.themeColors.speed} />
                  <StatBar label="Strength" value={char.stats.strength} color={char.themeColors.strength} />
                  <StatBar label="Agility" value={char.stats.agility} color={char.themeColors.agility} />
               </div>
               
               <div className="mt-6 bg-yellow-50 rounded-lg p-3 border border-yellow-200 text-center">
                  <p className="text-yellow-800 text-xs font-bold uppercase mb-1">Token Multiplier</p>
                  <p className="text-2xl font-bold text-yellow-600">{char.bonus}</p>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// New Component to handle frame-by-frame animation
const SpriteAnimator: React.FC<{ paths: string[], color: string }> = ({ paths, color }) => {
  const [frame, setFrame] = useState(0);
  const [loadedImages, setLoadedImages] = useState<HTMLImageElement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadImages = async () => {
      setLoading(true);
      try {
        const promises = paths.map(src => new Promise<HTMLImageElement>((resolve, reject) => {
           const img = new Image();
           img.src = src;
           img.onload = () => resolve(img);
           img.onerror = () => reject(); // If one fails, we'll hit catch
        }));
        
        const results = await Promise.all(promises);
        if (mounted) {
           setLoadedImages(results);
           setLoading(false);
        }
      } catch (e) {
        // Fallback if images don't exist
        if (mounted) setLoading(false);
      }
    };
    
    loadImages();
    return () => { mounted = false; };
  }, [paths]);

  // Animation Loop
  useEffect(() => {
    if (loadedImages.length === 0) return;
    
    const interval = setInterval(() => {
        setFrame(prev => (prev + 1) % loadedImages.length);
    }, 150); // 150ms per frame for idle

    return () => clearInterval(interval);
  }, [loadedImages]);

  if (loading || loadedImages.length === 0) {
      // Show colored circle fallback
      return <div className="w-full h-full" style={{ backgroundColor: color }}></div>;
  }

  return (
      <img 
        src={loadedImages[frame].src} 
        alt="Character" 
        className="w-full h-full object-contain drop-shadow-lg" 
        style={{ imageRendering: 'pixelated' }}
      />
  );
};

const StatBar: React.FC<{ label: string, value: number, color: string }> = ({ label, value, color }) => (
    <div className="flex items-center gap-3">
        <span className="w-20 text-xs font-bold text-slate-500 uppercase">{label}</span>
        <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
            <div 
                className="h-full shadow-sm"
                style={{ 
                  width: `${(value / 10) * 100}%`,
                  backgroundColor: color,
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                }}
            ></div>
        </div>
        <span className="text-xs font-bold text-slate-700 w-4 text-right">{value}</span>
    </div>
);

export default CharactersTab;