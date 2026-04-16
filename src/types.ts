export type AlarmLevel = 'warning' | 'critical';

export type AppTheme = 
  | 'technical' 
  | 'dark' 
  | 'light' 
  | 'ocean' 
  | 'forest' 
  | 'cyber' 
  | 'sunset' 
  | 'minimal' 
  | 'contrast' 
  | 'terminal';

export type TempUnit = 'C' | 'F';

export interface SensorThresholds {
  warning?: number;
  critical?: number;
}

export interface Sensor {
  id: string;
  name: string;
  temperature: number;
  capacity: number;
  thresholds?: SensorThresholds;
  history: { time: string; temperature: number }[];
}

export interface Oven {
  id: string;
  name: string;
  zone: string; // Add zone classification
  sensors: Sensor[];
  status: 'normal' | 'warning' | 'critical';
  oee: number; // Overall Equipment Effectiveness
}

export interface AlarmRecord {
  id: string;
  timestamp: string;
  ovenId: string;
  sensorId: string;
  temperature: number;
  level: AlarmLevel;
  type: string;
}

export interface AlarmRule {
  id: string;
  type: string;
  threshold: number;
  level: AlarmLevel;
  enabled: boolean;
}



