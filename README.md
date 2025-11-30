# Sonic Ring Runner 🦔💍

**Sonic Ring Runner** is a retro-inspired infinite runner game integrated with the Ethereum Blockchain. Players run as their favorite characters, collect rings, avoiding obstacles, and mint their score as ERC-20 tokens directly to the Sepolia Testnet.

## 🎮 Theme & Gameplay

The game captures the essence of the 16-bit era with a modern Web3 twist.
- **Genre**: Infinite Side-Scroller.
- **Visuals**: Pixel-art aesthetics, parallax scrolling backgrounds, and frame-by-frame character animations.
- **Mechanics**:
  - **Ring Health System**: Just like the classics, rings protect you. If you get hit while holding rings, you lose them but survive. If you get hit with 0 rings, it's Game Over.
  - **Power-Ups**: Collect **Shields** (Blue Bubble) for extra protection and **Magnets** (Purple Field) to attract rings automatically.
  - **Play-to-Mint**: The total number of rings collected during a run can be minted to your crypto wallet as `RING` tokens.

## ✨ Key Features

### Web3 & Economy
- **Wallet Connection**: Seamless integration with MetaMask.
- **ERC-20 Token Integration**: Mints `RING` tokens based on gameplay performance.
- **On-Chain Leaderboard**: The top 10 high scores are stored permanently on the blockchain.
- **Theme Shop**: Use your earned `RING` tokens to purchase new background themes (Green Hill, Marble Zone, etc.). Ownership is verified on-chain.

### Game Features
- **Character Roster**: Play as Sonic, Tails, Knuckles, Shadow, Amy, or Cream. Each character has unique stats (Speed, Jump, Bonus Multipliers).
- **Custom Assets**: Support for user-uploaded custom sprites (`/sprites`) and background themes (`/backgrounds`).
- **Dynamic Audio**: Includes a music player with 6 classic tracks and sound effects for ring collection and damage.
- **Responsive Controls**: Supports Keyboard (Space/Arrow Keys) and UI buttons.

## 🛠️ Tech Stack

### Frontend
- **React 19**: Component-based UI architecture.
- **TypeScript**: Strictly typed code for robustness.
- **Tailwind CSS**: Utility-first styling for the UI and overlays.
- **HTML5 Canvas**: High-performance rendering for the game loop (60 FPS).
- **Ethers.js v6**: Library for interacting with the Ethereum blockchain.

### Backend / Blockchain
- **Solidity**: Smart Contract language.
- **Remix IDE**: Used for contract development and deployment.
- **Sepolia Testnet**: The Ethereum test network used for transactions.

## 📂 Asset Management

To customize the game visuals, add your assets to the `public/` folder:

### Character Sprites
Frame-by-frame PNG animations located in `public/sprites/`.
Naming convention: `[name]_[action]_[frame].png`
*   Example: `sonic_run_1.png` to `sonic_run_8.png`
*   Example: `amy_idle_1.png` to `amy_idle_8.png`

### Background Themes
Background PNGs located in `public/backgrounds/`.
*   `greenhill.png`
*   `marble.png`
*   `starlight.png`
*   `chemical.png`

## 🚀 Deployment & Setup

### 1. Smart Contract
1. Open [Remix IDE](https://remix.ethereum.org/).
2. Create a file `SonicRingRunner.sol` and paste the contract code.
3. Compile the contract.
4. Deploy to **Injected Provider - MetaMask** (Ensure you are on **Sepolia**).
5. Copy the **Contract Address**.

### 2. Frontend Configuration
1. Open `constants.ts`.
2. Replace `CONTRACT_ADDRESS` with your deployed address:
   ```typescript
   export const CONTRACT_ADDRESS = '0xC5562C1D050c3cfCC3ed410B91BF4b2650D07EE2';
   ```

### 3. Running Locally
```bash
# Install dependencies
npm install

# Start development server
npm start
```

## 📜 License
This project is for educational and portfolio purposes. Sonic the Hedgehog assets and IP belong to SEGA.
