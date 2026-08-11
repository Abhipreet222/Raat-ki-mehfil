import React, { useRef, useEffect } from 'react';
import { PlaylistMeta, Track } from '@/lib/types';
import { Play, Plus } from 'lucide-react';

interface PlaylistPanelProps {
  isOpen: boolean;
  onClose: () => void;
  playlists: PlaylistMeta[]; // kept for prop compatibility but unused in UI
  activePlaylistSlug: string;
  onSelectPlaylist: (slug: string) => void;
  tracks: Track[];
  currentTrack: Track | null;
  onPlaySong: (track: Track) => void;
  onQueueSong: (track: Track) => void;
}

export default function PlaylistPanel({
  isOpen, onClose, tracks, currentTrack, onPlaySong, onQueueSong
}: PlaylistPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside the panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto">
      {/* Invisible backdrop just to catch clicks for closing */}
      <div className="absolute inset-0 bg-transparent" />
      
      {/* Glassmorphism Floating Menu */}
      <div 
        ref={panelRef}
        className="relative z-10 w-[90%] max-w-2xl max-h-[60vh] overflow-y-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-[20px] shadow-2xl flex flex-col font-[family-name:var(--font-poppins)] text-white py-4 custom-scrollbar"
      >
        <div className="flex flex-col">
          {tracks.map((track, i) => (
            <div 
              key={track.id} 
              className={`flex items-center justify-between px-6 py-4 transition-colors group cursor-pointer ${currentTrack?.id === track.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
              onClick={() => onPlaySong(track)}
            >
              {/* Left: Number and Title */}
              <div className="flex items-center gap-4 flex-1 overflow-hidden">
                <span className="text-white/40 text-xs w-6 font-bold">{i + 1}</span>
                <p className="text-sm md:text-base font-bold truncate pr-4">{track.title}</p>
              </div>
              
              {/* Right: Artist and Queue Action */}
              <div className="flex items-center gap-4">
                <p className="text-xs md:text-sm text-white/60 truncate max-w-[150px] md:max-w-[200px] text-right">
                  {track.artist}
                </p>
                {/* Queue button appears on hover */}
                <button 
                  onClick={(e) => { e.stopPropagation(); onQueueSong(track); }}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Add to Queue"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
