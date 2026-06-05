import React, { useEffect, useState } from 'react';

interface PartySheet {
  id: number;
  x: number; // left percentage
  delay: number; // custom delays seconds
  duration: number; // custom duration seconds
  color: string;
  size: number;
}

export const Confetti: React.FC = () => {
  const [particles, setParticles] = useState<PartySheet[]>([]);

  useEffect(() => {
    const colors = ['#EC4899', '#8B5CF6', '#F59E0B', '#3B82F6', '#10B981', '#EF4444'];
    const temps: PartySheet[] = Array.from({ length: 60 }).map((_, idx) => ({
      id: idx,
      x: Math.random() * 100, // 0 to 100%
      delay: Math.random() * 2, // 0s - 2s delay
      duration: 3 + Math.random() * 3, // 3s - 6s descent
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 10 // size in px
    }));
    setParticles(temps);

    // Auto terminate after 6 seconds to save system CPU cycles
    const timer = setTimeout(() => {
      setParticles([]);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Styles block injected for CSS transitions */}
      <style>{`
        @keyframes fall-gravity {
          0% {
            transform: translateY(-20px) rotate(0deg) skewX(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(105vh) rotate(360deg) skewX(15deg);
            opacity: 0.3;
          }
        }
        .confetti-particle {
          position: absolute;
          top: -20px;
          animation-name: fall-gravity;
          animation-timing-function: linear;
          animation-iteration-count: 1;
          animation-fill-mode: forwards;
        }
      `}</style>
      
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.x}%`,
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size * 1.5}px`,
            borderRadius: '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`
          }}
        />
      ))}
    </div>
  );
};
