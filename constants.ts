
import { Character, Theme } from './types';

// REPLACE THIS WITH YOUR NEW DEPLOYED CONTRACT ADDRESS
export const CONTRACT_ADDRESS = '0xC5562C1D050c3cfCC3ed410B91BF4b2650D07EE2'; 
export const SEPOLIA_CHAIN_ID = '11155111'; // Chain ID for Sepolia

export const CONTRACT_ABI = [
  "function collectRings(uint256 _rings, uint8 _characterId) external",
  "function getPlayerStats(address _player) external view returns (uint256 totalRings, uint256 highScore, uint8 favoriteCharacter, uint256 gamesPlayed, uint256 tokenBalance)",
  "function getLeaderboard() external view returns (address[] memory, uint256[] memory)",
  "function balanceOf(address account) external view returns (uint256)",
  "function buyTheme(string memory themeId, uint256 cost) external",
  "function getOwnedThemes(address _user) external view returns (string[] memory)"
];

// Helper to generate placeholder frame URLs since we don't have local assets
// In a real app, these would be local paths like '/assets/sonic/run/1.png'
const generateFrames = (name: string, color: string, count: number, action: string = 'Run') => {
  // Check if we are using local sprites (based on logic used elsewhere in the app, 
  // we actually want to point to local files if they exist, but fallback to placeholders)
  // For the constants file, we will define the Logic in the Component or leave this helper 
  // to generate the PLACEHOLDERS. The local file logic is handled in the components usually.
  
  // However, based on previous steps, we want to point to local sprites/ folder.
  const cleanName = name.toLowerCase();
  const cleanAction = action.toLowerCase();
  return Array.from({ length: count }, (_, i) => 
    `sprites/${cleanName}_${cleanAction}_${i+1}.png`
  );
};

export const CHARACTERS: Character[] = [
  {
    id: 0,
    name: 'Sonic',
    color: '#0066FF',
    speed: 9,
    bonus: '1.0x',
    bonusMultiplier: 1.0,
    title: 'The Blue Blur',
    stats: { speed: 10, strength: 5, agility: 10, stamina: 8, intelligence: 7, combat: 8 },
    themeColors: { speed: '#0A63C9', strength: '#E22728', agility: '#FFFFFF' },
    runImagePaths: generateFrames('Sonic', '#0066FF', 12, 'Run'),
    idleImagePaths: generateFrames('Sonic', '#0066FF', 11, 'Idle')
  },
  {
    id: 1,
    name: 'Tails',
    color: '#FFB600',
    speed: 6,
    bonus: '1.1x',
    bonusMultiplier: 1.1,
    title: 'The Genius Inventor',
    stats: { speed: 7, strength: 4, agility: 8, stamina: 7, intelligence: 10, combat: 6 },
    themeColors: { speed: '#F6A01A', strength: '#FFFFFF', agility: '#D32527' },
    runImagePaths: generateFrames('Tails', '#FFB600', 10, 'Run'),
    idleImagePaths: generateFrames('Tails', '#FFB600', 14, 'Idle')
  },
  {
    id: 2,
    name: 'Knuckles',
    color: '#FF0000',
    speed: 7,
    bonus: '1.2x',
    bonusMultiplier: 1.2,
    title: 'The Guardian',
    stats: { speed: 6, strength: 10, agility: 7, stamina: 9, intelligence: 6, combat: 9 },
    themeColors: { speed: '#C20F1A', strength: '#3BAA36', agility: '#F4E542' },
    runImagePaths: generateFrames('Knuckles', '#FF0000', 12, 'Run'),
    idleImagePaths: generateFrames('Knuckles', '#FF0000', 11, 'Idle')
  },
  {
    id: 3,
    name: 'Shadow',
    color: '#000000',
    speed: 9,
    bonus: '1.15x',
    bonusMultiplier: 1.15,
    title: 'The Ultimate Lifeform',
    stats: { speed: 10, strength: 8, agility: 9, stamina: 9, intelligence: 8, combat: 10 },
    themeColors: { speed: '#000000', strength: '#D41414', agility: '#F4C20F' },
    runImagePaths: generateFrames('Shadow', '#000000', 8, 'Run'),
    idleImagePaths: generateFrames('Shadow', '#000000', 7, 'Idle')
  },
  {
    id: 4,
    name: 'Amy',
    color: '#FF69B4',
    speed: 7,
    bonus: '1.05x',
    bonusMultiplier: 1.05,
    title: 'The Energetic Optimist',
    stats: { speed: 7, strength: 7, agility: 7, stamina: 8, intelligence: 7, combat: 8 },
    themeColors: { speed: '#FF5BA4', strength: '#D61C23', agility: '#FFFFFF' },
    runImagePaths: generateFrames('Amy', '#FF69B4', 8, 'Run'),
    idleImagePaths: generateFrames('Amy', '#FF69B4', 12, 'Idle')
  },
  {
    id: 5,
    name: 'Cream',
    color: '#FFF4E6',
    speed: 6,
    bonus: '1.25x',
    bonusMultiplier: 1.25,
    title: 'The Polite & Kind',
    stats: { speed: 6, strength: 3, agility: 7, stamina: 6, intelligence: 8, combat: 5 },
    themeColors: { speed: '#F4D9B0', strength: '#F7941D', agility: '#4BA3E3' },
    runImagePaths: generateFrames('Cream', '#FFF4E6', 14, 'Run'),
    idleImagePaths: generateFrames('Cream', '#FFF4E6', 12, 'Idle')
  }
];

export const THEMES: Theme[] = [
  {
    id: 'greenhill',
    name: 'Green Hill',
    cost: 0,
    description: 'The classic lush hills where it all began.',
    colors: {
      sky: '#87CEEB',
      ground: '#8B4513',
      grass: '#22c55e',
      obstacle: '#ef4444',
      text: '#FFFFFF'
    },
    backgroundImage: 'backgrounds/greenhill.png',
    previewGradient: 'linear-gradient(to bottom, #87CEEB, #22c55e)'
  },
  {
    id: 'marble',
    name: 'Marble Zone',
    cost: 500,
    description: 'Ancient ruins with molten lava underground.',
    colors: {
      sky: '#4c1d95', // Deep Purple
      ground: '#475569', // Slate
      grass: '#fbbf24', // Lava/Gold
      obstacle: '#7f1d1d',
      text: '#fbbf24'
    },
    backgroundImage: 'backgrounds/marble.png',
    previewGradient: 'linear-gradient(to bottom, #4c1d95, #fbbf24)'
  },
  {
    id: 'starlight',
    name: 'Star Light',
    cost: 1000,
    description: 'A peaceful city under the stars.',
    colors: {
      sky: '#0f172a', // Slate 900
      ground: '#1e293b', // Slate 800
      grass: '#38bdf8', // Light Blue neon
      obstacle: '#c026d3', // Fuchsia
      text: '#38bdf8'
    },
    backgroundImage: 'backgrounds/starlight.png',
    previewGradient: 'linear-gradient(to bottom, #0f172a, #38bdf8)'
  },
  {
    id: 'chemical',
    name: 'Chemical Plant',
    cost: 2000,
    description: 'Industrial speedway with toxic chemicals.',
    colors: {
      sky: '#022c22', // Deep Teal
      ground: '#facc15', // Yellow warning
      grass: '#ec4899', // Pink fluid
      obstacle: '#1e40af', // Blue blocks
      text: '#ec4899'
    },
    backgroundImage: 'backgrounds/chemical.png',
    previewGradient: 'linear-gradient(to bottom, #022c22, #ec4899)'
  }
];

export const MUSIC_TRACKS = [
  { id: 'greenhill', name: "Green Hill Zone", emoji: "🌿", src: "audio/greenhill-zone.mp3" }, 
  { id: 'marble', name: "Marble Zone", emoji: "🏛️", src: "audio/marble-zone.mp3" },
  { id: 'springyard', name: "Spring Yard Zone", emoji: "🎪", src: "audio/spring-yard-zone.mp3" },
  { id: 'starlight', name: "Star Light Zone", emoji: "✨", src: "audio/starlight-zone.mp3" },
  { id: 'labyrinth', name: "Labyrinth Zone", emoji: "💧", src: "audio/labyrinth-zone.mp3" },
  { id: 'angelisland', name: "Angel Island Act 2", emoji: "🏝️", src: "audio/angel-island-act2.mp3" },
];