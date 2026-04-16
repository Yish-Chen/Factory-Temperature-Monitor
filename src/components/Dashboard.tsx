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

  const zones = ['All', ...Array.from(new Set(ovens.map((o) => o.zone).filter(Boolean)))];
  const filteredOvens = selectedZone === 'All' ? ovens : ovens.filter((o) => o.zone === selectedZone);
  const summary = {
    total: filteredOvens.length,
    normal: filteredOvens.filter((oven) => oven.status === 'normal').length,
    warning: filteredOvens.filter((oven) => oven.status === 'warning').length,
    critical: filteredOvens.filter((oven) => oven.status === 'critical').length,
  };

  const summaryCards = [
    { label: '總烤箱數', value: summary.total, tone: 'bg-slate-500' },
    { label: '正常', value: summary.normal, tone: 'bg-emerald-500' },
    { label: '警告', value: summary.warning, tone: 'bg-amber-500' },
    { label: '危險', value: summary.critical, tone: 'bg-rose-500' },
  ];

  return (
    <div className="page-enter p-4 md:p-8">
      <header className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">烤箱狀態總覽</h2>
          <p className="col-header mt-2">OVEN STATUS OVERVIEW</p>
          <p className="mt-3 max-w-2xl text-sm text-[var(--muted)]">
            即時掌握各區烤箱平均溫度、OEE 模擬值與異常感測器狀態，快速切換區域以聚焦現場風險。
          </p>
        </div>
        <div className="flex flex-col gap-3 xl:items-end">
          <div className="inline-flex items-center space-x-2 rounded-full border border-[var(--line)] bg-[var(--panel-bg)] px-3 py-2 text-sm text-[var(--muted)] shadow-sm">
            <Clock size={14} className="animate-spin-slow text-[var(--accent)]" />
            <span className="font-mono font-bold text-[var(--ink)]">{countdown}</span>
            <span>秒後同步最新資料</span>
          </div>

          <div className="flex flex-wrap gap-2 rounded-2xl border border-[var(--line)] bg-[var(--panel-bg)] p-2 shadow-sm xl:justify-end">
            {zones.map((zone) => (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  selectedZone === zone
                    ? 'bg-[var(--accent)] text-[var(--accent-text)] shadow-sm'
                    : 'text-[var(--ink)] hover:bg-[var(--line)]'
                }`}
              >
                {zone === 'All' ? '全部區域' : zone}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <div key={item.label} className="panel-card px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="col-header">{item.label}</p>
                <div className="data-value mt-2 text-3xl font-bold">{item.value}</div>
              </div>
              <span className={`h-3 w-3 rounded-full ${item.tone} shadow-[0_0_12px_rgba(0,0,0,0.2)]`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {filteredOvens.map((oven) => {
          const avgTemp = oven.sensors.reduce((acc, curr) => acc + curr.temperature, 0) / oven.sensors.length;
          const displayAvg = convertTemp(avgTemp, unit);

          let statusClass = 'border-[var(--line)] hover:border-[var(--accent)]';
          let statusBadgeClass = 'bg-emerald-500/15 text-emerald-600';
          let statusLabel = '正常';

          if (oven.status === 'critical') {
            statusClass = 'animate-flash border-[var(--critical)] text-[var(--critical)]';
            statusBadgeClass = 'bg-rose-500/15 text-rose-600';
            statusLabel = '危險';
          } else if (oven.status === 'warning') {
            statusClass = 'border-[var(--warning)] bg-[var(--warning)]/10';
            statusBadgeClass = 'bg-amber-500/15 text-amber-700';
            statusLabel = '警告';
          }

          return (
            <div
              key={oven.id}
              onClick={() => onSelectOven(oven.id)}
              className={`panel-card group relative flex h-auto min-h-40 cursor-pointer flex-col justify-between overflow-hidden p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${statusClass}`}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--accent)] via-transparent to-transparent opacity-70" />

              <div className="mb-4 flex items-start justify-between gap-3">
                <span className="font-bold">{oven.name}</span>
                <div className="flex items-center gap-1">
                  {oven.zone && <span className="rounded-full bg-[var(--line)] px-2 py-1 text-[10px] font-bold text-[var(--ink)]">{oven.zone}</span>}
                  <Thermometer size={16} className="opacity-50" />
                </div>
              </div>

              <div className="mb-4">
                <div className="col-header mb-1" style={{ color: 'inherit' }}>AVG TEMP</div>
                <div className="data-value text-3xl font-bold">
                  {displayAvg.toFixed(1)}°{unit}
                </div>
              </div>

              {oven.status === 'critical' && (
                <div className="mt-2 rounded-2xl border border-current/10 bg-current/5 p-3">
                  <div className="mb-2 flex items-center text-[0.65rem] font-bold uppercase">
                    <AlertTriangle size={10} className="mr-1" />
                    Critical Sensors
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {oven.sensors.map((sensor) => {
                      const criticalThreshold = sensor.thresholds?.critical ?? 110;
                      if (sensor.temperature >= criticalThreshold) {
                        return (
                          <span key={sensor.id} className="animate-pulse rounded border border-white/30 bg-[var(--critical)] px-1 py-[2px] text-[0.65rem] font-bold text-white">
                            {sensor.name}: {convertTemp(sensor.temperature, unit).toFixed(1)}°{unit}
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${statusBadgeClass}`}>
                  {statusLabel}
                </span>
                {oven.oee && (
                  <span className="inline-flex items-center rounded-full border border-[var(--line)] bg-[var(--bg)]/70 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide">
                    OEE {oven.oee.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
