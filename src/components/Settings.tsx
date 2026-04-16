import React from 'react';
import { useAppContext, convertTemp } from '../lib/store';
import { AppTheme } from '../types';

export default function Settings() {
  const { rules, theme, unit, updateRule, setTheme, setUnit } = useAppContext();

  const themes: { value: AppTheme; label: string }[] = [
    { value: 'technical', label: '預設 (Technical)' },
    { value: 'dark', label: '暗黑 (Dark)' },
    { value: 'light', label: '明亮 (Light)' },
    { value: 'ocean', label: '海洋 (Ocean)' },
    { value: 'forest', label: '森林 (Forest)' },
    { value: 'cyber', label: '賽博龐克 (Cyberpunk)' },
    { value: 'sunset', label: '日落 (Sunset)' },
    { value: 'minimal', label: '極簡 (Minimalist)' },
    { value: 'contrast', label: '高對比 (High Contrast)' },
    { value: 'terminal', label: '終端機 (Terminal)' },
  ];

  return (
    <div className="p-8 max-w-4xl">
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">系統設定</h2>
        <p className="col-header mt-2">SYSTEM SETTINGS</p>
      </header>

      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 border-b border-[var(--line)] pb-2">偏好設定</h3>
        <div className="flex items-center space-x-4 mb-4">
          <span className="font-medium">溫度單位 (Temperature Unit):</span>
          <div className="flex bg-[var(--panel-bg)] border border-[var(--line)] rounded-md p-1">
            <button
              onClick={() => setUnit('C')}
              className={`px-3 py-1 rounded text-sm font-bold ${unit === 'C' ? 'bg-[var(--accent)] text-[var(--accent-text)]' : 'hover:bg-[var(--line)]'}`}
            >
              °C
            </button>
            <button
              onClick={() => setUnit('F')}
              className={`px-3 py-1 rounded text-sm font-bold ${unit === 'F' ? 'bg-[var(--accent)] text-[var(--accent-text)]' : 'hover:bg-[var(--line)]'}`}
            >
              °F
            </button>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 border-b border-[var(--line)] pb-2">外觀主題</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {themes.map(t => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={`p-3 rounded-md border text-sm font-bold transition-colors ${
                theme === t.value 
                  ? 'border-[var(--border-strong)] bg-[var(--accent)] text-[var(--accent-text)]' 
                  : 'border-[var(--line)] bg-[var(--panel-bg)] hover:border-[var(--border-strong)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 border-b border-[var(--line)] pb-2">全域警報規則設定 (Global Rules)</h3>
        <div className="data-grid">
          <div className="grid grid-cols-4 p-4 border-b border-[var(--line)] font-bold">
            <div>警報類型</div>
            <div>層級</div>
            <div>觸發溫度 (°{unit})</div>
            <div>狀態</div>
          </div>
          
          {rules.map(rule => {
            const displayThreshold = convertTemp(rule.threshold, unit);
            return (
              <div key={rule.id} className="grid grid-cols-4 p-4 border-b border-[var(--line)] last:border-b-0 items-center">
                <div className="font-medium">{rule.type}</div>
                <div>
                  <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-sm ${
                    rule.level === 'critical' ? 'bg-[var(--critical)] text-white' : 'bg-[var(--warning)] text-[var(--bg)]'
                  }`}>
                    {rule.level}
                  </span>
                </div>
                <div>
                  <input 
                    type="number" 
                    value={displayThreshold}
                    onChange={(e) => {
                      let newVal = Number(e.target.value);
                      if (unit === 'F') {
                        newVal = (newVal - 32) * 5/9; // Convert back to C to save
                      }
                      updateRule({ ...rule, threshold: Number(newVal.toFixed(1)) });
                    }}
                    className="data-value border border-[var(--line)] px-2 py-1 w-24 bg-[var(--panel-bg)] text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={rule.enabled}
                      onChange={(e) => updateRule({ ...rule, enabled: e.target.checked })}
                      className="w-4 h-4 accent-[var(--accent)]"
                    />
                    <span className="text-sm font-medium">{rule.enabled ? '啟用' : '停用'}</span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
