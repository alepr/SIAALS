import React, { useState, useEffect, useCallback } from 'react';
import type { MvpData, ComponentKey, Rover, CrewMember } from './types';
import { INITIAL_MVP_DATA, TELEMETRY_UPDATE_INTERVAL_MS, LUNAR_DAY_DURATION_MS, SIMULATION_SPEED_FACTOR } from './constants';
import ControlPanel from './components/ControlPanel';
import TelemetryPanel from './components/TelemetryPanel';
import LunarSurface from './components/LunarSurface';
import MissionStatusTabs from './components/MissionStatusTabs';

const Header: React.FC = () => (
  <header className="col-span-3 bg-[#0a0e1a]/80 backdrop-blur-sm p-4 border-b border-gray-700/50 flex items-center justify-between z-10">
    <div>
      <h1 className="font-orbitron text-xl text-tech-green uppercase tracking-widest">SIAALS</h1>
      <p className="text-sm text-gray-400">Panel de Control Interactivo de Misión</p>
    </div>
    <div className="flex items-center space-x-2 text-tech-green font-orbitron">
      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      <span>SISTEMAS: EN LÍNEA</span>
    </div>
  </header>
);

const App: React.FC = () => {
  const [data, setData] = useState<MvpData>(INITIAL_MVP_DATA);
  const [isNight, setIsNight] = useState<boolean>(false);
  const [componentStatus, setComponentStatus] = useState({
      lander: true,
      communications: true,
      thermal: true,
      rover1: true,
      rover2: true
  });

  const handleToggleComponent = useCallback((key: ComponentKey) => {
      setComponentStatus(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const updateCrewMember = (member: CrewMember, isNight: boolean, habitatCO2: number): CrewMember => {
    const newMember = { ...member };

    // Update environmental context
    newMember.environmental.co2 = habitatCO2;

    // Stress simulation
    const stressFromTime = 0.005;
    const stressFromNight = isNight ? 0.01 : -0.005;
    const stressFromCO2 = habitatCO2 > 1200 ? 0.02 : -0.01;
    newMember.stressScore += stressFromTime + stressFromNight + stressFromCO2 + (Math.random() - 0.5) * 0.1;
    newMember.stressScore = Math.max(0, Math.min(100, newMember.stressScore));

    if (newMember.stressScore < 30) newMember.stressLevel = 'bajo';
    else if (newMember.stressScore < 60) newMember.stressLevel = 'medio';
    else if (newMember.stressScore < 85) newMember.stressLevel = 'alto';
    else newMember.stressLevel = 'crítico';
    
    // Performance Simulation (affected by stress and CO2)
    const stressImpact = 1 - (newMember.stressScore / 150);
    const co2Impact = 1 - (Math.max(0, habitatCO2 - 1000) / 4000); // Starts degrading after 1000ppm
    
    newMember.cognitive.performance = 100 * stressImpact * co2Impact + (Math.random() - 0.5) * 3;
    newMember.cognitive.performance = Math.max(50, Math.min(100, newMember.cognitive.performance));
    newMember.cognitive.lapses = newMember.stressScore > 70 || habitatCO2 > 1500 ? Math.floor(Math.random() * 3) : 0;

    newMember.productivityScore = 95 * stressImpact * co2Impact + (Math.random() - 0.5) * 5;
    newMember.productivityScore = Math.max(40, Math.min(100, newMember.productivityScore));
    
    // Biometrics Simulation
    newMember.biometrics.activityLevel = isNight ? 10 + Math.random() * 10 : 60 + Math.random() * 30;
    newMember.biometrics.heartRate = 60 + (newMember.stressScore / 10) + (newMember.biometrics.activityLevel / 10) + (Math.random() * 3);
    newMember.biometrics.hrv = 55 - (newMember.stressScore / 5) + (isNight ? 5 : -5) + (Math.random() * 5);
    newMember.biometrics.hrv = Math.max(20, newMember.biometrics.hrv);
    newMember.biometrics.spo2 = 98.5 - (Math.max(0, habitatCO2 - 1000) / 2000);
    newMember.biometrics.spo2 = Math.max(95, Math.min(100, newMember.biometrics.spo2));

    // Wellness Score
    newMember.wellnessScore = ((100 - newMember.stressScore) + newMember.productivityScore) / 2;

    return newMember;
  }

  useEffect(() => {
    const simulationInterval = setInterval(() => {
      setData(prevData => {
        const newData: MvpData = JSON.parse(JSON.stringify(prevData));

        const isCurrentlyNight = newData.energy.nightTime;

        // Habitat Simulation
        const co2Change = isCurrentlyNight ? -20 : 30; // Accumulates during day, scrubs at night
        newData.habitat.co2 += co2Change * Math.random();
        newData.habitat.co2 = Math.max(600, Math.min(1800, newData.habitat.co2));
        
        // Systems Simulation
        if (isCurrentlyNight) {
          newData.energy.solarOutput = 0;
          newData.energy.batteryLevel -= 0.05;
          newData.thermal.heating = componentStatus.thermal ? 75 : 0;
          newData.lander.temp = -180 + Math.random() * 10 - 5;
        } else {
          newData.energy.solarOutput = 1600 + Math.random() * 100 - 50;
          newData.energy.batteryLevel += 0.05;
          newData.thermal.heating = componentStatus.thermal ? 40 : 0;
          newData.lander.temp = 110 + Math.random() * 10 - 5;
        }
        newData.energy.batteryLevel = Math.max(0, Math.min(100, newData.energy.batteryLevel));
        newData.thermal.temp = isCurrentlyNight ? -200 + newData.thermal.heating * 2.1 : 120 - (40 - newData.thermal.heating)*2;

        newData.lander.status = componentStatus.lander ? 'en línea' : 'desconectado';
        newData.communications.status = componentStatus.communications ? 'en línea' : 'desconectado';
        newData.thermal.status = componentStatus.thermal ? 'en línea' : 'desconectado';
        
        newData.rovers.forEach((rover, index) => {
            const key = `rover${index + 1}` as ComponentKey;
            if (componentStatus[key] && rover.battery > 10) {
                rover.battery -= 0.05;
                rover.location[0] += (Math.random() - 0.5) * 2;
                rover.location[1] += (Math.random() - 0.5) * 2;
                rover.status = rover.battery > 50 ? (Math.random() > 0.5 ? 'activo' : 'muestreando') : 'en espera';
            } else {
                rover.status = 'desconectado';
            }
        });

        // Mission & Crew Simulation
        newData.mission.day += 0.01;
        
        let totalProductivity = 0;
        let highStressIncidents = 0;

        newData.crew = newData.crew.map(member => {
            const updatedMember = updateCrewMember(member, isCurrentlyNight, newData.habitat.co2);
            totalProductivity += updatedMember.productivityScore;
            if (updatedMember.stressLevel === 'alto' && member.stressLevel !== 'alto' && Math.random() < 0.1) {
              highStressIncidents++;
            }
            return updatedMember;
        });
        
        newData.mission.productivity = totalProductivity / newData.crew.length;
        newData.mission.incidents += highStressIncidents;

        return newData;
      });
    }, TELEMETRY_UPDATE_INTERVAL_MS);

    return () => clearInterval(simulationInterval);
  }, [componentStatus]);

   useEffect(() => {
    const dayNightInterval = setInterval(() => {
      setIsNight(prev => !prev);
      setData(prevData => ({
        ...prevData,
        energy: { ...prevData.energy, nightTime: !prevData.energy.nightTime }
      }));
    }, (LUNAR_DAY_DURATION_MS / 2) / SIMULATION_SPEED_FACTOR);
    
    return () => clearInterval(dayNightInterval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-200 grid grid-rows-[auto_1fr] grid-cols-1 md:grid-cols-[300px_1fr_350px] gap-4 p-4">
      <Header />

      <div className="md:col-start-1 md:row-start-2">
        <ControlPanel 
          componentStatus={componentStatus} 
          onToggle={handleToggleComponent} 
          isNight={isNight}
        />
      </div>

      <div className="md:col-start-2 md:row-start-2">
        <main className="col-span-1 flex flex-col gap-4 overflow-hidden min-h-0">
          <LunarSurface rovers={data.rovers} />
          <MissionStatusTabs mission={data.mission} crew={data.crew} />
        </main>
      </div>

      <div className="md:col-start-3 md:row-start-2">
        <TelemetryPanel data={data} />
      </div>
    </div>
  );
};

export default App;