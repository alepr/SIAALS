import React from 'react';
import type { MvpData, Rover } from '../types';
import { WifiIcon, ThermometerIcon, BatteryIcon, SunIcon } from './Icons';

const TelemetryItem: React.FC<{ label: string; value: string | number; unit?: string; colorClass?: string }> = ({ label, value, unit, colorClass = 'text-tech-green' }) => {
  const display = typeof value === 'number' ? (Number.isFinite(value) ? value : 0) : (value ?? '-');
  return (
    <div className="flex justify-between items-baseline text-sm min-w-0">
      <span className="text-gray-400 truncate mr-2">{label}</span>
      <span className={`font-orbitron font-medium ${colorClass} whitespace-nowrap truncate`}>{display}{unit}</span>
    </div>
  )
};

const ProgressBar: React.FC<{ label: string; value: number; colorClass: string }> = ({ label, value, colorClass }) => {
  const v = Number.isFinite(value) ? value : 0;
  const pct = Math.max(0, Math.min(100, v));
  return (
    <div className="w-full min-w-0">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400 truncate">{label}</span>
        <span className="font-orbitron text-white whitespace-nowrap">{pct.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-700/50 rounded-full h-2.5">
        <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
};

const RoverStatus: React.FC<{ rover: Rover }> = ({ rover }) => {
  const statusColor = {
    'activo': 'text-green-400',
    'muestreando': 'text-blue-400',
    'en espera': 'text-yellow-400',
    'desconectado': 'text-red-500'
  }[rover.status];

  return (
    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50 w-full min-w-0">
      <h4 className="font-orbitron text-solar-blue mb-2 text-base sm:text-lg">Rover-{rover.id}</h4>
      <div className="space-y-2 text-sm min-w-0">
        <div className="flex justify-between items-center min-w-0">
          <span className="text-gray-400 truncate">Estado</span>
          <span className={`${statusColor} font-bold ml-2 truncate`}>{rover.status.toUpperCase()}</span>
        </div>
        <ProgressBar label="Batería" value={rover.battery} colorClass="bg-tech-green" />
        <div className="flex justify-between items-center min-w-0">
          <span className="text-gray-400 truncate">Ubicación</span>
          <span className="font-orbitron text-white truncate max-w-[8rem] sm:max-w-[12rem]">{rover.location[0].toFixed(0)}, {rover.location[1].toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
};


const TelemetryPanel: React.FC<{ data: MvpData }> = ({ data }) => {
    const { lander, energy, communications, thermal, rovers } = data;
  const tempColor = lander.temp > 0 ? 'text-red-500' : 'text-blue-400';
  const landerStatusColor = lander.status === 'en línea' ? 'text-green-400' : 'text-red-500';

  return (
  <aside className="row-start-2 md:col-start-3 md:col-span-1 bg-[#101626]/90 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4 flex flex-col gap-4 overflow-y-auto w-full min-w-0 max-w-full h-full min-h-0 z-10">
      <h2 className="font-orbitron text-xl sm:text-2xl text-solar-blue mb-2">Telemetría en Vivo</h2>

  <div className="space-y-4 w-full min-w-0 min-h-0">
  <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50 space-y-2 w-full min-w-0">
            <h3 className="font-orbitron text-lg text-white/90">Sistemas de Energía</h3>
            <ProgressBar label="Batería Principal" value={energy.batteryLevel} colorClass="bg-solar-blue" />
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
      </div>
    </aside>
  );
};

export default TelemetryPanel;