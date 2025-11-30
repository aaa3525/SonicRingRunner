import React, { useState } from 'react';
import { Gamepad2, Volume2, VolumeX, Music } from 'lucide-react';
import { audioService } from '../services/audioService';
import { MUSIC_TRACKS } from '../constants';

const Header: React.FC = () => {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentTrackName, setCurrentTrackName] = useState(MUSIC_TRACKS[0].name);

  const toggleMusic = () => {
    const playing = audioService.toggleMusic();
    setIsMusicPlaying(playing);
  };

  const handleTrackSelect = (trackId: string) => {
    const track = MUSIC_TRACKS.find(t => t.id === trackId);
    if (track) {
      audioService.loadTrack(trackId);
      setCurrentTrackName(track.name);
      setIsDropdownOpen(false);
    }
  };

  return (
    <header className="max-w-7xl mx-auto mb-4 bg-blue-600 border-4 border-yellow-400 rounded-lg p-4 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3)]">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-yellow-400 p-2 rounded-lg">
            <Gamepad2 className="w-10 h-10 text-blue-800" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-yellow-300 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.5)] font-['Press_Start_2P'] tracking-tighter">
              SONIC RING RUNNER
            </h1>
            <p className="text-white text-sm opacity-90">Collect rings, mint tokens, beat the leaderboard!</p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          <button
            onClick={toggleMusic}
            className="p-3 bg-yellow-400 hover:bg-yellow-500 rounded-lg transition-all active:scale-95 border-b-4 border-yellow-600 text-blue-900"
            title="Toggle Music"
          >
            {isMusicPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-3 bg-blue-800 hover:bg-blue-700 rounded-lg transition-all active:scale-95 border-b-4 border-blue-900 text-yellow-400"
              title="Select Track"
            >
              <Music size={24} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-slate-900 border-2 border-yellow-400 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-md">
                <div className="bg-blue-600 p-3 border-b-2 border-yellow-400 text-white font-bold text-sm text-center tracking-wider">
                  🎵 Select Track
                </div>
                {MUSIC_TRACKS.map(track => (
                  <button
                    key={track.id}
                    onClick={() => handleTrackSelect(track.id)}
                    className={`w-full text-left p-3 text-sm text-white hover:bg-white/10 hover:pl-5 transition-all flex items-center gap-2 border-b border-white/10 ${currentTrackName === track.name ? 'bg-white/5 border-l-4 border-l-yellow-400 text-yellow-400 font-bold' : ''}`}
                  >
                    <span>{track.emoji}</span>
                    {track.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
