import React, { useState, useEffect } from 'react';
import { useAppContext, convertTemp } from '../lib/store';
import { Thermometer, AlertTriangle, Clock } from 'lucide-react';

interface DashboardProps {
  onSelectOven: (id: string) => void;
}

export default function Dashboard({ onSelectOven }: DashboardProps) {
  const { ovens, unit, lastTick } = useAppContext();
  const [countdown, setCountdown] = useState(5);
  const [selectedZone, setSelectedZone] = useState<string>('All');

  useEffect(() => {
    setCountdown(5);
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastTick]);

  const zones = ['All', ...Array.from(new Set(ovens.map(o => o.zone).filter(Boolean)))];
  const filteredOvens = selectedZone === 'All' ? ovens : ovens.filter(o => o.zone === selectedZone);

  return (
    <div className="p-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">烤箱狀態總覽</h2>
          <p className="col-header mt-2">OVEN STATUS OVERVIEW</p>
        </div>
        <div className="flex flex-col items-end gap-3 mt-4 md:mt-0">
          <div className="flex items-center space-x-2 text-[var(--muted)] text-sm border border-[var(--line)] px-3 py-1.5 rounded-full bg-[var(--panel-bg)] shadow-sm">
            <Clock size={14} className="animate-spin-slow text-[var(--accent)]" />
            <span className="font-mono font-bold text-[var(--ink)]">{countdown}</span> 
            <span>秒後同步最新資料</span>
          </div>

          <div className="flex bg-[var(--panel-bg)] border border-[var(--line)] rounded-md p-1 self-end">
            {zones.map(zone => (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                  selectedZone === zone 
                    ? 'bg-[var(--accent)] text-[var(--accent-text)]' 
                    : 'text-[var(--ink)] hover:bg-[var(--line)]'
                }`}
              >
                {zone === 'All' ? '全部區域' : zone}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {filteredOvens.map(oven => {
          const avgTemp = oven.sensors.reduce((acc, curr) => acc + curr.temperature, 0) / oven.sensors.length;
          const displayAvg = convertTemp(avgTemp, unit);
          
          let statusClass = 'border-[var(--line)] hover:bg-[var(--accent)] hover:text-[var(--accent-text)]';
          if (oven.status === 'critical') statusClass = 'animate-flash text-[var(--critical)]';
          else if (oven.status === 'warning') statusClass = 'bg-[var(--warning)] text-[var(--bg)] border-[var(--warning)] hover:opacity-80';

          return (
            <div 
              key={oven.id}
              onClick={() => onSelectOven(oven.id)}
              className={`data-grid p-4 cursor-pointer transition-colors flex flex-col justify-between h-auto min-h-32 relative overflow-hidden group ${statusClass}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold">{oven.name}</span>
                <div className="flex items-center gap-1">
                  {oven.zone && <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[var(--line)] rounded text-[var(--ink)] opacity-70">{oven.zone}</span>}
                  <Thermometer size={16} className="opacity-50" />
                </div>
              </div>
              
              <div className="mb-2">
                <div className="col-header mb-1" style={{ color: 'inherit' }}>AVG TEMP</div>
                <div className="data-value text-2xl font-bold">
                  {displayAvg.toFixed(1)}°{unit}
                </div>
              </div>

              {/* Detail Critical Sensors if any */}
              {oven.status === 'critical' && (
                <div className="mt-2 pt-2 border-t border-current/20">
                  <div className="text-[0.65rem] font-bold uppercase mb-1 flex items-center">
                    <AlertTriangle size={10} className="mr-1" />
                    Critical Sensors
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {oven.sensors.map(sensor => {
                       const warningThreshold = sensor.thresholds?.warning ?? 100;
                       const criticalThreshold = sensor.thresholds?.critical ?? 110;
                       if (sensor.temperature >= criticalThreshold) {
                         return (
                           <span key={sensor.id} className="text-[0.65rem] font-bold bg-[var(--critical)] text-white px-1 py-[2px] rounded border border-white/30 animate-pulse">
                             {sensor.name}: {convertTemp(sensor.temperature, unit).toFixed(1)}°{unit}
                           </span>
                         );
                       }
                       return null;
                    })}
                  </div>
                </div>
              )}

              {oven.oee && (
                 <div className="absolute opacity-40 group-hover:opacity-10 right-2 bottom-2 font-mono text-[0.6rem] font-bold mix-blend-difference pointer-events-none uppercase">
                   OEE: {oven.oee.toFixed(1)}%
                 </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
