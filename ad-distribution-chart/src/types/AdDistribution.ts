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