import React, { useState, useEffect, useRef } from 'react';
import { useAppContext, convertTemp } from '../lib/store';
import { ArrowLeft, Filter, BarChart2, LineChart as LineChartIcon, Activity, Settings as SettingsIcon, Maximize2, Minimize2 } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart } from 'recharts';

interface OvenDetailProps {
  ovenId: string;
  onBack: () => void;
}

type ChartType = 'line' | 'area' | 'bar';
type ViewMode = 'year' | 'month' | 'day' | 'hour';

export default function OvenDetail({ ovenId, onBack }: OvenDetailProps) {
  const { ovens, rules, unit, updateSensorThreshold } = useAppContext();
  const oven = ovens.find(o => o.id === ovenId);
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  
  // Custom threshold edit state
  const [isEditingThresholds, setIsEditingThresholds] = useState(false);
  const [tempWarning, setTempWarning] = useState<string>('');
  const [tempCritical, setTempCritical] = useState<string>('');

  // Chart Type State
  const [chartType, setChartType] = useState<ChartType>('line');
  const [viewMode, setViewMode] = useState<ViewMode>('hour');

  // Time filter state
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((currentDate.getMonth() + 1).toString().padStart(2, '0'));
  const [selectedDay, setSelectedDay] = useState(currentDate.getDate().toString().padStart(2, '0'));
  const [selectedHour, setSelectedHour] = useState(currentDate.getHours().toString().padStart(2, '0'));

  const [simulatedHistory, setSimulatedHistory] = useState<any[]>([]);

  // Zoom / Pan State
  const [zoomDomain, setZoomDomain] = useState<[number, number]>([0, 59]);
  const [isAutoTail, setIsAutoTail] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number>(0);

  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!oven) return <div>Oven not found</div>;

  const activeSensor = selectedSensorId 
    ? oven.sensors.find(s => s.id === selectedSensorId) 
    : oven.sensors[0];

  // Initialize threshold inputs when sensor changes
  useEffect(() => {
    if (activeSensor) {
      const globalWarning = rules.find(r => r.level === 'warning')?.threshold ?? 100;
      const globalCritical = rules.find(r => r.level === 'critical')?.threshold ?? 110;
      
      const w = activeSensor.thresholds?.warning ?? globalWarning;
      const c = activeSensor.thresholds?.critical ?? globalCritical;
      
      setTempWarning(convertTemp(w, unit).toFixed(1));
      setTempCritical(convertTemp(c, unit).toFixed(1));
      setIsEditingThresholds(false);
    }
  }, [activeSensor?.id, rules, unit]);

  // Regenerate simulated history
  useEffect(() => {
    if (!activeSensor) return;

    let newHistory = [];
    const seed = parseInt(selectedYear) + parseInt(selectedMonth) + parseInt(selectedDay) + parseInt(selectedHour) + (activeSensor?.capacity || 0);
    let baseTemp = 80 + (seed % 40);

    if (viewMode === 'hour') {
      const isCurrentTime = 
        selectedYear === currentDate.getFullYear().toString() &&
        selectedMonth === (currentDate.getMonth() + 1).toString().padStart(2, '0') &&
        selectedDay === currentDate.getDate().toString().padStart(2, '0') &&
        selectedHour === currentDate.getHours().toString().padStart(2, '0');

      if (isCurrentTime) {
        newHistory = activeSensor.history.map(h => ({
          ...h,
          temperature: convertTemp(h.temperature, unit)
        }));
      } else {
        const selectedMinute = currentDate.getMinutes();
        for (let i = 0; i < 60; i++) {
          baseTemp += (Math.sin(i * seed) * 3);
          if (baseTemp < 20) baseTemp = 20;
          if (baseTemp > 180) baseTemp = 180;
          let min = selectedMinute - (60 - i);
          let hr = parseInt(selectedHour);
          if (min < 0) {
            min += 60;
            hr = hr - 1 < 0 ? 23 : hr - 1;
          }
          newHistory.push({
            time: `${hr.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
            temperature: convertTemp(Number(baseTemp.toFixed(1)), unit)
          });
        }
      }
    } else if (viewMode === 'day') {
      for (let i = 0; i < 24; i++) {
        baseTemp += (Math.sin(i * seed) * 5);
        if (baseTemp < 20) baseTemp = 20;
        if (baseTemp > 180) baseTemp = 180;
        const minVal = baseTemp - (Math.random() * 5 + 1);
        const maxVal = baseTemp + (Math.random() * 5 + 1);
        newHistory.push({
          time: `${i.toString().padStart(2, '0')}:00`,
          min: convertTemp(Number(minVal.toFixed(1)), unit),
          avg: convertTemp(Number(baseTemp.toFixed(1)), unit),
          max: convertTemp(Number(maxVal.toFixed(1)), unit)
        });
      }
    } else if (viewMode === 'month') {
      const daysInMonth = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        baseTemp += (Math.sin(i * seed) * 4);
        if (baseTemp < 20) baseTemp = 20;
        if (baseTemp > 180) baseTemp = 180;
        const minVal = baseTemp - Math.random() * 10 - 2;
        const maxVal = baseTemp + Math.random() * 10 + 2;
        newHistory.push({
          time: `${selectedMonth}/${i.toString().padStart(2, '0')}`,
          min: convertTemp(Number(minVal.toFixed(1)), unit),
          avg: convertTemp(Number(baseTemp.toFixed(1)), unit),
          max: convertTemp(Number(maxVal.toFixed(1)), unit)
        });
      }
    } else if (viewMode === 'year') {
      for (let i = 1; i <= 12; i++) {
        baseTemp += (Math.sin(i * seed) * 8);
        if (baseTemp < 20) baseTemp = 20;
        if (baseTemp > 180) baseTemp = 180;
        const minVal = baseTemp - Math.random() * 15 - 5;
        const maxVal = baseTemp + Math.random() * 15 + 5;
        newHistory.push({
          time: `${i}月`,
          min: convertTemp(Number(minVal.toFixed(1)), unit),
          avg: convertTemp(Number(baseTemp.toFixed(1)), unit),
          max: convertTemp(Number(maxVal.toFixed(1)), unit)
        });
      }
    }

    setSimulatedHistory(newHistory);
    setZoomDomain(prev => {
      if (isAutoTail) {
        const len = newHistory.length;
        // Default to zooming in on the latest 30 points, or show entirely if < 30
        return [Math.max(0, len - 30), Math.max(0, len - 1)];
      } else {
        let [s, e] = prev;
        const max = Math.max(0, newHistory.length - 1);
        if (e > max) e = max;
        if (s > e) s = Math.max(0, e - 30);
        return [s, e];
      }
    });
  }, [activeSensor, selectedYear, selectedMonth, selectedDay, selectedHour, viewMode, unit, isAutoTail]);

  const handleSaveThresholds = () => {
    if (!activeSensor) return;
    
    let w = Number(tempWarning);
    let c = Number(tempCritical);
    
    if (unit === 'F') {
      w = (w - 32) * 5/9;
      c = (c - 32) * 5/9;
    }

    updateSensorThreshold(oven.id, activeSensor.id, {
      warning: Number(w.toFixed(1)),
      critical: Number(c.toFixed(1))
    });
    setIsEditingThresholds(false);
  };

  const getMaxZoom = () => simulatedHistory.length - 1;

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault(); // Prevent page scroll when rolling on chart
    setIsAutoTail(false);
    
    const zoomFactor = 0.1;
    const direction = e.deltaY > 0 ? 1 : -1; // 1 = zoom out, -1 = zoom in
    const maxZoom = getMaxZoom();
    
    setZoomDomain(prev => {
      let [start, end] = prev;
      const range = end - start;
      const zoomAmount = Math.max(1, Math.floor(range * zoomFactor));
      
      if (direction > 0) { // Zoom out
        start = Math.max(0, start - zoomAmount);
        end = Math.min(maxZoom, end + zoomAmount);
      } else { // Zoom in
        if (range > 5) { // minimum points
          start = start + zoomAmount;
          end = end - zoomAmount;
        }
      }
      return [start, end];
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = dragStartX.current - e.clientX;
    const maxZoom = getMaxZoom();
    
    if (Math.abs(deltaX) > 10) { // threshold
      setIsAutoTail(false);
      const shift = deltaX > 0 ? 1 : -1;
      setZoomDomain(prev => {
        let [start, end] = prev;
        if (shift > 0 && end < maxZoom) {
          start += shift;
          end += shift;
          dragStartX.current = e.clientX;
        } else if (shift < 0 && start > 0) {
          start += shift;
          end += shift;
          dragStartX.current = e.clientX;
        }
        return [start, end];
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReturnToLive = () => {
    const now = new Date();
    setSelectedYear(now.getFullYear().toString());
    setSelectedMonth((now.getMonth() + 1).toString().padStart(2, '0'));
    setSelectedDay(now.getDate().toString().padStart(2, '0'));
    setSelectedHour(now.getHours().toString().padStart(2, '0'));
    setViewMode('hour');
    setIsAutoTail(true);
  };

  const chartData = simulatedHistory.slice(zoomDomain[0], zoomDomain[1] + 1);

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 20, bottom: 5, left: 0 }
    };

    const commonAxes = (
      <>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
        <XAxis 
          dataKey="time" 
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 12, fill: 'var(--muted)' }} 
          stroke="var(--line)"
        />
        <YAxis 
          domain={['auto', 'auto']} 
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 12, fill: 'var(--muted)' }}
          stroke="var(--line)"
          unit={`°${unit}`}
        />
        <Tooltip 
          contentStyle={{ 
            fontFamily: 'var(--font-mono)', 
            borderRadius: '0px', 
            border: '1px solid var(--border-strong)',
            backgroundColor: 'var(--panel-bg)',
            color: 'var(--ink)'
          }}
        />
        <Legend wrapperStyle={{ fontFamily: 'var(--font-sans)', fontSize: 12, paddingTop: '20px', color: 'var(--ink)' }} />
      </>
    );

    if (viewMode !== 'hour') {
      return (
        <ComposedChart {...commonProps}>
          {commonAxes}
          {chartType === 'area' ? (
            <Area type="natural" dataKey="avg" name={`平均溫度 (°${unit})`} stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.2} isAnimationActive={false} />
          ) : chartType === 'bar' ? (
            <Bar dataKey="avg" name={`平均溫度 (°${unit})`} fill="var(--accent)" isAnimationActive={false} />
          ) : (
            <Line type="natural" dataKey="avg" name={`平均溫度 (°${unit})`} stroke="var(--accent)" strokeWidth={2} dot={false} activeDot={{ r: 6 }} isAnimationActive={false} />
          )}
          <Line type="natural" dataKey="max" name={`最高溫 (°${unit})`} stroke="var(--critical)" strokeDasharray="5 5" strokeWidth={1} dot={false} isAnimationActive={false} />
          <Line type="natural" dataKey="min" name={`最低溫 (°${unit})`} stroke="var(--ink)" opacity={0.5} strokeDasharray="5 5" strokeWidth={1} dot={false} isAnimationActive={false} />
        </ComposedChart>
      );
    }

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {commonAxes}
            <Area type="natural" dataKey="temperature" name={`${activeSensor?.name} 溫度 (°${unit})`} stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.2} strokeWidth={2} isAnimationActive={false} />
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {commonAxes}
            <Bar dataKey="temperature" name={`${activeSensor?.name} 溫度 (°${unit})`} fill="var(--accent)" isAnimationActive={false} />
          </BarChart>
        );
      case 'line':
      default:
        return (
          <LineChart {...commonProps}>
            {commonAxes}
            <Line type="natural" dataKey="temperature" name={`${activeSensor?.name} 溫度 (°${unit})`} stroke="var(--accent)" strokeWidth={2} dot={false} activeDot={{ r: 6, fill: 'var(--ink)' }} isAnimationActive={false} />
          </LineChart>
        );
    }
  };

  return (
    <div className="p-4 md:p-8 flex flex-col h-full bg-[var(--bg)] text-[var(--ink)] overflow-hidden">
      <header className="mb-4 md:mb-8 shrink-0 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-[var(--line)] rounded-full transition-colors mt-1">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{oven.name} 詳細資訊</h2>
            <p className="col-header mt-2">OVEN DETAILS & HISTORY</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {/* Chart Type Selector */}
          <div className="flex items-center gap-2 self-end">
            {(!isAutoTail || viewMode !== 'hour' || selectedHour !== currentDate.getHours().toString().padStart(2, '0') || selectedDay !== currentDate.getDate().toString().padStart(2, '0')) && (
              <button 
                onClick={handleReturnToLive} 
                className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold bg-[var(--accent)] text-[var(--accent-text)] rounded shadow-[0_0_10px_var(--accent)] animate-fade-in hover:opacity-80 transition-opacity whitespace-nowrap uppercase tracking-wider"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                Return to Live
              </button>
            )}
            <div className="flex bg-[var(--panel-bg)] border border-[var(--line)] rounded-md p-1 mr-2">
              <button onClick={() => setChartType('line')} className={`p-1 rounded ${chartType === 'line' ? 'bg-[var(--accent)] text-[var(--accent-text)]' : 'hover:bg-[var(--line)]'}`} title="折線圖">
                <LineChartIcon size={18} />
              </button>
              <button onClick={() => setChartType('area')} className={`p-1 rounded ${chartType === 'area' ? 'bg-[var(--accent)] text-[var(--accent-text)]' : 'hover:bg-[var(--line)]'}`} title="面積圖">
                <Activity size={18} />
              </button>
              <button onClick={() => setChartType('bar')} className={`p-1 rounded ${chartType === 'bar' ? 'bg-[var(--accent)] text-[var(--accent-text)]' : 'hover:bg-[var(--line)]'}`} title="長條圖">
                <BarChart2 size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[var(--panel-bg)] border border-[var(--line)] rounded-md p-1">
              <button onClick={() => setViewMode('year')} className={`px-2 py-1 text-xs font-bold rounded ${viewMode === 'year' ? 'bg-[var(--accent)] text-[var(--accent-text)]' : 'hover:bg-[var(--line)]'}`}>
                年檢視
              </button>
              <button onClick={() => setViewMode('month')} className={`px-2 py-1 text-xs font-bold rounded ${viewMode === 'month' ? 'bg-[var(--accent)] text-[var(--accent-text)]' : 'hover:bg-[var(--line)]'}`}>
                月檢視
              </button>
              <button onClick={() => setViewMode('day')} className={`px-2 py-1 text-xs font-bold rounded ${viewMode === 'day' ? 'bg-[var(--accent)] text-[var(--accent-text)]' : 'hover:bg-[var(--line)]'}`}>
                日檢視
              </button>
              <button onClick={() => setViewMode('hour')} className={`px-2 py-1 text-xs font-bold rounded ${viewMode === 'hour' ? 'bg-[var(--accent)] text-[var(--accent-text)]' : 'hover:bg-[var(--line)]'}`}>
                時檢視
              </button>
            </div>

            <div className="flex items-center space-x-1 bg-[var(--panel-bg)] border border-[var(--line)] p-1 rounded-md text-sm font-medium">
              <Filter size={16} className="ml-2 opacity-50" />
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-transparent border-none outline-none py-1 px-1 cursor-pointer hover:bg-[var(--line)]">
                <option value="2026">2026 年</option>
                <option value="2025">2025 年</option>
              </select>
              {(viewMode === 'month' || viewMode === 'day' || viewMode === 'hour') && (
                <>
                  <span className="opacity-30">|</span>
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-transparent border-none outline-none py-1 px-1 cursor-pointer hover:bg-[var(--line)]">
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i+1} value={(i+1).toString().padStart(2, '0')}>{i+1} 月</option>
                    ))}
                  </select>
                </>
              )}
              {(viewMode === 'day' || viewMode === 'hour') && (
                <>
                  <span className="opacity-30">|</span>
                  <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="bg-transparent border-none outline-none py-1 px-1 cursor-pointer hover:bg-[var(--line)]">
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i+1} value={(i+1).toString().padStart(2, '0')}>{i+1} 日</option>
                    ))}
                  </select>
                </>
              )}
              {viewMode === 'hour' && (
                <>
                  <span className="opacity-30">|</span>
                  <select value={selectedHour} onChange={(e) => setSelectedHour(e.target.value)} className="bg-transparent border-none outline-none py-1 px-1 cursor-pointer hover:bg-[var(--line)]">
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')} 時</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>
        </div>
      </header>


      <div className="flex flex-col lg:flex-row gap-4 md:gap-8 flex-1 min-h-0">
        {/* Sensors List & Settings */}
        <div className="flex flex-col gap-4 w-full lg:w-1/4 shrink-0 overflow-y-auto">
          <div className="data-grid flex flex-col shrink-0 min-h-0 bg-[var(--panel-bg)] flex-1">
            <div className="p-4 border-b border-[var(--line)] font-bold shrink-0">
              <h3 className="font-bold">溫度計列表</h3>
            </div>
            <div className="overflow-y-auto flex-1 h-32 lg:h-auto">
              {oven.sensors.map(sensor => (
                <div 
                  key={sensor.id}
                  onClick={() => setSelectedSensorId(sensor.id)}
                  className={`data-row interactive ${activeSensor?.id === sensor.id ? 'active' : ''}`}
                >
                  <div>
                    <div className="font-bold">{sensor.name}</div>
                    <div className="col-header mt-1 text-[var(--muted)]">ID: {sensor.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="data-value text-lg">{convertTemp(sensor.temperature, unit).toFixed(1)}°{unit}</div>
                    <div className="text-[10px] uppercase font-bold mt-1 text-[var(--muted)]">Cap: {sensor.capacity}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sensor Override Settings */}
          {activeSensor && (
             <div className="data-grid bg-[var(--panel-bg)] p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-[var(--line)]">
                  <h4 className="font-bold text-sm flex items-center">
                    <SettingsIcon size={14} className="mr-1" /> 此溫度計警報配置
                  </h4>
                  <button 
                    onClick={() => isEditingThresholds ? handleSaveThresholds() : setIsEditingThresholds(true)}
                    className="text-xs bg-[var(--ink)] text-[var(--bg)] px-2 py-1 rounded"
                  >
                    {isEditingThresholds ? '儲存' : '自訂'}
                  </button>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-[var(--warning)]">高溫警告:</span>
                  {isEditingThresholds ? (
                    <input 
                      type="number" 
                      value={tempWarning} 
                      onChange={e => setTempWarning(e.target.value)}
                      className="w-16 bg-transparent border-b border-[var(--line)] text-right outline-none font-mono text-sm"
                    />
                  ) : (
                    <span className="font-mono text-sm">{tempWarning}°{unit}</span>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-[var(--critical)]">危險高溫:</span>
                  {isEditingThresholds ? (
                    <input 
                      type="number" 
                      value={tempCritical} 
                      onChange={e => setTempCritical(e.target.value)}
                      className="w-16 bg-transparent border-b border-[var(--line)] text-right outline-none font-mono text-sm"
                    />
                  ) : (
                    <span className="font-mono text-sm">{tempCritical}°{unit}</span>
                  )}
                </div>
                {activeSensor.thresholds && !isEditingThresholds && (
                  <div className="text-[10px] text-[var(--muted)] mt-1 text-right italic">*已覆蓋全域預設*</div>
                )}
             </div>
          )}
        </div>

        {/* Chart Area */}
        <div className={`data-grid p-4 md:p-6 flex flex-col bg-[var(--panel-bg)] min-h-0 ${isFullscreen ? 'fixed inset-4 z-50 shadow-2xl overflow-hidden' : 'flex-1 w-full lg:w-3/4'}`}>
          <div className="mb-4 md:mb-6 shrink-0 flex justify-between items-start">
            <div>
              <h3 className="font-bold text-xl">{activeSensor?.name} - {
                chartType === 'line' ? '溫度曲線' : chartType === 'area' ? '溫度面積' : '溫度分佈'
              }</h3>
              <p className="col-header mt-1">TEMPERATURE HISTORY</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-right hidden sm:block">
                <div className="col-header">目前顯示時間</div>
                <div className="data-value font-bold text-lg text-[var(--accent)]">
                  {viewMode === 'year' && `${selectedYear}年`}
                  {viewMode === 'month' && `${selectedYear}年 ${selectedMonth}月`}
                  {viewMode === 'day' && `${selectedYear}/${selectedMonth}/${selectedDay}`}
                  {viewMode === 'hour' && `${selectedYear}/${selectedMonth}/${selectedDay} ${selectedHour}時`}
                </div>
              </div>
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)} 
                className="p-2 border border-[var(--line)] rounded hover:bg-[var(--line)] transition-colors mt-2"
                title={isFullscreen ? '縮小' : '全螢幕檢視'}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </div>
          
          <div 
            className="flex-1 min-h-[200px] cursor-crosshair"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={() => setIsFullscreen(!isFullscreen)}
          >
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] col-header text-center mt-2 opacity-50 flex justify-center items-center gap-2">
            <span>* 使用滑鼠滾輪進行縮放，點擊拖曳平移 (Scroll to zoom, drag to pan) *</span>
            <span className="hidden md:inline">|</span>
            <span className="hidden md:inline">雙擊圖表切換全螢幕 (Double click to toggle fullscreen)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
