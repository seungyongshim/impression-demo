import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AdDistributionChart from './components/AdDistributionChart';
import { TimeSlot } from './types/AdDistribution';
import {
  createTimeSlots,
  simulateActualImpressions,
  redistributeRemainingImpressions,
  generateChartData,
  createSimulationTime,
} from './utils/adDistributionUtils';
import './App.css';

const App: React.FC = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [simulationTime, setSimulationTime] = useState<number>(0); // minutes elapsed
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1); // simulation speed multiplier

  // 캠페인 설정
  const TOTAL_IMPRESSIONS = 1000000; // 100만 노출
  const CAMPAIGN_START_DATE = useMemo(() => new Date('2025-01-01T00:00:00'), []);

  // 초기 타임슬롯 생성
  useEffect(() => {
    const initialSlots = createTimeSlots(CAMPAIGN_START_DATE, TOTAL_IMPRESSIONS);
    setTimeSlots(initialSlots);
    setCurrentTime(CAMPAIGN_START_DATE);
  }, [CAMPAIGN_START_DATE]);

  // 시뮬레이션 업데이트
  const updateSimulation = useCallback(() => {
    if (timeSlots.length === 0) return;

    const newSimulationTime = simulationTime + (10 * speed); // 10분씩 진행
    const newCurrentTime = createSimulationTime(CAMPAIGN_START_DATE, newSimulationTime);
    
    // 실제 노출량 시뮬레이션 (계획량의 80~100% 범위)
    let updatedSlots = simulateActualImpressions(timeSlots, newCurrentTime, 0.2);
    
    // 잔여량 재분배
    updatedSlots = redistributeRemainingImpressions(updatedSlots, TOTAL_IMPRESSIONS);
    
    setTimeSlots(updatedSlots);
    setCurrentTime(newCurrentTime);
    setSimulationTime(newSimulationTime);

    // 1일 후 시뮬레이션 종료
    if (newSimulationTime >= 1 * 24 * 60) {
      setIsPlaying(false);
    }
  }, [timeSlots, simulationTime, speed, CAMPAIGN_START_DATE]);

  // 애니메이션 효과
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(updateSimulation, 500 / speed); // 속도에 따라 조절
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, updateSimulation, speed]);

  // 차트 데이터 생성
  const chartData = generateChartData(timeSlots, 144); // 24시간분 표시

  // 시뮬레이션 제어 함수들
  const handlePlay = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
    setIsPlaying(false);
    setSimulationTime(0);
    setCurrentTime(CAMPAIGN_START_DATE);
    const resetSlots = createTimeSlots(CAMPAIGN_START_DATE, TOTAL_IMPRESSIONS);
    setTimeSlots(resetSlots);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
  };

  // 통계 계산
  const completedSlots = timeSlots.filter(slot => slot.isCompleted);
  const totalActualImpressions = completedSlots.reduce((sum, slot) => sum + slot.actualImpressions, 0);
  const totalPlannedImpressions = completedSlots.reduce((sum, slot) => sum + slot.plannedImpressions, 0);
  const efficiency = totalPlannedImpressions > 0 ? ((totalActualImpressions / totalPlannedImpressions) * 100) : 0;

  return (
    <div className="App">
      <header className="App-header">
        <h1>📊 광고 균등 분할 알고리즘 시뮬레이션</h1>
        <p>1일간 10분 단위로 광고 노출량을 균등 분할하고, 실제 노출량에 따라 잔여량을 재분배하는 과정을 시각화합니다.</p>
      </header>

      <main className="App-main">
        {/* 제어 패널 */}
        <div className="control-panel">
          <div className="time-info">
            <h3>현재 시뮬레이션 시간</h3>
            <p className="current-time">
              {currentTime.toLocaleString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </p>
            <p className="elapsed-time">경과 시간: {Math.floor(simulationTime / 60)}시간 {simulationTime % 60}분</p>
          </div>

          <div className="controls">
            <button 
              className={`play-button ${isPlaying ? 'playing' : ''}`}
              onClick={handlePlay}
            >
              {isPlaying ? '⏸️ 일시정지' : '▶️ 재생'}
            </button>
            <button className="reset-button" onClick={handleReset}>
              🔄 초기화
            </button>
          </div>

          <div className="speed-control">
            <label>시뮬레이션 속도:</label>
            <select 
              value={speed} 
              onChange={(e) => handleSpeedChange(Number(e.target.value))}
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={4}>4x</option>
            </select>
          </div>
        </div>

        {/* 통계 정보 */}
        <div className="stats-panel">
          <div className="stat-item">
            <h4>완료된 구간</h4>
            <p>{completedSlots.length.toLocaleString()} / {timeSlots.length.toLocaleString()}</p>
          </div>
          <div className="stat-item">
            <h4>실제 노출량</h4>
            <p>{totalActualImpressions.toLocaleString()}회</p>
          </div>
          <div className="stat-item">
            <h4>계획 노출량</h4>
            <p>{totalPlannedImpressions.toLocaleString()}회</p>
          </div>
          <div className="stat-item">
            <h4>달성률</h4>
            <p>{efficiency.toFixed(1)}%</p>
          </div>
        </div>

        {/* 차트 */}
        <div className="chart-container">
          <AdDistributionChart
            labels={chartData.labels}
            plannedData={chartData.plannedData}
            actualData={chartData.actualData}
            currentTime={currentTime.toLocaleString('ko-KR')}
          />
        </div>

        {/* 설명 */}
        <div className="description">
          <h3>📈 알고리즘 동작 원리</h3>
          <ul>
            <li><strong>초기 분할:</strong> 총 노출량을 1일(144개 구간)로 균등 분할</li>
            <li><strong>10분 목표량 제한:</strong> 각 10분 구간에서는 목표량을 초과할 수 없음</li>
            <li><strong>잔여량 재분배:</strong> 미달성 노출량을 남은 구간에 균등 재분배</li>
            <li><strong>시각화:</strong> 하늘색(계획) vs 초록색(실제) 막대 그래프로 비교</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default App;
