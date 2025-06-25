import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export default function CompressionChart({ stats }) {
  // Add a guard clause to prevent crash if stats is null or undefined
  if (!stats) {
    return null;
  }
  
  const { originalSize, processedSize } = stats;
  const spaceSaved = originalSize - processedSize;

  const data = {
    labels: ['Original Size', 'Processed Size'],
    datasets: [
      {
        data: [originalSize, processedSize],
        backgroundColor: [
          'hsl(217.2 32.6% 17.5%)', // Secondary
          'hsl(47.9 95.8% 53.1%)',  // Primary
        ],
        borderColor: [
          'hsl(222.2 84% 4.9%)',
          'hsl(222.2 84% 4.9%)',
        ],
        borderWidth: 4,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'hsl(222.2 84% 4.9%)',
        titleColor: 'hsl(210 40% 98%)',
        bodyColor: 'hsl(215 20.2% 65.1%)',
        borderColor: 'hsl(47.9 95.8% 53.1%)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += (context.parsed / 1024).toFixed(2) + ' KB';
            }
            return label;
          },
        },
      },
      datalabels: {
        display: false,
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1200,
    },
  };

  // In case of negative compression, show a different message/chart.
  if (spaceSaved < 0) {
    return (
        <div className="text-center text-red-500 py-4">
            <p className="font-semibold">Compression resulted in a larger file.</p>
            <p>Original: {(originalSize / 1024).toFixed(2)} KB | Processed: {(processedSize / 1024).toFixed(2)} KB</p>
        </div>
    );
  }

  return <div style={{ height: '250px' }}><Doughnut data={data} options={options} /></div>;
} 