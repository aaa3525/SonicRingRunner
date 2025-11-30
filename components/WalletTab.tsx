
import React, { useState, useEffect } from 'react';
import { Wallet, Trophy, Gamepad2, Zap, Award, Coins } from 'lucide-react';
import { ethers } from 'ethers';
import { PlayerStats, LeaderboardEntry } from '../types';
import { CHARACTERS, CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants';

declare global {
  interface Window {
    ethereum: any;
  }
}

interface WalletTabProps {
  onConnect: (address: string) => void;
  walletAddress: string | null;
  balance: number; // Balance from App state
}

const WalletTab: React.FC<WalletTabProps> = ({ onConnect, walletAddress, balance }) => {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setIsLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        onConnect(address);
        // Load stats will be triggered by useEffect when walletAddress changes
        setStatusMsg('✅ Wallet connected!');
      } catch (error) {
        console.error(error);
        setStatusMsg('❌ Failed to connect');
      } finally {
        setIsLoading(false);
        setTimeout(() => setStatusMsg(''), 3000);
      }
    } else {
      setStatusMsg('⚠️ Please install MetaMask!');
    }
  };

  const loadStats = async (address: string) => {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      // 1. Fetch Player Stats
      // Returns: (totalRings, highScore, favoriteCharacter, gamesPlayed, tokenBalance)
      const data = await contract.getPlayerStats(address);
      
      const charId = Number(data[2]);
      const charName = CHARACTERS[charId] ? CHARACTERS[charId].name : 'Unknown';

      setStats({
        totalRings: data[0].toString(),
        highScore: data[1].toString(),
        gamesPlayed: data[3].toString(),
        favoriteCharacter: charName,
        tokenBalance: ethers.formatEther(data[4])
      });

      // 2. Fetch Leaderboard
      // Returns: (address[], uint256[])
      const [lbAddrs, lbScores] = await contract.getLeaderboard();
      
      const lbEntries: LeaderboardEntry[] = [];
      for(let i = 0; i < lbAddrs.length; i++) {
          // Filter out empty addresses (0x000...)
          if (lbAddrs[i] !== ethers.ZeroAddress && lbScores[i] > 0) {
              lbEntries.push({
                  address: lbAddrs[i],
                  score: Number(lbScores[i])
              });
          }
      }
      
      // Sort by score desc just in case
      lbEntries.sort((a, b) => b.score - a.score);
      setLeaderboard(lbEntries);

    } catch (e) {
      console.error("Error loading stats from blockchain:", e);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      loadStats(walletAddress);
    }
  }, [walletAddress]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
      {/* Connection Panel */}
      <div className="bg-white rounded-xl p-8 shadow-lg border-4 border-yellow-400 flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800">
          <Wallet className="w-8 h-8 text-blue-600" />
          Connect Wallet
        </h2>
        
        {!walletAddress ? (
          <button
            onClick={connectWallet}
            disabled={isLoading}
            className="w-full max-w-sm py-4 px-6 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 text-xl font-bold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
          >
            <Wallet className="w-6 h-6" />
            {isLoading ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        ) : (
          <div className="w-full bg-slate-100 p-4 rounded-lg border-2 border-slate-200">
            <p className="text-slate-600 text-sm font-bold mb-1">Connected Address</p>
            <p className="font-mono text-blue-600 break-all">{walletAddress}</p>
            <div className="mt-2 text-xs text-green-600 font-bold bg-green-100 py-1 px-2 rounded-full inline-block">
              ● Sepolia Testnet
            </div>
          </div>
        )}
        
        {statusMsg && (
          <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg font-medium border border-blue-200 w-full">
            {statusMsg}
          </div>
        )}
      </div>

      {/* Balance Panel */}
      <div className="bg-white rounded-xl p-8 shadow-lg border-4 border-yellow-400">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800">
            <Coins className="w-8 h-8 text-yellow-500" />
            RING Token Balance
        </h2>
        <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-6 flex items-center justify-center gap-6 border-2 border-yellow-300">
           <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-yellow-500 rounded-full animate-[spin_3s_linear_infinite]"></div>
              <div className="absolute inset-2 border-4 border-yellow-600 rounded-full animate-[spin_2s_linear_infinite_reverse]"></div>
              <div className="absolute inset-0 flex items-center justify-center text-3xl">💍</div>
           </div>
           <div>
               <div className="text-4xl font-bold text-yellow-800 font-mono tracking-tight">
                   {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </div>
               <div className="text-yellow-700 font-bold text-sm">RING TOKENS</div>
           </div>
        </div>
        <p className="text-center text-slate-500 text-sm mt-4">
            ≈ Collect rings in-game to earn tokens!
        </p>
      </div>

      {/* Stats Panel */}
      {stats && (
        <div className="bg-white rounded-xl p-8 shadow-lg border-4 border-yellow-400 lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                <Trophy className="w-8 h-8 text-blue-600" />
                Player Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={<Trophy className="text-yellow-500" />} label="High Score" value={stats.highScore} />
                <StatCard icon={<Coins className="text-blue-500" />} label="Total Rings" value={stats.totalRings} />
                <StatCard icon={<Gamepad2 className="text-purple-500" />} label="Games Played" value={stats.gamesPlayed} />
                <StatCard icon={<Zap className="text-red-500" />} label="Favorite Char" value={stats.favoriteCharacter} />
            </div>
        </div>
      )}

      {/* Leaderboard Panel */}
      <div className="bg-white rounded-xl p-8 shadow-lg border-4 border-yellow-400 lg:col-span-2">
         <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800">
             <Award className="w-8 h-8 text-blue-600" />
             Global Leaderboard
         </h2>
         <div className="flex flex-col gap-2">
            {leaderboard.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No scores yet. Be the first!</p>
            ) : (
                leaderboard.map((entry, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 hover:shadow-md transition-all border-l-4 border-yellow-400">
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-blue-600 text-xl">#{idx + 1}</span>
                            <span className="font-mono text-slate-600 text-sm md:text-base">{entry.address}</span>
                        </div>
                        <span className="font-bold text-yellow-600 text-lg flex items-center gap-2">
                            {entry.score} <span>💍</span>
                        </span>
                    </div>
                ))
            )}
         </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
    <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-100 flex items-center gap-4">
        <div className="text-3xl">{icon}</div>
        <div>
            <div className="text-slate-500 text-xs font-bold uppercase">{label}</div>
            <div className="text-slate-800 font-bold text-xl">{value}</div>
        </div>
    </div>
);

export default WalletTab;
