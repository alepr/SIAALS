export interface Lander {
  status: 'en línea' | 'desconectado' | 'en espera';
  temp: number;
  power: number;
  precision: number;
}

export interface Energy {
  solarOutput: number;
  batteryLevel: number;
  nightTime: boolean;
}

export interface Communications {
  status: 'en línea' | 'desconectado' | 'en espera';
  signalStrength: number;
  bandwidth: number;
  earthLink: boolean;
}

export interface Thermal {
  status: 'en línea' | 'desconectado' | 'en espera';
  heating: number;
  temp: number;
  insulation: string;
}

export interface Rover {
  id: number;
  status: 'activo' | 'muestreando' | 'en espera' | 'desconectado';
  location: [number, number];
  battery: number;
}

export interface Mission {
  phase: number;
  day: number;
  productivity: number;
  roi: number;
  crewCount: number;
  incidents: number;
}

export type StressLevel = 'bajo' | 'medio' | 'alto' | 'crítico';

export interface BiometricData {
  heartRate: number; // bpm
  hrv: number; // rmssd in ms
  spo2: number; // %
  activityLevel: number; // %
}

export interface CognitiveData {
  performance: number; // %
  lapses: number;
}

export interface EnvironmentalData {
  co2: number; // ppm
}

export interface CrewMember {
  id: number;
  name: string;
  stressLevel: StressLevel;
  stressScore: number; // 0-100
  productivityScore: number; // %
  wellnessScore: number; // %
  biometrics: BiometricData;
  cognitive: CognitiveData;
  environmental: EnvironmentalData;
}

export interface MvpData {
  lander: Lander;
  energy: Energy;
  communications: Communications;
  thermal: Thermal;
  rovers: [Rover, Rover];
  mission: Mission;
  crew: CrewMember[];
  habitat: {
    co2: number;
  };
}

export type ComponentKey = 'lander' | 'communications' | 'thermal' | 'rover1' | 'rover2';