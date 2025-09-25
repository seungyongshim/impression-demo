import { DistributionAlgorithm, DistributionPattern } from '../types/AdDistribution';

/**
 * 균등분할 알고리즘
 * 전체 노출량을 모든 시간대에 균등하게 분배
 * 고객 유입 패턴과 무관하게 목표량을 균등하게 분배
 */
const equalDistribution: DistributionAlgorithm = {
  name: '균등분할',
  description: '모든 시간대에 동일한 양의 노출량을 분배',
  type: 'equal',
  distribute: (totalImpressions: number, totalSlots: number, startDate: Date, distributionPattern: DistributionPattern) => {
    const baseImpressions = Math.floor(totalImpressions / totalSlots);
    const remainder = totalImpressions % totalSlots;
    
    const distribution: number[] = [];
    for (let i = 0; i < totalSlots; i++) {
      // 균등분할은 고객 유입 패턴과 무관하게 균등하게 분배
      let impressions = baseImpressions;
      
      // 남은 노출량을 초반 슬롯에 분배
      if (i < remainder) {
        impressions += 1;
      }
      
      distribution.push(impressions);
    }
    
    return distribution;
  }
};

/**
 * 가중분할 알고리즘
 * 시간대별 중요도에 따라 가중치를 적용하여 분배
 */
const weightedDistribution: DistributionAlgorithm = {
  name: '가중분할',
  description: '시간대별 중요도에 따라 차등 분배',
  type: 'weighted',
  distribute: (totalImpressions: number, totalSlots: number, startDate: Date, distributionPattern: DistributionPattern) => {
    // 각 슬롯의 가중치 계산
    const weights: number[] = [];
    let totalWeight = 0;
    
    for (let i = 0; i < totalSlots; i++) {
      const weight = distributionPattern.getMultiplier(i, totalSlots, startDate);
      weights.push(weight);
      totalWeight += weight;
    }
    
    // 가중치에 따라 노출량 분배
    const distribution: number[] = [];
    let distributedSum = 0;
    
    for (let i = 0; i < totalSlots; i++) {
      const ratio = weights[i] / totalWeight;
      const impressions = Math.floor(totalImpressions * ratio);
      distribution.push(impressions);
      distributedSum += impressions;
    }
    
    // 반올림으로 인한 차이를 마지막 슬롯에 보정
    const difference = totalImpressions - distributedSum;
    if (difference > 0 && distribution.length > 0) {
      distribution[distribution.length - 1] += difference;
    }
    
    return distribution;
  }
};

/**
 * 피크시간 집중 알고리즘
 * 특정 시간대에 노출량을 집중 배치
 */
const peakHoursDistribution: DistributionAlgorithm = {
  name: '피크시간 집중',
  description: '특정 피크 시간대에 노출량을 집중 배치',
  type: 'peak_hours',
  distribute: (totalImpressions: number, totalSlots: number, startDate: Date, distributionPattern: DistributionPattern) => {
    const distribution: number[] = [];
    let totalMultiplier = 0;
    
    // 전체 가중치 합계 계산
    for (let i = 0; i < totalSlots; i++) {
      totalMultiplier += distributionPattern.getMultiplier(i, totalSlots, startDate);
    }
    
    // 피크 시간에 더 많은 비중 할당
    let distributedSum = 0;
    for (let i = 0; i < totalSlots; i++) {
      const multiplier = distributionPattern.getMultiplier(i, totalSlots, startDate);
      // 피크 시간 강조 (제곱을 사용하여 차이를 더 크게)
      const enhancedMultiplier = Math.pow(multiplier, 1.5);
      const impressions = Math.floor(totalImpressions * enhancedMultiplier / totalMultiplier);
      distribution.push(impressions);
      distributedSum += impressions;
    }
    
    // 남은 노출량을 가장 높은 가중치 슬롯에 분배
    const remainder = totalImpressions - distributedSum;
    if (remainder > 0) {
      let maxIndex = 0;
      let maxMultiplier = 0;
      for (let i = 0; i < totalSlots; i++) {
        const multiplier = distributionPattern.getMultiplier(i, totalSlots, startDate);
        if (multiplier > maxMultiplier) {
          maxMultiplier = multiplier;
          maxIndex = i;
        }
      }
      distribution[maxIndex] += remainder;
    }
    
    return distribution;
  }
};

/**
 * 프론트로딩 알고리즘
 * 캠페인 초기에 많은 노출량을 집중하여 빠른 전달
 */
const frontLoadedDistribution: DistributionAlgorithm = {
  name: '프론트로딩',
  description: '캠페인 초기에 노출량을 집중하여 빠른 전달',
  type: 'front_loaded',
  distribute: (totalImpressions: number, totalSlots: number, startDate: Date, distributionPattern: DistributionPattern) => {
    const distribution: number[] = [];
    let remainingImpressions = totalImpressions;
    
    // 감소하는 비율로 분배 (초반에 더 많이)
    for (let i = 0; i < totalSlots; i++) {
      const decayFactor = Math.exp(-i / (totalSlots * 0.3)); // 지수 감소
      const patternMultiplier = distributionPattern.getMultiplier(i, totalSlots, startDate);
      const baseRatio = decayFactor * patternMultiplier;
      
      // 남은 노출량의 일정 비율을 할당
      const ratioSum = (totalSlots - i) * 0.1; // 간단한 정규화
      let impressions = Math.floor(remainingImpressions * baseRatio / ratioSum);
      
      // 마지막 슬롯에는 남은 모든 노출량 할당
      if (i === totalSlots - 1) {
        impressions = remainingImpressions;
      }
      
      impressions = Math.max(0, Math.min(impressions, remainingImpressions));
      distribution.push(impressions);
      remainingImpressions -= impressions;
    }
    
    return distribution;
  }
};

// 사용 가능한 모든 알고리즘 목록
export const availableAlgorithms: DistributionAlgorithm[] = [
  equalDistribution,
  weightedDistribution,
  peakHoursDistribution,
  frontLoadedDistribution,
];

// 알고리즘 타입으로 알고리즘 찾기
export function getAlgorithmByType(type: string): DistributionAlgorithm | undefined {
  return availableAlgorithms.find(algo => algo.type === type);
}