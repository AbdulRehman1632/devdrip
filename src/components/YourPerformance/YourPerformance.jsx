import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, LinearProgress, Stack, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { doc, getDoc, getDocs, getFirestore, collection } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../../firebase';

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const categories = [
  'Attendance / Punctuality',
  'Work Quality',
  'Work Quantity',
  'Timeliness',
  'Collaboration',
  'Customer Handling',
  'Initiative & Creativity'
];

const colors = ['#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#0097a7', '#d81b60', '#5d4037'];

const YourPerformance = () => {
  const db = getFirestore(app);
  const auth = getAuth(app);
  const [username, setUsername] = useState('');
  const [allMonths, setAllMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [ratings, setRatings] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.displayName) {
        setUsername(user.displayName);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchAllRatings = async () => {
      if (!username) return;
      const ratingsRef = collection(db, 'allUsers', username, 'ratings');
      const snap = await getDocs(ratingsRef);
      const currentYear = new Date().getFullYear();

      const months = [];

      snap.docs.forEach(docSnap => {
        const docId = docSnap.id;
        if (docId.includes(currentYear.toString())) {
          months.push(docId);
        }
      });

      setAllMonths(months);
      if (months.length > 0) setSelectedMonth(months[months.length - 1]);
    };

    fetchAllRatings();
  }, [username]);

  useEffect(() => {
    const fetchRatings = async () => {
      if (!username || !selectedMonth) return;
      const docRef = doc(db, 'allUsers', username, 'ratings', selectedMonth);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setRatings(snap.data());
      } else {
        setRatings({});
      }
    };

    fetchRatings();
  }, [selectedMonth, username]);

  const chartData = {
    labels: categories,
    datasets: [
      {
        label: 'Your Rating',
        data: categories.map(cat => ratings?.[cat] || 0),
        backgroundColor: colors
      }
    ]
  };

  const options = {
    indexAxis: 'x',
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 1
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    },
    responsive: true
  };

  return (
    <>
   <Box
  sx={{
    maxWidth: { xs: '100%', sm: 600, md: 800 },
    mx: 'auto',
    mt: { xs: 3, sm: 5 },
    px: { xs: 2, sm: 3 }
  }}
>
  <Paper
    elevation={3}
    sx={{
      p: { xs: 2, sm: 4 },
      background: 'transparent',
      borderRadius: 3,
    }}
  >
    <Typography
      variant="h5"
      fontWeight="bold"
      textAlign="center"
      gutterBottom
      sx={{ fontSize: { xs: '1.3rem', sm: '1.6rem' } }}
    >
      Your Performance {selectedMonth && `(${selectedMonth})`}
    </Typography>

    {allMonths.length > 0 && (
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Month</InputLabel>
        <Select
          value={selectedMonth}
          label="Select Month"
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {allMonths.map(month => (
            <MenuItem key={month} value={month}>
              {month}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    )}

    {/* Chart */}
    {ratings && Object.keys(ratings).length > 0 && (
      <Box sx={{ mt: 4 }}>
        <Typography
          variant="h6"
          fontWeight="bold"
          gutterBottom
          sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}
        >
          Category-wise Rating Chart
        </Typography>
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <Bar data={chartData} options={options} />
        </Box>
      </Box>
    )}
  </Paper>
</Box>

{/* Manager’s Thoughts */}
<Box
  sx={{
    mt: 4,
    display: 'flex',
    justifyContent: 'center',
    px: { xs: 2, sm: 3 }
  }}
>
  <Paper
    elevation={3}
    sx={{
      width: '100%',
      maxWidth: 600,
      p: { xs: 2, sm: 3 },
      borderRadius: 3,
      textAlign: 'center',
    }}
  >
    <Typography
      variant="h5"
      fontWeight="bold"
      gutterBottom
      sx={{ color: 'primary.main', fontSize: { xs: '1.3rem', sm: '1.6rem' } }}
    >
      📝 Your Manager’s Thoughts
    </Typography>

    <Typography
      variant="body1"
      sx={{
        fontSize: { xs: '1.2rem', sm: '1.8rem' },
        fontFamily: 'GreatVibes',
        letterSpacing: '1.2px',
        color: '#FFA700',
        fontWeight: 'bold',
        wordBreak: 'break-word',
      }}
    >
      {ratings?.comment}
    </Typography>
  </Paper>
</Box>


</>

  );
};

export default YourPerformance;
