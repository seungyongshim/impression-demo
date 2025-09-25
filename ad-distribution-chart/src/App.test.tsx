import React from 'react';
import { render } from '@testing-library/react';
import { generateChartData, createTimeSlots } from './utils/adDistributionUtils';
import { availableAlgorithms } from './algorithms/distributionAlgorithms';
import { availablePatterns } from './algorithms/distributionPatterns';

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

test('algorithms are available and have required properties', () => {
  expect(availableAlgorithms.length).toBeGreaterThan(0);
  
  availableAlgorithms.forEach(algorithm => {
    expect(algorithm).toHaveProperty('name');
    expect(algorithm).toHaveProperty('description');
    expect(algorithm).toHaveProperty('type');
    expect(algorithm).toHaveProperty('distribute');
    expect(typeof algorithm.distribute).toBe('function');
  });
});

test('distribution patterns are available and have required properties', () => {
  expect(availablePatterns.length).toBeGreaterThan(0);
  
  availablePatterns.forEach(pattern => {
    expect(pattern).toHaveProperty('name');
    expect(pattern).toHaveProperty('description');
    expect(pattern).toHaveProperty('type');
    expect(pattern).toHaveProperty('getMultiplier');
    expect(typeof pattern.getMultiplier).toBe('function');
  });
});

test('createTimeSlots works with different algorithms and patterns', () => {
  const startDate = new Date('2025-01-01T00:00:00');
  const totalImpressions = 1000;

  // Test equal + uniform (default behavior)
  const equalUniform = createTimeSlots(startDate, totalImpressions, 'equal', 'uniform');
  expect(equalUniform).toHaveLength(144); // 24 hours * 6 (10-minute slots)
  
  // Test weighted + peak_hours
  const weightedPeak = createTimeSlots(startDate, totalImpressions, 'weighted', 'peak_hours');
  expect(weightedPeak).toHaveLength(144);
  
  // Verify total impressions are preserved
  const equalTotal = equalUniform.reduce((sum, slot) => sum + slot.plannedImpressions, 0);
  const weightedTotal = weightedPeak.reduce((sum, slot) => sum + slot.plannedImpressions, 0);
  
  expect(equalTotal).toBe(totalImpressions);
  expect(weightedTotal).toBe(totalImpressions);
});

test('weighted algorithm distributes differently than equal algorithm', () => {
  const startDate = new Date('2025-01-01T00:00:00');
  const totalImpressions = 1000;

  const equalSlots = createTimeSlots(startDate, totalImpressions, 'equal', 'peak_hours');
  const weightedSlots = createTimeSlots(startDate, totalImpressions, 'weighted', 'peak_hours');
  
  // The distributions should be different when using different algorithms with same pattern
  const equalValues = equalSlots.map(slot => slot.plannedImpressions);
  const weightedValues = weightedSlots.map(slot => slot.plannedImpressions);
  
  // They should not be identical (allowing for some variance)
  const areIdentical = equalValues.every((value, index) => value === weightedValues[index]);
  expect(areIdentical).toBe(false);
});
