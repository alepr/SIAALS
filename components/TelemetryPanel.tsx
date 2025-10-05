import React from 'react';
import type { MvpData, Rover } from '../types';
import { WifiIcon, ThermometerIcon, BatteryIcon, SunIcon } from './Icons';

const TelemetryItem: React.FC<{ label: string; value: string | number; unit?: string; colorClass?: string }> = ({ label, value, unit, colorClass = 'text-tech-green' }) => (
  <div className="flex justify-between items-baseline text-sm min-w-0">
    <span className="text-gray-400 truncate mr-2">{label}</span>
    <span className={`font-orbitron font-medium ${colorClass} whitespace-nowrap truncate`}>{value}{unit}</span>
  </div>
);

const ProgressBar: React.FC<{ label: string; value: number; colorClass: string }> = ({ label, value, colorClass }) => (
  <div className="w-full min-w-0">
    <div className="flex justify-between text-sm mb-1">
      <span className="text-green-400 truncate">{label}</span>
      <span className="font-orbitron text-white whitespace-nowrap">{value.toFixed(1)}%</span>
    </div>
    <div className="w-full bg-green-700/50 rounded-full h-2.5">
      <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

const RoverStatus: React.FC<{ rover: Rover }> = ({ rover }) => {
  const statusColor = {
    'activo': 'text-green-400',
    'muestreando': 'text-blue-400',
    'en espera': 'text-yellow-400',
    'desconectado': 'text-red-500'
  }[rover.status];

  return (
    <div className="bg-gray-800/50 p-3 rounded-lg border border-red-700/50 w-full min-w-0">
      <h4 className="font-orbitron text-solar-blue mb-2 text-base sm:text-lg">Rover-{rover.id}</h4>
      <div className="space-y-2 text-sm min-w-0">
        <div className="flex justify-between items-center min-w-0">
          <span className="text-gray-400 truncate">Estado</span>
          <span className={`${statusColor} font-bold ml-2 truncate`}>{rover.status.toUpperCase()}</span>
        </div>
        <ProgressBar label="Batería" value={rover.battery} colorClass="bg-red-500" />
        <div className="flex justify-between items-center min-w-0">
          <span className="text-green-400 truncate">Ubicación</span>
          <span className="font-orbitron text-white truncate max-w-[8rem] sm:max-w-[12rem]">{rover.location[0].toFixed(0)}, {rover.location[1].toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
};


const TelemetryPanel: React.FC<{ data: MvpData; onOpenCarousel?: (start?: number) => void }> = ({ data, onOpenCarousel }) => {
    const { lander, energy, communications, thermal, rovers } = data;
  const tempColor = lander.temp > 0 ? 'text-red-500' : 'text-blue-400';
  const landerStatusColor = lander.status === 'en línea' ? 'text-green-400' : 'text-red-500';

  return (
  <aside className="row-start-2 md:col-start-3 md:col-span-1 bg-[#101626]/90 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4 flex flex-col gap-4 overflow-y-auto w-full min-w-0 max-w-full h-full min-h-0 z-10">
      <h2 className="font-orbitron text-xl sm:text-2xl text-solar-blue mb-2">Telemetría en Vivo</h2>

  <div className="space-y-4 w-full min-w-0 min-h-0">
  <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50 space-y-2 w-full min-w-0">
            <h3 className="font-orbitron text-lg text-white/90">Sistemas de Energía</h3>
            <ProgressBar label="Batería Principal" value={energy.batteryLevel} colorClass="bg-blue-500" />
            <TelemetryItem label="Producción Solar" value={energy.solarOutput.toFixed(0)} unit=" W" />
        </div>
        
        <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50 space-y-2 w-full min-w-0">
            <h3 className="font-orbitron text-lg text-white/90">Módulo de Aterrizaje</h3>
            <TelemetryItem label="Temp. Módulo" value={lander.temp.toFixed(1)} unit=" °C" colorClass={tempColor} />
            <TelemetryItem label="Consumo Eléctrico" value={lander.power} unit=" W" />
            <TelemetryItem label="Estado" value={lander.status.toUpperCase()} colorClass={landerStatusColor} />
        </div>
        
        <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50 space-y-2 w-full min-w-0">
            <h3 className="font-orbitron text-lg text-white/90">Comms y Térmico</h3>
            <TelemetryItem label="Intensidad Señal" value={communications.signalStrength} unit=" %" />
            <TelemetryItem label="Calefacción" value={thermal.heating.toFixed(0)} unit=" W" />
            <TelemetryItem label="Temp. Interna" value={thermal.temp.toFixed(1)} unit=" °C" colorClass={thermal.temp > 0 ? 'text-yellow-500' : 'text-cyan-400'}/>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          <RoverStatus rover={rovers[0]} />
          <RoverStatus rover={rovers[1]} />
        </div>
        
          <div className="pt-2">
            <button
              onClick={() => onOpenCarousel && onOpenCarousel(0)}
              className="w-full flex items-center justify-center gap-2 bg-solar-blue/20 text-solar-blue hover:bg-solar-blue/30 p-2 rounded-md border border-solar-blue/30"
            >
              <img src="/images/plan-1.svg" alt="plan thumb" className="w-6 h-6 object-cover rounded" />
              <span className="font-orbitron">Ver planos (Carousel)</span>
            </button>
          </div>
                    <div className="pt-2">
            <button
              onClick={() => window.open('/calculoEnergetico.html', '_blank')}
              className="w-full flex items-center justify-center gap-2 bg-green-600/10 text-green-300 hover:bg-green-600/20 p-2 rounded-md border border-green-600/20 mt-2"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12h18" stroke="#86efac" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 5v14" stroke="#86efac" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-orbitron">Cálculo Energético</span>
            </button>
          </div>
      </div>
    </aside>
  );
};

export default TelemetryPanel;