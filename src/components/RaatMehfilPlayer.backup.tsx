// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, SkipBack, SkipForward, FastForward, Rewind } from 'lucide-react';
import { Track } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';

// Formatting seconds to M:SS
const formatTime = (timeInSeconds: number) => {
  if (isNaN(timeInSeconds)) return "0:00";
  const m = Math.floor(timeInSeconds / 60);
  const s = Math.floor(timeInSeconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function RaatMehfilPlayer() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [listeners, setListeners] = useState(0);

  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const dragStartY = useRef(0);
  const startVolume = useRef(1);

  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch playlist
  useEffect(() => {
    fetch('/api/playlist')
      .then(res => res.json())
      .then(data => {
        setTracks(data);
      })
      .catch(console.error);
  }, []);

  // Poll for listeners
  useEffect(() => {
    const fetchListeners = () => {
      fetch('/api/listeners')
        .then(res => res.json())
        .then(data => setListeners(data.count))
        .catch(console.error);
    };
    
    fetchListeners();
    const interval = setInterval(fetchListeners, 15000);
    return () => clearInterval(interval);
  }, []);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleVolumePointerDown = (e: React.PointerEvent) => {
    setIsDraggingVolume(true);
    dragStartY.current = e.clientY;
    startVolume.current = volume;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleVolumePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingVolume) return;
    const deltaY = dragStartY.current - e.clientY; // UP is positive
    const deltaVolume = deltaY / 100; // 100px drag for 0 to 100%
    
    let newVolume = startVolume.current + deltaVolume;
    newVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(newVolume);
    if (newVolume > 0) setIsMuted(false);
    if (newVolume === 0) setIsMuted(true);
  };

  const handleVolumePointerUp = (e: React.PointerEvent) => {
    setIsDraggingVolume(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const activeVolume = isMuted ? 0 : volume;
  const volumeRotation = -135 + (activeVolume * 270);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Playback failed:", e));
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleStop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  const handleNext = () => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const { currentTime, duration } = audioRef.current;
    setCurrentTime(currentTime);
    setDuration(duration || 0);
    if (duration > 0 && !isDraggingTimeline) {
      setProgress((currentTime / duration) * 100);
    }
  };

  const calculateProgressFromEvent = (e: React.PointerEvent) => {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    return (x / rect.width) * 100;
  };

  const handleTimelinePointerDown = (e: React.PointerEvent) => {
    setIsDraggingTimeline(true);
    const newProgress = calculateProgressFromEvent(e);
    setProgress(newProgress);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleTimelinePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingTimeline) return;
    const newProgress = calculateProgressFromEvent(e);
    setProgress(newProgress);
  };

  const handleTimelinePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingTimeline) return;
    setIsDraggingTimeline(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    
    const newProgress = calculateProgressFromEvent(e);
    if (audioRef.current && duration > 0) {
      const newTime = (newProgress / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleTrackEnded = () => {
    handleNext();
  };

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(e => {
        console.warn("Autoplay prevented:", e);
        setIsPlaying(false);
      });
    }
  }, [currentTrackIndex]);

  useEffect(() => {
    if (tracks.length > 0 && audioRef.current && !isPlaying) {
        audioRef.current.play().then(() => {
            setIsPlaying(true);
        }).catch(e => {
            console.warn("Browser blocked initial autoplay.");
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks]);

  if (!currentTrack) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black font-saira">
      {/* Audio Element */}
      <audio 
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnded}
      />

      {/* Background Image */}
      <div className="absolute inset-0 z-0 bg-black pointer-events-none">
        <Image 
          src="/background.png" 
          alt="Night background" 
          fill
          priority
          className="object-cover object-center"
        />
        {/* Bottom Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
      </div>

      {/* Top Bar: Listeners and Social Icons */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-start p-4 md:p-6 pointer-events-none">
        <div className="flex-1" />
        
        {/* Live Listeners Top Center */}
        <div className="flex-1 flex justify-center -mt-1 md:-mt-2">
          <div className="flex items-center gap-1.5 text-white text-xs font-medium tracking-wide drop-shadow-md bg-black/20 px-2.5 py-1 rounded-full backdrop-blur-sm pointer-events-auto font-[family-name:var(--font-poppins)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>{listeners} <span className="text-white/60">{listeners === 1 ? 'active soul' : 'active souls'}</span></span>
          </div>
        </div>

        {/* Social Icons Top Right */}
        <div className="flex-1 flex justify-end gap-4 md:gap-5 pointer-events-auto">
          <Link href="https://music.youtube.com/" className="group flex items-start gap-1 text-white hover:text-gray-300 drop-shadow-md transition-colors">
            {/* YouTube Icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 md:w-5 md:h-5">
              <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
              <path d="m10 15 5-3-5-3z" />
            </svg>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 md:w-3.5 md:h-3.5 mt-1.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-[2px] group-hover:-translate-y-[2px] transition-all">
              <line x1="7" y1="17" x2="17" y2="7"/>
              <polyline points="7 7 17 7 17 17"/>
            </svg>
          </Link>
          <Link href="#" className="group flex items-start gap-1 text-white hover:text-gray-300 drop-shadow-md transition-colors">
            {/* Instagram Icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 md:w-5 md:h-5">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
            {/* External Link Arrow */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 md:w-3.5 md:h-3.5 mt-1.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-[2px] group-hover:-translate-y-[2px] transition-all">
              <line x1="7" y1="17" x2="17" y2="7"/>
              <polyline points="7 7 17 7 17 17"/>
            </svg>
          </Link>
        </div>
      </div>

      {/* Tag Line Image Area */}
      <div className="absolute top-12 md:top-16 left-0 right-0 bottom-[350px] md:bottom-[400px] z-10 flex items-center justify-center px-4 pointer-events-none">
        <Image 
          src="/TAGLINE.png"
          alt="Tag line"
          width={300}
          height={150}
          className="object-contain w-2/5 max-w-[150px] md:max-w-[250px] lg:max-w-[300px] drop-shadow-[0_15px_35px_rgba(0,0,0,0.6)] mt-4 md:mt-6"
          priority
        />
      </div>

      {/* Main Retro Player Shell */}
      <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-3xl xl:max-w-4xl transform scale-[0.75] md:scale-[0.7] lg:scale-[0.65] xl:scale-[0.6] origin-bottom rounded-[30px] md:rounded-[40px] bg-retro-wood p-3 md:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex border-[3px] md:border-[4px] border-[#3a200d]">
        
        {/* Inner Plastic Shell */}
        <div className="w-full h-full rounded-[20px] md:rounded-[30px] bg-retro-ribbed shadow-retro-inset p-3 sm:p-5 flex flex-col md:flex-row gap-4 md:gap-6 relative overflow-hidden border-[2px] border-white/20">
          
          {/* Left Panel: Screen & Play Controls */}
          <div className="flex-[1.2] flex flex-col gap-3 md:gap-4">
            
            {/* Screen */}
            <div className="w-full h-40 md:h-52 bg-retro-screen rounded-xl shadow-retro-screen relative overflow-hidden border-[3px] border-black p-3 md:p-4 flex flex-col justify-end">
              <Image 
                src={currentTrack.coverUrl}
                alt="Cover art"
                fill
                className="object-cover opacity-50 mix-blend-luminosity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
              
              <div className="relative z-10 text-gray-300 font-sans text-xs md:text-sm leading-tight">
                <p className="text-gray-400 text-[10px] md:text-xs mb-0.5">Song: {currentTrack.title}</p>
                <p className="text-gray-400 text-[10px] md:text-xs mb-0.5">Singer: {currentTrack.artist}</p>
                
                <h2 className="text-xl md:text-2xl font-inknut text-white italic mt-1 md:mt-2 drop-shadow-md leading-tight">{currentTrack.title}</h2>
                <p className="text-xs font-inknut italic mt-1 drop-shadow-md text-gray-300">{currentTrack.artist}</p>
              </div>
            </div>

            {/* Play Controls Row */}
            <div className="flex justify-between items-center px-1 md:px-2 pt-1 md:pt-2 gap-1.5 md:gap-2">
              
              <button onClick={handlePrev} className="flex-1 h-10 md:h-12 bg-retro-plastic rounded-md shadow-retro-btn active:shadow-retro-btn-active flex items-center justify-center text-retro-blue active:translate-y-[2px] transition-all">
                <Rewind size={18} fill="currentColor" />
              </button>
              
              <button onClick={togglePlay} className="flex-[1.2] h-10 md:h-12 bg-retro-plastic rounded-md shadow-retro-btn active:shadow-retro-btn-active flex items-center justify-center text-retro-blue active:translate-y-[2px] transition-all">
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
              </button>
              
              <button onClick={handleStop} className="flex-1 h-10 md:h-12 bg-retro-plastic rounded-md shadow-retro-btn active:shadow-retro-btn-active flex items-center justify-center text-[#555] active:translate-y-[2px] transition-all">
                <Square size={14} fill="currentColor" />
                <Square size={14} fill="currentColor" className="ml-[-4px]" />
              </button>

              <button onClick={handleNext} className="flex-1 h-10 md:h-12 bg-retro-plastic rounded-md shadow-retro-btn active:shadow-retro-btn-active flex items-center justify-center text-retro-blue active:translate-y-[2px] transition-all">
                <FastForward size={18} fill="currentColor" />
              </button>
              
            </div>
          </div>

          {/* Right Panel: Display & Knobs */}
          <div className="flex-[1.3] flex flex-col gap-3 md:gap-4">
            
            {/* Top Display Window (Redesigned) */}
            <div className="w-full h-28 md:h-36 bg-gradient-to-b from-[#2a241f] to-[#1a1512] rounded-xl shadow-retro-screen border-[3px] border-black flex flex-col justify-between relative overflow-hidden pt-2">
              <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              
              {/* Progress Ruler */}
              <div 
                className="w-full mt-2 md:mt-4 px-4 md:px-6 flex-1 cursor-pointer touch-none"
                ref={timelineRef}
                onPointerDown={handleTimelinePointerDown}
                onPointerMove={handleTimelinePointerMove}
                onPointerUp={handleTimelinePointerUp}
                onPointerCancel={handleTimelinePointerUp}
              >
                <div className="relative w-full h-full pointer-events-none">
                  <div className="flex justify-between text-[#c4b9a3] text-xs md:text-sm font-sans font-bold mb-1.5 md:mb-2">
                    <span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                  </div>
                  <div className="w-full h-[6px] md:h-[8px] flex justify-between items-end border-b-[1.5px] border-[#4a4238] pb-1">
                    {[...Array(51)].map((_, i) => (
                      <div key={i} className={`w-[1.5px] md:w-[2px] ${i % 10 === 0 ? 'h-full bg-[#8c8270]' : 'h-1/2 bg-[#5c5448]'}`} />
                    ))}
                  </div>
                  {/* Pointer */}
                  <div 
                    className="absolute top-6 md:top-7 h-6 md:h-7 w-[3px] md:w-[4px] bg-[#fdf5e6] shadow-[0_0_8px_rgba(253,245,230,0.8)] z-10 rounded-sm -ml-[1.5px] md:-ml-[2px]"
                    style={{ 
                      left: `${progress}%`,
                      transition: isDraggingTimeline ? 'none' : 'left 0.3s linear'
                    }}
                  />
                </div>
              </div>

              {/* Status Text */}
              <div className="flex justify-between items-end px-3 md:px-5 pb-2 font-sans font-bold text-[10px] md:text-[11px]">
                <span className="text-[#8cdb97]">C-{(currentTrackIndex + 1).toString().padStart(2,'0')}/{tracks.length.toString().padStart(2,'0')}</span>
                <span className="text-gray-300 tracking-[0.3em]">0000</span>
                <span className="text-gray-300">{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
            </div>

            {/* Bottom Knobs and Text */}
            <div className="flex-1 flex items-end justify-between pr-4 md:pr-8 pl-2 md:pl-4 pb-1 relative">
              
              {/* Volume Knob */}
              <div className="flex flex-col items-center gap-1.5 md:gap-2 z-10 mb-2 md:mb-3">
                <button 
                  onPointerDown={handleVolumePointerDown}
                  onPointerMove={handleVolumePointerMove}
                  onPointerUp={handleVolumePointerUp}
                  onPointerCancel={handleVolumePointerUp}
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#d6ccaa] shadow-retro-btn border-[2px] border-[#f0ead6] flex items-center justify-center relative touch-none cursor-ns-resize active:shadow-retro-btn-active active:scale-95 transition-all"
                >
                  <div 
                    className="absolute w-full h-full transition-transform duration-75"
                    style={{ transform: `rotate(${volumeRotation}deg)` }}
                  >
                    <div className="w-[3px] md:w-[4px] h-[6px] md:h-[8px] bg-gray-500 rounded-full absolute top-1 md:top-2 left-1/2 -translate-x-1/2" />
                  </div>
                </button>
                <span className="text-[11px] md:text-xs text-retro-text tracking-widest font-bold">VOLUME</span>
              </div>

              {/* Tape Buttons */}
              <div className="flex flex-col items-center gap-1.5 md:gap-2 z-10 mb-1 md:mb-2">
                <div className="flex gap-2 md:gap-3">
                  {['A', 'B', 'C'].map((label) => (
                    <button key={label} className="w-8 h-10 md:w-10 md:h-12 bg-retro-plastic rounded-sm shadow-retro-btn active:shadow-retro-btn-active flex items-center justify-center text-retro-text text-[10px] md:text-xs font-bold active:translate-y-[2px] transition-all">
                      {label}
                    </button>
                  ))}
                  <div className="w-3 md:w-4 h-10 md:h-12 bg-black/80 rounded-full shadow-retro-inset ml-2 md:ml-3 relative">
                    <div className="w-full h-4 md:h-5 bg-gray-400 rounded-full absolute top-1 shadow-md" />
                  </div>
                </div>
                <span className="text-[11px] md:text-xs text-retro-text tracking-widest font-bold mt-1 md:mt-2">TAPE</span>
              </div>
            </div>

            {/* Branding Text */}
            <div className="w-full text-center mt-auto flex items-end justify-center gap-1.5 md:gap-2 z-0 pb-0.5">
              <span className="text-lg md:text-2xl font-black text-[#544638] tracking-wider uppercase drop-shadow-[1px_1px_0_rgba(255,255,255,0.4)]">
                SOOR TAAL
              </span>
              <span className="text-[7px] md:text-[9px] text-retro-text tracking-widest mb-0.5 md:mb-1 opacity-70 uppercase font-sans">
                STEREO CASSETTE RECORDER - 98 SO...
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* Floating Footer Text */}
      <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center pointer-events-none">
        <p className="text-white/40 text-[10px] md:text-xs tracking-[0.2em] font-[family-name:var(--font-poppins)]">
          Made with ❤️ by @Abhipreet
        </p>
      </div>
    </div>
  );
}
