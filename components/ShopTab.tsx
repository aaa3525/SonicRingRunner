import React from 'react';
import { ShoppingBag, Lock, Check, Coins } from 'lucide-react';
import { THEMES } from '../constants';

interface ShopTabProps {
  balance: number;
  ownedThemes: string[];
  activeThemeId: string;
  onBuy: (themeId: string, cost: number) => void;
  onEquip: (themeId: string) => void;
}

const ShopTab: React.FC<ShopTabProps> = ({ balance, ownedThemes, activeThemeId, onBuy, onEquip }) => {
  return (
    <div className="bg-white rounded-xl p-8 shadow-lg border-4 border-yellow-400 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div>
          <h2 className="text-4xl font-bold text-purple-600 mb-2 font-['Press_Start_2P'] uppercase flex items-center gap-4">
            <ShoppingBag className="w-10 h-10" />
            Theme Shop
          </h2>
          <p className="text-slate-500 text-lg">Spend your hard-earned rings on new looks!</p>
        </div>
        
        <div className="bg-yellow-100 px-8 py-4 rounded-xl border-2 border-yellow-400 flex items-center gap-4 shadow-inner">
            <div className="bg-yellow-400 rounded-full p-2">
                <Coins className="text-yellow-800 w-8 h-8" />
            </div>
            <div>
                <p className="text-yellow-800 text-xs font-bold uppercase tracking-wide">Your Balance</p>
                <p className="text-3xl font-mono font-bold text-yellow-700">{balance.toLocaleString()}</p>
            </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {THEMES.map((theme) => {
          const isOwned = ownedThemes.includes(theme.id);
          const isActive = activeThemeId === theme.id;
          const canAfford = balance >= theme.cost;

          return (
            <div 
                key={theme.id} 
                className={`relative overflow-hidden rounded-2xl border-4 transition-all duration-300 ${isActive ? 'border-green-500 shadow-xl scale-[1.02]' : 'border-slate-200 hover:border-blue-300 hover:shadow-lg'}`}
            >
                {/* Preview Area */}
                <div 
                    className="h-40 w-full relative flex items-center justify-center bg-cover bg-center"
                    style={{ 
                        background: theme.backgroundImage ? `url(${theme.backgroundImage}), ${theme.previewGradient}` : theme.previewGradient,
                        backgroundSize: 'cover' 
                    }}
                >
                    <h3 className="text-3xl font-bold text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] z-10 relative">{theme.name}</h3>
                    
                    {/* Darken overlay for text readability if image is present */}
                    <div className="absolute inset-0 bg-black/20"></div>

                    {isActive && (
                        <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md z-20">
                            <Check size={12} /> ACTIVE
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="p-6 bg-white flex flex-col gap-4">
                    <p className="text-slate-600">{theme.description}</p>
                    
                    <div className="flex items-center justify-between mt-2">
                        <div className="text-sm font-bold text-slate-400 uppercase">Cost</div>
                        {theme.cost === 0 ? (
                             <span className="text-xl font-bold text-green-600">FREE</span>
                        ) : (
                             <span className="text-xl font-bold text-yellow-600 flex items-center gap-1">
                                {theme.cost.toLocaleString()} <span className="text-sm">RING</span>
                             </span>
                        )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-2">
                        {isOwned ? (
                            <button
                                onClick={() => onEquip(theme.id)}
                                disabled={isActive}
                                className={`w-full py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all
                                    ${isActive 
                                        ? 'bg-green-100 text-green-700 cursor-default' 
                                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md active:translate-y-1'
                                    }`}
                            >
                                {isActive ? 'Equipped' : 'Equip Theme'}
                            </button>
                        ) : (
                            <button
                                onClick={() => onBuy(theme.id, theme.cost)}
                                disabled={!canAfford}
                                className={`w-full py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all
                                    ${canAfford 
                                        ? 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900 shadow-md active:translate-y-1' 
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                {canAfford ? 'Purchase' : 'Not Enough Rings'}
                                {!isOwned && !canAfford && <Lock size={16} />}
                            </button>
                        )}
                    </div>
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShopTab;