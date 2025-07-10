import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Generate a palette of distinct colors
function getBarColors(count) {
  const palette = [
    '#375dda', '#f1c40f', '#e74c3c', '#27ae60', '#8e44ad',
    '#16a085', '#e67e22', '#2c3e50', '#ff6f61', '#00b894',
    '#fdcb6e', '#6c5ce7', '#00b8d4', '#fd79a8', '#636e72',
    '#fab1a0', '#81ecec', '#d35400', '#b2bec3', '#0984e3'
  ];
  // Repeat palette if not enough colors
  return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
}

export default function VoteBarChart({ data }) {
  const barColors = getBarColors(data.length);
  const chartData = {
    labels: data.map(([code]) => code),
    datasets: [
      {
        label: 'Кількість голосів',
        data: data.map(([, count]) => count),
        backgroundColor: barColors,
        borderRadius: 8
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        title: { display: true, color: '#F5F5F5', text: 'Код учасника', font: { size: 18, weight: 'bold'} },
        grid: { display: true, color: '#787878' },
        ticks: { color: 'orange', font: { size: 16, weight: 'bold' } },
      },
      y: {
        title: { display: true, color: '#F5F5F5', text: 'Голоси', font: { size: 18, weight: 'bold' } },
        beginAtZero: true,
        grid: { display: true, color: '#787878' },
        ticks: { color: 'orange', stepSize: 1, font: { size: 16, weight: 'bold' } },
      },
    },
  };
  return <Bar data={chartData} options={options} height={220} />;
}
