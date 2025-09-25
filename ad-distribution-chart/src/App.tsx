import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AdDistributionChart from './components/AdDistributionChart';
import AlgorithmSelector from './components/AlgorithmSelector';
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
  
  // 새로운 상태: 알고리즘 및 패턴 선택
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('equal');
  const [selectedPattern, setSelectedPattern] = useState<string>('uniform');

  // 캠페인 설정
  const TOTAL_IMPRESSIONS = 1000000; // 100만 노출
  const CAMPAIGN_START_DATE = useMemo(() => new Date('2025-01-01T00:00:00'), []);

  // 초기 타임슬롯 생성 (알고리즘 및 패턴 적용)
  const createInitialSlots = useCallback(() => {
    const initialSlots = createTimeSlots(CAMPAIGN_START_DATE, TOTAL_IMPRESSIONS, selectedAlgorithm, selectedPattern);
    setTimeSlots(initialSlots);
    setCurrentTime(CAMPAIGN_START_DATE);
    setSimulationTime(0);
  }, [CAMPAIGN_START_DATE, selectedAlgorithm, selectedPattern]);

  // 초기 로딩 및 알고리즘/패턴 변경 시 재생성
  useEffect(() => {
    createInitialSlots();
  }, [createInitialSlots]);

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
    createInitialSlots();
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
  };

  // 알고리즘 및 패턴 변경 핸들러
  const handleAlgorithmChange = (algorithmType: string) => {
    if (!isPlaying) {
      setSelectedAlgorithm(algorithmType);
    }
  };

  const handlePatternChange = (patternType: string) => {
    if (!isPlaying) {
      setSelectedPattern(patternType);
    }
  };

  // 통계 계산
  const completedSlots = timeSlots.filter(slot => slot.isCompleted);
  const totalActualImpressions = completedSlots.reduce((sum, slot) => sum + slot.actualImpressions, 0);
  const totalPlannedImpressions = completedSlots.reduce((sum, slot) => sum + slot.plannedImpressions, 0);
  const efficiency = totalPlannedImpressions > 0 ? ((totalActualImpressions / totalPlannedImpressions) * 100) : 0;

  return (
    <div className="App">
      <header className="App-header">
        <h1>📊 광고 노출 알고리즘 데모</h1>
        <p>다양한 분배 알고리즘과 고객 유입 패턴을 적용하여 광고 노출량을 시뮬레이션합니다.</p>
      </header>

      <main className="App-main">
        {/* 알고리즘 및 패턴 선택 */}
        <AlgorithmSelector
          selectedAlgorithm={selectedAlgorithm}
          selectedPattern={selectedPattern}
          onAlgorithmChange={handleAlgorithmChange}
          onPatternChange={handlePatternChange}
          disabled={isPlaying}
        />

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
          <h3>📈 다양한 알고리즘 비교</h3>
          <ul>
            <li><strong>균등분할:</strong> 모든 시간대에 동일한 양으로 분배</li>
            <li><strong>가중분할:</strong> 고객 유입 패턴에 비례하여 차등 분배</li>
            <li><strong>피크시간 집중:</strong> 피크 시간대에 노출량을 집중 배치</li>
            <li><strong>프론트로딩:</strong> 캠페인 초기에 집중하여 빠른 전달</li>
          </ul>
          
          <h3>📊 고객 유입 패턴</h3>
          <ul>
            <li><strong>균등 분포:</strong> 하루 종일 동일한 고객 유입</li>
            <li><strong>피크시간 분포:</strong> 오전(9-11시), 저녁(19-21시) 집중</li>
            <li><strong>아침 피크:</strong> 오전 시간대(7-12시) 집중</li>
            <li><strong>저녁 피크:</strong> 저녁 시간대(17-23시) 집중</li>
            <li><strong>주말 분포:</strong> 10시부터 22시까지 완만한 분포</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default App;
