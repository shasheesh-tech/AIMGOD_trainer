import React from 'react';
import { SpaceParticleBackground } from '../three/SpaceParticleBackground';

interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden">
      {/* Deep-Space Particle & Wavy Space Mat Background */}
      <SpaceParticleBackground />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Subtle Tactical Footer */}
      <footer className="relative z-10 border-t border-[#35383E]/60 bg-[#030406]/50 backdrop-blur-sm py-3 text-center text-xs font-mono text-[#9FA4AE]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#BEC7D7]" />
            <span>SYSTEM READY // V1.0 SHELL STAGE</span>
          </div>
          <div className="text-[#8F9196]">
            AimGOD Training Lab &bull; Browser 3D Precision Aim Trainer
          </div>
        </div>
      </footer>
    </div>
  );
};
