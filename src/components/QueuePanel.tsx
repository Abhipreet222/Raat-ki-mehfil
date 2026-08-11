import React from 'react';
import { Track } from '@/lib/types';
import { X, Play, Trash2 } from 'lucide-react';

interface QueuePanelProps {
  isOpen: boolean;
  onClose: () => void;
  queue: Track[];
  upcomingTracks: Track[];
  currentTrack: Track | null;
  onRemoveFromQueue: (index: number) => void;
  onPlaySong: (track: Track) => void;
}

export default function QueuePanel({
  isOpen, onClose, queue, upcomingTracks, currentTrack, onRemoveFromQueue, onPlaySong
}: QueuePanelProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md p-4 md:p-8 flex flex-col font-sans text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-inknut">Queue</h2>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X /></button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {/* Now Playing */}
        <h3 className="text-sm text-white/50 mb-3 uppercase tracking-wider font-bold">Now Playing</h3>
        {currentTrack && (
          <div className="flex items-center gap-4 p-3 rounded-lg bg-white/10 mb-6">
            <div className="w-12 h-12 rounded overflow-hidden">
              <img src={currentTrack.coverUrl} alt="" className="object-cover w-full h-full" />
            </div>
            <div>
              <p className="text-base font-bold text-retro-blue leading-tight">{currentTrack.title}</p>
              <p className="text-sm text-white/70">{currentTrack.artist}</p>
            </div>
          </div>
        )}

        {/* Up Next (Manual Queue) */}
        {queue.length > 0 && (
          <>
            <h3 className="text-sm text-white/50 mb-3 uppercase tracking-wider font-bold">Up Next</h3>
            <div className="flex flex-col gap-2 mb-6">
              {queue.map((track, i) => (
                <div key={`${track.id}-${i}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 group">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-10 h-10 rounded overflow-hidden">
                      <img src={track.coverUrl} alt="" className="object-cover w-full h-full opacity-80" />
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-tight">{track.title}</p>
                      <p className="text-xs text-white/50">{track.artist}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onRemoveFromQueue(i)}
                    className="p-2 text-white/40 hover:text-red-400 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Upcoming in Playlist */}
        <h3 className="text-sm text-white/50 mb-3 uppercase tracking-wider font-bold">Next in Playlist</h3>
        <div className="flex flex-col gap-2">
          {upcomingTracks.map((track, i) => (
            <div key={`${track.id}-${i}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 group">
              <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => onPlaySong(track)}>
                <div className="relative w-10 h-10 rounded overflow-hidden">
                  <img src={track.coverUrl} alt="" className="object-cover w-full h-full opacity-80" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={16} fill="currentColor" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">{track.title}</p>
                  <p className="text-xs text-white/50">{track.artist}</p>
                </div>
              </div>
            </div>
          ))}
          {upcomingTracks.length === 0 && (
            <p className="text-sm text-white/30 italic px-2">No more tracks in playlist.</p>
          )}
        </div>
      </div>
    </div>
  );
}
