import React from 'react';
import type { CrewMember, StressLevel } from '../types';
import { HeartIcon, BrainIcon, AlertTriangleIcon } from './Icons';

const CrewProgressBar: React.FC<{ label: string; value: number; colorClass: string }> = ({ label, value, colorClass }) => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <span className="text-gray-400">{label}</span>
      <span className="font-orbitron text-white">{value.toFixed(0)}%</span>
    </div>
    <div className="w-full bg-gray-700/50 rounded-full h-1.5">
      <div className={`${colorClass} h-1.5 rounded-full`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

const BiometricStat: React.FC<{ icon: React.ReactNode, value: string, unit: string }> = ({ icon, value, unit }) => (
    <div className="flex items-center space-x-2 bg-gray-900/50 p-2 rounded-md">
        <div className="text-tech-green">{icon}</div>
        <div>
            <span className="font-orbitron text-lg text-white">{value}</span>
            <span className="text-xs text-gray-400 ml-1">{unit}</span>
        </div>
    </div>
)

const CrewMemberCard: React.FC<{ member: CrewMember }> = ({ member }) => {
  const stressColorMap: { [key in StressLevel]: string } = {
    bajo: 'bg-green-500/30 text-green-300',
    medio: 'bg-yellow-500/30 text-yellow-300',
    alto: 'bg-orange-500/30 text-orange-300',
    crítico: 'bg-red-600/40 text-red-300 animate-pulse',
  };

  const needsAttention = member.stressLevel === 'crítico' || member.productivityScore < 60;

  return (
    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <h3 className="font-orbitron text-md text-white flex items-center gap-2">
          {needsAttention && <AlertTriangleIcon className="w-4 h-4 text-orange-400" />}
          {member.name}
        </h3>
        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${stressColorMap[member.stressLevel]}`}>
          {member.stressLevel.toUpperCase()}
        </span>
      </div>
      <div className="space-y-2">
        <CrewProgressBar label="Bienestar" value={member.wellnessScore} colorClass="bg-blue-500" />
        <CrewProgressBar label="Productividad" value={member.productivityScore} colorClass="bg-green-500 " />
        <CrewProgressBar label="Rend. Cognitivo" value={member.cognitive.performance} colorClass="bg-purple-500" />
      </div>
      <div className="grid grid-cols-2 gap-2 mt-1">
        <BiometricStat icon={<HeartIcon className="w-5 h-5"/>} value={member.biometrics.heartRate.toFixed(0)} unit="bpm" />
        <BiometricStat icon={<BrainIcon className="w-5 h-5"/>} value={member.biometrics.hrv.toFixed(0)} unit="ms" />
      </div>
    </div>
  );
};

const CrewWellbeingPanel: React.FC<{ crew: CrewMember[] }> = ({ crew }) => {
  return (
    <div className="h-full">
        <h2 className="font-orbitron text-xl text-solar-blue mb-4">Estado de Bienestar de la Tripulación</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {crew.map((member) => (
            <CrewMemberCard key={member.id} member={member} />
        ))}
        </div>
    </div>
  );
};

export default CrewWellbeingPanel;