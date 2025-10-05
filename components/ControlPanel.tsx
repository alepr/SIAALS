import React from 'react';
import type { ComponentKey } from '../types';
import { SunIcon, MoonIcon, PowerIcon, WifiIcon, ThermometerIcon, TruckIcon } from './Icons';

interface ToggleProps {
  label: string;
  isOn: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
}

const ToggleSwitch: React.FC<ToggleProps> = ({ label, isOn, onToggle, icon }) => (
  <div className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${isOn ? 'bg-tech-green/10 border-tech-green/50' : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50'}`}>
    <div className="flex items-center space-x-3">
      <span className={`text-tech-green ${!isOn && 'opacity-30'}`}>{icon}</span>
      <span className={`font-medium ${isOn ? 'text-white' : 'text-gray-500'}`}>{label}</span>
    </div>
    <button
      onClick={onToggle}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isOn ? 'bg-tech-green/80' : 'bg-gray-600'}`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isOn ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  </div>
);

interface ControlPanelProps {
  componentStatus: { [key in ComponentKey]: boolean };
  onToggle: (key: ComponentKey) => void;
  isNight: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ componentStatus, onToggle, isNight }) => {
  return (
    <aside className="row-start-2 bg-[#101626]/80 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4 flex flex-col gap-4 overflow-y-auto">
      <h2 className="font-orbitron text-xl text-solar-blue mb-2">Controles del Sistema</h2>

      <div className={`flex items-center justify-center p-4 rounded-lg border border-gray-700/50 ${isNight ? 'bg-indigo-900/40' : 'bg-yellow-600/30'}`}>
        {isNight ? <MoonIcon className="w-8 h-8 text-white" /> : <SunIcon className="w-8 h-8 text-yellow-300" />}
        <span className="ml-4 font-orbitron text-lg">{isNight ? 'NOCHE LUNAR' : 'DÍA LUNAR'}</span>
      </div>

      <div className="space-y-3">
        <ToggleSwitch 
          label="Módulo de Aterrizaje" 
          isOn={componentStatus.lander} 
          onToggle={() => onToggle('lander')} 
          icon={<PowerIcon className="w-5 h-5" />}
        />
        <ToggleSwitch 
          label="Comunicaciones" 
          isOn={componentStatus.communications} 
          onToggle={() => onToggle('communications')}
          icon={<WifiIcon className="w-5 h-5" />}
        />
        <ToggleSwitch 
          label="Sistema Térmico" 
          isOn={componentStatus.thermal} 
          onToggle={() => onToggle('thermal')} 
          icon={<ThermometerIcon className="w-5 h-5" />}
        />
        <ToggleSwitch 
          label="Rover-1" 
          isOn={componentStatus.rover1} 
          onToggle={() => onToggle('rover1')} 
          icon={<TruckIcon className="w-5 h-5" />}
        />
        <ToggleSwitch 
          label="Rover-2" 
          isOn={componentStatus.rover2} 
          onToggle={() => onToggle('rover2')} 
          icon={<TruckIcon className="w-5 h-5" />}
        />
      </div>
    </aside>
  );
};

export default ControlPanel;