import React from 'react';
import { useAppContext, convertTemp } from '../lib/store';
import { AppTheme } from '../types';

export default function Settings() {
  const { rules, theme, unit, updateRule, setTheme, setUnit } = useAppContext();

  const themes: { value: AppTheme; label: string; swatches: string[] }[] = [
    { value: 'technical', label: '預設 (Technical)', swatches: ['#E4E3E0', '#141414', '#FFFFFF', '#EF4444'] },
    { value: 'dark', label: '暗黑 (Dark)', swatches: ['#121212', '#E0E0E0', '#1E1E1E', '#f87171'] },
    { value: 'light', label: '明亮 (Light)', swatches: ['#F9FAFB', '#3B82F6', '#1F2937', '#DC2626'] },
    { value: 'ocean', label: '海洋 (Ocean)', swatches: ['#0F172A', '#0EA5E9', '#F8FAFC', '#EF4444'] },
    { value: 'forest', label: '森林 (Forest)', swatches: ['#F1F8F5', '#15803D', '#166534', '#EF4444'] },
    { value: 'cyber', label: '賽博龐克 (Cyberpunk)', swatches: ['#09090B', '#D946EF', '#A3E635', '#FF003C'] },
    { value: 'sunset', label: '日落 (Sunset)', swatches: ['#FEF2F2', '#EF4444', '#7F1D1D', '#B91C1C'] },
    { value: 'minimal', label: '極簡 (Minimalist)', swatches: ['#FFFFFF', '#000000', '#F3F4F6', '#DC2626'] },
    { value: 'contrast', label: '高對比 (High Contrast)', swatches: ['#000000', '#FFFF00', '#FFFF00', '#FF0000'] },
    { value: 'terminal', label: '終端機 (Terminal)', swatches: ['#000000', '#00FF00', '#003300', '#FF0000'] },
  ];

  return (
    <div className="page-enter max-w-5xl p-4 md:p-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">系統設定</h2>
        <p className="col-header mt-2">SYSTEM SETTINGS</p>
        <p className="mt-3 max-w-2xl text-sm text-[var(--muted)]">
          可在此調整顯示主題、溫度單位與全域警報規則，快速配合不同工站或監控需求。
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <section className="panel-card p-6">
          <h3 className="mb-4 text-xl font-bold">偏好設定</h3>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium">溫度單位 (Temperature Unit)</p>
              <p className="mt-1 text-sm text-[var(--muted)]">切換攝氏或華氏後，圖表與規則門檻會同步更新顯示。</p>
            </div>
            <div className="flex rounded-xl border border-[var(--line)] bg-[var(--bg)]/70 p-1">
              <button
                onClick={() => setUnit('C')}
                className={`rounded-lg px-4 py-2 text-sm font-bold ${unit === 'C' ? 'bg-[var(--accent)] text-[var(--accent-text)] shadow-sm' : 'hover:bg-[var(--line)]'}`}
              >
                °C
              </button>
              <button
                onClick={() => setUnit('F')}
                className={`rounded-lg px-4 py-2 text-sm font-bold ${unit === 'F' ? 'bg-[var(--accent)] text-[var(--accent-text)] shadow-sm' : 'hover:bg-[var(--line)]'}`}
              >
                °F
              </button>
            </div>
          </div>
        </section>

        <section className="panel-card p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold">外觀主題</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">每個主題都附有色票預覽，可快速挑選適合現場顯示器的配色。</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`rounded-2xl border p-4 text-left text-sm font-bold transition-all ${
                  theme === t.value
                    ? 'border-[var(--border-strong)] bg-[var(--accent)] text-[var(--accent-text)] shadow-lg'
                    : 'border-[var(--line)] bg-[var(--panel-bg)] hover:border-[var(--border-strong)] hover:-translate-y-0.5'
                }`}
              >
                <span className="block">{t.label}</span>
                <span className="mt-3 flex items-center gap-2">
                  {t.swatches.map((color) => (
                    <span
                      key={color}
                      className="h-3.5 w-3.5 rounded-full border border-black/10"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel-card p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold">全域警報規則設定 (Global Rules)</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">若個別感測器沒有覆寫值，系統將以這些全域門檻作為判斷基準。</p>
          </div>
          <div className="overflow-x-auto">
            <div className="data-grid min-w-[640px] overflow-hidden rounded-2xl">
              <div className="grid grid-cols-4 border-b border-[var(--line)] p-4 font-bold">
                <div>警報類型</div>
                <div>層級</div>
                <div>觸發溫度 (°{unit})</div>
                <div>狀態</div>
              </div>

              {rules.map((rule) => {
                const displayThreshold = convertTemp(rule.threshold, unit);
                return (
                  <div key={rule.id} className="grid grid-cols-4 items-center border-b border-[var(--line)] p-4 last:border-b-0">
                    <div className="font-medium">{rule.type}</div>
                    <div>
                      <span className={`rounded-sm px-2 py-1 text-xs font-bold uppercase tracking-wider ${
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
                            newVal = (newVal - 32) * 5 / 9;
                          }
                          updateRule({ ...rule, threshold: Number(newVal.toFixed(1)) });
                        }}
                        className="data-value w-24 border border-[var(--line)] bg-[var(--panel-bg)] px-2 py-1 text-[var(--ink)] outline-none"
                      />
                    </div>
                    <div>
                      <label className="flex cursor-pointer items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={(e) => updateRule({ ...rule, enabled: e.target.checked })}
                          className="h-4 w-4 accent-[var(--accent)]"
                        />
                        <span className="text-sm font-medium">{rule.enabled ? '啟用' : '停用'}</span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
