import React from 'react';
import { useAppContext, convertTemp } from '../lib/store';
import { AlertTriangle, AlertCircle, BellRing } from 'lucide-react';

export default function Alarms() {
  const { alarms, unit, addTestAlarm } = useAppContext();

  return (
    <div className="page-enter p-4 md:p-8">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">警報紀錄</h2>
          <p className="col-header mt-2">ALARM HISTORY</p>
          <p className="mt-3 max-w-2xl text-sm text-[var(--muted)]">
            集中檢視系統警告與危險事件，可用測試推播快速驗證聲音與 toast 通知是否正常。
          </p>
        </div>
        <button
          onClick={addTestAlarm}
          className="inline-flex items-center justify-center space-x-2 rounded-xl border border-[var(--critical)] px-4 py-2.5 text-sm font-bold text-[var(--critical)] transition-colors hover:bg-[var(--critical)] hover:text-white"
        >
          <BellRing size={16} />
          <span>觸發測試推播警報</span>
        </button>
      </header>

      <div className="panel-card overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-5 border-b border-[var(--line)] bg-[var(--bg)]/70 p-4 font-bold">
              <div>時間 (TIME)</div>
              <div>烤箱 (OVEN)</div>
              <div>溫度計 (SENSOR)</div>
              <div>異常溫度 (TEMP)</div>
              <div>類型 (TYPE)</div>
            </div>

            {alarms.length === 0 ? (
              <div className="p-8 text-center col-header">尚無警報紀錄</div>
            ) : (
              alarms.map((alarm, index) => (
                <div
                  key={alarm.id}
                  className={`grid grid-cols-5 items-center border-b border-[var(--line)] p-4 transition-colors group hover:bg-[var(--ink)] hover:text-[var(--bg)] ${
                    index % 2 === 1 ? 'bg-[var(--line)]/15' : ''
                  }`}
                >
                  <div className="data-value text-sm opacity-80 group-hover:opacity-100">{alarm.timestamp}</div>
                  <div className="font-medium">{alarm.ovenId}</div>
                  <div className="font-medium">{alarm.sensorId}</div>
                  <div className="data-value text-lg font-bold">
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
      </div>
    </div>
  );
}
