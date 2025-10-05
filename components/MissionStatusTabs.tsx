import React, { useState } from 'react';
import type { Mission, CrewMember } from '../types';
import ExecutiveDashboard from './ExecutiveDashboard';
import CrewWellbeingPanel from './CrewWellbeingPanel';

interface MissionStatusTabsProps {
  mission: Mission;
  crew: CrewMember[];
}

const MissionStatusTabs: React.FC<MissionStatusTabsProps> = ({ mission, crew }) => {
  const [activeTab, setActiveTab] = useState<'executive' | 'crew'>('executive');

  const tabStyle = "px-4 py-2 font-orbitron text-sm transition-colors duration-300";
  const activeTabStyle = "bg-solar-blue/20 text-solar-blue border-b-2 border-solar-blue";
  const inactiveTabStyle = "text-gray-400 hover:bg-gray-700/50 rounded-t-md";

  return (
    <div className="bg-[#101626]/80 backdrop-blur-sm rounded-lg border border-gray-700/50 flex flex-col flex-grow overflow-hidden">
      <div className="flex border-b border-gray-700/50">
        <button 
          onClick={() => setActiveTab('executive')}
          className={`${tabStyle} ${activeTab === 'executive' ? activeTabStyle : inactiveTabStyle}`}
        >
          Resumen Ejecutivo
        </button>
        <button 
          onClick={() => setActiveTab('crew')}
          className={`${tabStyle} ${activeTab === 'crew' ? activeTabStyle : inactiveTabStyle}`}
        >
          Bienestar de Tripulación
        </button>
      </div>
      <div className="p-4 flex-grow overflow-y-auto">
        {activeTab === 'executive' ? (
          <ExecutiveDashboard mission={mission} crew={crew} />
        ) : (
          <CrewWellbeingPanel crew={crew} />
        )}
      </div>
    </div>
  );
};

export default MissionStatusTabs;