"use client";

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const ProgressChart = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  let chartInstance = useRef<Chart | null>(null);
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    // Sample data - will be replaced with real data
    const labels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
    const data = [12, 14, 13, 15, 16, 15.2];
    
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Moyenne',
          data,
          backgroundColor: 'rgba(79, 70, 229, 0.2)',
          borderColor: 'rgba(79, 70, 229, 1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: 'rgba(79, 70, 229, 1)',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            min: Math.max(0, Math.min(...data) - 2),
            max: Math.min(20, Math.max(...data) + 2),
            ticks: {
              callback: function(value) {
                return value + '/20';
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Note: ${context.parsed.y}/20`;
              }
            }
          }
        }
      }
    });
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);
  
  return (
    <div className="w-full h-full">
      <canvas ref={chartRef} />
    </div>
  );
};

export default ProgressChart;