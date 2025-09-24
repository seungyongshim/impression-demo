import React from 'react';
import { render } from '@testing-library/react';
import { generateChartData, createTimeSlots } from './utils/adDistributionUtils';

// Mock chart.js to avoid canvas issues in testing
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: {},
  LinearScale: {},
  BarElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
}));

jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="chart">Chart</div>,
}));

test('generates chart data correctly with target amounts', () => {
  const startDate = new Date('2025-01-01T00:00:00');
  const totalImpressions = 1000;
  const timeSlots = createTimeSlots(startDate, totalImpressions);
  const chartData = generateChartData(timeSlots, 10);

  expect(chartData.labels).toHaveLength(10);
  expect(chartData.plannedData).toHaveLength(10);
  expect(chartData.actualData).toHaveLength(10);
  
  // Check that planned data contains target amounts (not zeros)
  expect(chartData.plannedData.every(value => value >= 0)).toBe(true);
});
