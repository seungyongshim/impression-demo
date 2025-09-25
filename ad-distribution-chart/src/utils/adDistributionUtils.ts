import { TimeSlot } from '../types/AdDistribution';
import { getAlgorithmByType } from '../algorithms/distributionAlgorithms';
import { getPatternByType } from '../algorithms/distributionPatterns';

/**
 * 1일을 10분 단위로 나누어 타임슬롯을 생성합니다.
 * 이제 알고리즘과 분포 패턴을 사용합니다.
 */
export function createTimeSlots(
  startDate: Date, 
  totalImpressions: number,
  algorithmType: string = 'equal',
  patternType: string = 'uniform'
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const SLOT_DURATION_MINUTES = 10;
  const TOTAL_DAYS = 1;
  const totalSlots = (TOTAL_DAYS * 24 * 60) / SLOT_DURATION_MINUTES; // 144 slots
  
  // 알고리즘과 패턴 가져오기
  const algorithm = getAlgorithmByType(algorithmType);
  const pattern = getPatternByType(patternType);
  
  if (!algorithm || !pattern) {
    throw new Error(`알고리즘(${algorithmType}) 또는 패턴(${patternType})을 찾을 수 없습니다.`);
  }
  
  // 알고리즘을 사용하여 노출량 분배
  const distribution = algorithm.distribute(totalImpressions, totalSlots, startDate, pattern);
  
  // 타임슬롯 생성
  for (let i = 0; i < totalSlots; i++) {
    const slotStartTime = new Date(startDate.getTime() + (i * SLOT_DURATION_MINUTES * 60 * 1000));
    const slotEndTime = new Date(slotStartTime.getTime() + (SLOT_DURATION_MINUTES * 60 * 1000));
    
    slots.push({
      id: i,
      startTime: slotStartTime,
      endTime: slotEndTime,
      plannedImpressions: distribution[i] || 0,
      actualImpressions: 0,
      isCompleted: false
    });
  }
  
  return slots;
}

/**
 * 특정 시점까지의 실제 노출량을 시뮬레이션합니다.
 * 새로운 규칙: 10분 목표량을 넘어갈 수 없음 (계획량 이하에서 변동)
 */
export function simulateActualImpressions(
  slots: TimeSlot[], 
  currentTime: Date,
  variationFactor: number = 0.2
): TimeSlot[] {
  return slots.map(slot => {
    if (currentTime >= slot.endTime && !slot.isCompleted) {
      // 계획된 노출량 이하에서 변동을 주어 실제 노출량 시뮬레이션
      const variation = Math.random() * variationFactor; // 0~variationFactor 범위
      // 실제 노출량은 계획량의 (1-variationFactor) ~ 1.0 범위
      // 중요: 계획량을 절대 넘어갈 수 없음
      const actualImpressions = Math.floor(slot.plannedImpressions * (1 - variation));
      
      return {
        ...slot,
        actualImpressions: Math.max(0, Math.min(actualImpressions, slot.plannedImpressions)),
        isCompleted: true
      };
    }
    return slot;
  });
}

/**
 * 완료된 슬롯들의 잔여 노출량을 계산하고 미완료 슬롯들에 재분배합니다.
 * 실제 노출량과 계획량의 차이(잔여량)를 남은 구간에 균등 재분배합니다.
 */
export function redistributeRemainingImpressions(slots: TimeSlot[], totalImpressions: number): TimeSlot[] {
  const completedSlots = slots.filter(slot => slot.isCompleted);
  const incompleteSlots = slots.filter(slot => !slot.isCompleted);
  
  if (incompleteSlots.length === 0) {
    return slots;
  }
  
  // 완료된 슬롯들에서 사용된 실제 노출량
  const actualUsedImpressions = completedSlots.reduce((sum, slot) => sum + slot.actualImpressions, 0);
  
  // 전체 남은 노출량 (전체 - 실제 사용량)
  const remainingImpressions = totalImpressions - actualUsedImpressions;
  
  // 남은 노출량을 미완료 슬롯들에 균등 분배
  const baseImpressionsPerSlot = Math.floor(remainingImpressions / incompleteSlots.length);
  const extraImpressions = remainingImpressions - (baseImpressionsPerSlot * incompleteSlots.length);
  
  let extraIndex = 0;
  return slots.map(slot => {
    if (!slot.isCompleted) {
      const newPlannedImpressions = baseImpressionsPerSlot + (extraIndex < extraImpressions ? 1 : 0);
      extraIndex++;
      return {
        ...slot,
        plannedImpressions: Math.max(0, newPlannedImpressions) // 음수 방지
      };
    }
    return slot;
  });
}

/**
 * 차트 데이터를 생성합니다.
 */
export function generateChartData(slots: TimeSlot[], maxSlots: number = 144): {
  labels: string[];
  plannedData: number[];
  actualData: number[];
} {
  // 처음 maxSlots 개만 표시 (24시간 * 6 = 144개 슬롯)
  const displaySlots = slots.slice(0, maxSlots);
  
  const labels = displaySlots.map(slot => {
    const time = slot.startTime.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const date = slot.startTime.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
    return `${date} ${time}`;
  });
  
  const plannedData = displaySlots.map(slot => slot.plannedImpressions);
  const actualData = displaySlots.map(slot => slot.actualImpressions);
  
  return { labels, plannedData, actualData };
}

/**
 * 시뮬레이션 시간을 생성합니다.
 */
export function createSimulationTime(startDate: Date, minutesElapsed: number): Date {
  return new Date(startDate.getTime() + (minutesElapsed * 60 * 1000));
}