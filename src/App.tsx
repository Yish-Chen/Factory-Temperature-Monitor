import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './lib/store';
import { Activity, Thermometer, Bell, Settings as SettingsIcon, X, Menu } from 'lucide-react';
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
  } catch(e) {
    console.error("Audio play failed");
  }
}

function NotificationToast() {
  const { alarms, unit } = useAppContext();
  const [visibleAlarm, setVisibleAlarm] = useState<any>(null);

  useEffect(() => {
    if (alarms.length > 0) {
      const latest = alarms[0];
      // Only show toast for new critical alarms within last 5 seconds
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
         customMsg: e.detail.message
      });
      playBeep();
      setTimeout(() => setVisibleAlarm(null), 5000);
    };
    window.addEventListener('show-alarm-toast', handleCustomToast);
    return () => window.removeEventListener('show-alarm-toast', handleCustomToast);
  }, []);

  if (!visibleAlarm) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-[var(--critical)] text-white p-4 rounded-md shadow-2xl flex items-start space-x-4 z-50 animate-bounce border border-white/20">
      <Bell className="mt-1" />
      <div>
        <h4 className="font-bold text-lg">系統警報鈴聲模擬：嚴重異常！</h4>
        {visibleAlarm.isCustomObj ? (
          <p>{visibleAlarm.customMsg}</p>
        ) : (
          <p>{visibleAlarm.ovenId} - {visibleAlarm.sensorId} 溫度異常: {visibleAlarm.temperature}°{unit}</p>
        )}
      </div>
      <button onClick={() => setVisibleAlarm(null)} className="p-1 hover:bg-black/20 rounded">
        <X size={16} />
      </button>
    </div>
  );
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedOvenId, setSelectedOvenId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigateToOven = (id: string) => {
    setSelectedOvenId(id);
    setCurrentPage('oven');
  };

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar */}
      <aside className={`border-r border-[var(--line)] bg-[var(--panel-bg)] flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-full md:w-64 shrink-0' : 'w-full md:w-16 shrink-0'}`}>
        <div className="p-4 border-b border-[var(--line)] flex justify-between items-center h-16">
          {isSidebarOpen && (
            <div>
              <h1 className="font-sans font-bold text-xl tracking-tight hidden md:block w-32 truncate">溫度監控</h1>
              <p className="col-header mt-1">v0.6</p>
            </div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-[var(--line)] rounded-md mx-auto md:mx-0">
             <Menu size={20} />
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-2">
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className={`w-full flex items-center ${isSidebarOpen ? 'space-x-3 px-4' : 'justify-center'} py-3 rounded-md transition-colors ${currentPage === 'dashboard' ? 'bg-[var(--accent)] text-[var(--accent-text)]' : 'hover:bg-[var(--line)]'}`}
            title="總覽 (Dashboard)"
          >
            <Activity size={18} />
            {isSidebarOpen && <span className="font-medium whitespace-nowrap">總覽 (Dashboard)</span>}
          </button>
          <button 
            onClick={() => setCurrentPage('alarms')}
            className={`w-full flex items-center ${isSidebarOpen ? 'space-x-3 px-4' : 'justify-center'} py-3 rounded-md transition-colors ${currentPage === 'alarms' ? 'bg-[var(--accent)] text-[var(--accent-text)]' : 'hover:bg-[var(--line)]'}`}
            title="警報紀錄 (Alarms)"
          >
            <Bell size={18} />
            {isSidebarOpen && <span className="font-medium whitespace-nowrap">警報紀錄 (Alarms)</span>}
          </button>
          <button 
            onClick={() => setCurrentPage('settings')}
            className={`w-full flex items-center ${isSidebarOpen ? 'space-x-3 px-4' : 'justify-center'} py-3 rounded-md transition-colors ${currentPage === 'settings' ? 'bg-[var(--accent)] text-[var(--accent-text)]' : 'hover:bg-[var(--line)]'}`}
            title="系統設定 (Settings)"
          >
            <SettingsIcon size={18} />
            {isSidebarOpen && <span className="font-medium whitespace-nowrap">系統設定 (Settings)</span>}
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-[var(--bg)] overflow-auto relative transition-colors duration-300">
        {currentPage === 'dashboard' && <Dashboard onSelectOven={navigateToOven} />}
        {currentPage === 'oven' && selectedOvenId && (
          <OvenDetail 
            ovenId={selectedOvenId} 
            onBack={() => setCurrentPage('dashboard')} 
          />
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
