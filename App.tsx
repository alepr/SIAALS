import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  // displayData se usará para mostrar valores suavizados en la UI
  const [displayData, setDisplayData] = useState<MvpData>(INITIAL_MVP_DATA);
  // objetivo objetivoIllum (0..1) para día/noche; la UI se suaviza hacia data.energy.illumination
  const targetIllumRef = useRef<number>(1);
  const [isNight, setIsNight] = useState<boolean>(false);
  const rafRef = useRef<number | null>(null);

  // util: interpolación lineal simple
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  // util: interpola arrays [x,y]
  const lerpPos = (a: number[], b: number[], t: number) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

  // Deep lerp para los campos que queremos suavizar en displayData
  const smoothTowards = (from: MvpData, to: MvpData, t: number): MvpData => {
    const out: MvpData = JSON.parse(JSON.stringify(from));

    // Energía
    out.energy.batteryLevel = lerp(from.energy.batteryLevel, to.energy.batteryLevel, t);
    out.energy.solarOutput = lerp(from.energy.solarOutput, to.energy.solarOutput, t);
    out.energy.nightTime = to.energy.nightTime; // boolean, no lerp

    // Habitat
    out.habitat.co2 = lerp(from.habitat.co2, to.habitat.co2, t);

    // Thermal
    out.thermal.temp = lerp(from.thermal.temp, to.thermal.temp, t);
    out.thermal.heating = lerp(from.thermal.heating, to.thermal.heating, t);

  // Lander fields
  out.lander.temp = lerp(from.lander.temp, to.lander.temp, t);
  out.lander.power = lerp(from.lander.power, to.lander.power, t);
  out.lander.status = to.lander.status;

  // Communications
  out.communications.signalStrength = lerp(from.communications.signalStrength, to.communications.signalStrength, t);
  out.communications.status = to.communications.status;

  // Iluminación (0..1)
  if (typeof from.energy.illumination === 'undefined') from.energy.illumination = 1;
  if (typeof to.energy.illumination === 'undefined') to.energy.illumination = to.energy.nightTime ? 0 : 1;
  out.energy.illumination = lerp(from.energy.illumination, to.energy.illumination, t);

    // Rovers: posiciones y batería suavizadas
    out.rovers = from.rovers.map((r, i) => {
      const target = to.rovers[i];
      return {
        ...r,
        location: lerpPos(r.location, target.location, t) as [number, number],
        battery: lerp(r.battery, target.battery, t),
        status: target.status
      } as any;
    }) as [any, any];

    // Crew: suavizar biometrics y scores
    out.crew = from.crew.map((c, i) => {
      const tgt = to.crew[i];
      const copy = { ...c } as any;
      copy.stressScore = lerp(c.stressScore, tgt.stressScore, t);
      copy.productivityScore = lerp(c.productivityScore, tgt.productivityScore, t);
      copy.biometrics.activityLevel = lerp(c.biometrics.activityLevel, tgt.biometrics.activityLevel, t);
      copy.biometrics.heartRate = lerp(c.biometrics.heartRate, tgt.biometrics.heartRate, t);
      copy.biometrics.hrv = lerp(c.biometrics.hrv, tgt.biometrics.hrv, t);
      copy.biometrics.spo2 = lerp(c.biometrics.spo2, tgt.biometrics.spo2, t);
      copy.wellnessScore = lerp(c.wellnessScore, tgt.wellnessScore, t);
      // Mantener niveles/categorías basadas en target
      copy.stressLevel = tgt.stressLevel;
      return copy as any;
    }) as any;

    // Mission
    out.mission.day = lerp(from.mission.day, to.mission.day, t);
    out.mission.productivity = lerp(from.mission.productivity, to.mission.productivity, t);

    return out;
  }
  // Parámetros configurables para suavizado (ajustables)
  const DISPLAY_LERP_T = 0.06; // menor = más suave
  const ROVER_MAX_STEP = 0.7; // paso máximo por tick para rovers (menor = más lento)
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

  // Asegurar campo illumination
  if (typeof newData.energy.illumination === 'undefined') newData.energy.illumination = newData.energy.nightTime ? 0 : 1;
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

        // Suavizar iluminación del día/noche hacia el objetivo (targetIllumRef)
        const illumTarget = targetIllumRef.current;
        const I_STEP = 0.02; // cuánto cambia por tick (ajusta para más/menos paulatino)
        if (Math.abs(newData.energy.illumination - illumTarget) > I_STEP) {
          newData.energy.illumination += (newData.energy.illumination < illumTarget ? I_STEP : -I_STEP);
        } else {
          newData.energy.illumination = illumTarget;
        }

        // Ajustar nightTime booleano basado en illumination umbral para compatibilidad
        newData.energy.nightTime = newData.energy.illumination < 0.5;

        newData.lander.status = componentStatus.lander ? 'en línea' : 'desconectado';
        newData.communications.status = componentStatus.communications ? 'en línea' : 'desconectado';
        newData.thermal.status = componentStatus.thermal ? 'en línea' : 'desconectado';
        
    // Roaming logic: cada rover tiene un objetivo (target) hacia el que se mueve con velocidad limitada.
    newData.rovers.forEach((rover, index) => {
      const key = `rover${index + 1}` as ComponentKey;
      // Introducimos campos target para que el rover no salte a coordenadas aleatorias
      if (!('target' in (rover as any))) {
        (rover as any).target = [...rover.location];
      }

      const roverAny = rover as any;
      // Si el componente está activo y hay batería, elegimos ocasionalmente un nuevo objetivo cercano
      if (componentStatus[key] && rover.battery > 10) {
        rover.battery -= 0.05; // consumo por tick

        // Chance pequeña de elegir un nuevo target para variar la ruta
        if (Math.random() < 0.08) {
          const SPAWN_RADIUS = 30;
          roverAny.target[0] = rover.location[0] + (Math.random() - 0.5) * SPAWN_RADIUS;
          roverAny.target[1] = rover.location[1] + (Math.random() - 0.5) * SPAWN_RADIUS;
        }

        // Interpolamos la posición hacia el target con velocidad máxima
        const dx = roverAny.target[0] - rover.location[0];
        const dy = roverAny.target[1] - rover.location[1];
        const distance = Math.sqrt(dx*dx + dy*dy) || 0.0001;
                const MAX_STEP = ROVER_MAX_STEP; // paso máximo por tick
                const step = Math.min(MAX_STEP, distance);
        rover.location[0] += (dx / distance) * step;
        rover.location[1] += (dy / distance) * step;

        rover.status = rover.battery > 50 ? (Math.random() > 0.5 ? 'activo' : 'muestreando') : 'en espera';

        // Mantener dentro de límites
        const MAX_DISTANCE = 50; // Define maximum allowed distance
        rover.location[0] = Math.max(-MAX_DISTANCE, Math.min(MAX_DISTANCE, rover.location[0]));
        rover.location[1] = Math.max(-MAX_DISTANCE, Math.min(MAX_DISTANCE, rover.location[1]));
      } else {
        rover.status = 'desconectado';
      }
    });

        // Mission & Crew Simulation
        newData.mission.day += 0.01; // Advance mission day
        
        let totalProductivity = 0;
        let highStressIncidents = 0;


        //Crew Simulation

        newData.crew = newData.crew.map(member => {
            const updatedMember = updateCrewMember(member, isCurrentlyNight, newData.habitat.co2);
            totalProductivity += updatedMember.productivityScore;
            if (updatedMember.stressLevel === 'alto' && member.stressLevel !== 'alto' && Math.random() < 0.1) {
              highStressIncidents++;
            }
            return updatedMember;
        });
        
        //Calculations from Crew
        newData.mission.productivity = totalProductivity / newData.crew.length;
        newData.mission.incidents += highStressIncidents;

        return newData;
      });
    }, TELEMETRY_UPDATE_INTERVAL_MS);

    return () => clearInterval(simulationInterval);
  }, [componentStatus]);

  // Loop de RAF para suavizar displayData hacia data
  useEffect(() => {
    const tick = () => {
      setDisplayData(prev => {
        // t pequeño para suavizar
        const t = DISPLAY_LERP_T;
        const sm = smoothTowards(prev, data, t);
        return sm;
      });
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
  }, [data]);

   useEffect(() => {
    const dayNightInterval = setInterval(() => {
      setIsNight(prev => !prev);
      // Toggle target illumination (0 = night, 1 = day). La simulación nudgeará la iluminación gradualmente.
      targetIllumRef.current = targetIllumRef.current < 0.5 ? 1 : 0;
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
          {/* Visual updates for lunar surface and Atacama environment would be best applied within the LunarSurface component */}
          <LunarSurface rovers={displayData.rovers} illumination={displayData.energy.illumination ?? 1} />
          <MissionStatusTabs mission={displayData.mission} crew={displayData.crew} />
        </main>
      </div>

      <div className="md:col-start-3 md:row-start-2">
        <TelemetryPanel data={displayData} />
      </div>
    </div>
  );
};

export default App;