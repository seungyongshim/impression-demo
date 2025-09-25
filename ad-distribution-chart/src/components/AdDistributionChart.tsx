import React from 'react';
import { ChartOptions } from 'chart.js';
import { Bar } from 'react-chartjs-2';

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
        label: '목표량',
        data: plannedData,
        backgroundColor: 'rgba(135, 206, 235, 0.4)', // 하늘색 반투명
        borderColor: 'rgba(135, 206, 235, 0.8)',
        borderWidth: 1,
        order: 2,
      },
      {
        label: '실제 노출량',
        data: actualData,
        backgroundColor: 'rgba(34, 197, 94, 0.8)', // 초록색
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
        order: 1,
      },
      {
        label: '고객 유입',
        data: customerInfluxData,
        backgroundColor: 'rgba(239, 68, 68, 0.3)', // 빨간색 반투명
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
        order: 0,
      },
    ],
  };

  // Don't render chart if there's no data
  if (!labels || labels.length === 0 || !plannedData || plannedData.length === 0) {
    return (
      <div style={{ width: '100%', height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#666', fontSize: '1.2rem' }}>차트 데이터를 불러오는 중...</p>
      </div>
    );
  }

  const options: ChartOptions<'bar'> = {
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
      <Bar data={data} options={options} />
    </div>
  );
};

export default AdDistributionChart;