'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Plugin
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Plugin to draw the "Realistic Zone" background
const realisticZonePlugin: Plugin = {
  id: 'realisticZone',
  beforeDraw: (chart) => {
    const { ctx, chartArea, scales } = chart;
    const xScale = scales.x;
    const yScale = scales.y;

    if (!xScale || !yScale) return;

    // Realistic Zone: 25 to 35
    const startX = xScale.getPixelForValue(25);
    const endX = xScale.getPixelForValue(35);

    ctx.save();
    ctx.fillStyle = 'rgba(34, 197, 94, 0.1)'; 
    ctx.fillRect(startX, chartArea.top, endX - startX, chartArea.bottom - chartArea.top);
    
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(startX, chartArea.top, endX - startX, chartArea.bottom - chartArea.top);
    
    ctx.restore();
  }
};

interface DistributionChartProps {
  distribution: Record<number, number>;
  winnerScore?: number;
  label?: string;
}

export function DistributionChart({ distribution, winnerScore, label = 'Distribución de Probabilidad' }: DistributionChartProps) {
  const scores = Object.keys(distribution).map(Number).sort((a, b) => a - b);
  const minScore = Math.min(...scores, 0);
  const maxScore = Math.max(...scores, 42);

  const fullLabels: number[] = [];
  const fullData: number[] = [];
  for (let i = minScore; i <= maxScore; i++) {
    fullLabels.push(i);
    fullData.push(distribution[i] || 0);
  }

  const data = {
    labels: fullLabels,
    datasets: [
      {
        label,
        data: fullData,
        backgroundColor: 'rgba(59, 130, 246, 0.5)', 
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          afterBody: (context: any) => {
            const score = context[0].label;
            if (score >= 25 && score <= 35) return 'Zona Realista (Óptima)';
            return '';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      x: {
        title: {
          display: true,
          text: 'Puntuación del Motor (0-42)',
        },
        grid: {
          display: false,
        }
      }
    },
  };

  return (
    <div className="w-full h-[400px] relative">
      <Bar data={data} options={options} plugins={[realisticZonePlugin]} />
    </div>
  );
}
