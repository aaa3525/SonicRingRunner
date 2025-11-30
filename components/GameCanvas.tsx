import React, { useRef, useEffect, useState } from 'react';
import { CHARACTERS } from '../constants';
import { audioService } from '../services/audioService';
import { Theme, PowerUp } from '../types';

interface GameCanvasProps {
  selectedCharacterId: number;
  onGameOver: (score: number, heldRings: number, totalCollected: number) => void;
  gameState: 'menu' | 'playing' | 'paused' | 'gameover';
  setGameState: (state: 'menu' | 'playing' | 'paused' | 'gameover') => void;
  updateScore: (score: number, rings: number) => void;
  activeTheme: Theme;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  selectedCharacterId, 
  onGameOver, 
  gameState, 
  setGameState,
  updateScore,
  activeTheme
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  
  // Game State Refs (Mutable for performance)
  const playerRef = useRef({
    x: 100,
    y: 500,
    width: 60,
    height: 60,
    velocityY: 0,
    isJumping: false,
    speed: 5,
    direction: 'right',
    groundY: 540
  });

  const ringsRef = useRef<any[]>([]);
  const obstaclesRef = useRef<any[]>([]);
  const particlesRef = useRef<any[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]); // Track power-up monitors
  
  const scoreRef = useRef(0);
  const collectedRingsRef = useRef(0); // Current "Health/Shield" Rings
  const totalCollectedRef = useRef(0); // Total accumulated for Minting
  const frameCountRef = useRef(0);
  const invincibilityTimerRef = useRef(0); 
  const bgScrollRef = useRef(0);

  // Power-Up States
  const magnetTimerRef = useRef(0);
  const hasShieldRef = useRef(false);
  
  const charStats = CHARACTERS[selectedCharacterId];

  // Asset Refs (Using refs instead of state to avoid stale closures in game loop)
  const loadedRunImagesRef = useRef<HTMLImageElement[]>([]);
  const bgImageRef = useRef<HTMLImageElement | null>(null);

  // State to force re-render/re-effect when BG loads for the menu screen
  const [isBgLoaded, setIsBgLoaded] = useState(false);

  // Load Theme Background Image
  useEffect(() => {
    setIsBgLoaded(false); // Reset when theme changes
    const img = new Image();
    img.src = activeTheme.backgroundImage;
    img.onload = () => {
        bgImageRef.current = img;
        setIsBgLoaded(true); // Trigger effect to draw menu background
    };
    img.onerror = () => {
        bgImageRef.current = null;
        setIsBgLoaded(true);
    }
  }, [activeTheme]);

  // Load Images when character changes
  useEffect(() => {
    const loadImages = async () => {
        loadedRunImagesRef.current = []; // Clear previous
        
        const promises = charStats.runImagePaths.map(src => {
            return new Promise<HTMLImageElement>((resolve) => {
                const img = new Image();
                img.src = src;
                img.onload = () => resolve(img);
                img.onerror = () => resolve(img); // Resolve anyway to avoid blocking
            });
        });
        
        try {
            const imgs = await Promise.all(promises);
            // Filter only successfully loaded images (optional, but robust)
            // Here we keep them all so index logic stays simple, checking complete in draw loop
            loadedRunImagesRef.current = imgs;
        } catch (e) {
            console.error("Error loading character sprites", e);
        }
    };
    
    loadImages();
  }, [selectedCharacterId, charStats]);

  // Initialize Game
  const initGame = () => {
    playerRef.current = {
      x: 100,
      y: 540,
      width: 60,
      height: 60,
      velocityY: 0,
      isJumping: false,
      speed: charStats.speed,
      direction: 'right',
      groundY: 540
    };
    ringsRef.current = [];
    obstaclesRef.current = [];
    particlesRef.current = [];
    powerUpsRef.current = [];
    scoreRef.current = 0;
    collectedRingsRef.current = 0;
    totalCollectedRef.current = 0;
    frameCountRef.current = 0;
    invincibilityTimerRef.current = 0;
    bgScrollRef.current = 0;
    magnetTimerRef.current = 0;
    hasShieldRef.current = false;
    
    // Spawn initial rings
    for(let i=0; i<5; i++) spawnRing(800 + i * 200);
    
    updateScore(0, 0);
  };

  const spawnRing = (offsetX = 0) => {
    ringsRef.current.push({
      x: (offsetX || 1200) + Math.random() * 400,
      y: 350 + Math.random() * 150,
      width: 30,
      height: 30,
      rotation: 0
    });
  };

  const spawnObstacle = () => {
    // Basic Obstacles
    if (Math.random() < 0.01) {
      obstaclesRef.current.push({
        x: 1200,
        y: 540, // Ground Y
        width: 60,
        height: 60,
        color: activeTheme.colors.obstacle
      });
    }
    
    // Spawn Power-Up Monitor (Rare)
    if (Math.random() < 0.003) {
       powerUpsRef.current.push({
           x: 1200,
           y: 550, // On ground
           width: 50,
           height: 50,
           type: Math.random() > 0.5 ? 'magnet' : 'shield',
           active: true
       });
    }
  };

  const createParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 8; i++) {
      particlesRef.current.push({
        x, y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 30,
        color,
        type: 'sparkle'
      });
    }
  };

  const createRingLossParticles = (x: number, y: number, count: number) => {
    // Limit visuals to avoid performance tanking if player has 100 rings
    const visualCount = Math.min(count, 20); 
    
    for (let i = 0; i < visualCount; i++) {
        const angle = (Math.PI / visualCount) * i + Math.PI; // Arch upwards
        const speed = 5 + Math.random() * 10;
        particlesRef.current.push({
            x, y,
            vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 5,
            vy: Math.sin(angle) * speed - 5, // Upward bias
            life: 60,
            color: '#FFD700',
            type: 'ring', // Special type for scattered rings
            gravity: 0.5
        });
    }
  };

  const activatePowerUp = (type: 'magnet' | 'shield') => {
      audioService.playRingSound(); // Reusing sound for now
      if (type === 'magnet') {
          magnetTimerRef.current = 600; // 10 seconds @ 60fps
          // Visual flare
          createParticles(playerRef.current.x, playerRef.current.y, '#9333ea');
      } else if (type === 'shield') {
          hasShieldRef.current = true;
          createParticles(playerRef.current.x, playerRef.current.y, '#3b82f6');
      }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      const p = playerRef.current;
      if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') && !p.isJumping) {
        p.velocityY = -20; // Jump force
        p.isJumping = true;
      }
      if (e.key === 'Escape') {
        setGameState('paused');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, setGameState]);

  // Main Game Loop
  const update = () => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const p = playerRef.current;
    frameCountRef.current++;
    if (invincibilityTimerRef.current > 0) invincibilityTimerRef.current--;
    if (magnetTimerRef.current > 0) magnetTimerRef.current--;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Background
    const bgImg = bgImageRef.current;
    if (bgImg && bgImg.naturalWidth > 0) {
        // Scroll speed slower than foreground (parallax)
        const bgSpeed = 2; 
        bgScrollRef.current = (bgScrollRef.current - bgSpeed) % canvas.width;
        
        // Draw twice to seamless loop
        ctx.drawImage(bgImg, bgScrollRef.current, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, bgScrollRef.current + canvas.width, 0, canvas.width, canvas.height);
    } else {
        // Fallback color
        ctx.fillStyle = activeTheme.colors.sky;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Ground
    ctx.fillStyle = activeTheme.colors.ground;
    ctx.fillRect(0, 600, canvas.width, 100);
    ctx.fillStyle = activeTheme.colors.grass; 
    ctx.fillRect(0, 600, canvas.width, 20);

    // Physics
    p.velocityY += 1; // Gravity
    p.y += p.velocityY;
    
    // Ground collision
    if (p.y >= p.groundY) {
      p.y = p.groundY;
      p.velocityY = 0;
      p.isJumping = false;
    }
    
    // Update Obstacles & Powerups
    obstaclesRef.current.forEach(obs => { obs.x -= 8; });
    powerUpsRef.current.forEach(pu => { pu.x -= 8; });
    
    // Magnet Physics Logic
    ringsRef.current.forEach(ring => { 
        ring.x -= 6; 
        ring.rotation += 0.1; 
        
        // Magnet Effect
        if (magnetTimerRef.current > 0) {
            const dx = p.x - ring.x;
            const dy = p.y - ring.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < 300) { // Magnet Range
                ring.x += dx * 0.1;
                ring.y += dy * 0.1;
            }
        }
    });

    // Remove off-screen
    obstaclesRef.current = obstaclesRef.current.filter(obs => obs.x > -100);
    ringsRef.current = ringsRef.current.filter(ring => ring.x > -100);
    powerUpsRef.current = powerUpsRef.current.filter(pu => pu.x > -100 && pu.active);

    // Spawn new
    spawnObstacle();
    if (Math.random() < 0.02) spawnRing();

    // Collision Detection
    // 1. Obstacles
    obstaclesRef.current.forEach(obs => {
        if (
            p.x < obs.x + obs.width &&
            p.x + p.width > obs.x &&
            p.y < obs.y + obs.height &&
            p.y + p.height > obs.y
        ) {
            // Check Invincibility
            if (invincibilityTimerRef.current > 0) return;

            // Check Shield Protection
            if (hasShieldRef.current) {
                hasShieldRef.current = false; // Break shield
                invincibilityTimerRef.current = 120;
                audioService.playDamageSound();
                createParticles(p.x, p.y, '#3b82f6');
                return;
            }

            // Check Ring Protection
            if (collectedRingsRef.current > 0) {
                createRingLossParticles(p.x, p.y, collectedRingsRef.current);
                collectedRingsRef.current = 0; // Lose rings
                updateScore(scoreRef.current, 0); 
                invincibilityTimerRef.current = 120;
                audioService.playDamageSound();
            } else {
                // DIE
                setGameState('gameover');
                audioService.playGameOverSound();
                onGameOver(scoreRef.current, collectedRingsRef.current, totalCollectedRef.current);
            }
        }
    });

    // 2. Power-Ups
    powerUpsRef.current.forEach(pu => {
        if (
            p.x < pu.x + pu.width &&
            p.x + p.width > pu.x &&
            p.y < pu.y + pu.height &&
            p.y + p.height > pu.y
        ) {
            activatePowerUp(pu.type);
            pu.active = false; // Remove
        }
    });

    // 3. Rings
    ringsRef.current = ringsRef.current.filter(ring => {
        if (
            p.x < ring.x + ring.width &&
            p.x + p.width > ring.x &&
            p.y < ring.y + ring.height &&
            p.y + p.height > ring.y
        ) {
            collectedRingsRef.current++;
            totalCollectedRef.current++; // Increment the bank
            scoreRef.current += 10;
            updateScore(scoreRef.current, collectedRingsRef.current);
            createParticles(ring.x, ring.y, '#FFD700');
            audioService.playRingSound();
            return false; // Remove
        }
        return true;
    });

    // --- DRAW PLAYER ---
    // Handle Flashing Effect when Invincible
    const isInvincible = invincibilityTimerRef.current > 0;
    const shouldDrawPlayer = !isInvincible || Math.floor(frameCountRef.current / 4) % 2 === 0;

    if (shouldDrawPlayer) {
        const images = loadedRunImagesRef.current;
        if (images.length > 0) {
            const animationSpeed = 4;
            const frameIndex = Math.floor(frameCountRef.current / animationSpeed) % images.length;
            const currentImage = images[frameIndex];

            // Strict check: Image must be complete and have width (not broken)
            if (currentImage && currentImage.complete && currentImage.naturalWidth > 0) {
                ctx.save();
                if (p.direction === 'left') {
                    ctx.translate(p.x + p.width, p.y);
                    ctx.scale(-1, 1);
                    ctx.drawImage(currentImage, 0, 0, p.width, p.height);
                } else {
                    ctx.drawImage(currentImage, p.x, p.y, p.width, p.height);
                }
                ctx.restore();
            } else {
                drawFallbackPlayer(ctx, p, charStats.color);
            }
        } else {
            drawFallbackPlayer(ctx, p, charStats.color);
        }

        // Draw Shield
        if (hasShieldRef.current) {
            ctx.save();
            ctx.strokeStyle = '#3b82f6'; // Blue shield
            ctx.lineWidth = 3;
            ctx.shadowColor = '#60a5fa';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(p.x + p.width/2, p.y + p.height/2, p.width/2 + 10, 0, Math.PI * 2);
            ctx.stroke();
            // Inner shine
            ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
            ctx.fill();
            ctx.restore();
        }

        // Draw Magnet Field
        if (magnetTimerRef.current > 0) {
            ctx.save();
            ctx.strokeStyle = `rgba(147, 51, 234, ${Math.abs(Math.sin(frameCountRef.current * 0.1))})`; // Pulsing purple
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(p.x + p.width/2, p.y + p.height/2, p.width + 40, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    // Draw Power-Up Monitors
    powerUpsRef.current.forEach(pu => {
        // Box
        ctx.fillStyle = '#475569';
        ctx.fillRect(pu.x, pu.y, pu.width, pu.height);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3;
        ctx.strokeRect(pu.x, pu.y, pu.width, pu.height);
        
        // Screen
        ctx.fillStyle = '#000';
        ctx.fillRect(pu.x + 8, pu.y + 8, pu.width - 16, pu.height - 16);
        
        // Icon
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            pu.type === 'magnet' ? '🧲' : '🛡️', 
            pu.x + pu.width/2, 
            pu.y + pu.height/2
        );
    });

    // Draw Rings
    ringsRef.current.forEach(ring => {
        ctx.save();
        ctx.translate(ring.x + ring.width/2, ring.y + ring.height/2);
        ctx.rotate(ring.rotation);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    });

    // Draw Obstacles
    obstaclesRef.current.forEach(obs => {
        ctx.fillStyle = activeTheme.colors.obstacle; 
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
        
        // Add Danger look
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.moveTo(obs.x + 10, obs.y + 10);
        ctx.lineTo(obs.x + obs.width - 10, obs.y + obs.height - 10);
        ctx.moveTo(obs.x + obs.width - 10, obs.y + 10);
        ctx.lineTo(obs.x + 10, obs.y + obs.height - 10);
        ctx.stroke();
    });

    // Draw Particles
    particlesRef.current.forEach((part, index) => {
        part.x += part.vx;
        part.y += part.vy;
        
        if (part.type === 'ring') {
            part.vy += part.gravity || 0.5;
            ctx.strokeStyle = part.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(part.x, part.y, 8, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            ctx.fillStyle = part.color;
            ctx.globalAlpha = part.life / 30;
            ctx.fillRect(part.x, part.y, 6, 6);
            ctx.globalAlpha = 1;
        }
        
        part.life--;
        if (part.life <= 0) particlesRef.current.splice(index, 1);
    });

    requestRef.current = requestAnimationFrame(update);
  };

  const drawFallbackPlayer = (ctx: CanvasRenderingContext2D, p: any, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(p.x + p.width/2, p.y + p.height/2, p.width/2, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(p.x + p.width - 15, p.y + 20, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(p.x + p.width - 12, p.y + 20, 3, 0, Math.PI * 2);
    ctx.fill();
  };

  useEffect(() => {
    if (gameState === 'playing') {
        if (scoreRef.current === 0 && collectedRingsRef.current === 0 && obstaclesRef.current.length === 0) {
            initGame();
        }
        requestRef.current = requestAnimationFrame(update);
    }
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState]);

  // Initial Draw (Menu background)
  useEffect(() => {
      if (gameState === 'menu' && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
              const width = canvasRef.current.width;
              const height = canvasRef.current.height;

              ctx.clearRect(0, 0, width, height);
              
              const bgImg = bgImageRef.current;
              // Check loaded ref AND naturalWidth to be sure
              if (bgImg && bgImg.naturalWidth > 0) {
                 ctx.drawImage(bgImg, 0, 0, width, height);
              } else {
                 ctx.fillStyle = activeTheme.colors.sky;
                 ctx.fillRect(0, 0, width, height);
              }

              ctx.fillStyle = activeTheme.colors.ground;
              ctx.fillRect(0, 600, width, 100);
              ctx.fillStyle = activeTheme.colors.grass; 
              ctx.fillRect(0, 600, width, 20);
          }
      }
  }, [gameState, activeTheme, isBgLoaded]); // Re-run when BG loads

  return (
    <div className="relative">
        <canvas 
            ref={canvasRef} 
            width={1000} 
            height={700}
            style={{ backgroundColor: activeTheme.colors.sky }}
            className="w-full h-auto rounded-lg shadow-inner border-4 border-blue-500 cursor-crosshair transition-colors duration-500"
        />
        {/* HUD for Active Powerups */}
        <div className="absolute top-4 right-4 flex gap-2">
            {/* Logic to show active powerups would go here in React state if we wanted HTML UI, 
                but visual effects on Canvas cover it well */}
        </div>
    </div>
  );
};

export default GameCanvas;