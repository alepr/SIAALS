import type { MvpData, CrewMember } from './types';

const createInitialCrew = (): CrewMember[] => {
  const members: CrewMember[] = [];
  for (let i = 1; i <= 6; i++) {
    members.push({
      id: i,
      name: `Astronauta-${i}`,
      stressLevel: 'bajo',
      stressScore: 15 + Math.random() * 10,
      productivityScore: 92 + Math.random() * 5,
      wellnessScore: 90 + Math.random() * 5,
      biometrics: {
        heartRate: 65 + Math.random() * 10,
        hrv: 55 + Math.random() * 10,
        spo2: 98 + Math.random(),
        activityLevel: 60 + Math.random() * 20,
      },
      cognitive: {
        performance: 95 + Math.random() * 5,
        lapses: 0,
      },
      environmental: {
        co2: 800,
      }
    });
  }
  return members;
};


export const INITIAL_MVP_DATA: MvpData = {
  lander: { status: "en línea", temp: -180, power: 200, precision: 100 },
  energy: { solarOutput: 1600, batteryLevel: 85, nightTime: false },
  // 1.0 = día, 0.0 = noche
  // (se añadirá en runtime si falta)
  communications: { status: "en línea", signalStrength: 92, bandwidth: 10, earthLink: true },
  thermal: { status: "en línea", heating: 75, temp: -40, insulation: "optimal" },
  rovers: [
    { id: 1, status: "activo", location: [20, 10], battery: 78 },
    { id: 2, status: "muestreando", location: [-10, -5], battery: 82 }
  ],
  mission: { 
    phase: 2, 
    day: 45, 
    productivity: 87, 
    roi: 16,
    crewCount: 6,
    incidents: 2
  },
  crew: createInitialCrew(),
  habitat: {
    co2: 800,
  }
};

export const LUNAR_DAY_DURATION_MS = 14.77 * 24 * 60 * 60 * 1000;
export const SIMULATION_SPEED_FACTOR = 100000; // Speeds up the cycle for demo
export const TELEMETRY_UPDATE_INTERVAL_MS = 1000;