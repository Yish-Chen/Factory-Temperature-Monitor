import { Oven, Sensor, AlarmRule } from '../types';
import { subMinutes, format } from 'date-fns';

export const generateInitialOvens = (): Oven[] => {
  const ovens: Oven[] = [];
  for (let i = 1; i <= 18; i++) {
    const numSensors = Math.floor(Math.random() * 3) + 3; // 3 to 5 sensors
    const sensors: Sensor[] = [];
    for (let j = 1; j <= numSensors; j++) {
      const history = [];
      let currentTemp = 80 + Math.random() * 20; // 80 to 100
      for (let k = 60; k >= 0; k--) {
        history.push({
          time: format(subMinutes(new Date(), k), 'HH:mm'),
          temperature: Number((currentTemp + (Math.random() * 4 - 2)).toFixed(1)),
        });
      }
      sensors.push({
        id: `S${i}-${j}`,
        name: `溫度計 ${j}`,
        temperature: Number(currentTemp.toFixed(1)),
        capacity: 100 * j, // Mock capacity
        history,
      });
    }
    
    // Simulate initial OEE
    const oee = 80 + Math.random() * 19; // 80% to 99%
    
    // Assign zones (A區, B區, C區)
    const zones = ['A區', 'B區', 'C區'];
    const zone = zones[(i - 1) % 3];

    ovens.push({
      id: `OVEN-${i.toString().padStart(2, '0')}`,
      name: `烤箱 ${i.toString().padStart(2, '0')}`,
      zone,
      sensors,
      status: 'normal',
      oee: Number(oee.toFixed(1))
    });
  }
  return ovens;
};

export const defaultRules: AlarmRule[] = [
  { id: '1', type: '高溫警告', threshold: 100, level: 'warning', enabled: true },
  { id: '2', type: '超高溫危險', threshold: 110, level: 'critical', enabled: true },
];

