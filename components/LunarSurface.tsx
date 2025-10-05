import React from 'react';
import type { Rover } from '../types';

interface LunarSurfaceProps {
    rovers: Rover[];
}

const RoverMarker: React.FC<{ rover: Rover; index: number }> = ({ rover, index }) => {
    const statusColor = {
        'activo': 'fill-green-400',
        'muestreando': 'fill-blue-400',
        'en espera': 'fill-yellow-400',
        'desconectado': 'fill-gray-600'
    }[rover.status];

    const statusPulse = rover.status !== 'desconectado' ? 'animate-pulse' : '';
    const x = 50 + (rover.location[0] / 300) * 400;
    const y = 50 + (rover.location[1] / 200) * 300;
    
    return (
        <g transform={`translate(${x}, ${y})`}>
            <circle cx="0" cy="0" r="12" className={`${statusColor} opacity-20 ${statusPulse}`} />
            <circle cx="0" cy="0" r="6" className={statusColor} />
            <text x="10" y="4" className="fill-white text-[10px] font-sans">R-{index+1}</text>
        </g>
    )
}

const AtacamaBackground: React.FC = () => (
    <div
        className="absolute inset-0 overflow-hidden"
        style={{
            background: 'radial-gradient(ellipse at center, #5a3e2b 0%, #2a1a12 100%)',
        }}
    >
        <div className="absolute inset-0" style={{
            backgroundImage: `
                radial-gradient(circle at 15% 25%, rgba(188, 143, 143, 0.15) 0%, transparent 40%),
                radial-gradient(circle at 80% 70%, rgba(210, 105, 30, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 50% 60%, rgba(139, 69, 19, 0.15) 0%, transparent 45%)
            `,
            mixBlendMode: 'overlay'
        }} />
        <div className="absolute inset-0" style={{
             boxShadow: 'inset 0px 0px 150px 20px rgba(10, 14, 26, 0.9)'
        }}/>
         <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-[#0a0e1a] to-transparent"/>
    </div>
);

const LunarSurface: React.FC<LunarSurfaceProps> = ({ rovers }) => {
  return (
    <div className="bg-[#101626]/80 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4 flex-grow flex items-center justify-center relative overflow-hidden">
      <AtacamaBackground />
      <svg viewBox="0 0 500 400" className="w-full h-full relative z-10">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Craters/Rocks for texture */}
        <circle cx="150" cy="120" r="25" fill="#000" opacity="0.1" />
        <circle cx="350" cy="280" r="40" fill="#000" opacity="0.15" />
        <circle cx="250" cy="150" r="15" fill="#000" opacity="0.1" />
        
        {/* Lander and Tower */}
        <g transform="translate(250, 200)">
          <rect x="-15" y="-15" width="30" height="30" fill="#b0c4de" stroke="#fff" strokeWidth="0.5" />
          <text x="20" y="5" className="fill-white text-[12px] font-sans">Modulo Lunar</text>
          <path d="M 0 -20 L 0 -50" stroke="#00ff88" strokeWidth="2" filter="url(#glow)" />
          <path d="M 0 -50 L 10 -40 M 0 -50 L -10 -40" stroke="#00ff88" strokeWidth="2" />
        </g>

        {/* Rovers */}
        {rovers.map((rover, index) => <RoverMarker key={rover.id} rover={rover} index={index} />)}
      </svg>
    </div>
  );
};

export default LunarSurface;