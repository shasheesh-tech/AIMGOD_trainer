import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, FastForward, AlertTriangle } from 'lucide-react';

export const INTRO_VIDEO_PATH = '/videos/aimgod-intro.mp4.mp4';

type IntroPhase = 'ready' | 'playing' | 'fading' | 'error';

interface IntroOverlayProps {
  onRevealDashboard: () => void;
  onComplete: () => void;
}

const FADE_OUT_MS = 500;

export const IntroOverlay: React.FC<IntroOverlayProps> = ({
  onRevealDashboard,
  onComplete,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fadeTimerRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const [phase, setPhase] = useState<IntroPhase>('ready');
  const [isStarting, setIsStarting] = useState(false);

  const finishImmediately = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (fadeTimerRef.current !== null) {
      window.clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    const video = videoRef.current;
    if (video) {
      video.pause();
    }
    onRevealDashboard();
    onComplete();
  }, [onRevealDashboard, onComplete]);

  const startFadeOut = useCallback(() => {
    if (completedRef.current) return;
    setPhase('fading');
    onRevealDashboard();
    fadeTimerRef.current = window.setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    }, FADE_OUT_MS);
  }, [onRevealDashboard, onComplete]);

  // Clean up fade timer only on unmount
  useEffect(() => {
    return () => {
      if (fadeTimerRef.current !== null) {
        window.clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }
    };
  }, []);

  const handleEnterClick = async () => {
    const video = videoRef.current;
    if (!video) {
      finishImmediately();
      return;
    }

    setIsStarting(true);
    try {
      video.muted = false;
      video.volume = 1;
      video.currentTime = 0;
      await video.play();
      setPhase('playing');
    } catch {
      setPhase('error');
    } finally {
      setIsStarting(false);
    }
  };

  const handlePlaying = () => {
    setPhase((prev) => (prev === 'fading' ? prev : 'playing'));
  };

  const handleVideoError = () => {
    setPhase('error');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AimGODLabX Cinematic Intro"
      className={`fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden select-none transition-opacity duration-500 ease-out ${
        phase === 'fading' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Centered, aspect-ratio-preserving responsive video */}
      <video
        ref={videoRef}
        src={INTRO_VIDEO_PATH}
        playsInline
        preload="auto"
        onPlaying={handlePlaying}
        onEnded={startFadeOut}
        onError={handleVideoError}
        className={`w-full h-full object-contain transition-opacity duration-300 ${
          phase === 'playing' || phase === 'fading' ? 'opacity-100' : 'opacity-25'
        }`}
      />

      {/* Starting screen: waits for user click on "Enter AimGODLabX" */}
      {phase === 'ready' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center bg-black/55 backdrop-blur-[2px]">
          <div className="space-y-6 max-w-md animate-fade-in">
            <div className="space-y-2">
              <p className="text-[11px] font-mono uppercase tracking-[0.35em] text-[#9FA4AE]">
                PRECISION 3D TRAINING PLATFORM
              </p>
              <h1 className="text-3xl sm:text-5xl font-display font-bold tracking-wider text-[#E4E2E3] uppercase">
                Aim<span className="text-[#BEC7D7]">GOD</span>LabX
              </h1>
            </div>

            <button
              type="button"
              onClick={handleEnterClick}
              disabled={isStarting}
              className="group inline-flex items-center gap-3 px-7 py-3.5 rounded bg-[#BEC7D7] text-[#181C22] font-display font-bold text-sm uppercase tracking-wider shadow-lg shadow-black/60 hover:bg-[#E4E2E3] active:scale-[0.98] disabled:opacity-60 transition-all duration-150 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current transition-transform duration-150 group-hover:scale-110" />
              <span>{isStarting ? 'Starting...' : 'Enter AimGODLabX'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Playback / loading failure fallback */}
      {phase === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center bg-black/90">
          <div className="space-y-4 max-w-sm animate-fade-in">
            <div className="w-12 h-12 rounded-lg bg-[#18191B] border border-[#35383E] flex items-center justify-center mx-auto text-[#DAC3A8]">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-display font-bold text-[#E4E2E3] uppercase tracking-wide">
                Intro Video Unavailable
              </h2>
              <p className="text-xs font-mono text-[#9FA4AE]">
                The intro video could not be played in this browser.
              </p>
            </div>
            <button
              type="button"
              onClick={finishImmediately}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded bg-[#BEC7D7] text-[#181C22] font-display font-bold text-xs uppercase tracking-wider hover:bg-[#E4E2E3] transition-all cursor-pointer"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Subtle corner Skip Intro control */}
      {phase !== 'fading' && (
        <button
          type="button"
          onClick={finishImmediately}
          className="absolute bottom-6 right-6 z-20 inline-flex items-center gap-2 px-4 py-2 rounded bg-[#0a0b0e]/80 hover:bg-[#18191B] text-[#C5C6CC] hover:text-[#E4E2E3] border border-[#35383E] hover:border-[#8F9196] backdrop-blur-md text-xs font-mono uppercase tracking-wider transition-all duration-150 cursor-pointer"
        >
          <span>Skip Intro</span>
          <FastForward className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
