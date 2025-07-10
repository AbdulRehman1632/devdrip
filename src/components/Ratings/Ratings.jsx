// import React, { useState } from 'react';
// import { doc, getFirestore, setDoc } from 'firebase/firestore';
// import {
//   TextField,
//   Button,
//   Box,
//   Typography,
//   Paper,
//   Snackbar,
//   Alert,
//   Slider
// } from '@mui/material';
// import { useParams } from 'react-router-dom';
// import { app } from '../../firebase';

// const categories = [
//   'Attendance / Punctuality',
//   'Work Quality',
//   'Work Quantity',
//   'Timeliness',
//   'Collaboration',
//   'Customer Handling',
//   'Initiative & Creativity'
// ];

// const Ratings = () => {
//   const db = getFirestore(app);
//   const { userId } = useParams();

//   const [ratings, setRatings] = useState({});
//   const [comment, setComment] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

//   const handleRatingChange = (category, value) => {
//     setRatings(prev => ({
//       ...prev,
//       [category]: Number(value)
//     }));
//   };

//   const handleSubmit = async () => {
//     if (!userId) return;

//     setLoading(true); 
//     const currentDate = new Date();
//     const monthName = currentDate.toLocaleString('default', { month: 'long' });
//     const year = currentDate.getFullYear();
//     const docId = `${monthName}-${year}`;

//     try {
//       const ratingsRef = doc(db, 'allUsers', userId, 'ratings', docId);
//       await setDoc(ratingsRef, {
//         ...ratings,
//         comment,
//         ratedOn: currentDate.toISOString()
//       });

//       // Reset form
//       setRatings({});
//       setComment('');
//       setToast({ open: true, message: 'Ratings submitted successfully!', severity: 'success' });
//     } catch (error) {
//       console.error(error);
//       setToast({ open: true, message: 'Failed to submit ratings.', severity: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box sx={{ maxWidth: 600, mx: 'auto', mt: 5 }}>
//       <Paper elevation={3} sx={{ p: 4,backgroundColor:"transparent", }} >
//         <Typography variant="h5" mb={3} fontWeight="bold" textAlign="center">
//           Rate Performance for <span style={{ color: '#1976d2' }}>{userId}</span>
//         </Typography>

//         {categories.map(cat => (
//   <Box
//     key={cat}
//     sx={{
//       display: 'flex',
//       flexDirection: 'row',
//       alignItems: 'center',
//       gap: 2,
//       mb: 2,
//       flexWrap: 'nowrap',
//       width: '100%',
//       marginTop:"60px"
//     }}
//   >
//     <Typography
//       sx={{
//         flexBasis: '35%',
//         minWidth: '150px',
//         fontWeight: 'bold'
//       }}
//     >
//       {cat}
//     </Typography>

//     <Slider
//       value={ratings[cat] || 0}
//       onChange={(e, val) => handleRatingChange(cat, val)}
//       step={1}
//       marks
//       min={0}
//       max={10}
//       valueLabelDisplay="on"
//       sx={{ flex: 1 }}
//     />
//   </Box>
// ))}


//         <TextField
//           label="Comments / Feedback"
//           multiline
//           rows={4}
//           fullWidth
//           variant="outlined"
//           value={comment}
//           sx={{ mb: 3 }}
//           onChange={e => setComment(e.target.value)}
//         />

//         <Button
//           variant="contained"
//           size="large"
//           fullWidth
//           disabled={loading}
//           onClick={handleSubmit}
//         >
//           {loading ? 'Submitting...' : 'Submit Ratings'}
//         </Button>
//       </Paper>

//       <Snackbar
//         open={toast.open}
//         autoHideDuration={3000}
//         onClose={() => setToast(prev => ({ ...prev, open: false }))}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
//       >
//         <Alert
//           onClose={() => setToast(prev => ({ ...prev, open: false }))}
//           severity={toast.severity}
//           sx={{ width: '100%' }}
//         >
//           {toast.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default Ratings;



import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Snackbar,
  Alert,
  Slider,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { doc, getDoc, getDocs, getFirestore, collection, setDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { app } from '../../firebase';
import StarBorderIcon from '@mui/icons-material/StarBorder';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const categories = [
  'Attendance / Punctuality',
  'Work Quality',
  'Work Quantity',
  'Timeliness',
  'Collaboration',
  'Customer Handling',
  'Initiative & Creativity',
  
];

const colors = ['#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#0097a7', '#d81b60', '#5d4037'];

const Ratings = () => {
  const db = getFirestore(app);
  const { userId } = useParams();

  const [tab, setTab] = useState(0);
  const [ratings, setRatings] = useState({});
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const [allMonths, setAllMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [fetchedRatings, setFetchedRatings] = useState(null);

  const currentDate = new Date();
  const currentMonthId = `${currentDate.toLocaleString('default', { month: 'long' })}-${currentDate.getFullYear()}`;

  // Tab change
  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  // Submit Ratings
  const handleRatingChange = (category, value) => {
    setRatings(prev => ({
      ...prev,
      [category]: Number(value)
    }));
  };

  const handleSubmit = async () => {
    if (!userId) return;

    setLoading(true);

    try {
      const ratingsRef = doc(db, 'allUsers', userId, 'ratings', currentMonthId);
      await setDoc(ratingsRef, {
        ...ratings,
        comment,
        ratedOn: currentDate.toISOString()
      });

      setRatings({});
       setComment('');
      setToast({ open: true, message: 'Ratings submitted successfully!', severity: 'success' });
    } catch (error) {
      console.error(error);
      setToast({ open: true, message: 'Failed to submit ratings.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch months
  useEffect(() => {
    const fetchMonths = async () => {
      const ratingsRef = collection(db, 'allUsers', userId, 'ratings');
      const snap = await getDocs(ratingsRef);
      const months = snap.docs.map(docSnap => docSnap.id);
      setAllMonths(months);
      if (months.length > 0) setSelectedMonth(months[months.length - 1]);
    };

    if (tab === 0 && userId) fetchMonths();
  }, [tab, userId]);

  // Fetch selected month's ratings
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedMonth) return;
      const ref = doc(db, 'allUsers', userId, 'ratings', selectedMonth);
      const snap = await getDoc(ref);
      if (snap.exists()) setFetchedRatings(snap.data());
      else setFetchedRatings(null);
    };

    if (tab === 0 && selectedMonth && userId) fetchData();
  }, [selectedMonth, userId, tab]);

  const chartData = {
    labels: categories,
    datasets: [
      {
        label: 'Rating',
        data: categories.map(cat => fetchedRatings?.[cat] || 0),
        backgroundColor: colors
      }
    ]
  };

  const chartOptions = {
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
      legend: { display: false }
    },
    responsive: true
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 5 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3,background:"transparent" }}>
        <Typography variant="h5" textAlign="center" fontWeight="bold" gutterBottom>
         Panel for <span style={{ color: '#0CAFFF' }}>{userId}</span>
        </Typography>
        <Tabs value={tab} onChange={handleTabChange} centered>
          <Tab label="📊 View Performance" />
          <Tab label="📝 Rate User" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <Paper elevation={3} sx={{ p: 3 ,background:"transparent" }}>
          {allMonths.length > 0 && (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Month</InputLabel>
              <Select
                value={selectedMonth}
                label="Select Month"
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {allMonths.map(month => (
                  <MenuItem key={month} value={month}>{month}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {fetchedRatings ? (
            <>
              <Bar data={chartData} options={chartOptions} />

              {fetchedRatings.comment && (
                <Box sx={{ mt: 4 }}>
                  <Box
                    sx={{
                      mt: 4,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <Paper
                      elevation={3}
                      sx={{
                        width: '100%',
                        maxWidth: 600,
                        p: 3,
                        borderRadius: 3,
                        textAlign: 'center',
                        background:"transparent"
                        
                      }}
                    >
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        gutterBottom
                        sx={{ color: 'primary.main' }} // uses theme color
                      >
                        📝 Manager’s Thoughts
                      </Typography>
                  
                      <Typography
                        variant="body1"
                        sx={{fontSize:"1.8em",fontFamily:"GreatVibes",letterSpacing:"1.2px", color:'#FFA700',fontWeight:"bold" }} // auto adapts to theme
                      >
                       <StarBorderIcon/> {fetchedRatings.comment}
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              )}
            </>
          ) : (
            <Typography textAlign="center" color="text.secondary">
              No ratings available for this month.
            </Typography>
          )}
        </Paper>
      )}

      {tab === 1 && (
        <Paper elevation={3} sx={{ p: 4,background:"transparent" }} >
          <Typography variant="h6" mb={3} fontWeight="bold" textAlign="center">
            {/* Submit Ratings for <span style={{ color: '#1976d2' }}>{userId}</span> */}
          </Typography>

          {categories.map(cat => (
            <Box key={cat} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 ,marginTop:"60px" }}>
              <Typography sx={{ flexBasis: '35%', fontWeight: 'bold' ,color:"#0CAFFF" }}>{cat}</Typography>
              <Slider
                value={ratings[cat] || 0}
                onChange={(e, val) => handleRatingChange(cat, val)}
                step={1}
                marks
                min={0}
                max={10}
                valueLabelDisplay="on"
                sx={{ flex: 1 }}
              />
            </Box>
          ))}

          <TextField
            label="Comments / Feedback"
            multiline
            required
            rows={4}
            fullWidth
            variant="outlined"
            value={comment}
            sx={{ mb: 3 ,marginTop:"15px" }}
            onChange={e => setComment(e.target.value)}
          />

          <Button
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? 'Submitting...' : 'Submit Ratings'}
          </Button>
        </Paper>
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast(prev => ({ ...prev, open: false }))}
          severity={toast.severity}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Ratings;
