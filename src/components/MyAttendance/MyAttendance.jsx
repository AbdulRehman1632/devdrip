import React, { useEffect, useState } from 'react';
import {
  collection, getDocs, getFirestore, query, orderBy
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../../firebase';
import {
  Typography, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Pagination,
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';


const MyAttendance = () => {
    const db = getFirestore(app);
  const auth = getAuth(app);

  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;
  const [leaveByType, setLeaveByType] = useState({ Annual: 0, Casual: 0, Sick: 0 });
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leavePage, setLeavePage] = useState(1);
const leaveRowsPerPage = 8;



// =============================types of leaves start===================================

  const leaveLimits = {
  Annual: 15,
  Casual: 9,
  Sick: 8,
};

const categorizeLeaves = (data) => {
  const types = { Annual: 0, Casual: 0, Sick: 0 };

  data.forEach((item) => {
    if (item.leave === true && item.leaveType) {
      const type = item.leaveType.split(' ')[0]; 
      if (types[type] !== undefined) {
        types[type]++;
      }
    }
  });

  return types; 
};

  
    const handleLeaveModalOpen = () => {
    const categorized = categorizeLeaves(attendanceData);
    setLeaveByType(categorized);
    setLeaveModalOpen(true);
  };
  
const leaveDetails = attendanceData.filter(item => item.leave === true);

// =============================types of leaves end===================================



  const fetchAttendance = async (username) => {
  setLoading(true);
  try {
    const attendanceRef = collection(db, 'allUsers', username, 'attendance');
    // const q = query(attendanceRef, orderBy('timestamp', 'desc'));
            const q = query(attendanceRef, orderBy('date'));
    
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setAttendanceData(data);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    setAttendanceData([]);
  } finally {
    setLoading(false);
  }
};
 useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
    
      if (user.displayName) {
        fetchAttendance(user.displayName);  
      } else {
        console.error('User does not have a displayName');
        setAttendanceData([]);
        setLoading(false);
      }
    } else {
      console.log('No user logged in');
      setAttendanceData([]);
      setLoading(false);
    }
  });
  return () => unsubscribe();
}, [auth]);




// =============================Paid Holiday Start==============================


const [customHolidayDates, setCustomHolidayDates] = useState([]);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const snapshot = await getDocs(collection(db, "holidays"));
        const dates = snapshot.docs.map(doc => doc.data().date); 
        setCustomHolidayDates(dates);
      } catch (error) {
        console.error("Error fetching holidays:", error);
      }
    };

    fetchHolidays();
  }, []);


  const isCustomHoliday = (dateStr) => {
  return customHolidayDates.includes(dateStr);
};


// =============================Paid Holiday end==============================



// ===========================DayName And Working Status Start======================


const getDayName = (dateString) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date(`${dateString}T00:00:00`);
  return isNaN(date) ? '-' : days[date.getDay()];
};



const getWorkingStatus = (hours) => {
  if (hours === '-' || hours === undefined || hours === null) {
    return { label: '-', color: 'inherit' };
  }

  const numericHours = typeof hours === 'string' ? parseFloat(hours) : hours;

  if (numericHours >= 7) {
    return { label: 'Completed', color: 'green' };
  } else {
    return { label: 'Early Going', color: 'orange' };
  }
};


// ===========================DayName And Working Status End======================


//  oldcode
//   const totalWorkingMinutes = attendanceData.reduce((total, item) => {
//     if (!item.time || !item.logoutTime) return total;
//     const start = item.time.toDate ? item.time.toDate() : new Date(`${item.date}T${item.time}`);
//     const end = item.logoutTime.toDate ? item.logoutTime.toDate() : new Date(`${item.date}T${item.logoutTime}`);
//     const diffMins = (end - start) / (1000 * 60);
//     return diffMins > 0 ? total + diffMins : total;
//   }, 0);

//   const totalHours = Math.floor(totalWorkingMinutes / 60);
//   const totalMinutes = Math.round(totalWorkingMinutes % 60);


// const getWorkingHours = (date, time, logoutTime) => {
//   if (!time || !logoutTime) return '-';

//   // Construct proper datetime strings
//   const start = new Date(`${date}T${time}`);
//   const end = new Date(`${date}T${logoutTime}`);

//   const diffMs = end - start;
//   if (isNaN(diffMs) || diffMs <= 0) return '-';

//   const totalMinutes = Math.floor(diffMs / 1000 / 60);
//   const hours = Math.floor(totalMinutes / 60);
//   const minutes = totalMinutes % 60;

//   return `${hours}h ${minutes}m`;
// };
//  oldcode




//    const totalWorkingMinutes = attendanceData.reduce((total, item) => {
//   if (!item.time || !item.logoutTime) return total;

//   let start, end;

//   if (item.time.toDate && item.logoutTime.toDate) {
//     start = item.time.toDate();
//     end = item.logoutTime.toDate();
//   } else {
//     start = new Date(`${item.date}T${item.time}`);
//     end = new Date(`${item.date}T${item.logoutTime}`);

//     if (end <= start) {
//       end.setDate(end.getDate() + 1);
//     }
//   }

//   const diffMinutes = (end - start) / (1000 * 60);
//   return diffMinutes > 0 ? total + diffMinutes : total;
// }, 0);

// const totalHours = Math.floor(totalWorkingMinutes / 60);
//   const totalMinutes = Math.round(totalWorkingMinutes % 60);
//   const totalWorkingHoursFormatted = `${totalHours}h ${totalMinutes}m`;


// ================================= month selection start ======================================

const [selectedMonth, setSelectedMonth] = useState('');

useEffect(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  setSelectedMonth(`${year}-${month}`);
}, []);


const months = [
  { label: 'January', value: '01' },
  { label: 'February', value: '02' },
  { label: 'March', value: '03' },
  { label: 'April', value: '04' },
  { label: 'May', value: '05' },
  { label: 'June', value: '06' },
  { label: 'July', value: '07' },
  { label: 'August', value: '08' },
  { label: 'September', value: '09' },
  { label: 'October', value: '10' },
  { label: 'November', value: '11' },
  { label: 'December', value: '12' }
];

const currentYear = new Date().getFullYear();


const filteredMonthData = attendanceData.filter(item => {
  const itemMonth = item.date?.slice(0, 7); 
  return selectedMonth ? itemMonth === selectedMonth : true;
});


// =================================month selection end ======================================



// ==============================Working hours start============================================

const totalWorkingMinutes = filteredMonthData.reduce((total, item) => {
  if (!item.time || !item.logoutTime) return total;

  let start, end;

  if (item.time.toDate && item.logoutTime.toDate) {
    start = item.time.toDate();
    end = item.logoutTime.toDate();
  } else {
    start = new Date(`${item.date}T${item.time}`);
    end = new Date(`${item.date}T${item.logoutTime}`);

    if (end <= start) {
      end.setDate(end.getDate() + 1);
    }
  }

  const diffMinutes = (end - start) / (1000 * 60);
  return diffMinutes > 0 ? total + diffMinutes : total;
}, 0);

const totalHours = Math.floor(totalWorkingMinutes / 60);
const totalMinutes = Math.round(totalWorkingMinutes % 60);


const getWorkingHours = (date, time, logoutTime) => {
  let start, end;

  if (!time || !logoutTime) return '-';
 
  if (typeof time === 'object' && time.toDate && typeof logoutTime === 'object' && logoutTime.toDate) {
    start = time.toDate();
    end = logoutTime.toDate();
  }
  
  else {
    start = new Date(`${date}T${time}`);
    end = new Date(`${date}T${logoutTime}`);

    if (end <= start) {
      end.setDate(end.getDate() + 1);
    }
  }

  const diffMs = end - start;
  if (isNaN(diffMs) || diffMs <= 0) return '-';

  const totalMinutes = Math.floor(diffMs / 1000 / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
};

// ==============================Working hours end============================================


  // ===================================pagnated Data Start================================

const paginatedData = filteredMonthData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

const paginatedLeaveDetails = leaveDetails.slice(
  (leavePage - 1) * leaveRowsPerPage,
  leavePage * leaveRowsPerPage
);

  // ===================================pagnated Data End================================





  if (loading) return <p>Loading...</p>;


  return (
    <div style={{ maxWidth: 900, margin: 'auto', marginTop: 30, padding: '0 16px', width: '100%' }}>
  <Typography sx={{ fontSize:"1.8em"}} variant="h5" align="center" gutterBottom>
    My Attendance
  </Typography>

  <FormControl sx={{ minWidth: 200, mb: 2 }}>
  <InputLabel sx={{marginTop:"-7px"}} id="month-select-label">Filter by Month</InputLabel>
  <Select
    labelId="month-select-label"
    id="month-select"
    value={selectedMonth}
    onChange={(e) => setSelectedMonth(e.target.value)}
  >
    <MenuItem value="">All Months</MenuItem>
    {months.map(({ label, value }) => (
      <MenuItem key={value} value={`${currentYear}-${value}`}>
        {label} {currentYear}
      </MenuItem>
    ))}
  </Select>
</FormControl>



  {attendanceData.length === 0 ? (
    <Typography>No attendance data found.</Typography>
  ) : (
    <>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <Paper sx={{ p: 2, flex: '1 1 150px', textAlign: 'center',backgroundColor: 'transparent' }}>
          <Typography sx={{fontWeight:"bold",letterSpacing:"0.6px"}} variant="subtitle2">Total Days</Typography>
          <Typography variant="h6">{filteredMonthData.length}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: '1 1 150px', textAlign: 'center',backgroundColor: 'transparent',  }}>
          <Typography sx={{fontWeight:"bold",letterSpacing:"0.6px"}} variant="subtitle2">Present</Typography>
          <Typography variant="h6" color="green">
            {filteredMonthData.filter(i => i.present).length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: '1 1 150px', textAlign: 'center',backgroundColor: 'transparent',  }}>
          <Typography sx={{fontWeight:"bold",letterSpacing:"0.6px"}} variant="subtitle2">Absent</Typography>
          <Typography variant="h6" color="red">
            {filteredMonthData.filter(i => !i.present && !i.leave && getDayName(i.date) !== 'Sunday').length}
          </Typography>
        </Paper>
           <Paper
          elevation={3}
        onClick={handleLeaveModalOpen}
          sx={{
            p: 2,
            minWidth: 140,
            textAlign: 'center',
            backgroundColor: 'transparent',
            cursor: 'pointer',
          }}
        >
          <Typography variant="subtitle1">Leave</Typography>
          <Typography variant="h6" color="warning.main">{filteredMonthData.filter(i => i.leave).length}</Typography>
        </Paper>
        
        <Paper sx={{ p: 2, flex: '1 1 180px', textAlign: 'center', backgroundColor: 'transparent',  }}>
          <Typography sx={{fontWeight:"bold",letterSpacing:"0.6px"}} variant="subtitle2">Total Working Hours</Typography>
          <Typography variant="h6" color='aqua'>{`${totalHours}h ${totalMinutes}m`}</Typography>
        </Paper>
      </div>

      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{fontSize:"1em",fontWeight:"bold"}}>S.No</TableCell>
              <TableCell sx={{fontSize:"1em",fontWeight:"bold"}}>Date</TableCell>
              <TableCell sx={{fontSize:"1em",fontWeight:"bold"}}>Day</TableCell>
              <TableCell sx={{fontSize:"1em" , fontWeight:"bold"}}>Login</TableCell>
              <TableCell sx={{fontSize:"1em",fontWeight:"bold"}}>Logout</TableCell>
              <TableCell sx={{fontSize:"1em",fontWeight:"bold"}}>Working Hours</TableCell>
              <TableCell sx={{fontSize:"1em",fontWeight:"bold"}}>Working Status</TableCell>
              <TableCell sx={{fontSize:"1em",fontWeight:"bold"}}>Present</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell>{getDayName(item.date)}</TableCell>
                 {/* <TableCell>
  {item.timestamp?.toDate
    ? item.timestamp.toDate().toLocaleTimeString()
    : item.timestamp || '-'}
</TableCell>

<TableCell>
  {item.logoutTime
    ? new Date(`${item.date}T${item.logoutTime}`).toLocaleTimeString()
    : '-'}
</TableCell> */}


            <TableCell>
  {(item.present && !item.leave && item.timestamp?.toDate)
    ? item.timestamp.toDate().toLocaleTimeString()
    : '-'}
</TableCell>

<TableCell>
  {(item.present && !item.leave && item.logoutTime)
    ? new Date(`${item.date}T${item.logoutTime}`).toLocaleTimeString()
    : '-'}
</TableCell>


                <TableCell>{getWorkingHours(item.date, item.time, item.logoutTime)}</TableCell>

                 <TableCell>
                  {(() => {
                    const hours = getWorkingHours(item.date, item.time, item.logoutTime);
                    const { label, color } = getWorkingStatus(hours);
                
                    return <span style={{ color, fontWeight: 'bold' }}>{label}</span>;
                  })()}
                </TableCell>
                
                {/* <TableCell sx={{
                  color: getDayName(item.date) === 'Sunday'
                    ? '#3388FF'
                    : item.present
                    ? 'inherit'
                    : item.leave
                    ? 'orange'
                    : 'red',
                  fontWeight: item.present ? 'normal' : 'bold'
                }}>
                  {getDayName(item.date) === 'Sunday'
                    ? 'Holiday'
                    : item.present
                    ? 'Yes'
                    : item.leave
                    ? 'Leave'
                    : 'No'}
                </TableCell> */}


                <TableCell sx={{
  color:
    getDayName(item.date) === "Sunday" || isCustomHoliday(item.date)
      ? "#3388FF"
      : item.present
      ? "inherit"
      : item.leave
      ? "orange"
      : "red",
  fontWeight: item.present ? "normal" : "bold",
}}>
  {getDayName(item.date) === "Sunday" || isCustomHoliday(item.date)
    ? "Holiday"
    : item.present
    ? "Yes"
    : item.leave
    ? "Leave"
    : "No"}
</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination
        count={Math.ceil(attendanceData.length / rowsPerPage)}
        page={page}
        onChange={(_, value) => setPage(value)}
        sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
      />

        
        <Dialog
          open={leaveModalOpen}
          onClose={() => setLeaveModalOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 2,
              // background: '#fefefe',
            },
          }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">📋 Leave Summary</Typography>
            <IconButton onClick={() => setLeaveModalOpen(false)}>
              {/* <CloseIcon /> */}
            </IconButton>
          </DialogTitle>
        
          <DialogContent>
            {/* Leave Boxes */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 2,
                flexWrap: 'wrap',
                mt: 1,
                mb: 3,
              }}
            >
              {Object.keys(leaveLimits).map((type) => (
                <Paper
                  key={type}
                  elevation={4}
                  sx={{
                    p: 2,
                    minWidth: 160,
                    textAlign: 'center',
                    borderRadius: 2,
                    // background: '#f5f5f5',
                  }}
                >
                  <Typography sx={{color:"red",fontWeight:"bold"}} variant="subtitle2" color="text.secondary" mb={1}>
                    {type} Leave
                  </Typography>
                  <Typography variant="h5" color="primary">
            <span style={{ color: 'gray' }}>       {leaveByType[type] || 0}</span>  
   /  { leaveLimits[type]}
                  </Typography>
                </Paper>
              ))}
            </Box>
        
           {/* Leave Table */}
{leaveDetails.length > 0 ? (
  <Box sx={{ overflowX: 'auto' }}>
    <Typography variant="subtitle1" mb={1}>📅 Leave Dates:</Typography>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell><strong>Date</strong></TableCell>
          <TableCell><strong>Leave Type</strong></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {leaveDetails
          .slice((leavePage - 1) * leaveRowsPerPage, leavePage * leaveRowsPerPage)
          .map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.date}</TableCell>
              <TableCell>{item.leaveType}</TableCell>
            </TableRow>
        ))}
      </TableBody>
    </Table>

    <Pagination
      count={Math.ceil(leaveDetails.length / leaveRowsPerPage)}
      page={leavePage}
      onChange={(_, value) => setLeavePage(value)}
      sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
    />
  </Box>
) : (
  <Typography color="text.secondary" align="center">No leave records found.</Typography>
)}

          </DialogContent>
        </Dialog> 
      
    </>
  )}
</div>

  );
};

export default MyAttendance;
