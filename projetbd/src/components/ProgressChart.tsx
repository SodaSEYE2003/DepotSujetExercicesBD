"use client"
import { Chart, registerables } from 'chart.js'
import { Line } from 'react-chartjs-2'
import type { ChartData, ChartOptions } from 'chart.js'

Chart.register(...registerables)

interface ProgressChartProps {
  data: ChartData<'line'>
  options?: ChartOptions<'line'>
}

export default function ProgressChart({ 
  data,
  options
}: ProgressChartProps) {
  const defaultData: ChartData<'line'> = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr'],
    datasets: [
      {
        label: 'Votre score',
        data: [12, 13.5, 15.2, 16],
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.3
      },
      {
        label: 'Moyenne de classe',
        data: [10.5, 11.2, 12.8, 13.5],
        borderColor: 'rgb(107, 114, 128)',
        backgroundColor: 'rgba(107, 114, 128, 0.1)',
        tension: 0.3
      }
    ]
  }

  const defaultOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        min: 8,
        max: 20
      }
    }
  }

  return (
    <Line 
      data={data || defaultData} 
      options={options || defaultOptions} 
    />
  )
}