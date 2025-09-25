export interface TimeSlot {
  id: number;
  startTime: Date;
  endTime: Date;
  plannedImpressions: number;
  actualImpressions: number;
  isCompleted: boolean;
}

export interface AdCampaign {
  totalImpressions: number;
  startDate: Date;
  endDate: Date;
  timeSlots: TimeSlot[];
}

export interface ChartData {
  labels: string[];
  plannedData: number[];
  actualData: number[];
}

// Algorithm types
export type AlgorithmType = 'equal' | 'weighted' | 'peak_hours' | 'front_loaded';

export interface DistributionAlgorithm {
  name: string;
  description: string;
  type: AlgorithmType;
  distribute: (
    totalImpressions: number,
    totalSlots: number,
    startDate: Date,
    distributionPattern: DistributionPattern
  ) => number[];
}

// Distribution pattern types
export type DistributionPatternType = 'uniform' | 'peak_hours' | 'morning_peak' | 'evening_peak' | 'weekend';

export interface DistributionPattern {
  name: string;
  description: string;
  type: DistributionPatternType;
  getMultiplier: (slotIndex: number, totalSlots: number, startDate: Date) => number;
}