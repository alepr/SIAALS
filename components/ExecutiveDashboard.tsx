import React from 'react';
import type { Mission, CrewMember } from '../types';
import { BriefcaseIcon, ChartBarIcon, ShieldCheckIcon, UserGroupIcon, CalendarIcon } from './Icons';

interface MetricCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon }) => (
    <div className="bg-gray-800/50 p-3 rounded-lg flex items-center gap-3 border border-gray-700/50 overflow-hidden">
        <div className="p-2 bg-tech-green/20 rounded-lg text-tech-green flex-shrink-0">
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-400 truncate">{label}</div>
            <div className="text-2xl font-orbitron text-white">{value}</div>
        </div>
    </div>
);

const PhaseTimeline: React.FC<{ currentPhase: number }> = ({ currentPhase }) => {
    const phases = ['Fase 0: Despliegue', 'Fase 1: Calibración', 'Fase 2: Operación', 'Fase 3: Expansión'];
    return (
        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <h3 className="font-orbitron text-solar-blue mb-4">Línea de Tiempo Operacional</h3>
            <div className="flex justify-between items-center">
                {phases.map((phase, index) => (
                    <React.Fragment key={index}>
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${index <= currentPhase ? 'border-tech-green bg-tech-green/30' : 'border-gray-600'}`}>
                                {index < currentPhase ? '✓' : index + 1}
                            </div>
                            <div className={`mt-2 text-xs text-center ${index === currentPhase ? 'text-white font-bold' : 'text-gray-500'}`}>{phase}</div>
                        </div>
                        {index < phases.length - 1 && <div className={`flex-grow h-0.5 ${index < currentPhase ? 'bg-tech-green' : 'bg-gray-600'}`} />}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};


const ExecutiveDashboard: React.FC<{ mission: Mission; crew: CrewMember[] }> = ({ mission, crew }) => {
  const avgWellness = crew.reduce((acc, member) => acc + member.wellnessScore, 0) / crew.length;

  return (
    <div className="bg-[#101626]/80 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4 flex flex-col gap-4">
      <h2 className="font-orbitron text-xl text-solar-blue">Panel Ejecutivo</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard label="ROI Proyectado" value={`${mission.roi}%`} icon={<ChartBarIcon className="w-6 h-6"/>} />
        <MetricCard label="Productividad" value={`${mission.productivity.toFixed(0)}%`} icon={<BriefcaseIcon className="w-6 h-6"/>} />
        <MetricCard label="Día de Misión" value={mission.day.toFixed(0)} icon={<CalendarIcon className="w-6 h-6"/>} />
        <MetricCard label="Incidentes" value={mission.incidents} icon={<ShieldCheckIcon className="w-6 h-6"/>} />
        <MetricCard label="Moral" value={`${avgWellness.toFixed(0)}%`} icon={<UserGroupIcon className="w-6 h-6"/>} />
      </div>
      <PhaseTimeline currentPhase={mission.phase} />
    </div>
  );
};

export default ExecutiveDashboard;