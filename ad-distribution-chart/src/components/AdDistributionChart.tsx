import React from 'react';
import { ChartOptions } from 'chart.js';
import { Chart } from 'react-chartjs-2';

interface AdDistributionChartProps {
  labels: string[];
  plannedData: number[];
  actualData: number[];
  customerInfluxData: number[];
  currentTime?: string;
}

const AdDistributionChart: React.FC<AdDistributionChartProps> = ({
  labels,
  plannedData,
  actualData,
  customerInfluxData,
  currentTime
}) => {
  const data = {
    labels,
    datasets: [
      {
        label: '고객 유입',
        data: customerInfluxData,
        type: 'line' as const,
        backgroundColor: 'rgba(239, 68, 68, 0.1)', // 빨간색 반투명
        borderColor: 'rgba(239, 68, 68, 1)', // 빨간색
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: false,
        tension: 0.3,
        order: 0,
      },
      {
        label: '목표량',
        data: plannedData,
        type: 'bar' as const,
        backgroundColor: 'rgba(135, 206, 235, 0.4)', // 하늘색 반투명
        borderColor: 'rgba(135, 206, 235, 0.8)',
        borderWidth: 1,
        order: 2,
      },
      {
        label: '실제 노출량',
        data: actualData,
        type: 'bar' as const,
        backgroundColor: 'rgba(34, 197, 94, 0.8)', // 초록색
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
        order: 1,
      },
    ],
  };

  const options: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: `광고 노출량 분배 현황${currentTime ? ` - ${currentTime}` : ''}`,
        font: {
          size: 18,
          weight: 'bold',
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: (context) => {
            return `시간: ${context[0].label}`;
          },
          label: (context) => {
            const datasetLabel = context.dataset.label || '';
            const value = context.parsed.y;
            return `${datasetLabel}: ${value.toLocaleString()}회`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: '시간 (10분 단위)',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        ticks: {
          maxTicksLimit: 20,
          font: {
            size: 10,
          },
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: '노출량',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return typeof value === 'number' ? value.toLocaleString() : value;
          },
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  };

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <Chart type='bar' data={data} options={options} />
    </div>
  );
};

export default AdDistributionChart;