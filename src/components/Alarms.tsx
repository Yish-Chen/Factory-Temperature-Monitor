import React from 'react';
import { useAppContext, convertTemp } from '../lib/store';
import { AlertTriangle, AlertCircle, BellRing } from 'lucide-react';

export default function Alarms() {
  const { alarms, unit, addTestAlarm } = useAppContext();

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">警報紀錄</h2>
          <p className="col-header mt-2">ALARM HISTORY</p>
        </div>
        <button 
          onClick={addTestAlarm}
          className="flex items-center space-x-2 bg-transparent border border-[var(--critical)] text-[var(--critical)] hover:bg-[var(--critical)] hover:text-white px-4 py-2 rounded-md transition-colors text-sm font-bold"
        >
          <BellRing size={16} />
          <span>觸發測試推播警報</span>
        </button>
      </header>

      <div className="data-grid bg-[var(--panel-bg)]">
        <div className="grid grid-cols-5 p-4 border-b border-[var(--line)] font-bold">
          <div>時間 (TIME)</div>
          <div>烤箱 (OVEN)</div>
          <div>溫度計 (SENSOR)</div>
          <div>異常溫度 (TEMP)</div>
          <div>類型 (TYPE)</div>
        </div>
        
        {alarms.length === 0 ? (
          <div className="p-8 text-center col-header">尚無警報紀錄</div>
        ) : (
          alarms.map(alarm => (
            <div key={alarm.id} className="grid grid-cols-5 p-4 border-b border-[var(--line)] last:border-b-0 items-center hover:bg-[var(--ink)] hover:text-[var(--bg)] transition-colors group">
              <div className="data-value text-sm opacity-80 group-hover:opacity-100">{alarm.timestamp}</div>
              <div className="font-medium">{alarm.ovenId}</div>
              <div className="font-medium">{alarm.sensorId}</div>
              <div className="data-value font-bold text-lg">
                {convertTemp(alarm.temperature, unit).toFixed(1)}°{unit}
              </div>
              <div className="flex items-center space-x-2">
                {alarm.level === 'critical' ? (
                  <AlertTriangle size={16} className="text-[var(--critical)]" />
                ) : (
                  <AlertCircle size={16} className="text-[var(--warning)]" />
                )}
                <span className={`font-medium ${alarm.level === 'critical' ? 'text-[var(--critical)] group-hover:text-[var(--bg)]' : 'text-[var(--warning)] group-hover:text-[var(--bg)]'}`}>
                  {alarm.type}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
