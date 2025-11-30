
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import WalletTab from './components/WalletTab';
import CharactersTab from './components/CharactersTab';
import GameTab from './components/GameTab';
import ShopTab from './components/ShopTab';
import LoadingScreen from './components/LoadingScreen';
import { Wallet, Gamepad2, Users, ShoppingBag, CheckCircle } from 'lucide-react';
import { THEMES, CONTRACT_ADDRESS, CONTRACT_ABI } from './constants';
import { ethers } from 'ethers';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true); // App Loading State
  const [activeTab, setActiveTab] = useState<'wallet' | 'game' | 'characters' | 'shop'>('wallet');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  
  // Game & Economy State
  const [balance, setBalance] = useState<number>(0);
  const [ownedThemes, setOwnedThemes] = useState<string[]>(['greenhill']);
  const [activeThemeId, setActiveThemeId] = useState<string>('greenhill');
  
  // Notification State
  const [notification, setNotification] = useState<string | null>(null);

  const activeTheme = THEMES.find(t => t.id === activeThemeId) || THEMES[0];

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const loadBlockchainData = async (address: string) => {
      if (!window.ethereum) return;
      
      try {
          // Add a check for network
          const provider = new ethers.BrowserProvider(window.ethereum);
          
          // Request simple read-only data first
          // Note: In Ethers v6, we use the provider for read-only calls usually, 
          // but for user-specific data like "balanceOf(user)", we can just use the address.
          const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
          
          // 1. Get Balance
          const rawBalance = await contract.balanceOf(address);
          const fmtBalance = parseFloat(ethers.formatEther(rawBalance));
          setBalance(fmtBalance);
          
          // 2. Get Owned Themes
          const themes = await contract.getOwnedThemes(address);
          // Combine with default greenhill (always owned)
          const uniqueThemes = Array.from(new Set(['greenhill', ...themes]));
          setOwnedThemes(uniqueThemes);
          
      } catch (e) {
          console.error("Error loading blockchain data:", e);
      }
  };

  const handleConnect = (address: string) => {
      setWalletAddress(address);
      loadBlockchainData(address);
      showNotification('Wallet Connected Successfully!');
  };

  // Called when Game Over -> Mint
  const handleMint = async (amount: number) => {
      if (amount <= 0 || !walletAddress) return;
      
      try {
          showNotification('Confirming transaction in Wallet...');
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
          
          // Assuming Character ID 0 for now, or pass it from game
          // Added gasLimit to prevent estimation errors
          const tx = await contract.collectRings(amount, 0, { gasLimit: 500000 }); 
          showNotification('Transaction Submitted. Waiting for confirmation...');
          
          await tx.wait();
          showNotification(`Success! +${amount} RING tokens minted.`);
          
          // Refresh Balance
          loadBlockchainData(walletAddress);
          
      } catch (e: any) {
          console.error(e);
          showNotification('Transaction Failed: ' + (e.reason || 'Check console'));
      }
  };

  const handleBuyTheme = async (themeId: string, cost: number) => {
      if (!walletAddress) {
          showNotification('Please Connect Wallet First');
          return;
      }

      if (balance < cost) {
          showNotification('Insufficient RING Balance');
          return;
      }
      
      try {
          showNotification('Confirming purchase in Wallet...');
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
          
          // Manual gas limit is CRITICAL here.
          // If the contract simulation fails (e.g. because balance is 0 on chain), 
          // ethers throws "estimateGas" error.
          // Setting gasLimit forces the transaction to be sent to MetaMask anyway.
          const tx = await contract.buyTheme(themeId, cost, { gasLimit: 500000 });
          
          showNotification('Purchase Transaction Submitted...');
          
          await tx.wait();
          showNotification('Theme Purchased Successfully!');
          
          // Refresh Data
          loadBlockchainData(walletAddress);
          
      } catch (e: any) {
          console.error(e);
          // If user rejects, or contract reverts
          showNotification('Purchase Failed: ' + (e.reason || 'Check Wallet'));
      }
  };

  const handleEquipTheme = (themeId: string) => {
      if (ownedThemes.includes(themeId)) {
          setActiveThemeId(themeId);
          showNotification('Theme Equipped!');
      }
  };

  // If loading, show Loading Screen
  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="min-h-screen p-4 md:p-6 pb-20 transition-colors duration-500" style={{ backgroundColor: activeTheme.colors.sky + '20' }}>
      <Header />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-in w-full max-w-md px-4 pointer-events-none">
          <div className="bg-slate-800 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 border-2 border-yellow-400">
            <CheckCircle size={24} className="text-green-400 flex-shrink-0" />
            <span className="font-bold text-sm md:text-base">{notification}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-wrap gap-2 md:gap-4 justify-center md:justify-start">
        <NavButton 
          active={activeTab === 'wallet'} 
          onClick={() => setActiveTab('wallet')}
          icon={<Wallet size={20} />}
          label="Wallet"
        />
        <NavButton 
          active={activeTab === 'game'} 
          onClick={() => setActiveTab('game')}
          icon={<Gamepad2 size={20} />}
          label="Play"
        />
        <NavButton 
          active={activeTab === 'shop'} 
          onClick={() => setActiveTab('shop')}
          icon={<ShoppingBag size={20} />}
          label="Shop"
        />
        <NavButton 
          active={activeTab === 'characters'} 
          onClick={() => setActiveTab('characters')}
          icon={<Users size={20} />}
          label="Heroes"
        />
      </div>

      {/* Content Area */}
      <main className="max-w-7xl mx-auto">
        {activeTab === 'wallet' && (
          <WalletTab 
            onConnect={handleConnect} 
            walletAddress={walletAddress}
            balance={balance}
          />
        )}
        {activeTab === 'game' && (
          <GameTab 
            activeTheme={activeTheme}
            onMint={handleMint}
          />
        )}
        {activeTab === 'shop' && (
          <ShopTab 
            balance={balance}
            ownedThemes={ownedThemes}
            activeThemeId={activeThemeId}
            onBuy={handleBuyTheme}
            onEquip={handleEquipTheme}
          />
        )}
        {activeTab === 'characters' && <CharactersTab />}
      </main>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 min-w-[100px] md:min-w-[120px] flex items-center justify-center gap-2 md:gap-3 px-3 md:px-4 py-3 md:py-4 rounded-xl font-bold transition-all transform duration-200 shadow-md text-sm md:text-base
      ${active 
        ? 'bg-blue-600 text-white border-b-4 border-yellow-400 translate-y-0.5 shadow-sm' 
        : 'bg-white text-slate-600 border-b-4 border-slate-200 hover:-translate-y-1 hover:border-blue-400 hover:text-blue-600'
      }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

export default App;
