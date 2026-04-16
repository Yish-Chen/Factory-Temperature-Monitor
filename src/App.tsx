import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './lib/store';
import { Activity, Bell, Settings as SettingsIcon, X, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from './lib/utils';
import Dashboard from './components/Dashboard';
import OvenDetail from './components/OvenDetail';
import Alarms from './components/Alarms';
import Settings from './components/Settings';

type Page = 'dashboard' | 'oven' | 'alarms' | 'settings';

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.error('Audio play failed');
  }
}

function NotificationToast() {
  const { alarms, unit } = useAppContext();
  const [visibleAlarm, setVisibleAlarm] = useState<any>(null);

  useEffect(() => {
    if (alarms.length > 0) {
      const latest = alarms[0];
      const isRecent = new Date().getTime() - new Date(latest.timestamp).getTime() < 5000;
      if (latest.level === 'critical' && isRecent) {
        setVisibleAlarm(latest);
        playBeep();
        const timer = setTimeout(() => setVisibleAlarm(null), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [alarms]);

  useEffect(() => {
    const handleCustomToast = (e: any) => {
      setVisibleAlarm({
        ovenId: 'TEST',
        sensorId: 'MSG',
        temperature: '-',
        isCustomObj: true,
        customMsg: e.detail.message,
      });
      playBeep();
      setTimeout(() => setVisibleAlarm(null), 5000);
    };

    window.addEventListener('show-alarm-toast', handleCustomToast);
    return () => window.removeEventListener('show-alarm-toast', handleCustomToast);
  }, []);

  if (!visibleAlarm) return null;

  return (
    <div className="toast-enter fixed bottom-4 right-4 z-50 flex max-w-sm items-start space-x-4 rounded-2xl border border-white/20 bg-[var(--critical)]/95 p-4 text-white shadow-2xl shadow-[rgba(239,68,68,0.28)] backdrop-blur-md">
      <div className="mt-1 rounded-full bg-white/15 p-2">
        <Bell className="toast-pulse" size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-bold text-lg">系統警報鈴聲模擬：嚴重異常！</h4>
        {visibleAlarm.isCustomObj ? (
          <p className="mt-1 text-sm text-white/90">{visibleAlarm.customMsg}</p>
        ) : (
          <p className="mt-1 text-sm text-white/90">
            {visibleAlarm.ovenId} - {visibleAlarm.sensorId} 溫度異常: {visibleAlarm.temperature}°{unit}
          </p>
        )}
      </div>
      <button onClick={() => setVisibleAlarm(null)} className="rounded-lg p-1.5 transition-colors hover:bg-black/20">
        <X size={16} />
      </button>
    </div>
  );
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedOvenId, setSelectedOvenId] = useState<string | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const navigateToOven = (id: string) => {
    setSelectedOvenId(id);
    setCurrentPage('oven');
    setIsMobileSidebarOpen(false);
  };

  const navigateToPage = (page: Page) => {
    setCurrentPage(page);
    setIsMobileSidebarOpen(false);
  };

  const sidebarButtonClass = (page: Page) =>
    cn(
      'w-full flex items-center py-3 rounded-xl transition-all duration-200',
      isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center',
      currentPage === page
        ? 'bg-[var(--accent)] text-[var(--accent-text)] shadow-[0_10px_30px_rgba(0,0,0,0.12)]'
        : 'hover:bg-[var(--line)]/70 hover:translate-x-1',
    );

  return (
    <div className="h-screen flex overflow-hidden">
      <div
        className={`fixed inset-0 z-30 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 md:hidden ${
          isMobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[82vw] max-w-72 flex-col border-r border-[var(--line)] bg-[var(--panel-bg)]/95 shadow-2xl backdrop-blur-md transition-transform duration-300 md:static md:translate-x-0 md:shadow-none md:backdrop-blur-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isSidebarExpanded ? 'md:w-72' : 'md:w-20'} shrink-0`}
      >
        <div className="flex h-18 items-center justify-between border-b border-[var(--line)] p-4">
          {isSidebarExpanded && (
            <div>
              <h1 className="w-40 truncate font-sans text-xl font-bold tracking-tight">溫度監控中樞</h1>
              <p className="col-header mt-1">Factory Temperature Monitor</p>
            </div>
          )}
          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="hidden rounded-lg p-2 transition-colors hover:bg-[var(--line)] md:inline-flex"
            aria-label={isSidebarExpanded ? '收合側邊欄' : '展開側邊欄'}
          >
            {isSidebarExpanded ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </button>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="rounded-lg p-2 transition-colors hover:bg-[var(--line)] md:hidden"
            aria-label="關閉側邊欄"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 p-3">
          <button onClick={() => navigateToPage('dashboard')} className={sidebarButtonClass('dashboard')} title="總覽 (Dashboard)">
            <Activity size={18} />
            {isSidebarExpanded && <span className="font-medium whitespace-nowrap">總覽 (Dashboard)</span>}
          </button>
          <button onClick={() => navigateToPage('alarms')} className={sidebarButtonClass('alarms')} title="警報紀錄 (Alarms)">
            <Bell size={18} />
            {isSidebarExpanded && <span className="font-medium whitespace-nowrap">警報紀錄 (Alarms)</span>}
          </button>
          <button onClick={() => navigateToPage('settings')} className={sidebarButtonClass('settings')} title="系統設定 (Settings)">
            <SettingsIcon size={18} />
            {isSidebarExpanded && <span className="font-medium whitespace-nowrap">系統設定 (Settings)</span>}
          </button>
        </nav>

        <div className="m-3 rounded-2xl border border-[var(--line)] bg-[var(--bg)]/80 p-4">
          <p className="col-header mb-2">LIVE STATUS</p>
          <div className="flex items-center justify-between text-sm font-medium">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.65)]" />
              模擬資料同步中
            </span>
            <span className="data-value text-xs">5s</span>
          </div>
        </div>
      </aside>

      <main className="relative flex-1 overflow-auto bg-[var(--bg)] transition-colors duration-300">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--line)] bg-[var(--bg)]/85 px-4 py-3 backdrop-blur-md md:hidden">
          <div>
            <p className="col-header">Factory Temperature Monitor</p>
            <h1 className="text-lg font-bold">工廠監控看板</h1>
          </div>
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="inline-flex items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--panel-bg)] p-2 shadow-sm transition-colors hover:bg-[var(--line)]"
            aria-label="開啟側邊欄"
          >
            <Menu size={18} />
          </button>
        </div>

        {currentPage === 'dashboard' && <Dashboard onSelectOven={navigateToOven} />}
        {currentPage === 'oven' && selectedOvenId && (
          <OvenDetail ovenId={selectedOvenId} onBack={() => navigateToPage('dashboard')} />
        )}
        {currentPage === 'alarms' && <Alarms />}
        {currentPage === 'settings' && <Settings />}
        <NotificationToast />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
