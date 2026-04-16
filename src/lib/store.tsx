import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Oven, AlarmRecord, AlarmRule, AlarmLevel, AppTheme, TempUnit, SensorThresholds } from '../types';
import { generateInitialOvens, defaultRules } from './mockData';
import { format } from 'date-fns';

interface AppState {
  ovens: Oven[];
  alarms: AlarmRecord[];
  rules: AlarmRule[];
  theme: AppTheme;
  unit: TempUnit;
  lastTick: number;
  updateRule: (rule: AlarmRule) => void;
  setTheme: (theme: AppTheme) => void;
  setUnit: (unit: TempUnit) => void;
  updateSensorThreshold: (ovenId: string, sensorId: string, thresholds: SensorThresholds) => void;
  addTestAlarm: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [ovens, setOvens] = useState<Oven[]>([]);
  const [alarms, setAlarms] = useState<AlarmRecord[]>([]);
  const [rules, setRules] = useState<AlarmRule[]>(defaultRules);
  const [theme, setTheme] = useState<AppTheme>('technical');
  const [unit, setUnit] = useState<TempUnit>('C');
  const [lastTick, setLastTick] = useState<number>(Date.now());

  // Initialize
  useEffect(() => {
    setOvens(generateInitialOvens());
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    if (ovens.length === 0) return;

    const interval = setInterval(() => {
      setLastTick(Date.now());
      setOvens(prevOvens => {
        const newAlarms: AlarmRecord[] = [];
        
        const updatedOvens = prevOvens.map(oven => {
          let ovenStatus: 'normal' | 'warning' | 'critical' = 'normal';
          
          const updatedSensors = oven.sensors.map(sensor => {
            // Random walk for temperature
            const change = (Math.random() * 2) - 1;
            let newTemp = Number((sensor.temperature + change).toFixed(1));
            
            // Keep it somewhat realistic
            if (newTemp < 20) newTemp = 20;
            if (newTemp > 150) newTemp = 150;

            // Check rules
            let sensorLevel: AlarmLevel | null = null;
            let triggeredRule: AlarmRule | null = null;

            const warningThreshold = sensor.thresholds?.warning ?? rules.find(r => r.level === 'warning')?.threshold ?? 100;
            const criticalThreshold = sensor.thresholds?.critical ?? rules.find(r => r.level === 'critical')?.threshold ?? 110;

            if (newTemp >= criticalThreshold) {
              sensorLevel = 'critical';
              triggeredRule = rules.find(r => r.level === 'critical') || defaultRules[1];
            } else if (newTemp >= warningThreshold) {
              sensorLevel = 'warning';
              triggeredRule = rules.find(r => r.level === 'warning') || defaultRules[0];
            }

            if (triggeredRule && sensorLevel && Math.random() > 0.8) {
              newAlarms.push({
                id: Math.random().toString(36).substr(2, 9),
                timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                ovenId: oven.id,
                sensorId: sensor.id,
                temperature: newTemp,
                level: sensorLevel,
                type: triggeredRule.type,
              });
            }

            const newHistory = [...sensor.history.slice(1), { time: format(new Date(), 'HH:mm'), temperature: newTemp }];

            return {
              ...sensor,
              temperature: newTemp,
              history: newHistory,
              _tempLevel: sensorLevel // temporary storing level to compute ovenStatus safely
            };
          });

          // Compute oven status securely after mutations
          let computedOvenStatus: 'normal' | 'warning' | 'critical' = 'normal';
          if (updatedSensors.some(s => s._tempLevel === 'critical')) {
            computedOvenStatus = 'critical';
          } else if (updatedSensors.some(s => s._tempLevel === 'warning')) {
            computedOvenStatus = 'warning';
          }
          
          updatedSensors.forEach(s => delete s._tempLevel); // clean up

          // Simulate OEE dynamic changes
          let newOee = oven.oee || 90;
          if (computedOvenStatus === 'critical') {
             newOee = Math.max(0, newOee - (Math.random() * 0.5));
          } else if (computedOvenStatus === 'normal') {
             newOee = Math.min(100, newOee + (Math.random() * 0.1));
          }

          return {
            ...oven,
            sensors: updatedSensors,
            status: computedOvenStatus,
            oee: Number(newOee.toFixed(1))
          };
        });

        if (newAlarms.length > 0) {
          setAlarms(prev => [...newAlarms, ...prev].slice(0, 100)); // Keep last 100
        }

        return updatedOvens;
      });
    }, 5000); // Update every 5 seconds for demo purposes

    return () => clearInterval(interval);
  }, [ovens.length, rules]);

  const updateRule = (updatedRule: AlarmRule) => {
    setRules(prev => prev.map(r => r.id === updatedRule.id ? updatedRule : r));
  };

  const updateSensorThreshold = (ovenId: string, sensorId: string, thresholds: SensorThresholds) => {
    setOvens(prev => prev.map(oven => {
      if (oven.id === ovenId) {
        return {
          ...oven,
          sensors: oven.sensors.map(sensor => {
            if (sensor.id === sensorId) {
              return { ...sensor, thresholds };
            }
            return sensor;
          })
        };
      }
      return oven;
    }));
  };

  const addTestAlarm = () => {
    if (ovens.length === 0) return;
    const oven = ovens[Math.floor(Math.random() * ovens.length)];
    const sensor = oven.sensors[Math.floor(Math.random() * oven.sensors.length)];
    const testAlarm: AlarmRecord = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      ovenId: oven.id,
      sensorId: sensor.id,
      temperature: 150,
      level: 'critical',
      type: '手動測試警報',
    };
    
    setAlarms(prev => [testAlarm, ...prev].slice(0, 100));
    
    // Dispatch custom event for simulating push notification / toast
    const event = new CustomEvent('show-alarm-toast', { 
      detail: { message: `[測試推播] ${oven.name} - ${sensor.name} 溫度異常!` } 
    });
    window.dispatchEvent(event);
  };

  return (
    <AppContext.Provider value={{ ovens, alarms, rules, theme, unit, lastTick, updateRule, setTheme, setUnit, updateSensorThreshold, addTestAlarm }}>
      <div data-theme={theme} className="w-full min-h-screen theme-provider">
        {children}
      </div>
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Utility function to convert temperatures based on the selected unit
export const convertTemp = (tempInC: number, toUnit: TempUnit): number => {
  if (toUnit === 'F') {
    return Number(((tempInC * 9/5) + 32).toFixed(1));
  }
  return tempInC;
};

