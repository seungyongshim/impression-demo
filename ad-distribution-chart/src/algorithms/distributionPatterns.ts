import { DistributionPattern } from '../types/AdDistribution';

/**
 * 균등 분포 - 모든 시간대에 동일한 가중치
 */
const uniformPattern: DistributionPattern = {
  name: '균등 분포',
  description: '모든 시간대에 동일한 고객 유입',
  type: 'uniform',
  getMultiplier: (slotIndex: number, totalSlots: number, startDate: Date) => {
    return 1.0; // 모든 시간대 동일
  }
};

/**
 * 피크시간 분포 - 오전 9-11시, 오후 7-9시에 높은 가중치
 */
const peakHoursPattern: DistributionPattern = {
  name: '피크시간 분포',
  description: '오전(9-11시), 저녁(19-21시) 시간대 집중',
  type: 'peak_hours',
  getMultiplier: (slotIndex: number, totalSlots: number, startDate: Date) => {
    // 10분 단위이므로 1시간 = 6슬롯
    const hour = Math.floor(slotIndex / 6) % 24;
    
    // 피크 시간대 정의
    if ((hour >= 9 && hour <= 11) || (hour >= 19 && hour <= 21)) {
      return 2.0; // 피크 시간 2배 가중치
    } else if ((hour >= 7 && hour <= 8) || (hour >= 12 && hour <= 18) || (hour >= 22 && hour <= 23)) {
      return 1.2; // 준 피크 시간 1.2배 가중치
    } else {
      return 0.5; // 오프 피크 시간 0.5배 가중치
    }
  }
};

/**
 * 아침 피크 분포 - 오전 시간대에 집중
 */
const morningPeakPattern: DistributionPattern = {
  name: '아침 피크 분포',
  description: '오전 시간대(7-12시)에 고객 유입 집중',
  type: 'morning_peak',
  getMultiplier: (slotIndex: number, totalSlots: number, startDate: Date) => {
    const hour = Math.floor(slotIndex / 6) % 24;
    
    if (hour >= 7 && hour <= 12) {
      // 아침 시간대 - 정규분포 형태의 가중치
      const center = 9.5; // 9시 30분이 중심
      const variance = 2;
      const weight = Math.exp(-Math.pow(hour - center, 2) / (2 * variance));
      return 1 + weight * 2; // 1~3 사이의 가중치
    } else {
      return 0.3; // 다른 시간대는 낮은 가중치
    }
  }
};

/**
 * 저녁 피크 분포 - 저녁 시간대에 집중
 */
const eveningPeakPattern: DistributionPattern = {
  name: '저녁 피크 분포',
  description: '저녁 시간대(17-23시)에 고객 유입 집중',
  type: 'evening_peak',
  getMultiplier: (slotIndex: number, totalSlots: number, startDate: Date) => {
    const hour = Math.floor(slotIndex / 6) % 24;
    
    if (hour >= 17 && hour <= 23) {
      // 저녁 시간대 - 정규분포 형태의 가중치
      const center = 20; // 8시가 중심
      const variance = 3;
      const weight = Math.exp(-Math.pow(hour - center, 2) / (2 * variance));
      return 1 + weight * 2.5; // 1~3.5 사이의 가중치
    } else {
      return 0.4; // 다른 시간대는 낮은 가중치
    }
  }
};

/**
 * 주말 분포 - 주말에 다른 패턴 적용 (현재는 단일 날짜이므로 참고용)
 */
const weekendPattern: DistributionPattern = {
  name: '주말 분포',
  description: '주말 패턴 - 늦은 아침부터 저녁까지 완만한 분포',
  type: 'weekend',
  getMultiplier: (slotIndex: number, totalSlots: number, startDate: Date) => {
    const hour = Math.floor(slotIndex / 6) % 24;
    
    // 주말 패턴 - 10시부터 22시까지 완만하게 높은 가중치
    if (hour >= 10 && hour <= 22) {
      // 코사인 곡선으로 완만한 분포
      const normalized = (hour - 10) / 12; // 0~1로 정규화
      const weight = 0.5 + 0.5 * Math.cos(2 * Math.PI * normalized + Math.PI); // 0~1 사이 코사인
      return 1 + weight; // 1~2 사이의 가중치
    } else {
      return 0.3; // 이른 아침, 늦은 밤은 낮은 가중치
    }
  }
};

// 사용 가능한 모든 분포 패턴 목록
export const availablePatterns: DistributionPattern[] = [
  uniformPattern,
  peakHoursPattern,
  morningPeakPattern,
  eveningPeakPattern,
  weekendPattern,
];

// 분포 패턴 타입으로 패턴 찾기
export function getPatternByType(type: string): DistributionPattern | undefined {
  return availablePatterns.find(pattern => pattern.type === type);
}

// 특정 패턴의 시간대별 가중치 미리보기 생성
export function generatePatternPreview(pattern: DistributionPattern, totalSlots: number = 144): number[] {
  const startDate = new Date('2025-01-01T00:00:00');
  const preview: number[] = [];
  
  for (let i = 0; i < totalSlots; i++) {
    preview.push(pattern.getMultiplier(i, totalSlots, startDate));
  }
  
  return preview;
}